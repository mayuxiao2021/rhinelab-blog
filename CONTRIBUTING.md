# 贡献与维护指南 / CONTRIBUTING

本文档面向维护本模板包的人（包括未来的自己）。目标：**任何一次改动都能被验证、可回滚、不破坏发布包**。

## 1. 环境

| 项 | 要求 | 说明 |
| --- | --- | --- |
| Node.js | ≥ 22（本项目在 v24 验证） | Astro 6 要求 |
| pnpm | 9.x | `packageManager` 固定；不要用 npm/yarn 混装 |
| 平台 | Windows / macOS / Linux | 本仓库在 Windows + MSYS Bash 下开发 |

> 本机开发时 `node_modules` 可能是指向其他项目的 junction。**junction 存在时不要运行 `pnpm remove/add --lockfile-only`**：pnpm 会因虚拟存储路径不一致而失败，或在临时目录重解析时把无关依赖（如 vite peer）解析到不同版本。

## 2. 常用命令

```bash
pnpm dev        # 本地开发（HMR）
pnpm check      # astro check（类型/模板诊断）
pnpm build      # 生产构建（含 OG/图标生成、Pagefind、产物优化）
pnpm verify     # 全链路门禁：check → selftest → 生成 → build → 各检查脚本
pnpm package    # 打包 release/rhinelab-blog-vX.Y.Z.zip + MANIFEST（含 sha256）
node scripts/bump.mjs 0.2.49   # 一键升级版本号（package/README/STATE/CHANGELOG 骨架）
node scripts/check-docs.mjs    # 文档/版本一致性检查（已含在 pnpm verify）
node scripts/generate-badge.mjs # 重新生成 docs/badge-version.svg（版本/迭代数徽章）
pnpm verify:release            # 校验 release/ 最新 zip 与 MANIFEST 的 sha256/文件数/必需文件
pnpm verify:fast               # 不重新构建，快速跑全部门禁（基于现有 dist）
```

`pnpm verify` 是**唯一验收标准**，必须 exit 0 才允许打包与交付。

## 3. 每轮迭代约定

1. 每轮至少完成 **1 个严重 bug 修复** 或 **1 个创新点/改进**；
2. 同步更新：
   - `ITERATIONS.md`（本轮问题、根因、修复、验证证据、下一轮候选）
   - `CHANGELOG.md`（用户可见变更）
   - `README.md` 版本号与「截图来自 vX」说明
   - `STATE.md`（版本、上一轮/下一轮、发布包路径）
   - `package.json` 版本号（0.x.y，每轮 +0.0.1）
3. 涉及界面/样式改动时：构建后用浏览器实测关键交互，并更新 `docs/screenshots/*.webp`；
4. 打包后**解压到临时目录**、建 junction、跑 `theme/selftest.mjs` + `pnpm build` + 各检查脚本，确认 zip 独立可用；
5. 清理临时目录与日志（`.tmp-*`、`.*.log`、`.shots/` 中间产物不需要进包）。

## 4. 门禁与检查脚本

| 脚本 | 检查内容 |
| --- | --- |
| `scripts/theme-selftest` → `theme/selftest.mjs` | 安装器/覆盖层自检（安装、卸载、别名改写、组件存在性） |
| `scripts/check-links.mjs --strict` | 站内断链、缺失静态资源 |
| `scripts/check-a11y.mjs` | 图片 alt、可访问名称、标题层级、lang/viewport、aria 引用、重复 id、iframe title |
| `scripts/check-contrast.mjs` | 亮/暗主题 16 组 WCAG AA 对比度 |
| `scripts/check-feed.mjs` | RSS 2.0 / JSON Feed 1.1 结构与字段 |
| `scripts/check-budget.mjs` | 总产物体积、JS/CSS/字体、单页 HTML 预算 |

新增检查项时：在对应脚本中实现，并在 `ITERATIONS.md` 记录首轮通过证据。

### 门禁清单单一数据源

`pnpm verify` 的 17 步与发布 2 步流程维护在 [`src/data/gates.json`](src/data/gates.json)：

- `/build-info.json` 的 `gates` 字段从它生成
- 制作说明页 `/colophon/` 的门禁流程从它渲染
- `check-seo` 校验构建产物与数据文件严格一致

调整门禁顺序或增减步骤时，先改 `gates.json`，再同步 `package.json` 的 `verify` 脚本，最后跑 `pnpm verify` 与 `pnpm check-docs`。

## 5. 依赖增删（重点）

### 新增依赖

```bash
pnpm add <pkg>            # 允许联网时
pnpm add -D <pkg>
pnpm verify               # 确认 lockfile 与构建同时正常
```

### 删除依赖（避免 lockfile 漂移）

1. 确认全仓库无引用：`grep -rn "<pkg>" src scripts astro.config.mjs`；
2. 优先 **手术式删除**：
   - `package.json` 删对应行；
   - `pnpm-lock.yaml` 删除 3 处：`importers` 下依赖条目、`packages:` 解析块、`snapshots:` 块；
3. 在临时目录校验：

   ```bash
   mkdir .tmp-lock && cp package.json pnpm-lock.yaml .tmp-lock/
   cd .tmp-lock && pnpm install --frozen-lockfile --lockfile-only --ignore-scripts
   ```

4. 若 `pnpm remove --lockfile-only` 产生**无关 diff**（其他包版本变化），回滚 lockfile，不要提交；
5. 更新 `docs/ASSETS.md` 的依赖表（标注「已从依赖中移除」及版本）。

## 6. 内容写作

文章位于 `src/content/posts/*.md`，frontmatter：

```yaml
---
title: 标题
published: 2026-11-18
updated: 2026-11-18      # 可选，会体现在 JSON-LD dateModified / Feed date_modified
description: 摘要
category: 分类名
tags: [标签A, 标签B]
series: 系列 slug        # 可选
---
```

> 修改 `remark`/`rehype` 插件后，**必须**清理 `.astro` 与 `node_modules/.astro`（content layer 缓存）再构建，否则字数、阅读时长等 frontmatter 不更新。

## 7. 发布

1. `pnpm verify` 通过；
2. 版本号 + 文档同步完成后 `pnpm package`；
3. 解压校验（selftest/frozen-lockfile/build/全部门禁）；
4. 更新 `STATE.md` 发布包行；对外交付 zip + 关键截图。

## 8. 素材与许可边界

- 只允许 MIT / OFL / Apache-2.0 / CC-BY 等可再分发素材；
- **不打包任何游戏版权素材**（名称/角色/图形/音频）；本站为同人风格致敬，图形全部自制 SVG/CSS；
- 新增第三方资源需登记到 `docs/ASSETS.md`（SPDX + 来源 + 用途）。
