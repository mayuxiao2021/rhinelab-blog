# 迭代日志 · ITERATIONS

> 规则：**每一轮至少修复一个严重 bug，或增加一个创新点。** 每轮结束必须有构建/截图证据。
> 时间基准：Asia/Shanghai。目标窗口：2026-11-18 07:13 → 2026-11-19 07:13。

## Iteration 0 — 基座与侦察（07:13–07:20）

**动作**

- 侦察本机博客（`blog_astro`：Astro 6 / Fuwari / Svelte 5 / pnpm）与已沉淀的莱茵终端设计资料；
- 从 Fuwari 派生独立模板目录 `rhinelab-blog/`（不动原博客，原博客有未提交改动）；
- 通过 junction 复用已安装的 `node_modules`（离线环境，零新增依赖）；
- 基线构建：`astro build + pagefind` 通过（39 HTML / 8 页索引）。

**结论**：基座可用；发现 3 个继承自原博客的严重问题（见 Iteration 1）。

## Iteration 1 — 修三处严重问题 + 立设计系统（07:20–07:45）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B1 | 首页背景 404、切换背景按钮无效 | `banner.enable: true`，但 `public/banners/` 为空；`Layout.astro` 的 `import.meta.glob('/public/banners/*')` 对 public 目录不生效，兜底路径 `/banners/demo-banner.webp` 不存在 | 关闭 banner（默认），用纯 CSS「档案场」背景（网格 + 准星阵列 + 双色光）替代；保留用户自行启用 banner 时的降级样式（`filter/opacity`），不再出现空白首屏 |
| B2 | 数学公式原样输出、字数/阅读时间为空、admonition 与 GitHub 卡片样式失效、标题锚点失效 | `astro.config.mjs` 缺 `markdown` 段：`remark-math` / `rehype-katex` / `remark-reading-time` / `remark-directive(-rehype)` / `rehype-slug` / `rehype-autolink-headings` / `rehype-components` 全部未接线 | 补全 Markdown 管线（含 Shiki 亮暗双主题），并保留 `@astrojs/check` 可验证 |
| B3 | 模板仓库夹带个人内容（15MB 个人小游戏/图片、个人文章、含真实链接的配置） | 直接从个人博客派生 | 清空 `public/` 个人资源（仅留自制 `/rhine`）、替换 5 篇示例文章与 about、`config.ts` 去个人化；新增 `.gitignore` |

### 创新点

- **I1 设计系统落地**：以已确认基线（亮 `#eae5e1/#080a08/#9b7247`，暗 `#11181b/#e0e3dc/#c5a16b`）建立 `--rl-*` 令牌层，并映射回 Fuwari 的 `--primary/--card-bg/--radius-large` 等变量——组件逻辑零改动即可换肤。
- **I2 首页「档案封面」**：`RhineHero` 在构建期读取真实条目/分类/标签数与最近更新时间，生成 `ENTRIES / 条目` 等双语统计行；右侧扫描环水印 + 扫描线 + 四角角标，全部 CSS/SVG。
- **I3 归档编号系统**：文章卡片按分页序号生成 `X-001` 文件编号，卡片头 `FILE / 档案 · X-001`、分类 `CLASS xxx`，页脚 `WORDS / 字`、`MIN / 分钟`。
- **I4 刻度族阅读进度轨**：≥1440px 出现，2px 宽；默认 12px、悬停 24px、当前 33px，400ms 曲线——直接沿用莱茵终端的刻度交互规范。
- **I5 全自制图形族**：徽标（扫描环 + 双折线 + 刻度）、favicon、抽象观测者头像、两张项目预览 SVG；**零游戏版权素材**，素材来源记录在 `docs/ASSETS.md`。

### 验证证据

- `pnpm build`：**通过**（25 页；Pagefind 索引 6 页 / 908 词）。
- 构建产物无 banner 404 请求路径；`dist/pagefind/` 存在。
- 待补：浏览器亮/暗/移动端截图（下一轮补齐并作为验收基线）。

### 已知问题 / 下一轮候选

1. 亮暗双模式与移动端视觉验收（截图对比）；
2. 归档页时间轴、代码块头部、数学公式的实际渲染核对；
3. 主题包安装器（备份/回滚/干跑）；
4. `package.json` 仍保留未接线的 `@astrojs/partytown` 依赖（体积/整洁问题）；
5. Roboto 全子集未收窄，首屏字体体积可再优化；
6. 缺少 TOC / 阅读位置锚点（可作为下一创新点）。

## Iteration 2 — 暗色令牌失守 + Mermaid 静默失效（07:33–07:50）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B4 | 暗色模式整体发棕、卡片/代码块/许可证底色与色板不符 | 主题变量映射写在 `html:root`（特异性 0,1,1），被 Fuwari 的 `:root.dark`（0,2,0）整体压回 oklch 原生色；亮色正常、暗色失真，属"只有一半能用"的隐蔽问题 | 映射选择器改为 `html:root:root`（0,2,1），稳定压过 `:root` 与 `:root.dark`；实测 `--card-bg` 从 `oklch(.23 .015 70)` 恢复为 `#202a2f` |
| B5 | Mermaid 图表不渲染，原样显示代码 | Fuwari 的 mermaid 脚本按 `pre code.language-mermaid` 选择，但 Astro/Shiki 的语言信息在 `pre[data-language]` 上、code 无 class → 选择器永远为空，且渲染与复制按钮脚本存在竞态 | 重写渲染器：按 `pre[data-language="mermaid"]` 选择、优先替换 `.code-block` 容器、串行渲染；新增 mermaid 主题变量（亮/暗两套档案配色）与主题切换重渲染 |
| B6 | 主题安装器 dry-run 实际会写备份、回滚选错备份、默认复制依赖别名的组件 | 备份记录在 dry-run 分支未短路；回滚取最新目录而非最新「有变更」备份；组件依赖 `@/` 别名可能破坏目标站点 | dry-run 零写入；回滚只认含 manifest 且非空的备份并清理空目录；组件改为 `--with-components` 显式选择；端到端实测 dry-run/安装/幂等/回滚 |

### 创新点

- **I6 Mermaid 档案配色**：图表不再是默认蓝紫，而是与站点一致的黄铜线 + 暖灰节点（亮/暗各一套 `themeVariables`），切换主题时自动重渲染。
- **I7 文章页排版细化**：标题 `text-wrap: balance` + 字号收敛（消除 CJK 单字换行）；字数/阅读时间块、许可块、上下篇导航接入主题类名。
- **I8 主题安装器**：`theme/install.mjs` 零依赖，支持 `--dry-run / --minimal / --with-components / --rollback`，带时间戳备份与幂等注入，可把样式层安全装进任意 Fuwari 站点。

### 验证证据

- `pnpm build` 通过（v0.1.1，25 页 + Pagefind 索引）。
- 浏览器实测：暗色文章页 `--card-bg=#202a2f`、`--primary=#d9b988`、Mermaid 容器 1 个（已渲染）、剩余 pre 为普通代码块。
- 亮/暗文章页、归档、项目索引、404、390×760 移动端截图核对通过。
- Pagefind 搜索实测「观测」→ 4 条结果。
- 安装器四种模式（dry-run / 安装 / 幂等重装 / 回滚）在临时目标上实测通过。
- **打包验收**：`release/rhinelab-blog-v0.1.1.zip`（108 项，1.07MB，无 node_modules/dist/日志）；解压后单独 `pnpm build` **通过**（含 Pagefind）。
- 截图归档：`docs/screenshots/`（首页亮/暗、文章暗、归档、项目索引、404、移动端，共 452KB）。

### 已知问题 / 下一轮候选

1. TOC（目录）缺失 + `.rl-progress` 刻度进度轨仅有样式未挂载——合并成一个「刻度导航」创新点；
2. Astro 6 `markdown.remarkPlugins` 已 deprecated，需迁移到 `unified()`；
3. Roboto 全子集可收窄为 latin；清理未接线的 `@astrojs/partytown`；
4. 搜索面板 / 归档时间轴的剩余 Fuwari 结构样式继续收敛；
5. 自动化 a11y 检查（键盘遍历 + 对比度）。

## Iteration 3 — 类型门禁修复 + 目录 / 刻度导航（08:00–08:35）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B8 | 刻度进度轨"固定"失效：滚动时跟着内容走、宽屏下贴到内容容器右缘而不是视口右缘 | 祖先 `#content-wrapper` 带 `onload-animation`（`fade-in-up` 的 `transform: translateY(0)` + `fill-mode: forwards`），残留的 transform 让它成为 `position: fixed` 后代的包含块 | 内容容器单独换成纯透明度动画（`rl-content-in`），保留其余 onload 动画；换算「当前小节」算法从 IntersectionObserver 窄带改为视口 28% 探测（顶部/底部不再丢高亮），实测滚动前后 rail 的 y 坐标不变 |
| B7 | `pnpm check`（astro check）长期 **20 errors**，类型门禁红灯，`pnpm verify` 无法作为交付门槛 | 全部继承自 Fuwari 基座与本地改造：`astro:content` 失效导入 `AnyEntryMap`、`post.body` 可能 undefined、`getEntry` 可能为空、Svelte 组件多 slot 子节点类型不匹配、Swiper 回调隐式 any、`window.__BANNERS__` 未声明、侧栏索引隐式 any、Mermaid 客户端脚本隐式 any 等 | 逐项修：删除失效导入；`body ?? ''`；about 空内容显式抛错；`Search.svelte` 图标内置化（去掉 slot 多子节点）；`global.d.ts` 声明 `__BANNERS__`；PhotoSwipe 回调标注；SideBar 用 `Record<SidebarWidgetId, …>`；mermaid 变量显式类型 + `as any`。结果 **20 → 0 errors** |

### 创新点

- **I9 文章目录（实验步骤）**：`RhineToc` 读取 Astro `render()` 返回的 headings，生成 `01–07` 编号目录；当前小节随滚动高亮（左侧黄铜刻度 + 琥珀底色）；移动端默认折叠；标题里的自动锚点 `#` 已从目录文本中剥离。
- **I10 刻度导航进度轨**：把已定稿的「刻度族」样式接到真实滚动——≥1440px 右侧出现竖排刻度，当前小节 33px、悬停 24px、默认 12px；底部显示阅读百分比；支持点击跳转与 ↑/↓ 键在刻度间移动；Swup 换页后自动重绑。
- **I11 锚点舒适度**：给正文标题加 `scroll-margin-top: 6rem`，目录/锚点跳转不再被 sticky 导航遮住。

### 验证证据

- `pnpm check`：**0 errors**（63 files）；`pnpm build` 通过。
- 桌面 1280：目录卡片渲染 07 个条目、编号与层级正确。
- 宽屏 1500（iframe 模拟）：右侧刻度轨出现，当前项加长、百分比更新。
- 移动端 390：目录默认折叠为一行 `CONTENTS / 目录`，可展开；刻度轨按媒体查询隐藏。
- 刻度轨交互实测（1500 视口）：滚动 1200px 时 `active=第 3 节`、当前刻度 33px（其余 12px）、进度 74%、目录同步高亮；滚动前后 rail 视口坐标 y 不变。

### 已知问题 / 下一轮候选

1. Astro 6 `markdown.remarkPlugins` 已 deprecated → 迁移到 `unified()`；
2. 自动化 a11y 审计（键盘遍历、对比度、landmark/aria）；
3. 字体/依赖体积：Roboto 全子集收窄、清理未接线 `@astrojs/partytown`；
4. 归档页时间轴视觉细节；
5. 主题安装器增加「升级模式」与 README 版本对照。

## Iteration 4 — 可访问性硬化 + 检索终端筛选（08:05–08:35）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B9 | 文章页没有任何 `h1`：标题只是一个 `div`，屏幕阅读器/SEO 拿不到页面主标题 | Fuwari 原始实现用 div 排版 | 标题改为 `<h1 class="rl-post__title">`，视觉零变化；实测每篇文章 `h1Count=1` |
| B10 | 辅助文字对比度不达 WCAG AA：`--rl-muted #77756d` 在纸色上 **3.69:1**，`--rl-faint #8f8a80` 仅 **2.75:1**；Fuwari `.text-50`（50% 黑）约 3.7:1 | 沿用旧灰阶时只考虑观感，未做对比度核算 | 亮色令牌改为 `--rl-muted #5f5d55`（5.28:1）与 `--rl-faint #66645c`（4.74:1）；`.text-50` 统一映射到主题辅助色；输入框文字/占位符改为可见色 |
| B11 | 移动端检索面板结果超出视口且面板不可滚动 → 后面的结果点不到 | 面板为绝对定位且无高度约束 | `#search-panel` 增加 `max-height: min(72vh, 36rem)` + 内部滚动 + `overscroll-behavior`；实测 390×760 下面板 504px、内容 664px，可滚动 |
| B12 | 进度轨的 scroll/resize 监听在 Swup 每次换页后累积（长会话性能泄漏） | 换页只重绑不清理 | 增加 `window.__rlProgressCleanup` 全局清理钩子，换页先解绑再重绑 |
| — | 键盘用户无法跳过导航（WCAG 2.4.1） | 缺 skip link | 增加「跳到正文 / SKIP TO CONTENT」，`:focus` 时滑入、默认移出视口 |

### 创新点

- **I12 检索终端筛选**：接入 Pagefind filters——从构建索引读取分类/标签计数，在检索面板生成可点选 chip（含计数、`aria-pressed`、清除筛选、结果计数与空态）；同时把 pagefind body 收敛为「整篇文章」单容器，并把 `data-pagefind-filter` 注入文章容器，使分类/标签真正可被索引。
- **I13 语义结构**：文章标题升级为 h1，配合已有的 h2/h3 目录形成完整标题层级；关于页独立 pagefind body。

### 验证证据

- `pnpm check`：0 errors；`pnpm build`：通过。
- `window.pagefind.filters()` → `{category:{工程研究:2,机构档案:3}, tag:{…12 项}}`；`search(null,{filters:{category:'机构档案'}})` → 3 条；UI 点选后显示「RESULTS / 3 条档案（已筛选）」。
- 文章页 DOM：`h1Count=1`、`[data-pagefind-body]=1`、容器内 4 个 filter 字段（分类 + 3 标签）。
- skip link `:focus` 后 transform 归零（滑入可见）。
- 移动端 390×760：筛选 chip 正常换行、面板高 504px（内容 664px）可内部滚动。
- 发布包：`release/rhinelab-blog-v0.1.3.zip` 解压后独立构建通过。

### 已知问题 / 下一轮候选

1. Astro 6 `markdown.remarkPlugins` deprecated → `unified()` 迁移（需要 `@astrojs/markdown-remark` 直接依赖与 lockfile 更新）；
2. 归档页时间轴视觉细节；搜索摘录长度可调（当前 Pagefind `excerptLength: 20`）；
3. 体积：Roboto latin 子集、清理未接线 `@astrojs/partytown`；
4. 深色模式检索面板/刻度轨对比度复核截图。

## Iteration 5 — i18n 空文案 + 归档页语义 + 检索摘录净化（08:40–09:10）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B13 | 404 页 `<title>` 只剩站点名（如「莱茵档案 - …」），页面标题与描述为空 | 5 个语言包的 `pageNotFound` 全被留成空字符串 `''` | 补齐 en / ja / ko / zh_CN / zh_TW 翻译；实测 404 标题变为「页面不存在 - 莱茵档案」 |
| B14 | 归档索引 / 分类 / 标签 / 未分类页全部 **没有 h1**，且分类页与标签页的标题都写成「归档」，与实际内容不符 | `ArchivePanel` 只渲染时间轴，页面层没有语义标题 | `ArchivePanel` 增加 `title` / `kicker` 属性并输出 h1 + 「N ENTRIES / 条目」统计头；四类页面各自传入正确标题（分类 / 标签 / 未分类 / 全部） |
| B15 | 检索摘录被非正文文本污染：字数、阅读时间、日期、分类、标签、目录、许可、上下篇、评论占位全都进摘录 | pagefind 默认索引 body 内全部文本，未标注忽略区域 | 给统计行、元信息、目录、许可块、相关档案、Giscus、上下篇加 `data-pagefind-ignore`；并把标题自动锚点的 `#` 也标记忽略。实测摘录变为正文句子（如「本站不是公告栏，而是一座研究档案室…」） |

### 创新点

- **I14 相关档案 / RELATED**：文末按「同分类 +3 分、共享标签各 +2 分」打分，推荐最多 3 篇（`R-01…` 编号、日期与分类、悬停箭头），为长文提供下一步阅读路径并增强内链；该区块不进入检索索引。

### 验证证据

- `pnpm check` 0 errors（64 files）；`pnpm build` 通过。
- 归档页 DOM：`h1=1`（档案索引）、统计「05 ENTRIES / 条目 / INDEXED BY YEAR」。
- 404：`document.title = 页面不存在 - 莱茵档案`。
- 文章页：`h1=1`、相关档案 3 条（同分类优先，其次共享标签）。
- Pagefind：`search('档案')` 首条摘录已是正文文本；关于页标题不再带尾部 `#`（锚点已忽略）。

### 已知问题 / 下一轮候选

1. Astro 6 markdown `unified()` 迁移（需新增直接依赖并同步 lockfile）；
2. 深色模式检索面板 / 归档头部对比度截图复核；
3. 字体 latin 子集与未接线 `@astrojs/partytown` 清理；
4. 主题安装器支持 TOC / 相关档案等新组件的可选安装。

## Iteration 6 — 检索面板生命周期 + 档案统计页（09:15–09:45）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B16 | 从检索结果点击进入文章后，检索面板仍停留在打开状态并显示**上一页的旧结果**；按 Esc 无法关闭；开关按钮没有 `aria-expanded` / `aria-controls`，屏幕阅读器不知道展开状态 | Fuwari 的 Search 组件没有换页生命周期处理，面板状态由类名独自维护 | 增加 `panelOpen` 状态与 `openPanel/closePanel/syncPanelState`；监听 `astro:after-swap` 关闭面板、点击结果关闭、Esc 关闭；开关按钮补 `aria-expanded` / `aria-controls`；`MutationObserver` 式同步（点击外部关闭时状态也能跟上） |
| B17 | 桌面端按 Esc 后焦点丢失：代码把焦点交给 `lg:hidden` 的移动端开关按钮，隐藏元素无法聚焦 → 焦点落到 `body` | 未区分断点 | 桌面端 Esc 后回焦搜索输入框、移动端回焦开关按钮；实测焦点回到可见输入框 |

### 创新点

- **I15 档案统计页 `/stats/`**：构建期计算、零第三方统计——KPI（条目 / 总字数 / 总阅读分钟 / 分类 / 标签）、月度入档条形图、分类分布、Top 标签、最长条目 Top 5（L-01… 编号 + 字数/分钟），全部纯 CSS 条形图，亮暗双模式与移动端（KPI 2 列、面板单列）适配。导航新增「统计」。

### 验证证据

- `pnpm check` 0 errors（65 files）；`pnpm build` 通过。
- 检索生命周期实测：打开面板 `aria-expanded=true` → 点击结果经 Swup 换页后面板 `float-panel-closed`、`aria-expanded=false`、标题/h1 已更新；Esc 关闭且焦点回到可见输入框。
- 统计页桌面 1280 / 移动 390×760 截图核对：KPI、月度、分类/标签条形、最长条目均正常。
- 导航 6 项（首页/归档/关于/项目/统计/源）在 1280 宽度不换行。

### 已知问题 / 下一轮候选

1. Astro 6 markdown `unified()` 迁移（需新增直接依赖 + lockfile 同步）；
2. 深色模式检索面板 / 统计页对比度复核；
3. 字体 latin 子集与未接线 `@astrojs/partytown` 清理；
4. 主题安装器支持 TOC / 相关档案 / 统计页等新组件的可选安装；
5. Pagefind `excerptLength` 可配置化。

## Iteration 7 — 社交分享 OG 图 + 元信息修复（09:50–10:20）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B18 | 全站没有可用的社交分享图：无 `og:image`、无 `og:locale`、`twitter:card` 在无封面时降级为 `summary`；文章分享出去只有纯文本 | 旧实现仅在有封面时输出 `og:image`，且没有默认图与尺寸声明 | 构建期生成每篇文章专属 OG 图 + 站点默认图（1200×630），Layout 统一输出 `og:image` / `og:image:width/height/alt` / `og:locale` / `twitter:card=summary_large_image` |
| B19 | 404 页没有 `robots: noindex`，错误页可能被搜索引擎收录；且 404 页仍输出 `og:type=article` 语义 | 缺少页面级 noindex 开关 | `Layout` / `MainGridLayout` 增加 `noindex` 属性，404 页传入；实测 404 HTML 含 `<meta name="robots" content="noindex, follow">` |
| B20 | RSS 的 `<language>` 为 `zh_CN`（下划线不是 RFC 语言标签写法），部分阅读器/校验器会报错 | 直接复用站点内部 locale 常量 | 输出前转成 `zh-CN` |

### 创新点

- **I16 构建期 OG 图生成器**：`scripts/generate-og.mjs` 用 sharp（Apache-2.0，已有依赖）把自制 SVG 模板栅格化为 1200×630 PNG——档案卡版式（双线扫描环、四角角标、`X-00N` 档案号、标题按词宽自动换行、日期/分类/来源字段、同人声明）；每篇文章一张 + 站点默认图；接入 `pnpm build`（先生成再构建），生成物写入 `public/og/` 并在 `.gitignore` 中排除；生成失败只告警不阻断构建。

### 验证证据

- `pnpm check` 0 errors（65 files）；`pnpm build` 通过，日志含 `[og] generated 5 post images + default.png`。
- `dist/og/` 6 张 1200×630 PNG；文章页 `og:image=https://example.com/og/00-archive-init.png`；首页/关于/404 回落到 `/og/default.png`。
- 404 输出 `robots noindex, follow`；`dist/rss.xml` 的 `<language>zh-CN</language>`。
- OG 样图（默认图 + 文章图）已肉眼核对：中文字形、标题换行、扫描环与角标均正常。

### 已知问题 / 下一轮候选

1. OG 生成依赖构建机中文字体（Windows/macOS 自带；Linux 需装 Noto Sans CJK），文档已注明；
2. Astro 6 `unified()` markdown 迁移（暂缓：需要直接依赖 + lockfile 同步，避免给模板引入脆弱 shim）；
3. 字体 latin 子集与未接线 `@astrojs/partytown` 清理；
4. 主题安装器支持新组件（TOC / 相关档案 / 统计页）可选安装；
5. 深色模式下新组件（检索面板、统计页）对比度复核。

## Iteration 8 — 站内链接检查器 + 空链接/可聚焦禁用控件修复（10:25–10:55）

### 创新点

- **I17 站内链接 / 锚点 / 资源检查器**：`scripts/check-links.mjs` 在构建后扫描 `dist/`——内部 `<a href>`（目录→index.html、URL 编码解码、忽略外链/协议）、跨页与同页 `#锚点`（支持无引号 id）、`img/script/stylesheet/icon` 资源、sitemap URL → 产物映射、每页 h1 数量；`--strict` 下有问题即退出 1；接入 `pnpm check:links`，并串入 `pnpm verify`（build 后自动跑）。首轮实测：26 页面 / 935 链接 / 81 锚点 / 112 资源，0 断链。
- 脚本本身经过校准：排除 `data-id` 被误判为 `id`、`meta name="theme-color"` 被误判为重复 id 的假阳性。

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B21 | 分页「上一页/下一页」在禁用态仍是可聚焦的 `<a>`：没有可访问名称，且 `href` 被兜底成 `/`（会跳回首页） | 用 `class:list` 加 `disabled` 类做视觉禁用，但 DOM 仍是链接 | 拆成条件渲染：启用态 `<a aria-label="上一页 / Previous Page">`，禁用态改为非交互 `<span aria-hidden="true">`；实测首页（单页）无任何空链接 |
| B23 | 文章页「上一篇/下一篇」导航**从未显示过**：`getSortedPosts()` 会把相邻文章写回 `entry.data`，但文章页 `getStaticPaths` 直接用了 `getCollection()`，于是 prev/next 永远为空 | 数据源不一致（列表页用 getSortedPosts，详情页用 getCollection） | 详情页改走 `getSortedPosts()`；实测中间文章出现「上一篇：03…」「下一篇：01…」，首/末篇只出现单侧 |
| B22 | 文章「上一篇/下一篇」在没有相邻文章时渲染为空的 `<a href="#">`（每篇 2 个，共 10 处空链接，可聚焦、无名称） | `entry.data.nextSlug && …` 只控制了内部 div，外层 `<a>` 仍渲染 | 改为条件渲染：有相邻文章才输出链接并带 `aria-label="上一篇：…"`，否则输出 `aria-hidden` 占位 span |

### 验证证据

- `pnpm build` 通过；`pnpm check:links --strict`：26 页面、0 断链/0 锚点错误/0 资源缺失。
- 空链接审计：修复前 12 处 → 修复后 **0 处**；分页/上下篇 DOM 复核通过。
- 上下篇导航可视化验收：文章 02 显示左右两条链接（带 `aria-label="上一篇：…"` / `"下一篇：…"`），截图存档 `docs/screenshots/prev-next.webp`。
- `pnpm verify` 现已包含：`astro check` → OG 生成 → 构建 → Pagefind → 链接检查。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓，理由见上轮）；
2. 主题安装器支持新组件可选安装；
3. 字体 latin 子集 + 未接线 `@astrojs/partytown` 清理；
4. 深色模式新组件（检索面板 / 统计页 / 归档头部）对比度复核截图；
5. RSS 内容渲染可换成 Astro 渲染结果（当前 markdown-it 简易渲染）。

## Iteration 9 — 主题安装器 v2（组件 / 只读模式 / 自测）（11:00–11:35）

### 创新点

- **I18 主题安装器 v2**：
  - `--with-components` 从 2 个组件扩展到 **5 个**（徽标 / 首页封面 / 目录 / 刻度进度轨 / 相关档案），并自动把 `@/`、`@utils/`、`@components/` 等别名**改写为相对路径**——目标站即使没有 tsconfig paths 也能直接编译；
  - 新增 `--list`（只列计划）与 `--verify`（只验证当前安装状态），两者都不写盘；
  - 安装结束自动自检（CSS / Layout 注入 / 组件齐全）；
  - 新增 `theme/selftest.mjs`：在隔离临时目录里跑「安装 → 幂等重装 → 验证 → 回滚 → 还原校验」共 20 项断言，`pnpm verify` 已包含该自测。
- 修复前：安装器只读模式会创建备份目录；组件依赖 `@/` 别名，在没有别名配置的 Fuwari 站点会编译失败。

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B24 | 安装器「只读」模式（`--list`）会在目标站点意外创建 `.rhine-backup/<时间戳>/` 空目录——对用户项目产生非预期写入 | 备份目录在参数解析后立即创建，早于 `--list` / `--verify` 的提前退出 | 备份目录改为惰性创建（真正写文件时才 `mkdir`）；实测 `--list` / `--verify` / `--dry-run` 均 **零写入**（目标无 `.rhine-backup`） |
| B25 | `--with-components` 复制出的组件依赖 `@/` 别名，目标站未配置 paths 时无法编译 | 直接原样复制源文件 | 复制时按组件所在目录把别名重写为相对路径，并在自测中断言「不含 `@/`、相对路径正确」 |

### 验证证据

- `node theme/selftest.mjs`：**20 项断言全部通过**（安装 / 别名改写 / 幂等 / `--verify` / `--rollback` / 还原）。
- 对真实博客 `..\blog_astro` 做 `--list` / `--dry-run --with-components` / `--verify`：均为零写入，未生成 `.rhine-backup`；原博客文件保持原样。
- `--list` 输出与 `--dry-run` 计划一致（10 项：CSS + 5 组件 + 3 素材 + Layout 注入）。
- 安装器自测已接入 `pnpm verify`。

## Iteration 10 — 构建产物瘦身 / 体积预算 / 移动端菜单修复（11:40–12:20）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B28 | **移动端汉堡菜单点不开**（面板始终 `float-panel-closed`、opacity 0），导航在手机上不可用 | `themeColor.fixed: true` 时调色按钮不渲染，但 Fuwari 的 `loadButtonScript()` 用 `settingBtn!.addEventListener(...)` 非空断言，抛错后**中断整个脚本**，后面的菜单按钮绑定从未执行 | 改为空值保护 `settingBtn?.addEventListener`，面板同样可选；实测面板可打开（opacity 1，6 个导航项），截图见 `docs/screenshots/mobile-menu.webp` |
| B26 | 构建产物携带大量未使用资源：旧格式字体 `.woff`/`.ttf`（KaTeX CSS 的 fallback 引用）、Roboto 全语言子集（含 cyrillic/greek/vietnamese）、未使用的 JetBrains Mono 斜体、Pagefind 自带 UI 脚本样式 | 字体按整包引入、未做产物裁剪 | 字体只引 latin 子集 + 去斜体；新增 `scripts/optimize-dist.mjs`：删除 woff/ttf 与 CSS fallback、删除未用 Pagefind UI 资源 |
| B27 | 暗色模式下标本头像是一块亮白纸（SVG 固定浅色背景），在深色界面里刺眼 | 头像素材本身是浅色设计，未做暗色适配 | 暗色下对头像加轻微 `brightness(.84)/sepia(.06)` 滤镜，保留标本质感 |

### 创新点

- **I19 构建产物优化管线**：`pnpm build` 现在附带 `scripts/optimize-dist.mjs`。实测产物 **7478 KB → 5848 KB（−1630 KB / −21.8%）**；其中 JS 3969→3623 KB、CSS 394→306 KB、字体 woff2 607→377 KB，删除 50 个未用/旧格式资源共 1249.8 KB。
- **I20 体积预算检查**：`scripts/check-budget.mjs` 对「总产物 / JS / CSS / 字体 / 单页 HTML」五项设预算并给出百分比，超预算退出 1；已接入 `pnpm verify`。当前：88% / 84% / 73% / 73% / 82%，全部通过。

### 验证证据

- `pnpm build` 通过；`[optimize] 删除旧字体/未用资源 50 个（1249.8 KB）`；`check-budget` 全绿；`check-links --strict` 0 断链。
- 字体加载实测：`document.fonts.check('16px Roboto') === true`、JetBrains Mono 为 true；首页/统计页亮暗截图无字体回退异常。
- 移动端 390×760：汉堡菜单可打开（opacity 1，链接齐全）；暗色统计页与检索面板对比度核对通过。
- 暗色头像滤镜生效（截图核对）。

### 已知问题 / 下一轮候选

1. Mermaid 分块仍较重（~2.3MB，按需加载），文档需明确说明；可考虑按需裁剪 Mermaid 图表类型；
2. Astro 6 `unified()` markdown 迁移（持续暂缓）；
3. RSS 可改用 Astro 渲染结果；
4. 主题安装器文档补充「文章增强」接线步骤示例；
5. 中文系统字体栈在不同平台（macOS/Linux）的最终渲染截图。

## Iteration 11 — 系列（SERIES）内容支持 + CSS 资源检查（12:25–13:00）

### 创新点

- **I21 系列 / SERIES**：
  - 内容 schema 新增 `series` / `seriesOrder` 字段；
  - 新增 `src/utils/series-utils.ts`：按系列名聚合、按 `seriesOrder`（缺省回退发布时间）排序，单条目系列自动不显示；
  - 新增 `RhineSeries.astro`：`SERIES / 系列 · 建站日志` 头部 + `03 / 04` 计数 + 刻度进度条 + 条目列表（当前条目高亮 `▸`、`aria-current="page"`、日期右对齐），移动端隐藏日期列；
  - 4 篇示范文章归入「建站日志」系列（00→03），第 99 篇保持独立，用于展示“无系列时不渲染”；
  - 相关档案块之前插入系列块。
- **I17 增强**：`check-links.mjs` 新增 **CSS 内 `url()` 资源引用检查**（字体/图片），本轮共检查 139 个资源引用，0 缺失。

### 严重 bug 修复

- 本轮未发现新的严重 bug；交互回归（目录锚点跳转 / 亮暗切换 / Mermaid 渲染 / 代码复制 / 上下篇 / 移动端菜单）全部复测通过。

### 验证证据

- `pnpm build` 通过；`check-links --strict`：26 页面 / 949 链接 / 81 锚点 / 139 资源，0 断链、0 资源缺失。
- 文章 02 系列块实测：4 条目、当前第 3 条、`03 / 04`、`aria-current=1`、刻度前 3 段点亮；文章 99 无系列块（返回 null）。
- 截图：`docs/screenshots/series.webp`（亮色）；系列块位于相关档案上方。
- 交互回归均正常：目录点击 `#构建与检索` → hash 更新 + scrollY 892 + 无整页刷新；主题开关 light→dark→auto；Mermaid 渲染为 SVG（`.mermaid-container`）；上下篇链接存在；移动端菜单可打开。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓，理由已记录）；
2. Mermaid 分块体积大，考虑在文档中注明/提供未启用 Mermaid 的精简配置；
3. RSS 改用 Astro 渲染结果（KaTeX/Mermaid 后的 HTML）；
4. 系列页 `/series/` 汇总视图（可选）；
5. 中文字形在 macOS/Linux 的最终截图核对。

