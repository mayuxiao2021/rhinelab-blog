# Changelog

本项目的变更记录，遵循「每轮迭代至少修一个严重 bug 或加一个创新点」的节奏。

## [0.8.1] — 2026-11-19

### 交接文档 + Portal 源码归档

- 新增 `docs/AI-HANDOFF.md`：完整交接文档（三处部署拓扑、代码地图、启动/彩蛋实现、Bug 账本、部署 Runbook、预算余量、坑与下一轮路线），供下一个 AI 直接接手
- 新增 `portal/`：根域名 Portal 的可编辑源码镜像 + `portal/README.md` 发布说明（真正部署仍在用户站 `portal` 分支）
- 修正 `STATE.md` 中过期的本轮描述/包文件数/预算数字
- README 导航加入「AI 交接文档」


## [0.8.0] — 2026-11-19

### 莱茵生命主题细节补完（Portal + 引导页 + 全站彩蛋）

- **根域名 Portal 重做**：标题改为「莱茵生命 · 档案入口」，加入 `TRIMONT · COLUMBIA / OBSERVER-07` 品牌行、SECTOR-03 本地时钟、三格遥测读数（来源 / 结构稳定度 / 档案总量，带动态仪表条）、STRUCTURE / DEFENSE & CLINICAL / ECOLOGY & FIELD 跑马灯、标本标签与 RL 档案编号、hover 扫描线、条形码页脚
- **`/start/` 引导页同步**：遥测（文章 / 干员 / 分类与标签）、跑马灯、卡片编号与 SPECIMEN 标签、hover 扫光、本地时钟
- **隐藏彩蛋**：在 Portal 或博客任意页面输入 `rhine`，唤起 `ACCESS GRANTED // DIAGNOSTIC` 浮层（OBSERVER-07、ARCHIVE SYNC、结构/防卫/生态 OK），12 秒自动关闭，支持点击/Esc，`prefers-reduced-motion` 跳过；页脚与 Portal 有 `HINT / 输入 rhine` 提示
- 首页英雄区坐标加入 `TRIMONT · COLUMBIA`；页脚增加提示与 `rl-footer__hint`
- 亮暗双主题下全部细节均有配色（Portal 独立静态页也支持亮暗切换）

### 验收

- `pnpm verify` 18 步全绿（49 页 / 47 SEO / 3034 链接 / 79 图带尺寸 / 预算 92%，CSS 95%、单页 94%）。

## [0.7.0] — 2026-11-19

### 根域名改为「选择界面」Portal

- 根域名 <https://github.glmyx.eu.org/> 现在展示选择界面：莱茵档案（带启动动画）/ 研究员名录 / 旧版博客；自包含单页（内联 CSS/JS），支持亮暗切换、启动动画开关（与博客共用 `rhine-boot-enabled`）、动态读取博客版本号
- 新博客保持在 <https://github.glmyx.eu.org/rhinelab-blog/>，`/start/` 内置引导页同步把「旧版博客」指向 `/legacy-blog/`
- 旧版 Fuwari 博客完整归档到新仓库 `mayuxiao2021/legacy-blog`，以 `BASE_PATH=/legacy-blog/` 构建并部署到 `/legacy-blog/`；源码与未提交改动一并保存，`mayuxiao2021.github.io` 的 `master` 源分支保持不动
- 用户站仓库 `mayuxiao2021.github.io` 新增 `portal` 分支作为 Pages 源（`build_type: legacy`），只含 Portal 页面，可随时切回 `master` 或旧工作流

### 部署过程中修复

- 切换 Pages 源时 API 会清空 `cname`（自定义域名脱离，根域名 404）→ 重新提交 `cname: github.glmyx.eu.org` 并手动触发 `pages/builds` 恢复
- 旧博客以子路径构建需要 base 支持 → 归档仓库 `astro.config.mjs` 改为 `base: process.env.BASE_PATH || "/"`，构建产物资源全部带 `/legacy-blog/` 前缀

## [0.6.0] — 2026-11-19

### 界面引导页 + 莱茵启动动画

- 新增 `/start/` 设计：三种界面入口卡片（莱茵档案 / 研究员名录 / 旧版 Fuwari 博客），带 CSS mock 预览、启动动画开关与重播入口；导航新增「入口」，页脚、关于页与站点索引同步收录
- 新增莱茵启动序列 `RhineBoot.astro`：全屏终端式 boot（旋转徽记、逐行加载、进度条、跳过），支持 `?intro=1`、首次进入播放、`rhine-boot-enabled` 开关、`prefers-reduced-motion` 直接跳过；`?bootdebug=1` 保留 30s 便于验收截图
- 首页英雄区加入分层入场动画（back/mid/front 立绘 + 内容 + 斜向扫光），移动端与 reduced-motion 自动降级
- 修复：`/start/` 是独立 Layout，进出该页与 Swup 容器结构不兼容 → 导航/页脚/卡片链接加 `data-no-swup` 强制整页加载
- 修复：`check-links` 未剥离查询串，`/?intro=1` 被误判为断链（B72）
- 修复：`/start/` 缺少 `#swup-container` 导致 skip link 锚点失效

### 文档 / 门禁

- 新增 4 张截图（引导亮/暗、启动序列、移动端引导），更新 README 预览与体积表
- `pnpm verify` 18 步、`pnpm test:subpath` 全绿：49 HTML 页 / 47 SEO 页 / 3034 链接 0 断链 / 79 张图带尺寸 / 预算 92%

## [0.5.0] — 2026-11-19

### 作者博客完整迁移（黯）

- 站点身份切换为「黯」：标题、头像、简介、社交链接、项目页与关于页均为作者真实内容
- 迁移 7 篇文章（2 篇安全研究长文 + 5 篇示例/指南）到模板内容集合；关于页读取作者 `about.md`，友链替换为作者友链
- 复制作者静态资源：头像、banners、favicon、项目预览图与友链小游戏页面（EatKun / EatKano / jump play）
- 站点 URL 切到 <https://github.glmyx.eu.org/rhinelab-blog/>，Pages workflow 同步 `SITE_URL`

### 迁移中修复的 bug

- **B67** 友链内部链接未带 `BASE_PATH`，子路径部署下 404 → `Links.astro` 用 `url()` 补前缀
- **B68** 嵌套文章 `guide/index.md` 的 OG 图路径不一致（生成 `guide-index.png`，页面找 `guide.png`）
- **B69** 摘要 feed 的 `content_text` 在实体解码后才剥标签，导致转义 iframe 残留可执行标签
- **B70** 第三方静态页被 astro-compress 压缩报错 → 增加 `Exclude` 过滤
- **B71** 公共封面图缺少 width/height、第三方小游戏 `<img>` 缺尺寸 → ImageWrapper 补默认尺寸 / 页面补属性
- 无障碍：文章内 H1 与页面标题重复、iframe 缺 title、外链缺 `rel=noopener`、静态页缺 `lang` / 重复 id / 图片缺 alt
- SEO：第三方静态页不应伪造 canonical/OG → check-seo 排除；关于页 description 加长
- 预算按真实博客调整为 12.5 MB / 单页 160 KB；移除重复文章标题锚点；页脚与隐私页素材声明改为准确表述

## [0.4.2] — 2026-11-19

### 公开 + GitHub Pages

- 仓库转为公开：<https://github.com/mayuxiao2021/rhinelab-blog>
- 新增 `pages.yml`：`BASE_PATH=/rhinelab-blog/` 构建 + Actions 部署到 GitHub Pages
- 在线演示：<https://mayuxiao2021.github.io/rhinelab-blog/>（备用域 <https://github.glmyx.eu.org/rhinelab-blog/>）
- README 增加 verify / pages 徽章与在线演示入口；仓库 homepage 指向 Pages
- 修复 `bump.mjs` 迭代号替换范围（只改「阶段 / 本轮」行，不再误伤 STATE 历史摘要）


