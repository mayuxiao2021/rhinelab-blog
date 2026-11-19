#!/usr/bin/env node
/**
 * Rhine Archive Theme Installer — 把「莱茵档案」样式层装进任意 Fuwari / Astro 博客
 *
 * 用法：
 *   node theme/install.mjs --target ../my-blog --dry-run     # 预演，不写文件
 *   node theme/install.mjs --target ../my-blog               # 安装（样式层 + 品牌素材）
 *   node theme/install.mjs --target ../my-blog --minimal     # 只装 CSS 覆盖层
 *   node theme/install.mjs --target ../my-blog --rollback    # 回滚最近一次安装
 *   node theme/install.mjs --target ../my-blog --list        # 列出安装计划
 *   node theme/install.mjs --target ../my-blog --verify      # 只验证当前安装状态
 *
 * 设计原则：
 *   - 只做「可逆」的最小改动：复制文件 + 在 Layout.astro 注入一个 import 块
 *   - 每次修改前备份到 <target>/.rhine-backup/<时间戳>/
 *   - 所有写入都幂等；重复执行不会重复注入
 *   - 不依赖网络、不安装依赖、不改 package.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(HERE, '..')
const VERSION = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8')).version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
})()
const MARK_START = '/* rhine-theme:start */'
const MARK_END = '/* rhine-theme:end */'

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function log(...a) {
  console.log(...a)
}
function ok(msg) {
  log(`${C.green}✔${C.reset} ${msg}`)
}
function warn(msg) {
  log(`${C.yellow}!${C.reset} ${msg}`)
}
function fail(msg) {
  log(`${C.red}✘${C.reset} ${msg}`)
}
function info(msg) {
  log(`${C.cyan}·${C.reset} ${msg}`)
}

function parseArgs(argv) {
  const args = { target: null, dryRun: false, minimal: false, force: false, rollback: false, backup: null, withComponents: false, list: false, verify: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--target' || a === '-t') args.target = argv[++i]
    else if (a === '--dry-run') args.dryRun = true
    else if (a === '--minimal') args.minimal = true
    else if (a === '--force') args.force = true
    else if (a === '--rollback') args.rollback = true
    else if (a === '--backup') args.backup = argv[++i]
    else if (a === '--with-components') args.withComponents = true
    else if (a === '--list') args.list = true
    else if (a === '--verify') args.verify = true
    else if (a === '--help' || a === '-h') args.help = true
    else if (a.startsWith('-')) fail(`未知参数：${a}`)
    else if (!args.target) args.target = a
  }
  return args
}

const args = parseArgs(process.argv.slice(2))

if (args.help) {
  log(`Rhine Archive Theme Installer

  --target, -t <dir>   目标博客目录（含 astro.config.mjs 与 src/layouts/Layout.astro）
  --dry-run            只打印计划，不写文件
  --minimal            只复制 CSS 覆盖层（不复制品牌 SVG 素材）
  --with-components    额外复制 7 个主题组件（徽标/封面/目录/刻度轨/相关档案/分享条/代码复制）与系列工具，并自动把 @/ 别名改写为相对路径
  --list               只列出安装计划（不改动任何文件）
  --verify             只验证目标当前是否已正确安装
  --rollback           回滚最近一次安装
  --backup <name>      配合 --rollback 指定备份目录名
  --force              目标结构不完全匹配时仍然继续（不推荐）
`)
  process.exit(0)
}

if (!args.target) {
  fail('缺少 --target <目录>')
  process.exit(1)
}

const target = path.resolve(process.cwd(), args.target)

/* ------------------------------- 校验目标 ------------------------------- */

if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
  fail(`目标目录不存在：${target}`)
  process.exit(1)
}

const layoutPath = path.join(target, 'src', 'layouts', 'Layout.astro')
const hasAstroConfig =
  fs.existsSync(path.join(target, 'astro.config.mjs')) ||
  fs.existsSync(path.join(target, 'astro.config.ts')) ||
  fs.existsSync(path.join(target, 'astro.config.js'))

if (!hasAstroConfig || !fs.existsSync(layoutPath)) {
  if (!args.force) {
    fail('目标不像 Fuwari / Astro 博客（缺 astro.config.* 或 src/layouts/Layout.astro）')
    info('确认无误可加 --force 继续')
    process.exit(1)
  }
  warn('目标结构不匹配，--force 继续（可能无法工作）')
}

/* ------------------------------- 备份工具 ------------------------------- */

const backupRoot = path.join(target, '.rhine-backup')