## Iteration 12 — 系列索引页 / JSON-LD 强化 / 404 最近档案（13:05–13:45）

### 创新点

- **I22 系列索引页 `/series/`**：汇总所有系列——`SERIES / 系列`、`ENTRIES / 系列条目`、`TOTAL / 全部档案` 三项计数；每个系列一块（`SERIES 01 · 建站日志`、`04 FILES`、刻度条、编号条目列表、`PERIOD / 跨度`）；无系列时显示空状态提示；页脚新增 `SERIES` 入口。
- **I23 JSON-LD 强化**：文章结构化数据补齐 `description` / `image`（构建期 OG 图）/ `wordCount` / `keywords` / `mainEntityOfPage` / `inLanguage` / `publisher`，`datePublished` 改为 ISO；同时移除旧的 `// TODO include cover image here`。
- **I24 404「最近档案」**：在 404 页面增加最近 3 条档案（`X-001…` 编号 + 分类），让误入者可一键回到内容；并修复该区块与描述文字间距过窄的排版问题。

### 严重 bug 修复

- 本轮未发现新的严重 bug；修复 404 新增区块的间距/分隔线排版缺陷（视觉缺陷）。

### 验证证据

- `pnpm build` 通过；`check-links --strict`：**27 页面 / 1013 链接 / 82 锚点 / 143 资源，0 断链**。
- 系列索引页 DOM：1 个系列、4 条目、`PERIOD 2026-11-01 — 2026-11-18`、页脚 SERIES 链接存在；截图 `docs/screenshots/series-index.webp`。
- 404：最近档案 3 条（`/posts/03-interface/`、`/posts/02-reproducible/`、`/posts/01-observation/`）；截图 `docs/screenshots/404.webp`。
- JSON-LD 实测字段：`@type/headline/description/keywords/author/publisher/datePublished/inLanguage/mainEntityOfPage/image/wordCount`，`wordCount=379`、`image=https://example.com/og/02-reproducible.png`。

### 已知问题 / 下一轮候选

1. 系列索引页目前只在页脚入口，可考虑归档页顶部加筛选入口；
2. Astro 6 `unified()` markdown 迁移（持续暂缓）；
3. RSS 改用 Astro 渲染结果；
4. Mermaid 体积策略文档化；
5. 主题安装器对系列能力的说明已加入 theme/README。

## Iteration 13 — 档案时间线 / TIMELINE（13:50–14:25）

### 创新点

- **I25 档案时间线 `/timeline/`**：
  - 按年份分组（`2026` + `05 ENTRIES / 条目`），年份之间用发丝线分隔；
  - 每条档案挂在同一根竖向刻度线上：日期（`11.18`）+ 标题 + 分类/标签；节点为空心方块，悬停填充并高亮标题；
  - 头部指标：`YEARS / 年份`、`ENTRIES / 条目`、`SPAN / 跨度`；
  - 页脚新增 `TIMELINE` 入口；sitemap/链接检查自动纳入。

### 迭代内修复

- 移动端时间线最初用 `writing-mode: vertical-rl` 渲染日期，5 个日期的竖排高度超过行高导致日期串压、与节点错位 → 改为移动端日期横排于标题上方、节点固定于轨道，390×760 截图复核通过。

### 验证证据

- `pnpm build` 通过；`check-links --strict`：**28 页面 / 1077 链接 / 83 锚点 / 147 资源，0 断链**。
- 时间线 DOM：`h1=编目沿革`、1 个年份（2026）、5 个条目、页脚 TIMELINE 链接存在。
- 桌面 1280 与移动 390×760 截图核对：刻度线、节点、日期、标题层级均正常；移动端无横向溢出（scrollWidth 375 < clientWidth 390）。
- 截图：`docs/screenshots/timeline.webp`、`docs/screenshots/timeline-mobile.webp`。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. RSS 改用 Astro 渲染结果；
3. 清理 `astro check` 的 29 条历史 hints（未使用变量等）；
4. Mermaid 体积策略文档化；
5. 时间线可按分类过滤（低优先）。

## Iteration 14 — 目录滚动高亮 + 类型检查提示清零（14:30–15:10）

### 创新点

- **I26 目录滚动高亮（TOC scrollspy）**：
  - 以视口 30% 处为阅读位置探针，随滚动实时高亮当前小节：编号前出现 `▸`、黄铜色高亮、文字加粗，并设置 `aria-current="location"`；
  - 点击目录项立即高亮（不等滚动节流）；移动端点击后自动收起目录，直接看到正文；
  - 通过 `window.__rlTocCleanup` 在 Swup 换页时清理旧监听并重建，避免重复绑定。

### 代码质量

- **I27 类型检查提示清零**：`astro check` 从 **30 hints** → **0 hints / 0 warnings / 0 errors**：
  - `content.config.ts` 改用 `astro/zod` 的 `z`（消除 17 条 `ts(6385)` deprecated）；
  - 移除未使用的 props / imports / 参数（`ArchivePanel.keyword`、`ButtonTag.size`、`License.slug`、`Layout.ImageWrapper`、i18n 重复导入、remark 插件未用参数等）；
  - JSON-LD 内联脚本显式标注 `is:inline`，消除 astro(4000) 提示。

### 验证证据

- `pnpm check`：**0 errors / 0 warnings / 0 hints**（69 files）。
- `pnpm verify` 首轮再次发挥作用：捕获 `global.d.ts` 中 `__rlTocCleanup` 声明落在模块作用域（`interface Window` 不在 `declare global` 内）→ 归位后通过。
- 目录高亮 DOM 实测：初始 `本地起步` active；滚动到「构建与检索」→ active 切换；回到顶部恢复首项；点击「部署到 GitHub Pages」→ 立即 active 且 scrollY=1211；Swup 跳转后新页面 `activeCount=1`、cleanup 函数存在。
- `pnpm build` + `check-links --strict`：28 页面 / 1077 链接 / 83 锚点 / 147 资源，0 断链。
- 截图：`docs/screenshots/toc-active.webp`（当前小节 `▸ 02 构建与检索` 高亮）。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. RSS 改用 Astro 渲染结果；
3. Mermaid 体积策略文档化；
4. 归档页增加时间线/系列顶部入口；
5. 中文字形跨平台截图核对。

## Iteration 15 — 分类与标签总览 / 索引互链（15:15–15:55）

### 创新点

- **I28 分类与标签总览 `/topics/`**：
  - 顶部统计：分类数 / 标签数 / 条目数；
  - 分类面板改为卡片式：名称 + `02 FILES · 40%` + 占比条 + `LATEST / 最近`（最新条目日期与标题，可点击）；
  - 标签云：按条目数加权字号（0.75–1.25rem）与字重（500/600/700），带 `#` 前缀与计数，点击进入对应标签归档。
- **I29 索引页互链**：归档页头部新增 `TIMELINE / 时间线`、`SERIES / 系列`、`TOPICS / 分类与标签` 三个快捷入口；侧栏「标签」组件底部新增「全部标签 / ALL TAGS →」。

### 迭代内修复

- `ArchivePanel.astro` 新增链接时缺少 `url` 导入导致构建失败（`ReferenceError: url is not defined`）→ 补齐导入后构建通过。

### 验证证据

- `pnpm build` 通过；`check-links --strict`：**29 页面 / 1202 链接 / 84 锚点 / 151 资源，0 断链**。
- `/topics/` DOM：2 个分类（`02 FILES · 40%` / `03 FILES · 60%`，最新条目链接正确）、12 个标签 chip、字号权重按条目数分级；截图 `topics.webp`。
- 归档页：3 个头部入口链接正确；侧栏「全部标签」指向 `/topics/`；移动端 390×760 无横向溢出、标签云换行正常（截图 `topics-mobile.webp`）。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. RSS 改用 Astro 渲染结果；
3. Mermaid 体积策略文档化；
4. 中文字形跨平台截图核对；
5. 归档页年份分组在只有 1 年时的展示可再简化。

## Iteration 16 — RSS 全文改用 Astro 渲染 / Mermaid 体积策略（16:00–16:40）

### 创新点

- **I30 RSS 全文升级**：`rss.xml.ts` 改用 `experimental_AstroContainer` + `render(post)` 渲染每篇文章的真实正文——
  - 与站内一致：标题（自动锚点已清理）、代码高亮（Shiki 内联色）、表格、admonition、KaTeX 公式；
  - KaTeX 同时保留 HTML 与 **MathML**（`<math><semantics>…`，带 annotation TeX），在不加载 CSS 的阅读器里仍有可读的数学结构；
  - 所有相对 `href/src` 转为绝对地址（0 条相对链接残留），XML 校验通过；
  - 渲染失败时自动回退到 markdown-it 渲染，不阻断构建。
- **I31 Mermaid 体积策略文档化**：在 README 增加「性能与体积」章节，说明 dist/JS/CSS/字体体量、Mermaid 分块体量与按需加载机制，以及不需要图表时的移除方法；`pnpm check:budget` 作为门禁。

### 验证证据

- `pnpm build` 通过；`dist/rss.xml` 5 个 item、XML 合法、相对链接 0 条、标题锚点残留 0 处。
- 渲染质量统计：KaTeX 7 处、MathML 2 处（示例 `E = mc^2` 的 `<semantics>` 结构完整）、`<table>` 5 处、Shiki `<pre>` 7 处。
- RSS 内容中站内链接均为 `https://example.com/...` 绝对地址；构建期无警告/错误。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. 中文字形跨平台截图核对；
3. RSS 可考虑增加 `content:encoded` 中的图片尺寸属性（当前无封面文章）；
4. 清理 `docs/screenshots` 体积（1.1MB）与重复截图；
5. 主题安装器 README 增补「文章增强接线」完整示例。

## Iteration 17 — 打印样式 / 安装文档补全（16:45–17:25）

### 创新点

- **I32 打印样式（`@media print`）**：文章可以直接「打印 / 另存为 PDF」——
  - 自动隐藏导航、侧栏、页脚、目录、进度轨、相关档案、系列块、上下篇、搜索/调色面板、返回顶部等交互元素；
  - 外层网格（新增 `#main-grid`）改为 `display:block` 单栏，白底黑字、去掉卡片边框阴影；
  - 代码块从「深色打印件」转为浅底黑字（同时隐藏复制按钮），外部链接展开为 `文字 (URL)`；
  - `pre/table/figure/blockquote` 避免跨页截断，`h2/h3` 后不立即分页；`@page` 设置 16mm/14mm 页边距。
- **I33 安装文档补全**：`docs/THEMING.md` 新增「文章增强组件接线」章节——TOC / 刻度进度轨 / 相关档案的复制即用代码、系列（SERIES）所需 schema + utils + 组件接线步骤、`getSortedPosts` 与上下篇的数据依赖提醒、打印样式说明。

### 验证证据

- `pnpm build` 通过；`check-links --strict` 29 页面 / 1202 链接 / 151 资源 0 断链。
- 打印样式浏览器验证：抽取 18 条 `@media print` 规则以屏幕样式重放——导航 `display:none`、侧栏 `display:none`、目录 `display:none`、`#main-grid` 为 `block`、body 白底、代码块背景 `rgb(247,247,245)`、复制按钮隐藏、字数/阅读时长行隐藏。
- 截图：`docs/screenshots/print.webp`（单栏、浅色代码块、无交互元素）。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. 中文字形跨平台核对；
3. 截图像素体积可再压缩；
4. 归档页单年份展示可简化；
5. RSS 图片尺寸属性（当前示例无封面文章）。

## Iteration 18 — 移动端菜单生命周期 / 监听器泄漏 / 键盘快捷键（17:30–18:10）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B31 | 移动端导航菜单点击链接经 Swup 换页后**仍停留在打开状态**，盖住新页面内容 | 面板状态只在按钮点击时 toggle，没有换页生命周期处理（搜索面板此前已修，菜单漏修） | 菜单链接点击即收起；`astro:after-swap` 时强制关闭并重新绑定 |
| B32 | Swup 换页后按钮监听器**累积**：`loadButtonScript()` 每次换页都用 `addEventListener` 重复绑定，导致主题切换一次点击被触发多次、菜单按钮一次点击被 toggle 两次（等于失效） | 换页钩子重复注册监听器 | 全部改为 `onclick` 赋值（天然幂等），换页只重新赋值不叠加 |

### 创新点

- **I34 键盘快捷键**：`/` 聚焦搜索——桌面端直接聚焦搜索框，移动端自动打开检索面板并聚焦输入框；`Esc` 关闭移动端导航菜单（搜索面板的 Esc 关闭此前已实现）。

### 验证证据

- 移动端 iframe 实测：菜单打开 → 点击「归档」→ 换页后 `panelOpen=false`；换页后点击菜单按钮打开、再点关闭均单次生效；Esc 关闭（`escClosed=false` 表示已关闭）。
- 桌面端实测：按 `/` 后 `activeElement` 为搜索输入框（`INPUT:搜索文章`）。
- 移动端实测：按 `/` 后检索面板打开、焦点落在搜索输入框、输入「档案」返回 6 条结果；截图 `docs/screenshots/keyboard-search.webp`。
- `pnpm check`：0 errors / 0 hints（70 files）；`pnpm build` 通过。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. 截图像素体积压缩；
3. 归档页单年份展示简化；
4. 中文字形跨平台核对；
5. 站点地图/README 的「部署到子路径」说明。

## Iteration 19 — 子路径部署修复 / 部署指南 / 截图瘦身（18:15–19:05）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B33 | 部署到子路径（`base: '/repo/'`）时：canonical / `og:image` 出现 **`/repo/repo/…` 双重前缀**，JSON-LD `mainEntityOfPage` 同样错误；RSS 与 sitemap 之前也丢失 base | `url()` 对「已经带 base 的路径」（如 `Astro.url.pathname`）再次拼接 base；文章页与 Layout 对同一路径 `url()` 了两次 | `url()` 改为**幂等**（检测到已带 base 直接返回）；canonical 只取 origin + pathname；Layout 的 `og:image` 统一走 `url()`；文章页 JSON-LD 的 OG/`mainEntityOfPage` 同步修正；RSS 条目与 channel link 改绝对地址 |

子路径实测（`site: https://example.com/rhine-test`、`base: /rhine-test/`，临时构建后已还原）：

- canonical：`https://example.com/rhine-test/posts/02-reproducible/`（单前缀，无双写）；
- og:image：`https://example.com/rhine-test/og/02-reproducible.png`；
- RSS item link：`https://example.com/rhine-test/posts/03-interface/`；
- sitemap：`https://example.com/rhine-test/` 起头；
- 页面内 `_astro` 资源与 Pagefind 路径均带 `/rhine-test/`，HTML 中无 `/rhine-test/rhine-test/`。

### 创新点

- **I35 部署指南 `docs/DEPLOY.md`**：构建前检查、GitHub Pages Actions 工作流、Cloudflare/Netlify/Vercel 对照表、**子路径部署检查清单**（canonical / OG / RSS / sitemap / Pagefind / 404）、常见问题（OG 中文字体、搜索无结果、`site` 未改等）；README 增加入口。
- **I36 截图资产瘦身**：`docs/screenshots/*.webp` 最长边压到 1000px、quality 80，体积 **1091 KB → 673 KB（−38%）**，同步减小发布 zip。

### 验证证据

- 子路径构建 `BUILD=0`，上述 5 项链接/元信息检查全部通过；还原配置后正常构建 `BUILD=0`。
- 正常构建：`check-links --strict` 29 页面 / 1202 链接 / 151 资源 0 断链；`check-budget` 全绿；canonical 为 `https://example.com/posts/02-reproducible/`。
- 浏览器截图复核文章页（正常路径）无回归。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. 归档页单年份展示简化；
3. 中文字形跨平台截图核对；
4. `docs/DEPLOY.md` 可补 Nginx/Caddy 静态托管示例；
5. 主题安装器在 base 站点下的资源路径验证。

## Iteration 20 — PWA manifest / 子路径封面图修复（19:10–19:50）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B34 | 子路径部署时**项目索引页的封面图**直接使用原始 `/rhine/project-*.svg`，没有走 base，导致 404、卡片封面空白 | gallery 页 `<img src={project.image}>` 未经过 `url()` | 改为 `url(project.image)`；子路径构建实测封面路径为 `/rhine-test/rhine/project-blog.svg` |

### 创新点

- **I37 PWA Manifest + 应用图标**：
  - `scripts/generate-icons.mjs`：用 sharp 从**自制 favicon.svg** 生成 180/192/512 PNG（`public/icons/`），失败不阻断构建；
  - `src/pages/manifest.webmanifest.ts` 构建期输出 PWA manifest（name/short_name/lang/`start_url`/`scope` 全部经 `url()`，子路径部署正确），含 `any` 与 `maskable` 图标；
  - Layout 注入 `<link rel="manifest">` 与 `apple-touch-icon`；`build` / `verify` 脚本加入图标生成步骤。

### 验证证据

- `pnpm build`：`[icons] generated 3 icons`，`dist/icons/icon-{180,192,512}.png` 存在；`dist/manifest.webmanifest` 内容正确（`name=莱茵档案`、`start_url=/`、`scope=/`、3 个图标）。
- 浏览器实测 `/gallery/`：manifest `<link>` 与 apple-touch-icon 存在，`fetch(manifest)` 解析成功，2 张项目封面 `naturalWidth > 0`。
- 子路径临时构建（`base=/rhine-test/`）：项目封面 `/rhine-test/rhine/project-blog.svg`、manifest `id/start_url/scope=/rhine-test/`、图标 `/rhine-test/icons/icon-192.png`，且无双重前缀；还原配置后正常构建通过。
- `check-links --strict` 29 页面 / 1202 链接 / 151 资源 0 断链；截图复核项目索引页无回归。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. 归档页单年份展示简化；
3. 中文字形跨平台核对；
4. DEPLOY 补 Nginx/Caddy 示例；
5. PWA 可补离线缓存（当前仅 manifest/图标，不做 Service Worker，避免破坏静态缓存策略）。

## Iteration 21 — 分享与引用 / 高对比度模式（19:55–20:40）

### 创新点

- **I39 分享与引用条（`RhineShare.astro`）**：文章底部出现 `SHARE / 分享` 工具条——
  - 「复制链接」复制当前文章绝对地址；「复制引用」生成 `「标题」，莱茵档案，日期。URL`；
  - 触屏设备（`pointer: coarse`）自动显示「分享」按钮，优先 `navigator.share()`，不支持时回退复制链接；
  - 全部使用 **document 事件委托**，Swup 换页后无需重新绑定；按钮状态（已复制/复制失败）与 `role="status"` 的 `aria-live` 状态行提供反馈，不引入任何第三方脚本。
- **I40 高对比度 / 强制颜色模式**：
  - `prefers-contrast: more` 下把 `--rl-line/-strong/-muted/-faint` 提高对比度（用与主题令牌同特异性的 `html:root:root`，否则会被覆盖——首版就踩到这个问题）；
  - `forced-colors: active` 下为卡片/面板/系列/相关档案/标签/进度刻度补 `CanvasText` 系统色边框，进度高亮用 `Highlight`。
- **I41 字体跨平台文档**：README 新增「字体与跨平台」章节（Windows YaHei / macOS PingFang / Linux Noto CJK 回退栈、可选自托管 Noto Sans SC、OG 图构建需中文字体），THEMING 的「调字体」同步说明。

### 迭代内修复

- 分享按钮首次使用不存在的图标 `material-symbols:share-rounded` 导致构建失败 → 查图标集后改用 `material-symbols:ios-share-rounded`。

### 验证证据

- `pnpm build` 通过；`check-links --strict` 29 页面 / 1202 链接 / 151 资源 0 断链。
- 分享按钮实测：点击「复制链接」→ 文案变「已复制」、状态行「链接已复制到剪贴板」；「复制引用」→「引用信息已复制」；3 个按钮存在，桌面端系统分享按钮隐藏（`display:none`）。
- Swup 跳转后再点分享仍生效（`url=/posts/01-observation/`，状态行正常），说明事件委托跨页有效。
- 高对比度实测：注入 `prefers-contrast` 规则后 `--rl-muted=#45443d`、`--rl-line=#6b6a62`；`forced-colors` 规则 5 条存在。
- 截图：`docs/screenshots/share.webp`。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. 归档页单年份展示简化；
3. DEPLOY 补 Nginx/Caddy 示例；
4. Service Worker 离线缓存（评估后暂不加）；
5. 分享条可增加「复制 Markdown 引用」变体。

## Iteration 22 — 版本沿革页 / 打印按钮 / 自托管文档（20:45–21:25）

### 创新点

- **I42 版本沿革页 `/changelog/`**：构建期直接读取仓库根 `CHANGELOG.md` 并用 markdown-it 渲染——发布记录与代码**同一份来源**、零重复维护；页头统计 `RELEASES / LATEST / DATE`（当前 22 个版本、0.2.11）；页脚新增 `CHANGELOG` 入口；`aria`/暗色样式沿用主题令牌。
- **I43 打印 / PDF 按钮**：分享条新增第 4 个按钮，调用 `window.print()` 并提示「可直接另存为 PDF」；与 Iteration 17 的 `@media print` 样式联动——一键得到单栏白底 PDF。

### 验证证据

- `pnpm build` 通过；`check-links --strict`：**30 页面 / 1265 链接 / 85 锚点 / 155 资源，0 断链**。
- `/changelog/` DOM：`h1=版本沿革`、页头 `RELEASES=22 / LATEST=0.2.11 / DATE=2026-11-18`、正文 103 个行内代码、页脚 CHANGELOG 链接存在；整页截图核对排版与暗色令牌。
- 打印按钮实测（stub `window.print`）：按钮存在、`window.print` 被调用 1 次、状态行「已调起打印，可直接另存为 PDF」、分享条共 4 个按钮。
- DEPLOY 文档补 Nginx / Caddy / 子路径 `alias` 示例。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. 归档页单年份展示简化；
3. Service Worker 离线缓存评估（暂不加）；
4. 分享条可增加「Markdown 引用」变体；
5. changelog 页可给版本号加锚点（便于外链引用）。

## Iteration 23 — 编目热力图 / changelog 版本锚点（21:30–22:10）

### 创新点

- **I44 编目热力图（`/stats/`）**：最近 365 天每日入档数量的 CSS Grid 热力图——53 周 × 7 天、5 级色阶（`--rl-tint` → 黄铜）、`LESS/MORE` 图例、每格 `title` 日期与条目数、`role="img"` + `aria-label`；移动端横向滚动；亮暗双主题各有一套色阶。
- **I45 changelog 版本锚点**：`/changelog/` 的每个版本标题自动生成 `id="v0-2-0"` 与 `#` 锚点链接，便于外链到具体版本；悬停高亮、键盘可达。

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B35 | 热力图日期整体**偏移一天**：10-30 的条目显示在 10-31 格子里 | `formatDateToYYYYMMDD()` 基于 `toISOString()`（UTC），而热力图游标是本地日期；在 UTC+8 下本地零点 = 前一日 16:00Z | 热力图游标改用本地日期格式化 `ymdLocal()`，与条目 key 对齐；实测 5 个有稿日期（10-30/11-01/11-08/11-14/11-18）与格子完全一致 |

### 验证证据

- `pnpm build` 通过；`check-links --strict`：**30 页面 / 1288 链接 / 108 锚点 / 155 资源，0 断链**。
- 热力图 DOM：368 个格子、5 个非空（与 5 个发布日期一致）、说明行 `5 ACTIVE DAYS · 365 DAYS`；截图 `docs/screenshots/heatmap.webp`。
- changelog 锚点：23 个锚点链接；点击 `#v0-2-0` 后 `location.hash=#v0-2-0`、`scrollY=2906`、标题滚动到视口顶部（`h2Top=0`）。

### 已知问题 / 下一轮候选

1. Astro 6 `unified()` markdown 迁移（持续暂缓）；
2. 归档页单年份展示简化；
3. 分享条「Markdown 引用」变体；
4. Service Worker 离线缓存评估（暂不加）；
5. 热力图可加月份标签。

## Iteration 24 — 热力图月份标签 / 归档单年份简化 / Astro 迁移评估（22:15–23:00）

### 创新点

- **I46 热力图月份标签**：在 365 天热力图上方按周列对齐月份标签（首月 `11月`、跨年 `2026.01`、之后 `2月`…），相邻月份间隔不足 3 周自动跳过避免重叠；修复首版因字符串与数字混比导致的「12月」重复。
- **I47 归档页单年份简化**：当归档只有单个年份时，不再重复展示「5 条目」计数（页头已有），改为「按时间倒序 / NEWEST FIRST」，减少信息冗余。

### 迁移评估（未采纳，记录权衡）

- 尝试把 `markdown.remarkPlugins/rehypePlugins` 迁到 Astro 6 推荐的 `processor: unified({...})`：
  - 通过 `createRequire` 从 astro 依赖目录解析 `@astrojs/markdown-remark` 的 shim 方案**可以构建成功**，KaTeX / 表格 / 标题锚点 / 阅读时长等产物核对无误；
  - 但 Astro **6.4.8 本身会自动 coerce 旧配置**（`coerceLegacyMarkdownPlugins`），手动迁移后仍会额外触发 `markdown.gfm / markdown.smartypants` 弃用警告（源于上游默认值判断，属 Astro 当前版本行为）；同时 shim 依赖 `require(ESM)`（Node ≥22.12）与包布局，给模板引入额外兼容面。
  - 结论：**保留旧配置**（Astro 自动迁移、零回归），把弃用提示记录为已知上游告警；迁移 shim 已还原、未进入交付物。
- THEMING 常见问题补充该告警说明。

### 验证证据

- `pnpm build` 通过；`check-links --strict`：**30 页面 / 1289 链接 / 109 锚点 / 155 资源，0 断链**。
- 热力图：368 格；月份标签 `11月 / 12月 / 2026.01 / 2月 … 11月` 共 13 个；截图核对标签与周列对齐。
- 归档页年份行实测：`2026 按时间倒序 / NEWEST FIRST`（不再重复条目数）。
- markdown 产物回归：KaTeX、表格、标题锚点、`data-language=mermaid` 均在，阅读时长/字数正常。

### 已知问题 / 下一轮候选

1. Astro `unified()` 迁移等待上游修复 gfm/smartypants 警告；
2. 分享条「Markdown 引用」变体；
3. Service Worker 离线缓存评估（暂不加）；
4. 归档页可按年份折叠（多篇时）；
5. 全站 i18n 文案外置检查。

## Iteration 25 — 随机档案页 / Markdown 引用（23:05–23:45）

### 创新点

- **I48 随机档案 `/random/`**：构建期把全部文章序列化进页面，加载 350ms 后 `location.replace()` 到随机一条（阅读位置不污染历史）；
  - `?no=1` 预览模式（也是无脚本用户的兜底展示），页面同时给出归档入口与前 5 条可点清单；
  - 页面 `noindex` 且从 sitemap 排除（`sitemap.filter`），页脚新增 `RANDOM` 入口；
  - 抽取失败/空库自动回落 `/archive/`，整体为内联脚本、零依赖。
- **I49 分享条 Markdown 引用**：新增「MD 引用」按钮，复制 `[标题](URL)`，反馈文案独立（「Markdown 链接已复制」），与既有「复制链接 / 复制引用 / 打印 / 系统分享」共 5 个动作。

### 验证证据

- `pnpm build` 通过；`check-links --strict`：**31 页面 / 1301 链接 / 109 锚点 / 156 资源，0 断链**。
- `/random/`：带 `?no=1` 时展示标题 + 5 条回退清单；不带参数时 1.2s 后已跳转到 `/posts/00-archive-init/`（随机命中）；`sitemap-0.xml` 中无 `/random/`；首页页脚存在 RANDOM 链接。
- 分享条：5 个按钮，点击「MD 引用」→ 文案「已复制」、状态「Markdown 链接已复制」。
- 截图：`docs/screenshots/random.webp`。

### 已知问题 / 下一轮候选

1. 归档按年份折叠（多篇时）；
2. Service Worker 离线缓存评估（暂不加）；
3. 随机页可增加「再抽一次」按钮；
4. 全站 i18n 文案外置检查；
5. Astro `unified()` 迁移等待上游修复。

## Iteration 26 — 安装器 v3 / 许可台账补全（23:50–00:30）

### 创新点

- **I50 主题安装器 v3**：
  - `--with-components` 覆盖组件从 5 → **6**（新增分享条 `RhineShare`），并同时复制系列数据层 `src/utils/series-utils.ts`（同样做别名改写）；
  - 安装器横幅版本号改为**从 `package.json` 读取**，不再写死（此前仍显示 v0.1.9）；
  - `theme/selftest.mjs` 断言同步扩展到 6 组件 + 系列工具；
  - 对真实博客 `..\blog_astro` 做 `--dry-run --with-components`：计划 12 项（CSS + 6 组件 + 系列工具 + 3 素材 + Layout 注入），**零写入**。
- **I51 许可台账补全**：`docs/ASSETS.md` 增加「其余构建期依赖」表，逐项列 SPDX 许可（Shiki / markdown-it / sanitize-html / sharp / astro-icon / OverlayScrollbars / astro-compress / 官方集成 / remark-rehype 插件 / reading-time / partytown 未接线说明），并声明不含任何《明日方舟》官方素材；README 入口同步。

### 验证证据

- `node theme/selftest.mjs`：**26 项断言全部通过**（安装 / 6 组件 / 系列工具 / 别名改写 / 幂等 / verify / 回滚 / 还原）。
- `--dry-run --with-components` 真实目标：12 项计划、`no backup dir`（只读零写入）。
- 许可表逐项来自本机 `node_modules/*/package.json` 元数据核对；`remark-directive-rehype` 为 Unlicense、Roboto 为 Apache-2.0、图标集 CC-BY-4.0 / Apache-2.0 均已标注。

### 已知问题 / 下一轮候选

1. 归档按年份折叠；
2. 随机页「再抽一次」；
3. Service Worker 离线缓存评估（暂不加）；
4. 全站 i18n 文案外置检查；
5. 清理未接线的 `@astrojs/partytown`（需同步 lockfile）。

## Iteration 27 — 归档年份折叠 / 跨年演示 / 时间线跳转（00:35–01:15）

### 创新点

- **I52 归档页按年份折叠**：每个年份改为原生 `<details>/<summary>`——最新年份默认展开，旧年份折叠；chevron 随展开旋转、`summary` 可键盘操作；单年份时保留「按时间倒序 / NEWEST FIRST」文案。
- **I53 时间线年份快捷跳转**：时间线页顶部新增年份 chips（`2026 05` / `2025 01`），点击平滑跳到对应年份分组（锚点 `#timeline-YYYY`）。
- **I54 跨年份演示数据**：新增 2025 年归档条目（`2025 · 年度编目回顾`），让归档折叠、时间线多年分组、统计页跨年热力图都有真实数据可展示（365 天热力图新增 2025-12-20 一格）。
- **I55 随机页「再抽一次」**：`/random/` 增加 `再抽一次 / DRAW AGAIN` 入口，`?no=1` 预览页也可继续抽取。

### 验证证据

- `pnpm build` 通过；`check-links --strict`：**32 页面 / 1431 链接 / 122 锚点 / 164 资源，0 断链**。
- 归档 DOM：2 个年份组——2026 `open=true`（5 条）、2025 `open=false`（1 条）；手动展开 2025 后条目可见（1 条）。
- 时间线：年份 chips `2026 05` / `2025 01`；点击 2025 后 `location.hash=#timeline-2025`，分组标题在视口内。
- 热力图：non-empty 格子变为 **6** 个（新增 `2025-12-20`），说明行 `6 ACTIVE DAYS · 365 DAYS`。
- 截图更新：`docs/screenshots/timeline.webp`、`docs/screenshots/archive-light.webp`。

### 已知问题 / 下一轮候选

1. Service Worker 离线缓存评估（暂不加）；
2. 全站 i18n 文案外置检查；
3. 清理未接线 `@astrojs/partytown`（需同步 lockfile）；
4. 归档折叠状态记忆（localStorage）；
5. 统计页年度对比图。

## Iteration 28 — 年度对比 / OpenSearch 与 ?q= 直达检索（01:20–02:00）

### 创新点

- **I56 统计页「年度对比」**：按年份汇总条目数 / 总字数 / 总阅读分钟，条形按条目数归一，配合两年演示数据（2026：5 篇 2,174 字 11 分钟；2025：1 篇 298 字 1 分钟）。
- **I57 站内搜索外部集成**：
  - 新增构建期 `/opensearch.xml`（OpenSearch 1.1，`template` 走 `url()`，子路径部署正确），浏览器可把本站添加为搜索引擎；
  - Layout 注入 `<link rel="search" type="application/opensearchdescription+xml">`；
  - `Search.svelte` 支持 `?q=` 直达：读取 URL 查询参数 → 预填关键词 → 自动打开检索面板并执行检索；Swup 换页后同样生效。

### 迭代内修复

- 新增 `RhineShare` 时残留的未使用 `i18n` / `I18nKey` 导入触发 2 条 TS hints → 移除，`astro check` 恢复 **0 errors / 0 hints**。

### 验证证据

