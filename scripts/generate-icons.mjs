#!/usr/bin/env node
/**
 * 应用图标生成（PWA manifest / apple-touch-icon）
 *
 *   node scripts/generate-icons.mjs
 *
 * 从自制的 public/rhine/favicon.svg 栅格化出 180/192/512 PNG，
 * 输出到 public/icons/。sharp 为已有依赖，无需联网。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'public', 'rhine', 'favicon.svg')
const SHORTCUT_DIR = path.join(ROOT, 'public', 'rhine', 'shortcuts')
const OUT_DIR = path.join(ROOT, 'public', 'icons')
const SIZES = [180, 192, 512]
// PWA 快捷方式图标（96/192）：来自自制的 public/rhine/shortcuts/*.svg
const SHORTCUTS = ['archive', 'stats', 'subscribe', 'random', 'readers']

async function main() {
  if (!fs.existsSync(SRC)) {
    console.warn(`[icons] 找不到 ${path.relative(ROOT, SRC)}，跳过`)
    return
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const svg = fs.readFileSync(SRC)
  let count = 0
  for (const size of SIZES) {
    await sharp(svg, { density: 1024 })
      .resize(size, size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT_DIR, `icon-${size}.png`))
    count++
  }
  for (const name of SHORTCUTS) {
    const shortcutSrc = path.join(SHORTCUT_DIR, `${name}.svg`)
    if (!fs.existsSync(shortcutSrc)) continue
    const shortcutSvg = fs.readFileSync(shortcutSrc)
    for (const size of [96, 192]) {
      await sharp(shortcutSvg, { density: 1024 })
        .resize(size, size, { fit: 'cover' })
        .png({ compressionLevel: 9 })
        .toFile(path.join(OUT_DIR, `shortcut-${name}-${size}.png`))
      count++
    }
  }

  console.log(`[icons] generated ${count} icons → public/icons/`)
}

main().catch((error) => {
  console.warn(`[icons] 生成失败（不中断构建）：${error?.message || error}`)
  process.exitCode = 0
})
