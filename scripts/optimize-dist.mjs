#!/usr/bin/env node
/**
 * 构建产物清理 / 压缩（在 astro build + pagefind 之后运行）
 *
 *   node scripts/optimize-dist.mjs
 *
 * 1. 删除旧格式字体（.woff / .ttf）：现代浏览器只请求 woff2，
 *    并从 CSS 中移除对应 fallback，避免悬空引用。
 * 2. 删除 Pagefind 自带 UI 资源：本站使用自定义检索面板，只需要
 *    pagefind.js / pagefind-worker.js / 索引数据。
 * 3. 输出清理统计。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')

if (!fs.existsSync(DIST)) {
  console.error('dist/ 不存在，请先运行 pnpm build')
  process.exit(1)
}

let removed = 0
let bytes = 0
let cssRewritten = 0
let cssBytes = 0

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, out)
    else out.push(abs)
  }
  return out
}

const allFiles = walk(DIST)

/* 1. 旧格式字体 */
for (const file of allFiles) {
  if (/\.(woff|ttf)$/i.test(file)) {
    bytes += fs.statSync(file).size
    fs.rmSync(file, { force: true })
    removed++
  }
}

/* 2. CSS 中移除 woff / truetype fallback */
const removedPatterns = [
  /,\s*url\([^)]+\.woff\)\s*format\((["'])woff\1\)/g,
  /,\s*url\([^)]+\.ttf\)\s*format\((["'])truetype\1\)/g,
]
for (const file of walk(DIST).filter(file => file.endsWith('.css'))) {
  const before = fs.readFileSync(file, 'utf8')
  let after = before
  for (const pattern of removedPatterns) after = after.replace(pattern, '')
  if (after !== before) {
    cssBytes += before.length - after.length
    fs.writeFileSync(file, after, 'utf8')
    cssRewritten++
  }
}

/* 3b. _astro 中未被任何 HTML / JS / CSS 引用的孤儿资源（例如历史头像残留） */
const referenceCorpus = walk(DIST)
  .filter(file => /\.(html|js|css|xml|json|webmanifest)$/.test(file))
  .map(file => fs.readFileSync(file, 'utf8'))
  .join('\n')
const astroDir = path.join(DIST, '_astro')
let orphanBytes = 0
let orphanRemoved = 0
if (fs.existsSync(astroDir)) {
  for (const file of walk(astroDir)) {
    const name = path.basename(file)
    if (!referenceCorpus.includes(name)) {
      orphanBytes += fs.statSync(file).size
      fs.rmSync(file, { force: true })
      orphanRemoved++
    }
  }
}

/* 3. Pagefind 未使用的 UI 资源 */
const PAGE_FIND_UNUSED = [
  'pagefind-ui.js',
  'pagefind-ui.css',
  'pagefind-component-ui.js',
  'pagefind-component-ui.css',
  'pagefind-modular-ui.js',
  'pagefind-modular-ui.css',
  'pagefind-highlight.js',
]
for (const name of PAGE_FIND_UNUSED) {
  const file = path.join(DIST, 'pagefind', name)
  if (fs.existsSync(file)) {
    bytes += fs.statSync(file).size
    fs.rmSync(file, { force: true })
    removed++
  }
}

// 把优化后的产物体积写回 build-info.json，部署后可核对
const buildInfoFile = path.join(DIST, 'build-info.json')
if (fs.existsSync(buildInfoFile)) {
  try {
    const info = JSON.parse(fs.readFileSync(buildInfoFile, 'utf8'))
    const finalFiles = walk(DIST).filter(file => file !== buildInfoFile)
    const finalBytes = finalFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0)
    const relative = file => path.relative(DIST, file).split(path.sep).join('/')
    const largest = [...finalFiles]
      .map(file => ({ file: relative(file), bytes: fs.statSync(file).size }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 5)
    const extension = file => (path.extname(file).replace('.', '').toLowerCase() || 'other')
    const byType = {}
    for (const file of finalFiles) {
      const size = fs.statSync(file).size
      const ext = extension(file)
      const key = ['html', 'js', 'css', 'woff2', 'png', 'svg', 'json', 'xml', 'webp'].includes(ext) ? ext : 'other'
      byType[key] = (byType[key] || 0) + size
    }
    info.assets = { files: finalFiles.length, bytes: finalBytes, byType, largest }
    fs.writeFileSync(buildInfoFile, `${JSON.stringify(info, null, 2)}\n`, 'utf8')
  } catch (error) {
    console.warn(`[optimize] build-info 写回失败：${error?.message || error}`)
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`
console.log(
  `[optimize] 删除旧字体/未用资源 ${removed} 个（${kb(bytes)}），重写 CSS ${cssRewritten} 个（省 ${kb(cssBytes)}）`,
)
console.log(
  `[optimize] 清理 _astro 孤儿资源 ${orphanRemoved} 个（${kb(orphanBytes)}）`,
)