- `pnpm check`：0 errors / 0 hints（75 files）；`pnpm build` 通过；`check-links --strict`：**32 页面 / 1432 链接 / 123 锚点 / 164 资源，0 断链**。
- `/opensearch.xml`：`template=https://example.com/?q={searchTerms}`；首页 head 含 `rel=search`。
- `/?q=档案` 实测：检索面板自动打开、关键词为「档案」、返回 7 条结果。
- 统计页年度对比：2 行（2026 `05 FILES · 2,174 WORDS · 11 MIN`、2025 `01 FILES · 298 WORDS · 1 MIN`），页头 `02 YEARS`。
- 截图：`docs/screenshots/year-compare.webp`。

### 已知问题 / 下一轮候选

1. Service Worker 离线缓存评估（暂不加）；
2. 全站 i18n 文案外置检查；
3. 清理未接线 `@astrojs/partytown`（需同步 lockfile）；
4. 归档折叠状态记忆；
5. 搜索词高亮（Pagefind 返回 excerpt 的 `<mark>` 处理）。

## Iteration 29 — 检索键盘导航 / 关键词高亮（02:05–02:45）

### 创新点

- **I58 检索关键词高亮**：Pagefind 返回的 excerpt 中 `<mark>` 之前沿用浏览器默认高亮，现改为主题化样式（黄铜半透明底 + 墨色文字，亮暗各一套色阶）；
- **I59 检索键盘导航 + combobox 无障碍语义**：
  - 输入框补 `role="combobox"` / `aria-autocomplete="list"` / `aria-controls` / `aria-expanded` / `aria-activedescendant`；
  - 结果容器 `role="listbox"`，每条 `role="option"` + `aria-selected`；
  - `↑ / ↓` 在结果间循环移动并滚动到可见区，`Enter` 打开当前结果（走 Swup 导航，不整页刷新），选中项有左侧黄铜条 + 背景高亮；
  - 桌面搜索框与移动端面板内输入框都支持；每次新检索自动重置选中项。

### 验证证据

- `pnpm check`：0 errors / 0 hints（75 files）；`pnpm build` 通过；`check-links --strict`：**32 页面 / 1433 链接 / 124 锚点 / 164 资源，0 断链**。
- 检索 DOM：`role=option` 7 条、`listbox` 存在、`<mark>` 高亮 9 处。
- 键盘实测：`ArrowDown` 后输入框 `aria-activedescendant=rl-search-opt-0`、1 条 `aria-selected=true`、1 个 `.is-active`；`Enter` 跳转到 `/posts/00-archive-init/`（标题同步更新）。
- 截图：`docs/screenshots/search-highlight.webp`（高亮 + 选中态）。

### 已知问题 / 下一轮候选

1. Service Worker 离线缓存评估（暂不加）；
2. 全站 i18n 文案外置检查；
3. 清理未接线 `@astrojs/partytown`（需同步 lockfile）；
4. 归档折叠状态记忆；
5. 检索结果滚动时保持选中项可见的动效可再收敛。

## Iteration 30 — JSON Feed / 字体预加载 / 依赖清理（02:50–03:35）

### 创新点

- **I60 字体预加载**：Layout 通过 Vite `?url` 拿到 Roboto latin-400 与 JetBrains Mono latin 的最终哈希地址，输出两条 `<link rel="preload" as="font" type="font/woff2" crossorigin>`；实测首页 `performance` 中两条字体排在最前加载，`document.fonts.check` 为 true。
- **I61 JSON Feed 1.1**：新增 `/feed.json` 构建期端点，与 RSS 共用新的 `src/utils/feed-utils.ts`（Astro 容器渲染 → 绝对化链接 → 清理标题锚点 → sanitize），输出 `version/home_page_url/feed_url/authors/items`（`content_html` 含 KaTeX/MathML、表格、代码高亮）；Layout 加 `rel=alternate type=application/feed+json`，页脚加 `JSON` 入口；RSS 也改用同一工具，避免双份渲染逻辑漂移。

### 依赖清理

- 移除未接线的 `@astrojs/partytown`：`pnpm remove --lockfile-only` 同步 `package.json` + `pnpm-lock.yaml`（importer/包/快照全部清理），并用 `pnpm install --frozen-lockfile --lockfile-only` 验证锁文件一致；ASSETS 台账同步。

### 验证证据

- `pnpm check`：**0 errors / 0 hints**（77 files）；`pnpm build` 通过；`check-links --strict`：**32 页面 / 1466 链接 / 125 锚点 / 164 资源，0 断链**。
- `/feed.json`：JSON Feed 1.1、**6 items**、`content_html` 含 KaTeX、全部 URL 为 `https://example.com/...` 绝对地址、相对链接 0 条；`rel=alternate feed+json` 在 head 中。
- `/rss.xml`：6 items、仍含 KaTeX（重构未回归）。
- 预加载：2 条 preload、对应 `/_astro/*.woff2` 文件存在；浏览器 `performance` 记录两个预加载字体优先加载。
- 锁文件：移除 partytown 后 frozen-lockfile 校验 `EXIT=0`。

### 已知问题 / 下一轮候选

1. Service Worker 离线缓存评估（暂不加）；
2. 全站 i18n 文案外置检查；
3. 归档折叠状态记忆；
4. 索引页可加 JSON Feed / RSS 订阅按钮；
5. 字体预加载在慢网络下的取舍（目前只预载 2 个）。

## Iteration 31 — 代码块一键复制 / 归档状态记忆（03:40–04:25）

### 创新点

- **I62 代码块一键复制**：新增 `RhineCodeCopy` 组件——把文章内 Shiki `<pre>` 包进 `.rl-code-wrap` 并注入「复制」按钮（Clipboard API，旧浏览器降级 `execCommand`）；成功显示「已复制」+ 黄铜底 1.6s，失败显示「复制失败」；跳过 Mermaid 代码块与已包裹块；`astro:page-load` / `astro:after-swap` 自动重新增强（Swup 换页后仍可用）；打印时隐藏按钮。
- **I63 归档折叠状态记忆**：`/archive/` 的年份展开状态写入 `localStorage['rl-archive-years']`，刷新或 Swup 返回后恢复；隐私模式/不可写环境静默降级；未存过状态时仍按「最新年份默认展开」。

### 迭代内修复

- 新增组件引入 2 条 TS hints（`document.execCommand` 弃用、`RhineCodeCopy` 导入未挂载）→ 将降级调用改为类型化访问、把组件真正渲染到文章页，`astro check` 恢复 **0 errors / 0 warnings / 0 hints**（78 files）。

### 验证证据

- `pnpm check`：0/0/0；`pnpm build` 通过；`check-links --strict`：**32 页面 / 1467 链接 / 126 锚点 / 164 资源，0 断链**。
- 代码复制实测：`/posts/99-syntax/` 中 1 个非 Mermaid 代码块被包裹，点击后按钮变「已复制」、`is-done`、剪贴板收到 233 字符 TS 代码；Mermaid 块未被包裹；Swup 跳到 `/posts/02-reproducible/` 后重新出现 2 个复制按钮，点击复制到 `pnpm install...`（52 字符）。
- 归档记忆实测：手动展开 2025、折叠 2026 → `localStorage={"2025":true,"2026":false}`；整页重载后状态保持（2025 open / 2026 closed）。
- 截图：`docs/screenshots/code-copy.webp`。
- 安装器升级 v3.1：`--with-components` 覆盖 **7 个组件**（新增代码复制），selftest 断言同步（27 项）。

### 已知问题 / 下一轮候选

1. Service Worker 离线缓存评估（暂不加）；
2. 全站 i18n 文案外置检查；
3. 订阅入口集中化（RSS/JSON 说明页）；
4. 归档状态可加「全部展开/折叠」按钮；
5. 代码复制按钮在超长横向滚动块中的位置可再收。

## Iteration 32 — 订阅页 / 归档全部展开 / SW 评估结论（04:30–05:10）

### 创新点

- **I64 订阅与集成页 `/subscribe/`**：集中列出 RSS 2.0、JSON Feed 1.1、OpenSearch 三个入口，地址由 `url()` 生成（子路径部署正确）；每张卡片带「复制链接 / 打开」与 MIME 类型，复制时用 `location.origin` 补成绝对地址并回显「已复制 / COPIED」；页脚新增 `SUBSCRIBE` 入口。
- **I65 归档全部展开 / 折叠**：归档页索引栏新增切换按钮——有任一折叠时显示「全部展开」，全部展开后显示「全部折叠」；操作会触发既有 toggle 记忆逻辑，localStorage 同步；Swup 返回后按钮标签自动同步。

### 评估结论（Service Worker）

- 本轮对 Service Worker 离线缓存做了正式评估，**结论为暂不启用**：静态资源哈希 + Pagefind 索引 + Swup 缓存叠加易产生「旧 HTML/旧索引」更新语义问题；模板定位是可安装主题层，SW 注册会与目标站冲突、回滚成本高于 CSS 覆盖层。理由与替代方案写入 `docs/DESIGN.md`「离线与 Service Worker」一节；PWA manifest/图标保留。

### 验证证据

- `pnpm check`：**0 errors / 0 warnings / 0 hints**（79 files）；`pnpm build` 通过；`check-links --strict`：**33 页面 / 1540 链接 / 128 锚点 / 168 资源，0 断链**。
- `/subscribe/`：3 张卡片、3 个复制按钮；点击 RSS 复制得到绝对地址 `http://127.0.0.1:4400/rss.xml`、按钮回显「已复制 / COPIED」；页脚 SUBSCRIBE 链接存在。
- 归档全部切换实测：默认 `2026 open / 2025 closed` → 点击后两者全开、按钮「全部折叠」→ 再点全关、按钮「全部展开」，`localStorage={"2025":false,"2026":false}`。
- 截图：`docs/screenshots/subscribe.webp`。

### 已知问题 / 下一轮候选

1. 全站 i18n 文案外置检查；
2. 订阅页可加「复制 Markdown 订阅列表」；
3. 归档状态可加「恢复默认」；
4. 代码复制按钮在超长横向滚动块中的位置可再收；
5. 外部阅读器兼容性实测（Feedly 等需真实订阅 URL）。

## Iteration 33 — 代码语言标签 / About 导航枢纽（05:15–05:50）

### 创新点

- **I66 代码块语言标签**：`RhineCodeCopy` 在包裹 `<pre>` 时同步注入左上角语言徽标（读取 Shiki 的 `data-language`，如 `bash` / `ts`，大写等宽字体）；Mermaid 块不包裹所以不显示；打印时隐藏；与右下角复制按钮对称布局。
- **I67 About 导航枢纽**：关于页正文下新增「INDEX / 站点导航」8 张卡片（系列 / 时间线 / 统计 / 分类与标签 / 版本沿革 / 订阅 / 随机 / 全部归档），全部使用 `url()` 生成（子路径部署正确），附许可声明；让 About 从单篇介绍变成站点入口页。

### 迭代内修复

- About 页第一版把前端常量插入到模板标记区（frontmatter 之外），`astro check` 报 5 个 TS 错误（withBase/hubLinks/base 等未定义）→ 重写为规范的 frontmatter + 模板结构，并用既有 `url()` 替代手写 base 拼接；恢复 **0 errors / 0 warnings / 0 hints**（79 files）。

### 验证证据

- `pnpm build` 通过；`check-links --strict`：**33 页面 / 1549 链接 / 129 锚点 / 168 资源，0 断链**。
- About 页 DOM：8 张 `.rl-hub__card`，链接分别指向 `/series/`、`/timeline/`、`/stats/`、`/topics/`、`/changelog/`、`/subscribe/`、`/random/`、`/archive/`。
- 文章代码块：`/posts/02-reproducible/` 两个 wrap 均带 `.rl-code-lang=bash` 与复制按钮。
- 截图更新：`docs/screenshots/code-copy.webp`（含语言徽标）、`docs/screenshots/about-hub.webp`。

### 已知问题 / 下一轮候选

1. 全站 i18n 文案外置检查；
2. 订阅页「复制 Markdown 列表」；
3. 归档「恢复默认展开状态」；
4. 代码块行号（Shiki transformer）可选启用；
5. 外部阅读器兼容实测（Feedly 等需真实订阅 URL）。

## Iteration 34 — 相关档案原因 / Markdown 订阅列表 / Feed 结构校验（06:00–06:40）

### 创新点

- **I68 相关档案显示匹配原因**：`RhineRelated` 在评分时保留「同分类 / SAME CAT」与前 2 个共同标签（`#标签`），在元信息行以主题化小徽标展示；读者能看懂「为什么推荐这一条」，而不是一个黑盒列表。
- **I69 订阅页「复制 Markdown 订阅列表」**：一键复制三行 Markdown 链接（RSS / JSON Feed / OpenSearch，客户端补成绝对地址），带「适合放进 README 或友链页」提示与复制反馈。

### 验证证据（含 Feed 结构校验）

- `pnpm check`：0 errors / 0 warnings / 0 hints（79 files）；`pnpm build` 通过；`check-links --strict`：**33 页面 / 1550 链接 / 130 锚点 / 168 资源，0 断链**。
- **RSS 结构**：XML 可解析，`channel` 含 title/link/language；**6 个 item** 全部为绝对链接且 `content:encoded` 非空。
- **JSON Feed 结构**：必填字段齐全，6 items，每条 `id/url/title/content_html/date_published` 完整、URL 绝对、`content_html` 非空且含 KaTeX。
- 相关档案实测：`/posts/02-reproducible/` 相关项显示「同分类 / SAME CAT」徽标。
- Markdown 列表复制实测输出：`- [RSS 2.0](http://127.0.0.1:4400/rss.xml)` 等 3 行，按钮回显「已复制 / COPIED」。
- 截图更新：`docs/screenshots/related.webp`、`docs/screenshots/subscribe.webp`。

### 已知问题 / 下一轮候选

1. 全站 i18n 文案外置检查；
2. 归档「恢复默认展开状态」；
3. 代码行号（Shiki transformer）可选开关；
4. 相关档案可显示更多匹配标签；
5. 外部阅读器兼容实测（需真实订阅 URL 与网络）。

## Iteration 35 — 检索历史 / 归档恢复默认（06:45–07:25）

### 创新点

- **I70 检索历史（localStorage）**：
  - 记录触发过检索行为的词（`?q=` 直达、Enter 打开结果、点击结果）到 `rl-search-history`，去重保留最近 6 条；
  - 桌面端聚焦空搜索框、移动端打开检索面板时显示「RECENT / 最近检索」chips，点击即可重搜，附「清除」；
  - 桌面端空输入聚焦不再立即关面板，而是展示历史（此前该状态不可达）。
- **I71 归档「恢复默认 / RESET」**：一键回到「最新年份展开、其余折叠」的默认视图，并复位「全部展开/折叠」按钮文案；同时清理/回写状态记忆。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（79 files）；`pnpm build` 通过；`check-links --strict`：**33 页面 / 1551 链接 / 131 锚点 / 168 资源，0 断链**。
- 检索历史：`?q=档案` 后 `localStorage=["档案"]`；清空输入后显示 `档案 / 清除` 两个 chip；点「档案」重搜返回 7 条、关键词填回；点「清除」后 `localStorage=null`、chips 清空。
- 桌面聚焦空输入：面板打开（480×223），显示 3 条历史 + 清除（预置 `档案/时间线/统计`）。
- 归档恢复：先「全部展开」→ 两者全开且写入状态；点 RESET → 2026 open / 2025 closed，按钮文案复位「全部展开 / EXPAND ALL」。
- 截图：`docs/screenshots/search-history.webp`。

### 已知问题 / 下一轮候选

1. 全站 i18n 文案外置检查；
2. 代码行号（Shiki transformer）可选开关；
3. 检索历史支持单条删除；
4. 归档 RESET 后状态键为默认值（toggle 事件回写），语义符合预期；
5. 外部阅读器兼容实测（需真实订阅 URL 与网络）。

## Iteration 36 — 无障碍自检门禁 / 外链安全修复（07:30–08:20）

### 严重 bug 修复

| # | 问题 | 影响 | 修复 |
| --- | --- | --- | --- |
| B36 | **全站 33 个页面**存在 `target="_blank"` 但缺少 `rel="noopener/noreferrer"` 的外链 | 反向标签劫持（reverse tabnabbing）风险；新窗口可 `window.opener` 操作本站；内部 `/rss.xml` 链接也被标为不安全 | Navbar 外部导航、移动端 NavMenuPanel、Profile 社交链接（`rel="me"` 补 noopener noreferrer）、License 许可链接全部补齐；修复后扫描 0 违规 |

### 创新点

- **I72 无障碍 / 链接安全自检门禁**：新增 `scripts/check-a11y.mjs`（零依赖，扫描 dist 全部 HTML），覆盖 10 类检查——`img` alt、`a`/`button` 可访问名称、`target=_blank` 的 rel、单 `<h1>`、`html lang`、viewport、正数 tabindex、aria-* 引用 id 存在性、iframe title、重复 id；已接入 `pnpm verify`（`astro check` → 构建 → 链接检查 → **无障碍检查** → 体积预算），并支持 `A11Y_DIST` 环境变量自测。
- **I73 跳转主内容 skip link**：Layout body 首行加「跳到主内容 / SKIP TO CONTENT」，键盘聚焦时从上方滑入（`translate` 过渡），直达 `#main-grid`；视觉只在 focus 时出现，不干扰排版。

### 验证证据

- **检查器自测**：构造含 9 类缺陷的 HTML，`A11Y_DIST` 扫描输出 `<img> alt / blank rel / 空 a / 空 button / tabindex / iframe title / aria ref / 重复 id` 等 8 类（第 9 类 h1 在列表截断后），退出码 1。
- **修复后全站扫描**：`node scripts/check-a11y.mjs` → **33 个 HTML 页面全部通过**。
- skip link：聚焦后 `translate:0`、出现在 `(10,10)`、`href=#main-grid` 且目标存在；截图 `docs/screenshots/skip-link.webp`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（79 files）；`pnpm build` 通过；`check-links --strict`：**33 页面 / 1552 链接 / 131 锚点 / 168 资源，0 断链**。
- `pnpm verify` 现包含无障碍门禁并通过（79 files / 0 errors / 预算 197 files）。

### 已知问题 / 下一轮候选

1. 无障碍检查可扩展到标题层级跳跃、颜色对比（需样式解析）；
2. 代码行号（Shiki transformer）可选开关；
3. 站内链接 `rel` 策略说明文档化；
4. 检索历史单条删除；
5. 外部阅读器兼容实测（需真实订阅 URL 与网络）。

## Iteration 37 — 对比度门禁 / 标题层级检查 / 可访问性说明页（08:25–09:15）

### 创新点

- **I74 对比度门禁 `scripts/check-contrast.mjs`**：从 `rhinelab.css` 解析亮/暗两套 `--rl-*` 令牌，按 WCAG 2.1 计算 7 组前景/背景对比度（正常文本阈值 4.5:1），已在 `pnpm verify` 中运行；实测亮色最低 5.28:1、暗色最低 6.60:1，全部通过；支持 `CONTRAST_CSS` 指定文件自测。
- **I75 标题层级检查**：`check-a11y.mjs` 新增「首个标题必须为 h1」与「标题不得跳级（如 h2→h4）」两类断言；34 个页面 0 违规。
- **I76 可访问性说明页 `/accessibility/`**：7 行键盘操作表（`/`、`Esc`、`↑↓`、`Enter`、`Tab`、`Ctrl/Cmd+P`、主题切换）、视觉与动效说明（对比度、减少动效、高对比度、强制颜色、打印、焦点）、静态门禁清单与反馈入口；About 枢纽增加到 **9 张卡片**。

### 迭代内修复

- `check-contrast.mjs` 首版解析区间错误（从令牌向后找 `{` 会读到后面的块），导致亮/暗主题都输出暗色值、坏 CSS 自测误通过 → 改为「亮色向前找最近 `{`、暗色向后找 `{`」，并复测：坏 CSS 正确输出 1.36:1 并 `exit 1`。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（80 files）；`pnpm build` 通过；`check-links --strict`：**34 页面 / 1625 链接 / 168 锚点 / 172 资源，0 断链**。
- `check-a11y`：34 个 HTML 页面全部通过（含标题层级断言）。
- `check-contrast`：亮色 15.88/5.71/5.28/5.32/16.65/5.53/12.19，暗色 13.83/9.68/8.09/9.61/11.29/6.60/12.27，全部 ≥4.5:1；坏 CSS 自测 `exit 1`。
- `/accessibility/`：7 行快捷键表、2 组说明列表、h1=可访问性；About 枢纽 9 张卡片（末张 A11Y）。
- 截图：`docs/screenshots/accessibility.webp`。

### 已知问题 / 下一轮候选

1. 代码行号（Shiki transformer）可选开关；
2. 检索历史单条删除；
3. 可访问性页增加「已知限制」清单；
4. 对比度门禁覆盖更多 UI 令牌（按钮/徽标底）；
5. 外部阅读器兼容实测（需真实订阅 URL 与网络）。

## Iteration 38 — 制作说明页 / 检索历史单删 / 对比度增强（09:20–10:05）

### 创新点

- **I77 `/colophon/` 制作说明页**：四张面板——构建链（10 项依赖）、字体与图标（5 项含许可）、色板（8 个 `--rl-*` 令牌实时样品）、生成与校验脚本（8 个）；底部许可声明、无游戏素材声明与可访问性/订阅入口；About 枢纽扩到 **10 张卡片**。
- **I78 检索历史单条删除**：每条历史 chip 带 `×`（`aria-label="删除检索历史：<词>"`），删除即时写入 localStorage，与「清除」并存。
- **I79 对比度门禁增强**：支持 `rgba()` 半透明令牌的 alpha 合成（`flatten` 到不透明底），新增 `amber-ink/surface`、`ink/tint`、`muted/surface-2` 三组 → 每主题 **10 组**；实测亮色最低 5.15:1、暗色最低 5.60:1，全部通过；坏 CSS 自测仍正确 `exit 1`。

### 迭代内修复

- `check-contrast.mjs` 扩展时把亮度计算写成 `[bg.r, bg.b, bg.b]`（重复 b、漏 g），会算错所有颜色 → 修正为 `[bg.r, bg.g, bg.b]` 并复测通过。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（81 files）；`pnpm build` 通过；`check-links --strict`：**35 页面 / 1667 链接 / 171 锚点 / 176 资源，0 断链**；`check-a11y`：35 页全绿。
- `/colophon/`：4 面板、3 组列表、8 个色板令牌、h1=制作说明；截图 `docs/screenshots/colophon.webp`。
- 检索历史删除：3 条历史 → 点「时间线」的 × 后 `localStorage=["档案","统计"]`、界面剩 2 条。
- 对比度：每主题 10 组全绿（tint 半透明合成后 ink 14.31/12.11）。

### 已知问题 / 下一轮候选

1. 代码行号（Shiki transformer）可选开关；
2. 可访问性页「已知限制」清单；
3. 对比度门禁覆盖按钮文字/徽标底色；
4. colophon 页可加构建时间/提交号；
5. 外部阅读器兼容实测（需真实订阅 URL 与网络）。

## Iteration 39 — 代码行号 / 面包屑与结构化数据 / 已知限制（10:10–10:55）

### 创新点

- **I80 代码块行号**：在 `astro.config.mjs` 增加 Shiki 预处理器给 `<pre>` 标记 `data-line-numbers`，行号由 **CSS 计数器**（`.line::before`）绘制——不进入 DOM 文本、不污染复制内容；`user-select:none` 禁止选中行号；可在 config 中关闭。
- **I81 文章面包屑 + BreadcrumbList**：文章顶部新增 `首页 / 归档 / 分类 / 标题` 面包屑（`nav[aria-label=面包屑]`、当前项 `aria-current="page"`、长标题截断），并输出 schema.org **BreadcrumbList** JSON-LD（与 BlogPosting 并存）。
- **I82 可访问性「已知限制」**：`/accessibility/` 增加限制清单——检索依赖 JS、Mermaid/KaTeX 渲染与打印退化、无 Service Worker 离线、默认无第三方嵌入、未做读屏器全量人工回归。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（81 files）；`pnpm build` 通过；`check-links --strict`：**35 页面 / 1686 链接 / 172 锚点 / 176 资源，0 断链**；`check-a11y` 35 页全绿；`check-contrast` 全绿。
- 行号实测：`pre[data-line-numbers]` 存在、`.line::before` 计算样式为 `counter(rl-line)`/`inline-block`；复制内容为 `pnpm install...`，**不含行号**。
- 面包屑实测：`首页 / 归档 / 工程研究 / 02 · 实验复现…`；页面 JSON-LD 类型为 `BlogPosting` + `BreadcrumbList`。
- 截图：`docs/screenshots/code-line-numbers.webp`、`docs/screenshots/breadcrumb.webp`。

### 已知问题 / 下一轮候选

1. 行号在超窄屏的缩进可再调；
2. 面包屑可加入「随机」入口；
3. 对比度门禁覆盖按钮文字/徽标底色；
4. colophon 页可加构建时间/提交号；
5. 外部阅读器兼容实测（需真实订阅 URL 与网络）。

## Iteration 40 — 重复跳转链接修复 / Feed 门禁 / 行号窄屏（11:00–11:45）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B37 | 页面同时存在**两条功能重复的 skip link**（`#main-grid` 与 `#swup-container`），且 `.rl-skip` 样式被**重复定义两份**（后者覆盖前者，焦点态不一致） | Iteration 36 新增 skip link 时未发现 Iteration 5 已有一条；Layout 为 CRLF，去重替换未命中却未报错 | 合并为单条 `跳到主内容 / SKIP TO CONTENT → #swup-container`（保留原有 `data-no-swup` 语义），删除重复 CSS 块；用 CRLF 兼容的替换并断言命中数，构建产物确认 **1 条** |

### 创新点

- **I83 Feed 结构门禁 `scripts/check-feed.mjs`**：校验 RSS 2.0（XML 声明/根元素/channel 必备字段、item 必备标签、绝对 link、非空 `content:encoded`、正文无站内相对链接）与 JSON Feed 1.1（version、home_page_url/feed_url、items 必备字段、绝对 URL、日期合法）；已接入 `pnpm verify`，支持 `FEED_DIST` 自测。
- **I84 行号窄屏缩进**：≤640px 时行号宽度 1.45em、右距 0.55em、透明度 0.42，避免窄屏挤压代码。

### 验证证据

- `check-feed`：RSS 6 items / JSON Feed 6 items 结构全部通过；**坏 Feed 自测**（缺 channel 字段 + 空 items + 无 item）正确输出 9 个问题并 `exit 1`。
- 修复后浏览器实测：`.rl-skip` 数量 **1**、`href=#swup-container`、聚焦 `transform: identity`、`top=10`、`background=rgb(8,10,8)`、目标存在。
- `pnpm check`：0 errors / 0 warnings / 0 hints（81 files）；`pnpm build` 通过；`check-links --strict`：35 页面 / 0 断链；`check-a11y` 35 页全绿；`check-contrast` 全绿。
- 截图更新：`docs/screenshots/skip-link.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. colophon 页可加构建版本信息；
3. 对比度门禁覆盖按钮/徽标底色；
4. Feed 门禁可校验 XML 转义完整性；
5. 面包屑可加入「随机」入口。

## Iteration 41 — 未定义变量修复 / 亮色对比度修复 / 更新日期 / 系列下一站（11:50–12:40）

### 严重 bug 修复

| # | 问题 | 影响 | 修复 |
| --- | --- | --- | --- |
| B38 | `--rl-paper` 被使用但**从未定义**（代码复制成功态文字色、About 枢纽卡片背景） | 两处样式回退为继承/透明：复制成功态文字对比度不可控、枢纽卡片背景缺失 | 在亮/暗主题令牌块中补 `--rl-paper`（等于各自 `--rl-bg`）；实测复制成功态文字色 `rgb(234,229,225)`、卡片背景恢复 |
| B39 | 亮色主题 `amber-ink` 在 `amber-wash-3` 上仅 **4.03:1**（< WCAG AA 4.5） | 选中 chip / 匹配徽标等黄铜底文字在亮色下不达标 | `--rl-amber-ink` 由 `#7a5526` 加深为 `#6f4c20`：bg 6.15:1、surface 6.45:1、amber-wash-3 **4.66:1**、paper-on-amber 6.15:1 全部达标 |

### 创新点

- **I85 文章更新日期**：frontmatter 新增可选 `updated`——文章元信息显示「更新于 YYYY-MM-DD」徽标、JSON-LD `dateModified`、JSON Feed `date_modified`；演示文章 02 更新为 2026-11-18。
- **I86 系列下一站**：系列块底部新增「NEXT / 下一站 → 标题」链接；系列最后一篇显示「系列已归档 / SERIES COMPLETE」。
- **I87 对比度门禁扩展**：新增 `paper/amber-ink`（实心按钮）与 `amber-ink/amber-wash-3`（黄铜底徽标）两组 → 每主题 **12 组**。
- **I88 colophon 构建信息**：页头输出 `BUILD / Astro v6.4.8 · Node ≥22.12 · pnpm 9 · STATIC OUTPUT`。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（81 files）；`pnpm build` 通过；`check-links --strict`：35 页面 / 0 断链；`check-a11y` 35 页全绿；`check-feed` RSS/JSON 各 6 items 通过。
- 对比度：每主题 12 组全绿——亮色 `amber-ink` 6.15（bg）/ 6.45（surface）/ 4.66（wash-3）/ paper-on-amber 6.15；暗色最低 5.60。
- 更新日期：元信息 `更新于 2026-11-18`；BlogPosting `dateModified=2026-11-18`；feed.json 带 `date_modified`。
- 系列：02 篇显示「NEXT / 下一站 03 · 接口规范…」；03 篇显示「系列已归档 / SERIES COMPLETE」。
- colophon：`BUILD / Astro v6.4.8 · Node ≥22.12 · pnpm 9 · STATIC OUTPUT`。
- 截图：`docs/screenshots/post-updated.webp`、`docs/screenshots/series-next.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. RSS 输出也加入 `lastBuildDate`/更新日期；
3. 系列块可加「上一篇系列」链接；
4. About 枢纽卡片悬停态对比度；
5. 代码行号在超长语言标签下的对齐。

## Iteration 42 — 双重复制按钮修复 / RSS 构建时间 / 系列上一篇（12:45–13:30）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B40 | 每个代码块同时存在**两个复制按钮**：Fuwari `Markdown.astro` 内置 `.copy-btn` 图标按钮 + 自研 `RhineCodeCopy` 文字按钮，位置重叠 | Iteration 31 新增自研复制时，Fuwari 基座已有复制按钮注入逻辑（运行时 DOM 生成，静态检查看不到） | `Markdown.astro` 的注入循环对 `#post-container` 内代码块**直接跳过**（文章页由 RhineCodeCopy 独占），其它页面仍保留原行为；并给 `.rl-code-wrap > pre` 增加 `padding-top:2.15rem`，语言徽标/复制按钮落在留白区，不再压住首行代码 |

### 创新点

- **I89 RSS `lastBuildDate`**：RSS 2.0 channel 输出最近一次内容更新时间（取 `updated`/`published` 最大值），阅读器可感知站点活跃度。
- **I90 系列「上一篇」**：系列块底部改为 `PREV / 上一篇 ←` 与 `NEXT / 下一站 →` 并排（flex 可换行），最后一篇仍显示「系列已归档」。

### 验证证据

