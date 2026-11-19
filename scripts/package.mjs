#!/usr/bin/env node
/**
 * 打包模板：node scripts/package.mjs [--no-zip]
 *
 * - 复制到临时 staging（排除 node_modules / dist / .git / 日志 / 截图缓存等）
 * - 生成 release/rhinelab-blog-v<version>.zip（Windows 用 PowerShell，其他平台用 zip/tar）
 * - 生成 release/MANIFEST.txt 文件清单
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const noZip = process.argv.includes('--no-zip')

const EXCLUDE_DIRS = new Set([
  'node_modules',
  'dist',
  '.astro',
  '.git',
  '.shots',
  'release',
  '.rhine-backup',
  '.tmp-install',
  '.tmp-pkgtest',
  '.vscode',
  '.idea',
])

const EXCLUDE_FILES = [/\.log$/, /\.zip$/, /^\.env(\..*)?$/, /^Thumbs\.db$/, /^\.DS_Store$/]

function shouldSkip(name, isDir) {
  if (isDir) return EXCLUDE_DIRS.has(name)
  return EXCLUDE_FILES.some((re) => re.test(name))
}

function copyTree(src, dest, files = []) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    // junction / symlink（如本地复用的 node_modules）一律跳过
    if (entry.isSymbolicLink()) continue
    if (shouldSkip(entry.name, entry.isDirectory())) continue
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyTree(s, d, files)
    else {
      fs.copyFileSync(s, d)
      files.push(path.relative(staging, d).split(path.sep).join('/'))
    }
  }
  return files
}

const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'rhine-pkg-'))
const appDir = path.join(staging, 'rhinelab-blog')
const files = copyTree(ROOT, appDir)

const releaseDir = path.join(ROOT, 'release')
fs.mkdirSync(releaseDir, { recursive: true })
const base = `rhinelab-blog-v${pkg.version}`
const manifestPath = path.join(releaseDir, `${base}-MANIFEST.txt`)
const writeManifest = (zipPath) => {
  let hashLine = ''
  if (zipPath) {
    const buffer = fs.readFileSync(zipPath)
    hashLine = `sha256: ${createHash('sha256').update(buffer).digest('hex')}\nsize: ${buffer.length} bytes\n`
  }
  fs.writeFileSync(
    manifestPath,
    `${base}\nfiles: ${files.length}\n${hashLine}\n${files.sort().join('\n')}\n`,
    'utf8',
  )
}

function zipDir(srcDir, outFile) {
  if (process.platform === 'win32') {
    const ps = `Compress-Archive -Path '${srcDir.replace(/'/g, "''")}' -DestinationPath '${outFile.replace(/'/g, "''")}' -Force`
    execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], { stdio: 'inherit' })
    return
  }
  try {
    execFileSync('zip', ['-rq', outFile, '.'], { cwd: srcDir, stdio: 'inherit' })
  } catch {
    execFileSync('tar', ['-czf', outFile, '-C', path.dirname(srcDir), path.basename(srcDir)], {
      stdio: 'inherit',
    })
  }
}

let zipPath = null
if (!noZip) {
  zipPath = path.join(releaseDir, `${base}.zip`)
  fs.rmSync(zipPath, { force: true })
  zipDir(appDir, zipPath)
}

writeManifest(zipPath)
fs.rmSync(staging, { recursive: true, force: true })

const kb = (p) => `${(fs.statSync(p).size / 1024).toFixed(1)} KB`
console.log(`打包完成：${files.length} 个文件，版本 v${pkg.version}`)
if (zipPath) console.log(`归档：${path.relative(ROOT, zipPath)}（${kb(zipPath)}）`)
console.log(`清单：${path.relative(ROOT, manifestPath)}`)
