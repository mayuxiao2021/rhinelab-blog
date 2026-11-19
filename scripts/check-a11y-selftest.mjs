#!/usr/bin/env node
/**
 * check-a11y 自测：用「故意违规」和「合规」两个 fixture 验证规则真的生效。
 *
 *   node scripts/check-a11y-selftest.mjs
 *
 * 通过条件：
 *   1. 违规页 → exit 1，且 stderr 包含每条规则的预期提示
 *   2. 合规页 → exit 0
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CHECKER = path.join(ROOT, 'scripts/check-a11y.mjs')
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rl-a11y-fixture-'))

const badHtml = `<!doctype html>
<html lang="zh-CN"><head><meta name="viewport" content="user-scalable=no"><title>bad</title></head>
<body>
  <h1>bad</h1>
  <button aria-expanded="yes">缺少 values</button>
  <button aria-expanded="true">缺少 controls</button>
  <button aria-pressed="maybe">状态值非法</button>
  <div role="img"></div>
  <details><p>没有 summary</p></details>
  <details><summary></summary><p>空 summary</p></details>
  <a href="/x" aria-hidden="true">隐藏焦点</a>
  <img src="/x.png">
  <div aria-live="polite" aria-hidden="true">冲突</div>
</body></html>`

const goodHtml = `<!doctype html>
<html lang="zh-CN"><head><meta name="viewport" content="width=device-width"><title>good</title></head>
<body>
  <h1>good</h1>
  <details><summary>展开</summary><p>内容</p></details>
  <button aria-expanded="false" aria-controls="panel">切换</button>
  <div id="panel" role="img" aria-label="示意图"></div>
  <a href="/about/">关于</a>
  <img src="/x.png" alt="示意">
</body></html>`

const run = dir => {
  const result = spawnSync(process.execPath, [CHECKER], {
    cwd: ROOT,
    env: { ...process.env, A11Y_DIST: dir },
    encoding: 'utf8',
  })
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const failures = []
try {
  const badDir = path.join(tempDir, 'bad')
  const goodDir = path.join(tempDir, 'good')
  fs.mkdirSync(badDir)
  fs.mkdirSync(goodDir)
  fs.writeFileSync(path.join(badDir, 'index.html'), badHtml, 'utf8')
  fs.writeFileSync(path.join(goodDir, 'index.html'), goodHtml, 'utf8')

  const bad = run(badDir)
  const expected = [
    'aria-expanded 取值应为 true/false',
    'aria-expanded 缺少 aria-controls',
    'role="img" 缺少 aria-label',
    '缺少可访问名称',
    'aria-hidden="true"',
    '缺少 alt',
    'aria-live 与 aria-hidden',
    'viewport 缺少 width=device-width',
    'aria-pressed 取值应为 true/false',
  ]
  if (bad.status !== 1) failures.push(`违规页应 exit 1，实际 ${bad.status}`)
  for (const phrase of expected) {
    if (!bad.output.includes(phrase)) failures.push(`违规页未报出：${phrase}`)
  }

  const good = run(goodDir)
  if (good.status !== 0) failures.push(`合规页应 exit 0，实际 ${good.status}`)
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true })
}

if (failures.length > 0) {
  console.error(`\x1b[31m✘ check-a11y 自测失败：\x1b[0m`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log('\x1b[32m✔ check-a11y 自测通过（违规页 9 类提示命中，合规页 0 问题）\x1b[0m')
