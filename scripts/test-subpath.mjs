#!/usr/bin/env node
/**
 * 子路径部署自动化验证：node scripts/test-subpath.mjs
 *
 * 1. 以 BASE_PATH=/rhine-test/（可用环境变量覆盖）构建
 * 2. 用 BASE_PATH 跑 check-links / check-seo / check-feed
 * 3. 无论成功失败，最后都恢复默认根路径构建 dist/
 *
 * 这是「模板包能否部署到 /blog/ 这类子路径」的端到端回归。
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE = process.env.SUBPATH_TEST_BASE || '/rhine-test/'
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const red = (s) => `\x1b[31m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`

const run = (label, command, args, env, useShell = false) => {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: useShell,
  })
  const ok = result.status === 0
  console.log(ok ? green(`✔ ${label}`) : red(`✘ ${label}（exit ${result.status}）`))
  return ok
}

console.log(dim(`子路径构建验证：BASE_PATH=${BASE}`))
const results = []
results.push(
  run(
    '子路径构建',
    pnpm,
    ['build'],
    { BASE_PATH: BASE, SITE_URL: process.env.SITE_URL || 'https://example.com' },
    true,
  ),
)
if (results[0]) {
  results.push(run('check-links（带 BASE_PATH）', process.execPath, ['scripts/check-links.mjs', '--strict'], { BASE_PATH: BASE }))
  results.push(run('check-seo（带 BASE_PATH）', process.execPath, ['scripts/check-seo.mjs'], { BASE_PATH: BASE }))
  results.push(run('check-feed（子路径 feed）', process.execPath, ['scripts/check-feed.mjs'], { BASE_PATH: BASE }))
}

// 恢复默认根路径构建，避免污染后续 verify / 打包
console.log(dim('\n恢复默认根路径构建…'))
const restore = spawnSync(pnpm, ['build'], {
  cwd: ROOT,
  env: { ...process.env, BASE_PATH: '/', SITE_URL: process.env.SITE_URL || 'https://example.com' },
  stdio: 'inherit',
  shell: true,
})
const restored = restore.status === 0
console.log(restored ? green('✔ 已恢复默认构建') : red(`✘ 恢复默认构建失败（exit ${restore.status}）`))

const failed = results.filter(ok => !ok).length
if (failed > 0 || !restored) {
  console.error(red(`\n✘ 子路径验证失败：${failed} 项`))
  process.exit(1)
}
console.log(green('\n✔ 子路径部署验证全部通过'))
