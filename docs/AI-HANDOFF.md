# 交接文档 · 黯的博客 / 莱茵档案（给下一个 AI）

> 更新：2026-11-20 · 版本 **v0.10.0 / Iteration 141**
> 这份文档只记录「怎么继续做」所需的真实事实：仓库、部署、代码位置、已修问题、余量、坑和下一步。
> 先读 **0 → 2 → 4 → 11**，再按任务查后面的章节。

---

## 0. 30 秒概览

| 站点 | URL | 是什么 | 部署来源 |
| --- | --- | --- | --- |
| 根入口 | <https://github.glmyx.eu.org/> | 「莱茵生命 · 档案入口」选择界面（自包含静态单页） | `mayuxiao2021/mayuxiao2021.github.io` → **`portal` 分支**（Pages 用 legacy 分支构建） |
| 博客 | <https://github.glmyx.eu.org/rhinelab-blog/> | 黯的博客，莱茵档案主题（Astro 6 + Fuwari），49 页、7 篇文章 | `mayuxiao2021/rhinelab-blog` → `main`（Actions 构建） |
| 引导页 | <https://github.glmyx.eu.org/rhinelab-blog/start/> | 博客内三风格入口 + 启动动画开关 | 同上（Astro 页面 `src/pages/start.astro`） |
| 旧版归档 | <https://github.glmyx.eu.org/legacy-blog/> | 迁移前的 Fuwari 原版完整归档 | `mayuxiao2021/legacy-blog` → `main`（`BASE_PATH=/legacy-blog/`） |

**非商业同人演示**：演示页 `/operators/` 含 8 位干员的公开立绘，版权归鹰角网络（Hypergryph）；模板代码 MIT，
文章内容 CC BY-NC-SA 4.0。商用/再分发前见 `docs/ASSETS.md` 的移除清单。

**本地目录**（Windows 11）：`D:\admin\main\rhinelab-blog`（主仓库）；`D:\admin\main\blog_astro`（旧 Fuwari 源，**不要改动**）。

---

## 1. 目标与当前阶段

- 用户「黯」的个人博客 + 一套可复用的莱茵生命（Rhine Lab）风格模板。
- 已完成：主题站、8 位干员演示页、真实内容迁移（7 篇文章/关于/头像/友链/静态小游戏）、根域名选择界面 Portal、启动动画、全站彩蛋、CI 与 Pages 部署。
- 用户风格：要「完全符合莱茵生命主题」与「小巧思」；视觉上重档案感、机构术语、亮暗双模式、可探索细节。
- 用户偏好：中文交流；破坏性操作（覆盖仓库、切 Pages 源、删数据）必须先确认；喜欢一轮一轮迭代 + 实测截图。

---

## 2. 仓库 / 分支 / Pages 设置（最容易踩坑的地方）

### 2.1 `mayuxiao2021/rhinelab-blog`（主仓库，public，默认分支 `main`）

- 源码：博客 + 主题 + 文档 + 发布脚本。根目录 `portal/` 是**根域名 Portal 的源码镜像**（见 `portal/README.md`），
  但它**不是**本仓库部署的，真正部署在用户站仓库的 `portal` 分支。
- Actions：
  - `.github/workflows/verify.yml`：`pnpm install --frozen-lockfile` → `pnpm check` → `pnpm verify`（18 步）→ `pnpm test:subpath` → 打包 → `verify-release --full --build` → 上传 dist/zip artifact。
  - `.github/workflows/pages.yml`：`BASE_PATH=/rhinelab-blog/`、`SITE_URL=https://github.glmyx.eu.org` 构建，`deploy-pages` 发布博客。
- 发布包：`node scripts/package.mjs` → `release/rhinelab-blog-v<ver>.zip` + `MANIFEST.txt`；校验用 `node scripts/verify-release.mjs <ver|不传> --full --build`。

### 2.2 `mayuxiao2021/mayuxiao2021.github.io`（用户站仓库）