## [0.4.1] — 2026-11-19

### CI / GitHub Actions

- 新增 `.github/workflows/verify.yml`：push / workflow_dispatch 触发，跑 18 步 verify + 子路径回归 + 打包 + 解压包构建校验，并上传 dist / zip 产物
- **B64**：`verify-release.mjs` 只传 `--full/--build` 时把 `--full` 误当版本号 → 支持无版本参数（自动取最新 zip）
- **B65**：Linux 下 zip 相关命令不兼容：`tar -tf` 无法列 zip、`zip -r .` 归档无根目录；改为 unzip → python3 → bsdtar 回退，并统一归档根目录 + 条目归一化
- GitHub Actions 连续两轮（push + workflow_dispatch）全绿，第 5 轮起稳定通过并上传 artifact

## [0.4.0] — 2026-11-19

### 演示站（非商业同人素材）

- 新增 `/operators/` 研究员名录：8 位莱茵生命干员档案卡 + 三幅重点立绘 + 素材声明
- 首页重做：双角色英雄区（缪尔赛思 / 塞雷娅）+ 组织概览 + 设施图录 + 研究员预览 + 引用横幅
- 引入 16 张公开干员立绘（Aceship/Arknight-Images，版权归鹰角网络，仅非商业演示；见 `docs/ASSETS.md` 3.1）
- 导航新增「研究员」；移动端英雄区/名录页重新排版
- 修复：`astro-compress` 的 `Image` 通道会重编码 WebP 导致产物从 9.3MB 膨胀到 17.3MB → 关闭该通道（图片已在生成阶段手工压缩）
- 体积预算按演示素材调整为 10.6MB / 单页 120KB；`check-budget` 新增图片尺寸检查

### 工程

- 新增 `src/data/operators.ts`、`src/pages/operators.astro`；`RhineHero.astro` 与首页区块重构
- `verify-release --full --build` 仍通过：解压包可直接 `astro build`

## [0.3.20] — 2026-11-18

### 新增

- `check-seo` 增加 meta description 与 og:title 唯一性校验（38 页实测 0 重复）
- 更新验收记录与徽章到 v0.3.20 / 132 条迭代记录

## [0.3.19] — 2026-11-18

### 验证

- 浏览器冒烟巡检（stats / 404 / 文章 02 / 版本沿革）：0 失败资源、0 破图、单一 h1；文章 2 段 JSON-LD + TOC + 外链 rel；404 `noindex, follow` + 9 个可操作链接；沿革过滤 28/129 + 47 处高亮
- 截图更新 `stats.webp`、`404.webp`

## [0.3.18] — 2026-11-18

### 交付确认

- 验收记录 `docs/ACCEPTANCE.md` 更新到 v0.3.18：236 文件、预算 97%、单页 106KB、129 条迭代记录
- 最终复验：18 步 verify + 子路径回归 + 解压包 astro build + 构建后链接检查全部通过

## [0.3.17] — 2026-11-18

### 新增

- `check-seo` 将每页 feed 自动发现地址与 `rss.xml` 自引用、`feed.json` 的 `feed_url` 对齐校验
- README 导航与里程碑提示加入验收记录 `docs/ACCEPTANCE.md` 入口

## [0.3.16] — 2026-11-18

### 新增

- `docs/ACCEPTANCE.md` 验收记录：交付物、验收命令、实测结果、已知限制与复现提示
- `check-docs` / `verify-release` 将验收记录纳入必需文档

## [0.3.15] — 2026-11-18

### 新增

- `check-feed` 校验 RSS `atom:link rel=self` 绝对地址 / 路径 / 与 channel link 同源
- `check-feed` 校验 JSON Feed `feed_url` 路径与 `home_page_url` 尾斜杠

## [0.3.14] — 2026-11-18

### 新增

- `check-seo` 校验每页 RSS / JSON Feed 自动发现：各一条、绝对地址、目标文件存在
- `check-seo` 校验 JSON-LD `inLanguage` 与 `<html lang>` 一致
- 迭代内修复 `localAsset` 声明位置（提前到页面循环之前，避免 TDZ）

## [0.3.13] — 2026-11-18

### 修复 / 改进

- **B63**：文章 98 的内嵌头像 `<img>` 缺 width/height（41 张图中唯一一张）→ 改为带尺寸的 HTML img
- `ImageWrapper` 支持可选 `width/height`，作者头像补 480×480
- `check-budget` 新增「图片尺寸」检查：`<img>` 必须带 width/height（41 张全部通过）
- 记录浏览器运行时指标：FCP 164ms、load 320ms、44 资源 / 255KB、DOM 632 节点

## [0.3.12] — 2026-11-18

### 新增

- `verify-release --build`：解压发布包后复用本机 `node_modules` 跑一次 `astro build`，并对构建产物执行 `check-links --strict`，证明「zip 解压即可构建」
- 新增脚本 `verify:release:build`；MILESTONE / DEPLOY 补强校验说明
- 修复 astro CLI 路径（`bin/astro.mjs`）

## [0.3.11] — 2026-11-18

### 收尾

- STATE 收尾：里程碑后迭代摘要更新到 100–120、候选/已知问题改写为最终口径
- `check-docs` 新增「STATE 必须引用当前发布包路径」门禁

## [0.3.10] — 2026-11-18

### 最终验收

- 全量子路径回归（`pnpm test:subpath`）：build + check-links + check-seo + check-feed 全部通过，并恢复默认构建
- 18 步 `pnpm verify` 全绿（38 页 / 221 产物 / 预算 97%）
- 发布包 `rhinelab-blog-v0.3.10.zip` 通过 `verify-release --full`（MANIFEST 一致、解压包自测、文档门禁）
- STATE / MILESTONE / CHANGELOG / ITERATIONS 全部与 v0.3.10 同步

## [0.3.9] — 2026-11-18

### 新增

- `check-seo` 校验每页前 1024 字节内存在 UTF-8 charset 声明（编码声明时机）
- `check-seo` 校验 `og:locale` 与 `<html lang>` 归一化后一致（zh_CN ↔ zh-CN）

## [0.3.8] — 2026-11-19

### 新增

- `check-docs` 新增 STATE.md 同步门禁：必须含版本、最新 `Iteration N`、`阶段：**…**` 状态行
- `check-docs` 校验 `gates.json`（18 步）与 `package.json` 实际 `verify` 链一一对应（数量 + 每步 token）
- STATE.md 刷新为交付状态（v0.3.8 / Iteration 118 / 指标 / 里程碑后迭代摘要）
- `bump.mjs` 容错：目标文本已是新版本时跳过替换，避免半更新卡住

## [0.3.7] — 2026-11-18

### 改进

- `check-a11y` 强化：viewport 必须含 `width=device-width`、`lang` 校验 BCP 47 形式、`aria-pressed/selected/checked` 取值校验（checked 允许 mixed）
- 无障碍 fixture 自测从 7 类提示扩到 9 类；单页问题打印上限 8 → 20，避免新规则命中被截断后自测误判
- MILESTONE-100 门禁脚本数量同步为 17 个

## [0.3.6] — 2026-11-18

### 新增

- 新增 `scripts/check-catch.mjs` 静默 catch 门禁（禁止无注释空 catch，17 个脚本 5 处有注释允许）
- `pnpm verify` 增至 **18 步**；gates.json 增加 `scripts` 路径清单并由 check-docs 校验存在
- 制作说明门禁流程与 build-info `gates` 自动变为 18 + 2 = 20 步

## [0.3.5] — 2026-11-18

### 新增

- `check-docs` 校验 `package.json` 中所有 `node scripts/*` 引用真实存在（防重命名后门禁静默失效）
- `verify-release` 必需文件新增 `docs/MILESTONE-100.md` 与 `docs/READERS.md`
- 审计脚本内 `catch {}` 兜底：均为解码/规范化/zip 回退等预期回退，无静默吞错

## [0.3.4] — 2026-11-18

