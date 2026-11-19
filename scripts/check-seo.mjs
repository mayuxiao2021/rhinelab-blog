#!/usr/bin/env node
/**
 * SEO / 结构化数据静态检查（构建后运行）
 *
 *   node scripts/check-seo.mjs
 *
 * 检查项：
 *   1. 每个 HTML 页面有非空 <title>，且全站标题唯一
 *   2. 每个页面有非空 <meta name="description">（noindex 页面除外）
 *   3. 非 noindex 页面有绝对地址 <link rel="canonical">
 *   4. 所有 application/ld+json 可解析，包含 @context 与 @type；
 *      BlogPosting 需要 headline/datePublished，WebSite 需要 url
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const red = (s) => `\x1b[31m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`

if (!fs.existsSync(DIST)) {
  console.error(red('dist/ 不存在，请先运行 pnpm build'))
  process.exit(1)
}

const issues = []

/** 从标签字符串中取属性值，兼容带引号/不带引号（压缩后）的写法 */
function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : ''
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, out)
    else if (abs.endsWith('.html')) out.push(abs)
  }
  return out
}

const pages = walk(DIST)

let basePrefix = '/'

// 从首页 canonical 推导部署 base 前缀（子路径部署时 canonical 应带前缀）
{
  const homeFile = path.join(DIST, 'index.html')
  if (fs.existsSync(homeFile)) {
    const home = fs.readFileSync(homeFile, 'utf8')
    const canonical = [...home.matchAll(/<link\b[^>]*>/gi)]
      .map(match => match[0])
      .filter(tag => attr(tag, 'rel') === 'canonical')
      .map(tag => attr(tag, 'href'))
      .find(Boolean)
    if (canonical) {
      try {
        const pathname = decodeURIComponent(new URL(canonical).pathname)
        basePrefix = pathname.endsWith('/') ? pathname : `${pathname}/`
        if (basePrefix === '//') basePrefix = '/'
      } catch {
        /* 保持默认 */
      }
    }
  }
}
const localAsset = rawUrl => {
  let local = String(rawUrl).split('?')[0].split('#')[0]
  if (basePrefix !== '/' && local.startsWith(basePrefix)) local = `/${local.slice(basePrefix.length)}`
  return local.replace(/^\//, '')
}
const rssSelfHref = (() => {
  const file = path.join(DIST, 'rss.xml')
  if (!fs.existsSync(file)) return ''
  const xml = fs.readFileSync(file, 'utf8')
  return xml.match(/<atom:link[^>]*rel="self"[^>]*href="([^"]+)"/)?.[1] ?? ''
})()
const jsonFeedHref = (() => {
  const file = path.join(DIST, 'feed.json')
  if (!fs.existsSync(file)) return ''
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')).feed_url ?? ''
  } catch {
    return ''
  }
})()

const titles = new Map()
const seenDescriptions = new Map()
const seenOgTitles = new Map()
const origins = new Map()
let ldCount = 0
let canonicalCount = 0
let ogCount = 0