- **`master` 分支 = 旧 Fuwari 博客的完整源码，保持原样，没有被覆盖**（本地 `blog_astro` 也未被改，仍有 11 个用户未提交改动）。
- **`portal` 分支 = 根域名 Portal**，只有一个自包含 `index.html` + `.nojekyll` + GitHub 自动提交的 `CNAME`。
- Pages 设置：`build_type: legacy`，source = `portal` / `/`；自定义域 `github.glmyx.eu.org`（有 CNAME，HTTPS enforced）。
- ⚠️ **坑：用 API 切 Pages 的 build_type/source 时会把 `cname` 清空**，导致自定义域 404。
  恢复：`PUT /repos/{owner}/{repo}/pages` 带上 `cname`，再 `POST /pages/builds` 触发构建。
- ⚠️ 该仓库的 `portal` 分支没有 workflow；推送后依赖 GitHub Pages 的 legacy 构建，约 1–2 分钟。

### 2.3 `mayuxiao2021/legacy-blog`（旧版归档，public）

- 从 `blog_astro` 工作树复制（含用户未提交改动）而来的旧 Fuwari 源码，独立仓库。
- 修改点：`astro.config.mjs` 的 `base: process.env.BASE_PATH || "/"`；新增 `.github/workflows/pages.yml`（构建 `BASE_PATH=/legacy-blog/`）。
- 原站资产（15MB，含小游戏/旧图）随仓库一起归档；**不要再改它的视觉**，它是历史快照。

### 2.4 账号与权限

- 本机有 SSH key：`~/.ssh/id_ed25519`，`git@github.com` 可直接推。
- **没有 `gh` CLI**；GitHub Token 存在 Windows Credential Manager，用 `git -c credential.helper=wincred credential fill` 可取到，**不要打印/提交 token**。
- 本机 shell 走 MSYS Bash；`curl` 可用，GitHub API 可用（曾直连成功）。

---

## 3. 本地环境 / 目录

| 路径 | 说明 |
| --- | --- |
| `D:\admin\main\rhinelab-blog` | 主仓库（Astro 项目） |
| `D:\admin\main\blog_astro` | 旧 Fuwari 源（**只读参考**，不要提交/改动） |
| `D:\admin\main\.rl-portal` | 临时工作区：`portal/`（Portal 源）、`user-site/`（用户站 clone）、`legacy-src/`（旧站构建副本）。**不保证保留**；可重新生成 |
| `node_modules` | 本地是 junction 到 `D:\admin\main\blog_astro\node_modules` 的复用依赖 |
| `dist/` | 构建产物（gitignore）；截图/预览服务从这里提供 |
| `release/` | 发布 zip + MANIFEST（gitignore） |
| `.shots/` | 本地截图缓存（gitignore） |

运行时：Node 24（本地）/ 22（CI），pnpm 9.6.0；Astro 6 + Fuwari（vendored）+ Svelte 5 + Tailwind 3 + Pagefind + Swup + KaTeX + Mermaid。

---

## 4. 命令与门禁

```bash
cd D:\admin\main\rhinelab-blog
pnpm check                  # astro check：0 errors / 0 warnings / 0 hints
pnpm build                  # badge + OG + icons + astro build + pagefind + optimize-dist
pnpm dev                    # 本地开发
pnpm preview --port 4400    # 预览 dist（截图用 http://127.0.0.1:4400）
pnpm verify                 # 18 步门禁：badge/对比度数据/文档/主题自测/OG/图标/build/pagefind/optimize/links/a11y/a11y-selftest/SEO/对比度/feed/catch/预算
pnpm test:subpath           # BASE_PATH=/rhine-test/ 端到端回归（会恢复默认构建）
node scripts/package.mjs
node scripts/verify-release.mjs 0.8.1 --full --build   # 版本号可省略，自动取最新 zip
```

静态截图服务（会话内）：

```bash
cd D:\admin\main\rhinelab-blog\dist && python -m http.server 4400 --bind 127.0.0.1
```