### 修复

- **B61**：`check-seo` 的 `basePrefix` 声明位置在推导代码之后，赋值触发 TDZ 被 try/catch 吞掉，导致子路径部署时全部页面被误判 `data-base 与部署 base 不一致`；前移声明后子路径回归恢复全绿

### 新增

- OpenSearch 增加 `<Tags>` 关键词，`check-seo` 校验其存在
- 全量子路径回归（`pnpm test:subpath`）：build + check-links + check-seo + check-feed + 恢复默认构建全部通过

## [0.3.3] — 2026-11-18

### 新增

- OpenSearch 增加 Image（192×192 站点图标）、Contact（维护者链接）与 Language 字段
- `check-seo` 校验 OpenSearch ShortName / Language / Image（绝对地址 + 产物存在）/ Contact
- `check-seo` 校验每页 `html[data-base]` 与部署 base 一致（子路径部署的 JS 路径安全）

## [0.3.2] — 2026-11-18

### 新增

- `check-seo` 校验 Web App Manifest（字段 / 图标尺寸与文件 / 5 个快捷方式页面与图标）
- `check-seo` 校验 OpenSearch（searchTerms 占位符、绝对地址）与每页 `theme-color`（#RRGGBB）/`color-scheme`

## [0.3.1] — 2026-11-18

### 修复 / 新增

- **B60**：`twitter:url` 误用 `property` 属性（部分爬虫只认 `name`）→ 改为 `name="twitter:url"`
- `check-seo` 新增 Twitter Card 校验：card 类型、title/description/url/image 存在、与 OG 同源、绝对地址
- 版本沿革命中标题加 2px 黄铜 focus outline（offset 4px）
- THEMING 增加运行时小组件失败排查清单（5 步）

## [0.3.0] — 2026-11-18

### 新增

- 版本沿革过滤按 Enter 跳转后聚焦首个命中标题（`tabindex=-1`，屏幕阅读器可继续阅读该版本）
- `check-seo` 新增 `og:url` 存在 / 绝对地址 / 与 canonical 一致性校验
- THEMING 补充机器状态重试参数（`data-retry-count` / `data-retry-delay`）说明

> 0.3.0：交互与门禁细节打磨完成的一个小版本节点。

## [0.2.99] — 2026-11-18

### 新增

- 机器状态重试次数/间隔可配置（`data-retry-count` / `data-retry-delay`，每次检查重新读取）
- 阅读器「复制全部命令」带注释头（`# Rhine Archive · feed check commands`）
- 版本沿革过滤按 Enter 平滑跳转到首个命中版本

## [0.2.98] — 2026-11-18

### 新增

- 项目索引首张预览图 `loading="eager"` + `fetchpriority="high"`，其余仍 lazy
- 阅读器页「复制全部命令」（三条 curl 一次复制）
- 站点索引机器状态失败自动重试一次（700ms 后），并修复重试路径完成计数不递增导致汇总卡在 `CHECKING…` 的 bug
- 单页 HTML 预算按版本沿革页增长校准：96KB → 112KB（示例站 106 个版本约 96.4KB；总量预算不变）

## [0.2.97] — 2026-11-18

### 改进

- 版本沿革过滤在省略高亮时明确提示「· 已省略高亮」（含 title 说明）
- 项目索引两张预览图补齐 `width/height`（640×400），降低 CLS

## [0.2.96] — 2026-11-18

### 新增

- 关于页过滤支持命中高亮（与版本沿革页一致）
- 版本沿革高亮加安全上限：匹配版本 > 40 或高亮节点 > 300 时只过滤不高亮，避免超大匹配卡顿
- 制作说明注明门禁清单来源 `src/data/gates.json`

## [0.2.95] — 2026-11-18

### 新增

- 版本沿革页过滤支持**命中词高亮**（`<mark>` 黄铜底），清空后完全还原
- CONTRIBUTING 新增「门禁清单单一数据源」小节（`src/data/gates.json`）
- 制作说明门禁说明注明数据来源文件

## [0.2.94] — 2026-11-18

### 改进

- 门禁列表抽取为 `src/data/gates.json` 单一数据源：build-info `gates` 与制作说明门禁流程共用，避免两处维护
- 制作说明显示「17 步 verify + 2 步 release，全链路 19 步」
- `check-seo` 校验 build-info `gates` 与 `src/data/gates.json` 完全一致

## [0.2.93] — 2026-11-18

### 新增

- `/build-info.json` 增加 `gates`（17 条门禁名称，机器可读）
- `check-seo` 校验 `og:description` 非空、≤200 且与 meta description 一致；校验 build-info gates 列表
- 制作说明 LAST BUILD 显示门禁数量（17 GATES）

## [0.2.92] — 2026-11-18

### 改进

- `check-seo` 标题上限 80 → 60、description 下限 20 → 30（更接近搜索摘要最佳区间）
- 9 个页面的 description 补写到 30 字以上（分类 / 分类标签 / 可访问性 / 沿革 / 制作说明 / 站点索引 / 时间线 / 阅读器 / 系列）
- `bump.mjs` 同步 `docs/MILESTONE-100.md` 的版本号，避免里程碑文档版本落后

## [0.2.91] — 2026-11-18

### 修复

- **B56**：13 个页面 meta description 过短（about 2 字、归档 9 字、标签 19 字、gallery 10 字、统计 19 字等）→ 全部改写为 20–200 字的有效摘要

### 新增

- `check-seo` 新增标题长度 ≤80、description 20–200 字符检查
- `check-docs` 校验 `docs/MILESTONE-100.md` 存在、版本同步与章节完整
- 统计页 `MILESTONE 100` 徽标链接到版本沿革对应锚点

## [0.2.90] — 2026-11-18

### 里程碑（第 100 轮）

- 新增 `docs/MILESTONE-100.md`：交付物、站点规模、门禁链、检查清单与已知限制
- 统计页显示迭代数并在 ≥100 轮时展示 `MILESTONE 100` 徽标
- README 顶部链接里程碑概览
- 全量回归：`pnpm verify` + `pnpm test:subpath` + `verify-release --full`

### 修复

- **B55**：`check-feed` 的 RSS `<image>` 产物存在性校验未剥离 `BASE_PATH`，子路径部署回归时会误报；已与其它门禁一致支持 base 前缀

## [0.2.89] — 2026-11-18

### 新增

- `check-a11y` 规则增至 17 条：`aria-expanded` 必须配 `aria-controls`、`<details>` 首个元素必须是 `<summary>`
- 新增 `scripts/check-a11y-selftest.mjs`：用违规/合规 fixture 验证规则生效，已接入 `pnpm verify`

## [0.2.88] — 2026-11-18

### 新增

- `check-a11y` 新增两条规则：`aria-expanded/pressed/checked/selected` 取值合法、`<summary>` 必须有可访问名称（共 15 条）
- README 运行时组件章节补充隐私页链接

## [0.2.87] — 2026-11-18

### 新增

- `check-a11y` 新增 3 条静态规则：aria-live 与 aria-hidden 冲突、可聚焦元素 aria-hidden、role="img" 命名
- 可访问性页新增「运行时小组件」无障碍说明（aria-live / disabled / 8 秒超时降级）
- 隐私页新增运行时 GET 行为与 `FETCH / SAME-ORIGIN` 声明

## [0.2.86] — 2026-11-18

### 修复

- **加载态过早恢复**：阅读器刷新按钮原先固定 1.2s 后恢复，慢网下请求未完成按钮已可点；改为 `Promise.allSettled` 等全部请求结束再恢复
- 站点索引「重新检查」在检查期间禁用，完成后恢复

### 文档

- README 新增「运行时小组件（渐进增强）」章节（5 个组件、8 秒超时、降级策略）

## [0.2.85] — 2026-11-18

### 新增 / 文档

