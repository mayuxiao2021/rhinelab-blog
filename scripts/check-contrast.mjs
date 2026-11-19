#!/usr/bin/env node
/**
 * 主题色对比度自检（WCAG 2.1）
 *
 * 从 src/styles/rhinelab.css 解析亮/暗两套 --rl-* 颜色令牌，
 * 计算关键前景/背景组合的对比度，正常文本要求 >= 4.5:1。
 *
 * 可通过 CONTRAST_CSS 指定其它 CSS 文件（用于自测）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CSS_FILE = process.env.CONTRAST_CSS
  ? path.resolve(process.env.CONTRAST_CSS)
  : path.join(ROOT, 'src/styles/rhinelab.css')
const MIN_RATIO = 4.5

const red = (s) => `\x1b[31m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`

const PAIRS = [
  ['ink', 'bg'],
  ['ink-2', 'bg'],
  ['muted', 'bg'],
  ['amber-ink', 'bg'],
  ['ink', 'surface'],
  ['muted', 'surface'],
  ['amber-ink', 'surface'],
  ['ink', 'tint'],
  ['muted', 'surface-2'],
  ['ink-2', 'surface-2'],
  ['amber-ink', 'surface-2'],
  ['ink-2', 'amber-wash'],
  ['ink', 'amber-wash'],
  ['code-ink', 'code-bg'],
  ['paper', 'amber-ink'],
  ['amber-ink', 'amber-wash-3'],
]

function parseTokens(block) {
  const tokens = {}
  const re = /--rl-([a-z0-9-]+)\s*:\s*([^;]+);/g
  let match
  while ((match = re.exec(block))) {
    const value = match[2].trim()
    if (/^#[0-9a-f]{3,8}$/i.test(value) || /^rgba?\(/i.test(value)) {
      tokens[match[1]] = value
    }
  }
  return tokens
}

function parseLightTokens(css) {
  // 亮色令牌位于第一个 :root 块：从 --rl-bg 向前找最近的 '{'，向后找最近的 '}'
  const marker = css.indexOf('--rl-bg')
  if (marker === -1) return {}
  const open = css.lastIndexOf('{', marker)
  const close = css.indexOf('}', marker)
  if (open === -1 || close === -1) return {}
  return parseTokens(css.slice(open + 1, close))
}

function parseDarkTokens(css) {
  const marker = css.indexOf('html:root.dark')
  if (marker === -1) return {}
  const open = css.indexOf('{', marker)
  const close = css.indexOf('}', open)
  if (open === -1 || close === -1) return {}
  return parseTokens(css.slice(open + 1, close))
}

function toRgba(value) {
  if (value.startsWith('#')) {
    let hex = value.slice(1)
    if (hex.length === 3) hex = [...hex].map(ch => ch + ch).join('')
    if (hex.length === 8) hex = hex.slice(0, 6)
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16), a: 1 }
  }
  const match = value.match(/rgba?\(([^)]+)\)/i)
  if (!match) return null
  const parts = match[1].split(',').map(part => Number.parseFloat(part.trim()))
  return {
    r: parts[0] ?? 0,
    g: parts[1] ?? 0,
    b: parts[2] ?? 0,
    a: parts.length >= 4 ? parts[3] : 1,
  }
}

/** 把可能半透明的颜色合成到不透明底色上 */
function flatten(color, base) {
  if (color.a >= 1) return color
  return {
    r: color.r * color.a + base.r * (1 - color.a),
    g: color.g * color.a + base.g * (1 - color.a),
    b: color.b * color.a + base.b * (1 - color.a),
    a: 1,
  }
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(channel => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground, background, baseValue) {
  const rawFg = toRgba(foreground)
  const rawBg = toRgba(background)
  const base = toRgba(baseValue ?? '#ffffff')
  if (!rawFg || !rawBg) return null
  const bg = flatten(rawBg, base)
  const fg = flatten(rawFg, bg)
  const la = luminance([fg.r, fg.g, fg.b])
  const lb = luminance([bg.r, bg.g, bg.b])
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

function main() {
  const dataIndex = process.argv.indexOf('--write-data')
  const dataPath =
    dataIndex !== -1 ? path.resolve(ROOT, process.argv[dataIndex + 1] || 'src/data/contrast-report.json') : null
  const report = {
    generator: 'rhinelab-blog/check-contrast',
    min_ratio: MIN_RATIO,
    themes: [],
  }

  if (!fs.existsSync(CSS_FILE)) {
    console.error(red(`✘ 找不到 CSS：${CSS_FILE}`))
    process.exit(1)
  }
  const css = fs.readFileSync(CSS_FILE, 'utf8')
  const light = parseLightTokens(css)
  const dark = parseDarkTokens(css)
  const themes = [
    ['LIGHT / 亮色', light],
    ['DARK / 暗色', dark],
  ]

  console.log(dim(`对比度检查：${path.basename(CSS_FILE)} · 正常文本阈值 ${MIN_RATIO}:1`))
  let failures = 0
  for (const [name, tokens] of themes) {
    console.log(`\n${name}`)
    const rows = []
    for (const [fgKey, bgKey] of PAIRS) {
      const fg = tokens[fgKey]
      const bg = tokens[bgKey]
      if (!fg || !bg) {
        console.log(`  ${dim(`- ${fgKey} on ${bgKey}: 令牌缺失，跳过`)}`)
        continue
      }
      const ratio = contrast(fg, bg, tokens.bg)
      if (ratio === null) {
        console.log(`  ${dim(`- ${fgKey} on ${bgKey}: 无法解析颜色，跳过`)}`)
        continue
      }
      const ok = ratio >= MIN_RATIO
      if (!ok) failures += 1
      rows.push({
        fg: fgKey,
        bg: bgKey,
        fg_color: fg,
        bg_color: bg,
        ratio: Number(ratio.toFixed(2)),
        aa: ratio >= MIN_RATIO,
        aaa: ratio >= 7,
      })
      const mark = ok ? green('✔') : red('✘')
      console.log(
        `  ${mark} ${String(fgKey).padEnd(10)} on ${String(bgKey).padEnd(8)} ${ratio.toFixed(2)}:1  ${dim(`${fg} / ${bg}`)}`,
      )
    }
    report.themes.push({ name, rows })
  }

  if (dataPath) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true })
    fs.writeFileSync(dataPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log(dim(`\n[contrast] 数据已写入 ${path.relative(ROOT, dataPath)}`))
  }

  if (failures > 0) {
    console.error(red(`\n✘ ${failures} 组颜色低于 ${MIN_RATIO}:1`))
    process.exit(1)
  }
  console.log(green('\n✔ 对比度检查全部通过'))
}

main()