**18 步 verify 的具体脚本**都在 `scripts/`：`check-links`、`check-a11y`、`check-seo`、`check-contrast`、`check-feed`、`check-catch`、`check-budget`、`check-docs`，加上 badge/OG/icon/build/pagefind/optimize/theme selftest。
`check-budget` 当前预算：总产物 **12.5MB**、单页 HTML **160KB**、CSS **420KB**、JS **4.3MB**、字体 **520KB**、OG **260KB**。

---

## 5. 代码地图（主仓库）

```
src/
  config.ts                     # 站点身份 / 导航 / 头像 / 友链 / 侧栏布局（改站点信息先看这里）
  pages/
    [...page].astro             # 首页：RhineHero + 组织/设施/研究员预览 + 文章列表
    start.astro                 # 博客内引导页（三风格 + 遥测/跑马灯/标本标签/彩蛋）
    operators.astro             # 研究员名录（8 干员）
    gallery.astro               # 项目索引
    about.astro                 # 关于（渲染 src/content/spec/about.md + 站点导航枢纽）
    sitemap.astro / archive/…   # 站点索引与归档等
  components/
    rhine/RhineHero.astro       # 首页英雄区（立绘分层、数据条、跑马灯）
    rhine/RhineBoot.astro       # 莱茵启动序列（全屏 overlay；仅首页挂载）
    rhine/RhineEgg.astro        # 全站彩蛋（输入 rhine → ACCESS GRANTED）
    rhine/RhineMark.astro       # 莱茵徽记 SVG
    Footer.astro / Navbar.astro # 已改：导航「入口」、页脚 HINT / 主题文案
    widget/Links.astro          # 友链（已修 BASE_PATH 前缀）
    misc/ImageWrapper.astro     # 公共图片补 width/height
  content/posts/                # 7 篇文章（2 篇安全研究长文 + 测试 + 4 篇 Fuwari 示例）
  content/spec/about.md         # 作者关于页
  data/operators.ts             # 8 位干员元数据（RL-01..08）
  styles/rhinelab.css           # ★ 全部视觉规则（>7000 行）
  plugins/                      # Markdown：external links、lazy images、github card、frame title、admonition…
public/
  rhine/                        # 自制 SVG / 立绘 art/（非商业素材）
  gallery/                      # 项目预览图、guide 封面
  EatKun-main/、jump play/ 等   # 作者友链静态小游戏（第三方静态页，已补 lang/alt/h1）
  og/                           # 构建期生成的 OG 图（gitignore）
docs/                           # ACCEPTANCE / ASSETS / THEMING / DESIGN / AI-HANDOFF（本文件）等
portal/                         # 根域名 Portal 的源码镜像（见 portal/README.md）
.github/workflows/              # verify.yml + pages.yml
```

### 5.1 `rhinelab.css` 的章节结构（改样式时按节找）

- 1–3：设计令牌（亮/暗色）、字体、基础排版
- 4–14：Fuwari 组件覆盖（nav/卡片/侧栏/归档/代码块等）
- 15–19：细节组件（状态点、刻度、表格、打印等）
- **20：莱茵生命演示站**（`.rl-btn`、hero demo、`.rl-org`、`.rl-field`、`.rl-teaser`、`.rl-banner`、`.rl-ops-*`）
- **21：早期 Hero 布局修正**
- **22：风格引导页 / 启动动画 / 英雄区入场**（`.rl-start`、`.rhine-boot`、`rl-hero-*` keyframes）
- **23：莱茵生命细节**（`.rl-start__telemetry`、`.rl-start__marquee`、`.rl-style-card__spec`、`.rl-egg`、`.rl-footer__hint`）

> ⚠️ CSS 预算只剩 ~21KB（398.5/420KB，95%）；再加视觉细节前先合并旧规则或提高预算（见第 11 节）。

---

## 6. 页面 / 内容清单