- 统计卡显示 `GENERATED` 构建时间；刷新按钮带「刷新中…」禁用态
- 机器状态检查时间带日期（`9/9 OK · 11-19 03:16`）
- THEMING 新增「运行时小组件与降级」表（5 个数据小组件、8 秒超时、渐进增强）

## [0.2.84] — 2026-11-18

### 新增

- 统计「构建产物构成」与阅读器「订阅源体积」均加「刷新」按钮（重跑 fetch，8s 超时）
- 可访问性页「预览减少动效」开关：一键套用 reduced-motion 压制规则（实测 transitionDuration 1e-05s）
- 站点索引机器状态显示上次检查时间（如 `9/9 OK · 03:06`）

## [0.2.83] — 2026-11-18

### 修复 / 新增

- 修复：所有运行时 fetch 组件（统计/阅读器/制作说明/站点索引）加 8 秒 AbortController 超时，慢网不再永久 CHECKING
- 站点索引机器状态新增「重新检查」按钮
- 制作说明 LAST BUILD 标注「本地时间」

## [0.2.82] — 2026-11-18

### 新增

- 可访问性页实时显示系统动效偏好（matchMedia，减少/标准两态）
- 站点索引机器入口总览 `9/9 OK`、失败排查提示与 noscript 说明
- 制作说明页显示最近构建时间 / 文件数 / 体积（读取 build-info.json）

## [0.2.81] — 2026-11-18

### 新增

- 可访问性页「MOTION / 减少动效」说明区（全局兜底 / 组件规则 / DevTools 复验步骤）
- 站点索引机器入口增加实时状态与体积（9 条全部 `200 OK`）

## [0.2.80] — 2026-11-18

### 修复 / 改进

- **可访问性**：新增全局 `prefers-reduced-motion` 兜底，压制所有动画/过渡与平滑滚动（含第三方组件）
- 统计页补充 Mermaid / KaTeX 异步 chunk 说明（首屏不加载）
- 可访问性页静态门禁清单补上 `check-seo.mjs`（8 条）

## [0.2.79] — 2026-11-18

### 新增

- 关于页过滤支持 `?q=` 状态同步与刷新恢复
- build-info 增加 `assets.largest` Top 5 最大文件；统计页展示文件名、体积与占比

## [0.2.78] — 2026-11-18

### 新增

- 阅读器页订阅源显示语言与最近更新（如 `RSS 47.9KB · 6 ITEMS · zh-CN · 今天更新`）
- 关于页站点导航新增过滤框（13 个入口，支持多关键词、清除按钮与 Esc）

## [0.2.77] — 2026-11-18

### 新增

- `stats.json` 增加 `build` 版本字段；`check-seo` 校验其与 package 一致
- 阅读器页订阅源显示条目数与最近更新日期（如 `RSS 47.9KB · 6 ITEMS · 2026.11.18`）

## [0.2.76] — 2026-11-18

### 新增

- 统计页「构建产物构成」卡：读取 `/build-info.json` 渲染 9 类资产条形与占比
- 阅读器页显示三种订阅源实时体积（RSS / JSON Feed / 摘要）
- `check-seo` 校验 feeds `_site.build` 与 package 版本一致、build-info 含 `byType`

## [0.2.75] — 2026-11-18

### 新增

- 版本沿革过滤新增「清除 / CLEAR」按钮与 Esc 快捷键；`?q=` 恢复时按钮正确显示
- `/build-info.json` assets 增加 `byType` 分类体积（html/js/css/woff2/png/svg/json/xml/webp/other）
- JSON Feed 与摘要版 `_site.build` 携带构建版本；`check-feed` 校验语义化版本

## [0.2.74] — 2026-11-18

### 新增

- 版本沿革过滤支持多关键词（空格分隔，AND 语义）与 `?q=` 状态同步/恢复
- RSS channel 增加 `<image>`（192×192 站点图标），阅读器可显示站点品牌
- `check-feed` 校验 RSS `<image>` 绝对地址、产物存在与 `<title>`

## [0.2.73] — 2026-11-18

### 新增

- 版本沿革页顶部过滤框：按版本号/关键词过滤全部 83 个版本（含折叠区），显示匹配数、空状态，命中折叠区自动展开
- 折叠摘要显示版本范围「v0.1.0 – v0.2.66（77）」

## [0.2.72] — 2026-11-18

### 新增

- 版本沿革页最近 6 个版本可见、更早 76 个版本折叠（页面高度 19,659px → 1,936px）
- 旧版本锚点 `#v0-2-1` 直达时自动展开折叠区
- 折叠后恢复全页截图（此前超 WebP 16,383px 上限）

## [0.2.71] — 2026-11-18

### 新增

- `/build-info.json` 增加产物体积统计（files / bytes，由 optimize-dist 写回）
- `check-seo` 校验 build-info 版本/迭代数与仓库一致、构建时间合法、体积统计存在
- 版本沿革页头增加 `MACHINE / build-info.json` 机器入口

## [0.2.70] — 2026-11-18

### 新增

- `/build-info.json` 构建指纹（版本 / 迭代数 / 构建时间 / 站点）
- 制作说明页构建行显示当前版本与迭代数（80 ITER）
- `check-seo` 校验 `og:image:alt` 非空

## [0.2.69] — 2026-11-18

### 新增

- PWA 第 5 个快捷方式「阅读器」（自制图标 96/192 + manifest）
- `check-budget` 增加 OG 图片合计预算（260KB，当前 158.7KB / 61%）
- 阅读器页三条验证命令（RSS / JSON Feed / Sitemap）一键复制

## [0.2.68] — 2026-11-18

### 新增

- `pnpm test:subpath` 子路径部署自动化验证（构建 → 三门禁 → 恢复默认）
- `check-seo` 增加 OG 图体积上限（≤80KB）
- 阅读器页新增 curl 验证命令与一键复制（绝对 URL）

### 修复

- 通用复制按钮把命令文本误当 URL 转换 → 仅对路径/URL 做绝对化

## [0.2.67] — 2026-11-18

### 新增

- `SITE_URL` / `BASE_PATH` 环境变量：支持子路径部署（canonical / sitemap / feed / 资源均带前缀）
- sitemap 分类/标签页 lastmod 细化为该分类/标签下最新文章日期
- `check-links` / `check-seo` 支持 `BASE_PATH`，子路径构建可完整校验
- DEPLOY 文档补充子路径部署与校验步骤

## [0.2.66] — 2026-11-18

### 新增

- sitemap 每条 URL 补齐 `lastmod`（文章按 updated/published，其余页面用最新内容日期；36 条全部合法）
- `check-seo` 扩展：OG 图 PNG 尺寸 1200×630 校验、canonical 支持子路径 base 前缀、sitemap lastmod 完整性校验

## [0.2.65] — 2026-11-18

### 增强

- `check-seo` 扩展：canonical 与页面路径一致性、全站 canonical 单一站点源、`og:image` 绝对地址与文件存在、JSON-LD `dateModified ≥ datePublished`
- 移动端扩展抽检：gallery / timeline / about / series / readers / privacy 六页 390px 无横向溢出

## [0.2.64] — 2026-11-18

### 修复

- **严重**：15 个分类/标签归档页共用同一标题「归档 - 莱茵档案」（SEO 重复标题）→ 全部分配唯一标题与描述
- 分类/标签/未分类页标题去掉重复的站点名后缀

### 新增

- `scripts/check-seo.mjs` SEO 门禁：标题唯一、meta description、canonical 绝对地址、JSON-LD 结构；已纳入 `pnpm verify`
- 移动端 390px 复核（readers / privacy / stats / sitemap 无横向溢出）

## [0.2.63] — 2026-11-18

### 优化

- `optimize-dist` 清理 `_astro` 孤儿资源（108.4KB 历史残留头像），总产物 6777 → 6670KB（98% → 96%）
- 通用复制按钮支持 `data-rl-copy-label`（站点索引 / 阅读器页提示语区分）

### 新增