function listBackups() {
  if (!fs.existsSync(backupRoot)) return []
  return fs
    .readdirSync(backupRoot)
    .filter((n) => {
      const dir = path.join(backupRoot, n)
      return (
        fs.statSync(dir).isDirectory() &&
        n !== 'DRY-RUN' &&
        fs.existsSync(path.join(dir, 'manifest.json'))
      )
    })
    .sort()
}

function makeBackupDir() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = path.join(backupRoot, stamp)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function record(manifest, absTarget, kind, backupDir) {
  const rel = path.relative(target, absTarget).split(path.sep).join('/')
  const entry = { rel, kind }
  if (args.dryRun) {
    manifest.files.push(entry)
    return
  }
  if (kind === 'modified') {
    const dest = path.join(backupDir, 'files', rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(absTarget, dest)
    entry.backup = path.join('files', rel).split(path.sep).join('/')
  }
  manifest.files.push(entry)
}

function writeFileTracked(manifest, absTarget, content, backupDir) {
  const exists = fs.existsSync(absTarget)
  if (exists) record(manifest, absTarget, 'modified', backupDir)
  else record(manifest, absTarget, 'created', backupDir)
  if (args.dryRun) return
  fs.mkdirSync(path.dirname(absTarget), { recursive: true })
  fs.writeFileSync(absTarget, content, 'utf8')
}

function copyFileTracked(manifest, srcAbs, absTarget, backupDir) {
  const exists = fs.existsSync(absTarget)
  if (exists) {
    const same = fs.readFileSync(srcAbs).equals(fs.readFileSync(absTarget))
    if (same) return { skipped: true }
    record(manifest, absTarget, 'modified', backupDir)
  } else record(manifest, absTarget, 'created', backupDir)
  if (args.dryRun) return { copied: true }
  fs.mkdirSync(path.dirname(absTarget), { recursive: true })
  fs.copyFileSync(srcAbs, absTarget)
  return { copied: true }
}

/* -------------------------------- 回滚 --------------------------------- */

if (args.rollback) {
  const backups = listBackups()
  if (backups.length === 0) {
    fail('没有可回滚的备份')
    process.exit(1)
  }
  const candidates = backups
    .map((name) => {
      const dir = path.join(backupRoot, name)
      try {
        const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'))
        return { name, dir, manifest }
      } catch {
        return null
      }
    })
    .filter(Boolean)
  const withChanges = candidates.filter((c) => Array.isArray(c.manifest.files) && c.manifest.files.length > 0)
  const chosen = args.backup
    ? candidates.find((c) => c.name === args.backup)
    : withChanges[withChanges.length - 1]
  if (!chosen) {
    fail(args.backup ? `找不到备份：${args.backup}` : '没有可回滚的变更（安装无改动）')
    process.exit(1)
  }
  const { dir, manifest } = chosen
  const name = chosen.name
  info(`回滚备份：${name}（${manifest.files.length} 项）`)
  let restored = 0
  let removed = 0
  const touchedDirs = new Set()
  for (const f of manifest.files.slice().reverse()) {
    const abs = path.join(target, f.rel)
    if (f.kind === 'modified' && f.backup) {
      const src = path.join(dir, f.backup)
      if (fs.existsSync(src)) {
        fs.mkdirSync(path.dirname(abs), { recursive: true })
        fs.copyFileSync(src, abs)
        restored++
      }
    } else if (f.kind === 'created') {
      if (fs.existsSync(abs)) {
        fs.rmSync(abs, { force: true })
        removed++
      }
      touchedDirs.add(path.dirname(abs))
    }
  }
  // 清理回滚后产生的空目录（不越过目标根）
  for (const d of [...touchedDirs].sort((a, b) => b.length - a.length)) {
    let cur = d
    while (cur.startsWith(target) && cur !== target) {
      try {
        if (fs.readdirSync(cur).length === 0) fs.rmdirSync(cur)
        else break
      } catch {
        break
      }
      cur = path.dirname(cur)
    }
  }
  fs.writeFileSync(path.join(dir, 'ROLLED_BACK.txt'), new Date().toISOString(), 'utf8')
  ok(`回滚完成：恢复 ${restored} 个文件，删除 ${removed} 个新增文件`)
  info(`备份保留在：${dir}`)
  process.exit(0)
}

/* -------------------------------- 安装 --------------------------------- */

const manifest = { createdAt: new Date().toISOString(), target, files: [] }
let backupDir = args.dryRun ? path.join(backupRoot, 'DRY-RUN') : null
const getBackupDir = () => {
  if (!backupDir) backupDir = makeBackupDir()
  return backupDir
}

log('')
log(`${C.cyan}Rhine Archive Theme Installer${C.reset} ${C.dim}v${VERSION}${C.reset}`)
info(`目标：${target}`)
info(`模式：${args.dryRun ? 'dry-run（不写文件）' : args.minimal ? 'minimal（仅 CSS）' : 'standard（CSS + 品牌素材）'}`)
log('')

const files = [
  {
    src: path.join(REPO, 'src', 'styles', 'rhinelab.css'),
    dest: path.join(target, 'src', 'styles', 'rhinelab.css'),
    required: true,
  },
]

const THEME_COMPONENTS = ['RhineMark', 'RhineHero', 'RhineToc', 'RhineProgress', 'RhineRelated', 'RhineShare', 'RhineCodeCopy']

if (args.withComponents) {
  for (const name of THEME_COMPONENTS) {
    files.push({
      src: path.join(REPO, 'src', 'components', 'rhine', `${name}.astro`),
      dest: path.join(target, 'src', 'components', 'rhine', `${name}.astro`),
      required: false,
      rewriteAliases: true,
    })
  }
  // 系列（SERIES）所需的数据层工具
  files.push({
    src: path.join(REPO, 'src', 'utils', 'series-utils.ts'),
    dest: path.join(target, 'src', 'utils', 'series-utils.ts'),
    required: false,
    rewriteAliases: true,
  })
}

// 把模板里的 `@/xxx`、`@utils/xxx` 等别名改写成相对路径，
// 使组件在「没有配置 tsconfig paths 的 Fuwari 站点」里也能直接编译。
const ALIAS_RULES = [
  [/^@\//, '../../'],
  [/^@utils\//, '../../utils/'],
  [/^@i18n\//, '../../i18n/'],
  [/^@constants\//, '../../constants/'],
  [/^@layouts\//, '../../layouts/'],
  [/^@components\//, '../'],
]

function rewriteAliases(content) {
  return content.replace(/(from\s+)(['"])([^'"]+)\2/g, (match, prefix, quote, spec) => {
    let next = spec
    for (const [pattern, replacement] of ALIAS_RULES) {
      if (pattern.test(spec)) {
        next = spec.replace(pattern, replacement)
        break
      }
    }
    return `${prefix}${quote}${next}${quote}`
  })
}

if (!args.minimal) {
  files.push(
    {
      src: path.join(REPO, 'public', 'rhine', 'mark.svg'),
      dest: path.join(target, 'public', 'rhine', 'mark.svg'),
      required: false,
    },
    {
      src: path.join(REPO, 'public', 'rhine', 'favicon.svg'),
      dest: path.join(target, 'public', 'rhine', 'favicon.svg'),
      required: false,
    },
    {
      src: path.join(REPO, 'public', 'rhine', 'avatar.svg'),
      dest: path.join(target, 'public', 'rhine', 'avatar.svg'),
      required: false,
    },
  )
}

if (args.list) {
  log(`${C.cyan}安装计划${C.reset}（目标：${target}）`)
  for (const f of files) {
    if (!fs.existsSync(f.src)) continue
    if (f.required || fs.existsSync(f.src)) {
      const rel = path.relative(target, f.dest).split(path.sep).join('/')
      log(`  ${rel}${f.rewriteAliases ? '  ${C.dim}(@/ 别名 → 相对路径)${C.reset}' : ''}`)
    }
  }
  log('')
  info(`共 ${files.filter(f => fs.existsSync(f.src)).length} 个文件；Layout 注入：1 处`)
  process.exit(0)
}

if (args.verify) {
  const checks = []
  const cssPath = path.join(target, 'src', 'styles', 'rhinelab.css')
  checks.push(['CSS 覆盖层', fs.existsSync(cssPath)])
  const layoutContent = fs.readFileSync(layoutPath, 'utf8')
  checks.push(['Layout import 注入', layoutContent.includes(MARK_START)])
  checks.push(['品牌素材', !args.minimal ? fs.existsSync(path.join(target, 'public', 'rhine', 'mark.svg')) : true])
  if (args.withComponents) {
    for (const name of THEME_COMPONENTS) {
      checks.push([`组件 ${name}`, fs.existsSync(path.join(target, 'src', 'components', 'rhine', `${name}.astro`))])
    }
  }
  log('')
  let allOk = true
  for (const [label, pass] of checks) {
    if (pass) ok(label)
    else {
      allOk = false
      fail(label)
    }
  }
  log('')
  if (allOk) ok('验证通过：主题已正确安装')
  else fail('验证未通过：请重新安装或使用 --rollback')
  process.exit(allOk ? 0 : 1)
}

if (!args.dryRun) info(`备份：${getBackupDir()}`)

let copied = 0
for (const f of files) {
  if (!fs.existsSync(f.src)) {
    if (f.required) {
      fail(`主题源文件缺失：${f.src}`)
      process.exit(1)
    }
    warn(`跳过（源不存在）：${path.relative(REPO, f.src)}`)
    continue
  }
  if (f.rewriteAliases) {
    const exists = fs.existsSync(f.dest)
    const nextContent = rewriteAliases(fs.readFileSync(f.src, 'utf8'))
    const same = exists && fs.readFileSync(f.dest, 'utf8') === nextContent
    if (same) {
      info(`未变化：${path.relative(target, f.dest)}`)
      continue
    }
    writeFileTracked(manifest, f.dest, nextContent, getBackupDir())
    ok(`${args.dryRun ? '将复制（别名改写）' : '已复制（别名改写）'}：${path.relative(target, f.dest)}`)
    copied++
    continue
  }

  const r = copyFileTracked(manifest, f.src, f.dest, getBackupDir())
  if (r.skipped) {
    info(`未变化：${path.relative(target, f.dest)}`)
  } else {
    ok(`${args.dryRun ? '将复制' : '已复制'}：${path.relative(target, f.dest)}`)
    copied++
  }
}

/* 在 Layout.astro 注入 import（幂等） */
let layout = fs.readFileSync(layoutPath, 'utf8')
if (layout.includes(MARK_START)) {
  warn('Layout.astro 已包含 rhine-theme 注入块，跳过（升级请先 --rollback 或手动替换 CSS）')
} else {
  const fmMatch = layout.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!fmMatch) {
    fail('Layout.astro 缺少 frontmatter（--- 块），无法安全注入')
    process.exit(1)
  }
  const fm = fmMatch[1]
  const importRe = /^import\s.+$/gm
  let lastEnd = -1
  let m
  while ((m = importRe.exec(fm)) !== null) lastEnd = m.index + m[0].length
  const block = `\n${MARK_START}\nimport '../styles/rhinelab.css'\n${MARK_END}`
  let newFm
  if (lastEnd >= 0) {
    newFm = fm.slice(0, lastEnd) + block + fm.slice(lastEnd)
  } else {
    warn('未找到 import 语句，改为追加到 frontmatter 末尾')
    newFm = fm + block
  }
  const newLayout = layout.replace(fm, newFm)
  writeFileTracked(manifest, layoutPath, newLayout, getBackupDir())
  ok(`${args.dryRun ? '将注入' : '已注入'}：src/layouts/Layout.astro（rhine-theme import）`)
  layout = newLayout
}

/* ------------------------------- 收尾 --------------------------------- */

if (!args.dryRun) {
  if (manifest.files.length === 0) {
    fs.rmSync(backupDir, { recursive: true, force: true })
  } else {
    fs.writeFileSync(path.join(getBackupDir(), 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
  }
}

log('')
if (args.dryRun) {
  ok(`预演完成：${manifest.files.length} 项变更将被执行，未写入任何文件`)
  info('确认无误后去掉 --dry-run 正式安装')
} else {
  if (manifest.files.length === 0) {
    ok('安装完成：主题已是最新，未产生任何变更')
  } else {
    ok(`安装完成：${manifest.files.length} 项变更，备份在 ${path.relative(target, getBackupDir())}`)
  }
  log('')
  const checks = []
  checks.push(['CSS 覆盖层', fs.existsSync(path.join(target, 'src', 'styles', 'rhinelab.css'))])
  checks.push(['Layout import 注入', fs.readFileSync(layoutPath, 'utf8').includes(MARK_START)])
  if (args.withComponents) {
    const missing = THEME_COMPONENTS.filter(
      (name) => !fs.existsSync(path.join(target, 'src', 'components', 'rhine', `${name}.astro`)),
    )
    checks.push([`主题组件（${THEME_COMPONENTS.length} 个）`, missing.length === 0])
  }
  log(`${C.cyan}自检${C.reset}`)
  for (const [label, pass] of checks) {
    if (pass) ok(label)
    else fail(label)
  }
  log('')
  info('下一步：')
  log('  1. 把 src/config.ts 的 themeColor.fixed 设为 true（固定黄铜强调）')
  log('  2. 关闭 banner 或自备 public/banners/ 图片，避免首屏 404')
  log('  3. pnpm build && pnpm preview 验证')
  log('  4. 不满意随时回滚：node theme/install.mjs --target <dir> --rollback')
}
log('')
