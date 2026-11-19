#!/usr/bin/env node
/**
 * 新建文章：node scripts/new-post.js "标题" [slug]
 * 不传参数时生成一份占位文章，随后手动编辑。
 */
import fs from 'node:fs'
import path from 'node:path'

const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts')

const title = process.argv[2] || '未命名档案'
const slugArg = process.argv[3] || `x-${Date.now().toString(36)}`

const slug = slugArg
  .trim()
  .toLowerCase()
  .replace(/[^\p{L}\p{N}-]+/gu, '-')
  .replace(/^-+|-+$/g, '')

const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

const template = `---
title: '${title.replaceAll("'", "''")}'
published: ${date}
description: ''
tags: []
category: 机构档案
draft: true
---

在这里开始记录。

## 观测

## 结论
`

const file = path.join(POSTS_DIR, `${slug}.md`)
if (fs.existsSync(file)) {
  console.error(`已存在：${file}`)
  process.exit(1)
}
fs.mkdirSync(POSTS_DIR, { recursive: true })
fs.writeFileSync(file, template, 'utf8')
console.log(`已创建：${path.relative(process.cwd(), file)}`)