- 隐私页绑定最近审查日期与构建版本
- 站点索引机器入口增加 8 个「复制链接」按钮

## [0.2.62] — 2026-11-18

### 新增

- 站内「隐私与数据」页 `/privacy/`：无追踪/无 Cookie 声明、4 项 localStorage 清单、第三方与同人素材边界
- 阅读器页三个订阅源支持「一键复制订阅地址」（toast + 复制态）
- About 枢纽、站点索引、README 图集同步隐私页入口

## [0.2.61] — 2026-11-18

### 新增

- 站内「阅读器兼容」页 `/readers/`：三种订阅源、7 项兼容处理、阅读器建议与限制
- About 枢纽 / 站点索引 / 订阅页 / README 同步阅读器页入口
- 制作说明页「门禁顺序」15 步流程
- `/stats/` 年度同比扩展 CHARS（Δ +3,767 CHARS / +1,026%）

## [0.2.60] — 2026-11-18

### 改进

- 制作说明页同步最新构建链（13 个脚本：徽章 / Feed / 文档 / 发布校验 / 版本升级等）
- 404 页新增「按分类查找」chips（分类 + 篇数）
- 可访问性页对比度表补充阈值图例（AA ≥4.5:1，AAA ≥7:1）

## [0.2.59] — 2026-11-18

### 新增

- `docs/READERS.md` 阅读器兼容文档（三种订阅源、兼容处理、常见阅读器建议、验证方法与限制）
- 可访问性页对比度表按比例升序 + 每主题「最低值」摘要
- `/stats/` 年度对比行增加同比增量（`Δ +1,901 WORDS (+613%)`）

## [0.2.58] — 2026-11-18

### 新增

- 可访问性页「对比度数值」表：亮/暗 32 组实测比例与 AA/AAA 等级（构建期由 check-contrast 写入 JSON）
- `check-contrast --write-data` 生成 `src/data/contrast-report.json`，页面只读取数据不重复计算
- `check-docs` 校验对比度报告存在且覆盖 2 主题 × 16 组
- `check-feed` 增加 Feed 图片 `src` 绝对地址校验

## [0.2.57] — 2026-11-18

### 新增

- Feed 阅读器兼容静态预检：正文禁止脚本/嵌入/内联事件、图片必须 alt、KaTeX 必须有 MathML 兜底、禁止 data: URI
- 404 页增加「随机档案」「订阅更新」入口（共 5 个动作）

## [0.2.56] — 2026-11-18

### 改进

- `/stats/` 年度对比行增加 CHARS（字符数）
- `/series/` 每个系列显示最近更新时间（UPDATED）
- 订阅页摘要版 JSON Feed 增加 `LIGHT` 徽章

### 修复

- `<head>` 的 JSON Feed `rel=alternate` 改为绝对地址（与 RSS alternate 一致）

## [0.2.55] — 2026-11-18

### 新增

- `<link rel="alternate">` 声明摘要版 JSON Feed
- Feed 门禁硬化：RSS/JSON Feed 的 description 空、完整文档结构、双重转义；摘要 feed 实体残留 / 可执行标签
- OG 分享图改用 128 色调色板压缩（视觉无损，单图 ~33KB → ~23KB，总产物 6741 → 6674KB）

## [0.2.54] — 2026-11-18

### 新增

- 摘要版 JSON Feed `/feed-summary.json`：标题 / 摘要 / 600 字纯文本，体积约全文版 28%（约 10KB vs 36KB）
- 订阅页、站点索引、DEPLOY 文档同步摘要 feed 入口
- `check-feed` 校验摘要 feed（版本、variant、条目数一致、摘要/纯文本非空、长度上限）

### 无障碍

- Skip link 跳转后焦点交给 `#swup-container`（`tabindex="-1"` + JS focus），键盘用户不再从导航重新 Tab

## [0.2.53] — 2026-11-18

### 改进

- 可访问性声明页刷新：10 条键盘操作（含 `?` 浮层与标题锚点复制）、7 项自动门禁清单、
  `aria-live` / `aria-current` / 焦点陷阱说明、构建期读取的版本号与最近审查日期

## [0.2.52] — 2026-11-18

### 新增

- `pnpm verify:release` 升级为端到端：解压 zip → 在解压目录运行主题安装器自测 + 文档一致性检查
- `check-docs` 增加 ITERATIONS 迭代编号门禁（连续、唯一、最新在末尾）

### 修复

- verify-release 在 ESM 中误用 `require` 导致崩溃 → 改用已导入的 `spawnSync`

## [0.2.51] — 2026-11-18

### 新增

- `scripts/verify-release.mjs` + `pnpm verify:release`：校验发布 zip 与 MANIFEST（sha256/size/文件数/必需文件/禁止目录）
- `check-docs` 扩展：theme/README 链接、截图 WebP 魔数、徽章 SVG 有效性

### 文档

- CONTRIBUTING 增加发布包校验命令，形成「bump → check-docs → verify → package → verify:release」交付链

## [0.2.50] — 2026-11-18

### 新增

- `check-docs` 增加文档相对链接存在性校验（58 条）与截图健康检查（40 张）
- README 扩充「更多细节」图集（40 张真实截图）与顶部导航

### 文档

- 文档门禁输出链接/截图统计，便于发现失效引用

## [0.2.49] — 2026-11-18

### 新增

- 自制版本徽章 `docs/badge-version.svg`（版本 + 迭代数，离线、无第三方服务）
- `pnpm verify:fast` 快速门禁（基于现有 dist，不重新构建）
- `pnpm badge` / `node scripts/generate-badge.mjs` 生成徽章
- `check-docs` 校验徽章版本与迭代数

## [0.2.48] — 2026-11-18

### 新增

- `scripts/bump.mjs` 一键版本升级（package/README/STATE/CHANGELOG 骨架，校验 semver 且不降级）
- `check-docs` 扩展：README 截图必须存在、主题包关键文件存在、截图引用下限
- 发布 MANIFEST 增加 `sha256` 与 `size` 字段

### 文档

- CONTRIBUTING 补充版本升级与 MANIFEST 校验流程

## [0.2.47] — 2026-11-18

### 新增

- 文档/版本一致性门禁 `scripts/check-docs.mjs`（纳入 `pnpm verify`）
- RSS `<dc:creator>` 作者字段（dc 命名空间）
- JSON Feed `_site` 扩展字段（name/url/generator）
- 文章页 `article:author` meta

## [0.2.46] — 2026-11-18

### 新增

- RSS：`atom:link rel="self"`、atom 命名空间、每条 item 的 `<category>`
- JSON Feed：`favicon` / `icon`
- 文章页 Article Open Graph meta（published/modified/section/tag）
- Feed 门禁扩展（atom self、命名空间、favicon/icon/language）

## [0.2.45] — 2026-11-18

### 修复

- 检索结果数量缺少 `aria-live` 实时播报（无障碍）

### 新增

- Feed 与 `/stats.json`、`sitemap-0.xml` 的一致性门禁
- 统计页 `MACHINE / stats.json` 机器入口链接

## [0.2.44] — 2026-11-18

### 新增

- Feed 门禁深度校验（GUID/id 唯一、日期顺序、绝对地址、内容非空）
- 章节锚点复制成功视觉态（黄铜底 1.4s）
- `/series/` 系列统计（篇数 / 字数 / 阅读分钟）

## [0.2.43] — 2026-11-18

### 新增

- 点击标题锚点复制章节绝对链接（toast 提示，保留跳转）
- 热力图 tooltip 增加字符数
- `CONTRIBUTING.md` 维护/发布/依赖手术流程
- 移动端 `/stats/` KPI 2×3 复核（无横向溢出）

## [0.2.42] — 2026-11-18

### 改进

- `/stats/` 新增「CHARS / 字符」KPI（6 个 KPI）
- 打印页眉增加站点名（站点 | 标题 | 日期 | URL）
- 移除未使用的 `reading-time` 依赖（lockfile 手术同步，无版本漂移）