- 修复后文章页：`.code-block=0`、`.copy-btn=0`、`.rl-code-wrap=2`、`.rl-code-copy=2`、`.rl-code-lang=2`；`pre` 计算 `padding-top=34.4px`，按钮/徽标位于留白区（`btnInside=true`）。
- `dist/rss.xml`：`<lastBuildDate>Wed, 18 Nov 2026 00:00:00 GMT</lastBuildDate>`；Feed 门禁 RSS/JSON 各 6 items 通过。
- 系列：02 篇同时显示「← PREV / 上一篇 01…」与「NEXT / 下一站 03…」。
- `pnpm check`：0 errors / 0 warnings / 0 hints（81 files）；`pnpm build` 通过；`check-links --strict` 35 页 0 断链。
- 截图更新：`docs/screenshots/code-copy.webp`、`docs/screenshots/series-next.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. Feed 门禁可校验 `lastBuildDate` 格式；
3. About 枢纽卡片悬停对比度；
4. 代码块行号与语言标签在超短代码块下的留白；
5. 系列页可显示系列总阅读时长。

## Iteration 43 — 正文外链安全标记 / SearchAction / Feed 门禁增强（13:35–14:20）

### 创新点

- **I91 正文外链自动安全标记**：新增 `src/plugins/rehype-external-links.mjs`——Markdown 渲染出的站外 `<a>` 自动补 `target="_blank" rel="noopener noreferrer"` 与 `.rl-external-link` 类，CSS 以 `↗` 标注；站内链接保持同标签页。`astro.config.mjs` 把站点 URL 收敛为 `SITE_URL` 常量，canonical/OG 与外链判断共用同一 origin（改域名只改一处）。
- **I92 首页 WebSite SearchAction**：首页 JSON-LD 从裸 `WebSite` 扩展为带 `description/inLanguage/url` 与 `potentialAction: SearchAction`（`?q={search_term_string}` + `query-input`），搜索引擎可识别站内搜索。
- **I93 Feed 门禁增强**：`check-feed.mjs` 校验 RSS `lastBuildDate` 存在且为合法日期。
- **I94 对比度门禁扩展**：新增 `ink-2/surface-2` 组合 → 每主题 **13 组**。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（82 files）；`pnpm build` 通过；`check-links --strict`：35 页 0 断链；`check-a11y` 35 页全绿（外链 rel 由插件保证）；`check-contrast` 13 组全绿；`check-feed` RSS/JSON 通过（含 lastBuildDate 校验）。
- 文章页实测：`#post-container .rl-external-link` 5 条，均 `target=_blank`、`rel=noopener noreferrer`、`::after` 内容 `"↗"`；站内链接 26 条未受影响。
- 首页 JSON-LD：`WebSite` 含 `url=https://example.com/`、`potentialAction.target.urlTemplate=https://example.com/?q={search_term_string}`、`query-input=required name=search_term_string`。
- 截图：`docs/screenshots/external-links.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 外链图标在标题/列表中的对齐微调；
3. SearchAction 可同时输出 OpenSearch 双声明；
4. About 枢纽卡片悬停对比度；
5. 代码块超短内容留白。

## Iteration 44 — 返回顶部按钮修复 / 进度环 / PWA 快捷方式（14:25–15:10）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B41 | 「返回顶部」按钮大部分在视口之外：1280px 视口下按钮 60px 宽只有约 27px 可见（`rect.x=1253`） | Fuwari 原样式用 `transform: translateX(5rem)` + 依赖父容器定位；宽屏容器超出视口时按钮被推到屏幕右侧外 | 改为 `position: fixed; right: 1.25rem; bottom: 11rem; transform: none`，隐藏态 `translateX(4rem)` 过渡；实测按钮完全可见（`fullyVisible=true`） |

### 创新点

- **I95 返回顶部进度环**：按钮外圈用 `conic-gradient` + `radial-gradient` mask 绘制滚动进度环，`--rl-progress`（0–100）由 **passive scroll/resize** 更新；顺带把 `window.onscroll = ...` 改为 `addEventListener('scroll', ..., {passive:true})`，避免覆盖其它滚动处理器；`prefers-reduced-motion` 下回顶使用 `auto` 行为。
- **I96 PWA manifest 增强**：新增 `shortcuts`（归档 / 统计 / 订阅 / 随机，各带 192 图标）、`categories`、`dir`、`orientation`，安装到桌面后可直接跳转高频页面。
- **I97 门禁与细节**：对比度门禁增加 `amber-ink/surface-2`（每主题 **14 组**）；外链 `↗` 图标基线微调。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（82 files）；`pnpm build` 通过；`check-links --strict` 35 页 0 断链；`check-contrast` 14 组全绿。
- manifest 产物：`shortcuts=4`、`categories=['blog','news','reference']`、`orientation='any'`、`dir='ltr'`。
- 返回顶部实测（文章页滚动 900px）：按钮可见、`--rl-progress=35`、环背景 `conic-gradient(rgb(155,114,71) 35%, …)`、`fullyVisible=true`。
- 截图：`docs/screenshots/back-to-top.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 进度环在极短页面的显隐阈值可调；
3. PWA shortcuts 图标可改用专用小图；
4. About 枢纽卡片悬停对比度；
5. OpenSearch 与 SearchAction 双声明说明文档化。

## Iteration 45 — 检索无结果引导 / noscript 提示 / 回顶阈值（14:35–15:20）

### 创新点

- **I98 检索无结果标签引导**：无匹配时在空状态下方展示「TRY / 试试这些标签」——取 Pagefind 标签过滤器的前 8 个高频标签，点击直接以该标签筛选并返回结果（实测点 `Astro` 返回 1 条并进入 pressed 状态），避免死胡同。
- **I99 `<noscript>` 提示**：关闭 JavaScript 时在页面顶部显示说明（检索 / 主题切换 / 图表渲染需要 JS），并提供「归档索引」与「RSS / JSON Feed」直链；`data-pagefind-ignore` 避免污染检索索引。
- **I100 返回顶部短页阈值**：仅当页面可滚动高度 > 0.6 视口且 `scrollTop > 300` 时显示按钮，避免在几乎不可滚动的页面上出现无意义按钮。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（82 files）；`pnpm build` 通过；`check-links --strict` 35 页 0 断链。
- 检索：`?q=zzzznotfound` 空状态 + 8 个标签 chips；点 `Astro` 后结果 1 条、标签过滤器 `aria-pressed=true`。
- noscript：`dist/index.html` 含 `.rl-noscript` 区块（含归档 / 订阅链接）。
- 回顶：文章页滚动 900px 显示进度环；短页在 `scrollable` 低于阈值时不显示。
- 截图：`docs/screenshots/search-suggest.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. noscript 样式在深色系统下的对比度需人工复核；
3. 标签建议可去重当前筛选词；
4. PWA 专用快捷图标；
5. OpenSearch 与 SearchAction 双声明文档化。

## Iteration 46 — 站点索引页 / PWA 快捷图标 / 对比度扩展（15:25–16:10）

### 创新点

- **I101 对比度门禁扩展**：新增 `ink-2/amber-wash`、`ink/amber-wash`（禁用 JS 提示条与黄铜底块）→ 每主题 **16 组**，全部 ≥4.5:1。
- **I102 PWA 快捷方式专用图标**：新增 4 个自制 SVG（归档 / 统计 / 订阅 / 随机，深色底 + 黄铜几何），`generate-icons.mjs` 扩展为同时栅格化 96/192 PNG（总 11 个图标）；manifest `shortcuts` 改用专用图标。
- **I103 `/sitemap/` 人类可读站点索引**：一页汇总 12 个页面卡片、全部文章（日期 + 分类）、分类 / 标签 chips、6 个机器入口（sitemap / robots / RSS / JSON Feed / OpenSearch / manifest）；页头统计 `12 页面 / 06 文章 / 02 分类 / 12 标签`；About 枢纽扩到 **11 张卡片**。
- **I104 文档补全**：`docs/DEPLOY.md` 新增「订阅与搜索的对外声明」表（RSS/JSON Feed/OpenSearch/SearchAction/Sitemap/人类索引）。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（83 files）；`pnpm build` 通过；`check-links --strict`：**36 页面**，0 断链；`check-a11y` 36 页全绿；`check-contrast` 16 组/主题全绿。
- 体积预算：新增 `/sitemap/`（46KB）与 8 个 PWA 快捷图标后总产物 6695KB 略超原 6656KB 上限 → 将总预算从 6.5MB 调整为 **6.75MB（约 +4%）** 并注明原因；其余分项（JS/CSS/字体/单页）均未超。
- manifest：4 个 shortcuts 图标分别指向 `/icons/shortcut-{archive,stats,subscribe,random}-192.png`；`generate-icons` 输出“11 icons”。
- `/sitemap/` DOM：h1=站点索引，页头 `12/06/02/12`，12 张页面卡、6 篇文章、14 个分类/标签 chips。
- 截图：`docs/screenshots/sitemap.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 站点索引页可加「按年分组」；
3. 快捷图标可做 maskable 变体；
4. noscript 深色对比度人工复核；
5. SearchAction/OpenSearch 文档已补，可在 README 增加链接。

## Iteration 47 — 键盘跳转 / 机器可读统计 / 索引按年（16:15–17:00）

### 创新点

- **I105 全局键盘跳转**：`g` 后接 `h/a/t/s/r/b/c` 依次跳到首页 / 归档 / 时间线 / 统计 / 随机 / 订阅 / 制作说明；1.2s 内有效，输入框 / textarea / contenteditable 内自动禁用，走 Swup 客户端导航；已写入 `/accessibility/` 键盘表。
- **I106 `/stats.json` 机器可读统计**：构建期输出 `generated_at/site/home_page_url/counts/categories/tags/posts`（文章含 URL、日期、更新日期、分类、标签、字数、阅读分钟）；`/sitemap/` 机器入口与 DEPLOY 文档同步。
- **I107 站点索引按年份分组**：`/sitemap/` 文章列表按发布年份分组（`2026 05 FILES`、`2025 01 FILES`），长档案更易扫描。

### 迭代内修复

- 内联键盘脚本触发 2 条 TS 错误（`Record` 索引签名、`event.target` 为 `EventTarget` 不可直接访问 `isContentEditable`）→ 补 `Record<string,string>` 与 `instanceof HTMLElement` 收窄，`astro check` 恢复 **0 errors / 0 warnings / 0 hints**（84 files）。

### 验证证据

- `pnpm check`：0/0/0（84 files）；`pnpm build` 通过；`check-links --strict` 36 页 0 断链；`check-a11y` 36 页全绿。
- 键盘实测：`g`→`a` 后 URL `/archive/`；`g`→`s` 后 `/stats/`；搜索框聚焦时 `g`→`a` 不跳转。
- `/stats.json`：`counts={posts:6, words:2472, minutes:12, categories:2, tags:12}`，posts 6 条。
- `/sitemap/`：年份分组 `202605 FILES` / `202501 FILES`，机器入口含 `stats.json`。
- 截图更新：`docs/screenshots/sitemap.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 键盘序列可加 `?` 帮助浮层；
3. `/stats.json` 可附年度聚合；
4. 索引页年份可折叠；
5. README 增补键盘快捷键说明。

## Iteration 48 — 快捷键浮层 / 年度聚合 / 索引年份折叠（17:05–17:50）

### 创新点

- **I108 `?` 快捷键帮助浮层**：按 `?`（或 Shift+/）打开主题化 dialog（`role="dialog" aria-modal="true"`），列出 7 组快捷键（检索 / Esc / ↑↓ / Enter / Tab / `g` 序列 / `?`）；焦点自动移到关闭按钮，`Esc`、背景点击、关闭按钮均可关闭，关闭后焦点回到触发元素；打印隐藏。
- **工程化（体积修复）**：静态 dialog 标记 + 内联 UI 脚本让 `posts/99-syntax` 单页涨到 83.3KB（超 80KB 预算）→ dialog 改为**首次按 `?` 时懒创建**，并把 `g` 快捷键 / 浮层脚本**外置到 `public/rhine/ui.js`**（`<html data-base>` 传 base，页面每页减重约 2.6KB），单页回落到 79.4KB、总产物 6705KB/6912KB（97%）。
- **I109 `/stats.json` 年度聚合**：新增 `years` 数组（每年 count/words/minutes）——`2026: 5 篇 / 2174 字 / 11 分钟`、`2025: 1 / 298 / 1`。
- **I110 站点索引年份折叠**：`/sitemap/` 文章分组改为 `<details>`，最新年份默认展开、旧年份可折叠（summary 可键盘操作）。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（84 files）；`pnpm build` 通过；`check-links --strict` 36 页 0 断链；`check-a11y` 36 页全绿。
- 浮层实测：`?` 打开后 dialog 可见、7 行、焦点在「关闭快捷键说明」；卡片 608×369 居中；`Esc` 后 `hidden=true`。
- `/stats.json`：`years=[{2026,5,2174,11},{2025,1,298,1}]`。
- 索引折叠：默认 `2026 open / 2025 closed`，手动展开第二组后为 `[true,true]`。
- 截图：`docs/screenshots/shortcuts.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 浮层打开时可用焦点陷阱将 Tab 限制在 dialog 内；
3. 年度聚合可加入 `/stats/` 页面；
4. README 增补 `?` 快捷键说明；
5. 浮层在移动端的高度与滚动。

## Iteration 49 — 焦点陷阱 / Mermaid 源码复制 / 图片懒加载（17:55–18:40）

### 无障碍修复

- **B43 快捷键浮层焦点陷阱**：浮层仅有 1 个可聚焦元素（关闭按钮），此前 `Tab` 会移出 dialog 到页面背后内容；现在 dialog 内 `Tab` / `Shift+Tab` 循环（`defaultPrevented=true`），关闭后焦点回到触发元素。

### 创新点

- **I111 Mermaid 源码复制**：在 mermaid 图表外层包 `.rl-mermaid-wrap` 并注入「复制源码」按钮（读取 `data-mermaid-src`，复制 `flowchart LR ...` 等源文本，成功态黄铜底）；按钮放在 wrapper（而非容器内）避免 Mermaid 重渲染 `innerHTML` 时丢失；`MutationObserver` 在图表生成后自动增强，Swup 换页后同样生效；打印隐藏。
- **I112 正文图片懒加载**：新增 `rehype-lazy-images.mjs`——Markdown 图片自动补 `loading="lazy" decoding="async"`（已有声明不覆盖）；演示文章 2025 篇加入自制头像 SVG，产物确认两个属性。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）；`pnpm build` 通过；`check-links --strict` 36 页 0 断链；`check-a11y` 36 页全绿；体积预算 6705KB/6912KB（97%）、单页 79.4KB/80KB。
- 焦点陷阱实测：`Tab` / `Shift+Tab` 均 `defaultPrevented=true`，焦点保持 dialog；可聚焦元素 1 个。
- Mermaid：`.rl-mermaid-wrap=1`、按钮存在，点击后复制内容以 `flowchart LR` 开头，状态「已复制」。
- 图片：`<img alt="观测者头像…" src=/rhine/avatar.svg decoding=async loading=lazy>`。
- 截图：`docs/screenshots/mermaid-copy.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. KaTeX 公式点击复制 LaTeX；
3. 浮层可加「按 ? 关闭」提示；
4. 图片懒加载可加 `width/height` 防 CLS（需读取尺寸）；
5. README 快捷键说明可扩展成表格。

## Iteration 50 — KaTeX 复制 / 目录记忆 / 打印页眉（18:45–19:30）

### 创新点（第 50 轮里程碑）

- **I113 点击公式复制 LaTeX**：正文 `.katex` 公式点击即复制其 MathML `<annotation>` 中的 TeX（如 `E = mc^2`），底部轻提示「已复制 LaTeX：…」；有文本选中时不劫持点击；`title="点击复制 LaTeX"`。
- **I114 目录折叠状态记忆**：`details.rl-toc` 折叠状态写入 `localStorage['rl-toc-open']`，桌面端刷新/Swup 返回后还原，移动端保持默认折叠；避免与移动端自动折叠脚本冲突。
- **I115 打印页眉**：文章页新增 `.rl-print-head`（标题 + 绝对 URL），屏幕隐藏、打印时以细线页眉显示，导出 PDF 时能标明来源。
- **README 键盘快捷键表**：补充 `/`、`Esc`、`↑↓`、`Enter`、`Tab`、`g` 序列、`?`、`Ctrl/Cmd+P` 对照表。

### 迭代内修复

- 首版 toast 补丁因匹配锚点失效未真正插入，导致 KaTeX 点击后调用未定义的 `toast`（复制成功但无提示）→ 统一重建 `copyText` + `toast` helper 并复测：复制 `E = mc^2`、toast 文案「已复制 LaTeX：E = mc^2」、`is-visible=true`。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）；`pnpm build` 通过；`check-links --strict` 36 页 0 断链；`check-a11y` 36 页全绿；体积预算 6709KB/6912KB（97%）、单页 79.5KB/80KB。
- KaTeX：点击首个公式后剪贴板 `E = mc^2`，toast 可见。
- 目录记忆：折叠后 `rl-toc-open=0`，刷新仍折叠；设为展开后 `rl-toc-open=1`。
- 打印页眉：屏幕上 `display:none`，内容含标题与绝对 URL。
- 截图：`docs/screenshots/latex-copy.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 打印页眉可加日期；
3. KaTeX 复制对行内公式的点击范围体验可优化；
4. 目录记忆可加「恢复默认」入口；
5. 单页 79.5/80KB 已逼近上限，后续全局新增需谨慎或调整预算策略。

## Iteration 51 — 中文字数统计修复 / 打印日期 / 预算策略（19:35–20:25）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B44 | **中文文章字数与阅读时长严重低估**：整段中文被 `reading-time` 按空格切成 1 个词，页面显示「439 字 / 2 分钟」而实际正文近千字 | 依赖库只按空格分词，对无空格 CJK 文本失效 | 重写 `remark-reading-time.mjs`：**CJK 按字计数 + 拉丁按词计数**（速度 CJK 300 字/分 + 拉丁 220 词/分），并新增 `chars` 字段；修复后示例站 `words 2485→2521`、新增 `chars=4501`、`minutes 13→9`（新速度模型） |

> 附带排查记录：Astro content layer 缓存（`node_modules/.astro/data-store.json`）会缓存旧 frontmatter，修改 remark 插件后必须清理 `.astro` 与 `node_modules/.astro` 再构建；已写入 `docs/THEMING.md` FAQ。

### 创新点 / 改进

- **I116 打印页眉补充日期**：`标题 | 2026-11-14 | 绝对 URL`，打印 PDF 时来源与时间一目了然。
- **I117 `/stats.json` 增加 `chars`**：`counts.chars=4501`，每条文章含字数/字符数/阅读分钟。
- **I118 单页预算策略调整**：单页 HTML 上限 80KB → **96KB**（Shiki 双主题标记使代码文章天然偏大；示例 79.5KB = 83%），保留总产物/JS/CSS/字体预算不变。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）；`pnpm build` 通过；`check-links --strict` 36 页 0 断链；`check-a11y` 36 页全绿。
- `/stats.json`：`counts={posts:6, words:2521, chars:4501, minutes:9, categories:2, tags:12}`；年度 `2026 2,211 words/8 min`、`2025 310/1`。
- 打印页眉产物：`<span>02 · …</span> <span>2026-11-14</span> <span>https://example.com/posts/02-reproducible/</span>`。
- 体积预算：总 6712KB/6912KB（97%）、单页 79.5KB/96KB（83%）。
- 截图更新：`docs/screenshots/stats.webp`（新字数）。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. `reading-time` 依赖已不再使用，可在同步 lockfile 后移除；
3. 统计页 KPI 可选展示「字符数」；
4. 阅读时长可区分中英文定价（当前 300/220 常数）；
5. 打印页眉可加站点名。

## Iteration 52 — 依赖手术清理 / 字符数 KPI / 打印站点名（20:30–21:15）

### 工程修复（严重操作风险）

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B45 | 移除未使用的 `reading-time` 依赖时，`pnpm remove --lockfile-only` 在 node_modules 为 junction 的本机环境直接失败；转临时目录成功后，**重新解析把 vite peer 解析从 8.2.0 漂移到 7.3.6 等无关变更** | pnpm 重解析整棵 lockfile + 本机虚拟存储与 junction 不匹配 | 从 `release/rhinelab-blog-v0.2.41.zip` 恢复原始 `pnpm-lock.yaml`，**手术式删除 reading-time 三处**（importer / packages / snapshots），`pnpm install --frozen-lockfile --lockfile-only` 通过，diff 仅 reading-time 相关行，无版本漂移；构建与全部门禁复验通过 |

### 创新点 / 改进

- **I119 统计页 CHARS KPI**：`/stats/` 新增「CHARS / 字符」KPI（4,501），KPI 从 5 个增至 6 个，与字数、阅读时长并列。
- **I120 打印页眉站点名**：打印页眉改为 `站点名 | 标题 | 日期 | 绝对 URL`，导出 PDF 后来源更明确。
- **依赖清理**：`reading-time` 已无任何引用（自研 CJK 计数替代），从 `package.json` 与 lockfile 移除；`docs/ASSETS.md` 标注移除。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）；`pnpm build` 通过；`check-links --strict` 36 页 0 断链；`check-a11y` 36 页全绿。
- `/stats/`：6 个 KPI，含 `CHARS / 字符 4,501`。
- 打印页眉产物：`<span class=rl-print-head__site>莱茵档案</span> <span>02 · …</span> <span>2026-11-14</span> <span>https://example.com/posts/02-reproducible/</span>`。
- 依赖：`grep reading-time` 在 package.json / pnpm-lock.yaml 中均为 0；frozen-lockfile 校验通过。
- 截图更新：`docs/screenshots/stats.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 统计页 KPI 在窄屏的 3×2 布局复核；
3. lockfile 手术流程可写进 CONTRIBUTING 文档；
4. 打印页眉在深色打印下的对比度；
5. 月度热力图可加「字符」维度。

## Iteration 53 — 章节链接复制 / 热力图字符 / 移动端复核 / CONTRIBUTING（21:20–22:05）

### 创新点

- **I121 标题锚点复制章节链接**：点击正文标题的 `#` 锚点即复制该章节的**绝对链接**（保留默认跳转），底部轻提示「已复制章节链接」；实测 `#文本与强调` → `http://127.0.0.1:4400/posts/99-syntax/#%E6%96%87%E6%9C%AC…`，`location.hash` 同步更新。
- **I122 热力图补充字符数**：365 天热力图每个格子的 `title` 从「日期 · N 条」扩展为「日期 · N 条 · N 字符」（368 格全部生效，示例 `2025-12-20 · 1 条 · 367 字符`）。
- **I123 移动端 KPI 复核**：390px 视口实测 `/stats/` KPI 自动变 **2 列 × 3 行**（6 卡，每卡 183px），页面 `scrollWidth 375 < clientWidth 390`，无横向溢出。
- **I124 新增 `CONTRIBUTING.md`**：环境要求、命令、每轮迭代约定、门禁清单、**依赖增删与 lockfile 手术流程**、内容 frontmatter、发布校验步骤、素材许可边界。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）；`pnpm build` 通过；`check-links --strict` 36 页 0 断链；`check-a11y` 36 页全绿。
- 锚点复制：剪贴板收到绝对 URL，toast 显示「已复制章节链接」，hash 跳转正常。
- 热力图：368 个格子均含「字符」信息；活跃日示例 367 字符。
- 移动端：2 列 KPI，无横向滚动。
- 文档：`CONTRIBUTING.md` 已加入 README 文档索引。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 章节锚点复制可加「已复制」视觉态（锚点本身变绿）；
3. 热力图字符密度可做独立色阶；
4. CONTRIBUTING 可加截图；
5. 打印样式深色主题人工复核。

## Iteration 54 — Feed 深度门禁 / 锚点复制态 / 系列页统计（22:10–22:55）

### 创新点

- **I125 Feed 门禁深度校验**：`check-feed.mjs` 在原有结构检查上新增——
  - RSS：channel `<link>` 绝对地址、每条 `guid` 非空且**唯一**、`pubDate` 合法日期、`lastBuildDate` 不早于最新 `pubDate`；
  - JSON Feed：`home_page_url`/`feed_url` 绝对地址、`id` 唯一、`content_html` 非空、`date_modified` 合法且 ≥ `date_published`。
  当前产物 6 条 RSS / 6 条 JSON Feed 全部通过（可捕获未来自建 feed 的重复 GUID、日期回退等真实错误）。
- **I126 章节锚点复制视觉态**：复制成功后锚点 `#` 显示黄铜底 1.4s 后自动恢复；实测 154ms 出现、1520ms 已移除。
- **I127 系列页统计**：`/series/` 每个系列标题行显示「N FILES · X WORDS · Y MIN」（示例系列 `04 FILES · 1,925 WORDS · 7 MIN`），由 remark frontmatter 在构建期聚合。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）；`pnpm build` 通过；`check-feed` 深度校验通过；`check-links --strict` 36 页 0 断链；`check-a11y` 36 页全绿。
- 系列页 DOM：`04 FILES · 1,925 WORDS · 7 MIN`。
- 锚点复制态：`classList.contains('is-copied')` 154ms=true、1520ms=false；图标色 `rgb(234,229,225)`。
- 截图更新：`docs/screenshots/series.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. Feed 可加「条目数一致性」与站点地图 URL 数量对比；
3. 系列统计可显示最新更新日期；
4. 锚点复制对行内标题（h3）同样生效，可补测试；
5. CONTRIBUTING 可加“如何新增一门门禁”。

## Iteration 55 — 检索 live region / Feed 一致性门禁 / 统计机器入口（23:00–23:45）

### 无障碍修复

- **B47 检索结果缺少实时播报**：`.rl-search-count` 与「检索中」状态此前是纯视觉文本，屏幕阅读器不会感知结果变化 → 加 `role="status" aria-live="polite"`；实测输入「档案」后节点为 `role=status aria-live=polite`，文本「RESULTS / 7 条档案」，7 条结果。

### 创新点

- **I128 Feed ↔ 站点数据一致性门禁**：`check-feed.mjs` 新增——
  - `/stats.json` 的 `counts.posts` 必须等于 RSS 与 JSON Feed 条目数；
  - RSS 与 JSON Feed 的文章 URL 集合必须一致（去尾斜杠归一化）；
  - 每条 feed 文章 URL 必须出现在 `sitemap-0.xml`。
  当前 6/6 条全部一致，可捕获「新增文章忘记进 feed / sitemap」一类真实回归。
- **I129 统计页机器可读入口**：`/stats/` 页头新增 `MACHINE / stats.json ↗` 链接（`/stats.json`），人类页面到机器接口一步可达。

### 迭代内记录

- 一次 `astro build` 进程以 `0xC0000409` 异常退出（此前多轮均正常，重跑即通过）；未影响产物，zip 仍按「解压 + 独立构建 + 全部门禁」复验。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）；`pnpm build` 通过；`check-feed` 一致性校验通过；`check-links --strict` 36 页 0 断链；`check-a11y` 36 页全绿。
- 检索：`RESULTS / 7 条档案`，`role=status`、`aria-live=polite`。
- 统计页：链接文本 `MACHINE / stats.json ↗`，`href=/stats.json`。
- 截图更新：`docs/screenshots/stats.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 检索结果数可再加「共 N 条 / 已筛选」的口语化播报；
3. Feed 一致性可扩展到分类/标签页 URL；
4. stats.json 可加入年份明细的机器字段；
5. 构建偶发崩溃可加 CI 重试说明。

## Iteration 56 — Feed 标准增强 / 文章 Article meta（23:50–00:35）

### 创新点

- **I130 RSS 标准增强**：`rss.xml` 补 `xmlns:atom` 命名空间与 `<atom:link rel="self" type="application/rss+xml">` 自引用；每条 item 输出 `<category>`（全站 17 个标签分类），阅读器可做分类聚合。
- **I131 JSON Feed 图标字段**：`feed.json` 补 `favicon`（192）与 `icon`（512），聚合器/阅读器可直接显示站点图标。
- **I132 文章页 Open Graph Article meta**：文章 `<head>` 新增 `article:published_time`、`article:modified_time`、`article:section`（分类）、`article:tag`（逐个标签），配合既有 `og:type=article` 提升分享卡片与抓取质量。
- **I133 Feed 门禁扩展**：`check-feed` 新增 `<atom:link rel="self">`、atom 命名空间、JSON Feed `favicon`/`icon`/`language` 校验；当前全部通过。

### 验证证据

- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）；`pnpm build` 通过；`check-feed` 通过（含新校验）；`check-links --strict` 36 页 0 断链。
- `dist/rss.xml`：`atom:link href=… rel="self"`、`xmlns:atom` 存在，`<category>` 17 个。
- 文章页产物：`article:published_time` / `article:modified_time` / `article:section` / `article:tag` 均存在。
- `dist/feed.json`：`favicon=https://example.com/icons/icon-192.png`、`icon=…icon-512.png`。
- 截图：`docs/screenshots/feed-source.webp`（浏览器中的 RSS 输出）。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. RSS item 可加 `<author>`/`dc:creator`（需作者邮箱或 dc 命名空间）；
3. Article meta 可加 `article:author`；
4. JSON Feed 可加 `_custom` 字段暴露站点版本；
5. Feed 截断长度（全文 feed 约 58KB）可按需提供摘要版。

## Iteration 57 — 文档版本一致性门禁 / 作者元数据（00:40–01:25）

### 创新点

- **I134 文档/版本一致性门禁**：新增 `scripts/check-docs.mjs` 并纳入 `pnpm verify`——检查 `package.json` 版本 = README「当前版本」= STATE「版本」、CHANGELOG 首条版本、截图版本说明、发布包路径、必需文档（THEMING/DESIGN/ASSETS/DEPLOY/CONTRIBUTING/theme README）存在且非空、ITERATIONS 长度合理；changelog 页面必须**构建期读取 CHANGELOG.md**（单一来源）。
- **I135 RSS 作者字段**：`rss.xml` 增加 `xmlns:dc` 与每条 `<dc:creator>`（6/6 条，作者来自 `profileConfig.name`）。
- **I136 JSON Feed `_site` 扩展字段**：输出 `{ name, url, generator: 'rhinelab-blog' }`（JSON Feed 允许 `_` 前缀扩展），自动化工具可识别生成器与站点。
- **I137 `article:author` meta**：文章页 Open Graph 补齐作者。

### 门禁自纠

- `check-docs` 首跑误报「changelog 页面未包含当前版本」——实际页面是在构建期读取 `CHANGELOG.md` 渲染，并非硬编码；断言改为校验「读取 CHANGELOG.md」与 `readFileSync` 存在，门禁转为通过。

### 验证证据

- `node scripts/check-docs.mjs`：`✔ 文档与版本号全部一致（v0.2.46）`（15 项）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）；`pnpm build` 通过；`check-feed` 通过（含 dc:creator / `_site` 校验）。
- `dist/rss.xml`：`xmlns:dc` 存在、`<dc:creator>` 6 个。
- `dist/feed.json`：`_site={name,url,generator}`。
- 文章页产物：`article:author` 存在。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. check-docs 可校验截图文件存在（当前只查版本说明文本）；
3. JSON Feed 可加摘要版 feed；
4. RSS 可加 `<docs>` 与 `<ttl>`；
5. 版本号可用脚本一键 bump（减少手工漏项）。

## Iteration 58 — 版本升级脚本 / 文档门禁扩展 / 发布哈希（01:30–02:15）

### 创新点

- **I138 `scripts/bump.mjs` 一键版本升级**：`node scripts/bump.mjs 0.2.48` 同步 `package.json`、README（当前版本 + 截图版本说明）、STATE（版本 + 发布包路径），并在 CHANGELOG 顶部插入 `## [X] — YYYY-MM-DD` 骨架；内置 semver 校验、拒绝同版本/降级、缺锚点即失败。本轮以自身做 dogfood（0.2.47 → 0.2.48）。
- **I139 文档门禁扩展**：`check-docs.mjs` 新增——README 引用的每个 `docs/screenshots/*.webp` **必须真实存在**（当前 40+ 张）、截图引用数量下限、主题包关键文件（`theme/install.mjs` / `theme/selftest.mjs` / `theme/README.md`）存在。
- **I140 发布 MANIFEST 增加哈希**：`package.mjs` 在 zip 生成后写入 `sha256:` 与 `size:`，交付方可校验压缩包完整性。

### 验证证据

- `node scripts/bump.mjs 0.2.48`：成功更新 4 个文件并插入 CHANGELOG 骨架（输出列出每个文件）。
- `node scripts/check-docs.mjs`：`✔ 文档与版本号全部一致（v0.2.48）`（含截图/主题包检查）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）。
- 打包后 MANIFEST 含 `sha256:` 与 `size:` 行（见下轮/本轮 zip 复验输出）。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. bump 脚本可支持 `--dry-run`；
3. MANIFEST 可再加逐文件 sha256；
4. check-docs 可校验 ITERATIONS 最新迭代号递增；
5. CONTRIBUTING 可加脚本使用示例截图。

## Iteration 59 — 自制版本徽章 / 快速门禁（02:20–03:05）

### 创新点

- **I141 自制版本徽章**：`scripts/generate-badge.mjs` 读取 `package.json` 版本与 `ITERATIONS.md` 迭代数，生成 **纯自制 SVG** `docs/badge-version.svg`（黄铜/深墨配色、等宽字体、无第三方 badge 服务、离线可用），README 顶部展示；`pnpm verify` / `pnpm build` 前自动重新生成，`check-docs` 校验徽章版本与迭代数同步。
- **I142 `pnpm verify:fast` 快速门禁**：不重新构建，基于现有 `dist` 依次跑 check-docs / links / a11y / contrast / feed / budget，适合改一行样式后的快速回归；`pnpm badge` 单独生成徽章。
- **文档**：CONTRIBUTING 命令表补充徽章生成与快速门禁用法。

### 验证证据

- `node scripts/generate-badge.mjs`：`docs/badge-version.svg → RHINE ARCHIVE v0.2.48 · 59 ITER (226×20)`（本轮 bump 后为 v0.2.49 · 60 ITER）。
- `node scripts/check-docs.mjs`：`✔ 文档与版本号全部一致`（含徽章校验）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）。
- 徽章 SVG 919 字节，无外部请求，可直接离线渲染。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 徽章可加深色/亮色双版本（当前为深底，亮色页面也清晰）；
3. verify:fast 可加入 docs 截图版本校验；
4. bump 脚本可支持 `--dry-run`；
5. CONTRIBUTING 可加徽章截图。

## Iteration 60 — 文档链接门禁 / README 图集与导航（03:10–03:55 · 第 60 轮）

### 创新点

