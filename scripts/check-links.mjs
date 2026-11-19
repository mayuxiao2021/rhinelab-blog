#!/usr/bin/env node
/**
 * 站内链接 / 锚点 / 资源检查器（构建后运行）
 *
 *   node scripts/check-links.mjs            # 检查 dist/
 *   node scripts/check-links.mjs --strict   # 任一处断开即退出码 1
 *
 * 检查项：
 *   1. 内部 <a href> 目标文件是否存在（目录 → index.html，支持 URL 编码）
 *   2. 跨页锚点 #xxx 是否在目标页存在对应 id/name；同页锚点同理
 *   3. <img src> / <script src> / <link href> 引用的本地资源是否存在
 *   4. 每页 <h1> 数量（应为 1；报告 0 或多于 1）
 *   5. sitemap 中的 URL 是否能映射到构建产物
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// 子路径部署：产物 URL 带 /base/ 前缀，但文件仍在 dist 根，映射文件前先剥离
const RAW_BASE = process.env.BASE_PATH || '/'
const BASE_PATH = RAW_BASE === '/' ? '/' : RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`

function stripBase(pathname) {
  if (BASE_PATH === '/') return pathname
  if (pathname.startsWith(BASE_PATH)) return `/${pathname.slice(BASE_PATH.length)}`
  return pathname
}
const DIST = path.join(ROOT, 'dist')
const strict = process.argv.includes('--strict')

const SKIP_PROTOCOLS = /^(?:[a-z]+:)?\/\//i
const SKIP_PREFIX = /^(?:mailto:|tel:|javascript:|data:)/
const IGNORED = new Set(['/pagefind/pagefind.js'])

if (!fs.existsSync(DIST)) {
  console.error('dist/ 不存在，请先运行 pnpm build')
  process.exit(1)
}

/* ------------------------------ 工具函数 ------------------------------ */

function walk(dir, filter, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, filter, out)
    else if (filter(abs)) out.push(abs)
  }
  return out
}

function fileExistsSmart(absPath) {
  const candidates = [absPath]
  try {
    const decoded = decodeURIComponent(absPath)
    if (decoded !== absPath) candidates.push(decoded)
  } catch {
    /* 非法编码，忽略 */
  }
  return candidates.some(candidate => {
    try {
      return fs.existsSync(candidate) && fs.statSync(candidate).isFile()
    } catch {
      return false
    }
  })
}

function resolvePageFile(fromHtml, pathname) {
  let target
  if (pathname.startsWith('/')) target = path.join(DIST, stripBase(pathname))
  else target = path.resolve(path.dirname(fromHtml), pathname)

  if (pathname.endsWith('/')) return path.join(target, 'index.html')
  if (path.extname(target) === '') return path.join(target, 'index.html')
  return target
}

function stripHash(href) {
  const hashIndex = href.indexOf('#')
  return hashIndex >= 0 ? href.slice(0, hashIndex) : href
}

/* ------------------------------- 主流程 ------------------------------- */

