---
title: '02 · 实验复现：一条命令重建整座档案室'
published: 2026-11-14
updated: 2026-11-18
description: '从空目录到可部署产物：依赖安装、构建、检索索引、部署与三个常见翻车点的排查方法。'
tags: [Astro, 构建, 部署]
series: 建站日志
seriesOrder: 3
category: 工程研究
draft: false
---

本模板的验收标准只有一条：**别人 clone 之后，能复现出和你一样的站点**。下面是完整链路。

## 本地起步

```bash
pnpm install
pnpm dev        # http://localhost:4321
```

`pnpm dev` 是开发模式，**没有 Pagefind 索引**，搜索框会返回示例结果。这不是 bug。

## 构建与检索

```bash
pnpm build      # astro build && pagefind --site dist
pnpm preview    # 预览真实产物
```

构建脚本里 `pagefind --site dist` 不能省。只跑 `astro build` 得到的是没有搜索索引的站点——搜索框会静默失败，这是本主题 v0.1 修掉的第一个严重问题。

## 部署到 GitHub Pages

1. 改 `astro.config.mjs` 里的 `site` 为你自己的域名；
2. CI 用 Node 22 + pnpm，`pnpm install --frozen-lockfile && pnpm build`；
3. 产物目录是 `dist`；
4. 仓库 Settings → Pages → Source 选 GitHub Actions。

> 记住：**改了依赖就要提交 `pnpm-lock.yaml`**。否则 `--frozen-lockfile` 会在 CI 上直接失败，而本地毫无征兆。

## 三个常见翻车点

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 首页背景 404 | `banner.enable: true` 但 `public/banners/` 为空 | 关掉 banner，或用主题自带背景场 |
| 搜索无结果 | 只跑了 `astro build` | 跑完整 `pnpm build`（含 pagefind） |
| 中文标点排版怪 | 系统缺少中文字体回退 | 在字体栈里补 `Microsoft YaHei / PingFang SC / Noto Sans SC` |

## 验收清单

- [x] `pnpm build` 退出码 0
- [x] `dist/pagefind/` 存在
- [x] 亮色 / 暗色 / 移动端截图核对
- [x] 键盘 Tab 一圈，焦点环全部可见
- [x] `prefers-reduced-motion` 下无持续动画

复现不是"我这儿能跑"，而是"任何人按文档都能跑，且失败时有可读的错误"。
