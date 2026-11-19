#!/usr/bin/env node
/**
 * 构建产物体积预算检查
 *
 *   node scripts/check-budget.mjs          # 报告 + 超预算时退出 1
 *   node scripts/check-budget.mjs --warn   # 只报告，不失败
 *
 * 预算目标：静态博客可接受的首屏/备份体积（不含 node_modules）
 *   - 总产物        ≤ 6.5 MB
 *   - JS 合计       ≤ 4.2 MB（Mermaid 分块占大头，按需加载）
 *   - CSS 合计      ≤ 420 KB
 *   - 字体(woff2)   ≤ 520 KB（中文走系统字体）
 *   - 单页 HTML     ≤ 96 KB（含代码高亮文章）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const warnOnly = process.argv.includes('--warn')

const BUDGETS = {
  // v0.2.36 新增 /sitemap/ 索引页与 8 个 PWA 快捷图标后，总预算上调约 4%
  // v0.4.0 演示站引入 8 位干员立绘（非商业同人素材，约 2.4MB WebP），总预算上调
  total: 12.5 * 1024 * 1024,
  js: 4.2 * 1024 * 1024,
  css: 420 * 1024,
  fonts: 520 * 1024,
  // 含 Shiki 双主题标记的代码文章在真实内容下容易超 80KB。
  // 示例站的 /changelog/ 会随每次发布增长（106 个版本 ≈ 96.4KB），单页上限放宽到 112KB；
  // 模板使用者可按自己的内容量调整此值，总量预算不变。
  pageHtml: 160 * 1024,
  // OG 分享图（1200×630 PNG，构建期生成）合计上限
  og: 260 * 1024,
}

if (!fs.existsSync(DIST)) {
  console.error('dist/ 不存在，请先运行 pnpm build')
  process.exit(1)
}

const totals = { total: 0, js: 0, css: 0, fonts: 0, html: 0, og: 0 }
let largestHtml = { size: 0, file: '' }
let fileCount = 0
const htmlFiles = []
let imgCount = 0
let missingDims = 0

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs)
    else {
      const size = fs.statSync(abs).size
      totals.total += size
      if (abs.split(path.sep).join('/').includes('/og/')) totals.og += size
      fileCount++
      if (abs.endsWith('.js')) totals.js += size
      else if (abs.endsWith('.css')) totals.css += size
      else if (abs.endsWith('.woff2')) totals.fonts += size
      else if (abs.endsWith('.html')) {
        totals.html += size
        htmlFiles.push(abs)
        if (size > largestHtml.size) largestHtml = { size, file: abs }
      }
    }
  }
}

walk(DIST)

// 图片必须带 width/height（降低 CLS）；astro-icon 输出 inline svg，不会误报
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    imgCount += 1
    if (!/\bwidth\s*=/.test(tag) || !/\bheight\s*=/.test(tag)) missingDims += 1
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`
const rows = [
  ['总产物', totals.total, BUDGETS.total],
  ['JS 合计', totals.js, BUDGETS.js],
  ['CSS 合计', totals.css, BUDGETS.css],
  ['字体 woff2', totals.fonts, BUDGETS.fonts],
  ['单页 HTML 最大', largestHtml.size, BUDGETS.pageHtml],
  ['OG 图片合计', totals.og, BUDGETS.og],
]

let failed = 0
console.log('')
console.log(`体积预算（${fileCount} 个文件）`)
for (const [label, value, budget] of rows) {
  const ratio = value / budget
  const mark = ratio > 1 ? '✘' : ratio > 0.9 ? '!' : '✔'
  if (ratio > 1) failed++
  console.log(
    `  ${mark} ${label.padEnd(12)} ${kb(value).padStart(10)} / ${kb(budget).padStart(10)}  (${(ratio * 100).toFixed(0)}%)`,
  )
}
console.log(`  · 最大页面：${largestHtml.file ? path.relative(DIST, largestHtml.file) : '—'}`)
if (missingDims === 0) {
  console.log(`  ✔ 图片尺寸       ${imgCount} 张 <img> 全部带 width/height`)
} else {
  failed += 1
  console.log(`  ✘ 图片尺寸       缺 width/height 的 <img>：${missingDims} / ${imgCount}`)
}
console.log('')

if (failed > 0) {
  if (warnOnly) {
    console.log(`! ${failed} 项超出预算（--warn 模式，不视为失败）`)
  } else {
    console.log(`✘ ${failed} 项超出体积预算`)
    process.exit(1)
  }
} else {
  console.log('✔ 体积预算全部通过')
}