- **49 个 HTML 页**（其中 47 个参与 SEO；第三方小游戏页被 `check-seo` 排除；静态页由 `check-a11y/links` 仍检查）。
- **7 篇文章**：`某校园跑步 App 安卓客户端安全审计`、`从零搭一条 Android logcat 脱敏抓取管线`、`测试`、`Markdown Extended Features`、`Simple Guides for Fuwari`、`Markdown Example`、`Include Video in the Posts`。
  - 分类 4 个（Examples / Guides / 安全研究 / 随笔），标签 16 个；RSS 7 条。
- 导航：主页 / 归档 / 关于 / 研究员 / 项目 / 统计 / 入口 / GitHub。
- 关于页：渲染 `src/content/spec/about.md`（作者原文 + GitHub 仓库卡 + 图片来源声明），下接 14 个站点导航入口（含 `/start/`）。
- 免责声明：页脚 + `/privacy/` + `docs/ASSETS.md` 均写明「非官方、非商业、模板核心自制图形 + 演示页公开立绘」。
- **非商业素材边界**：`public/rhine/art/` 16 张立绘（Aceship/Arknight-Images，版权鹰角），`docs/ASSETS.md` 3.1 有移除清单；
  商用/再分发前删除 `public/rhine/art/`、`src/data/operators.ts`、`src/pages/operators.astro`、首页演示区块、导航「研究员」。
- 作者友链静态小游戏：`public/EatKun-main/`、`public/jump play/`、`public/EatKano-main/`，来源见 ASSETS 3.2；`src/config.ts` 的 `FRIENDLY_LINKS` 指向它们。

---

## 7. 视觉系统要点

- 色板：亮色暖纸 `#eae5e1` / 墨 `#080a08` / 黄铜 `#9b7247`；暗色墨绿黑 `#11181b` / 纸面 `#202a2f` / 黄铜 `#c5a16b`。
- 字体：JetBrains Mono（OFL，编号/微标签）+ Roboto（Apache-2.0）+ 系统中文字体栈。
- 母题：档案编号（RL-01… / X-001）、双语微标签、刻度、发丝线、状态方点、圆环扫描、坐标、OBSERVER-07、SECTOR-03。
- 术语：`RHINE LAB`、`TRIMONT · COLUMBIA`、`STRUCTURE / DEFENSE & CLINICAL / ECOLOGY & FIELD`、`SPECIMEN`、`DOSSIER`、`ACCESS GRANTED`。
- 动画原则：只在 `prefers-reduced-motion: no-preference` 下播放；启动序列可跳过；引导页/入口页都支持亮暗。
- 关键交互：
  - 首页英雄区入场（三层立绘 + 内容 + 扫光，CSS keyframes `rl-hero-*`）。
  - 启动序列（`RhineBoot`）：`RhineMark` 旋转、逐行状态、进度条、SKIP；2.6s 自动结束，`?bootdebug=1` 停留 30s 供截图。
  - 全站彩蛋（`RhineEgg`）：输入 `rhine` 弹出诊断浮层（12s 自动关、Esc/点击关闭、reduced-motion 跳过）。

### 7.1 启动序列 / 主题存储键

| 键 | 作用 |
| --- | --- |
| `localStorage['rhine-boot-enabled']` | Portal 与博客共用的启动动画开关（`0` = 关闭） |
| `sessionStorage['rhine-boot-seen']` | 本次会话是否已播放过 |
| `sessionStorage['rhine-boot-play']` | 一次性播放标记（引导页用 `?intro=1` 代替） |
| `localStorage['theme']` | Fuwari 博客的亮/暗主题（light/dark/system） |
| `localStorage['rhine-theme']` | 根域名 Portal 的亮/暗主题（**尚未与博客统一**，见第 12 节） |

---

## 8. 功能实现细节（继续改时看这里）

### 8.1 根域名 Portal（`portal/index.html` / 用户站 `portal` 分支）

- 单文件、零构建：内联 CSS/JS；品牌行、SECTOR-03 实时钟、遥测（归档来源 / 结构稳定度 98.7% / 档案总数）、
  STRUCTURE·DEFENSE·ECOLOGY 跑马灯、三张档案卡（RL 编号 + SPECIMEN 标签 + hover 扫描）、条形码、HINT。
