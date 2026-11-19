#!/usr/bin/env node
/**
 * 版本号一键升级（只改「版本」相关文本，不写业务变更内容）
 *
 *   node scripts/bump.mjs 0.2.48
 *
 * 会同步：
 *   - package.json version
 *   - README「当前版本 vX」与「截图来自 vX」
 *   - STATE「版本：vX」与发布包路径 release/rhinelab-blog-vX.zip
 *   - CHANGELOG.md 顶部插入 `## [X] — YYYY-MM-DD` 骨架
 *
 * 不会动：ITERATIONS.md（每轮手写）、changelog 页面（构建期读取 CHANGELOG.md）。
 * 建议随后运行 `node scripts/check-docs.mjs` 确认一致性。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const version = process.argv[2]?.trim()
const iterationArg = process.argv[3]?.trim()

const fail = (message) => {
  console.error(`✘ ${message}`)
  process.exit(1)
}

if (!version) fail('用法：node scripts/bump.mjs <x.y.z>')
if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`版本号格式应为 x.y.z，实际：${version}`)

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8')
const write = (relative, content) => fs.writeFileSync(path.join(ROOT, relative), content, 'utf8')

const pkgPath = 'package.json'
const pkg = JSON.parse(read(pkgPath))
const previous = pkg.version
if (previous === version) fail(`版本号已经是 ${version}`)

const compare = (a, b) => {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i]
  }
  return 0
}
if (compare(version, previous) < 0) fail(`新版本 ${version} 小于当前版本 ${previous}（不做降级）`)

const changed = []
const replaceIn = (relative, pairs) => {
  let content = read(relative)
  for (const [from, to] of pairs) {
    if (content.includes(from)) {
      content = content.replace(from, to)
    } else if (!content.includes(to)) {
      fail(`${relative} 中找不到待替换文本：${from}`)
    }
  }
  write(relative, content)
  changed.push(relative)
}

pkg.version = version
write(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
changed.push(pkgPath)

replaceIn('README.md', [
  [`当前版本 **v${previous}**`, `当前版本 **v${version}**`],
  [`截图来自 v${previous}`, `截图来自 v${version}`],
])

replaceIn('STATE.md', [
  [`版本：**v${previous}**`, `版本：**v${version}**`],
  [`release/rhinelab-blog-v${previous}.zip`, `release/rhinelab-blog-v${version}.zip`],
])

// 可选：同步 STATE.md 的当前迭代号（node scripts/bump.mjs 0.3.10 120）
if (iterationArg && /^\d+$/.test(iterationArg)) {
  const statePath = 'STATE.md'
  const stateText = read(statePath)
  if (/Iteration \d+/.test(stateText)) {
    // 只替换「阶段 / 本轮」行里的当前迭代号，避免误伤历史摘要
    const nextState = stateText.replace(
      /(阶段：\*\*Iteration |本轮：Iteration )(\d+)/g,
      (_m, prefix) => `${prefix}${iterationArg}`,
    )
    write(statePath, nextState)
    changed.push(statePath)
  }
}

// 里程碑文档里的版本号同步（check-docs 会校验）
const milestonePath = 'docs/MILESTONE-100.md'
if (fs.existsSync(path.join(ROOT, milestonePath))) {
  const milestone = read(milestonePath)
  if (milestone.includes(`v${previous}`)) {
    write(milestonePath, milestone.replaceAll(`v${previous}`, `v${version}`))
    changed.push(milestonePath)
  }
}

const today = new Date().toISOString().slice(0, 10)
const changelog = read('CHANGELOG.md')
if (changelog.includes(`## [${version}]`)) fail(`CHANGELOG.md 已存在 ${version} 条目`)
const marker = '## ['
const index = changelog.indexOf(marker)
if (index < 0) fail('CHANGELOG.md 找不到任何版本条目')
const skeleton = `## [${version}] — ${today}\n\n### 变更\n\n- TODO: 填写本轮变更（修复/新增/文档）\n\n`
write('CHANGELOG.md', `${changelog.slice(0, index)}${skeleton}${changelog.slice(index)}`)
changed.push('CHANGELOG.md')

console.log(`✔ 版本 ${previous} → ${version}（${today}）`)
for (const file of changed) console.log(`  - ${file}`)
console.log('下一步：')
console.log('  1. 填写 CHANGELOG.md 的骨架内容')
console.log('  2. 追加 ITERATIONS.md 本轮记录')
console.log('  3. node scripts/check-docs.mjs 校验一致性')