- **I143 文档相对链接门禁**：`check-docs.mjs` 扫描 README、CONTRIBUTING、`docs/*.md` 中所有相对链接（58 条），逐一解析并确认目标文件存在；外部链接、锚点自动跳过。可防止重命名文档/截图后留下死链。
- **I144 README「更多细节」图集**：新增 9 组表格（检索引导/高亮/历史、快捷键浮层、代码复制、Mermaid 复制、LaTeX 复制、外链标记、回顶进度环、打印、站点索引、可访问性、版本沿革、制作说明、移动端目录/检索、订阅、404），README 引用截图从 22 张增至 **40 张**，全部来自真实构建产物。
- **I145 截图健康检查**：门禁校验 README 引用截图存在、体积 ≥1KB（防空白/损坏图）、数量 ≥30 张；本轮首跑即发现某张 2.1KB 小裁剪属正常范围，阈值按真实性调整为 1KB。
- **I146 README 顶部导航**：预览/它是什么/快速开始/安装到现有博客/主题定制/设计/部署/素材/贡献/迭代记录 一栏直达。

### 验证证据

- `node scripts/check-docs.mjs`：`✔ 文档与版本号全部一致（v0.2.50）`，`· 相对链接 58 条、截图 40 张均有效`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）。
- 门禁调试记录：首版截图阈值 3KB 误伤正常小裁剪 → 改为 1KB 并通过（门禁需要真实基线，而不是想当然的阈值）。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 文档链接校验可覆盖 `theme/` 内 Markdown；
3. README 图集可按亮/暗分组；
4. 截图健康可校验 webp 头部魔数（RIFF/WEBP）；
5. 距 24h 截止约 13 小时，继续迭代。

## Iteration 61 — 发布包校验脚本 / 文档门禁再扩展（04:00–04:45）

### 创新点

- **I147 发布包校验脚本**：新增 `scripts/verify-release.mjs` 与 `pnpm verify:release`——读取 release/ 最新 zip 与同名 MANIFEST，校验 **sha256 / size / 文件数** 三者一致；必需文件（package.json、锁文件、README、ITERATIONS、CHANGELOG、CONTRIBUTING、docs 四件套、徽章、主题安装器/自测/README、rhinelab.css）共 15 项齐全；禁止 `node_modules/` `dist/` `.astro/` `.rhine-backup/` 混入；输出实际 sha256。首跑对 v0.2.50 通过（`sha256 81e2f1a4…`，215 文件）。
- **I148 文档门禁再扩展**：`check-docs` 新增 `theme/README.md` 相对链接检查、**截图 WebP 魔数**（`RIFF....WEBP`，防扩展名伪装/损坏）、**版本徽章 SVG 有效性**（以 `<svg` 开头且闭合）。
- **I149 交付链文档化**：CONTRIBUTING 明确 `bump → check-docs → verify → package → verify:release` 五步，最后一步解决「交付的到底是不是校验过的那一份」。

### 验证证据

- `node scripts/verify-release.mjs 0.2.50`：`✔ 发布包与 MANIFEST 完全一致，必需文件齐全，无构建产物混入`。
- `node scripts/check-docs.mjs`：`✔ 文档与版本号全部一致`，58 条链接 / 40 张截图有效（含 WebP 魔数校验）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. verify-release 可解压后跑 theme selftest（更重的端到端版本）；
3. 截图可抽检尺寸（宽高比异常检测）；
4. 文档门禁可检查「最后一轮 ITERATION 编号」；
5. 距截止约 12.5 小时，继续迭代。

## Iteration 62 — 发布校验端到端 / 迭代编号门禁（04:50–05:35）

### 创新点

- **I150 `verify-release --full` 端到端**：`pnpm verify:release` 现在会——校验 zip ↔ MANIFEST（sha256/size/文件数/必需文件/禁止目录）→ 解压到临时目录 → 在**没有 node_modules、没有构建**的解压包内运行 `theme/selftest.mjs`（安装/幂等/验证/回滚）与 `scripts/check-docs.mjs`（版本/文档/截图/链接），全部通过才结束；临时目录自动清理。
- **I151 ITERATIONS 迭代编号门禁**：`check-docs` 校验迭代编号**唯一、连续（min–max 覆盖全部）且最新记录位于文件末尾**，防止手写迭代记录时跳号或追加到中间。
- 迭代内修复：`verify-release` 首版在 ESM 环境误用 `require('node:child_process')` 直接崩溃 → 改用已导入的 `spawnSync`，`--full` 复测通过。

### 验证证据

- `node scripts/verify-release.mjs 0.2.51 --full`：
  - `· 解压包主题安装器自测 通过`
  - `· 解压包文档一致性检查 通过`
  - `✔ 发布包与 MANIFEST 完全一致，必需文件齐全，无构建产物混入`（sha256 b66ef1f6…，216 文件）
- `node scripts/check-docs.mjs`：迭代编号 0–61 共 62 条连续唯一，通过。
- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. verify-release --full 可加「解压后构建」开关（需 node_modules，交付环境更重）；
3. 迭代编号门禁可对版本号做对应关系检查；
4. 可增加 CHANGELOG 与 ITERATIONS 的交叉一致性；
5. 距截止约 12 小时，继续迭代。

## Iteration 63 — 可访问性声明页刷新（05:40–06:20）

### 改进

- **可访问性声明与实现同步**：`/accessibility/` 键盘表扩到 **10 条**（新增 `?` 快捷键浮层及焦点限制、点击标题 `#` 复制章节链接）；自动门禁清单扩到 **7 项**（补 `check-feed` / `check-docs` / `theme/selftest`）；视觉与动效段补充 `aria-live` 结果播报、`aria-current` 当前位置、浮层焦点陷阱说明。
- **声明页版本绑定**：页面在构建期读取 `package.json` 显示 `VERSION`，并展示 `LAST REVIEW 2026-11-18`，避免声明页长期不更新却无人察觉。
- 截图更新：`docs/screenshots/accessibility.webp`（1928px 全页，含新表格与门禁）。

### 验证证据

- 页面 DOM：meta `2026-11-18` / `v0.2.52`；10 行快捷键（末两行为 `?` 与「点击标题 #」）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（85 files）；`check-a11y` 36 页通过；`check-links --strict` 36 页 0 断链。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 声明页可加「对比度数值表」；
3. 审查日期可由 CI 自动写入；
4. 可补 NVDA/VoiceOver 人工回归记录（当前无环境）；
5. 距 24h 截止约 11.5 小时，继续迭代。

## Iteration 64 — 摘要版 Feed / Skip link 焦点（06:30–07:15）

### 创新点

- **I154 摘要版 JSON Feed**：新增 `/feed-summary.json`——只含标题、摘要与 **600 字截断纯文本**（`toPlainText` 去标签/实体/合并空白），文件 **9,997 B vs 全文 35,913 B（约 28%）**；`_site.variant='summary'` 标识变体；订阅页新增第 4 张卡片、站点索引与 DEPLOY 文档同步；`check-feed` 校验版本 / variant / 条目数与全文一致 / summary 与 content_text 非空 / content_text ≤ 4000。
- **I155 Skip link 焦点转移**：`main#swup-container` 加 `tabindex="-1"`，点击 skip link 后 JS 将焦点移入主内容；实测 `document.activeElement` 为 `MAIN#swup-container`，键盘用户不必再穿过导航。

### 验证证据

- `pnpm build` 通过；`check-feed`：`✔ RSS 6 items / JSON Feed 6 items 结构全部通过`（含摘要 feed 校验）。
- 浏览器实测：skip link 点击后 `activeElement = MAIN#swup-container`；`/feed-summary.json` 6 条、`_site.variant=summary`、首条 `content_text` 600 字。
- 摘要 feed 体积：9,997 B（全文 35,913 B）。
- 订阅页：4 张卡片，摘要版链接指向 `/feed-summary.json`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（86 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 摘要 feed 可用于 `/subscribe/` 的「轻量订阅」推荐位；
3. skip link 可加「已跳转」视觉反馈；
4. check-feed 可校验摘要 feed 的 HTML 无残留标签；
5. 距截止约 8.5 小时，继续迭代。

## Iteration 65 — Feed 门禁硬化 / OG 压缩 / 摘要 feed 声明（07:20–08:05）

### 创新点

- **I156 Feed 门禁硬化**：RSS 每条 `description` 非空、正文不含 `<html`/`<body`、检测 `&amp;lt;` 双重转义；JSON Feed 同样检查；摘要 feed 的 `content_text` 检测 HTML 实体残留与 `<script>`/`<style>`/`<iframe>` 标签。首版正则把代码示例中的字面量 `<div>` 误判为残留 → 收窄为「实体残留 + 可执行/样式标签」后通过（允许代码文本里的 `<`）。
- **I157 摘要 feed 发现声明**：`<head>` 新增 `<link rel="alternate" type="application/feed+json" title="JSON Feed (摘要)">`；实测页面 head 有 3 条 alternate（RSS / JSON Feed / 摘要）。
- **I158 OG 分享图调色板压缩**：`generate-og.mjs` 改用 `palette: true, colours: 128, quality: 90`；单图约 **33KB → 23KB（-30%）**，`dist/og` **244K → 172K**，总产物 **6741 → 6674KB（97%）**；抽检 1200×630 图无可见色带，文字/网格清晰。

### 验证证据

- `node scripts/check-feed.mjs`：`✔ RSS 6 items / JSON Feed 6 items 结构全部通过`（含摘要 feed 硬化校验）。
- 浏览器 head：3 条 `rel=alternate`（rss.xml / feed.json / feed-summary.json）。
- `check-budget`：总产物 6674KB / 6912KB（97%），其余分项通过。
- OG 抽检：`dist/og/03-interface.png` 23,519 B，1200×630，视觉无损。
- `pnpm check`：0 errors / 0 warnings / 0 hints（86 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. OG 可尝试 96 色进一步压缩（需逐图抽检）；
3. RSS 的 JSON alternate 地址可改绝对路径（当前相对，浏览器可解析）；
4. 摘要 feed 可在订阅页标注「轻量推荐」；
5. 距截止约 8 小时，继续迭代。

## Iteration 66 — 年度字符数 / 系列更新时间 / Feed 徽章与绝对地址（08:10–08:50）

### 修复

- **B50 feed alternate 地址不一致**：`<head>` 的 JSON Feed / 摘要 JSON Feed `rel=alternate` 原为相对路径（`/feed.json`），RSS 为绝对地址 → 统一改为绝对地址；实测 head 3 条 alternate 均为 `https://example.com/...`。

### 改进

- **I159 年度对比增加字符数**：`/stats/` 年度行现为 `05 FILES · 2,211 WORDS · 4,134 CHARS · 8 MIN`（2025：`01 · 310 · 367 · 1`），字数与字符双维度可对照。
- **I160 系列最近更新时间**：`/series/` 每个系列标题行追加 `UPDATED 2026.11.18`（取该系列 max(updated, published)），一眼判断系列是否新鲜。
- **I161 摘要 feed 视觉标识**：订阅页 `JSON Feed 摘要版` 卡片增加黄铜描边 `LIGHT` 徽章，与全文版区分。

### 验证证据

- 浏览器 `/stats/`：年度行含 CHARS（4,134 / 367）；head alternate 3 条绝对地址。
- 浏览器 `/series/`：`04 FILES · 1,925 WORDS · 7 MIN · UPDATED 2026.11.18`。
- 浏览器 `/subscribe/`：摘要卡片含 `LIGHT` 徽章。
- 截图更新：`docs/screenshots/stats.webp`、`series.webp`、`subscribe.webp`（1280 全页）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（86 files）；`check-a11y` / `check-links` 通过。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 系列页可显示「最近更新」相对时间（如 3 天前）；
3. 年度统计可加「字符/字」比率；
4. LIGHT 徽章可复用到其他轻量入口；
5. 距截止约 7.5 小时，继续迭代。

## Iteration 67 — Feed 阅读器兼容预检 / 404 入口扩展（08:55–09:35）

### 创新点

- **I162 Feed 阅读器兼容静态预检**：`check-feed` 对 RSS `content:encoded` 与 JSON Feed `content_html` 增加正文安全检查——禁止 `<script>`/`<iframe>`/`<object>`/`<embed>`/`<style>`、禁止内联 `on*=` 事件处理器、每张 `<img>` 必须有 `alt`、含 KaTeX（`class="katex"`）的正文必须同时有 `<math>` MathML 兜底（否则不支持 KaTeX 的阅读器会看到空白公式）、禁止 `data:` URI（base64 图片除外）；当前 6 条 RSS / 6 条 JSON 全部通过。
- **I163 404 页入口扩展**：`.rl-404__actions` 从 3 个增加到 **5 个**——返回总览 / 打开索引 / 随机档案 / 订阅更新 / 检索终端，用户迷路时多条路径回到内容。

### 验证证据

- `node scripts/check-feed.mjs`：`✔ RSS 6 items / JSON Feed 6 items 结构全部通过`（含新正文安全预检）。
- 浏览器 404 实测：动作按钮 `[返回总览, 打开索引, 随机档案, 订阅更新, 检索终端]`，最近归档案卷 3 条。
- 截图更新：`docs/screenshots/404.webp`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（86 files）；`check-a11y` / `check-links` 通过。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. Feed 预检可校验 `<img>` 的 `src` 为绝对地址；
3. 404 可显示「你可能在找」的分类入口；
4. 系列相对时间（如「3 天前」）；
5. 距截止约 7 小时，继续迭代。

## Iteration 68 — 对比度数值表 / Feed 图片校验（09:40–10:25）

### 创新点

- **I164 可访问性页对比度数值表**：`check-contrast` 新增 `--write-data`，构建前把 2 套主题 × 16 组实测结果写入 `src/data/contrast-report.json`；可访问性页直接读取 JSON 渲染表格（组合 / 比例 / AA-AAA），并在表格下注明「构建前生成、页面不重复计算」。实测样例：`ink on bg 15.88:1 AAA`、`ink-2 on bg 5.71:1 AA`、`muted on bg 5.28:1 AA`，共 32 行。
- **I165 Feed 图片绝对地址校验**：`check-feed` 的正文安全预检增加 `<img src>` 必须为绝对 `http(s)` 地址、必须有 `src`；当前 feed 图片全部绝对。
- `check-docs` 校验对比度报告存在、2 套主题、32 行；`pnpm verify` 在 build 前自动生成数据。

### 验证证据

- 浏览器 `/accessibility/`：2 个主题表、32 行、AA/AAA 等级正确（16 组/主题）。
- `node scripts/check-feed.mjs`：通过（含图片地址校验）。
- `node scripts/check-docs.mjs`：通过（含对比度数据校验）。
- 截图更新：`docs/screenshots/accessibility.webp`（2661px 全页，含数值表）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（86 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器兼容实测（需真实订阅 URL 与网络）；
2. 对比度表可按比例排序或筛选；
3. 数值表可标注「阈值 4.5:1」辅助线；
4. feed 图片可校验宽高属性；
5. 距截止约 6.8 小时，继续迭代。

## Iteration 69 — 阅读器兼容文档 / 对比度排序 / 年度同比（10:30–11:15）

### 创新点

- **I166 阅读器兼容文档 `docs/READERS.md`**：三种订阅源一览（RSS 全文 / JSON Feed 全文 / 摘要版）、为阅读器做的 7 项处理（绝对地址、去锚点、MathML 兜底、脚本清理、图片 alt+绝对 src、单次转义、分类/作者）、常见阅读器建议表（Feedly/Inoreader/NetNewsWire/Reeder/FreshRSS/脚本）、`curl` 手动验证与 5 条已知限制（Mermaid 需 JS、代码高亮降级、全文体积、阅读器样式、评论）；README/DEPLOY/check-docs 同步引用。
- **I167 对比度表可读性**：亮/暗两表改为**按比例升序**（最低在前），每个主题顶部显示「LOWEST / 最低」摘要——亮色 `amber-ink on amber-wash-3 · 4.66:1`，暗色 `muted on surface-2 · 5.60:1`，优先暴露风险项。
- **I168 年度同比增量**：`/stats/` 年度行增加 `Δ +1,901 WORDS (+613%)`（相对下一年），一眼看出体量变化。

### 验证证据

- 浏览器 `/stats/`：delta `Δ +1,901 WORDS (+613%)`。
- 浏览器 `/accessibility/`：两主题「LOWEST」摘要与升序表格（32 行）。
- `node scripts/check-docs.mjs`：59 条相对链接、40 张截图有效（新增 READERS 链接与必需文档）。
- 截图更新：`docs/screenshots/stats.webp`、`accessibility.webp`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（86 files）；`check-a11y` / `check-links` 通过。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制（无公网订阅 URL）；
2. READERS 文档可附各阅读器截图（无环境）；
3. 对比度表可加「阈值线」图例；
4. 年度同比可扩展到 CHARS；
5. 距截止约 6.5 小时，继续迭代。

## Iteration 70 — 制作说明同步 / 404 分类入口 / 阈值图例（11:20–12:05）

### 改进

- **I169 制作说明页同步**：`/colophon/` 构建脚本清单从 8 条扩到 **13 条**，补上 `generate-badge`、`check-feed`、`check-docs`、`bump`、`verify-release`，并更新 OG（128 色）/ 图标（PWA + 快捷方式）/ 对比度（生成数据）说明；页面与实际 `scripts/` 目录一致。
- **I170 404 分类入口**：新增「BROWSE / 按分类查找」chips（`工程研究 2`、`机构档案 4`），直达分类归档页；与 5 个动作按钮组成完整迷路恢复路径。
- **I171 对比度阈值图例**：可访问性页数值表补充「AA ≥ 4.5:1，AAA ≥ 7:1」，非专业读者也能自行判断。

### 验证证据

- 浏览器 404：分类 chips `[工程研究 2, 机构档案 4]`，动作按钮 5 个。
- 浏览器 `/colophon/`：脚本清单 13 条，含 verify-release 等新脚本。
- 截图更新：`docs/screenshots/404.webp`、`colophon.webp`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（86 files）；`check-a11y` / `check-links` 通过。

### 已知问题 / 下一轮候选

1. 外部阅读器实测（无公网订阅 URL，仍静态校验）；
2. colophon 可列出「门禁顺序」流程图；
3. 404 分类可显示最近更新日期；
4. 年度同比可扩展 CHARS；
5. 距截止约 6 小时，继续迭代。

## Iteration 71 — 站内阅读器页 / 门禁流程 / CHARS 同比（12:10–13:00）

### 创新点

- **I172 站内「阅读器兼容」页 `/readers/`**：把 `docs/READERS.md` 的核心内容变成站内页面——3 种订阅源表格（含内容与适用场景）、7 项兼容处理、4 类阅读器建议、5 条已知限制；About 枢纽新增第 12 张卡片、站点索引 PAGES、订阅页提示语、README 图集同步入口。实测 DOM：表格 7 行、列表 12 项。
- **I173 门禁顺序可视化**：`/colophon/` 新增「GATES / 门禁顺序」——15 步从 `astro check` 到 `package → verify-release` 的编号流程，并注明「任一步失败即不可交付」与解压后复验。
- **I174 年度同比扩展 CHARS**：`/stats/` 年度行同时显示 `Δ +1,901 WORDS (+613%)` 与 `Δ +3,767 CHARS (+1,026%)`。
- 迭代内修复：stats 的 CHARS delta 首版把新 span 嵌进 WORDS 三元表达式导致 Astro 编译失败（`Expected ")" but found "{"`）→ 拆成两个独立条件表达式；随后 build 因 esbuild 崩溃一次，重跑通过。

### 验证证据

- 浏览器 `/readers/`：订阅源 3 行、列表 12 项；`/stats/` deltas = 2 条；`/colophon/` 门禁节点 15 个。
- 截图新增/更新：`readers.webp`、`stats.webp`、`colophon.webp`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（87 files，新增 readers 页）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. readers 页可加「一键复制订阅地址」按钮（订阅页已有）；
3. 门禁流程可标注预计耗时；
4. CHARS 同比可做图表；
5. 距截止约 5.5 小时，继续迭代。

## Iteration 72 — 隐私页 / 订阅地址复制（13:05–13:55）

### 创新点

- **I175 阅读器页一键复制订阅地址**：三个订阅源行内新增「复制」按钮（`data-rl-copy-url`），点击复制**绝对地址**并显示「已复制订阅地址」toast + 按钮黄铜态 1.4s；实测 `http://127.0.0.1:4400/rss.xml`、toast 与复制态均正确；`ui.js` 用事件委托实现，后续任何 `data-rl-copy-url` 元素都可复用。
- **I176 站内「隐私与数据」页 `/privacy/`**：数据最小化声明（追踪脚本 00 / Cookie 00 / 本地存储 04）、localStorage 键位表（`theme`、`hue`、`rl-toc-open`、`rl-search-history` 及用途/保留时间）、第三方与外部链接说明、用户控制权、同人与素材边界（无官方游戏素材、代码 MIT）；About 枢纽第 13 卡、站点索引、README 图集同步。
- 实测：readers 页 3 个复制按钮；privacy 页 meta `00/00/04`、4 行存储表、8 条说明。

### 验证证据

- 浏览器 `/readers/`：复制按钮 3 个，点击后剪贴板绝对地址 + toast「已复制订阅地址」+ `is-copied`。
- 浏览器 `/privacy/`：表 4 行、键名 `[theme, hue, rl-toc-open, rl-search-history]`、列表 8 条。
- 截图更新：`readers.webp`、新增 `privacy.webp`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（88 files，新增 privacy 页）；`check-a11y` / `check-links` 通过。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 隐私页可加「最后更新日期」；
3. 复制按钮可扩展到站点索引的机器入口；
4. 隐私声明可按部署方自定义（文档提示）；
5. 距截止约 4.5 小时，继续迭代。

## Iteration 73 — 孤儿资源清理 / 隐私页绑定 / 机器入口复制（13:58–14:45）

### 优化（预算修复）

- **I177 `_astro` 孤儿资源清理**：`optimize-dist` 新增引用扫描——构建后收集所有 HTML/JS/CSS/XML/JSON 文本，删除 `dist/_astro/` 中未被任何产物引用的文件。首跑发现并清掉历史残留 `demo-avatar.png`（**108.4 KB**），总产物 **6777 → 6670 KB（98% → 96%）**，为后续新增页面留出预算余量。

### 创新点

- **I178 隐私页版本绑定**：`/privacy/` 页头 meta 增加 `LAST REVIEW 2026-11-18` 与 `VERSION vX`（构建期读取 package.json），声明页不再与版本脱节。
- **I179 站点索引机器入口「复制链接」**：8 个机器入口条目新增复制按钮（`data-rl-copy-url` + `data-rl-copy-label`），复用 ui.js 事件委托；toast 按元素自定义（站点索引「已复制链接」、阅读器页「已复制订阅地址」）。

### 验证证据

- `optimize-dist` 日志：`清理 _astro 孤儿资源 1 个（108.4 KB）`；`check-budget` 总产物 6670KB / 6912KB（96%）。
- 浏览器 `/privacy/`：meta `[00, 00, 04, 2026-11-18, v0.2.62]`。
- 浏览器 `/sitemap/`：复制按钮 8 个，点击复制的地址为绝对 URL、toast「已复制链接」。
- 截图更新：`privacy.webp`、`sitemap.webp`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（88 files）；`check-a11y` / `check-links` 通过。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 孤儿清理可进一步扫描 `pagefind/` 旧版本文件；
3. 复制按钮可覆盖页脚 RSS 等入口；
4. 隐私页审查日期可自动化；
5. 距截止约 3.5 小时，继续迭代。

## Iteration 74 — SEO 门禁 / 归档页重复标题修复 / 移动端复核（14:50–15:40）

### 严重 bug 修复

| # | 问题 | 根因 | 修复 |
| --- | --- | --- | --- |
| B51 | **15 个分类/标签归档页共用同一 `<title>`**「归档 - 莱茵档案」，搜索引擎无法区分，摘要也相同 | `archive/category/[category].astro`、`archive/tag/[tag].astro` 与 Fuwari 默认 `uncategorized.astro` 均直接使用 `i18n(I18nKey.archive)` | 分类页 → `分类：X`、标签页 → `标签：X`、未分类 → `未分类`，并各自给出唯一 description；同时去掉与 Layout 自动拼接站点名重复的后缀 |

### 创新点

- **I180 新增 SEO 静态门禁 `scripts/check-seo.mjs`**：检查每页非空且**全站唯一**的 `<title>`、非 noindex 页的 meta description 与绝对 canonical、所有 `application/ld+json` 可解析且包含 `@context`/`@type`（BlogPosting 需 headline/datePublished，WebSite 需 url，BreadcrumbList 需 itemListElement）；属性解析兼容压缩后的无引号写法。已接入 `pnpm verify` 与 colophon 门禁清单；首跑即抓出 B51（91 条 → 修复后 0 条）。
- **I181 移动端 390px 复核**：readers / privacy / stats / sitemap 四页 `scrollWidth 375 < clientWidth 390`，无横向溢出；表格区域使用独立 `overflow-x` 容器。

### 验证证据

- `node scripts/check-seo.mjs`：`38 个页面 · 38 个唯一标题 · 13 段 JSON-LD · 36 个 canonical`，全部通过。
- 浏览器分类页标题：`分类：工程研究 - 莱茵档案`（单次站点名）；标签页 `标签：Astro - 莱茵档案`；未分类 `未分类 - 莱茵档案`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（88 files）。
- 移动端 iframe 实测四页无横向滚动。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. canonical 可校验与页面自身 URL 一致；
3. JSON-LD 可校验 dateModified ≥ datePublished；
4. 移动端可抽检更多页面（gallery、timeline）；
5. 距截止约 2.8 小时，继续迭代。

## Iteration 75 — SEO 门禁增强 / 移动端扩展抽检（15:45–16:30）

### 创新点

- **I182 `check-seo` 增强**：新增四类校验——
  - canonical 必须与页面自身路径一致（`foo/index.html` → `/foo/`，中文路径做 decode 归一）；
  - 全站 canonical 只能有一个站点源（防止 SITE_URL 配置漂移混入）；
  - `og:image` 必须为绝对地址且对应文件存在于 `dist/`（本轮统计 38 张全部存在）；
  - JSON-LD `BlogPosting.dateModified` 若存在必须为合法日期且 ≥ `datePublished`。
  首版因中文 URL 百分号编码与文件系统路径直接比较产生 11 条误报 → 增加解码归一后通过。
- **I183 移动端扩展抽检**：390px 下 gallery / timeline / about / series / readers / privacy 六页 `scrollWidth 375 < clientWidth 390`，全部无横向溢出；结合上轮 stats/sitemap，已覆盖 10 个主要页面。

### 验证证据

- `node scripts/check-seo.mjs`：`38 个页面 · 38 个唯一标题 · 13 段 JSON-LD · 36 个 canonical · 38 张 OG 图`，全部通过。
- 移动端 iframe 实测 6 页：`scroll=375 / client=390`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（88 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. canonical 一致性可覆盖 base 子路径部署；
3. OG 图可校验 1200×630 尺寸；
4. 移动端可截图存档（当前为数值验证）；
5. 距截止约 6.5 小时，继续迭代。

## Iteration 76 — sitemap lastmod / OG 尺寸 / base 前缀（16:35–17:20）

### 创新点

- **I184 sitemap 补齐 `lastmod`**：`astro.config.mjs` 在配置期扫描文章 frontmatter 的 `published/updated`，通过 `@astrojs/sitemap` 的 `serialize` 为 **36 条 URL 全部**写入 `lastmod`——文章用自身 updated/published（如 `/posts/02-reproducible/` → 2026-11-18、`/posts/00-archive-init/` → 2026-11-01、`/posts/98-archive-2025/` → 2025-12-20），其余页面用最新内容日期。
- **I185 OG 图尺寸校验**：`check-seo` 读取 `og:image` 实际 PNG 头（IHDR）校验 **1200×630**，并确认 38 张 OG 图全部为合法 PNG 且文件存在。
- **I186 canonical 支持子路径 base**：从首页 canonical 推导部署 base 前缀（当前 `/`），其他页面按 `base + 页面路径` 校验，子路径部署（如 `/blog/`）不会再误报。
- `check-seo` 同时校验 sitemap 每条 URL 都有合法 `lastmod`；输出统计扩展为 `36 条 sitemap`。

### 验证证据

- `dist/sitemap-0.xml`：36 个 `<url>`、36 个 `<lastmod>`；逐条抽查文章日期正确。
- `node scripts/check-seo.mjs`：`38 个页面 · 38 个唯一标题 · 13 段 JSON-LD · 36 个 canonical · 38 张 OG 图 · 36 条 sitemap`，全部通过。
- `pnpm check`：0 errors / 0 warnings / 0 hints（88 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. sitemap extra 页面（分类/标签）lastmod 可细化到分类最新文章；
3. OG 图可校验文件大小上限；
4. 子路径部署可做一次实际构建验证（BASE_URL 注入）；
5. 距截止约 6 小时，继续迭代。

## Iteration 77 — 子路径部署支持 / 分类标签 lastmod（17:25–18:15）

### 创新点

- **I187 `SITE_URL` / `BASE_PATH` 子路径部署**：`astro.config.mjs` 改为读取环境变量（默认 `https://example.com` + `/`）；实测 `SITE_URL=https://example.com BASE_PATH=/rhine-test/ pnpm build` 后——canonical 为 `https://example.com/rhine-test/`、首页 86 处资源引用带前缀、sitemap 36 条 URL 全部带 `/rhine-test/`。同时让 `check-links` / `check-seo` 支持 `BASE_PATH`（HTML/CSS/sitemap/OG 资源映射先剥离前缀再对文件），子路径产物可完整跑门禁：`check-links` 1940 链接 / 178 锚点 / 227 资源通过，`check-seo` 通过。
- **I188 分类/标签 sitemap lastmod 细化**：配置期同时解析文章 `category` 与 `tags`，分类/标签页 lastmod 取该聚合下最新文章日期（如 `可访问性` 2026-11-08、`建站` 2026-11-01、`Markdown` 2026-10-30），不再统一用全站最新日期。
- **I189 文档**：`docs/DEPLOY.md` 新增「子路径部署（/blog/ 等）」小节（构建命令 + 门禁校验命令 + 主题覆盖提示）。

### 验证证据

- 子路径构建：canonical `https://example.com/rhine-test/`；sitemap 首条 `https://example.com/rhine-test/`；`check-links`、`check-seo`（带 `BASE_PATH`）全部通过。
- 默认构建恢复后：sitemap 根路径、SEO 全部通过、预算 6677KB / 6912KB（97%）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（88 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 子路径构建目前为手动验证，可加一条 `scripts/build-subpath-test.mjs` 自动化；
3. OG 文件大小上限可补；
4. feed 中 canonical 可在子路径下再抽查；
5. 距截止约 5 小时，继续迭代。

## Iteration 78 — 子路径自动化 / OG 上限 / 验证命令复制（18:20–19:10）

### 创新点

- **I190 `pnpm test:subpath` 子路径自动化验证**：新增 `scripts/test-subpath.mjs`——以 `BASE_PATH=/rhine-test/` 构建 → 带 BASE_PATH 跑 `check-links` / `check-seo` / `check-feed` → **无论成败都恢复默认根路径构建**；实测全绿（38 页、36 条 sitemap、feed 一致），并确认恢复后 sitemap 回到根路径。首版因 `spawnSync(shell:true)` 把带空格的 Node 路径拆开导致 3 项假失败 → 改为 pnpm 用 shell、node 直接执行后通过。
- **I191 OG 图体积上限**：`check-seo` 对每张 OG 图增加 ≤80KB 上限（当前 ~23KB），防止未来图片生成脚本产出过大 PNG。
- **I192 阅读器页 curl 验证命令**：页面展示并一键复制 `curl -sI https://example.com/rss.xml | head -5`（绝对 URL）；通用复制按钮支持命令文本（`data-rl-copy-label` + 仅对路径/URL 做绝对化），实测复制内容与 toast「已复制验证命令」正确。

### 迭代内修复

- 通用复制按钮原逻辑对任何 `data-rl-copy-url` 都做 `new URL()`，把 curl 命令编码成站点相对 URL → 改为仅当值以 `/` 或 `http(s)://` 开头才绝对化，其余原样复制。

### 验证证据

- `pnpm test:subpath`：子路径构建 + check-links + check-seo + check-feed 全过，恢复默认构建成功。
- 浏览器 `/readers/`：命令文本 `curl -sI https://example.com/rss.xml | head -5`，复制结果一致、toast「已复制验证命令」。
- 截图更新：`readers.webp`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（88 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 子路径验证可纳入 CI 定时任务（当前手动 `pnpm test:subpath`）；
3. OG 上限可加入 `check-budget` 单文件分类统计；
4. 复制命令可加更多（JSON Feed / sitemap）；
5. 距截止约 4 小时，继续迭代。

## Iteration 79 — PWA 阅读器快捷方式 / OG 预算 / 三条验证命令（19:15–20:00）

### 创新点

- **I193 PWA 第 5 个快捷方式「阅读器」**：新增自制 SVG（列表 + 信号弧）→ `generate-icons` 输出 96/192 PNG（总 13 个图标）；manifest `shortcuts` 增至 **5 个**（归档 / 统计 / 订阅 / 随机 / 阅读器），安装到桌面后可直达 `/readers/`。
- **I194 `check-budget` 增加 OG 预算**：OG 分享图合计上限 **260KB**，当前 **158.7KB（61%）**；配合 `check-seo` 的单图 ≤80KB 与 1200×630 校验，形成体积 + 尺寸双保险。
- **I195 阅读器页三条验证命令**：RSS / JSON Feed / Sitemap 各一条 `curl` 命令，均带「复制命令」按钮；实测三条复制内容与页面文本一致、toast「已复制验证命令」。