/** 由构建产物路径推导期望的站点路径：foo/index.html → /foo/ */
function expectedPath(rel) {
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`
  return `/${rel}`
}

for (const file of pages) {
  const rel = path.relative(DIST, file).split(path.sep).join('/')
  const html = fs.readFileSync(file, 'utf8')
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0])
  const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0])

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ''
  if (!title) issues.push(`${rel} 缺少 <title>`)
  else if ([...title].length > 60) issues.push(`${rel} 标题过长（${[...title].length} > 60）：${title.slice(0, 40)}…`)
  else {
    if (titles.has(title)) issues.push(`${rel} 标题与 ${titles.get(title)} 重复：${title.slice(0, 40)}`)
    else titles.set(title, rel)
  }

  const noindex = metaTags.some(
    tag => attr(tag, 'name') === 'robots' && /noindex/i.test(attr(tag, 'content')),
  )
  const description = metaTags
    .filter(tag => attr(tag, 'name') === 'description')
    .map(tag => attr(tag, 'content').trim())
    .find(Boolean)
  if (!description && !noindex) issues.push(`${rel} 缺少 meta description`)
  else if (description && !noindex) {
    const descLength = [...description].length
    if (descLength < 30) issues.push(`${rel} meta description 过短（${descLength} < 30）`)
    else if (descLength > 200) issues.push(`${rel} meta description 过长（${descLength} > 200）`)
  }

  const ogUrl = metaTags
    .filter(tag => attr(tag, 'property') === 'og:url' || attr(tag, 'name') === 'og:url')
    .map(tag => attr(tag, 'content'))
    .find(Boolean)
  if (!ogUrl) {
    issues.push(`${rel} 缺少 og:url`)
  } else if (!/^https?:\/\//.test(ogUrl)) {
    issues.push(`${rel} og:url 不是绝对地址：${ogUrl.slice(0, 80)}`)
  }

  if (!noindex) {
    const canonical =
      linkTags
        .filter(tag => attr(tag, 'rel') === 'canonical')
        .map(tag => attr(tag, 'href'))
        .find(Boolean) ?? ''
    if (!canonical) issues.push(`${rel} 缺少 canonical`)
    else if (!/^https?:\/\//.test(canonical)) issues.push(`${rel} canonical 不是绝对地址：${canonical}`)
    else if (ogUrl && ogUrl !== canonical) issues.push(`${rel} og:url 与 canonical 不一致`)
    else {
      canonicalCount += 1
      let parsed
      try {
        parsed = new URL(canonical)
      } catch {
        issues.push(`${rel} canonical 不是合法 URL：${canonical}`)
      }
      if (parsed) {
        const expected = `${basePrefix}${expectedPath(rel).replace(/^\//, '')}`
        let canonicalPath = parsed.pathname
        try {
          canonicalPath = decodeURIComponent(parsed.pathname)
        } catch {
          /* 保留原值 */
        }
        if (!canonicalPath.endsWith(expected)) {
          issues.push(`${rel} canonical 与页面路径不一致：${canonicalPath} ≠ ${expected}`)
        }
        if (!origins.has(parsed.origin)) origins.set(parsed.origin, rel)
      }
    }
  }

  const ogTitle = metaTags
    .filter(tag => attr(tag, 'property') === 'og:title' || attr(tag, 'name') === 'og:title')
    .map(tag => attr(tag, 'content').trim())
    .find(Boolean)

  const ogDescription = metaTags
    .filter(tag => attr(tag, 'property') === 'og:description' || attr(tag, 'name') === 'og:description')
    .map(tag => attr(tag, 'content').trim())
    .find(Boolean)

  // Twitter Card：与 OG 保持同源，避免分享卡片信息漂移
  const twitterMeta = {}
  for (const tag of metaTags) {
    const key = attr(tag, 'name')
    if (key?.startsWith('twitter:')) twitterMeta[key] = attr(tag, 'content').trim()
  }
  if (twitterMeta['twitter:card'] !== 'summary_large_image') {
    issues.push(`${rel} twitter:card 应为 summary_large_image`)
  }
  for (const key of ['twitter:title', 'twitter:description', 'twitter:image', 'twitter:url']) {
    if (!twitterMeta[key]) issues.push(`${rel} 缺少 ${key}`)
  }
  if (twitterMeta['twitter:url'] && !/^https?:\/\//.test(twitterMeta['twitter:url'])) {
    issues.push(`${rel} twitter:url 不是绝对地址`)
  }
  if (twitterMeta['twitter:title'] && ogTitle && twitterMeta['twitter:title'] !== ogTitle) {
    issues.push(`${rel} twitter:title 与 og:title 不一致`)
  }
  if (twitterMeta['twitter:description'] && ogDescription && twitterMeta['twitter:description'] !== ogDescription) {
    issues.push(`${rel} twitter:description 与 og:description 不一致`)
  }

  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? ''
  const dataBase = attr(htmlTag, 'data-base')
  if (!dataBase) {
    issues.push(`${rel} 缺少 html[data-base]`)
  } else {
    const normalizedBase = dataBase.endsWith('/') ? dataBase : `${dataBase}/`
    if (normalizedBase !== basePrefix) issues.push(`${rel} data-base(${dataBase}) 与部署 base(${basePrefix}) 不一致`)
  }

  // Feed 自动发现：RSS / JSON Feed 各一条，绝对地址且产物存在
  const alternates = linkTags.filter(tag => attr(tag, 'rel')?.toLowerCase() === 'alternate')
  const feeds = [
    ['application/rss+xml', 'rss.xml'],
    ['application/feed+json', 'feed.json'],
  ]
  for (const [type, file] of feeds) {
    const link = alternates.find(tag => (attr(tag, 'type') ?? '').includes(type))
    if (!link) {
      issues.push(`${rel} 缺少 feed 自动发现：${type}`)
      continue
    }
    const href = attr(link, 'href') ?? ''
    if (!/^https?:\/\//.test(href)) issues.push(`${rel} feed 自动发现 href 不是绝对地址：${href}`)
    else if (!fs.existsSync(path.join(DIST, localAsset(new URL(href).pathname)))) {
      issues.push(`${rel} feed 自动发现指向的文件不存在：${href}`)
    } else if (file === 'rss.xml' && rssSelfHref && href !== rssSelfHref) {
      issues.push(`${rel} RSS 自动发现地址与 rss.xml 自引用不一致`)
    } else if (file === 'feed.json' && jsonFeedHref && href !== jsonFeedHref) {
      issues.push(`${rel} JSON Feed 自动发现地址与 feed_url 不一致`)
    }
  }

  if (!/<meta[^>]+charset\s*=\s*["']?utf-8/i.test(html.slice(0, 1024))) {
    issues.push(`${rel} 前 1024 字节内缺少 UTF-8 charset 声明`)
  }

  const htmlLang = attr(html.match(/<html\b[^>]*>/i)?.[0] ?? '', 'lang') ?? ''
  for (const match of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1])
      const items = Array.isArray(data) ? data : [data, ...(data['@graph'] ?? [])]
      for (const item of items) {
        if (item?.inLanguage && htmlLang && String(item.inLanguage).replace(/_/g, '-').toLowerCase() !== htmlLang.toLowerCase()) {
          issues.push(`${rel} JSON-LD inLanguage(${item.inLanguage}) 与 html lang(${htmlLang}) 不一致`)
        }
      }
    } catch (error) {
      issues.push(`${rel} JSON-LD 解析失败：${error.message}`)
    }
  }

  const ogLocale = metaTags
    .filter(tag => attr(tag, 'property') === 'og:locale')
    .map(tag => attr(tag, 'content').trim())
    .find(Boolean)
  if (ogLocale && htmlLang && ogLocale.replace(/_/g, '-').toLowerCase() !== htmlLang.toLowerCase()) {
    issues.push(`${rel} og:locale(${ogLocale}) 与 html lang(${htmlLang}) 不一致`)
  }

  const themeColors = metaTags.filter(tag => attr(tag, 'name') === 'theme-color').map(tag => attr(tag, 'content').trim())
  if (themeColors.length === 0 || themeColors.some(value => !/^#[0-9a-f]{6}$/i.test(value))) {
    issues.push(`${rel} theme-color 缺失或格式不是 #RRGGBB`)
  }
  const colorScheme = metaTags.find(tag => attr(tag, 'name') === 'color-scheme')
  if (!colorScheme) issues.push(`${rel} 缺少 color-scheme meta`)

  if (description && !noindex) {
    if (seenDescriptions.has(description)) {
      issues.push(`${rel} meta description 与 ${seenDescriptions.get(description)} 重复`)
    } else {
      seenDescriptions.set(description, rel)
    }
  }
  if (ogTitle && !noindex) {
    if (seenOgTitles.has(ogTitle)) {
      issues.push(`${rel} og:title 与 ${seenOgTitles.get(ogTitle)} 重复`)
    } else {
      seenOgTitles.set(ogTitle, rel)
    }
  }

  const ogImage = metaTags
    .filter(tag => attr(tag, 'property') === 'og:image' || attr(tag, 'name') === 'og:image')
    .map(tag => attr(tag, 'content'))
    .find(Boolean)
  if (!ogDescription) {
    issues.push(`${rel} 缺少 og:description`)
  } else {
    if ([...ogDescription].length > 200) issues.push(`${rel} og:description 过长（${[...ogDescription].length} > 200）`)
    if (description && ogDescription !== description) {
      issues.push(`${rel} og:description 与 meta description 不一致`)
    }
  }

  if (ogImage) {
    ogCount += 1
    const ogImageAlt = metaTags
      .filter(tag => attr(tag, 'property') === 'og:image:alt' || attr(tag, 'name') === 'og:image:alt')
      .map(tag => attr(tag, 'content').trim())
      .find(Boolean)
    if (!ogImageAlt) issues.push(`${rel} 缺少 og:image:alt`)
    if (!/^https?:\/\//.test(ogImage)) {
      issues.push(`${rel} og:image 不是绝对地址：${ogImage.slice(0, 60)}`)
    } else {
      let localPath = ''
      try {
        localPath = decodeURIComponent(new URL(ogImage).pathname)
      } catch {
        /* 忽略 */
      }
      if (localPath) {
        let localFile = localPath
        const envBase = process.env.BASE_PATH
          ? (process.env.BASE_PATH.endsWith('/') ? process.env.BASE_PATH : `${process.env.BASE_PATH}/`)
          : null
        const effectiveBase = envBase && envBase !== '/' ? envBase : basePrefix
        if (effectiveBase !== '/' && localFile.startsWith(effectiveBase)) {
          localFile = `/${localFile.slice(effectiveBase.length)}`
        }
        const file = path.join(DIST, localFile.replace(/^\//, ''))
        if (!fs.existsSync(file)) {
          issues.push(`${rel} og:image 文件不存在：${localFile}`)
        } else {
          const buffer = fs.readFileSync(file)
          if (buffer.length > 80 * 1024) {
            issues.push(`${rel} og:image 体积过大（${(buffer.length / 1024).toFixed(1)}KB > 80KB）`)
          }
          const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
          if (isPng) {
            const width = buffer.readUInt32BE(16)
            const height = buffer.readUInt32BE(20)
            if (width !== 1200 || height !== 630) {
              issues.push(`${rel} og:image 尺寸应为 1200×630，实际 ${width}×${height}`)
            }
          } else {
            issues.push(`${rel} og:image 不是 PNG：${localPath}`)
          }
        }
      }
    }
  }

  for (const openTag of html.matchAll(/<script\b[^>]*>/gi)) {
    const scriptTag = openTag[0]
    if (attr(scriptTag, 'type') !== 'application/ld+json') continue
    const start = openTag.index + scriptTag.length
    const end = html.indexOf('</script>', start)
    if (end === -1) continue
    const raw = html.slice(start, end)
    ldCount += 1
    let data
    try {
      data = JSON.parse(raw)
    } catch (error) {
      issues.push(`${rel} JSON-LD 不是合法 JSON：${error.message}`)
      continue
    }
    const nodes = Array.isArray(data) ? data : [data]
    for (const node of nodes) {
      if (!node || typeof node !== 'object') {
        issues.push(`${rel} JSON-LD 节点不是对象`)
        continue
      }
      if (!node['@context']) issues.push(`${rel} JSON-LD 缺少 @context`)
      const type = node['@type']
      if (!type) {
        issues.push(`${rel} JSON-LD 缺少 @type`)
        continue
      }
      if (type === 'BlogPosting') {
        if (!node.headline) issues.push(`${rel} BlogPosting 缺少 headline`)
        if (!node.datePublished) issues.push(`${rel} BlogPosting 缺少 datePublished`)
        const published = Date.parse(node.datePublished ?? '')
        if (node.dateModified) {
          const modified = Date.parse(node.dateModified)
          if (Number.isNaN(modified)) issues.push(`${rel} BlogPosting dateModified 不是合法日期`)
          else if (!Number.isNaN(published) && modified < published) {
            issues.push(`${rel} BlogPosting dateModified 早于 datePublished`)
          }
        }
      }
      if (type === 'WebSite' && !node.url) issues.push(`${rel} WebSite 缺少 url`)
      if (type === 'BreadcrumbList' && !Array.isArray(node.itemListElement)) {
        issues.push(`${rel} BreadcrumbList 缺少 itemListElement`)
      }
    }
  }
}

// build-info：版本/迭代数与仓库一致，构建时间合法，体积统计存在
const buildInfoFile = path.join(DIST, 'build-info.json')
if (fs.existsSync(buildInfoFile)) {
  try {
    const info = JSON.parse(fs.readFileSync(buildInfoFile, 'utf8'))
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
    if (info.version !== pkg.version) {
      issues.push(`build-info 版本 ${info.version} 与 package.json ${pkg.version} 不一致`)
    }
    const iterations = fs.readFileSync(path.join(ROOT, 'ITERATIONS.md'), 'utf8')
    const iterationCount = (iterations.match(/^## Iteration /gm) ?? []).length
    if (info.iterations !== iterationCount) {
      issues.push(`build-info 迭代数 ${info.iterations} 与实际 ${iterationCount} 不一致`)
    }
    if (!info.generated_at || Number.isNaN(Date.parse(info.generated_at))) {
      issues.push('build-info generated_at 不是合法日期')
    }
    if (!info.assets || !(info.assets.files > 0) || !(info.assets.bytes > 0)) {
      issues.push('build-info 缺少 assets 体积统计')
    } else if (!info.assets.byType || Object.keys(info.assets.byType).length === 0) {
      issues.push('build-info 缺少 assets.byType 分类体积')
    } else if (!Array.isArray(info.assets.largest) || info.assets.largest.length === 0) {
      issues.push('build-info 缺少 assets.largest 最大文件列表')
    }
    if (!Array.isArray(info.gates) || info.gates.length < 10 || info.gates.some(gate => typeof gate !== 'string')) {
      issues.push('build-info 缺少 gates 门禁名称列表')
    } else {
      try {
        const gatesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/gates.json'), 'utf8'))
        if (JSON.stringify(info.gates) !== JSON.stringify(gatesData.verify)) {
          issues.push('build-info gates 与 src/data/gates.json 不一致')
        }
      } catch (error) {
        issues.push(`src/data/gates.json 读取失败：${error.message}`)
      }
    }
  } catch (error) {
    issues.push(`build-info.json 不是合法 JSON：${error.message}`)
  }
} else {
  issues.push('缺少 dist/build-info.json')
}

// feeds：_site.build 必须与 package.json 版本一致
for (const feedName of ['feed.json', 'feed-summary.json']) {
  const feedFile = path.join(DIST, feedName)
  if (!fs.existsSync(feedFile)) {
    issues.push(`缺少 dist/${feedName}`)
    continue
  }
  try {
    const feed = JSON.parse(fs.readFileSync(feedFile, 'utf8'))
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
    if (feed._site?.build !== pkg.version) {
      issues.push(`${feedName} _site.build ${feed._site?.build ?? '(空)'} 与 package.json ${pkg.version} 不一致`)
    }
  } catch (error) {
    issues.push(`${feedName} 不是合法 JSON：${error.message}`)
  }
}

// stats.json：build 字段必须与 package.json 版本一致
const statsJsonFile = path.join(DIST, 'stats.json')
if (fs.existsSync(statsJsonFile)) {
  try {
    const stats = JSON.parse(fs.readFileSync(statsJsonFile, 'utf8'))
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
    if (stats.build !== pkg.version) {
      issues.push(`stats.json build ${stats.build ?? '(空)'} 与 package.json ${pkg.version} 不一致`)
    }
  } catch (error) {
    issues.push(`stats.json 不是合法 JSON：${error.message}`)
  }
} else {
  issues.push('缺少 dist/stats.json')
}

// sitemap：每个 URL 都要有合法 lastmod
const sitemapFile = path.join(DIST, 'sitemap-0.xml')
let sitemapCount = 0
if (fs.existsSync(sitemapFile)) {
  const xml = fs.readFileSync(sitemapFile, 'utf8')
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => match[1])
  sitemapCount = urls.length
  for (const block of urls) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? ''
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]
    if (!lastmod) issues.push(`sitemap 缺少 lastmod：${loc}`)
    else if (Number.isNaN(Date.parse(lastmod))) issues.push(`sitemap lastmod 不是合法日期：${loc} ${lastmod}`)
  }
} else {
  issues.push('缺少 dist/sitemap-0.xml')
}

// Web App Manifest：字段、图标与快捷方式必须能落到产物
const manifestFile = path.join(DIST, 'manifest.webmanifest')
if (fs.existsSync(manifestFile)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
    for (const field of ['name', 'short_name', 'start_url', 'display']) {
      if (!manifest[field]) issues.push(`manifest 缺少 ${field}`)
    }
    if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
      issues.push('manifest icons 少于 2 个')
    } else {
      for (const icon of manifest.icons) {
        if (!/^\d+x\d+$/.test(icon.sizes ?? '')) issues.push(`manifest icon sizes 非法：${icon.src}`)
        if (!fs.existsSync(path.join(DIST, localAsset(icon.src)))) issues.push(`manifest icon 不存在：${icon.src}`)
      }
    }
    for (const shortcut of manifest.shortcuts ?? []) {
      const pagePath = localAsset(shortcut.url)
      const pageFile = pagePath.endsWith('/') || pagePath === '' ? path.join(DIST, pagePath, 'index.html') : path.join(DIST, pagePath)
      if (!fs.existsSync(pageFile)) issues.push(`manifest 快捷方式页面不存在：${shortcut.url}`)
      for (const icon of shortcut.icons ?? []) {
        if (!fs.existsSync(path.join(DIST, localAsset(icon.src)))) issues.push(`manifest 快捷方式图标不存在：${icon.src}`)
      }
    }
  } catch (error) {
    issues.push(`manifest.webmanifest 不是合法 JSON：${error.message}`)
  }
} else {
  issues.push('缺少 dist/manifest.webmanifest')
}

