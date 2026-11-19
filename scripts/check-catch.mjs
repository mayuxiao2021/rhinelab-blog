#!/usr/bin/env node
/**
 * 静默 catch 门禁：禁止 `scripts/` 中出现「空 catch 且无注释」的写法。
 *
 *   node scripts/check-catch.mjs
 *
 * 允许：catch { /* 说明 *\/ }  —— 有注释说明为什么可以忽略
 * 禁止：catch {} / catch { } / catch {   }  —— 无说明的静默吞错
 *
 * 历史背景：Iteration 114 的 B61 就是赋值触发 TDZ 被无注释 catch 吞掉，
 * 导致 base 推导长期失效；此门禁防止同类问题再次静默存在。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCRIPTS = path.join(ROOT, 'scripts')
const red = (s) => `\x1b[31m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`

const files = fs.readdirSync(SCRIPTS).filter(name => name.endsWith('.mjs'))
const issues = []
let allowCount = 0

for (const name of files) {
  const file = path.join(SCRIPTS, name)
  const raw = fs.readFileSync(file, 'utf8')
  // 去掉 JSDoc 文档块（其中的示例 catch 不是代码），保留行内注释作为「允许」标记
  const source = raw.replace(/\/\*\*[\s\S]*?\*\//g, '')
  for (const match of source.matchAll(/catch\s*\{([\s\S]*?)\}/g)) {
    const body = match[1]
    const line = source.slice(0, match.index).split('\n').length
    const hasComment = /\/\/|\/\*/.test(body)
    const hasStatements = body.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '').trim().length > 0
    if (!hasStatements && hasComment) allowCount += 1
    else if (!hasStatements && !hasComment) issues.push(`${name}:${line} 存在无注释的空 catch`)
  }
}

console.log(dim(`静默 catch 检查：${files.length} 个脚本，允许的有注释空 catch ${allowCount} 处`))
if (issues.length === 0) {
  console.log(green('✔ 没有无注释的静默 catch'))
} else {
  console.error(red(`✘ 发现 ${issues.length} 处静默 catch：`))
  for (const issue of issues) console.error(`  - ${issue}`)
  process.exit(1)
}