- 链接全部根相对：`/rhinelab-blog/?intro=1`、`/rhinelab-blog/operators/`、`/legacy-blog/`、`/rhinelab-blog/`。
- 动态：`fetch('/rhinelab-blog/build-info.json')` 显示版本与文章数；启动开关写 `rhine-boot-enabled`；主题写 `rhine-theme`。
- 彩蛋：输入 `rhine` → `#egg` 浮层 12s；Esc/点背景/按钮关闭；reduced-motion 不弹。
- **修改发布**：改 `portal/index.html` → 复制到用户站仓库 `portal` 分支 → push → 等 Pages legacy build。
  仓库里的 `portal/` 只是镜像；两边要手动同步（`portal/README.md` 有步骤）。

### 8.2 `/start/` 引导页

- 独立 `Layout`（没有 `MainGridLayout` 的 Sidebar），因此**进出它的链接必须带 `data-no-swup`**（Navbar、移动菜单、卡片、返回、重播），否则 Swup 只替换 `#swup-container` 会留下旧页外壳。
- 遥测数字由 `getSortedPosts/getCategoryList/getTagList` 构建期计算；卡片分别链接 `/?intro=1`、`/operators/`、旧版（外部 `https://github.glmyx.eu.org/legacy-blog/`）。
- 有独立彩蛋 `#rl-egg`（与全站 `RhineEgg` 不冲突，因为 `/start/` 不经过 `MainGridLayout`）。
- skip link 目标 `#swup-container` 已手动补到 `<main id="swup-container">`。

### 8.3 莱茵启动序列 `RhineBoot.astro`

- 仅 `MainGridLayout` 在首页挂载，且 `data-home=1` 才播放。
- 触发：首次进入会话 / `?intro=1` / 引导页选择；`rhine-boot-enabled=0` 关闭；reduced-motion 直接移除。
- 无 JS 时默认 `hidden`，不阻塞；HTML 里保留 `?bootdebug=1` 调试参数（30s）。

### 8.4 全站彩蛋 `RhineEgg.astro`

- 挂在 `MainGridLayout`，任意博客页输入 `rhine` 触发；`/start/` 与 Portal 各自实现。
- 样式复用 `.rl-egg`（CSS 第 23 节）；`aria-hidden` 装饰层；12s 自动关闭。
- 页脚提示：`src/components/Footer.astro` 的 `HINT / 输入 rhine`。

### 8.5 内容与主题身份

- `src/config.ts`：标题「黯」、subtitle `RHINE LAB-STYLE PERSONAL ARCHIVE`、作者头像 `assets/images/demo-avatar.png`、社交链接、友链、`layoutConfig`。
- `src/components/rhine/RhineHero.astro`：标题/简介/CTA/数据条/6 个统计，坐标有 `TRIMONT · COLUMBIA`。
- 文章 frontmatter：`title/published/description/image/tags/category/draft`（schema 在 `src/content.config.ts`；加字段先改 schema）。

### 8.6 旧版归档 `/legacy-blog/`

- 代码在 `mayuxiao2021/legacy-blog`；构建 `BASE_PATH=/legacy-blog/`，资源全部带前缀。
- 不要把它并入主仓库构建；它只是「对照阅读」的历史快照。

---

## 9. 已修 Bug 清单（回归时可查）