### 工程

- 记录 pnpm junction 环境下 `pnpm remove` 触发 lockfile 漂移的坑与手术式修复流程

## [0.2.41] — 2026-11-18

### 修复

- **严重**：中文文章字数/阅读时长被严重低估（按空格分词）→ CJK 按字 + 拉丁按词，新增 `chars`

### 新增

- 打印页眉补充日期
- `/stats.json` 增加 `chars`
- 单页 HTML 预算 80KB → 96KB（代码文章实际体积）

### 文档

- THEMING FAQ 记录 Astro content layer 缓存导致 frontmatter 不更新的排查

## [0.2.40] — 2026-11-18

### 新增

- 点击 KaTeX 公式复制 LaTeX（底部轻提示，选中文本不劫持）
- 文章目录折叠状态记忆（localStorage，桌面还原）
- 打印页眉（标题 + 绝对 URL，仅打印显示）
- README 键盘快捷键表

### 修复

- 首版 toast 未正确插入导致 KaTeX 复制无提示

## [0.2.39] — 2026-11-18

### 修复

- 快捷键浮层缺少焦点陷阱（Tab 会移出 dialog）

### 新增

- Mermaid 图表「复制源码」按钮（重渲染安全、Swup 后生效）
- 正文图片自动 `loading=lazy decoding=async`
- README 快捷键说明

## [0.2.38] — 2026-11-18

### 新增

- `?` 快捷键帮助浮层（dialog / Esc / 背景关闭 / 焦点还原）
- `/stats.json` 年度聚合（每年条目 / 字数 / 分钟）
- `/sitemap/` 文章按年份折叠

### 工程

- 快捷键浮层懒创建、UI 脚本外置 `public/rhine/ui.js`（每页减重约 2.6KB，修复单页 HTML 预算超限）

## [0.2.37] — 2026-11-18

### 新增

- 全局键盘跳转（`g` + `h/a/t/s/r/b/c`，输入框内禁用）
- 机器可读统计 `/stats.json`（计数 / 分类 / 标签 / 文章明细）
- `/sitemap/` 文章按年份分组

## [0.2.36] — 2026-11-18

### 新增

- 人类可读站点索引 `/sitemap/`（页面 / 文章 / 分类 / 标签 / 机器入口）
- PWA 快捷方式专用图标（自制 SVG → 96/192 PNG）
- 对比度门禁扩展 `ink-2/amber-wash` 等（每主题 16 组）
- `docs/DEPLOY.md` 订阅与搜索对外声明表
- 总产物体积预算 6.5MB → 6.75MB（新增索引页与快捷图标后按 +4% 余量调整）

## [0.2.35] — 2026-11-18

### 新增

- 检索无结果时的「试试这些标签」引导（点击直接筛选）
- `<noscript>` 提示（归档 / 订阅直链，索引忽略）
- 返回顶部按钮短页阈值（可滚动高度 > 0.6 视口才显示）

## [0.2.34] — 2026-11-18

### 修复

- **严重**：返回顶部按钮大部分移出视口（固定定位到视口右侧）

### 新增

- 返回顶部滚动进度环（conic-gradient，passive 滚动监听，减少动效回退）
- PWA manifest shortcuts / categories / orientation
- 对比度门禁增加 `amber-ink/surface-2`（每主题 14 组）

## [0.2.33] — 2026-11-18

### 新增

- 正文站外链接自动加 `target=_blank` / `rel=noopener noreferrer` 与 `↗` 标记
- 首页 WebSite JSON-LD 增加 SearchAction（站内搜索 `?q=`）
- Feed 门禁校验 `lastBuildDate`；对比度门禁扩至每主题 13 组

### 改进

- 站点 URL 收敛为 `astro.config.mjs` 的 `SITE_URL` 常量（canonical/OG/外链判断同源）

## [0.2.32] — 2026-11-18

### 修复

- **严重**：代码块同时渲染两个复制按钮（Fuwari 内置 + 自研）位置重叠；文章页改由 RhineCodeCopy 独占，并预留顶部留白

### 新增

- RSS `lastBuildDate`（最近内容更新时间）
- 系列块「上一篇」链接（与下一站并排）

## [0.2.31] — 2026-11-18

### 修复

- **严重**：`--rl-paper` 令牌未定义（复制成功态文字色 / 枢纽卡片背景失效）
- **严重**：亮色主题 `amber-ink` 在黄铜底徽标上对比度 4.03:1，不满足 WCAG AA（加深至 4.66:1）

### 新增

- 文章更新日期（元信息徽标 / JSON-LD dateModified / JSON Feed date_modified）
- 系列块「下一站 / 系列已归档」
- 对比度门禁扩展到按钮与徽标组合（每主题 12 组）
- colophon 页构建信息行

## [0.2.30] — 2026-11-18

### 修复

- **严重**：重复的 skip link（两条）与重复的 `.rl-skip` 样式定义，合并为单条并统一焦点态

### 新增

- Feed 结构门禁 `scripts/check-feed.mjs`（RSS + JSON Feed，已接入 pnpm verify）
- 代码行号窄屏缩进

## [0.2.29] — 2026-11-18

### 新增

- 代码块行号（CSS 计数器，不污染复制内容，可在 astro.config 关闭）
- 文章面包屑导航与 schema.org BreadcrumbList 结构化数据
- 可访问性页「已知限制」清单

## [0.2.28] — 2026-11-18

### 新增

- 制作说明页 `/colophon/`（构建链、字体图标、色板、生成脚本、许可声明）
- 检索历史支持单条删除
- 对比度门禁支持 rgba 半透明合成，扩展至每主题 10 组

## [0.2.27] — 2026-11-18

### 新增

- WCAG 对比度门禁 `scripts/check-contrast.mjs`（亮/暗 7 组，已接入 pnpm verify）
- 标题层级检查（首个标题必须 h1、不得跳级）
- 可访问性说明页 `/accessibility/`（键盘表、视觉/动效说明、静态门禁清单）

## [0.2.26] — 2026-11-18

### 修复

- **严重**：全站外链 `target="_blank"` 缺少 `rel="noopener"`（反向标签劫持风险），修复 Navbar / NavMenuPanel / Profile / License

### 新增

- 无障碍与链接安全自检 `scripts/check-a11y.mjs`（10 类检查，已接入 `pnpm verify`）
- 跳转主内容 skip link（键盘聚焦可见）

## [0.2.25] — 2026-11-18

### 新增

- 检索历史（localStorage 最近 6 条，桌面聚焦/移动端面板显示，可重搜与清除）
- 归档「恢复默认 / RESET」（最新年份展开，按钮文案复位）

## [0.2.24] — 2026-11-18

### 新增

- 相关档案条目显示匹配原因（同分类 / 共同标签徽标）
- 订阅页「复制 Markdown 订阅列表」

## [0.2.23] — 2026-11-18

### 新增

- 代码块左上角语言徽标（与复制按钮对称，打印隐藏）
- 关于页「站点导航」枢纽（8 张入口卡片，base 感知）

## [0.2.22] — 2026-11-18

### 新增

- 订阅与集成页 `/subscribe/`（RSS / JSON Feed / OpenSearch，一键复制绝对地址，页脚入口）
- 归档页「全部展开 / 全部折叠」切换（与状态记忆联动）

### 文档

- `docs/DESIGN.md` 增加 Service Worker 评估结论（暂不启用及原因）

## [0.2.21] — 2026-11-18

### 新增

- 文章代码块一键复制（Clipboard API + 降级；Swup 换页后仍可用；跳过 Mermaid；打印隐藏）
- 归档页年份展开状态记忆（localStorage，刷新/返回后恢复）

### 改进

- 安装器 v3.1：`--with-components` 覆盖 7 个组件（新增 RhineCodeCopy）

## [0.2.20] — 2026-11-18

### 新增