// OpenSearch：模板必须含 {searchTerms} 且为绝对地址
const opensearchFile = path.join(DIST, 'opensearch.xml')
if (fs.existsSync(opensearchFile)) {
  const xml = fs.readFileSync(opensearchFile, 'utf8')
  const template = xml.match(/<Url[^>]*template="([^"]+)"/i)?.[1] ?? ''
  if (!template.includes('{searchTerms}')) issues.push('opensearch template 缺少 {searchTerms}')
  if (!/^https?:\/\//.test(template)) issues.push('opensearch template 不是绝对地址')
  if (!xml.match(/<ShortName>[^<]+<\/ShortName>/)) issues.push('opensearch 缺少 ShortName')
  if (!xml.match(/<Language>[^<]+<\/Language>/)) issues.push('opensearch 缺少 Language')
  if (!xml.match(/<Tags>[^<]+<\/Tags>/)) issues.push('opensearch 缺少 Tags')
  const osImage = xml.match(/<Image[^>]*>([^<]+)<\/Image>/)?.[1] ?? ''
  if (!/^https?:\/\//.test(osImage)) issues.push('opensearch Image 不是绝对地址')
  else if (!fs.existsSync(path.join(DIST, localAsset(new URL(osImage).pathname)))) {
    issues.push(`opensearch Image 不存在：${osImage}`)
  }
  const osContact = xml.match(/<Contact>([^<]+)<\/Contact>/)?.[1] ?? ''
  if (!/^https?:\/\//.test(osContact)) issues.push('opensearch Contact 不是绝对地址')
} else {
  issues.push('缺少 dist/opensearch.xml')
}

if (origins.size > 1) {
  issues.push(`canonical 存在多个站点源：${[...origins.keys()].join(' / ')}`)
}

console.log(
  dim(
    `SEO 检查：${pages.length} 个页面 · ${titles.size} 个唯一标题 · ${ldCount} 段 JSON-LD · ${canonicalCount} 个 canonical · ${ogCount} 张 OG 图 · ${sitemapCount} 条 sitemap`,
  ),
)
if (issues.length === 0) {
  console.log(green('✔ 标题 / 描述 / canonical / JSON-LD 全部通过'))
} else {
  console.error(red(`✘ 发现 ${issues.length} 个问题：`))
  for (const issue of issues.slice(0, 30)) console.error(`  - ${issue}`)
  process.exit(1)
}
