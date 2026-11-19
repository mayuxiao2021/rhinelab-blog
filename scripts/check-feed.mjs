#!/usr/bin/env node
/**
 * Feed 结构门禁：校验构建产物中的 RSS 2.0 与 JSON Feed 1.1
 *
 * RSS：XML 可解析、channel 必备字段、每个 item 有 title/link/pubDate/description，
 *      link 为绝对地址、content:encoded 非空。
 * JSON Feed：version/home_page_url/feed_url/items 齐全，item 含 id/url/title/content_html/date_published，
 *      URL 绝对、content_html 非空。
 *
 * 可用 FEED_DIST 指定其它目录（自测）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// 子路径部署时 feed 内 URL 带 /base/ 前缀，映射产物文件前先剥离
const RAW_BASE = process.env.BASE_PATH || '/'
const BASE_PATH = RAW_BASE === '/' ? '/' : RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`
const stripBase = pathname => {
  if (BASE_PATH === '/') return pathname
  return pathname.startsWith(BASE_PATH) ? `/${pathname.slice(BASE_PATH.length)}` : pathname
}
const DIST = process.env.FEED_DIST ? path.resolve(process.env.FEED_DIST) : path.join(ROOT, 'dist')

const red = (s) => `\x1b[31m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`

const issues = []
const rssUrls = []
const jsonUrls = []

/**
 * 阅读器兼容静态预检：feed 正文里的 HTML 不应带脚本/事件处理器，
 * 图片必须有 alt，公式必须有 MathML 兜底（只给 KaTeX HTML 的阅读器会看到空白）。
 */
function checkFeedHtmlSafety(html, label) {
  if (/<script|<iframe|<object|<embed|<style/i.test(html)) {
    issues.push(`${label} 正文含脚本/嵌入/样式标签`)
  }
  if (/\son[a-z]+\s*=/i.test(html)) issues.push(`${label} 正文含内联事件处理器`)
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0])
  images.forEach((tag, index) => {
    if (!/\balt\s*=/i.test(tag)) issues.push(`${label} 第 ${index + 1} 张图片缺少 alt`)
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? ''
    if (!src) {
      issues.push(`${label} 第 ${index + 1} 张图片缺少 src`)
    } else if (!/^https?:\/\//i.test(src)) {
      issues.push(`${label} 第 ${index + 1} 张图片不是绝对地址：${src.slice(0, 60)}`)
    }
  })
  if (/class="katex"/.test(html) && !/<math\b/i.test(html)) {
    issues.push(`${label} 含 KaTeX 公式但没有 MathML 兜底`)
  }
  if (/data:/i.test(html.replace(/data:image\/[a-z+]+;base64,/gi, ''))) {
    issues.push(`${label} 正文含 data: URI`)
  }
}

