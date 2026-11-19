#!/usr/bin/env node
/**
 * 主题安装器自测（isolated temp directory，不碰真实站点）
 *
 *   node theme/selftest.mjs
 *
 * 覆盖：安装（含组件别名改写）→ 幂等重装 → --verify → --rollback → 还原校验
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const INSTALLER = path.join(HERE, 'install.mjs')
const COMPONENTS = ['RhineMark', 'RhineHero', 'RhineToc', 'RhineProgress', 'RhineRelated', 'RhineShare', 'RhineCodeCopy']

const failures = []
function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✔ ${label}`)
  } else {
    failures.push(label)
    console.log(`  ✘ ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

function runInstaller(args) {
  return spawnSync(process.execPath, [INSTALLER, ...args], { encoding: 'utf8' })
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rhine-theme-selftest-'))
const target = path.join(tmp, 'blog')
const originalLayout = `---
import type { GetStaticPaths } from 'astro'
import 'katex/dist/katex.min.css'

const foo = 1
---

<html lang="zh-CN">
  <body class="foo">
    <main id="swup-container"><slot /></main>
  </body>
</html>
`

try {
  fs.mkdirSync(path.join(target, 'src', 'layouts'), { recursive: true })
  fs.writeFileSync(path.join(target, 'astro.config.mjs'), 'export default {}\n', 'utf8')
  fs.writeFileSync(path.join(target, 'src', 'layouts', 'Layout.astro'), originalLayout, 'utf8')

  console.log('')
  console.log('[1] 安装（CSS + 品牌素材 + 7 个组件 + 系列工具，别名改写）')
  const first = runInstaller(['--target', target, '--with-components'])
  check('安装退出码为 0', first.status === 0, first.stderr || first.stdout)
  check('CSS 覆盖层存在', fs.existsSync(path.join(target, 'src', 'styles', 'rhinelab.css')))
  check('品牌素材存在', fs.existsSync(path.join(target, 'public', 'rhine', 'mark.svg')))
  for (const name of COMPONENTS) {
    check(`组件 ${name} 存在`, fs.existsSync(path.join(target, 'src', 'components', 'rhine', `${name}.astro`)))
  }
  check('系列工具存在', fs.existsSync(path.join(target, 'src', 'utils', 'series-utils.ts')))

  const layoutAfter = fs.readFileSync(path.join(target, 'src', 'layouts', 'Layout.astro'), 'utf8')
  check('Layout 注入标记存在', layoutAfter.includes('/* rhine-theme:start */'))
  check('Layout 注入恰好一次', layoutAfter.split('/* rhine-theme:start */').length === 2)
  check('Layout 注入 import 路径正确', layoutAfter.includes("import '../styles/rhinelab.css'"))

  const hero = fs.readFileSync(path.join(target, 'src', 'components', 'rhine', 'RhineHero.astro'), 'utf8')
  check('组件 @/ 别名已改写', !hero.includes("from '@/") && !hero.includes("from '@utils/"))
  check('组件相对路径正确', hero.includes("from '../../config'"))
  check('组件内容未丢失', hero.includes('RhineMark'))

  console.log('')
  console.log('[2] 幂等重装')
  const second = runInstaller(['--target', target, '--with-components'])
  check('重装退出码为 0', second.status === 0)
  const layoutSecond = fs.readFileSync(path.join(target, 'src', 'layouts', 'Layout.astro'), 'utf8')
  check('注入未重复', layoutSecond.split('/* rhine-theme:start */').length === 2)

  console.log('')
  console.log('[3] --verify 验证')
  const verify = runInstaller(['--target', target, '--with-components', '--verify'])
  check('验证退出码为 0', verify.status === 0, verify.stdout)
  check('验证输出通过信息', verify.stdout.includes('验证通过'))

  console.log('')
  console.log('[4] --rollback 回滚')
  const rollback = runInstaller(['--target', target, '--rollback'])
  check('回滚退出码为 0', rollback.status === 0, rollback.stderr || rollback.stdout)
  const layoutRestored = fs.readFileSync(path.join(target, 'src', 'layouts', 'Layout.astro'), 'utf8')
  check('Layout 已还原', layoutRestored === originalLayout)
  check('CSS 已删除', !fs.existsSync(path.join(target, 'src', 'styles', 'rhinelab.css')))
  check('组件目录已清理', !fs.existsSync(path.join(target, 'src', 'components', 'rhine')))
  check('品牌素材已清理', !fs.existsSync(path.join(target, 'public', 'rhine')))
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}

console.log('')
if (failures.length > 0) {
  console.log(`✘ 自测失败 ${failures.length} 项：${failures.join('、')}`)
  process.exit(1)
}
console.log('✔ 安装器自测全部通过（安装 / 幂等 / 验证 / 回滚）')