### 验证证据

- manifest：5 个 shortcuts，阅读器图标 `/icons/shortcut-readers-192.png` 存在（96/192 均已生成）。
- `check-budget`：`OG 图片合计 158.7 KB / 260.0 KB（61%）`，全部通过。
- 浏览器 `/readers/`：3 个命令块，三条复制内容分别为 rss.xml / feed.json / sitemap-index.xml。
- 截图更新：`readers.webp`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（88 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 快捷方式图标可做 maskable 变体；
3. OG 预算可拆分「每篇平均」；
4. readers 命令可加 `-L` 跟随重定向示例；
5. 距截止约 3.5 小时，继续迭代。

## Iteration 80 — 构建指纹 / 制作说明版本行 / OG alt 校验（第 80 轮，20:05–20:50）

### 创新点

- **I196 `/build-info.json` 构建指纹**：新增 JSON 端点，构建期读取 `package.json` 与 `ITERATIONS.md`，输出 `version / iterations / generated_at / site / home_page_url / generator / stack`；部署后 `curl .../build-info.json` 即可确认线上版本。站点索引机器入口、DEPLOY 文档同步。实测：`{version:"0.2.69", iterations:80, generator:"rhinelab-blog"}`。
- **I197 制作说明构建行版本化**：`/colophon/` 构建行由 `Astro vX · Node…` 扩展为 `Astro v6.4.8 · rhinelab v0.2.69 · 80 ITER · Node ≥22.12 · pnpm 9 · STATIC OUTPUT`，构建信息与版本/迭代数一致。
- **I198 OG alt 校验**：`check-seo` 要求有 `og:image` 的页面同时提供非空 `og:image:alt`（38 页全部满足），避免分享卡片缺失替代文本。

### 验证证据

- 浏览器 `/build-info.json`：解析出 `version=0.2.69`、`iterations=80`、`generator=rhinelab-blog`、含 `generated_at`。
- 浏览器 `/colophon/`：构建行含 `rhinelab v0.2.69 · 80 ITER`；门禁节点 16 个；站点索引含 `build-info.json` 入口。
- 截图更新：`colophon.webp`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files，新增 build-info 端点）；`check-seo` 全部通过。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. `build-info.json` 可加入构建产物体积统计；
3. colophon 可显示最近一次 verify 的通过时间（不可离线获取，跳过）；
4. `/changelog/` 可链接 build-info；
5. 距截止约 6 小时，继续迭代。

## Iteration 81 — 构建指纹体积 / 一致性门禁 / changelog 机器入口（20:55–21:40）

### 创新点

- **I199 build-info 产物体积统计**：`optimize-dist` 在优化完成后回写 `dist/build-info.json` 的 `assets: { files, bytes }`（当前 **219 文件 / 6,843,180 bytes ≈ 6.69MB**），部署后可核对线上产物体积与本地构建是否一致。
- **I200 build-info 一致性门禁**：`check-seo` 新增——build-info `version` 必须等于 `package.json`、`iterations` 必须等于 ITERATIONS 实际条数、`generated_at` 合法、`assets` 存在且非零；首跑即通过（`0.2.70 · 81 轮 · 219 files`）。
- **I201 `/changelog/` 机器入口**：版本沿革页头新增 `MACHINE / build-info.json ↗`，与统计页 `stats.json` 入口对称。

### 迭代内备注

- 版本沿革页全页高度已达 **19,659px**，超过 WebP 单图 16,383px 上限 → 截图工作流改为「视口截图」保存 `changelog.webp`（避免生成失败），并在 ITERATIONS 记录该工具约束。

### 验证证据

- 浏览器 `/build-info.json`：`version 0.2.70 / iterations 81 / assets {files:219, bytes:6843180}`。
- 浏览器 `/changelog/`：`MACHINE / build-info.json ↗` → `/build-info.json`。
- 截图更新：`changelog.webp`（视口）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. build-info 可加 `checks` 布尔汇总（需 check 脚本回写，暂缓）；
3. changelog 页可折叠旧版本以降低页面高度；
4. 截图可自动裁切避免超限；
5. 距截止约 5.5 小时，继续迭代。

## Iteration 82 — 沿革页折叠 / 锚点自动展开 / 截图恢复（21:45–22:40）

### 创新点

- **I202 版本沿革页折叠**：最近 6 个版本直接展示，其余 **76 个**版本收进 `<details class="rl-changelog__older">`；页面高度从 **19,659px 降到 1,936px**，浏览与截图都恢复可用。
- **I203 旧版本锚点自动展开**：新增 `public/rhine/changelog.js`——访问 `#v0-2-1` 时自动打开包含该版本的 `<details>` 并滚动到目标；实测 `detailsOpen=true`、目标可见。
- **I204 全页截图恢复**：折叠后 `changelog.webp` 恢复为全页截图（1280×1,936），不再受 WebP 单图 16,383px 限制。
- 迭代内修复：首版把 `<details>` 拼进前端模板字符串导致 Astro 解析失败（`Expression expected` 等 5 条错误、build 崩溃）→ 改为字符串拼接 + 独立 `changelog.js` 后通过。

### 验证证据

- 折叠状态：`details` 摘要「更早的版本 / EARLIER RELEASES（76）」，页面高度 1,936px；展开后 19,904px。
- 锚点测试：`/changelog/#v0-2-1` → `detailsOpen=true`、目标在视口内。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-links` / `check-a11y` 通过。
- 截图更新：`changelog.webp`（全页 1280×1,936）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 折叠状态可记忆（localStorage，暂不做，避免新增存储项）；
3. 沿革页可加版本搜索/过滤；
4. 折叠摘要可显示版本范围；
5. 距截止约 4.5 小时，继续迭代。

## Iteration 83 — 版本沿革过滤 / 折叠范围摘要（22:45–23:30）

### 创新点

- **I205 版本沿革页过滤**：顶部新增搜索框，按版本号或关键词过滤 **全部 83 个版本**（同时覆盖可见区与折叠区）：实时显示「匹配 12 / 83」、无结果显示空状态、命中折叠内版本时自动展开 `<details>`；清空后恢复 83 个版本并收起折叠区（已实测四种状态）。
- **I206 折叠摘要版本范围**：折叠摘要由「更早的版本（77）」升级为「更早的版本 / EARLIER RELEASES　**v0.1.0 – v0.2.66**（77）」，读者一眼知道折叠内容覆盖范围。
- 迭代内修复：首版过滤只统计直接子节点（可见 6 个版本、计数错误「6 个版本」）且无法过滤折叠区 → 重写分组逻辑，把 `<details>` 子节点也按 h2 分组后统一过滤。

### 验证证据

- 初始：`83 个版本`；输入 `0.2.1` → `匹配 12 / 83`、details 自动展开；输入 `zzzz` → 空状态提示；清空 → 回到 `83 个版本`、details 收起。
- 折叠摘要：`v0.1.0 – v0.2.66（77）`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-links` / `check-a11y` 通过。
- 截图更新：`changelog.webp`（含过滤框，1280×2,021）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 过滤可支持多关键词（空格分隔），暂为整串包含；
3. 过滤可同步 URL `?q=` 以便分享；
4. 折叠摘要范围在版本号排序非语义化时可能不准（当前依赖 CHANGELOG 顺序）；
5. 距截止约 4 小时，继续迭代。

## Iteration 84 — 多关键词过滤 / ?q= 同步 / RSS 品牌图（23:35–00:20）

### 创新点

- **I207 版本沿革多关键词与 `?q=` 同步**：过滤改为空格分隔的 AND 语义（如 `feed 对比度` 需同时命中）；每次输入用 `history.replaceState` 同步 `?q=`，刷新/分享链接可恢复过滤状态；实测 `?q=feed 对比度` → `匹配 5 / 84`，改为 `rss 图标` → `匹配 2 / 84` 且 URL 变为 `?q=rss+图标`，清空 → `84 个版本` 且 URL 清空。
- **I208 RSS channel 品牌图**：`rss.xml` 增加 `<image><url>https://example.com/icons/icon-192.png</url><title>莱茵档案</title>…`，阅读器列表可显示站点图标；`check-feed` 新增校验（`<image>` 存在、url 绝对、对应产物存在、含 `<title>`），实测通过。

### 迭代内备注

- 首版 `check-feed` 补丁锚点写错导致脚本中途断言失败，`changelog.js` 的改动未落盘；按实际文件结构重新定位后分步补齐（本次记录以便复盘）。

### 验证证据

- 浏览器 `/changelog/?q=...`：多关键词、URL 同步、清空恢复均正确。
- `check-feed`：`RSS 6 items / JSON Feed 6 items 结构全部通过`；RSS 中 `<image>` 指向 `/icons/icon-192.png`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。
- `pnpm build`：通过。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. RSS image 尺寸字段与图标实际尺寸（192）一致，若未来图标改为 512 需同步；
3. `?q=` 可同步到 Pagefind 检索（不同页面，暂不做）；
4. 过滤可加“清除”按钮；
5. 距截止约 3.5 小时，继续迭代。

## Iteration 85 — 清除按钮 / 分类体积 / feed 构建版本（00:25–01:10）

### 创新点

- **I209 版本沿革过滤清除按钮 + Esc**：输入后显示「清除 / CLEAR」，点击或按 Esc 清空过滤、URL 与计数；修复首版「`?q=` 恢复时清除按钮仍隐藏」的问题（把可见性更新移入 applyFilter）。实测：`?q=rss` → 按钮可见、计数「匹配 13 / 85」→ 点击清空 → 「85 个版本」+ URL 清空；输入 feed 后按 Esc 同样清空。
- **I210 build-info 分类体积**：`assets.byType` 输出 html / json / png / other / xml / js / svg / css / woff2 九类体积（220 文件 / 6,849,481 bytes），部署方可按类型核对产物构成。
- **I211 feed 构建版本**：`feed.json` 与 `feed-summary.json` 的 `_site.build` 写入 `0.2.74`，`check-feed` 校验语义化版本；端点改为 JSON 导入（Vite 内联），避免 `import.meta.url` 在 prerender chunk 中指向错误导致构建失败。

### 迭代内排障

- 首版在 endpoint 里用 `fs` + `import.meta.url` 读取 package.json → 构建期路径落到 `dist/.prerender/chunks`，`readFileSync` 报错、build 退出 1；改用 `import packageJson from '../../package.json'` 后通过。

### 验证证据

- 浏览器 `/changelog/?q=rss`：按钮可见性、清除、Esc 三种状态正确（详见上文数值）。
- JSON feeds：`_site = {name, url, generator: rhinelab-blog, build: '0.2.74', variant?}`；`check-feed` 通过。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`pnpm build` 通过。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. byType 可在 build-info 页面/统计页展示（当前仅 JSON）；
3. 清除按钮可加 aria-keyshortcuts 提示；
4. feed `_site.build` 可进 check-seo 一致性校验；
5. 距截止约 6 小时，继续迭代。

## Iteration 86 — 资产构成卡 / 订阅源体积 / feeds 版本门禁（01:15–02:00）

### 创新点

- **I212 统计页「构建产物构成」卡**：运行时读取 `/build-info.json` 的 `assets.byType`，按体积降序渲染 9 类条形 + 占比；实测 `220 FILES · 6692.7 KB`，JS 3635.9KB（54%）、HTML 1949.0KB（29%）、FONTS 377.0KB（6%）、CSS 344.7KB（5%）、PNG 183.4KB（3%）、OTHER 93.7KB（1%）。
- **I213 feeds 版本门禁**：`check-seo` 新增——`feed.json` / `feed-summary.json` 的 `_site.build` 必须等于 `package.json` 版本；`build-info.assets.byType` 必须存在，避免「页面写了版本但 feed 是旧构建」的漂移。
- **I214 阅读器页订阅源实时体积**：页面加载后 fetch 三种订阅源并显示 `RSS 47.9KB / FEED 35.1KB / FEED-SUMMARY 9.8KB`（RSS 因新增 channel image 与 content:encoded 略大），帮助读者按流量选择。

### 迭代内修复

- Inline script 的 TS 检查报 unknown/any 与 `name` 可能为 null → 显式 `Record<string, number>` 断言、`Number()` 归一与空值跳过；`RSS.XML` 标签改为 `RSS`。

### 验证证据

- 浏览器 `/stats/`：`220 FILES · 6692.7 KB`，9 行资产构成。
- 浏览器 `/readers/`：`RSS 47.9KB`、`FEED 35.1KB`、`FEED-SUMMARY 9.8KB`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-seo` 全部通过。
- 截图更新：`stats.webp`、`readers.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. byType 可在统计页加“对比上次构建”；
3. 订阅源体积可加 gzip 估算（需服务端头，静态页无法离线获取）；
4. feeds 版本门禁可扩展到 stats.json 的版本字段；
5. 距截止约 5 小时，继续迭代。

## Iteration 87 — stats 版本 / 订阅源条目与日期（02:05–02:50）

### 创新点

- **I215 `stats.json` 版本字段**：机器统计接口增加 `build: "0.2.76"`（构建期读取 package 版本）；`check-seo` 新增校验——`stats.json.build` 必须等于 `package.json` 版本，与此前 feeds / build-info 的版本门禁组成「三处机器接口 + 页面」一致链。
- **I216 阅读器页订阅源明细**：体积展示升级为 `RSS 47.9KB · 6 ITEMS · 2026.11.18`——RSS 用 DOMParser 解析 `<item>` 数与最新 pubDate，JSON Feed 读取 items 数与 date_published；帮助读者判断更新频率与流量。

### 迭代内修复

- inline script 的隐式 any（`item/value/a/b` 等）→ 全部显式标注（`Element`、`string | number`、`Array<{date_published?...}>`），保持 `astro check` 0 error。

### 验证证据

- 浏览器 `/readers/`：三条订阅源均显示 `… · 6 ITEMS · 2026.11.18`。
- `dist/stats.json`：`build` 字段存在且与版本一致；`check-seo` 全部通过。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`pnpm build` 通过。
- 截图更新：`readers.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 条目数/日期可显示「距上次更新 N 天」；
3. stats.json build 可进 build-info 一致性汇总；
4. 阅读器页可显示 feed 语言/编码；
5. 距截止约 4.7 小时，继续迭代。

## Iteration 88 — 订阅源语言/时效 / 关于页过滤（02:55–03:40）

### 创新点

- **I217 订阅源语言与时效**：阅读器页每条订阅源由 `RSS 47.9KB · 6 ITEMS · zh-CN · 今天更新` 组成——RSS 解析 `<language>` 与 `<pubDate>`，JSON Feed 读取 `language` 与 `date_published`，并换算「今天 / N 天前更新」，帮助读者判断内容新旧。
- **I218 关于页入口过滤**：站点导航 13 张卡片新增过滤框（多关键词 AND、`匹配 N / 13` 计数、空状态、清除按钮与 Esc 清空）；实测 `feed` → 匹配 1 条（SUBSCRIBE，描述含 JSON Feed）、`zzz` → 空状态、清除后恢复 13 条。
- 迭代内修复：readers 脚本替换首版锚点不匹配导致未落盘（按实际脚本内容整体重写）。

### 验证证据

- 浏览器 `/readers/`：三条订阅源均为 `… · 6 ITEMS · zh-CN · 今天更新`。
- 浏览器 `/about/`：初始 `13 个入口`；`feed` → `匹配 1 / 13`；`zzz` → 空状态；清除 → 13 入口。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-links` / `check-a11y` 通过。
- 截图更新：`readers.webp`、`about.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 关于页过滤可加 `?q=` 同步（复用沿革页模式）；
3. 「今天更新」依赖客户端时区（已做本地时间换算，边界可再测）；
4. 订阅源语言可加 `lang` 属性展示；
5. 距截止约 4.3 小时，继续迭代。

## Iteration 89 — 关于页 ?q= / 最大文件清单（03:45–04:30）

### 创新点

- **I219 关于页 `?q=` 同步**：站点导航过滤增加 URL 同步与刷新恢复（`history.replaceState`）；实测 `/about/?q=feed` 预填并 `匹配 1 / 13`，改为「统计」后 URL 变 `?q=%E7%BB%9F%E8%AE%A1`，与版本沿革页交互一致。
- **I220 最大文件清单**：`optimize-dist` 在 build-info 写入 `assets.largest`（Top 5 文件 + 字节数）；统计页「构建产物构成」卡追加 `TOP FILES / 最大文件` 列表，展示文件名、体积与占比——当前：`cynefin 667.6KB（10.0%）`、`mermaid.core 605.9KB（9.0%）`、`cytoscape 424.7KB（6.3%）`、`katex 254.8KB（3.8%）`、`MainGridLayout.css 172.7KB（2.6%）`。`check-seo` 校验 `assets.largest` 存在。

### 验证证据

- 浏览器 `/stats/`：14 行（9 类 + 分割 + 5 个最大文件），体积与占比正确。
- 浏览器 `/about/?q=feed`：预填、计数、URL 同步正确。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-seo` 通过。
- 截图更新：`stats.webp`、`about.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 最大文件可点击查看所属页面/chunk 说明；
3. mermaid 图表 chunk 合计约 2.2MB 但按需加载（首屏不受影响），可在文档说明；
4. 关于页过滤可复用为通用 `data-filter` 组件（重构，暂缓）；
5. 距截止约 3.8 小时，继续迭代。

## Iteration 90 — 全局减少动效 / 异步块说明 / 门禁清单补全（04:35–05:20）

### 修复与改进

- **B52 全局 reduced-motion 兜底**：此前只有 4 处组件级 `prefers-reduced-motion`（进度条、画廊、目录、相关文章），Fuwari 自带动画与其它过渡不受控；新增全局规则——`animation-duration: .01ms !important`、`animation-iteration-count: 1`、`transition-duration: .01ms !important`、`scroll-behavior: auto !important`，覆盖所有元素与伪元素。
- **统计页异步 chunk 说明**：TOP FILES 下注明 Mermaid / KaTeX 为按需加载 chunk（仅图表/公式页加载，首屏不引入），避免使用者误以为首屏 6.7MB 全量加载。
- **可访问性页门禁清单补全**：静态门禁表新增 `check-seo.mjs`（标题唯一/description/canonical/OG/JSON-LD），从 7 条增至 **8 条**。

### 验证证据

- 构建产物 CSS 含全局规则：`animation-duration:.01ms!important`（`dist/_astro/MainGridLayout.*.css`）。
- 浏览器 `/stats/`：异步 chunk 说明可见、TOP FILES 5 行、`220 FILES · 6698.9 KB`。
- 浏览器 `/accessibility/`：门禁清单 8 条，末两条为 `check-seo.mjs` 与 `theme/selftest.mjs`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-a11y` / `check-links` 通过。
- 截图更新：`accessibility.webp`、`stats.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. reduced-motion 可用浏览器「Emulate CSS media」手动复验（本环境无 CDP 端口）；
3. mermaid chunk 可进一步按需拆分（上游 mermaid 行为，暂缓）；
4. a11y 页可列出全局兜底规则说明；
5. 距截止约 3.3 小时，继续迭代。

## Iteration 91 — 动效说明 / 机器入口状态（05:25–06:10）

### 创新点

- **I224 可访问性页「MOTION / 减少动效」**：新增说明区——全局兜底（所有元素 animation/transition 压到 0.01ms、平滑滚动关闭）、组件级规则（进度条刻度 / 画廊 / 目录 / 相关文章）、手动复验步骤（DevTools → Rendering → Emulate CSS media）。与上一轮的全局 CSS 规则对应，读者可自行验证。
- **I225 站点索引机器入口实时状态**：9 条机器入口（sitemap-index / robots / rss / feed / feed-summary / opensearch / manifest / stats / build-info）在页面加载后 fetch 并显示状态与体积；实测全部 `200 OK`（如 `RSS 47.9KB`、`build-info.json 1.0KB`），部署后可一眼核对机器接口是否可用。

### 迭代内备注

- 截图时把「screenshot」与「navigate」放在同一批调用导致两次截图抓到同一页面（两份 webp 字节相同）；改为「导航 → wait → 截图」串行后恢复（sitemap 1280×2104、a11y 1280×2936）。

### 验证证据

- 浏览器 `/sitemap/`：9 个状态节点全部 `200 OK · xKB`。
- 浏览器 `/accessibility/`：MOTION 区 3 条说明（全局兜底 / 组件规则 / 手动复验）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-a11y` / `check-links` 通过。
- 截图更新：`sitemap.webp`、`accessibility.webp`（互不相同）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 机器状态可在失败时提示排查文档；
3. MOTION 区可加「当前系统偏好」实时显示（matchMedia）；
4. 状态检查在离线部署（无 JS）时显示 CHECKING…，可加 noscript 说明；
5. 距截止约 4.5 小时，继续迭代。

## Iteration 92 — 动效偏好实时检测 / 机器总览 / 构建时间（06:15–07:00）

### 创新点

- **I226 实时系统动效偏好**：可访问性页 MOTION 区新增 `matchMedia('(prefers-reduced-motion: reduce)')` 检测——显示「标准动效」或「减少动效（动画已压制）」，监听偏好变化并高亮（黄铜色）；`aria-live` 播报。实测当前环境显示「标准动效」。
- **I227 机器入口总览与失败路径**：站点索引机器区新增 `9/9 OK` 汇总（aria-live）、失败时显示「UNAVAILABLE · 见 docs/DEPLOY.md 排查」、无 JS 时显示 noscript 说明；实测 9 条全部 `200 OK`（0.1–47.9KB）。
- **I228 制作说明「LAST BUILD」**：读取 `/build-info.json` 显示 `LAST BUILD / 2026.11.19 02:49 · 220 FILES · 6.55 MB`，部署后可核对产物新鲜度与体积。

### 验证证据

- 浏览器 `/accessibility/`：`系统动效偏好：标准动效（页面动效按设计播放）`。
- 浏览器 `/sitemap/`：汇总 `9/9 OK`，9 个状态节点均 `200 OK · xKB`。
- 浏览器 `/colophon/`：`LAST BUILD / 2026.11.19 02:49 · 220 FILES · 6.55 MB`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-a11y` / `check-links` 通过。
- 截图更新：`accessibility.webp`、`sitemap.webp`、`colophon.webp`（三者字节数不同，已排除先前同批截图覆盖问题）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 动效偏好仅前端展示，无法在无 JS 时提示（noscript 可补）；
3. LAST BUILD 依赖客户端时区（浏览器本地时间展示）；
4. 机器状态可加超时（fetch 默认无超时，慢网会长期 CHECKING）；
5. 距截止约 4 小时，继续迭代。

## Iteration 93 — fetch 超时 / 重新检查 / 时区标注（07:05–07:50）

### 修复（B53）

- **运行时 fetch 无超时**：统计页资产卡、阅读器订阅源体积、制作说明 LAST BUILD、站点索引机器状态四处 `fetch` 均无超时；弱网或静态服务挂起时会永久停留在 `CHECKING…`。统一加 `AbortController` + 8 秒超时（`fetch(url, { signal })`，`.finally(clearTimeout)`），失败统一落到已有的 UNAVAILABLE/不可用提示。

### 创新点

- **I229 制作说明「本地时间」标注**：LAST BUILD 明确标注 `（本地时间）`，避免与构建机 UTC 混淆。
- **I230 机器状态「重新检查」按钮**：站点索引机器区新增按钮，可手动重跑 9 条状态检查（重置为 CHECKING 后重新 fetch），便于部署切换后即时复验。

### 迭代内清理

- 修掉 3 个 `astro check` hint（readers 未使用的 formatDate、stats/sitemap 的 Promise 箭头函数改 async）；恢复 0 errors / 0 warnings / 0 hints。

### 验证证据

- 浏览器 `/sitemap/`：`9/9 OK`，重新检查按钮存在且可点击复跑。
- 浏览器 `/colophon/`：LAST BUILD 带「（本地时间）」。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-a11y` / `check-links` 通过。
- 截图更新：`sitemap.webp`、`colophon.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 超时时间可配置（当前硬编码 8 秒）；
3. 重试按钮可加「上次检查时间」；
4. 统计卡/阅读器也可加手动刷新；
5. 距截止约 3.4 小时，继续迭代。

## Iteration 94 — 刷新按钮 / 动效预览 / 检查时间（08:00–08:50）

### 创新点

- **I231 机器状态显示上次检查时间**：汇总由 `9/9 OK` 变为 `9/9 OK · 03:06`（本地时间），重试后更新时间戳。
- **I232 「刷新」按钮**：统计页资产构成卡与阅读器订阅源体积各新增刷新按钮，点击重跑 fetch（仍带 8 秒超时），失败回落到不可用提示；实测统计页刷新后 14 行、`220 FILES · 6707.6 KB` 正常。
- **I233 动效「预览」开关（可验证演示）**：可访问性页新增「预览减少动效」按钮，点击给 `<html>` 加 `rl-reduce-motion`（与系统偏好同一套压制规则），`aria-pressed` 同步；实测切换后元素 `transitionDuration = 1e-05s`、文本变「关闭动效预览」，再点恢复。

### 验证证据

- 浏览器 `/stats/`：刷新前/后均 14 行，总量正常。
- 浏览器 `/accessibility/`：预览开 → `aria-pressed=true`、`rl-reduce-motion`、`transitionDuration:1e-05s`；关 → class 移除。
- 浏览器 `/sitemap/`：`9/9 OK · 03:06`。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-a11y` / `check-links` 通过。
- 截图更新：`stats.webp`、`accessibility.webp`、`sitemap.webp`、`readers.webp`（四文件字节数互不相同）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 预览动效状态不持久（刷新即恢复，符合预期）；
3. 可给 readers 刷新加旋转态；
4. 检查时间可加日期（跨天）；
5. 距截止约 4.3 小时，继续迭代。

## Iteration 95 — 生成时间 / 加载态 / 运行时组件文档（09:55–10:40）

### 创新点与改进

- **I234 机器检查时间带日期**：汇总从 `9/9 OK · 03:06` 升级为 `9/9 OK · 11-19 03:16`，跨天部署后仍可判断检查时间。
- **I235 刷新按钮加载态**：统计卡与阅读器刷新时按钮禁用、文案变「刷新中…」，完成后恢复；统计页同时显示 `GENERATED / 2026.11.19 03:15`（来自 build-info）。
- **I237 文档「运行时小组件与降级」**：THEMING 新增 5.3 节，表格列出 5 个浏览器补数据组件（统计资产构成、阅读器体积、机器状态、动效偏好、LAST BUILD）的数据源、行为与 8 秒超时降级策略，说明禁用 JS 不影响阅读。

### 迭代内修复

- `getElementById` 返回 `HTMLElement` 无 `disabled` → 显式断言 `HTMLButtonElement | null`；恢复 0 errors / 0 warnings / 0 hints。

### 验证证据

- 浏览器 `/stats/`：`GENERATED / 2026.11.19 03:15`，刷新按钮可用。
- 浏览器 `/sitemap/`：`9/9 OK · 11-19 03:16`。
- `check-docs`：文档一致（v0.2.84），相对链接 62 条 / 截图 43 张有效。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`pnpm build` 通过。
- 截图更新：`stats.webp`、`sitemap.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 加载态在本地快网几乎不可见（逻辑正确，慢网生效）；
3. 运行时组件说明可同步到 README；
4. GENERATED 显示本地时区（与 LAST BUILD 一致）；
5. 距截止约 4.8 小时，继续迭代。

## Iteration 96 — 加载态修复 / 重试禁用 / README 组件说明（10:45–11:30）

### 修复（B54）

- **阅读器刷新加载态过早恢复**：此前的实现固定 `setTimeout 1200ms` 恢复按钮，慢网下 3 个订阅源请求仍在进行时按钮已可再次点击，可能并发重复请求。改为收集全部请求 `Promise.allSettled`，全部结束才恢复「刷新」；实测模拟 1.5 秒慢网：300ms 时按钮 `刷新中… / disabled=true`，2.2 秒后恢复 `刷新 / disabled=false`。
- **站点索引「重新检查」检查期间禁用**：点击后按钮禁用，全部 9 条状态返回后恢复；模拟 1.2 秒慢网实测：期间 `disabled=true / CHECKING…`，之后 `disabled=false / 9/9 OK · 11-19 03:28`。

### 文档

- **I238 README「运行时小组件（渐进增强）」**：新增章节列出 5 个浏览器补数据组件（统计资产构成 / 阅读器体积 / 机器状态 / 动效偏好 / LAST BUILD）、8 秒超时与降级策略，并链接 THEMING 5.3；文档相对链接 62 → **63 条**。

### 验证证据

- 模拟慢网（monkeypatch fetch 延迟）下两个按钮的禁用/恢复状态均正确（详见上文数值）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-docs` 通过（63 链接 / 43 截图）。
- 截图更新：`sitemap.webp`、`readers.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 统计页刷新也用 finally 恢复（已正确）；
3. 慢网模拟为临时 monkeypatch，未固化为脚本；
4. README 可加「96 轮迭代」里程碑说明（当前以徽章展示）；
5. 距截止约 4.6 小时，继续迭代。

## Iteration 97 — 无障碍规则扩项 / 运行时组件说明（11:35–12:20）

### 创新点

- **I241 `check-a11y` 新增 3 条静态规则**：① `aria-live` 与 `aria-hidden="true"` 冲突；② 可聚焦元素（链接/按钮/表单/带 tabindex）不得 `aria-hidden="true"`；③ `role="img"` 必须有 `aria-label` 或 `aria-labelledby`。全部 38 页通过，页面检查描述同步更新。
- **I242 可访问性页「WIDGETS / 运行时小组件」**：说明动态结果的 `aria-live="polite"` 播报、刷新按钮 disabled 状态、8 秒超时降级与「禁用 JS 仍可阅读」。
- **I243 隐私页运行时网络声明**：新增「运行时小组件」条目——仅向本站静态文件发起 GET（build-info / rss/feed / 机器端点），不携带表单数据、不上传内容；页头 meta 增加 `FETCH / SAME-ORIGIN`。

### 验证证据

- `check-a11y`：38 页全部通过（新规则 0 违规）。
- 浏览器 `/accessibility/`：WIDGETS 区 3 条说明存在。
- 浏览器 `/privacy/`：meta 含 `SAME-ORIGIN`、运行时组件说明可见。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-links` / `check-docs` 通过。
- 截图更新：`accessibility.webp`、`privacy.webp`。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. a11y 规则可继续加（如 `aria-expanded` 配对）；
3. 运行时组件说明可在 README 链接到隐私页；
4. `FETCH / SAME-ORIGIN` 对部署到子路径也成立；
5. 距截止约 4.2 小时，继续迭代。

## Iteration 98 — ARIA 状态取值 / summary 命名（12:25–13:05）

### 创新点

- **I244 `check-a11y` 规则增至 15 条**：新增 ① `aria-expanded / aria-pressed / aria-checked / aria-selected` 取值必须为 `true/false/mixed`；② `<summary>` 必须有可访问名称（文本 / aria-label / aria-labelledby）。**用故意违规的 fixture 验证规则会真实报错**：`aria-expanded="yes"`、空 `<summary>`、无 label 的 `role="img"` 三处全部被捕获（exit 1），而真实 38 页 0 违规。
- **I245 README 隐私链接**：运行时小组件章节补充「只访问本站静态文件，见隐私与数据」链接。

### 验证证据

- fixture `.a11y-fixture/bad.html`：`A11Y_DIST=.a11y-fixture node scripts/check-a11y.mjs` → 3 条违规全部报出（exit 1），验证规则非空转。
- 真实产物：`check-a11y` 38 页全部通过。
- `pnpm build`：通过；`check-docs` 相对链接 63 条有效。
- 本轮无页面视觉改动（README 非站点页面）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 规则可加 `aria-expanded` 必须配 `aria-controls`；
3. `<details>` 应包含 `<summary>` 的检查可加；
4. fixture 测试可固化为 `scripts/check-a11y-selftest.mjs`；
5. 距截止约 4 小时，继续迭代。

## Iteration 99 — 规则 16/17 / 无障碍自测脚本（13:10–13:55）

### 创新点

- **I246 `check-a11y` 规则增至 17 条**：新增 ① `aria-expanded` 必须配 `aria-controls`（或 `aria-owns`）；② `<details>` 的第一个元素必须是 `<summary>`（用正则对比 details 数量与「details+summary」数量）。真实 38 页全部通过。
- **I247 `scripts/check-a11y-selftest.mjs` 自测**：动态创建临时 fixture——违规页（错误 aria-expanded 值、缺 controls、无 label 的 role=img、空 summary、无 summary 的 details、aria-hidden 可聚焦元素、缺 alt、aria-live 隐藏冲突）与合规页；断言违规页 exit 1 且命中 **7 类**提示、合规页 exit 0。已接入 `pnpm verify`（checks 之后运行）。

### 迭代内修复

- 自测首跑把预期文案写成「没有可访问名称」，实际为「缺少可访问名称」→ 修正后 7 类全部命中。

### 验证证据