const htmlFiles = walk(DIST, p => p.endsWith('.html'))
const htmlCache = new Map()
function loadHtml(file) {
  if (!htmlCache.has(file)) htmlCache.set(file, fs.readFileSync(file, 'utf8'))
  return htmlCache.get(file)
}

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const hasAnchor = (file, anchor) => {
  if (!anchor) return true
  const html = loadHtml(file)
  const wanted = [anchor, safeDecode(anchor)]
  for (const match of html.matchAll(/(?:id|name)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    const value = match[1] ?? match[2] ?? match[3] ?? ''
    if (wanted.includes(value) || wanted.includes(safeDecode(value))) return true
  }
  return false
}

const errors = []
const warnings = []
const stats = { pages: 0, links: 0, anchors: 0, assets: 0 }

for (const htmlFile of htmlFiles) {
  stats.pages++
  const html = loadHtml(htmlFile)
  const relPage = path.relative(DIST, htmlFile).split(path.sep).join('/')

  /* --- 4. h1 数量 --- */
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length
  if (h1Count === 0) warnings.push({ page: relPage, type: 'h1', detail: '缺少 h1' })
  if (h1Count > 1) warnings.push({ page: relPage, type: 'h1', detail: `存在 ${h1Count} 个 h1` })

  /* --- 1/2. 链接 --- */
  for (const match of html.matchAll(/<a\b[^>]*href=("([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const href = (match[2] ?? match[3] ?? match[4] ?? '').trim()
    if (!href || SKIP_PREFIX.test(href)) continue
    if (SKIP_PROTOCOLS.test(href)) continue
    if (eventAttr(href)) continue
    stats.links++

    // 查询串只影响运行时行为，不参与静态文件存在性判断
    const pathname = stripHash(href.split('?')[0])
    const hash = href.includes('#') ? href.split('#')[1] : ''
    let targetFile = htmlFile
    if (pathname) {
      targetFile = resolvePageFile(htmlFile, pathname)
      if (IGNORED.has(pathname)) continue
      if (!fileExistsSmart(targetFile)) {
        errors.push({ page: relPage, href, type: 'link', detail: '目标不存在' })
        continue
      }
    }
    if (hash) {
      stats.anchors++
      if (!hasAnchor(targetFile, hash)) {
        errors.push({ page: relPage, href, type: 'anchor', detail: '锚点不存在' })
      }
    }
  }

  /* --- 3. 资源 --- */
  for (const match of html.matchAll(/<(img|script|link)\b[^>]*?(?:src|href)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const tag = match[1].toLowerCase()
    const value = (match[2] ?? match[3] ?? match[4] ?? '').trim()
    if (!value || SKIP_PROTOCOLS.test(value) || SKIP_PREFIX.test(value)) continue
    if (tag === 'link') {
      const attr = match[0].toLowerCase()
      if (!/rel=("|')(stylesheet|icon|preload|apple-touch-icon)/.test(attr)) continue
    }
    if (tag === 'script' && value.includes('pagefind')) continue
    stats.assets++
    const pathname = stripHash(value.split('?')[0])
    if (!pathname) continue
    const target = resolvePageFile(htmlFile, pathname)
    if (!fileExistsSmart(target)) {
      errors.push({ page: relPage, href: value, type: `asset:${tag}`, detail: '资源不存在' })
    }
  }
}

/* --- 5b. CSS 内 url() 资源引用 --- */
for (const cssFile of walk(DIST, p => p.endsWith('.css'))) {
  const css = fs.readFileSync(cssFile, 'utf8')
  const rel = path.relative(DIST, cssFile).split(path.sep).join('/')
  for (const match of css.matchAll(/url\((?:["']?)([^"')]+)(?:["']?)\)/g)) {
    const raw = match[1].trim()
    if (!raw || raw.startsWith('data:') || raw.startsWith('http') || raw.startsWith('#')) continue
    stats.assets++
    const clean = raw.split('?')[0].split('#')[0]
    const target = clean.startsWith('/')
      ? path.join(DIST, stripBase(clean))
      : path.resolve(path.dirname(cssFile), stripBase(clean))
    if (!fileExistsSmart(target)) {
      errors.push({ page: rel, href: raw, type: 'asset:css', detail: 'CSS 引用的资源不存在' })
    }
  }
}

/* --- 5. sitemap 映射 --- */
const sitemapDirs = walk(DIST, p => p.endsWith('sitemap-0.xml'))
for (const sitemap of sitemapDirs) {
  const xml = fs.readFileSync(sitemap, 'utf8')
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const loc = match[1]
    let pathname = loc
    try {
      pathname = new URL(loc).pathname
    } catch {
      /* keep */
    }
    const target = resolvePageFile(path.join(DIST, 'index.html'), pathname)
    if (!fileExistsSmart(target)) {
      errors.push({ page: 'sitemap', href: loc, type: 'sitemap', detail: 'URL 无对应产物' })
    }
  }
}

function eventAttr(href) {
  return href.startsWith('javascript:')
}

/* ------------------------------- 输出 -------------------------------- */

const byType = (list) => {
  const map = new Map()
  for (const item of list) {
    const key = `${item.type} · ${item.detail}`
    map.set(key, (map.get(key) || 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

console.log('')
console.log(`检查 ${stats.pages} 个页面：${stats.links} 个链接 / ${stats.anchors} 个锚点 / ${stats.assets} 个资源`)
if (warnings.length > 0) {
  console.log('')
  console.log(`⚠ 警告 ${warnings.length} 条：`)
  for (const [key, count] of byType(warnings)) console.log(`  - ${key} × ${count}`)
}
if (errors.length > 0) {
  console.log('')
  console.log(`✘ 发现问题 ${errors.length} 条：`)
  for (const [key, count] of byType(errors)) console.log(`  - ${key} × ${count}`)
  console.log('')
  for (const item of errors.slice(0, 25)) {
    console.log(`  ${item.page} → ${item.href} (${item.type}: ${item.detail})`)
  }
  if (errors.length > 25) console.log(`  … 其余 ${errors.length - 25} 条省略`)
  if (strict) process.exit(1)
} else {
  console.log('✔ 没有发现断链或缺失资源')
}
console.log('')
