#!/usr/bin/env node
/**
 * 自制版本徽章（离线、无第三方 badge 服务）
 *
 *   node scripts/generate-badge.mjs
 *
 * 读取 package.json 版本与 ITERATIONS.md 的迭代数，生成 docs/badge-version.svg。
 * 配色沿用主题黄铜/深墨，字体使用系统等宽回退，不依赖网络字体。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const iterations = fs.readFileSync(path.join(ROOT, 'ITERATIONS.md'), 'utf8')
const iterationCount = (iterations.match(/^## Iteration /gm) ?? []).length

const label = 'RHINE ARCHIVE'
const value = `v${pkg.version} · ${iterationCount} ITER`
const mono = "'JetBrains Mono', 'Cascadia Code', Consolas, monospace"

// 粗略估算宽度：等宽 6.2px/字符 + padding
const labelWidth = Math.round(label.length * 6.2 + 20)
const valueWidth = Math.round(value.length * 6.2 + 20)
const width = labelWidth + valueWidth
const height = 20

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="rhinelab ${value}">
  <title>rhinelab ${value}</title>
  <linearGradient id="rl" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#11181b"/>
    <stop offset="1" stop-color="#0c1214"/>
  </linearGradient>
  <clipPath id="round"><rect width="${width}" height="${height}" rx="3"/></clipPath>
  <g clip-path="url(#round)">
    <rect width="${labelWidth}" height="${height}" fill="url(#rl)"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="#9b7247"/>
    <rect x="${labelWidth}" width="2" height="${height}" fill="#c5a16b"/>
  </g>
  <g fill="#eae5e1" font-family="${mono}" font-size="10" letter-spacing="0.6">
    <text x="${labelWidth / 2}" y="14" text-anchor="middle">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" text-anchor="middle" fill="#11181b" font-weight="bold">${value}</text>
  </g>
</svg>
`

const out = path.join(ROOT, 'docs', 'badge-version.svg')
fs.writeFileSync(out, svg, 'utf8')
console.log(`[badge] ${path.relative(ROOT, out)} → ${label} ${value} (${width}×${height})`)