function checkRss() {
  const file = path.join(DIST, 'rss.xml')
  if (!fs.existsSync(file)) {
    issues.push('缺少 rss.xml')
    return
  }
  const xml = fs.readFileSync(file, 'utf8')
  if (!/^<\?xml/.test(xml.trim())) issues.push('rss.xml 缺少 XML 声明')
  if (!xml.includes('<rss')) issues.push('rss.xml 缺少 <rss> 根元素')
  for (const tag of ['title', 'link', 'description', 'language']) {
    if (!new RegExp(`<${tag}>`).test(xml)) issues.push(`rss.xml channel 缺少 <${tag}>`)
  }
  const lastBuild = xml.match(/<lastBuildDate>([^<]+)<\/lastBuildDate>/)?.[1]
  if (!lastBuild) {
    issues.push('rss.xml channel 缺少 <lastBuildDate>')
  } else if (Number.isNaN(Date.parse(lastBuild))) {
    issues.push(`rss.xml lastBuildDate 不是合法日期：${lastBuild}`)
  }
  const channelLink = xml.match(/<link>([^<]+)<\/link>/)?.[1] ?? ''
  if (!/^https?:\/\//.test(channelLink)) issues.push('rss.xml channel <link> 不是绝对地址')

  if (!/xmlns:dc="http:\/\/purl\.org\/dc\/elements\/1\.1\/"/.test(xml)) {
    issues.push('rss.xml 缺少 dc 命名空间声明')
  }
  if (!/<dc:creator>/.test(xml)) {
    issues.push('rss.xml 缺少 <dc:creator>')
  }
  const selfMatch = xml.match(/<atom:link[^>]*rel="self"[^>]*>/)
  if (!selfMatch) {
    issues.push('rss.xml 缺少 <atom:link rel="self">')
  } else {
    const selfHref = selfMatch[0].match(/href="([^"]+)"/)?.[1] ?? ''
    if (!/^https?:\/\//.test(selfHref)) issues.push('rss.xml atom:link rel=self 不是绝对地址')
    else if (!selfHref.endsWith('/rss.xml')) issues.push(`rss.xml atom:link rel=self 指向异常：${selfHref}`)
    if (channelLink && selfHref) {
      try {
        if (new URL(channelLink).origin !== new URL(selfHref).origin) {
          issues.push('rss.xml channel link 与 atom:link rel=self 不同源')
        }
      } catch {
        // 两个地址的合法性已分别校验，解析失败在此忽略
      }
    }
  }
  if (!/xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/.test(xml)) {
    issues.push('rss.xml 缺少 atom 命名空间声明')
  }

  // channel <image>：阅读器品牌展示，url 必须绝对且对应产物存在
  const imageMatch = xml.match(/<image>[\s\S]*?<\/image>/)
  if (!imageMatch) {
    issues.push('rss.xml channel 缺少 <image>')
  } else {
    const imageUrl = imageMatch[0].match(/<url>([^<]+)<\/url>/)?.[1] ?? ''
    if (!/^https?:\/\//.test(imageUrl)) {
      issues.push(`rss.xml <image><url> 不是绝对地址：${imageUrl}`)
    } else {
      const imagePath = stripBase(decodeURIComponent(new URL(imageUrl).pathname)).replace(/^\//, '')
      if (!fs.existsSync(path.join(DIST, imagePath))) {
        issues.push(`rss.xml <image> 指向的产物不存在：${imagePath}`)
      }
    }
    if (!imageMatch[0].includes('<title>')) issues.push('rss.xml <image> 缺少 <title>')
  }

  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  if (items.length === 0) {
    issues.push('rss.xml 没有任何 <item>')
    return
  }
  const guids = []
  const pubDates = []
  items.forEach((item, index) => {
    const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.trim() ?? ''
    if (!description) issues.push(`rss.xml 第 ${index + 1} 个 item 的 description 为空`)
    for (const tag of ['title', 'link', 'pubDate', 'description', 'content:encoded']) {
      if (!new RegExp(`<${tag}(?:>|\\s)`).test(item)) {
        issues.push(`rss.xml 第 ${index + 1} 个 item 缺少 <${tag}>`)
      }
    }
    const link = item.match(/<link>([^<]+)<\/link>/)?.[1] ?? ''
    if (!/^https?:\/\//.test(link)) issues.push(`rss.xml 第 ${index + 1} 个 item 的 link 不是绝对地址`)
    else rssUrls.push(link)
    const guid = item.match(/<guid[^>]*>([^<]*)<\/guid>/)?.[1]?.trim() ?? ''
    if (!guid) issues.push(`rss.xml 第 ${index + 1} 个 item 的 guid 为空`)
    else if (guids.includes(guid)) issues.push(`rss.xml guid 重复：${guid}`)
    else guids.push(guid)

    const pubDate = item.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]
    if (pubDate && Number.isNaN(Date.parse(pubDate))) {
      issues.push(`rss.xml 第 ${index + 1} 个 item 的 pubDate 不是合法日期：${pubDate}`)
    } else if (pubDate) {
      pubDates.push(Date.parse(pubDate))
    }

    const rawContent = item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/)?.[1] ?? ''
    if (!rawContent.trim()) issues.push(`rss.xml 第 ${index + 1} 个 item 的 content:encoded 为空`)
    const content = rawContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
    if (content.includes('href="/') || content.includes('src="/')) {
      issues.push(`rss.xml 第 ${index + 1} 个 item 正文含站内相对链接`)
    }
    if (content.includes('<html') || content.includes('<body')) {
      issues.push(`rss.xml 第 ${index + 1} 个 item 正文包含完整文档结构`)
    }
    if (content.includes('&amp;lt;') || content.includes('&amp;gt;')) {
      issues.push(`rss.xml 第 ${index + 1} 个 item 正文疑似双重转义`)
    }
    checkFeedHtmlSafety(content, `rss.xml 第 ${index + 1} 个 item`)
  })
  if (pubDates.length > 0 && Number.isFinite(Date.parse(lastBuild))) {
    const newest = Math.max(...pubDates)
    if (newest > Date.parse(lastBuild)) {
      issues.push('rss.xml lastBuildDate 早于最新的 item pubDate')
    }
  }
  return items.length
}

function checkJsonFeed() {
  const file = path.join(DIST, 'feed.json')
  if (!fs.existsSync(file)) {
    issues.push('缺少 feed.json')
    return
  }
  let feed
  try {
    feed = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    issues.push(`feed.json 不是合法 JSON：${error.message}`)
    return
  }
  if (feed.version !== 'https://jsonfeed.org/version/1.1') {
    issues.push(`feed.json version 应为 JSON Feed 1.1，实际 ${feed.version}`)
  }
  for (const key of ['title', 'home_page_url', 'feed_url']) {
    if (typeof feed[key] !== 'string' || !feed[key]) issues.push(`feed.json 缺少 ${key}`)
  }
  for (const key of ['home_page_url', 'feed_url', 'favicon', 'icon']) {
    if (typeof feed[key] !== 'string' || !feed[key]) issues.push(`feed.json 缺少 ${key}`)
  }
  if (typeof feed.language === 'string' && !feed.language) issues.push('feed.json language 为空')
  if (typeof feed._site !== 'object' || feed._site === null) {
    issues.push('feed.json 缺少 _site 扩展字段')
  }
  for (const key of ['home_page_url', 'feed_url']) {
    if (typeof feed[key] === 'string' && !/^https?:\/\//.test(feed[key])) {
      issues.push(`feed.json ${key} 不是绝对地址`)
    }
  }
  if (typeof feed.feed_url === 'string' && !feed.feed_url.endsWith('/feed.json')) {
    issues.push(`feed.json feed_url 指向异常：${feed.feed_url}`)
  }
  if (typeof feed.home_page_url === 'string' && !feed.home_page_url.endsWith('/')) {
    issues.push(`feed.json home_page_url 应以 / 结尾：${feed.home_page_url}`)
  }
  if (!Array.isArray(feed.items) || feed.items.length === 0) {
    issues.push('feed.json items 为空')
    return
  }
  const jsonIds = []
  feed.items.forEach((item, index) => {
    for (const key of ['id', 'url', 'title', 'content_html', 'date_published']) {
      if (!item[key]) issues.push(`feed.json 第 ${index + 1} 个 item 缺少 ${key}`)
    }
    if (typeof item.id === 'string' && item.id) {
      if (jsonIds.includes(item.id)) issues.push(`feed.json id 重复：${item.id}`)
      else jsonIds.push(item.id)
    }
    if (typeof item.content_html === 'string' && !item.content_html.trim()) {
      issues.push(`feed.json 第 ${index + 1} 个 item 的 content_html 为空`)
    }
    if (item.date_modified) {
      if (Number.isNaN(Date.parse(item.date_modified))) {
        issues.push(`feed.json 第 ${index + 1} 个 item 的 date_modified 不是合法日期`)
      } else if (item.date_published && !Number.isNaN(Date.parse(item.date_published)) &&
        Date.parse(item.date_modified) < Date.parse(item.date_published)) {
        issues.push(`feed.json 第 ${index + 1} 个 item 的 date_modified 早于 date_published`)
      }
    }
    if (typeof item.url === 'string' && !/^https?:\/\//.test(item.url)) {
      issues.push(`feed.json 第 ${index + 1} 个 item 的 url 不是绝对地址`)
    } else if (typeof item.url === 'string' && item.url) {
      jsonUrls.push(item.url)
    }
    if (typeof item.content_html === 'string' && (item.content_html.includes('href="/') || item.content_html.includes('src="/'))) {
      issues.push(`feed.json 第 ${index + 1} 个 item 正文含站内相对链接`)
    }
    if (typeof item.content_html === 'string' &&
      (item.content_html.includes('<html') || item.content_html.includes('<body'))) {
      issues.push(`feed.json 第 ${index + 1} 个 item 正文包含完整文档结构`)
    }
    if (typeof item.content_html === 'string' && item.content_html.includes('&amp;lt;')) {
      issues.push(`feed.json 第 ${index + 1} 个 item 正文疑似双重转义`)
    }
    if (typeof item.content_html === 'string') {
      checkFeedHtmlSafety(item.content_html, `feed.json 第 ${index + 1} 个 item`)
    }
    if (item.date_published && Number.isNaN(Date.parse(item.date_published))) {
      issues.push(`feed.json 第 ${index + 1} 个 item 的 date_published 不是合法日期`)
    }
  })
  return feed.items.length
}

function normalizeUrl(value) {
  try {
    const url = new URL(value)
    url.hash = ''
    return url.href.replace(/\/$/, '')
  } catch {
    return value
  }
}

function checkSummaryFeed() {
  const file = path.join(DIST, 'feed-summary.json')
  if (!fs.existsSync(file)) {
    issues.push('缺少 feed-summary.json')
    return
  }
  let feed
  try {
    feed = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    issues.push(`feed-summary.json 不是合法 JSON：${error.message}`)
    return
  }
  if (feed.version !== 'https://jsonfeed.org/version/1.1') {
    issues.push('feed-summary.json 版本不是 JSON Feed 1.1')
  }
  if (feed._site?.variant !== 'summary') issues.push('feed-summary.json 缺少 _site.variant=summary')
  if (!/^\d+\.\d+\.\d+$/.test(String(feed._site?.build ?? ''))) {
    issues.push('feed-summary.json 缺少 _site.build 语义化版本')
  }
  if (!Array.isArray(feed.items) || feed.items.length === 0) {
    issues.push('feed-summary.json items 为空')
    return
  }
  if (feed.items.length !== jsonUrls.length) {
    issues.push(`feed-summary.json 条目数 ${feed.items.length} 与全文 JSON Feed ${jsonUrls.length} 不一致`)
  }
  feed.items.forEach((item, index) => {
    if (!item.summary) issues.push(`feed-summary.json 第 ${index + 1} 个 item 缺少 summary`)
    if (!item.content_text) issues.push(`feed-summary.json 第 ${index + 1} 个 item 缺少 content_text`)
    const length = (item.content_text ?? '').length
    if (length > 4000) issues.push(`feed-summary.json 第 ${index + 1} 个 item 的 content_text 过长（${length}）`)
    // 代码示例允许出现字面量 <div>；只拒绝实体残留与可执行/样式标签
    const text = item.content_text ?? ''
    if (/&(lt|gt|amp|quot|#39);/.test(text)) {
      issues.push(`feed-summary.json 第 ${index + 1} 个 item 的 content_text 残留 HTML 实体`)
    }
    if (/<script|<style|<iframe/i.test(text)) {
      issues.push(`feed-summary.json 第 ${index + 1} 个 item 的 content_text 含可执行/样式标签`)
    }
  })
}

function checkConsistency(rssCount, jsonCount) {
  // 1) feed 条目数与 /stats.json 的文章数一致
  const statsFile = path.join(DIST, 'stats.json')
  if (fs.existsSync(statsFile)) {
    try {
      const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'))
      if (stats?.counts?.posts !== rssCount) {
        issues.push(`/stats.json 文章数 ${stats?.counts?.posts} 与 RSS 条目数 ${rssCount} 不一致`)
      }
      if (stats?.counts?.posts !== jsonCount) {
        issues.push(`/stats.json 文章数 ${stats?.counts?.posts} 与 JSON Feed 条目数 ${jsonCount} 不一致`)
      }
    } catch (error) {
      issues.push(`/stats.json 不是合法 JSON：${error.message}`)
    }
  }

  // 2) RSS 与 JSON Feed 的 URL 集合一致
  const rssSet = [...new Set(rssUrls.map(normalizeUrl))].sort()
  const jsonSet = [...new Set(jsonUrls.map(normalizeUrl))].sort()
  if (rssSet.length !== jsonSet.length || rssSet.some((url, index) => url !== jsonSet[index])) {
    issues.push('RSS 与 JSON Feed 的文章 URL 集合不一致')
  }

  // 3) 每条 feed URL 都出现在 sitemap 中
  const sitemapFile = path.join(DIST, 'sitemap-0.xml')
  if (fs.existsSync(sitemapFile)) {
    const locs = [...fs.readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map(match => normalizeUrl(match[1]))
    const locSet = new Set(locs)
    for (const url of rssSet) {
      if (!locSet.has(url)) issues.push(`feed 文章未出现在 sitemap：${url}`)
    }
  }
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error(red('✘ dist/ 不存在，请先运行 pnpm build'))
    process.exit(1)
  }

  const rssCount = checkRss()
  const jsonCount = checkJsonFeed()
  checkConsistency(rssCount, jsonCount)
  checkSummaryFeed()

  console.log(dim('Feed 结构检查：RSS 2.0 + JSON Feed 1.1'))
  if (issues.length === 0) {
    console.log(green(`✔ RSS ${rssCount} items / JSON Feed ${jsonCount} items 结构全部通过`))
    return
  }
  console.error(red(`✘ 发现 ${issues.length} 个问题：`))
  for (const issue of issues.slice(0, 20)) console.error(`  - ${issue}`)
  process.exit(1)
}

main()
