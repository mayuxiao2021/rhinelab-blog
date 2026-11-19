---
title: '03 · 接口规范：把主题接到你自己的站点'
published: 2026-11-18
description: '三种接入方式：整站模板、样式覆盖层、单页试验。以及配置项、可改文件与不该动的边界。'
tags: [主题, 文档, 配置]
series: 建站日志
seriesOrder: 4
category: 机构档案
draft: false
---

这套主题有三种用法，按侵入性从低到高排列。

## 方式 A：整站模板（最省事）

直接复制整个仓库作为你的博客起点，改三处即可：

1. `src/config.ts`：站点名、作者、导航、友链；
2. `src/content/posts/`：换成你自己的文章；
3. `astro.config.mjs`：`site` 改成你的域名。

## 方式 B：样式覆盖层（接管现有 Fuwari）

适合你已经有站点、只想换皮的情况。核心只有两个文件：

```text
src/styles/rhinelab.css        ← 设计令牌 + 全部组件样式
src/components/rhine/*.astro   ← 徽标 / 首页封面（可选）
```

接入三步：

1. 复制 `src/styles/rhinelab.css`；
2. 在 `src/layouts/Layout.astro` 顶部加一行 `import '../styles/rhinelab.css'`；
3. 可选：把 `src/config.ts` 的 `themeColor.fixed` 设为 `true`，固定黄铜强调。

样式层通过覆盖 Fuwari 的 CSS 变量（`--primary`、`--card-bg`、`--radius-large` 等）生效，**不改组件逻辑**，因此可以随时回滚：删掉那一行 import 就恢复原样。

## 方式 C：单页试验

只想在某一页试风格？把 `rhinelab.css` 里的 `html:root { ... }` 令牌块复制到该页的 `<style is:global>` 里即可，其余规则按需取用。

## 配置项速查

| 字段 | 作用 | 建议 |
| --- | --- | --- |
| `siteConfig.title` | 站点名（导航与首页 H1） | 2–6 个汉字最稳 |
| `themeColor.fixed` | 是否隐藏访客调色按钮 | 本主题为 `true` |
| `banner.enable` | 是否使用图片横幅 | 默认 `false`，用 CSS 背景场 |
| `layoutConfig.sidebar` | 侧栏部件顺序 | `profile` 置顶，其余吸顶 |
| `profileConfig.avatar` | 头像路径 | 以 `/` 开头走 `public/` |

## 不该动的边界

- **不要**在 `src/styles/rhinelab.css` 里改 `--rl-*` 令牌以外的规则来"顺手修组件"——覆盖层要保持可丢弃；
- **不要**把 `custom-md` / `prose` 类从 `Markdown.astro` 上删掉，正文样式依赖它们；
- **不要**在 `Layout.astro` 里删除 `GlobalStyles`，Fuwari 的变量基线由它提供。

> 主题的本质是"一层可剥离的约定"。能一键摘掉，才配叫主题，而不是补丁。