| 编号 | 问题 | 修复点 |
| --- | --- | --- |
| B64 | `verify-release --full` 把 `--full` 当版本号 | `scripts/verify-release.mjs` 支持只传 flags，自动取最新 zip |
| B65 | Linux 下 `tar -tf` 读不了 zip、`zip -r .` 归档无根目录 | `verify-release` 用 unzip→python3→bsdtar 回退；`package.mjs` 归档统一带 `rhinelab-blog/` 根目录 |
| B66 | `bump.mjs` 替换 STATE 时误伤历史迭代号 | 只替换「阶段 / 本轮」行 |
| B67 | 友链内部链接没带 `BASE_PATH`，子路径下 404 | `src/components/widget/Links.astro` 用 `url()` |
| B68 | 嵌套文章 `guide/index.md` 的 OG 图路径不一致（生成 `guide-index.png`、页面找 `guide.png`） | `scripts/generate-og.mjs` 归一化 `/index$` |
| B69 | 摘要 Feed 先解码实体再剥标签，转义 iframe 残留可执行标签 | `src/utils/feed-utils.ts` 调整顺序，解码后再剥一次标签 |
| B70 | astro-compress 压缩第三方小游戏 HTML 报错 | `astro.config.mjs` 加 `Exclude`（EatKun/EatKano/jump play） |
| B71 | 公共封面图 / 小游戏精灵图缺 `width/height` | `ImageWrapper.astro` 给 public 图默认 1200×630；小游戏页补尺寸 |
| B72 | `check-links` 未剥离 `?query`，`/?intro=1` 被误判断链 | `scripts/check-links.mjs` 解析文件前 `split('?')[0]` |
| — | `/start/` 独立 Layout 与 Swup 容器结构不兼容 | 相关链接加 `data-no-swup`；`/start/` 不参与 Swup |
| — | 切换 Pages 源会清空 `cname`，根域名 404 | 重新 PUT `cname` + 手动触发 Pages build（见 10.2） |

历史迭代细节见 `ITERATIONS.md`（138+ 条）与 `CHANGELOG.md`。

---

## 10. 部署 Runbook

### 10.1 博客（日常最常用）

```bash
cd D:\admin\main\rhinelab-blog
pnpm verify
pnpm test:subpath
node scripts/package.mjs
node scripts/verify-release.mjs <version> --full --build
git add -A
git commit -m "feat: ..."
git push
```

推送后 `verify.yml` 与 `pages.yml` 并行：verify 约 8–10 分钟，pages 约 1–2 分钟。
刷新 <https://github.glmyx.eu.org/rhinelab-blog/build-info.json> 确认版本号。

### 10.2 根域名 Portal

```bash
# 改 rhinelab-blog/portal/index.html 后
git clone git@github.com:mayuxiao2021/mayuxiao2021.github.io.git
cd mayuxiao2021.github.io && git checkout portal
cp /path/to/rhinelab-blog/portal/index.html ./index.html
git commit -am "portal: ..." && git push
```

- Pages 构建查询：`GET /repos/mayuxiao2021/mayuxiao2021.github.io/pages/builds/latest` 直到 `status: built`。
- 若自定义域丢失（`pages.cname` 变成 null / 根域名 404）：
  `PUT /repos/{owner}/{repo}/pages`，body 带 `{"build_type":"legacy","source":{"branch":"portal","path":"/"},"cname":"github.glmyx.eu.org"}`，
  再 `POST /pages/builds` 手动构建。
- 回滚根域名到旧博客：把上述 Pages source 改回 `master`（旧 Fuwari 源码与历史都在），或临时把 source 换回旧 workflow 产出的构建。

### 10.3 旧版归档（一般不动）

`legacy-blog` 仓库 push 后走自己的 `pages.yml`；不要改它的 `base`。

### 10.4 截图流程（会话内）

1. `pnpm build`（或 `pnpm preview`）
2. 起静态服务：`cd dist && python -m http.server 4400`
3. 浏览器打开 `http://127.0.0.1:4400/...`，用 `<body>`/`html` 的 localStorage 切主题（博客 `theme`，Portal `rhine-theme`）
4. 截图后转 WebP（PIL，长边 1100）放进 `docs/screenshots/`
5. 移动端：用 `dist/mobile-preview.html`（iframe 390px）临时方案；重建 dist 会丢，重新生成即可

---

## 11. 当前指标与余量（v0.10.0）

