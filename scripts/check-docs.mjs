#!/usr/bin/env node
/**
 * 文档/版本一致性门禁
 *
 *   node scripts/check-docs.mjs
 *
 * 每轮迭代都会同时改 package.json / README / STATE / CHANGELOG / changelog 页面，
 * 手工同步很容易漏。这里做一次静态一致性检查：
 *   - package.json 版本 = README「当前版本 vX」= STATE「版本：vX」
 *   - CHANGELOG 第一条版本 = package.json 版本
 *   - changelog 页面包含当前版本号
 *   - 必需文档存在（README/THEMING/DESIGN/ASSETS/DEPLOY/ITERATIONS/CHANGELOG/STATE/CONTRIBUTING）
 *   - 发行说明文件不得为空
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const red = (s) => `\x1b[31m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`

const issues = []
const read = (relative) => {
  const file = path.join(ROOT, relative)
  if (!fs.existsSync(file)) {
    issues.push(`缺少文件：${relative}`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const pkg = JSON.parse(read('package.json') || '{}')
const version = pkg.version

if (!version) issues.push('package.json 缺少 version')

const readme = read('README.md')
if (version && !readme.includes(`当前版本 **v${version}**`)) {
  issues.push(`README.md 未同步当前版本 v${version}`)
}
if (version && !readme.includes(`截图来自 v${version}`)) {
  issues.push(`README.md 的截图版本说明未同步 v${version}`)
}

const state = read('STATE.md')
if (version && !state.includes(`版本：**v${version}**`)) {
  issues.push(`STATE.md 未同步当前版本 v${version}`)
}
if (version && !state.includes(`release/rhinelab-blog-v${version}.zip`)) {
  issues.push(`STATE.md 的发布包路径未指向 v${version}`)
}

const changelog = read('CHANGELOG.md')
const firstHeading = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m)?.[1]
if (version && firstHeading !== version) {
  issues.push(`CHANGELOG.md 最新条目为 ${firstHeading ?? '（无）'}，应为 ${version}`)
}

const changelogPage = read('src/pages/changelog.astro')
if (!changelogPage.includes('CHANGELOG.md')) {
  issues.push('src/pages/changelog.astro 应直接读取 CHANGELOG.md（单一来源）')
}
if (!changelogPage.includes('readFileSync')) {
  issues.push('src/pages/changelog.astro 未在构建期读取发布记录')
}

const iterations = read('ITERATIONS.md')
if (iterations.trim().length < 3000) issues.push('ITERATIONS.md 内容过少，可能缺失迭代记录')
const iterationNumbers = [...iterations.matchAll(/^## Iteration (\d+)/gm)].map(match => Number(match[1]))
if (iterationNumbers.length === 0) {
  issues.push('ITERATIONS.md 没有任何「## Iteration N」记录')
} else {
  const unique = new Set(iterationNumbers)
  if (unique.size !== iterationNumbers.length) issues.push('ITERATIONS.md 迭代编号存在重复')
  const min = Math.min(...iterationNumbers)
  const max = Math.max(...iterationNumbers)
  if (max - min + 1 !== unique.size) issues.push(`ITERATIONS.md 迭代编号不连续（${min}–${max}，共 ${unique.size} 条）`)
  if (iterationNumbers.at(-1) !== max) issues.push('ITERATIONS.md 最新迭代记录不在文件末尾')
}

// README 引用的截图必须真实存在
const screenshotRefs = [...readme.matchAll(/\((docs\/screenshots\/[^)\s]+\.webp)\)/g)].map(match => match[1])
const missingShots = [...new Set(screenshotRefs)].filter(file => !fs.existsSync(path.join(ROOT, file)))
for (const file of missingShots) issues.push(`README 引用的截图不存在：${file}`)
if (screenshotRefs.length < 10) issues.push(`README 截图引用过少（${screenshotRefs.length}），可能缺失展示`)

// 文档内的相对链接必须指向真实文件（外部链接、锚点跳过）
const docFiles = [
  'README.md',
  'CONTRIBUTING.md',
  'theme/README.md',
  ...fs
    .readdirSync(path.join(ROOT, 'docs'))
    .filter(name => name.endsWith('.md'))
    .map(name => `docs/${name}`),
]
let checkedLinks = 0
for (const file of docFiles) {
  const content = read(file)
  if (!content) continue
  const baseDir = path.dirname(path.join(ROOT, file))
  for (const match of content.matchAll(/\]\(([^)\s]+)\)/g)) {
    let target = match[1]
    if (!target || target.startsWith('http') || target.startsWith('mailto:') || target.startsWith('#')) continue
    target = target.split('#')[0]
    if (!target) continue
    checkedLinks += 1
    const resolved = path.resolve(baseDir, decodeURIComponent(target))
    if (!fs.existsSync(resolved)) {
      issues.push(`${file} 中的相对链接不存在：${target}`)
    }
  }
}

// 截图文件健康：体积不能过小（空白/损坏图），且必须是真正的 WebP
for (const file of new Set(screenshotRefs)) {
  const full = path.join(ROOT, file)
  if (!fs.existsSync(full)) continue
  const buffer = fs.readFileSync(full)
  if (buffer.length < 1024) issues.push(`截图体积异常（<1KB，可能损坏）：${file}（${buffer.length} B）`)
  if (buffer.subarray(0, 4).toString('latin1') !== 'RIFF' || buffer.subarray(8, 12).toString('latin1') !== 'WEBP') {
    issues.push(`截图不是有效的 WebP：${file}`)
  }
}
if (new Set(screenshotRefs).size < 30) {
  issues.push(`README 截图数量偏少（${new Set(screenshotRefs).size}），应覆盖主要页面`)
}

// 对比度报告数据必须存在且覆盖两套主题 × 16 组
const contrastFile = path.join(ROOT, 'src', 'data', 'contrast-report.json')
if (!fs.existsSync(contrastFile)) {
  issues.push('缺少 src/data/contrast-report.json（运行 check-contrast --write-data 生成）')
} else {
  try {
    const report = JSON.parse(fs.readFileSync(contrastFile, 'utf8'))
    const rows = (report.themes ?? []).reduce((sum, theme) => sum + (theme.rows?.length ?? 0), 0)
    if (rows !== 32) issues.push(`对比度报告行数应为 32，实际 ${rows}`)
    if ((report.themes ?? []).length !== 2) issues.push('对比度报告应包含亮/暗两套主题')
  } catch (error) {
    issues.push(`对比度报告不是合法 JSON：${error.message}`)
  }
}

// 自制版本徽章必须存在且与当前版本一致
const badgeFile = path.join(ROOT, 'docs', 'badge-version.svg')
if (!fs.existsSync(badgeFile)) {
  issues.push('缺少 docs/badge-version.svg（运行 pnpm badge 生成）')
} else {
  const badge = fs.readFileSync(badgeFile, 'utf8')
  if (!badge.trimStart().startsWith('<svg')) issues.push('版本徽章不是有效的 SVG')
  if (!badge.includes('</svg>')) issues.push('版本徽章 SVG 未闭合')
  if (version && !badge.includes(`v${version}`)) {
    issues.push(`版本徽章未同步 v${version}（运行 pnpm badge 重新生成）`)
  }
  const iterationCount = (iterations.match(/^## Iteration /gm) ?? []).length
  if (!badge.includes(`${iterationCount} ITER`)) {
    issues.push(`版本徽章迭代数未同步（应为 ${iterationCount} ITER）`)
  }
}

// 主题覆盖层关键文件
for (const file of ['theme/install.mjs', 'theme/selftest.mjs', 'theme/README.md']) {
  if (!fs.existsSync(path.join(ROOT, file))) issues.push(`主题包缺少：${file}`)
}

const requiredDocs = [
  ['docs/THEMING.md', '主题定制文档'],
  ['docs/DESIGN.md', '设计文档'],
  ['docs/ASSETS.md', '素材许可清单'],
  ['docs/DEPLOY.md', '部署文档'],
  ['docs/READERS.md', '阅读器兼容文档'],
  ['docs/ACCEPTANCE.md', '验收记录'],
  ['CONTRIBUTING.md', '贡献指南'],
  ['theme/README.md', '主题包说明'],
]
for (const [file, label] of requiredDocs) {
  const content = read(file)
  if (content && content.trim().length < 200) {
    issues.push(`${label}（${file}）内容过短`)
  }
}

// 里程碑交付概览必须存在、版本同步、结构完整
const milestoneFile = read('docs/MILESTONE-100.md')
if (!milestoneFile) {
  issues.push('缺少 docs/MILESTONE-100.md（里程碑交付概览）')
} else {
  if (version && !milestoneFile.includes(`v${version}`)) {
    issues.push(`docs/MILESTONE-100.md 未同步版本 v${version}`)
  }
  for (const heading of ['## 1. 交付物', '## 4. 交付检查清单', '## 5. 已知限制']) {
    if (!milestoneFile.includes(heading)) issues.push(`docs/MILESTONE-100.md 缺少章节：${heading}`)
  }
}

// package.json 里引用的本地脚本必须存在，防止重命名后门禁静默失效
try {
  const pkg = JSON.parse(read('package.json'))
  const referenced = new Set()
  for (const value of Object.values(pkg.scripts ?? {})) {
    for (const match of String(value).matchAll(/node\s+([^\s&|;]+)/g)) {
      const token = match[1].trim()
      if (token.startsWith('-')) continue
      referenced.add(token)
    }
  }
  for (const token of referenced) {
    if (!fs.existsSync(path.join(ROOT, token))) issues.push(`package.json 引用的脚本不存在：${token}`)
  }
} catch (error) {
  issues.push(`package.json 解析失败：${error.message}`)
}

// 门禁数据源的脚本路径必须真实存在
try {
  const gates = JSON.parse(read('src/data/gates.json'))
  for (const scriptPath of gates.scripts ?? []) {
    if (!fs.existsSync(path.join(ROOT, scriptPath))) {
      issues.push(`src/data/gates.json 引用的脚本不存在：${scriptPath}`)
    }
  }
} catch (error) {
  issues.push(`src/data/gates.json 解析失败：${error.message}`)
}

// CHANGELOG.md 必须以一级标题开头（changelog 页面按首个 h1 后内容渲染）
if (!/^# \S/.test(read('CHANGELOG.md').trimStart())) {
  issues.push('CHANGELOG.md 必须以「# 标题」开头')
}

// STATE.md 必须与版本、最新迭代同步（交接文档不能过期）
let stateDoc = ''
try {
  stateDoc = read('STATE.md') ?? ''
} catch {
  // 文件缺失时由必需文档检查统一报告
}
if (!stateDoc) {
  issues.push('缺少 STATE.md')
} else {
  if (iterationNumbers.length > 0) {
    const latestIteration = Math.max(...iterationNumbers)
    if (!stateDoc.includes(`Iteration ${latestIteration}`)) {
      issues.push(`STATE.md 未同步最新迭代 Iteration ${latestIteration}`)
    }
  }
  if (!/阶段：\*\*[^*]+\*\*/.test(stateDoc)) issues.push('STATE.md 缺少「阶段：**…**」状态行')
  if (version && !stateDoc.includes(`release/rhinelab-blog-v${version}.zip`)) {
    issues.push(`STATE.md 未引用当前发布包 release/rhinelab-blog-v${version}.zip`)
  }
}

