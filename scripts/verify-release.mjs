#!/usr/bin/env node
/**
 * 发布包校验：node scripts/verify-release.mjs [路径或版本]
 *
 * 默认校验 release/ 下最新版本的 zip 与同名 MANIFEST：
 *   - MANIFEST 的 sha256 / size 与 zip 实际一致
 *   - MANIFEST 文件数 = zip 条目数
 *   - 必需文件齐全（package.json、主题安装器、文档、徽章、锁文件）
 *   - 不包含 node_modules / dist / .astro / 日志
 *
 * 这是交付前的最后一道门：确认「交付的就是校验过的那一份」。
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import os from 'node:os'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const releaseDir = path.join(ROOT, 'release')
const red = (s) => `\x1b[31m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`

const issues = []

function pickZip(arg) {
  if (arg) {
    const direct = path.resolve(ROOT, arg)
    if (fs.existsSync(direct) && direct.endsWith('.zip')) return direct
    const byVersion = path.join(releaseDir, `rhinelab-blog-v${arg.replace(/^v/, '')}.zip`)
    if (fs.existsSync(byVersion)) return byVersion
    throw new Error(`找不到发布包：${arg}`)
  }
  const candidates = fs
    .readdirSync(releaseDir)
    .filter(name => /^rhinelab-blog-v\d+\.\d+\.\d+\.zip$/.test(name))
    .map(name => {
      const match = name.match(/v(\d+)\.(\d+)\.(\d+)\.zip$/)
      return { name, parts: match.slice(1).map(Number) }
    })
    .sort((a, b) => b.parts[0] - a.parts[0] || b.parts[1] - a.parts[1] || b.parts[2] - a.parts[2])
  if (candidates.length === 0) throw new Error('release/ 下没有发布包')
  return path.join(releaseDir, candidates[0].name)
}

// 允许只传 --full / --build（此时自动取最新 zip）
const cliArgs = process.argv.slice(2)
const versionArg = cliArgs.find(arg => !arg.startsWith('-'))
const zipPath = pickZip(versionArg)
const base = path.basename(zipPath, '.zip')
const manifestPath = path.join(releaseDir, `${base}-MANIFEST.txt`)

if (!fs.existsSync(manifestPath)) issues.push(`缺少 MANIFEST：${path.basename(manifestPath)}`)
const manifest = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, 'utf8') : ''
const buffer = fs.readFileSync(zipPath)

const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
const expectedHash = manifest.match(/^sha256:\s*([0-9a-f]{64})$/m)?.[1]
const expectedSize = manifest.match(/^size:\s*(\d+)\s*bytes$/m)?.[1]
const expectedFiles = Number(manifest.match(/^files:\s*(\d+)$/m)?.[1] ?? -1)

if (expectedHash && expectedHash !== sha256) {
  issues.push(`sha256 不匹配：MANIFEST ${expectedHash} vs 实际 ${sha256}`)
}
if (expectedSize && Number(expectedSize) !== buffer.length) {
  issues.push(`size 不匹配：MANIFEST ${expectedSize} vs 实际 ${buffer.length}`)
}
if (expectedFiles < 0) issues.push('MANIFEST 缺少 files 行')

// 跨平台列出 zip 条目：unzip（Linux/macOS）→ python3 zipfile → bsdtar（Windows）
const tryExec = (command, args, options = {}) => {
  try {
    return execFileSync(command, args, { encoding: 'utf8', ...options })
  } catch {
    return null
  }
}
const listZip = file => {
  const unzip = tryExec('unzip', ['-Z1', file])
  if (unzip !== null) return unzip
  const python = tryExec('python3', [
    '-c',
    'import sys,zipfile;print("\\n".join(zipfile.ZipFile(sys.argv[1]).namelist()))',
    file,
  ])
  if (python !== null) return python
  const tar = tryExec('tar', ['-tf', file])
  if (tar !== null) return tar
  throw new Error('无法读取 zip（需要 unzip / python3 / bsdtar 之一）')
}
const listOutput = listZip(zipPath)
const entries = listOutput
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean)
  .filter(line => !line.endsWith('/'))
// 归一化：去掉可能的 ./ 前缀与打包根目录（rhinelab-blog/），
// 兼容 Windows PowerShell、Linux Info-ZIP（无根目录）与 tar 三种归档方式
const normalizeEntry = entry => {
  let value = entry.replace(/\\/g, '/').replace(/^\.\//, '')
  const rootDir = value.split('/')[0]
  if (rootDir === 'rhinelab-blog') value = value.slice(rootDir.length + 1)
  return value
}
const entryFiles = entries.map(normalizeEntry)
if (expectedFiles >= 0 && entryFiles.length !== expectedFiles) {
  issues.push(`文件数不一致：MANIFEST ${expectedFiles} vs zip ${entryFiles.length}`)
}

const required = [
  'package.json',
  'pnpm-lock.yaml',
  'README.md',
  'ITERATIONS.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'docs/ACCEPTANCE.md',
  'docs/MILESTONE-100.md',
  'docs/READERS.md',
  'docs/THEMING.md',
  'docs/DESIGN.md',
  'docs/ASSETS.md',
  'docs/DEPLOY.md',
  'docs/badge-version.svg',
  'theme/install.mjs',
  'theme/selftest.mjs',
  'theme/README.md',
  'src/styles/rhinelab.css',
]
const missing = required.filter(file => !entryFiles.includes(file))
for (const file of missing) issues.push(`发布包缺少必需文件：${file}`)

for (const forbidden of ['node_modules/', 'dist/', '.astro/', '.rhine-backup/']) {
  if (entryFiles.some(entry => entry.startsWith(forbidden) || entry.includes(`/${forbidden}`))) {
    issues.push(`发布包不应包含：${forbidden}`)
  }
}

const full = process.argv.includes('--full')
const withBuild = process.argv.includes('--build')
if (full && issues.length === 0) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rhine-release-'))
  try {
    const unzipOk = tryExec('unzip', ['-q', zipPath, '-d', tempRoot]) !== null
    if (!unzipOk) {
      const pythonOk = tryExec('python3', [
        '-c',
        'import sys,zipfile;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])',
        zipPath,
        tempRoot,
      ]) !== null
      if (!pythonOk) execFileSync('tar', ['-xf', zipPath, '-C', tempRoot], { stdio: 'inherit' })
    }
    const appDir = path.join(tempRoot, 'rhinelab-blog')
    if (!fs.existsSync(appDir)) {
      issues.push('解压后找不到 rhinelab-blog/ 目录')
    } else {
      const run = (script, label) => {
        const result = spawnSync(process.execPath, [script], {
          cwd: appDir,
          encoding: 'utf8',
        })
        if (result.status !== 0) {
          issues.push(`${label} 失败（exit ${result.status}）`)
          if (result.stderr) console.error(result.stderr.slice(0, 800))
        } else {
          console.log(dim(`  · ${label} 通过`))
        }
      }
      run(path.join(appDir, 'theme', 'selftest.mjs'), '解压包主题安装器自测')
      run(path.join(appDir, 'scripts', 'check-docs.mjs'), '解压包文档一致性检查')

      if (withBuild) {
        // 复用本机 node_modules（junction / symlink），验证「解压后即可构建」
        const localModules = path.join(ROOT, 'node_modules')
        const tempModules = path.join(appDir, 'node_modules')
        let linked = false
        if (fs.existsSync(localModules) && !fs.existsSync(tempModules)) {
          fs.symlinkSync(localModules, tempModules, process.platform === 'win32' ? 'junction' : 'dir')
          linked = true
        }
        try {
          const astroCli = path.join(tempModules, 'astro', 'bin', 'astro.mjs')
          if (!fs.existsSync(astroCli)) {
            issues.push('解压包构建验证：找不到 astro CLI（node_modules 不可用）')
          } else {
            const build = spawnSync(process.execPath, [astroCli, 'build'], {
              cwd: appDir,
              encoding: 'utf8',
              env: { ...process.env, NODE_ENV: 'production' },
            })
            if (build.status !== 0) {
              issues.push(`解压包构建失败（exit ${build.status}）`)
              if (build.stderr) console.error(build.stderr.slice(0, 1200))
            } else {
              console.log(dim('  · 解压包 astro build 通过'))
              const distDir = path.join(appDir, 'dist')
              const htmlCount = fs.existsSync(distDir)
                ? (fs.readdirSync(distDir, { recursive: true }) ?? []).filter(name => String(name).endsWith('.html')).length
                : 0
              if (htmlCount < 30) issues.push(`解压包构建产物 HTML 过少：${htmlCount}`)
              const linksCheck = spawnSync(process.execPath, [path.join(appDir, 'scripts', 'check-links.mjs'), '--strict'], {
                cwd: appDir,
                encoding: 'utf8',
              })
              if (linksCheck.status !== 0) {
                issues.push(`解压包构建后 check-links 失败（exit ${linksCheck.status}）`)
                if (linksCheck.stderr) console.error(linksCheck.stderr.slice(0, 800))
              } else {
                console.log(dim('  · 解压包构建后链接检查通过'))
              }
            }
          }
        } finally {
          if (linked) {
            try {
              fs.unlinkSync(tempModules)
            } catch {
              /* 清理失败不影响校验结论，临时目录随后整体删除 */
            }
          }
        }
      }
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  }
}

console.log(
  dim(
    `发布包校验：${path.basename(zipPath)}（${(buffer.length / 1024).toFixed(1)} KB，${entryFiles.length} 个文件` +
      `${full ? ' · full' : ''}${withBuild ? ' · full+build' : ''}）`,
  ),
)
if (issues.length === 0) {
  console.log(green('✔ 发布包与 MANIFEST 完全一致，必需文件齐全，无构建产物混入'))
  console.log(dim(`  sha256 ${sha256}`))
} else {
  console.error(red(`✘ 发现 ${issues.length} 个问题：`))
  for (const issue of issues) console.error(`  - ${issue}`)
  process.exit(1)
}