| 指标 | 实测 | 预算 | 余量 |
| --- | --- | --- | --- |
| dist 总产物 | ≈ 12.0 MB (12012.0 KB) | 12.5 MB (12800 KB) | 94% |
| CSS 合计 | ≈ 306.8 KB | 420 KB | **73%** |
| JS 合计 | ≈ 3776.3 KB | 4300.8 KB | 88% |
| 字体 woff2 | ≈ 377.0 KB | 520 KB | 73% |
| 单页 HTML 最大 | 156.8 KB（安全研究长文） | 160 KB | **98% ⚠️** |
| OG | 155.0 KB | 260 KB | 60% |
| HTML 页 | 49（47 参与 SEO） | — | — |
| 图片 `<img>` | 83 张全部带尺寸 | — | — |
| 链接 | 3183 站内链接 / 315 锚点 / 363 资源，0 断链 | — | — |
| RSS / JSON Feed | 7 items | — | — |
| 发布包 | 342 文件 / 9.0 MB (`rhinelab-blog-v0.10.0.zip`) | — | — |

**结论：视觉层已接近预算上限。** 下一轮如果继续加 CSS，建议先按第 13 节做样式合并，或明确把 CSS/页面预算各提高 10–15%。

---

## 12. 已知问题 / 易踩坑

1. **Portal 源码双轨**：`rhinelab-blog/portal/index.html` 是镜像，真正部署在用户站 `portal` 分支；改完要手动同步，否则线上不变。可考虑后续做 CI 自动同步（见 13）。
2. **主题键未统一**：Portal 用 `rhine-theme`，博客用 `theme`；用户从 Portal 选暗色进入博客仍可能是亮色（反之亦然）。可统一为同一 key 或进入时传参。
3. **CSS / 单页预算接近上限**（95% / 94%），新增复杂组件容易先撞预算。
4. **`/start/` 与 Swup**：任何从/到 `/start/` 的内部链接都必须 `data-no-swup`；新增入口时别忘了。
5. **`check-seo` 排除第三方静态页**（EatKun/EatKano/jump play）；`check-a11y`/`check-links` 仍会扫它们，改这些页面可能触发门禁。
6. **根域名自定义域**：`github.glmyx.eu.org` 由用户站仓库持有；项目站（博客/旧版）也挂在该域的子路径下，改 Pages 设置时要同时保住 `cname`。
7. **旧 Fuwari 源**：`blog_astro` 与用户站 `master` 保持原样，不要提交、不要格式化、不要跑 `pnpm install` 改锁文件。
8. **Portal 无构建/无测试**：只有人工验证；改完至少检查亮/暗、390px、4 个跳转目标、彩蛋、启动开关。
9. **彩蛋浮层 a11y**：目前是 `aria-hidden` 装饰层 + 可点击按钮；若做严格无障碍审计，建议改为 `role="dialog"` 或纯视觉提示。
10. **本地预览服务/截图缓存**：`.shots/`、`dist/mobile-preview.html` 都被 gitignore，重建 dist 会丢，重做即可。

---

## 13. 下一轮建议（按优先级）

1. **CSS 瘦身**（P0）：合并/删除第 20–21 节的遗留规则，把 `.rl-start` 与 `.rhine-*` 的重复 keyframes 去重；目标 CSS 降到 370KB 以下，给后续留 10%+ 余量。
2. **主题键统一**（P1）：Portal 与博客共用 `theme` 或进入博客时带 `?theme=dark|light`；门户亮暗切换后进入博客保持一致。
3. **Portal 自动化**（P1）：在主仓库加 `scripts/sync-portal.mjs`（复制 `portal/index.html` 到用户站 clone 并 push），或在 CI 里校验两边 sha 一致。
4. **内容增厚**（P1）：把「研究员名录」扩成可点进单个干员的详情（RL 编号、档案摘录、相关文章），并与 8 篇博客/项目索引互链。
5. **更多小巧思**（P1，低成本）：研究员报告里的隐藏批注、档案卡翻面、搜索框输入 `RL-07` 直接跳转干员、启动序列不同日期/时间的状态行。
6. **视觉回归**（P2）：用 Playwright 固定桌面亮/暗 + 390px 截图，纳入 CI artifact；避免每次手动截图。
7. **订阅与分享**（P2）：文章底部加 RSS/分享/引用（Fuwari 自带分享已有，可检查是否被主题覆盖）。
8. **定时巡检**（P2）：GitHub Actions `cron` 每周跑 `pnpm verify` + 外链 200 检查（需处理外链不稳定）。
9. **i18n**（P3）：当前中文+英文微标签；若要英文版，先抽 `siteConfig.lang` 与文案字典。
10. **根域名 Portal 的正式工程化**（P3）：把 Portal 作为独立小仓库/子目录构建，避免双轨。