// gates.json 与实际 verify 链必须一一对应
try {
  const pkg = JSON.parse(read('package.json'))
  const gates = JSON.parse(read('src/data/gates.json'))
  const segments = String(pkg.scripts?.verify ?? '').split('&&').map(seg => seg.trim()).filter(Boolean)
  if (segments.length !== gates.verify.length) {
    issues.push(`gates.json 有 ${gates.verify.length} 步，但 pnpm verify 实际 ${segments.length} 步`)
  }
  const verifyCommand = String(pkg.scripts?.verify ?? '')
  for (const label of gates.verify) {
    const token = label.split(' ')[0]
    if (!verifyCommand.includes(token)) issues.push(`gates.json 的「${label}」在 verify 链中找不到`)
  }
} catch (error) {
  issues.push(`gates.json 与 verify 一致性检查失败：${error.message}`)
}

console.log(dim(`文档一致性检查：版本 v${version ?? '?'}`))
if (issues.length === 0) {
  console.log(green(`✔ 文档与版本号全部一致（v${version}）`))
  console.log(dim(`  · 相对链接 ${checkedLinks} 条、截图 ${new Set(screenshotRefs).size} 张均有效`))
} else {
  console.error(red(`✘ 发现 ${issues.length} 个问题：`))
  for (const issue of issues) console.error(`  - ${issue}`)
  process.exit(1)
}