- JSON Feed 1.1 `/feed.json`（与 RSS 共用渲染工具，KaTeX/MathML、绝对链接、`rel=alternate`、页脚入口）
- 字体预加载：Roboto latin-400 + JetBrains Mono latin 的两条 woff2 preload

### 清理

- 移除未接线的 `@astrojs/partytown`（package.json + pnpm-lock 同步，frozen-lockfile 校验通过）

## [0.2.19] — 2026-11-18

### 新增

- 检索结果键盘导航（↑/↓ 循环、Enter 打开、选中项高亮）与 combobox/listbox/option 无障碍语义
- 检索关键词 `<mark>` 高亮主题化（亮暗各一套）

## [0.2.18] — 2026-11-18

### 新增

- 统计页「年度对比」（条目/字数/阅读分钟）
- OpenSearch 描述 `/opensearch.xml` 与 `rel=search`，浏览器可将本站添加为搜索引擎
- 站内搜索支持 `?q=` 直达（预填关键词、自动打开检索面板，Swup 后仍生效）

## [0.2.17] — 2026-11-18

### 新增

- 归档页按年份折叠（原生 details，最新年份默认展开）
- 时间线页年份快捷跳转 chips
- 新增 2025 年演示条目（跨年份归档/时间线/热力图演示）
- 随机页「再抽一次」入口

## [0.2.16] — 2026-11-18

### 改进

- 主题安装器 v3：`--with-components` 覆盖 6 个组件（含分享条）+ 系列工具，版本号从 package.json 读取；selftest 断言扩展
- `docs/ASSETS.md` 增加构建期依赖 SPDX 许可台账

## [0.2.15] — 2026-11-18

### 新增

- 随机档案页 `/random/`（随机跳转 + `?no=1` 预览/无脚本兜底；noindex 且不进 sitemap；页脚 RANDOM 入口）
- 分享条「MD 引用」按钮（复制 `[标题](URL)`）

## [0.2.14] — 2026-11-18

### 新增

- 统计页热力图增加月份标签（跨年标 `2026.01`，相邻过近自动省略）
- 归档页单年份时改为「按时间倒序 / NEWEST FIRST」，去掉重复计数

### 文档

- THEMING 常见问题补充 Astro markdown 弃用告警说明

## [0.2.13] — 2026-11-18

### 新增

- 统计页最近 365 天编目热力图（5 级色阶、图例、tooltip、移动端横滚、暗色色阶）
- 版本沿革页每个版本自动生成锚点（`#v0-2-0`）与 `#` 链接

### 修复

- **严重**：热力图日期因 UTC/本地时区混用整体偏移一天

## [0.2.12] — 2026-11-18

### 新增

- 版本沿革页 `/changelog/`：构建期读取 `CHANGELOG.md` 渲染，页脚入口
- 分享条新增「打印 / PDF」按钮（联动打印样式）

### 文档

- DEPLOY 补 Nginx / Caddy / 子路径 alias 示例

## [0.2.11] — 2026-11-18

### 新增

- 文章分享与引用条：复制链接 / 复制引用 / 系统分享（触屏），事件委托跨 Swup，aria-live 反馈
- `prefers-contrast: more` 与 `forced-colors: active` 适配
- README「字体与跨平台」章节与 THEMING 字体说明

## [0.2.10] — 2026-11-18

### 新增

- PWA manifest（构建期生成，base 感知）与应用图标 180/192/512（sharp 从自制 favicon 生成）
- Layout 注入 `manifest`、`apple-touch-icon`

### 修复

- **严重**：子路径部署时项目索引封面图未走 `base`，图片 404

## [0.2.9] — 2026-11-18

### 修复

- **严重**：子路径（`base`）部署时 canonical / OG / JSON-LD 出现双重 base 前缀；RSS 与 sitemap 丢失 base → `url()` 幂等化并统一绝对地址生成

### 新增

- `docs/DEPLOY.md` 部署指南（GitHub Pages Actions、三大平台、子路径检查清单、常见问题）

### 优化

- 截图资产 1091 KB → 673 KB（−38%）

## [0.2.8] — 2026-11-18

### 修复

- **严重**：移动端导航菜单换页后不关闭，盖住新页面
- **严重**：Swup 换页后按钮监听器累积，主题切换/菜单按钮一次点击触发多次

### 新增

- 键盘快捷键：`/` 聚焦（或打开）搜索，`Esc` 关闭移动端导航菜单

## [0.2.7] — 2026-11-18

### 新增

- 打印样式 `@media print`：单栏白底、隐藏导航/侧栏/目录/相关档案、代码块转浅底、外链展开 URL、分页规则
- THEMING 新增「文章增强组件接线」章节（TOC / 进度轨 / 相关档案 / 系列 / 打印）

## [0.2.6] — 2026-11-18

### 改进

- RSS 全文改用 Astro 容器渲染：文章正文与站内一致（代码高亮/表格/admonition/KaTeX），保留 MathML，链接绝对化，标题锚点清理，失败自动回退
- README 增加「性能与体积」章节与 Mermaid 分块策略说明

## [0.2.5] — 2026-11-18

### 新增

- 分类与标签总览页 `/topics/`：分类卡片（占比 + 最近条目）、按条目数加权的标签云
- 归档页头部快捷入口（时间线 / 系列 / 分类与标签）
- 侧栏「标签」组件新增「全部标签 / ALL TAGS →」入口

## [0.2.4] — 2026-11-18

### 新增

- 目录（TOC）滚动高亮：30% 视口探针、`▸` + 黄铜高亮、`aria-current="location"`、点击即时高亮、移动端点击后自动收起、Swup 换页重建

### 质量

- `astro check` 提示从 30 条清零：`astro/zod` 迁移、移除未使用 props/imports/参数、内联脚本显式 `is:inline`

## [0.2.3] — 2026-11-18

### 新增

- 档案时间线页 `/timeline/`：按年份分组的刻度时间线、跨度统计、节点悬停高亮、移动端日期横排；页脚 TIMELINE 入口

## [0.2.2] — 2026-11-18

### 新增

- 系列索引页 `/series/`（系列/条目/档案计数、跨度、刻度与条目列表、空状态；页脚 SERIES 入口）
- 404 页面「最近档案」3 条快捷入口
- JSON-LD 强化：image / wordCount / keywords / mainEntityOfPage / inLanguage / publisher

## [0.2.1] — 2026-11-18

### 新增

- 系列（SERIES）内容支持：`series` / `seriesOrder` 字段、系列聚合工具与 `RhineSeries` 组件（进度刻度、当前条目高亮、`aria-current`）
- 4 篇示范文章归入「建站日志」系列
- `check-links.mjs` 增加 CSS `url()` 资源引用检查

## [0.2.0] — 2026-11-18

### 新增

- 构建产物优化管线 `scripts/optimize-dist.mjs`（删 woff/ttf、CSS fallback、未用 Pagefind UI）
- 体积预算检查 `scripts/check-budget.mjs`（总产物/JS/CSS/字体/单页 HTML 五项预算，接入 `pnpm verify`）
- 字体策略收敛：Roboto 仅 latin 子集、去掉未使用的 JetBrains Mono 斜体

### 修复

- **严重**：`themeColor.fixed: true` 时移动端汉堡菜单点不开（脚本非空断言抛错中断绑定）
- **严重**：产物携带 1.2MB+ 旧格式字体与未使用 UI 资源
- 暗色模式下头像过亮，增加滤镜适配

### 体积

- dist 7478 KB → 5848 KB（−21.8%）；CSS 394→306 KB；woff2 607→377 KB

## [0.1.9] — 2026-11-18

### 新增

- 主题安装器 v2：`--list` / `--verify`、`--with-components` 覆盖 5 个主题组件、安装后自检
- 组件别名自动改写（`@/`、`@utils/` 等 → 相对路径），无 tsconfig paths 的站点也能编译
- `theme/selftest.mjs` 安装器自测（20 项断言，已接入 `pnpm verify`）

