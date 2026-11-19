#!/usr/bin/env node
/**
 * 构建期 OG 图生成器（1200×630 PNG）
 *
 *   node scripts/generate-og.mjs
 *
 * - 为每篇文章生成 `public/og/<slug>.png`
 * - 生成站点默认图 `public/og/default.png`
 * - 使用 sharp（已随依赖安装，Apache-2.0）把自制 SVG 模板栅格化
 * - 需要构建机具备中文字体（Windows/macOS 自带；Linux 建议 Noto Sans CJK）
 * - 生成失败不会中断构建（try/catch 后退出 0），但会打印警告
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts')
const OUT_DIR = path.join(ROOT, 'public', 'og')

const SITE = {
  title: '莱茵档案',
  en: 'RHINE ARCHIVE',
  tagline: '记录实验、失效与复原 · 所有条目以可复现为前提',
  footer: 'UNOFFICIAL FAN-STYLE THEME / 与鹰角网络无关',
}

const PALETTE = {
  bg: '#eae5e1',
  surface: '#edebe4',
  ink: '#080a08',
  ink2: '#5a584e',
  muted: '#77756d',
  line: '#aaa59a',
  amber: '#9b7247',
  amberInk: '#7a5526',
}

const FONT_SANS = 'Microsoft YaHei, PingFang SC, Noto Sans SC, Source Han Sans SC, sans-serif'
const FONT_MONO = 'JetBrains Mono, Cascadia Mono, Consolas, monospace'

const xml = s =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

function displayWidth(char) {
  return /[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFF60]/.test(char) ? 1 : 0.56
}

function wrap(text, maxWidth) {
  const lines = []
  let line = ''
  let width = 0
  for (const char of text) {
    const w = displayWidth(char)
    if (width + w > maxWidth) {
      lines.push(line.trim())
      line = ''
      width = 0
      if (char === ' ') continue
    }
    line += char
    width += w
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}

function mark(x, y, size, color) {
  const s = size / 48
  const c = (n) => (n * s).toFixed(2)
  return `
  <g transform="translate(${x} ${y})" fill="none" stroke="${color}">
    <circle cx="${c(24)}" cy="${c(24)}" r="${c(21)}" stroke-width="${c(1.5)}"/>
    <circle cx="${c(24)}" cy="${c(24)}" r="${c(15)}" stroke-width="${c(1)}" stroke-dasharray="2 5" opacity=".65"/>
    <path d="M${c(24)} 2.5v5.5M${c(24)} 40v5.5M2.5 ${c(24)}H8M40 ${c(24)}h5.5" stroke-width="${c(1.5)}"/>
    <path d="M${c(16.5)} 28.5 24 19.5l7.5 9" stroke-width="${c(2.2)}"/>
    <path d="M${c(16.5)} 34.5 24 25.5l7.5 9" stroke-width="${c(1.3)}" opacity=".5"/>
    <circle cx="${c(24)}" cy="${c(24)}" r="${c(1.6)}" fill="${color}" stroke="none"/>
  </g>`
}

function baseFrame({ body, fileLabel }) {
  // 细网格 + 扫描环 + 四角角标 + 顶栏/底栏
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0v48" fill="none" stroke="${PALETTE.ink}" stroke-width="1" opacity=".045"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="${PALETTE.bg}"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <g fill="none" stroke="${PALETTE.amber}" opacity=".22">
    <circle cx="985" cy="315" r="210" stroke-width="1.5"/>
    <circle cx="985" cy="315" r="158" stroke-width="1" stroke-dasharray="4 9"/>
    <circle cx="985" cy="315" r="112" stroke-width="1"/>
    <path d="M985 88v24M985 518v24M758 315h24M1188 315h24" stroke-width="1.5"/>
    <path d="M985 195v240M865 315h240" stroke-width="1" stroke-dasharray="3 8"/>
  </g>
  <g fill="none" stroke="${PALETTE.amber}" stroke-width="1.5" opacity=".8">
    <path d="M40 40h26M40 40v26M1160 40h-26M1160 40v26M40 590h26M40 590v-26M1160 590h-26M1160 590v-26"/>
  </g>
  <g transform="translate(40 34)">
    ${mark(0, 0, 40, PALETTE.amberInk)}
    <text x="58" y="17" font-family="${FONT_SANS}" font-size="21" font-weight="700" fill="${PALETTE.ink}">${xml(SITE.title)}</text>
    <text x="58" y="37" font-family="${FONT_MONO}" font-size="10" letter-spacing="4.5" fill="${PALETTE.muted}">${xml(SITE.en)} / FIELD ARCHIVE</text>
  </g>
  <g font-family="${FONT_MONO}" font-size="11" letter-spacing="3" fill="${PALETTE.muted}">
    <text x="1160" y="45" text-anchor="end">${xml(fileLabel)}</text>
    <text x="1160" y="64" text-anchor="end">1200 × 630 / OG</text>
  </g>
  <path d="M40 520h1120" stroke="${PALETTE.line}" stroke-width="1" opacity=".65"/>
  <text x="40" y="556" font-family="${FONT_MONO}" font-size="11" letter-spacing="2.5" fill="${PALETTE.muted}">${xml(SITE.footer)}</text>
  <text x="1160" y="556" text-anchor="end" font-family="${FONT_MONO}" font-size="11" letter-spacing="3" fill="${PALETTE.amberInk}">LEX-ARCHIVE</text>
  ${body}
</svg>`
}

function postSvg({ title, published, category, slug }) {
  const lines = wrap(title, 15.5).slice(0, 3)
  const fontSize = lines.length >= 3 ? 54 : lines.length === 2 ? 60 : 66
  const lineHeight = Math.round(fontSize * 1.22)
  const startY = 300 - ((lines.length - 1) * lineHeight) / 2
  const titleTspans = lines
    .map(
      (line, i) =>
        `<tspan x="80" y="${startY + i * lineHeight}">${xml(line)}</tspan>`,
    )
    .join('')

  const body = `
  <text font-family="${FONT_MONO}" font-size="12" letter-spacing="4" fill="${PALETTE.amberInk}">
    <tspan x="80" y="196">FILE / 档案 · ${xml(slugLabel(slug))}</tspan>
  </text>
  <text font-family="${FONT_SANS}" font-size="${fontSize}" font-weight="700" fill="${PALETTE.ink}" letter-spacing="-1">
    ${titleTspans}
  </text>
  <g font-family="${FONT_MONO}" font-size="12.5" letter-spacing="2.5" fill="${PALETTE.muted}">
    <text x="80" y="452">DATE / 日期</text>
    <text x="80" y="476" font-family="${FONT_SANS}" font-size="17" letter-spacing="0.5" fill="${PALETTE.ink2}">${xml(published)}</text>
    <text x="270" y="452">CLASS / 分类</text>
    <text x="270" y="476" font-family="${FONT_SANS}" font-size="17" letter-spacing="0.5" fill="${PALETTE.ink2}">${xml(category)}</text>
    <text x="470" y="452">SOURCE / 来源</text>
    <text x="470" y="476" font-family="${FONT_SANS}" font-size="17" letter-spacing="0.5" fill="${PALETTE.ink2}">构建期生成</text>
  </g>`
  return baseFrame({ body, fileLabel: slugLabel(slug) })
}

function defaultSvg() {
  const body = `
  <text font-family="${FONT_MONO}" font-size="12" letter-spacing="4" fill="${PALETTE.amberInk}">
    <tspan x="80" y="206">FIELD ARCHIVE / 个人研究档案室</tspan>
  </text>
  <text font-family="${FONT_SANS}" font-size="84" font-weight="700" fill="${PALETTE.ink}" letter-spacing="-2">
    <tspan x="80" y="308">${xml(SITE.title)}</tspan>
  </text>
  <text font-family="${FONT_SANS}" font-size="26" fill="${PALETTE.ink2}" letter-spacing="0.5">
    <tspan x="80" y="366">${xml(SITE.tagline)}</tspan>
  </text>
  <g font-family="${FONT_MONO}" font-size="12" letter-spacing="2.5" fill="${PALETTE.muted}">
    <text x="80" y="452">STATUS / 状态</text>
    <text x="80" y="476" font-family="${FONT_SANS}" font-size="17" letter-spacing="0.5" fill="${PALETTE.ink2}">OPERATIONAL</text>
    <text x="270" y="452">FORMAT / 形态</text>
    <text x="270" y="476" font-family="${FONT_SANS}" font-size="17" letter-spacing="0.5" fill="${PALETTE.ink2}">ASTRO · FUWARI · MIT</text>
    <text x="600" y="452">ACCESS / 访问</text>
    <text x="600" y="476" font-family="${FONT_SANS}" font-size="17" letter-spacing="0.5" fill="${PALETTE.ink2}">OPEN ARCHIVE</text>
  </g>`
  return baseFrame({ body, fileLabel: 'SITE / 站' })
}

function slugLabel(slug) {
  const base = path.basename(slug)
  const numbered = base.match(/^(\d+)-/)
  if (numbered) {
    return `X-${String(Number(numbered[1])).padStart(3, '0')}`
  }
  return base.replaceAll('-', ' ').toUpperCase()
}

/* ------------------------------ frontmatter ------------------------------ */

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    const key = kv[1]
    let value = kv[2].trim()
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1)
    }
    data[key] = value
  }
  return data
}

