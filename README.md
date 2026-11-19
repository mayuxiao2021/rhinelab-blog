# 莱茵档案 · Rhine Archive

> 一套《明日方舟》「莱茵生命」风格的 **Astro / Fuwari 博客模板包**：暖纸质档案美学、亮暗双模式、纯 CSS/SVG 图形、零游戏版权素材。
>
> 同人风格主题，与鹰角网络（Hypergryph）无关；代码 MIT。

[![Astro](https://img.shields.io/badge/Astro-6.x-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Fuwari](https://img.shields.io/badge/base-Fuwari%20(MIT)-blue)](https://github.com/saicaca/fuwari)
[![License](https://img.shields.io/badge/code-MIT-green)](LICENSE)
![rhinelab 版本与迭代数](docs/badge-version.svg)

**导航**：[预览](#预览) · [它是什么](#它是什么) · [快速开始](#快速开始) · [安装到现有博客](#把主题安装到现有-fuwari-博客) · [主题定制](docs/THEMING.md) · [设计说明](docs/DESIGN.md) · [部署](docs/DEPLOY.md) · [素材许可](docs/ASSETS.md) · [验收记录](docs/ACCEPTANCE.md) · [贡献指南](CONTRIBUTING.md) · [迭代记录](ITERATIONS.md)

## 运行时小组件（渐进增强）

站点有 5 个「构建后由浏览器补数据」的小组件，全部带 **8 秒超时**，失败自动降级、禁用 JS 不影响阅读：

- 统计页 **构建产物构成**（`/build-info.json`：9 类资产、TOP FILES、GENERATED 时间）
- 阅读器页 **订阅源体积**（RSS / JSON Feed / 摘要：体积、条目数、语言、最近更新）
- 站点索引 **机器入口状态**（9 个端点 `200 OK` 与 `9/9 OK` 汇总，可手动重新检查）
- 可访问性页 **动效偏好**（系统 reduced-motion 检测 + 一键预览）
- 制作说明 **LAST BUILD**（构建时间 / 文件数 / 体积）

细节见 [THEMING 5.3 运行时小组件与降级](docs/THEMING.md)；这些请求只访问本站静态文件，见[隐私与数据](https://example.com/privacy/)。

> 第 100 轮里程碑：完整交付概览、质量门禁与检查清单见 [docs/MILESTONE-100.md](docs/MILESTONE-100.md)；最终验收命令与实测结果见 [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)。

## 预览

### 演示站：莱茵生命 / RHINE LAB（v0.4.0）

> 下列截图来自真实构建产物。演示站额外加入 8 位干员立绘（非商业同人演示，素材版权归鹰角网络），
> 与模板核心分离：删除 `public/rhine/art/` 与 `src/pages/operators.astro` 即回到纯自制图形模板。

| 首页 · 亮色（含干员立绘） | 首页 · 暗色 |
| --- | --- |
| ![演示首页亮色](docs/screenshots/demo-home-light.webp) | ![演示首页暗色](docs/screenshots/demo-home-dark.webp) |

| 研究员名录 `/operators/` · 亮色 | 研究员名录 · 暗色 |
| --- | --- |
| ![研究员名录亮色](docs/screenshots/demo-operators-light.webp) | ![研究员名录暗色](docs/screenshots/demo-operators-dark.webp) |

| 移动端 · 首页 390px | 移动端 · 研究员名录 390px |
| --- | --- |
| ![移动端首页](docs/screenshots/demo-mobile-home.webp) | ![移动端名录](docs/screenshots/demo-mobile-operators.webp) |

### 归档与文章

| 首页 · 亮色 | 首页 · 暗色 |
| --- | --- |
| ![首页亮色](docs/screenshots/home-light.webp) | ![首页暗色](docs/screenshots/home-dark.webp) |

| 文章 · 暗色（含 Mermaid / KaTeX / 代码块） | 移动端 390px |
| --- | --- |
| ![文章暗色](docs/screenshots/post-dark.webp) | ![移动端](docs/screenshots/mobile-light.webp) |

| 文章目录（实验步骤） | 刻度导航进度轨（≥1440px） |
| --- | --- |
| ![目录](docs/screenshots/article-toc.webp) | ![刻度轨](docs/screenshots/tick-rail.webp) |

| 检索终端筛选（分类 / 标签） |
| --- |
| ![检索筛选](docs/screenshots/search-filters.webp) |

| 归档（h1 + 年份时间轴） | 项目索引 |
| --- | --- |
| ![归档](docs/screenshots/archive-light.webp) | ![项目索引](docs/screenshots/gallery-light.webp) |

| 文末相关档案推荐 | 档案统计（构建期计算） |
| --- | --- |
| ![相关档案](docs/screenshots/related.webp) | ![统计](docs/screenshots/stats.webp) |

| 构建期 OG 分享图（站点默认） | 构建期 OG 分享图（文章） |
| --- | --- |
| ![OG 默认](docs/screenshots/og-default.webp) | ![OG 文章](docs/screenshots/og-post.webp) |

| 上一篇 / 下一篇（自动计算） | 移动端导航面板 |
| --- | --- |
| ![上下篇](docs/screenshots/prev-next.webp) | ![移动端菜单](docs/screenshots/mobile-menu.webp) |

| 目录滚动高亮（当前小节） | 分类与标签总览 `/topics/` |
| --- | --- |
| ![目录高亮](docs/screenshots/toc-active.webp) | ![分类与标签](docs/screenshots/topics.webp) |

| 系列（SERIES）进度与当前条目 | 系列索引页 `/series/` |
| --- | --- |
| ![系列](docs/screenshots/series.webp) | ![系列索引](docs/screenshots/series-index.webp) |

| 档案时间线 `/timeline/` | 移动端时间线 |
| --- | --- |
| ![时间线](docs/screenshots/timeline.webp) | ![移动时间线](docs/screenshots/timeline-mobile.webp) |

![404](docs/screenshots/404-light.webp)

### 更多细节

| 检索无结果标签引导 | 检索关键词高亮 |
| --- | --- |
| ![检索引导](docs/screenshots/search-suggest.webp) | ![检索高亮](docs/screenshots/search-highlight.webp) |

| 检索历史与筛选 | 键盘快捷键浮层 |
| --- | --- |
| ![检索历史](docs/screenshots/search-history.webp) | ![快捷键浮层](docs/screenshots/shortcuts.webp) |

| 代码块「复制」与行号 | Mermaid 图表「复制源码」 |
| --- | --- |
| ![代码复制](docs/screenshots/code-copy.webp) | ![Mermaid 复制](docs/screenshots/mermaid-copy.webp) |

| 公式点击复制 LaTeX | 正文外链安全标记 |
| --- | --- |
| ![LaTeX 复制](docs/screenshots/latex-copy.webp) | ![外链标记](docs/screenshots/external-links.webp) |

| 返回顶部滚动进度环 | 打印样式（导出 PDF） |
| --- | --- |
| ![回顶进度环](docs/screenshots/back-to-top.webp) | ![打印样式](docs/screenshots/print.webp) |

| 站点索引 `/sitemap/` | 可访问性说明 `/accessibility/` |
| --- | --- |
| ![站点索引](docs/screenshots/sitemap.webp) | ![可访问性](docs/screenshots/accessibility.webp) |

| 版本沿革 `/changelog/` | 制作说明 `/colophon/` |
| --- | --- |
| ![版本沿革](docs/screenshots/changelog.webp) | ![制作说明](docs/screenshots/colophon.webp) |

| 移动端目录 | 移动端检索面板 |
| --- | --- |
| ![移动端目录](docs/screenshots/mobile-toc.webp) | ![移动端检索](docs/screenshots/search-mobile.webp) |

| 订阅页 `/subscribe/` | 阅读器兼容 `/readers/` |
| --- | --- |
| ![订阅页](docs/screenshots/subscribe.webp) | ![阅读器兼容](docs/screenshots/readers.webp) |

| 404 提示 | 隐私与数据 `/privacy/` | 自制版本徽章 |
| --- | --- | --- |
| ![404](docs/screenshots/404.webp) | ![隐私与数据](docs/screenshots/privacy.webp) | ![版本徽章](docs/screenshots/version-badge.webp) |

> 截图来自 v0.4.1 真实构建产物，无后期合成。

## 它是什么

- **一整站模板**：`pnpm install && pnpm dev` 就能跑的个人博客（本文档所在仓库）；
- **一层可剥离的主题**：`src/styles/rhinelab.css` + `src/components/rhine/*`，可覆盖到任意同版本 Fuwari 站点，删掉 import 即还原；
- **一个非商业演示站**：首页英雄区 + 设施图录 + `/operators/` 研究员名录，使用公开干员立绘素材（版权归鹰角网络，仅演示、不商用），见下方「许可与声明」。

## 一眼看懂设计

| 维度 | 取值 |
| --- | --- |
| 亮色 | 暖纸 `#eae5e1` / 墨 `#080a08` / 黄铜 `#9b7247` |
| 暗色 | 墨绿黑 `#11181b` / 纸面 `#202a2f` / 黄铜 `#c5a16b` |
| 字体 | JetBrains Mono（OFL，编号/微标签）+ Roboto（Apache-2.0，拉丁正文）+ 系统中文字体栈 |
| 母题 | 刻度族、发丝线、状态方点、检视角标、扫描环、`X-001` 编号、`EN / 中文` 双语标签 |
| 图形 | 100% CSS / SVG 自制（徽标、头像、封面水印、背景场、404） |

完整设计说明见 [docs/DESIGN.md](docs/DESIGN.md)，定制指南见 [docs/THEMING.md](docs/THEMING.md)，部署说明见 [docs/DEPLOY.md](docs/DEPLOY.md)，阅读器兼容见 [docs/READERS.md](docs/READERS.md)，素材与依赖许可见 [docs/ASSETS.md](docs/ASSETS.md)（含逐项 SPDX 许可表），维护/发布流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 键盘快捷键

| 按键 | 作用 |
| --- | --- |
| `/` | 聚焦站内检索 |
| `Esc` | 关闭检索面板 / 快捷键浮层 |
| `↑` / `↓` | 在检索结果间移动 |
| `Enter` | 打开选中的检索结果 |
| `Tab` | 首次跳到主内容（skip link） |
| `g` 后接 `h/a/t/s/r/b/c` | 首页 / 归档 / 时间线 / 统计 / 随机 / 订阅 / 制作说明 |
| `?` | 打开快捷键浮层 |
| `Ctrl/Cmd + P` | 使用打印样式导出 PDF |

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # 生成 OG 图 → astro build → pagefind 索引
pnpm check:links   # 站内链接 / 锚点 / 资源检查（--strict）
pnpm check:budget  # 产物体积预算（总产物/JS/CSS/字体/单页 HTML）
pnpm verify        # 全链路：类型检查 → 安装器自测 → OG → 构建 → 搜索索引 → 优化 → 链接 → 预算
pnpm preview
```

要求：**Node ≥ 22.12**、pnpm 9+。

## 字体与跨平台

- 西文正文：**Roboto**（Fontsource OFL，只打包 latin 子集）；等宽：**JetBrains Mono Variable**（OFL）；中文**不打包字体**，走系统字体栈：
  ```css
  --rl-sans: Roboto, "Segoe UI Variable Text", "Segoe UI", "PingFang SC",
             "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  ```
- Windows 走 Microsoft YaHei、macOS/iOS 走 PingFang SC、Linux 建议安装 `fonts-noto-cjk`；
- 需要完全一致的跨平台观感时，可自行用 Fontsource 引入 `@fontsource-variable/noto-sans-sc`（体积约数 MB，本模板默认不加，避免首屏变慢）；
- 构建 OG 图（`scripts/generate-og.mjs`）依赖构建机中文字体：Windows/macOS 自带，Linux CI 需 `fonts-noto-cjk`。

## 性能与体积

当前构建产物（`pnpm build` 后，含优化脚本）：

| 指标 | 体积 | 说明 |
| --- | --- | --- |
| dist 总产物 | ≈ 9.3 MB | 含示例文章、搜索索引与 2.4 MB 非商业演示立绘；删除 `public/rhine/art/` 后约 6.9 MB |
| JS 合计 | ≈ 3.6 MB | 大头是 Mermaid 各图表类型分块（按需加载） |
| CSS 合计 | ≈ 366 KB | Tailwind + 主题 + KaTeX + Fuwari |
| 字体（woff2） | ≈ 377 KB | Roboto 仅 latin 子集；中文走系统字体 |

- **Mermaid 按需加载**：`mermaid.core` 约 600 KB，flowchart 依赖约 0.8–2 MB（视图表类型），只有页面包含图表时才会下载；不需要图表可删除 `src/components/misc/Markdown.astro` 里的 Mermaid 初始化与 `mermaid` 依赖。
- **体积门禁**：`pnpm check:budget` 对总产物/JS/CSS/字体/单页 HTML 设预算，超出即失败；已接入 `pnpm verify`。
- **产物优化**：`scripts/optimize-dist.mjs` 会移除 `.woff/.ttf` 旧格式字体与未使用的 Pagefind UI 资源（约 1.2 MB）。
- **首屏字体**：Roboto latin-400 与 JetBrains Mono latin 通过 `<link rel="preload">` 提前加载。

## 目录结构

```text
src/
  components/
    rhine/            # 主题专属：徽标、首页档案封面
    ...               # Fuwari 原有组件（已按主题改造 5 个）
  styles/rhinelab.css # ★ 设计令牌 + 全部视觉规则（可移植）
  content/posts/      # 示例文章（5 篇，可整目录替换）
  data/operators.ts   # 演示站干员元数据（8 位，可替换/删除）
  pages/operators.astro # 研究员名录（演示页）
  config.ts           # 站点名、导航、作者、友链
astro.config.mjs      # 站点 URL、Markdown 管线、集成
public/rhine/         # 自制 SVG：徽标 / favicon / 头像
public/rhine/art/     # 演示立绘（非商业素材，可整目录删除）
docs/                 # 设计、定制、部署、素材许可
ITERATIONS.md         # 24h 迭代日志（每轮：严重 bug 或创新点）
theme/                # 可移植主题包 + 安装器（见 theme/README.md）
```

## 功能清单

- [x] Astro 6 Content Collections，文章 Markdown
- [x] Pagefind 静态全文检索 + 分类/标签筛选（构建期索引）
- [x] KaTeX 数学公式、Mermaid 图表、代码高亮与复制按钮
- [x] 阅读字数 / 预计阅读时间（构建期计算）
- [x] 亮 / 暗 / 跟随系统三态，无闪烁切换
- [x] Swup 无刷新页面过渡、图片 PhotoSwipe 灯箱
- [x] 文末「相关档案」推荐（同分类 + 共享标签打分）
- [x] 档案统计页 `/stats/`（条目/字数/阅读分钟/月度/分类/标签/最长条目，构建期计算）
- [x] RSS + JSON Feed 全文（Astro 渲染、MathML）+ 摘要版 `/feed-summary.json`（约 28% 体积）、订阅页 `/subscribe/`、Sitemap、robots.txt、SEO / JSON-LD（含 WebSite SearchAction）、构建期 OG 分享图（1200×630）
- [x] 归档（按年 / 分类 / 标签，语义 h1 + 统计头）、分页
- [x] 响应式（≥1440px 出现刻度进度轨）
- [x] 构建后站内链接 / 锚点 / 资源自检（`pnpm check:links --strict`）
- [x] 产物体积预算（dist ≈ 5.8MB，字体只发 woff2）
- [x] 文章上一篇 / 下一篇导航（自动计算，含可访问名称与单侧边界处理）
- [x] 系列（SERIES）：`series` / `seriesOrder` 字段、进度刻度与当前条目高亮、`/series/` 索引页
- [x] 档案时间线 `/timeline/`：按年份的刻度线、跨度统计、年份快捷跳转、移动端适配
- [x] 目录滚动高亮（当前小节 `▸` + `aria-current`，点击即时高亮）
- [x] 分类与标签总览 `/topics/`（分类占比 + 最近条目 + 加权标签云）
- [x] 打印样式：文章单栏白底、隐藏交互元素、代码块浅底、外链 URL 展开
- [x] 键盘快捷键：`/` 聚焦搜索、`Esc` 关闭、`g`+`h/a/t/s/r/b/c` 跳转、`?` 快捷键浮层
- [x] 子路径部署（`base`）兼容：canonical / OG / RSS / sitemap / 封面图全部正确带前缀
- [x] PWA：构建期 manifest 与应用图标（180/192/512，自制 SVG 栅格化）
- [x] 文章分享 / 引用复制 / MD 引用 / 打印 PDF（触屏系统分享、跨 Swup 事件委托）
- [x] 演示站：首页英雄区（双角色立绘 + 组织/设施/研究员区块）与 `/operators/` 研究员名录
- [x] 随机档案 `/random/`（随机跳转、`?no=1` 预览兜底）
- [x] 版本沿革页 `/changelog/`（构建期读取 CHANGELOG.md，版本锚点）
- [x] 统计页编目热力图（最近 365 天，5 级色阶 + 月份标签）
- [x] `prefers-contrast: more` 与 `forced-colors: active` 适配
- [x] `prefers-reduced-motion` 全量降级、键盘焦点可见、skip link、h1 语义、辅助色 AA

## GitHub Actions（CI）

仓库自带 [`.github/workflows/verify.yml`](.github/workflows/verify.yml)，在 `push` 到 `main` 或手动 `workflow_dispatch` 时运行：

1. `pnpm install --frozen-lockfile`
2. `pnpm check`（astro check，0 errors / 0 warnings / 0 hints）
3. `pnpm verify`（18 步门禁：链接、无障碍、对比度、feed、预算、静默 catch 等）
4. `pnpm test:subpath`（`/rhine-test/` 子路径回归）
5. `node scripts/package.mjs` + `verify-release --full --build`（解压包构建校验）
6. 上传 `dist/` 与 `release/*.zip` 为 artifact（保留 7 天）

本地等价强校验：

```bash
pnpm verify && pnpm test:subpath && node scripts/package.mjs && node scripts/verify-release.mjs --full --build
```

## 部署

1. 修改 `astro.config.mjs` 的 `site` 为你的域名；
2. `pnpm build`，产物在 `dist/`；
3. GitHub Pages / Vercel / 任意静态托管均可。

> 改依赖时务必一起提交 `pnpm-lock.yaml`，否则 CI 的 `--frozen-lockfile` 会直接失败。

## 主题包（可选）

只想给已有 Fuwari 站点换皮？见 [theme/README.md](theme/README.md)：

```bash
node theme/install.mjs --target ../my-blog --dry-run      # 预演
node theme/install.mjs --target ../my-blog --list         # 计划
node theme/install.mjs --target ../my-blog --with-components
node theme/install.mjs --target ../my-blog --verify       # 只验证
node theme/install.mjs --target ../my-blog --rollback     # 回滚
node theme/selftest.mjs                                   # 安装器自测
```

## 许可与声明

- 代码：**MIT**（见 [LICENSE](LICENSE)，保留 Fuwari / Astro 版权声明）
- 文章示例：CC BY-NC-SA 4.0
- 图形：全部自制，随代码 MIT
- **模板核心不含《明日方舟》官方素材**；演示站额外包含 8 位干员的公开立绘（来源 Aceship/Arknight-Images，版权归鹰角网络 Hypergryph，仅用于非商业同人演示，不随 MIT 代码许可授权）。商用或再分发前请按 [docs/ASSETS.md](docs/ASSETS.md) 3.1 的移除清单操作：删除 `public/rhine/art/`、`src/data/operators.ts`、`src/pages/operators.astro`，并移除首页演示区块（`src/pages/[...page].astro` 的 `rl-org`/`rl-field`/`rl-teaser`/`rl-banner`、`RhineHero.astro` 的 `rhine-hero__art`）与导航「研究员」入口。
- 「莱茵生命」相关名称与设定的权利归鹰角网络所有，本项目仅为个人非营利的同人风格创作。素材清单与替换清单见 [docs/ASSETS.md](docs/ASSETS.md)。

## 迭代状态

本项目以「每轮迭代至少修一个严重 bug 或加一个创新点」的方式持续开发：

- 当前版本 **v0.4.1**（`package.json`）
- 已完成：设计系统、首页档案封面、`X-001` 编号、Mermaid 档案配色、主题安装器、文章目录 + 刻度进度轨、亮/暗/移动端验收
- 下一轮：Astro 6 markdown 管线迁移、a11y 审计、体积优化
- 每一轮的问题、根因、修复与验证证据在 [ITERATIONS.md](ITERATIONS.md)；续跑状态在 [STATE.md](STATE.md)。

> `pnpm check` 已 **0 errors**（63 files），`pnpm build` 通过，`release/` 内为可独立构建的版本化 zip。
