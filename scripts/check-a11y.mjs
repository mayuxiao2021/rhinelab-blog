#!/usr/bin/env node
/**
 * 静态无障碍 / 链接安全自检（无第三方依赖，直接扫描 dist 的 HTML）
 *
 * 检查项：
 *  1. <img> 必须带 alt
 *  2. <a href> 必须有可访问名称（文本 / aria-label / title / aria-labelledby）
 *  3. <button> 必须有可访问名称
 *  4. target="_blank" 必须带 rel="noopener" 或 "noreferrer"
 *  5. 每页恰好一个 <h1>
 *  6. <html lang> 非空、存在 viewport meta
 *  7. 不允许正数 tabindex
 *  8. aria-labelledby / aria-describedby / aria-controls / aria-activedescendant 指向的 id 必须存在
 *  9. <iframe> 必须有 title
 * 10. id 不能重复
 * 11. aria-live 不能与 aria-hidden="true" 冲突
 * 12. 可聚焦元素不能 aria-hidden="true"
 * 13. role="img" 必须有 aria-label / aria-labelledby
 * 14. aria-expanded / pressed / checked / selected 取值必须合法
 * 15. <summary> 必须有可访问名称
 * 16. aria-expanded 必须配 aria-controls（或 aria-owns）
 * 17. <details> 必须以 <summary> 作为首个元素
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = process.env.A11Y_DIST ? path.resolve(process.env.A11Y_DIST) : path.join(ROOT, 'dist')

const red = (s) => `\x1b[31m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

function parseAttrs(raw) {
  const attrs = {}
  const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g
  let match
  while ((match = re.exec(raw))) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return attrs
}

function checkFile(file) {
  const html = fs.readFileSync(file, 'utf8')
  const rel = path.relative(DIST, file).replace(/\\/g, '/')
  const issues = []

  const ids = new Set()
  const dupIds = new Set()
  const ariaRefs = []
  let h1 = 0
  let lang = ''
  let viewport = ''
  let inRawText = null
  const headingLevels = []

  /** 打开中的 a / button；text 累加内部文本 */
  const stack = []
  const tokenRe = /<[^>]*>|[^<]+/g
  let token

  while ((token = tokenRe.exec(html))) {
    const raw = token[0]
    if (!raw.startsWith('<')) {
      if (inRawText) continue
      const text = raw.replace(/\s+/g, ' ')
      for (const frame of stack) frame.text += text
      continue
    }
    if (raw.startsWith('<!--') || raw.startsWith('<!')) continue

    const isClose = raw.startsWith('</')
    const head = raw.slice(isClose ? 2 : 1, raw.length - 1)
    const spaceIdx = head.search(/[\s/]/)
    const tag = (spaceIdx === -1 ? head : head.slice(0, spaceIdx)).toLowerCase()
    if (!tag) continue

    if (inRawText) {
      if (isClose && tag === inRawText) inRawText = null
      continue
    }

    if (isClose) {
      if (tag === 'a' || tag === 'button' || tag === 'summary') {
        let idx = -1
        for (let i = stack.length - 1; i >= 0; i -= 1) {
          if (stack[i].tag === tag) {
            idx = i
            break
          }
        }
        if (idx !== -1) {
          const open = stack[idx]
          stack.splice(idx, 1)
          const text = open.text.replace(/\s+/g, ' ').trim()
          const hasName =
            text.length > 0 ||
            (open.attrs['aria-label'] ?? '').trim().length > 0 ||
            (open.attrs.title ?? '').trim().length > 0 ||
            (open.attrs['aria-labelledby'] ?? '').trim().length > 0
          if (!hasName) {
            const hint = open.attrs.href ?? open.attrs.class ?? ''
            issues.push(`<${tag}> 缺少可访问名称：${hint.slice(0, 100)}`)
          }
        }
      }
      continue
    }

    const attrs = parseAttrs(spaceIdx === -1 ? '' : head.slice(spaceIdx))
    if (tag === 'html' && attrs.lang) lang = attrs.lang
    if (tag === 'meta' && attrs.name === 'viewport') viewport = attrs.content ?? ''
    if (tag === 'script' || tag === 'style' || tag === 'template' || tag === 'textarea') {
      inRawText = tag
      continue
    }
    if (tag === 'h1') h1 += 1
    if (/^h[1-6]$/.test(tag)) headingLevels.push(Number(tag[1]))
    if (attrs.id) {
      if (ids.has(attrs.id)) dupIds.add(attrs.id)
      ids.add(attrs.id)
    }
    if (attrs.tabindex && /^[1-9]\d*$/.test(attrs.tabindex)) {
      issues.push(`正数 tabindex：${attrs.tabindex}`)
    }
    if (tag === 'img' && attrs.alt === undefined) {
      issues.push(`<img> 缺少 alt：${(attrs.src ?? '').slice(0, 80)}`)
    }
    if (tag === 'iframe' && !(attrs.title ?? '').trim()) {
      issues.push(`<iframe> 缺少 title：${(attrs.src ?? '').slice(0, 80)}`)
    }
    if (attrs['aria-live'] && attrs['aria-hidden'] === 'true') {
      issues.push(`aria-live 与 aria-hidden="true" 冲突：${tag}`)
    }
    if (
      attrs['aria-hidden'] === 'true' &&
      ((tag === 'a' && attrs.href !== undefined) || tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea' || attrs.tabindex !== undefined)
    ) {
      issues.push(`可聚焦元素不应 aria-hidden="true"：${tag} ${(attrs.href ?? attrs.id ?? '').slice(0, 80)}`)
    }
    if (attrs.role === 'img' && !(attrs['aria-label'] ?? '').trim() && !(attrs['aria-labelledby'] ?? '').trim()) {
      issues.push(`role="img" 缺少 aria-label：${(attrs.src ?? attrs.class ?? '').slice(0, 80)}`)
    }
    if (attrs['aria-expanded'] !== undefined && attrs['aria-controls'] === undefined && attrs['aria-owns'] === undefined) {
      issues.push(`aria-expanded 缺少 aria-controls：${tag} ${(attrs.id ?? attrs['aria-label'] ?? '').slice(0, 60)}`)
    }
    for (const [stateAttr, allowed] of [
      ['aria-expanded', 'true/false'],
      ['aria-pressed', 'true/false'],
      ['aria-selected', 'true/false'],
      ['aria-checked', 'true/false/mixed'],
    ]) {
      if (attrs[stateAttr] !== undefined && !['true', 'false', 'mixed'].includes(attrs[stateAttr])) {
        issues.push(`${stateAttr} 取值应为 ${allowed}：${attrs[stateAttr]}`)
      }
    }
    for (const ref of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-activedescendant']) {
      if (attrs[ref]) ariaRefs.push({ ref, value: attrs[ref] })
    }
    if (tag === 'a' && attrs.href !== undefined && attrs.target === '_blank') {
      const relValue = (attrs.rel ?? '').toLowerCase()
      if (!relValue.includes('noopener') && !relValue.includes('noreferrer')) {
        issues.push(`target="_blank" 缺少 rel="noopener"：${attrs.href.slice(0, 100)}`)
      }
    }
    if ((tag === 'a' || tag === 'button' || tag === 'summary') && !VOID_TAGS.has(tag)) {
      stack.push({ tag, attrs, text: '' })
    }
  }

  const detailsOpen = (html.match(/<details\b/gi) ?? []).length
  const detailsWithSummary = (html.match(/<details\b[^>]*>\s*<summary\b/gi) ?? []).length
  if (detailsOpen !== detailsWithSummary) {
    issues.push(`<details> 必须以 <summary> 作为首个元素（${detailsOpen} 个 details / ${detailsWithSummary} 个合规）`)
  }

  for (const { ref, value } of ariaRefs) {
    for (const id of value.split(/\s+/).filter(Boolean)) {
      if (!ids.has(id)) issues.push(`${ref} 指向不存在的 id："${id}"`)
    }
  }
  for (const id of dupIds) issues.push(`重复 id："${id}"`)

  if (h1 !== 1) issues.push(`<h1> 数量应为 1，实际 ${h1}`)
  if (headingLevels.length > 0 && headingLevels[0] !== 1) {
    issues.push(`第一个标题应为 <h1>，实际 <h${headingLevels[0]}>`)
  }
  for (let i = 1; i < headingLevels.length; i += 1) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) {
      issues.push(`标题层级跳跃：<h${headingLevels[i - 1]}> → <h${headingLevels[i]}>`)
    }
  }
  if (!lang.trim()) issues.push('<html> 缺少 lang')
  if (!viewport) issues.push('缺少 viewport meta')
  else if (!/width\s*=\s*device-width/i.test(viewport)) issues.push('viewport 缺少 width=device-width')
  if (lang.trim() && !/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/i.test(lang.trim())) {
    issues.push(`lang 不是合法 BCP 47 语言标签：${lang.trim()}`)
  }

  return { rel, issues }
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error(red('✘ dist/ 不存在，请先运行 pnpm build'))
    process.exit(1)
  }

  const files = walk(DIST)
  const rows = []
  for (const file of files) {
    const { rel, issues } = checkFile(file)
    if (issues.length > 0) rows.push({ rel, issues })
  }

  console.log(dim(`检查 ${files.length} 个 HTML 页面的无障碍与链接安全`))
  if (rows.length === 0) {
    console.log(green('✔ 无障碍 / 链接安全检查全部通过'))
    return
  }

  console.log(red(`✘ ${rows.length} 个页面存在问题：`))
  for (const { rel, issues } of rows.slice(0, 20)) {
    console.log(`\n  ${rel}`)
    for (const issue of issues.slice(0, 20)) console.log(`    - ${issue}`)
  }
  if (rows.length > 20) console.log(dim(`\n  …以及另外 ${rows.length - 20} 个页面`))
  process.exit(1)
}

main()