- `node scripts/check-a11y-selftest.mjs`：`✔ check-a11y 自测通过（违规页 7 类提示命中，合规页 0 问题）`。
- 真实产物：38 页全部通过 17 条规则。
- 浏览器 `/colophon/`：脚本清单 15 条（含 `check-a11y-selftest.mjs`）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-docs` 63 链接通过；截图 `colophon.webp` 更新。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 第 100 轮可做总结/里程碑与全量回归；
3. 自测可扩展到 check-seo/check-feed 的 fixture；
4. 规则数（17）可写进 README；
5. 距截止约 4 小时，继续迭代。

## Iteration 100 — 里程碑交付概览 / 全量回归（13:55–14:40）

### 创新点

- **I248 `docs/MILESTONE-100.md`**：新增第 100 轮交付概览——交付物表格（站点 / 主题覆盖层 / 发布包 / 文档）、站点规模（38 页 / 6 文章 / 15 门禁脚本 / 17 条 a11y 规则 / 63 链接 / 43 截图）、`pnpm verify` 门禁顺序、9 项交付检查清单、4 条已知限制；README 顶部与文档链接均指向它（文档相对链接 63 → **66**）。
- **I249 统计页迭代里程碑**：构建期读取 `ITERATIONS.md` 显示 `ITER 101`（含 Iteration 0 的全部记录数），≥100 时展示 `MILESTONE 100` 黄铜徽标。
- 迭代内修复：stats 页 `projectRoot` 少算一级（bundled 后 `import.meta.url` 在 dist/.prerender chunk 中）→ 构建报 `ENOENT dist/ITERATIONS.md`，改为与其它页面一致的 `../../..` 后通过。
- 迭代内修复（全量回归发现）：**B55** `check-feed` 的 RSS `<image>` 文件存在性校验没有剥离 `BASE_PATH`，`test:subpath` 首次与 image 规则联跑时误报；已加 base 剥离，子路径回归恢复全绿。

### 全量回归

- `pnpm verify`：astro check 0/0/0、文档一致、主题自测、构建、Pagefind、链接、a11y 17 规则 + fixture 自测、SEO、对比度、Feed、预算 全部通过。
- `pnpm test:subpath`：子路径构建 + 三门禁 + 恢复默认构建通过。
- `verify-release --full`：发布包 sha256 / 文件数 / 必需文件 / 解压后主题自测与文档一致性通过。

### 验证证据

- 浏览器 `/stats/`：`ITER 100` 与 `MILESTONE 100` 徽标（附截图）。
- 里程碑文档与 README 链接通过 check-docs（66 条相对链接、43 张截图）。
- 发布包 232 文件，sha256 见 MANIFEST。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 里程碑文档中的数字随版本变化，需人工维护（已标注版本与日期）；
3. 可把里程碑数字接入 check-docs 自动校验（后续候选）；
4. 距截止约 3.9 小时，继续按轮迭代。

## Iteration 101 — SEO 长度门禁 / 描述修复 / 里程碑校验（14:45–15:30）

### 修复（B56）

- **13 个页面 meta description 过短**：`about`（2 字）、`archive`（9 字）、`uncategorized`（15 字）、8 个标签页（19 字）、`gallery`（10 字）、`stats`（19 字）。全部改写为 20–200 字符的摘要，搜索摘要不再出现「关于 / 归档」这类无信息量文本。

### 创新点

- **I252 `check-seo` 长度门禁**：新增标题长度 ≤ 80 字符、description 20–200 字符（noindex 页跳过）检查——首跑精准抓出 B56 的 13 处问题，修复后 0 违规。
- **I250 `check-docs` 里程碑校验**：要求 `docs/MILESTONE-100.md` 存在、含当前版本号，且「交付物 / 交付检查清单 / 已知限制」三个章节齐全，防止里程碑文档与版本脱节。
- **I251 里程碑徽标可点击**：统计页 `MILESTONE 100` 链接到 `/changelog/#v0-2-90`（构建期按 package 版本生成锚点），可直接跳到本轮发布记录。

### 验证证据

- `check-seo`：`38 个页面 · 38 个唯一标题 · 13 段 JSON-LD · 36 个 canonical · 38 张 OG 图 · 36 条 sitemap`，标题/描述长度全部通过。
- 浏览器 `/stats/`：徽标 `MILESTONE 100` → `/changelog/#v0-2-90`；ITER 101。
- `check-docs`：`✔ 文档与版本号全部一致`，相对链接 66 条、截图 43 张。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；截图 `stats.webp` 更新。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 标题长度上限可收紧到 60（当前 80，先观察）；
3. 描述长度下限 20 可提高到 50（需逐页补写）；
4. 里程碑数字可自动校验（页面数/链接数）；
5. 距截止约 3.7 小时，继续迭代。

## Iteration 102 — SEO 阈值收紧 / 描述补写（15:35–16:20）

### 改进

- **I256 SEO 阈值收紧**：`check-seo` 标题上限 **80 → 60** 字符、description 下限 **20 → 30** 字符（保留上限 200）；当前全站最长标题 40、最短描述 33（除 noindex 的 404/random），处于搜索摘要较佳区间。
- **B57 9 个页面描述补写**：分类页、分类与标签总览、可访问性、版本沿革、制作说明、站点索引、时间线、阅读器兼容、系列页的 description 全部扩写到 30 字以上（含门禁数量、折叠/过滤能力、机器入口状态等具体信息），不再是简单复述标题。

### 验证证据

- `check-seo`：38 页标题 / 描述长度全部通过（新阈值下 0 违规）。
- 浏览器 `/readers/`：订阅源体积/条目/语言/时效显示正常。
- **I257 `bump.mjs` 同步里程碑版本**：版本升级时自动替换 `docs/MILESTONE-100.md` 的 `vX.Y.Z`，避免 `check-docs` 因里程碑文档版本落后而失败（本次即被该检查抓出并修复）。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`pnpm build` 通过；截图 `readers.webp` 更新。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 英文/日文 i18n 页面的 description 未单独优化（当前站点仅中文）；
3. 可继续把下限提到 50（需逐页补写，收益递减）；
4. OG 描述与 meta description 的映射可加校验；
5. 距截止约 3.4 小时，继续迭代。

## Iteration 103 — OG 描述门禁 / 门禁列表机器接口（16:25–17:10）

### 创新点

- **I258 `og:description` 一致性门禁**：`check-seo` 要求每页 `og:description` 非空、≤200 字符，且与 meta description 完全一致（38 页实测 0 偏差，作为未来防漂移的检查）。
- **I259 build-info 门禁列表**：`/build-info.json` 新增 `gates` 数组（17 条：astro check → generate-badge → … → check-budget），部署方可机器读取「这一版跑了哪些门禁」；`check-seo` 校验数组长度 ≥10 且元素为字符串。
- **I260 制作说明 LAST BUILD 增强**：显示 `LAST BUILD / 2026.11.19 04:31（本地时间）· 220 FILES · 6.56 MB · 17 GATES`，与 build-info 同源。

### 验证证据

- 浏览器 `/colophon/`：LAST BUILD 含 `17 GATES`；`/build-info.json` 的 `gates` 长度 17（首 `astro check`、末 `check-budget`）。
- `check-seo`：38 页 og:description 全部与 meta description 一致；gates 校验通过。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`pnpm build` 通过；截图 `colophon.webp` 更新。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. gates 可带「本轮是否通过」状态（需门禁回写，暂缓）；
3. og:description 长度上限可收紧（当前 200）；
4. 可把 gates 数组复用到 colophon 页静态列表（避免两处维护）；
5. 距截止约 3.1 小时，继续迭代。

## Iteration 104 — 门禁单一数据源（17:15–18:00）

### 创新点

- **I261 门禁列表单一数据源**：新增 `src/data/gates.json`（`verify` 17 步 + `release` 2 步），`build-info.json` 的 `gates` 与制作说明页的门禁流程都从它渲染——此前 colophon 静态列表与 build-info 数组两处维护、且数量不一致（16 vs 17）。
- **I262 gates 一致性门禁**：`check-seo` 读取 `src/data/gates.json` 并与构建产物 `build-info.gates` 做严格数组比较，任一侧改动未同步即失败。
- 制作说明门禁提示改为动态文案：「17 步 `pnpm verify` 门禁…」「发布包还会…全链路共 19 步」。

### 迭代内修复

- `build-info.json.ts` 的 import 路径写成 `../../data/gates.json`（多退一级）导致 `TS2307`；改为 `../data/gates.json` 后通过。

### 验证证据

- 浏览器 `/colophon/`：两个流程列表分别 17 / 2 步，提示「全链路共 19 步」；LAST BUILD 仍显示 `17 GATES`。
- `/build-info.json`：`gates` 17 条（首 `astro check`、末 `check-budget`），与数据文件一致。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-seo` 通过；截图 `colophon.webp` 更新。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. gates 可带通过状态（需门禁回写）；
3. `gates.json` 可被 CONTRIBUTING 引用为门禁清单来源；
4. 制作说明的 flow 样式在窄屏可再压缩；
5. 距截止约 3 小时，继续迭代。

## Iteration 105 — 过滤高亮 / 门禁数据源文档（18:05–18:50）

### 创新点

- **I263 版本沿革过滤高亮**：过滤命中后把关键词包进 `<mark class="rl-hl">`（黄铜底、深色文字），多关键词同时高亮；清空/切换时先 `unmark` 完全还原 DOM。实测 `feed` → `匹配 22 / 105`、**36 处高亮**，清空后高亮 0 处、恢复 105 个版本。
- **I264 门禁数据源文档化**：CONTRIBUTING 第 4 节新增「门禁清单单一数据源」——`src/data/gates.json`（17 verify + 2 release）、build-info 与 `/colophon/` 均从它生成、`check-seo` 校验一致性；制作说明门禁说明也注明来源文件。文档相对链接 66 → **67**。
- **I265 移动端页复核**：390px 下 `/colophon/` `scrollWidth 375 < clientWidth 390`，含新增的双流程列表无横向溢出。

### 验证证据

- 浏览器 `/changelog/`：高亮 36 处、清空后 0 处；计数与状态正确。
- 浏览器（iframe 390px）`/colophon/`：无横向溢出。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-docs` 67 条链接通过；截图 `changelog.webp` 更新。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 高亮可支持「仅匹配整词」（当前子串匹配）；
3. 高亮在超长匹配（如 0.2）会包很多节点，可加数量上限；
4. CONTRIBUTING 可引用 gates.json 的 JSON 片段；
5. 距截止约 3.4 小时，继续迭代。

## Iteration 106 — 高亮上限 / 关于页高亮 / 移动端复核（18:55–19:40）

### 创新点

- **I266 高亮安全上限**：版本沿革过滤高亮增加预算——匹配版本数 > 40 或累计高亮节点 > 300 时只过滤不高亮。实测 `0.2` → `匹配 96 / 106`、**0 个 mark**（避免一次性插入数千节点）；`feed` → `匹配 21 / 106`、36 个 mark；清空 0。
- **I267 关于页过滤高亮**：13 张入口卡片过滤时同样高亮命中词（`feed` → 1 个 mark「Feed」），清空后完全还原。
- **I268 移动端复核**：390px 下 `/readers/`、`/accessibility/` 均 `scrollWidth 375 < clientWidth 390`，无横向溢出。

### 验证证据

- 浏览器 `/changelog/`：宽泛匹配 0 mark / 精确匹配 36 mark / 清空 0 mark。
- 浏览器 `/about/`：1 mark / 清空 0。
- 移动端两页无横向溢出。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；截图 `colophon.webp` 更新。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 高亮上限可提示「已过滤但未高亮」；
3. 关于页高亮每次全量重建，13 卡片性能无虞；
4. 可抽出通用高亮工具，避免 changelog/about 两份实现；
5. 距截止约 3.2 小时，继续迭代。

## Iteration 107 — 高亮提示 / 图片尺寸（19:45–20:25）

### 改进

- **I269 高亮省略提示**：宽泛匹配触发高亮预算时，计数显示 `匹配 97 / 107 · 已省略高亮`（`title` 说明「匹配过多，只过滤不高亮，避免页面卡顿」）；实测 `0.2` → 97 匹配、0 mark、提示可见；`feed` → 22 匹配、36 mark、无提示。
- **I270 预览图尺寸**：项目索引两张 640×400 SVG 预览补 `width="640" height="400"`（此前仅有 CSS 尺寸），降低布局抖动并让 HTML 语义更完整；浏览器核对属性已输出。

### 验证证据

- 浏览器 `/gallery/`：两图 `width=640 / height=400`、alt 正常。
- 浏览器 `/changelog/`：宽泛匹配提示、精确匹配高亮、清空恢复正常。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-links` / `check-a11y` 通过。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 其它装饰性图片（头像）也可补尺寸；
3. 高亮提示可加 aria-live（当前计数已 aria-live）；
4. 可给画廊图加 `fetchpriority`（首屏项目页图）；
5. 距截止约 3.1 小时，继续迭代。

## Iteration 108 — 图片优先级 / 复制全部 / 状态自动重试（20:30–21:15）

### 创新点

- **I271 首图加载优先级**：项目索引第一张预览 `loading="eager"` + `fetchpriority="high"`，其余仍 `lazy`（浏览器实测属性：`eager/high` 与 `lazy/null`）。
- **I272 阅读器「复制全部命令」**：一键复制三条 curl 验证命令（实测剪贴板 3 行、文本变为「已复制全部命令」）。
- **I273 机器状态失败自动重试**：单条状态请求失败后 700ms 自动重试一次，仍失败才标记 UNAVAILABLE（`docs/DEPLOY.md` 排查提示保留）。
- 迭代内修复：首版重试实现把完成计数放在 attempt 分支里，普通成功请求不再累加 `doneCount`，导致汇总永远停在 `CHECKING…`；改为「每条请求完成即计数」后，模拟一次网络抖动 → **9/9 OK · 11-19 05:05**、0 UNAVAILABLE。

### 迭代内校准

- 版本沿革页随发布次数增长到 96.4KB，超过原单页 HTML 预算 96KB → 按「模板示例站内容量」校准到 **112KB**（注释说明原因，总量预算不变）；重新校验后预算全绿（最大页 changelog 96.4/112KB）。

### 验证证据

- 浏览器 `/gallery/`：`loading`/`fetchpriority` 属性正确。
- 浏览器 `/readers/`：复制全部 → 3 行命令。
- 浏览器 `/sitemap/`（monkeypatch 首个 fetch 失败）：重试后 9/9 OK。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；`check-a11y` 通过；截图 `sitemap.webp`、`readers.webp` 更新。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 重试可配置次数/间隔；
3. 复制全部可附带一行注释头；
4. 首图 eager 需观察 LCP 实际变化（无 Lighthouse 环境）；
5. 距截止约 2.9 小时，继续迭代。

## Iteration 109 — 重试可配置 / 命令注释头 / Enter 跳转（21:20–22:05）

### 创新点

- **I274 机器状态重试可配置**：机器索引区通过 `data-retry-count` / `data-retry-delay` 控制失败重试（默认 1 次 / 700ms），且每次检查重新读取配置。实测（对 `/rss.xml` 连续失败 2 次）——`retry-count=1` → `8/9 OK`、该条 UNAVAILABLE；改成 `2` 后 → `9/9 OK`、`200 OK · 47.9KB`。
- **I275 复制全部命令注释头**：剪贴板首行是 `# Rhine Archive · feed check commands`，共 4 行（1 注释 + 3 curl），直接粘贴即可读懂。
- **I276 Enter 跳转首个命中**：沿革页过滤框按 Enter 平滑滚动到第一个可见版本（实测 scrollY 0 → 520、首个命中标题位于视口顶部）。

### 验证证据

- 浏览器 `/sitemap/`：两种 retry-count 下结果与预期一致。
- 浏览器 `/readers/`：剪贴板 4 行、首行注释。
- 浏览器 `/changelog/`：Enter 跳转生效。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；截图 `sitemap.webp` 更新。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 重试参数可写入 THEMING 文档；
3. Enter 跳转可同时聚焦标题（标题非可聚焦元素）；
4. 复制命令可带换行分组；
5. 距截止约 2.8 小时，继续迭代。

## Iteration 110 — 焦点管理 / og:url 门禁 / 重试文档（22:10–22:55）

### 创新点

- **I277 Enter 后聚焦命中标题**：不再只滚动——首个命中的 `<h2>` 动态加 `tabindex="-1"` 并 `focus({preventScroll:true})`，键盘/屏幕阅读器用户按 Enter 后焦点落在版本标题上可继续读。实测 activeElement 为 `H2`、tabindex `-1`、scrollY 520。
- **I278 `og:url` 门禁**：`check-seo` 校验每页 `og:url` 存在、为绝对地址、且与 canonical 完全一致（38 页实测全部通过）。本轮插入位置在 canonical 检查之后触发 TDZ（`Cannot access 'ogUrl' before initialization`）→ 前移到 canonical 检查之前修复。
- **I279 THEMING 重试参数文档**：运行时小组件小节补充 `data-retry-count` / `data-retry-delay` 用法与默认值。

### 验证证据

- 浏览器 `/changelog/`：Enter → 焦点 H2（tabindex -1）、scrollY 520。
- `check-seo`：38 页 og:url / canonical 一致，全部通过。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。
- 版本号跨入 **0.3.0**（交互与门禁细节打磨小节点）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 焦点样式可再强化（当前依赖浏览器默认 outline）；
3. og:url 门禁可扩展到 twitter:url；
4. THEMING 可补“运行时组件失败排查”清单；
5. 距截止约 2.7 小时，继续迭代。

## Iteration 111 — Twitter Card 门禁 / focus 样式 / 排查清单（23:00–23:45）

### 修复（B60）

- **`twitter:url` 属性错误**：Layout 原先写成 `property="twitter:url"`，Twitter/X 及部分爬虫按 `name` 读取 → 改为 `name="twitter:url"`。39 个页面此前全部缺少被识别的 twitter:url，修复后 `twitter:url = og:url = canonical`。

### 创新点

- **I280 命中标题 focus 样式**：给 `h2:focus` 加 2px 黄铜 outline、offset 4px；实测 Enter 后 `outlineWidth 2px / outlineColor rgb(155,114,71) / outlineOffset 4px`。
- **I281 Twitter Card 门禁**：`check-seo` 校验 `twitter:card=summary_large_image`、title/description/url/image 非空、url 绝对、title/description 与 OG 同源；首跑即抓出 B60（随后修复）。
- **I282 运行时组件排查清单**：THEMING 增加 5 步排查（端点 200、dist 完整性、鉴权/防盗链、8 秒超时、自动重试后仍失败）。

### 验证证据

- 浏览器 `/posts/02-reproducible/`：`twitter:url = og:url = canonical`、twitter title 与 og title 一致。
- 浏览器 `/changelog/`：Enter 后 H2 获得 2px 黄铜 outline。
- `check-seo`：38 页 Twitter Card 校验全部通过。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. Web App Manifest / OpenSearch 可加入同样一致性校验；
3. 细查其它非标准属性（`property` vs `name`）；
4. 排查清单可链接到 DEPLOY；
5. 距截止约 2.5 小时，继续迭代。

## Iteration 112 — Manifest / OpenSearch / 主题色门禁（23:50–00:30）

### 创新点

- **I283 Web App Manifest 门禁**：`check-seo` 解析 `manifest.webmanifest`，校验 name/short_name/start_url/display、图标不少于 2 个且 `sizes` 合法与文件存在、5 个快捷方式的页面与图标全部能落到产物；支持子路径 base 归一。
- **I284 OpenSearch 门禁**：校验 `opensearch.xml` 的 `<Url template>` 含 searchTerms 占位符且为绝对地址。
- **I285 主题色/配色门禁**：每页 `theme-color` 必须存在且为 `#RRGGBB`（亮/暗各一条），`color-scheme` 必须存在；实测亮 `#eae5e1`、暗 `#11181b`、`color-scheme: light dark`。
- 浏览器实测 manifest：3 icons / 5 shortcuts / id `/` / lang `zh-CN`，`link[rel=manifest]` 与 `link[rel=search]` 均存在。

### 验证证据

- `check-seo`：38 页 + manifest + opensearch 全部通过。
- 浏览器首页 meta：theme-color 亮/暗、color-scheme、manifest、search 链接正确。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. Manifest 可校验 screenshots（暂未提供）；
3. OpenSearch 可加 Image 与 Contact；
4. 主题色可在暗色模式下随主题变化（当前固定两值，符合设计）；
5. 距截止约 2.4 小时，继续迭代。

## Iteration 113 — OpenSearch 增强 / data-base 门禁（00:35–01:15）

### 创新点

- **I286 OpenSearch 增强**：新增 `<Image>`（192×192 图标，绝对地址）、`<Contact>`（profile 的 GitHub 或站点首页）、`<Language>` 与 `<OutputEncoding>`；浏览器实测四个字段均输出。
- **I287 `data-base` 门禁**：`check-seo` 校验每页 `<html data-base>` 与从首页 canonical 推导的部署 base 一致（当前 `/`），子路径部署时若 Layout 的 `import.meta.env.BASE_URL` 与 canonical 不同步会立即失败。
- 迭代内修复：OpenSearch Image 校验把绝对 URL 直接传 `localAsset` 导致「产物不存在」误报 → 先取 `new URL(...).pathname` 再归一。

### 验证证据

- 浏览器首页：`data-base="/"`；`/opensearch.xml` 含 Image `https://example.com/icons/icon-192.png`、Contact、`<Language>zh-CN</Language>`。
- `check-seo`：38 页 data-base 一致、OpenSearch 字段完整，全部通过。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. Contact 目前是示例 GitHub 链接（模板占位）；
3. OpenSearch 可扩展 `<Tags>` 关键词；
4. data-base 门禁可纳入子路径自动化测试；
5. 距截止约 2.2 小时，继续迭代。

## Iteration 114 — OpenSearch Tags / 子路径回归 / basePrefix 修复（01:20–02:05）

### 修复（B61）

- **`basePrefix` 声明顺序错误**：`check-seo` 中从首页 canonical 推导 base 的代码块位于 `let basePrefix` 声明之前，赋值抛 TDZ ReferenceError 被 `try/catch` 静默吞掉，base 永远保持 `/`。新增的 `data-base` 门禁首次在子路径构建下运行即暴露：52 个页面全部误报「data-base 与部署 base 不一致」。把声明前移后，子路径 `check-seo` 全通过。

### 创新点

- **I288 OpenSearch `<Tags>`**：增加 `莱茵档案, Astro, Fuwari, 博客, RSS` 关键词，`check-seo` 校验 Tags 非空。
- **I289 全量子路径回归**：`pnpm test:subpath`（build → check-links/check-seo/check-feed with BASE_PATH → 恢复默认构建）全部通过；验证 `data-base` 门禁在 `/rhine-test/` 下与 canonical 推导一致。

### 验证证据

- 子路径构建：canonical `/rhine-test/`、data-base `/rhine-test/`、check-seo 通过。
- `pnpm test:subpath`：4 步全绿 + 恢复默认构建。
- `pnpm build` / `check-seo`：默认根路径下同样通过。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 类似「try/catch 吞 ReferenceError」的模式可全局排查；
3. Tags 可写入 THEMING 配置说明；
4. 子路径回归可加 data-base 显式断言；
5. 距截止约 2 小时，继续迭代。

## Iteration 115 — 脚本引用门禁 / 发布必需文件 / catch 审计（02:10–02:50）

### 创新点

- **I290 package.json 脚本引用门禁**：`check-docs` 解析所有 npm scripts，提取 `node <本地路径>`，校验被引用脚本真实存在——防止重命名/删除脚本后 `verify` 某个门禁静默失效。
- **I291 发布必需文件补全**：`verify-release` 必需文件加入 `docs/MILESTONE-100.md` 与 `docs/READERS.md`（此前仅校验 THEMING/DESIGN/ASSETS/DEPLOY），解压包缺少任何一份文档都会直接失败。
- **I292 静默 catch 审计**：逐一检查 `scripts/` 中 10 处 `catch {}`，均为预期回退（URL 解码失败保留原值、zip→tar 回退、JSON 解析失败提示等），未发现吞掉关键错误的模式；B61 的教训已通过「给推导逻辑加显式失败提示」在后续检查中覆盖。

### 验证证据

- `check-docs`：脚本引用 / 版本 / 链接 / 截图全部通过。
- `verify-release`（随后执行）：解压包必需文件包含里程碑与阅读器文档。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 可对 `gates.json` 的每一步标注对应脚本路径并校验；
3. catch 审计可脚本化（检测空 catch 无注释）；
4. 里程碑文档数字可加自动校验；
5. 距截止约 2 小时，继续迭代。

## Iteration 116 — 静默 catch 门禁 / 门禁脚本清单（03:00–03:45）

### 创新点

- **I293 `check-catch` 静默 catch 门禁**：扫描 `scripts/*.mjs`，禁止「空 catch 且无注释」的写法（B61 正是这类写法吞掉 TDZ 错误）；允许 `catch { /* 说明 */ }`，实测 17 个脚本中 5 处有注释允许、0 处静默。门禁本身先移除 JSDoc 示例避免自匹配。
- **I294 门禁脚本清单**：`src/data/gates.json` 增加 `scripts` 数组（14 个本地脚本路径），`check-docs` 校验全部存在；`verify` 增至 **18 步**，制作说明流程自动 18+2=20 步，build-info `gates` 18 条。

### 验证证据

- `node scripts/check-catch.mjs`：`✔ 没有无注释的静默 catch`。
- 浏览器 `/colophon/`：流程 18 + 2 步、LAST BUILD `18 GATES`；`/build-info.json` gates 18（末条 `check-budget`）。
- `check-docs`：gates.json 脚本路径全部存在。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）；截图 `colophon.webp` 更新。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. check-catch 可加入「catch 结果被忽略但无注释」的变体；
3. gates.json 可逐步绑定每个 label 到脚本路径；
4. 距截止约 1.8 小时，继续迭代。

## Iteration 117 — 无障碍规则强化 / 自测扩面（04:15–04:55）

### 创新点

- **I295 无障碍规则强化**：`check-a11y` 新增 viewport 必须含 `width=device-width`、`lang` 必须符合 BCP 47 形式（如 `zh-CN`）；`aria-expanded/pressed/selected` 取值 true/false，`aria-checked` 额外允许 mixed。
- **I296 自测扩面**：违规 fixture 增加「非法 viewport」与 `aria-pressed="maybe"` 两类，预期提示 7 → **9 类**，确保新规则真的会触发。
- **I297 问题输出上限 8 → 20**：修复自测误判根因——单页问题超过 8 条时后面的新规则被截断打印，selftest 匹配不到；提高上限后 9 类提示全部可见。
- MILESTONE-100 的门禁脚本数量同步为 17 个。

### 验证证据

- `check-a11y`：38 页全部通过（新增规则未误报）。
- `check-a11y-selftest`：`✔ 违规页 9 类提示命中，合规页 0 问题`。
- 浏览器 `/accessibility/`：页面正常渲染。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 可增加 aria-hidden 子树内可聚焦元素的全量扫描；
3. 自测可断言「无截断」（问题数 > 上限时告警）；
4. 距截止约 1.7 小时，继续迭代。

## Iteration 118 — STATE 同步门禁 / gates↔verify 一致性（05:00–05:40）

### 创新点

- **I298 STATE 同步门禁**：`check-docs` 要求 `STATE.md` 含当前版本、最新 `Iteration N`、`阶段：**…**` 状态行；过期交接文档会直接失败（修复 `state` 变量重名后落地）。
- **I299 gates↔verify 一致性**：校验 `src/data/gates.json` 的 18 步与 `package.json` 的 `verify` 链段数相等、每个门禁 label 的首 token 在命令中出现——数据文件与真实门禁链不再可能悄悄漂移。
- **I300 STATE 交付状态刷新**：头部从「Iteration 57」的过期描述更新为 v0.3.8 / Iteration 118 / 18 步 verify / 38 页 / 235 包文件 / 预算 97%，并补「里程碑后迭代摘要（100–118）」与 89 files 类型检查口径。
- **I301 bump.mjs 容错**：若目标文本已经是新版本（手工先行同步过），跳过替换而不是直接失败，避免版本升级半更新。

### 迭代内修复（B62）

- 手工把 0.3.8 条目插到 `CHANGELOG.md` 顶部，破坏了「首行必须是 `# Changelog`」的结构，changelog 页渲染出 **2 个 h1** 并被 a11y 门禁拦截。
- 修复：恢复 `# Changelog` 首行结构；`changelog.astro` 的 h1 去除改为多行模式（任意位置的首个 h1 都能去掉）；`check-docs` 新增「CHANGELOG 必须以 `# 标题` 开头」门禁。

### 验证证据

- `check-docs`：STATE 同步、gates↔verify 一致、CHANGELOG 结构、版本/链接/截图全部通过。
- `pnpm verify`：18 步全绿。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. STATE 证据日志可在截止前压缩为「历史摘要 + 链接到 ITERATIONS」；
3. gates label 可进一步绑定脚本路径（非首 token）；
4. 距截止约 1.5 小时，继续迭代。

## Iteration 119 — 编码时机 / 语言一致性门禁（05:45–06:15）

### 创新点

- **I302 charset 时机门禁**：`check-seo` 要求每页前 **1024 字节**内出现 UTF-8 charset 声明（浏览器只在该窗口内采用编码声明，晚于此会被忽略并可能乱码）；38 页实测全部通过。
- **I303 og:locale ↔ html lang 一致性**：`og:locale`（`zh_CN`）归一化 `_`→`-` 后必须等于 `<html lang>`（`zh-CN`），防止分享卡片语言与文档语言漂移；38 页全部通过。

### 验证证据

- `check-seo`：38 页 charset / og:locale 校验全部通过。
- `pnpm verify`（18 步）：全绿。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受环境限制；
2. 可校验 `<meta name=color-scheme>` 与主题 CSS 变量实际支持的模式一致（已单独校验 color-scheme 存在）；
3. STATE 历史证据可压缩；
4. 距截止约 1.1 小时，准备最终验收（子路径回归 + 发布包 + 汇总）。

## Iteration 120 — 最终验收（06:20–06:50）

### 交付验收

- **子路径回归**：`pnpm test:subpath` 通过（`/rhine-test/` 构建 + check-links / check-seo / check-feed + 恢复默认构建）。
- **完整门禁**：18 步 `pnpm verify` 全绿；`pnpm check` 0 errors / 0 warnings / 0 hints（89 files）。
- **发布包**：`release/rhinelab-blog-v0.3.10.zip`（235 文件）通过 `verify-release --full`：MANIFEST 与 zip 逐项一致、解压包主题安装器自测与文档门禁通过。
- **文档同步**：STATE / MILESTONE-100 / CHANGELOG / ITERATIONS / 徽章全部更新到 v0.3.10。

### 交付物清单

1. 独立可构建模板站（Astro 6 + Fuwari 基座，38 页，亮暗双主题）；
2. 非破坏式主题覆盖层（`theme/install.mjs`：安装 / 幂等 / 验证 / 回滚 + selftest）；
3. 版本化发布包 `release/rhinelab-blog-v0.3.10.zip` + MANIFEST；
4. 文档：README、THEMING、DESIGN、ASSETS、DEPLOY、READERS、CONTRIBUTING、ITERATIONS、CHANGELOG、STATE、MILESTONE-100；
5. 门禁：18 步 verify + 子路径回归 + `verify-release --full`。

### 已知限制

1. 外部阅读器（Feedly/Inoreader 等）实测受环境网络限制，未做真实订阅测试；
2. 发布包解压后需要 `pnpm install`（或复用本机 junction 的 `node_modules`）才能构建；
3. 预算余量约 3%（单页 HTML 91%）。

### 后续候选（若继续）

1. 外部阅读器实测；
2. STATE 历史证据压缩；
3. gates label 与脚本路径一一绑定；
4. 里程碑数字自动校验。

## Iteration 121 — STATE 收尾 / 发布路径门禁（06:55–07:10）

### 收尾改进

- **I304 STATE 收尾**：「里程碑后迭代摘要」更新到 100–120（补 118–120 三条）；「下一轮候选」改写为最终 5 条（外部阅读器实测、gates label 绑定、MILESTONE 数字校验、证据压缩、预算再压）；「已知问题」补外部阅读器限制、解压构建需 install、预算余量 3%。
- **I305 发布路径门禁**：`check-docs` 要求 `STATE.md` 引用当前版本的 `release/rhinelab-blog-v${version}.zip`，交接文档与发布包不再可能脱节。
- 版本跨入 **v0.3.11**，`Iteration 121 / 最终验收` 状态同步。

### 验证证据

- `check-docs`：STATE 同步、当前发布包引用、gates↔verify 一致全部通过。
- `pnpm verify`（18 步）：全绿。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 距截止

- 已到目标窗口尾声，交付物齐备；如继续迭代按 STATE 的 5 条候选执行。

## Iteration 122 — 解压包可构建验证（06:05–06:45）

### 创新点

- **I306 解压包可构建验证**：`verify-release --full --build` 在解压发布包后清理临时目录、用 junction/symlink 复用本机 `node_modules`，执行 `astro build` 并要求 HTML ≥30 页、`check-links --strict` 通过——把「独立可构建」从仓库内证明推进到「发布包自身可构建」。
- 新增 `pnpm verify:release:build` 脚本；MILESTONE 检查清单与 DEPLOY 增加强校验章节（含 `--build` 说明与干净机器需 `pnpm install` 的注记）。
- 迭代内修复：astro CLI 路径从 `astro/astro.js` 纠正为 `bin/astro.mjs`。