### 修复

- **严重**：安装器只读模式（`--list` 等）会在目标站创建 `.rhine-backup` 空目录 → 备份目录惰性创建，只读模式零写入
- **严重**：`--with-components` 复制的组件因 `@/` 别名在无别名站点无法编译

## [0.1.8] — 2026-11-18

### 修复

- **严重**：文章页上下篇导航从未显示（详情页 `getStaticPaths` 用 `getCollection()`，未取到 `getSortedPosts()` 写回的相邻文章数据）→ 改用 `getSortedPosts()`；中间文章左右两条、首末篇单侧，均含可访问名称
- 配合 Iteration 8 的链接自检，全站空链接 0 处

## [0.1.7] — 2026-11-18

### 新增

- 站内链接/锚点/资源检查器 `scripts/check-links.mjs`（`pnpm check:links`，已接入 `pnpm verify`）
- 检查项覆盖：内部链接、跨页/同页锚点、图片/CSS/JS 资源、sitemap 映射、每页 h1 数量

### 修复

- **严重**：分页禁用态的上一页/下一页是空名称的可聚焦链接，且 `href` 兜底指向首页
- **严重**：文章上一篇/下一篇无相邻文章时输出空 `<a href="#">`（10 处空链接）
- **严重**：文章页 `getStaticPaths` 使用 `getCollection()`，导致「上一篇/下一篇」数据从未填充、导航从未显示；改用 `getSortedPosts()`
- 上下篇链接补充可访问名称（`上一篇：…` / `下一篇：…`）

## [0.1.6] — 2026-11-18

### 新增

- 构建期 OG 图生成器（`scripts/generate-og.mjs`）：每篇文章 1200×630 档案卡 + 站点默认图，接入 `pnpm build`
- 完整的社交分享元信息：`og:image`（含宽高/alt）、`og:locale`、`twitter:card=summary_large_image`

### 修复

- **严重**：全站缺社交分享图与 locale，分享无预览
- **严重**：404 页缺少 `robots: noindex`，错误页可能被收录
- **严重**：RSS `<language>` 使用下划线写法（`zh_CN`）→ `zh-CN`

## [0.1.5] — 2026-11-18

### 新增

- 档案统计页 `/stats/`：KPI、月度入档图、分类/标签分布、最长条目（构建期计算，纯 CSS 图表）
- 导航新增「统计」入口

### 修复

- **严重**：检索面板在 Swup 换页后仍打开并显示上一页旧结果；Esc 无法关闭；开关按钮缺 `aria-expanded`/`aria-controls`
- **严重**：桌面端 Esc 后焦点交给隐藏按钮导致焦点丢失 → 按断点回焦可见元素

## [0.1.4] — 2026-11-18

### 新增

- 文末「相关档案 / RELATED」推荐（同分类 + 共享标签打分，最多 3 条）
- 归档页语义头部：h1 + `N ENTRIES / 条目` 统计 + 每类页面独立标题

### 修复

- **严重**：5 种语言的 `pageNotFound` 文案为空，404 页标题/描述缺失 → 补齐翻译
- **严重**：归档索引/分类/标签/未分类页无 h1，分类与标签页标题错误地显示「归档」
- **严重**：Pagefind 摘录混入字数/时间/元信息/目录/许可/上下篇等噪音 → 标注 `data-pagefind-ignore`，标题锚点 `#` 也不再进索引
- Pagefind 元信息标题改为正文首行开头，检索结果更可读

## [0.1.3] — 2026-11-18

### 新增

- 检索终端筛选：Pagefind 分类 / 标签 chip（含计数、已选态、清除、结果计数、空态）
- 文章页「跳到正文」skip link（键盘可达性）
- 文章页 pagefind body 收敛为整篇文章，注入分类/标签筛选字段

### 修复

- **严重**：文章页缺少 `h1`，标题语义缺失
- **严重**：辅助文字对比度不足 AA（`--rl-muted` 3.69:1、`--rl-faint` 2.75:1）→ 调整为 5.28:1 / 4.74:1，并修正 `.text-50`、输入框文字色
- **严重**：移动端检索面板结果不可滚动、末尾结果不可达
- 进度轨滚动监听在 Swup 换页后累积（内存漂移）→ 增加清理钩子
- 搜索面板占位符/占位文字颜色过淡

## [0.1.2] — 2026-11-18

### 新增

- 文章目录 `RhineToc`：`01–NN` 编号、二级/三级缩进、当前小节高亮、移动端默认折叠、标题锚点 `#` 自动剥离
- 刻度导航 `RhineProgress`：≥1440px 右侧刻度轨、阅读百分比、点击/键盘跳转、Swup 换页重绑
- 正文标题 `scroll-margin-top`，锚点跳转不被 sticky 导航遮挡

### 修复

- **严重**：`pnpm check` 的 20 个类型错误全部清零（`AnyEntryMap` 失效导入、`post.body` 可空、`getEntry` 可空、Search 多 slot 类型、`window.__BANNERS__` 声明、侧栏索引隐式 any、Mermaid 脚本隐式 any 等）
- **严重**：刻度轨的 fixed 定位被 `#content-wrapper` 残留 transform 劫持（滚动跟随、宽屏错位）；改为内容容器纯淡入动画
- 刻度「当前小节」判定改为视口 28% 探测，顶部与页尾不再丢失高亮

## [0.1.1] — 2026-11-18

### 修复

- **严重**：暗色模式下主题变量被 Fuwari 的 `:root.dark` 覆盖，卡片、代码块、许可证底色发棕；改用 `html:root:root` 提升特异性
- **严重**：Mermaid 图表不渲染（选择器匹配不到 Shiki 输出）；重写渲染器、修复与复制按钮的竞态、增加主题切换重渲染
- **严重**：主题安装器 dry-run 会写备份、回滚可能选到空备份、默认复制依赖 `@/` 别名的组件；全部修复并实测
- 修复示例文章中的失效 wiki 式链接

### 新增

- Mermaid 亮/暗档案配色（`themeVariables`）
- 主题安装器 `theme/install.mjs`：dry-run / minimal / with-components / rollback
- 文章页排版细化（标题平衡换行、字数块、许可块、上下篇导航主题化）
- `STATE.md` 迭代状态文件、`scripts/package.mjs` 打包脚本
- 页脚构建版本号从 `package.json` 读取

## [0.1.0] — 2026-11-18

### 新增

- 莱茵档案（Rhine Archive）设计系统：`src/styles/rhinelab.css`（令牌 + 背景场 + 组件 + 正文 + 无障碍）
- 首页档案封面 `RhineHero`（构建期统计、扫描环水印、双语元数据、扫描线）
- 归档编号 `X-001`、双语微标签（`ENTRIES / 条目`、`WORDS / 字` 等）
- 自制 SVG 图形：徽标、favicon、观测者头像、项目预览
- 项目索引页（`/gallery/`）主题化
- 刻读进度轨样式（≥1440px）
- 完整文档：README、DESIGN、THEMING、ASSETS、ITERATIONS
- `scripts/new-post.js` 新建文章脚本

### 修复

- **严重**：首页 banner 缺图导致背景 404、切换按钮失效
- **严重**：Markdown 管线未接线 —— KaTeX 公式原样输出、字数/阅读时间缺失、admonition / GitHub 卡片 / 标题锚点失效
- **严重**：模板携带个人内容与 15MB 个人素材，改为自制素材 + 示例文章
- 404 页原先硬编码蓝/灰配色，改为主题化档案空态
- 页脚原先写死年份 2024，改为动态年份并加入同人声明

### 变更

- 站点配置去个人化（站点名、作者、头像、友链、导航）
- 构建脚本增加 `check` / `verify`
- 移除本地管理端相关脚本（模板不包含 admin）

### 已知

- `@astrojs/partytown` 依赖仍保留但未接线，后续清理
- Roboto 使用全子集，字体体积可收窄