---

## 14. 给下一个 AI 的操作纪律

- **先读**：本文件 → `docs/ACCEPTANCE.md` → `docs/ASSETS.md` 3.1/3.2 → `ITERATIONS.md` 最后 3 条。
- **改任何东西前**：`git status` 确认工作区；`blog_astro` 是只读；`release/`、`dist/`、`.shots/` 不提交。
- **每轮流程**：修改 → `pnpm check` → `pnpm build`（必要时）→ `pnpm verify` → 浏览器截图（亮/暗/移动）→ 更新 `CHANGELOG.md` + `ITERATIONS.md` + `STATE.md` + `docs/ACCEPTANCE.md` → `pnpm test:subpath` → 打包/校验 → push → 等 Actions 双绿 → 线上抽查。
- **版本/迭代号**：`node scripts/bump.mjs <ver> <iteration>` 会同步 package/README/STATE/MILESTONE/CHANGELOG，但**不会**改 ACCEPTANCE 与 ITERATIONS 正文，记得手改。
- **破坏性操作必须问用户**：覆盖 `mayuxiao2021.github.io` 的 `master`、改 Pages 源、删旧仓库、切自定义域、删除线上内容。
- **不要**：force push 主分支、提交 `blog_astro` 改动、把 token 写进文件、把 `release/` 或 `node_modules` 提交。
- **验收以线上为准**：`build-info.json` 版本号 + `/`、`/rhinelab-blog/`、`/rhinelab-blog/start/`、`/legacy-blog/` 四个 URL 200，再算完成。
- **用户语言**：中文回复；重要结论先给结果，再给证据（命令输出/截图/URL）。

---

## 附录 A：核心 URL 速查

- 根入口：<https://github.glmyx.eu.org/>
- 博客：<https://github.glmyx.eu.org/rhinelab-blog/>
- 引导：<https://github.glmyx.eu.org/rhinelab-blog/start/>
- 名录：<https://github.glmyx.eu.org/rhinelab-blog/operators/>
- 旧版：<https://github.glmyx.eu.org/legacy-blog/>
- 备份访问：<https://mayuxiao2021.github.io/rhinelab-blog/>
- 仓库：
  - <https://github.com/mayuxiao2021/rhinelab-blog>
  - <https://github.com/mayuxiao2021/legacy-blog>
  - <https://github.com/mayuxiao2021/mayuxiao2021.github.io>（`portal` 分支 = 根入口；`master` = 旧 Fuwari 源）

## 附录 B：关键命令速查

```bash
# 本地预览 + 截图
cd D:\admin\main\rhinelab-blog && pnpm build
cd dist && python -m http.server 4400 --bind 127.0.0.1

# 全量验收
pnpm check && pnpm verify && pnpm test:subpath
node scripts/package.mjs && node scripts/verify-release.mjs --full --build

# 管线检查（不构建）
node scripts/check-links.mjs --strict
node scripts/check-a11y.mjs
node scripts/check-seo.mjs
node scripts/check-budget.mjs
node scripts/check-docs.mjs
```

## 附录 C：素材 / 版权

- 代码 MIT；文章 CC BY-NC-SA 4.0；自制 SVG/CSS 随代码。
- 非商业演示立绘：Aceship/Arknight-Images，版权鹰角网络，`docs/ASSETS.md` 3.1 有来源与移除清单。
- 友链静态小游戏：EatKano / EatKun 开源项目（上游许可），`public/EatKun-main/` 等，ASSETS 3.2 说明。
- 同人声明：与鹰角网络无隶属关系，非官方非营利；商用/再分发前按 ASSETS 移除演示素材。