function walkMarkdown(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkMarkdown(abs))
    else if (entry.name.endsWith('.md')) out.push(abs)
  }
  return out
}

function formatDate(raw) {
  if (!raw) return '—'
  const value = String(raw).replaceAll('.', '-')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return raw
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

async function writePng(svg, outFile) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  // 调色板压缩：1200×630 的档案卡片只有少量色阶，128 色视觉无损，体积约 -38%
  await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .png({ compressionLevel: 9, palette: true, colours: 128, quality: 90 })
    .toFile(outFile)
}

async function main() {
  if (fs.existsSync(OUT_DIR)) {
    for (const name of fs.readdirSync(OUT_DIR)) {
      if (name.endsWith('.png')) fs.rmSync(path.join(OUT_DIR, name), { force: true })
    }
  }
  const files = walkMarkdown(POSTS_DIR)
  let generated = 0
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8')
    const meta = parseFrontmatter(raw)
    if (!meta.title) continue
    const slug = path
      .relative(POSTS_DIR, file)
      .replace(/\\/g, '/')
      .replace(/\.md$/, '')
      .replaceAll('/', '-')
    const svg = postSvg({
      title: meta.title,
      published: formatDate(meta.published),
      category: meta.category || 'UNCLASSIFIED',
      slug,
    })
    await writePng(svg, path.join(OUT_DIR, `${slug}.png`))
    generated++
  }
  await writePng(defaultSvg(), path.join(OUT_DIR, 'default.png'))
  console.log(`[og] generated ${generated} post images + default.png → public/og/`)
}

main().catch((error) => {
  console.warn(`[og] 生成失败（不中断构建）：${error?.message || error}`)
  process.exitCode = 0
})