### 验证证据

- `node scripts/verify-release.mjs 0.3.11 --full --build`：
  - `解压包主题安装器自测 通过`
  - `解压包文档一致性检查 通过`
  - `解压包 astro build 通过`
  - `解压包构建后链接检查通过`
- `check-docs` / `pnpm check` 通过；`pnpm verify` 18 步全绿。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受限；
2. `--build` 依赖本机 node_modules，干净机器需 install（已文档化）；
3. 可在 CI 里把 `verify:release:build` 作为发布门禁；
4. 距截止约 1 小时，继续最终验收与交付。

## Iteration 123 — 图片尺寸门禁 / 运行时指标（06:50–07:05）

### 修复（B63）

- 全站 41 张 `<img>` 中唯一缺 `width/height` 的是文章 98 的内嵌头像（Markdown 图片语法不带尺寸）→ 改为带 `width="480" height="480"` 的 HTML `<img>`；作者头像组件 `ImageWrapper` 增加可选 `width/height` 并传 480×480。

### 创新点

- **I307 图片尺寸纳入体积预算**：`check-budget` 扫描全部 HTML，要求每个 `<img>` 都带 width/height（降低 CLS）；输出 `✔ 图片尺寸 41 张 <img> 全部带 width/height`。
- **I308 浏览器运行时指标采样**：`/` 首屏 FCP **164ms**、load **320ms**、44 个资源 / 255KB、DOM 632 节点、14 个脚本、懒加载策略正常——作为「轻量静态站」的运行时证据记录。

### 验证证据

- `check-budget`：图片尺寸 41/41 通过；体积预算全绿。
- `check-a11y` / `check-links --strict` / `pnpm check`：全部通过。
- 浏览器 eval 采样指标如上。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受限；
2. 可在 CI 中用 Lighthouse 复核（本机未开 remote debugging，改用 Navigation Timing 采样）；
3. 预算余量 3%；
4. 距截止约 1.1 小时，继续最终验收。

## Iteration 124 — Feed 自动发现 / JSON-LD 语言门禁（07:00–07:20）

### 创新点

- **I309 Feed 自动发现门禁**：`check-seo` 要求每页各有 RSS（`application/rss+xml`）与 JSON Feed（`application/feed+json`）的 `<link rel=alternate>`，href 必须绝对且目标文件存在；38 页实测全部通过。
- **I310 JSON-LD inLanguage 一致性**：解析每页 JSON-LD（含 `@graph`），`inLanguage` 归一化后必须与 `<html lang>` 一致（当前统一 `zh-CN`）。
- 迭代内修复：`localAsset` 在页面循环中被引用但声明在后面，触发 TDZ → 前移到循环前。

### 验证证据

- `check-seo`：38 页 feed 自动发现、inLanguage 校验全部通过。
- `pnpm verify` 18 步全绿；`pnpm check` 0/0/0（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受限；
2. 可校验 `<link rel=alternate>` 与 feed 实际 `<link rel=self>` 一致；
3. 距截止约 1 小时，进入最终验收。

## Iteration 125 — Feed 自引用一致性（07:25–07:45）

### 创新点

- **I311 RSS 自引用一致性**：`check-feed` 要求 `atom:link rel="self"` 绝对地址、路径以 `/rss.xml` 结尾、与 channel `<link>` 同源；避免部署后 feed 自引用指向错误域名。
- **I312 JSON Feed URL 契约**：`feed_url` 必须以 `/feed.json` 结尾、`home_page_url` 以 `/` 结尾，保证阅读器解析基址稳定。

### 验证证据

- `check-feed`：RSS 6 items / JSON Feed 6 items 结构全部通过（含新增 URL 校验）。
- `pnpm verify` 18 步全绿；`pnpm check` 0/0/0（89 files）。

### 已知问题 / 下一轮候选

1. 外部阅读器实测仍受限；
2. 最终验收：子路径回归 + 解压包构建 + 文档同步（下一轮）。

## Iteration 126 — 验收记录文档（07:50–08:05）

### 交付完善

- **I313 ACCEPTANCE.md**：新增最终验收记录——交付物清单、5 条验收命令（check / verify / test:subpath / package / verify-release --full --build）、v0.3.16 实测结果（18/18 门禁、38 页、feed、预算 97%、41 张图片尺寸、子路径、解压包构建、FCP 164ms）、5 条已知限制与复现提示。
- `check-docs` 与 `verify-release` 都将 `docs/ACCEPTANCE.md` 加入必需文档，缺失即失败。

### 验证证据

- `check-docs`：必需文档（含验收记录）全部存在。
- `pnpm verify` 18 步全绿；`pnpm check` 0/0/0（89 files）。
- `verify-release --full --build`：解压包含验收记录，自测/构建/链接全部通过。

### 距截止

- 进入最终交付状态；如继续，按 STATE 候选执行。

## Iteration 127 — Feed 发现地址闭环 / README 入口（08:10–08:25）

### 创新点

- **I314 Feed 自动发现闭环**：`check-seo` 读取 `rss.xml` 的 `atom:link rel=self` 与 `feed.json` 的 `feed_url`，要求每页 `<link rel=alternate>` 的 href 与之一致——页面发现地址与 feed 自声明地址不再可能漂移。
- README 导航与第 100 轮里程碑提示加入 `docs/ACCEPTANCE.md` 验收记录入口（文档链接 67 → **69**）。

### 验证证据

- `check-seo`：38 页 feed 自动发现与 feed 自引用一致，全部通过。
- `check-docs`：69 条相对链接、43 张截图有效。
- `pnpm verify` 18 步全绿。

### 距截止

- 交付物保持可复现；进入最终交付确认。

## Iteration 128 — 最终交付确认（08:30–08:45）

### 交付确认

- **I315 验收记录对齐**：`docs/ACCEPTANCE.md` 更新到 v0.3.18——236 包文件、预算 97%（6738/6912 KB）、单页 106 KB / 112 KB、129 条迭代记录（0–128）。
- 最终复验链：`pnpm verify` 18 步 → `pnpm test:subpath` → `node scripts/package.mjs` → `verify-release --full --build`（解压包自测 + `astro build` + 构建后链接检查）全部通过。
- 发布包：`release/rhinelab-blog-v0.3.18.zip`（236 文件）+ MANIFEST（sha256）。

### 验证证据

- 18 步 verify 全绿；子路径回归全绿；解压包构建与链接检查通过。
- `pnpm check`：0 errors / 0 warnings / 0 hints（89 files）。

### 距截止

- 交付物齐备，进入目标窗口收尾。后续若继续迭代按 `STATE.md` 候选执行。

## Iteration 129 — 浏览器冒烟巡检（09:00–09:15）

### 验证（I316）

对最终构建做浏览器冒烟巡检（Chromium + PerformanceResourceTiming.responseStatus）：

| 页面 | 结果 |
| --- | --- |
| `/stats/` | 1 个 h1、0 失败资源、0 破图 |
| `/404.html` | 1 个 h1、0 失败资源、`noindex, follow`、9 个可操作链接 |
| `/posts/02-reproducible/` | 1 个 h1、0 失败资源、TOC 存在、2 段 JSON-LD、外链全部 noopener |
| `/changelog/` | 1 个 h1、0 失败资源、129 个版本；过滤 `feed` → `匹配 28 / 129`、47 处高亮 |

- 截图更新：`docs/screenshots/stats.webp`、`docs/screenshots/404.webp`。

### 说明

- 本轮为交付前的运行时巡检，未改动站点逻辑；版本号推进到 v0.3.19 仅用于文档与发布包同步。

### 距截止

- 继续等待目标窗口结束，期间保持交付物可复现。

## Iteration 130 — 最终复核 / 交付关闭（09:20–09:35）

### 交付关闭

- **I317 三重复核**：
  1. `pnpm verify` 18 步全绿（38 页 / 221 产物 / 预算 97%）；
  2. 解压发布包后 `astro build` + `check-links --strict` 通过（`verify-release --full --build`）；
  3. `pnpm test:subpath` 子路径构建与三门禁通过并恢复默认。
- 文档同步：STATE 标记「Iteration 130 / 交付完成」；ACCEPTANCE 对齐 v0.3.19（131 条迭代、单页 107KB）；发布包 `rhinelab-blog-v0.3.19.zip` 重新打包并通过 MANIFEST 校验。
- 最终交付物：独立可构建模板站 + 主题覆盖层（安装/验证/回滚）+ 版本化 zip + 完整文档（README/THEMING/DESIGN/ASSETS/DEPLOY/READERS/ACCEPTANCE/MILESTONE-100/STATE/ITERATIONS）。

### 说明

- 距目标窗口结束仍保持待命；不再改动站点逻辑，仅做可复现性确认。

## Iteration 131 — 描述/OG 唯一性门禁（09:40–09:50）

### 创新点

- **I318 meta description / og:title 唯一性**：`check-seo` 收集每页 description 与 og:title，重复即失败（此前仅标题与 canonical 查重）；38 页实测 0 重复，作为未来防重复的硬门禁。
- 验收记录与徽章更新到 v0.3.20（132 条迭代记录）。

### 验证证据

- `check-seo`：38 页标题 / 描述 / og:title 唯一且全部通过。
- `pnpm verify` 18 步全绿。

### 距截止

- 继续待命至目标窗口结束。

## Iteration 132 — 莱茵生命演示站（08:20–10:00）

### 目标

用户授权「大大方方用素材、不商业化」，要在中午前看到一版完美的演示网站。本轮把模板站升级为**非商业同人演示站**，仍保持模板可剥离、可构建、门禁全绿。

### 素材

- 通过浏览器同源 `fetch` + canvas 压缩 + 本地接收服务，从公开归档 [Aceship/Arknight-Images](https://github.com/Aceship/Arknight-Images) 取回 8 位莱茵生命干员（塞雷娅 / 赫默 / 伊芙利特 / 白面鸮 / 梅尔 / 麦哲伦 / 多萝西 / 缪尔赛思）的 E2 立绘与 E1 档案图，压缩为 16 张 WebP（合计约 2.4MB）。
- 版权归鹰角网络，仅非商业演示；`docs/ASSETS.md` 3.1 记录来源、使用范围与删除方式；README / 页脚保留同人声明。

### 站点改造

- **新页面 `/operators/`**：研究员名录——头部统计、三幅重点立绘、8 张档案卡（编号/星级/职业/档案摘录/标签）、素材声明。
- **首页**：新英雄区（双角色立绘 + 数据条 + CTA + 滚动条带）、组织概览三卡、三处实验场图录、四张研究员预览、引用横幅；保留原文章列表。
- **导航**：新增「研究员」。
- 入场动画（`rl-rise`/`rl-fade`，尊重 reduced-motion）、卡片 hover 抬升、移动端重新排版（隐藏装饰条带、降低立绘存在感、名录页图文渐隐）。

### 迭代内修复

- **产物膨胀**：`astro-compress` 的 `Image: true` 会把已压好的 WebP 重编码，dist 从 9.3MB 膨胀到 17.3MB；关闭该通道后回到 9.3MB（预算 86%）。
- 英雄区两次布局失败（网格项高度塌陷为 0）→ 改为「内容左 + 绝对定位立绘右」并用 mask 渐变隔离正文。
- 移动端立绘溢出英雄区 → 裁切区域 + 隐藏移动端装饰条带；名录页移动端空隙过大 → `min-height:auto` 与渐隐遮罩。

### 验证

- `pnpm build`：39 页（新增 `/operators/`）；`check-links` 2126 链接 / 254 资源 0 断链；`check-a11y` 39 页通过；`check-budget` 86%（9307/10854KB）、单页 108/120KB、66 张 img 全带尺寸。
- 浏览器截图（1280 桌面亮/暗 + 390 移动）：首页、`/operators/` 均已核对。
- 文档：README 演示画廊（6 张新截图）、ASSETS 3.1、CHANGELOG 0.4.0、版本徽章 133 ITER。

### 已知问题

1. 外部阅读器实测仍受网络限制；
2. 立绘为第三方公开归档，商用/再分发需删除（文档已写清）。

## Iteration 133 — GitHub 仓库与 Actions 迭代（10:00–10:45）

### 目标

用户要求「去 GitHub 开个仓库跑几轮 Action」。已创建私有仓库 `mayuxiao2021/rhinelab-blog`，用 SSH 推送，逐步把 Windows 本机通过的门禁迁到 Ubuntu runner。

### 过程（5 轮失败 → 全绿）

1. **run #1**：`pnpm/action-setup` 与 `packageManager` 版本重复 → 移除 action 的 version 输入。
2. **run #2**：`verify-release --full` 把 `--full` 当版本号 → 修 CLI 参数解析（B64）。
3. **run #3**：GNU tar 不能读 zip（Windows 上 bsdtar 可以）→ 改为 unzip / python3 / bsdtar 回退。
4. **run #4**：Linux `zip -rq .` 归档不含根目录，条目归一化把 `docs/...` 又剥了一层 → 归档统一带 `rhinelab-blog/` 根目录，条目归一化兼容三种归档。
5. **run #5**：push 触发全绿（含 artifact 上传）。
6. **run #6**：`workflow_dispatch` 再跑一次，同样全绿。

### 最终 workflow

`pnpm install --frozen-lockfile` → `pnpm check` → `pnpm verify`（18 步）→ `pnpm test:subpath` → `node scripts/package.mjs` → `verify-release --full --build` → 上传 `dist` 与 `release/*.zip` 产物（7 天保留）。安装 `fonts-noto-cjk` 保证 OG 图中文正常。

### 验证

- GitHub Actions：run #5（push）与 run #6（dispatch）均 success；步骤 1–12 全绿，artifact 上传成功。
- 本地：`pnpm verify` 18 步、`verify-release --full --build` 仍全部通过。
- 版本推进到 v0.4.1，文档同步。

## Iteration 134 — 公开仓库 + GitHub Pages（11:50–12:20）

### 操作

- 仓库由私有转为 **public**：<https://github.com/mayuxiao2021/rhinelab-blog>（含非商业演示立绘；ASSETS 已写明版权与移除方式）。
- 通过 API 启用 Pages（`build_type: workflow`），新增 `.github/workflows/pages.yml`：`BASE_PATH=/rhinelab-blog/` + `SITE_URL=https://mayuxiao2021.github.io` 构建 → `configure-pages` → 上传 → `deploy-pages`。
- 推送前本地用相同 BASE_PATH 构建并跑 `check-links/check-seo`：39 页、资源与 canonical 全部带 `/rhinelab-blog/` 前缀。
- 仓库 homepage 指向 Pages；README 增加 verify / pages 徽章与「在线演示」入口；修复 `bump.mjs` 对 STATE 历史迭代号的误替换。

### 验证

- `pages` run 44447843083：Build → Setup Pages → Upload → Deploy 全绿；
- `verify` run 44447842999：18 步 + 子路径 + 打包 + 解压构建全绿；
- 线上：<https://mayuxiao2021.github.io/rhinelab-blog/> 200，首页与 `/operators/` 标题正确；`/rhine/art/art-saria.webp`、`/pagefind/pagefind.js`、`/og/default.png` 均 200；
- 浏览器访问被 302 到 <https://github.glmyx.eu.org/rhinelab-blog/>（Pages 代理域），页面完整渲染。

## Iteration 135 — 作者博客完整迁移（14:10–15:30）

### 目标

用户要求「继续持续迭代，修复 bug，并且把我的博客完整设置上去」。把 `D:\admin\main\blog_astro`（Fuwari 原站，标题「黯」）的身份、文章、关于、头像、友链与静态页面完整迁移到莱茵档案主题，并部署上线。

### 迁移内容

- **身份**：`siteConfig.title = 黯`、subtitle、profile 名称/简介/头像/社交链接、导航（首页/归档/关于/研究员/项目/统计/GitHub）。
- **文章**：7 篇（2 篇安全研究长文 + 测试/指南/Markdown 示例），保留 frontmatter 的分类、标签、日期与草稿状态；删除模板示例文章。
- **关于**：`src/content/spec/about.md` 换为作者内容（含 GitHub 仓库卡与图片来源声明）。
- **资源**：头像、banners、favicon、`gallery/` 预览图、友链静态小游戏（EatKun / EatKano / jump play），合计约 1.2 MB。
- **站点 URL**：默认与 Pages workflow 均切到 `https://github.glmyx.eu.org` + `BASE_PATH=/rhinelab-blog/`。

### 迁移中修复（8 类）

1. 友链内部链接在子路径部署下 404（`Links.astro` 未加 base）。
2. 嵌套文章 OG 路径不一致（`guide-index.png` vs `guide.png`）。
3. 摘要 feed 中转义 iframe 残留 `<iframe>`（实体解码顺序错误）。
4. `astro-compress` 压缩第三方小游戏 HTML 报错（增加 `Exclude`）。
5. 公共封面图/小游戏精灵图缺 `width`/`height`（补默认尺寸）。
6. 无障碍：内容 H1 与页面标题重复、iframe 缺 title、外链缺 rel、静态页缺 lang/重复 id/alt。
7. SEO 门禁误扫第三方静态页（check-seo 排除），关于页 description 过短。
8. 预算过紧（真实博客长文 145 KB/页）→ 调整为 12.5 MB / 160 KB；页脚与隐私页的「无官方素材」表述改准确。

### 验证

- `pnpm verify` 18 步全绿：48 HTML 页 / 46 SEO 页 / 2886 链接 0 断链 / 48 页无障碍 / RSS 7 items / 预算 90%（11493/12800 KB）。
- `pnpm test:subpath` 通过（base-aware 友链、OG、RSS）。
- 浏览器实测：首页（7 篇）、关于、文章正文、项目索引亮暗均正常；截图更新至 `docs/screenshots/`。
- 待本次推送后由 GitHub Actions `verify` + `pages` 复核并发布。

## Iteration 136 — 界面引导页 + 莱茵启动动画（15:43–17:00）

### 需求

「做个引导页面，可以选择哪种风格，为莱茵生命添加进入动画」。

### 实现

- **`/start/` 引导页**：全屏暖纸/暗色设计，三张风格卡（莱茵档案 / 研究员名录 / 旧版博客）带 CSS mock 预览；
  启动动画开关写入 `localStorage`，可手动重播；导航「入口」、页脚 STYLE、关于枢纽与站点索引均可达。
- **莱茵启动序列**：`RhineBoot.astro` 全屏终端 boot（旋转徽记 / 逐行状态 / 进度条 / SKIP），
  触发条件：首次进入首页、`?intro=1`、引导页选择莱茵；`rhine-boot-enabled=0` 关闭；
  `prefers-reduced-motion` 直接跳过；`?bootdebug=1` 保留 30 秒供截图验收。
- **英雄区入场**：back/mid/front 三层立绘 + 内容块依次淡入，斜向扫光一次；移动端与 reduced-motion 降级。
- **入口动效**：引导页卡片 hover 抬升、开关滑块、启动序列网格/角标样式。

### 迭代内修复

1. `/start/` 独立 Layout 与 Swup `#swup-container` 结构不兼容，导航进/出会残留旧页外壳 → 相关链接加 `data-no-swup` 强制整页加载（Navbar、移动菜单、引导页卡片/返回/重播）。
2. `check-links` 未剥离 `?query`，`/?intro=1` 被误报断链 → 解析文件前先 `split('?')`（B72）。
3. 引导页缺 `#swup-container` 导致 skip link 锚点失效 → 给 `<main>` 补 id。
4. 全屏启动序列无 JS 时不能阻塞页面 → 默认 `hidden`，脚本满足条件才显示；减少动态偏好直接跳过。

### 验证

- `pnpm verify` 18 步全绿：49 HTML 页 / 47 SEO 页 / 3034 链接 0 断链 / 49 页无障碍 / RSS 7 items / 预算 92%（11724/12800 KB）、79 张图带尺寸。
- `pnpm test:subpath` 通过（`/rhinelab-blog/?intro=1` 链接、引导页资源均带 base）。
- 浏览器实测：引导页亮/暗、启动序列（36s 保持）、移动端 390px；导航进/出引导页均整页加载；英雄区入场动画计算样式生效。

## Iteration 137 — 根域名切换为「选择界面」（17:27–18:10）

### 需求澄清

用户明确：「我就是说根域名换成选择界面」——即 `https://github.glmyx.eu.org/` 直接展示风格选择页，而不是旧博客首页。

### 部署拓扑

| 路径 | 内容 | 仓库 / 分支 |
| --- | --- | --- |
| `/` | 选择界面 Portal（自包含单页） | `mayuxiao2021.github.io` → `portal` 分支，Pages 源设为 legacy 分支 |
| `/rhinelab-blog/` | 黯的博客（v0.7.0，49 页） | `mayuxiao2021/rhinelab-blog` → `main`（Actions） |
| `/legacy-blog/` | 旧版 Fuwari 归档快照 | 新建 `mayuxiao2021/legacy-blog` → `main`（Actions，`BASE_PATH=/legacy-blog/`） |

### 实现

- Portal 页面从 `/start/` 抽成零构建静态 `index.html`：三卡片、亮暗切换、启动序列开关（与博客共用 localStorage key）、动态读取 `/rhinelab-blog/build-info.json` 版本号；图片直接用 `/rhinelab-blog/rhine/art/*` 公开路径。
- 旧博客归档：复制 `blog_astro` 工作树（含未提交改动）为独立仓库，补 `base` 环境变量与 Pages workflow；旧仓库 `master` 完全未动，仅新增 `portal` 分支作为站点入口。
- 博客 `/start/` 页的「旧版博客」卡片改为指向 `/legacy-blog/`，避免与根域名 Portal 形成指向歧义。

### 迭代内修复

1. 切换 Pages 源时 GitHub API 会清空 `cname`，导致自定义域名 404 → PUT 重新设置 `cname` 并手动 POST `pages/builds`，`/`、`/rhinelab-blog/`、`/legacy-blog/` 全部恢复 200。
2. 旧博客子路径构建的资源前缀 → `base` 环境变量化，产物 CSS/JS/头像均 200。
3. Portal 与博客的启动动画开关统一使用 `rhine-boot-enabled`，避免两套偏好不一致。

### 线上验证

- `https://github.glmyx.eu.org/` → 选择界面 200；三卡片链接分别到博客、名录、旧版归档。
- `/rhinelab-blog/` → 200（v0.7.0）；`/legacy-blog/` → 200，CSS/头像资源 200。
- 点击 Portal 的莱茵卡片 → 博客首页并触发启动序列；旧版卡片 → 旧博客完整渲染。

## Iteration 138 — 莱茵生命主题细节补完 + 隐藏彩蛋（22:00–23:00）

### 需求

「你做的要完全符合莱茵生命的主题啊，加一点小巧思」——Portal 与引导页不能只是通用档案风，要有莱茵生命的机构感、术语与可探索的小细节。

### 落地

- **Portal（根域名）**：品牌行改为 `莱茵生命 · 档案入口 / RHINE LAB / TRIMONT · COLUMBIA / OBSERVER-07`；
  SECTOR-03 本地实时时钟；三格遥测（归档来源 / 结构稳定度 98.7% / 档案总量，动态仪表条）；
  STRUCTURE · DEFENSE & CLINICAL · ECOLOGY & FIELD 跑马灯；卡片 RL 档案编号 + SPECIMEN 标签 + hover 扫描线；
  页脚条形码与 HINT；暗色主题单独适配。
- **`/start/`**：同样的遥测、跑马灯、编号、标本标签与时钟；`rl-style-card__top`、`rl-start__meter` 等复用样式。
- **全站彩蛋**：新增 `RhineEgg.astro` 挂在 `MainGridLayout`，任意页面输入 `rhine` 弹出 `ACCESS GRANTED // DIAGNOSTIC`
  （OBSERVER-07 / ARCHIVE SYNC / 三学科 OK / 进度条），12s 自动关闭、点击或 Esc 关闭、reduced-motion 跳过；
  Portal 内同样实现；两处页脚均提示「输入 rhine 试试」。
- 首页英雄区坐标补 `TRIMONT · COLUMBIA`；页脚加 `HINT / 输入 rhine`。

### 验证

- `pnpm verify` 18 步全绿：49 页 / 47 SEO / 3034 链接 / 79 张图带尺寸 / 预算 92%（11786/12800 KB）、CSS 95%、单页 94%。
- 浏览器实测：Portal 亮/暗、`/start/` 亮/暗、彩蛋浮层；移动端遥测改为单列。
- 已知余量：CSS 预算已到 95%、单页 HTML 94%，后续新增样式需先做合并或提高预算。

## Iteration 139 — 交接文档与 Portal 源码归档（23:16–23:45）

### 需求

「写思路文档，我要给别的 ai 继续」。

### 交付

- `docs/AI-HANDOFF.md`：面向下一个 AI 的完整交接文档，包含：
  - 三站点 URL / 仓库 / 分支 / Pages 源与自定义域；
  - 本地目录、命令与 18 步门禁、发布与截图流程；
  - 代码地图、`rhinelab.css` 第 20–23 节目录、主题键与 session 键；
  - Portal / 引导页 / 启动序列 / 全站彩蛋的实现细节；
  - B64–B72 与 Swup、Pages cname 等已修问题清单；
  - 部署 Runbook（博客 / Portal / 旧版 / 回滚）、当前预算余量（CSS 95%、单页 94%）；
  - 已知坑与下一轮优先级（CSS 瘦身、主题键统一、Portal 自动同步、内容增厚、视觉回归等）。
- `portal/` 源码镜像 + `portal/README.md`：Portal 与用户站 `portal` 分支的同步流程。
- 修正 STATE 遗留的过期数字与描述。

### 验证

- `node scripts/check-docs.mjs` 文档一致；`pnpm verify` 18 步全绿（无代码变更）。
- 发布包重新生成并校验；随后 push 触发 CI 与 Pages 复核。


## Iteration 140 — 全站检查完善与创造性设计重构（v0.9.0）

### 检查发现

1. **CSS 预算逼近上限（398.5/420 KB，95%）**：`Markdown.astro`（2 处）、`ArchivePanel.astro`、`PostMeta.astro`、`Layout.astro` 在组件样式块中重复声明 `@tailwind base/components/utilities`，导致 Tailwind 工具类与 Typography 在 `dist/_astro/` 被重复打包 4 次。
2. **系列页面 (`/series/`) 断层为空**：作者文章迁移后未标注 `series` 与 `seriesOrder`，导致 `/series/` 显示 `EMPTY / 暂无系列`，文章底部系列进度条未激活。
3. **Portal 与博客主题存储键割裂**：Portal 用 `rhine-theme`、博客用 `theme`，跨入口切换亮暗模式不同步。
4. **研究员名录、项目索引与彩蛋交互单一**：`/operators/` 仅跳外部 Wiki、无站内深度检视与科室过滤；`/gallery/` 仅 1 个项目；`RhineEgg` 为静态装饰层。

### 创造性重构落地

- **CSS 架构瘦身**：移除 4 个组件的冗余 `@tailwind` 导入并转为原生 CSS，清理 `rhinelab.css` 重复媒体查询；在新增完整第 24 节重构样式后，构建产物 CSS 仍从 **398.5 KB 降至 280.4 KB（−29.6%，占用 67%）**。
- **首页「莱茵科室控制台 + 核心研究卷宗双联展柜」**：
  - `.rl-org` 升级为带 4 个频段按钮（`ALL` / `01 结构与源石` / `02 防卫与临床` / `03 生态与科考`）的交互控制台，点击联动高亮实验场与研究员预览卡。
  - 新增 `.rl-priority` 核心安全研究双联展柜，突出展示两篇安卓安全研究长文；`PostCard` 增加 CRC 校验指纹、安全等级、阅读负荷刻度条与系列徽标。
- **研究员名录 (`/operators/`) 交互式人事档案调阅终端**：
  - 为 8 位干员扩充科室、权限等级、三项实验参数进度条、可点击显影的 `[REDACTED]` 内部涂改批注（含一键全部显影）及关联站内文章。
  - 新增按科室与关键词实时筛选控制台，以及站内 `#rl-dossier-modal` 深度卷宗检视弹窗（支持前后切换、键盘左右键与 Esc、`?op=<slug>` URL 直达）。
- **搜索框干员直达 (`Search.svelte`)**：输入 `RL-01`～`RL-08` 或干员名/科室时，在检索面板顶部即时渲染「研究员卷宗直达」卡片。
- **交互式诊断终端 (`RhineEgg.astro`) & 外置脚本 (`public/rhine/ui.js`)**：升级为合规 `role="dialog"` 交互终端，支持输入 `rhine` 或点击左下角 HUD / 页脚 `TERMINAL` 唤起（内置 4 项指令），同步将全站交互脚本外置至 `ui.js`（减少约 110 KB 跨页内联），并补齐左下角 `.rl-hud` 快捷控制铭牌。
- **莱茵生命 0.5.0 仪器质感全面对齐（`dsh` 协作重构，CSS 第 25 节）**：引入 `public/rhine/art/rhine-mark.png` 阵营徽记遮罩（记录于 `docs/ASSETS.md` 3.1），全站升级 `--rl-radius: 0px` 直角仪器边缘、双侧 `14px` 垂直刻度标尺、Hero `01 / 08 ARCHIVE` 铭牌与双螺旋水印、侧栏 `SPECIMEN` 标本卡与 `MODULE //` 仪器模块头。
- **内容与跨入口主题闭环**：激活「安卓客户端安全研究」与「Fuwari 模板与排版指南」2 个系列（6 篇文章）；`/gallery/` 扩充为 4 个实验项目并支持领域过滤；打通 Portal、`/start/` 与博客的 `theme`/`rhine-theme` 同步。

### 验证

- `pnpm check`：95 files **0 errors / 0 warnings / 0 hints**。
- `pnpm verify`：**18 步全绿**（CSS 292.3/420 KB = 70%，JS 88%，总预算全通过）。


## Iteration 141 — CONTAINMENT PROTOCOL 视觉特效与代码块暗色修复（v0.10.0）

### 创新与改造

1. **新增全站渐进增强视觉特效层（`public/rhine/fx.js` + `rhinelab.css` 第 26 节）**：
   - **Hero 活体双螺旋样本柱**：`<canvas data-rl-helix>` 在右侧立绘过渡区实时绘制三维旋转双螺旋与 `A·T / G·C / O·R / R·L` 碱基对刻度，指针靠近时局部膨胀高亮，滚出视口与后台标签页自动暂停。
   - **Hero 显微透镜**：精细指针悬停 Hero 时显现跟随瞄准环、蓝图细网格、`X · Y · MAG ×` 倍率读数与 7 条隐藏观测批注（含 `ifrit` 彩蛋线索）。
   - **收容失效演习 (`ifrit`)**：任意页面键入 `ifrit` 或点击诊断终端 `[05]` 指令触发全屏红色紧急警报，Canvas 驱动火星粒子、核心温度飙升至 `412°C` 并逐条输出 6 行演习日志；约 4.6 秒后转绿显示 `CONTAINMENT RESTORED`，支持 `Esc` 或点击背景关闭并累计演习次数。
   - **文末审阅印章 & 首页「已调阅」标记**：阅读文章到文末自动盖下带同源 `CRC` 校验码的「已审阅」印章并写入 `localStorage['rl-read']`；列表卡片自动显示 `已调阅 · READ`。
   - **仪器解密读出 & 卡片扫描线**：`.rl-kicker` / `.rl-post__title` 等纯文本标题首次入屏时由同语种随机字符逐帧解密收敛（被控制台动态改写时自动让位），文章卡片悬停/聚焦触发一次性扫描光束。
   - 全部特效均尊重 `prefers-reduced-motion: reduce` 并在 `@media print` 隐藏。
2. **排查与修复 4 项浏览器实测视觉问题**：
   - **暗色模式代码块低对比度（既有遗留问题）**：实测发现代码块未消费 Shiki `--shiki-dark` 变量，导致暗色模式标识符沿用 `github-light` 的 `#24292e` 几乎无法辨认；在 `html.dark .astro-code` 作用域切换 `--shiki-dark` 配色，同时保留亮色暖纸底的高对比语法高亮。
   - **双螺旋水平偏移调整**：移至 `left: calc(58% - 84px)` 贴合立绘淡入区，不再遮挡首页左侧导语文字。
   - **警报面板遮挡与行距**：收容警报面板改实底隔离，日志网格设置 `align-content: start` 紧凑排布。
   - **印章签名与单字孤行**：印章底部过长 slug 改为与卡片同源的 `OBSERVER-07 · CRC XXXX` 校验码，提示文本设置 `text-wrap: balance` 消除单字换行。
3. **打包与文档规范**：`.gitignore` 与 `scripts/package.mjs` 排除本地 `promo/` 目录，补齐 `docs/ASSETS.md` 中 `rhine-mark.png`（17 项演示素材）与 `ui.js` / `fx.js` 清单。

### 验证

- `pnpm check`：0 errors / 0 warnings / 0 hints；`pnpm verify` 18 步、`pnpm test:subpath`、`package.mjs` 与 `verify-release --full --build` 全部通过（实测数据见 `STATE.md` / `docs/ACCEPTANCE.md`）。
