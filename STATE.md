# STATE · 24h 迭代状态（给下一次续跑的自己和协作者）

> 目标窗口：**2026-11-18 07:13 → 2026-11-19 07:13（Asia/Shanghai）**
> 规则：每轮迭代至少修复 1 个严重 bug 或增加 1 个创新点；每轮结束必须有构建/截图证据并更新本文件 + `ITERATIONS.md`。

## 当前状态

- 版本：**v0.8.0**（`package.json`）
- 阶段：**v0.8.0 / 莱茵生命细节补完**——Portal 与引导页加入遥测/标本/跑马灯，全站隐藏 rhine 诊断彩蛋
- 本轮：Iteration 138（作者博客完整迁移 + 8 类迁移 bug 修复）
- 下一轮候选：见 `ITERATIONS.md` 末尾「下一轮候选」
- 交付物：`release/rhinelab-blog-v0.8.0.zip`（326 文件）、`docs/MILESTONE-100.md`、README 与 `docs/` 全套
- 当前指标：**18 步 verify 全绿** · 49 HTML 页 / 45 sitemap URL · 预算 92%（11724/12800 KB）

## 关键命令

```bash
cd D:\admin\main\rhinelab-blog
pnpm build                 # 构建（含 pagefind）
pnpm preview --port 4400   # 预览；截图用 http://127.0.0.1:4400
node theme/install.mjs --target <dir> --dry-run   # 主题包预演
node scripts/package.mjs   # 打包 release/rhinelab-blog-v<version>.zip
```

- `node_modules` 是指向 `..\blog_astro\node_modules` 的 **junction**（离线复用，勿删；打包脚本已排除）。
- 截图目录 `.shots/`（已 gitignore）；移动端用 `dist/mobile-preview.html` 临时 iframe 方案（重建 dist 会丢失，可重新生成）。

## 里程碑后迭代摘要（100–120）

- Iteration 100：里程碑交付（MILESTONE-100、100 条迭代、v0.2.90）。
- Iteration 101–104：SEO 长度门禁、里程碑文档自动校验、og:description / gates 一致性、门禁单一数据源。
- Iteration 105–107：沿革过滤高亮与安全上限、关于页高亮、预览图尺寸、高亮省略提示。
- Iteration 108–109：首图 eager/fetchpriority、复制全部命令、机器状态自动重试（含计数修复）、重试参数可配置。
- Iteration 110–112：Enter 聚焦命中标题、Twitter Card / Manifest / OpenSearch / theme-color / data-base 门禁。
- Iteration 113–114：OpenSearch Image/Contact/Tags、子路径回归、修复 basePrefix TDZ（B61）。
- Iteration 115–117：脚本引用与门禁脚本清单门禁、静默 catch 门禁（verify 18 步）、a11y 规则强化与自测扩到 9 类。
- Iteration 118–119：STATE 同步门禁、gates↔verify 一致性、CHANGELOG 结构修复（B62）、charset 时机与 og:locale 一致性门禁。
- Iteration 120：最终验收——子路径回归、18 步 verify、发布包 v0.3.10 与文档全部同步。
- Iteration 121–132：交付收尾、验收记录、Feed 发现闭环、描述/OG 唯一性门禁、莱茵生命演示站（8 位干员素材 + `/operators/`）。
- Iteration 133–134：GitHub Actions 8 轮（CI 跨平台修复 B64/B65）、公开仓库 + GitHub Pages 在线部署。

## 已验证（证据）

- `pnpm build`：**通过**，v0.1.1；产物 `dist/` + `dist/pagefind/`。
- 首页亮/暗、文章页亮/暗、归档、项目索引、404：截图核对通过。
- 移动端 390×760：导航折叠、封面、卡片、统计行布局通过。
- Pagefind 搜索：输入「观测」返回 4 条结果（含正文摘要）。
- 主题安装器：dry-run（零写入）/ 安装 / 幂等重装 / 回滚（含空目录清理）全部实测通过。
- **发布包**：`release/rhinelab-blog-v0.3.7.zip`（解压后 selftest + 构建 + 链接/无障碍/对比度/Feed/预算自检全部通过）。
- **类型检查**：`pnpm check` **0 errors / 0 warnings / 0 hints**（89 files）——Iteration 133 已把继承的 20 个错误清零。
- **目录 / 刻度轨**：文章页 `RhineToc`（编号目录、当前项高亮、移动端折叠）+ `RhineProgress`（≥1440px 刻度轨、阅读百分比、点击/键盘跳转、Swup 重绑）。
- **a11y**：每篇文章 h1 唯一；辅助色对比度 5.28:1 / 4.74:1（AA）；skip link 可用；移动端检索面板可滚动。
- **检索筛选**：`pagefind.filters()` 返回分类/标签计数；分类筛选实测 3 条结果；UI chip 选中态/清除/计数正常。
- **检索摘录净化**：非正文区域（统计/元信息/目录/许可/上下篇/评论）已 `data-pagefind-ignore`；摘录实测为正文句子。
- **归档语义页**：四类归档页均有唯一 h1 与条目统计；404 标题为「页面不存在 - 莱茵档案」。
- **相关档案**：文章页文末 3 条推荐（同分类优先、共享标签次之）。
- **检索生命周期**：点击结果/换页后自动关闭面板，Esc 可关闭并按断点回焦，`aria-expanded` 同步。
- **统计页**：`/stats/` 桌面与 390×760 移动端截图核对通过；导航 6 项不换行。
- **OG / 元信息**：`dist/og/` 6 张 1200×630；文章页 `og:image` 指向专属图、其余页面默认图；404 `robots noindex`；RSS `<language>zh-CN</language>`。
- **站内检查**：`pnpm check:links --strict` → 26 页面 / 933 链接 / 81 锚点 / 112 资源，0 断链；空链接审计 0 处。
- **上下篇导航**：修复数据源后中间文章左右两条链接、首末篇单侧链接，均带可访问名称。
- **主题安装器 v2**：`theme/selftest.mjs` 20 项断言全过；对真实 `blog_astro` 的 `--list` / `--dry-run` / `--verify` 均零写入（无 `.rhine-backup` 残留）。
- **产物瘦身**：dist 7478→5848 KB（−21.8%）；`check-budget` 五项全绿（88/84/73/73/82%）。
- **移动端菜单**：修复 fixed 主题色导致的脚本中断；390×760 实测可打开（6 项导航）。
- **系列**：文章 02 显示 4 条系列、当前第 3 条、`aria-current` 1 处；文章 99 无系列；`check-links` 1013 链接/143 资源均通过。
- **系列索引**：`/series/` 1 个系列 / 4 条目 / 跨度 2026-11-01—11-18；页脚 SERIES 入口；JSON-LD 字段齐全（wordCount=379, image=OG）。
- **时间线**：`/timeline/` 1 年 / 5 条目 / 跨度 2026-10-30—11-18；桌面与 390×760 截图已核对，移动端日期横排修复。
- **目录高亮**：滚动/点击/Swup 换页三种路径均验证 active 状态与 aria-current；类型检查 **0 errors / 0 warnings / 0 hints**。
- **分类与标签**：`/topics/` 2 分类 / 12 标签 / 加权云；归档页 3 个互链入口 + 侧栏全部标签入口；移动端无溢出。
- **RSS**：Astro 渲染全文，5 items / XML 合法 / 相对链接 0 / 标题锚点 0；KaTeX 7 处、MathML 2 处、表格 5 处、Shiki 代码块 7 处。
- **打印样式**：抽取 18 条 @media print 规则重放验证（导航/侧栏/目录隐藏、单栏白底、代码块浅底、复制按钮隐藏），截图 `print.webp`。
- **移动端菜单**：换页后自动关闭、按钮单次 toggle 正常、Esc 可关闭；`/` 键桌面聚焦搜索/移动端打开面板并聚焦。
- **子路径部署**：临时 `base=/rhine-test/` 构建验证 canonical/OG/RSS/sitemap 均为单前缀，HTML 无双重前缀；截图资产 1091→673KB。
- **PWA**：manifest 构建期生成（start_url/scope/icons 均带 base），3 个图标 180/192/512；`/gallery/` 项目封面带 base 且加载成功。
- **分享/引用**：复制链接与引用均反馈成功；Swup 换页后仍生效；触屏显示系统分享按钮。高对比度令牌覆盖生效（`--rl-muted=#45443d`）。
- **版本沿革**：`/changelog/` 22 个版本、页脚入口、`window.print` 按钮调用成功；DEPLOY 补 Nginx/Caddy。
- **热力图**：368 格 / 5 个有稿日与发布日期一致（修复时区偏移一天）；changelog 23 个锚点可跳转。
- **热力图月份**：13 个标签（11月→2026.01→11月）与周列对齐；归档页单年份显示「按时间倒序 / NEWEST FIRST」。
- **Astro 迁移**：实测手动 `unified()` 可行但触发上游 gfm/smartypants 告警，已还原并记录权衡。
- **随机档案**：`/random/` 1.2s 内跳转到随机文章；`?no=1` 显示回退清单；sitemap 已排除；分享条 5 个动作（含 MD 引用）。
- **安装器 v3**：selftest 26 项通过；真实目标 dry-run 12 项、零写入；覆盖 6 组件 + 系列工具。
- **许可台账**：ASSETS 增加构建期依赖 SPDX 表（MIT/Apache-2.0/OFL/CC-BY/Unlicense）。
- **归档折叠**：2026 展开 / 2025 折叠，展开交互正常；时间线 2 年份 chips 可跳转；热力图 6 个有稿日（含 2025-12-20）。
- **年度对比**：2026/2025 两行（条目/字数/分钟）；`?q=档案` 自动打开检索并返回 7 条；OpenSearch 描述生成正确、head 含 rel=search。
- **检索键盘/高亮**：7 条 option、9 处 mark；ArrowDown 选中第 1 条（aria-activedescendant 正确），Enter 跳转文章。
- **JSON Feed**：1.1 / 6 items / KaTeX / 绝对链接 0 相对；**字体预加载** 2 条且实际优先加载；partytown 移除后 frozen-lockfile 校验通过。
- **代码复制**：99 页 1 个按钮/233 字符、Swup 到 02 页 2 个按钮/52 字符；Mermaid 不受影响。
- **归档记忆**：`{"2025":true,"2026":false}` 重载后保持；安装器 7 组件。
- **订阅页**：3 卡片、复制得到绝对 URL；归档「全部展开/折叠」与记忆联动；SW 评估结论写入 DESIGN。
- **语言徽标**：02 页 2 个代码块均显示 `bash`；**About 枢纽** 8 张卡片链接齐全。
- **相关原因**：02 页相关项显示「同分类 / SAME CAT」；**Feed 校验**：RSS 6 items 全绝对+content，JSON Feed 字段齐全含 KaTeX；Markdown 订阅列表复制 3 行成功。
- **检索历史**：`["档案"]` 持久化、chips 可重搜/清除（清除后 null）；桌面空输入聚焦显示 3 条历史；归档 RESET 恢复 2026 open / 2025 closed。
- **无障碍门禁**：check-a11y 33 页全绿、自测可抓 8 类缺陷；33 页外链 rel 已修复；skip link 聚焦可见；verify 已含该门禁。
- **对比度门禁**：亮色最低 5.28:1、暗色最低 6.60:1；坏 CSS 自测 exit 1；`/accessibility/` 7 行快捷键表、About 9 卡。
- **制作说明**：`/colophon/` 4 面板/8 色板；检索历史单删（3→2 条）；对比度每主题 10 组全绿（亮最低 5.15，暗最低 5.60）。
- **行号/面包屑**：行号 CSS 计数器生效且复制无行号；面包屑 4 级 + BreadcrumbList JSON-LD；a11y 加已知限制清单。
- **skip link**：合并为 1 条（#swup-container，聚焦可见）；**Feed 门禁** RSS/JSON 各 6 items 结构通过、坏 Feed 自测 exit 1。
- **令牌修复**：`--rl-paper` 已定义、复制成功态文字 rgb(234,229,225)；亮色 amber-ink 序列 6.15/6.45/4.66 全达标（每主题 12 组）。
- **更新日期**：02 篇「更新于 2026-11-18」+ dateModified；系列 02 显示下一站、03 显示系列已归档；colophon 构建行 `Astro v6.4.8`。
- **复制按钮**：文章页 `.copy-btn=0`、自有按钮 2、语言徽标 2、pre 顶部留白 34.4px；RSS lastBuildDate 输出；系列 PREV+NEXT 并排。
- **外链**：文章页 5 条外链均 blank+noopener+↗（站内 26 条不变）；首页 SearchAction 模板正确；Feed 门禁含 lastBuildDate；对比度 13 组/主题。
- **返回顶部**：完全可见、进度环 35%、passive 滚动；manifest 4 shortcuts + categories；对比度 14 组/主题。
- **检索引导**：无结果时 8 个标签 chips，点 Astro 返回 1 条；noscript 区块含归档/订阅链接；回顶短页阈值生效。
- **站点索引**：`/sitemap/` 12 页面/6 文章/14 chips；PWA 4 个专用快捷图标；对比度 16 组/主题。
- **键盘跳转**：g+a→归档、g+s→统计，输入框内禁用；`/stats.json` 6 posts/2472 words/12 min；sitemap 年份分组 2026/2025。
- **快捷键浮层**：`?` 打开 7 行 dialog、焦点关闭按钮、Esc 关闭；stats.json 年度聚合；sitemap 年份折叠（2026 open / 2025 closed）。
- **焦点陷阱**：Tab/ShiftTab 均被拦截、焦点保持；**Mermaid 复制**源码 `flowchart LR…`；正文图片带 lazy/async。
- **KaTeX 复制**：点击公式复制 `E = mc^2` + toast；目录折叠记忆 `rl-toc-open=0/1` 可还原；打印页眉含标题与 URL。
- **中文计数**：words 2485→2521、chars 4501、minutes 13→9（新速度模型）；打印页眉含日期；单页预算 79.5/96KB。
- **依赖清理**：reading-time 已移除、frozen-lockfile 通过；stats 6 KPI 含 CHARS 4,501；打印页眉含站点名。
- **章节复制**：锚点复制绝对 URL + toast；热力图 368 格含字符数；移动端 KPI 2×3 无溢出；新增 CONTRIBUTING.md。
- **Feed 深度校验**：GUID/id 唯一、日期顺序、绝对地址全通过；锚点复制态 1.4s 消失；系列统计 04 FILES · 1,925 WORDS · 7 MIN。
- **一致性**：feed 6 条与 stats/sitemap 完全一致；检索结果 `role=status` 播报「RESULTS / 7 条档案」；stats 页含 stats.json 链接。
- **Feed 标准**：RSS atom:self + 17 个 category；JSON Feed favicon/icon；文章页 4 个 article meta 全部存在。
- **文档门禁**：check-docs 15 项通过；RSS dc:creator 6 条 + dc 命名空间；JSON `_site` 扩展；article:author 存在。

## 若继续迭代的候选（按优先级）

1. 外部阅读器实测（Feedly / Inoreader / NetNewsWire）——需要公网部署后的 feed URL；
2. `gates.json` 每个 label 与脚本路径一一绑定（当前校验首 token）；
3. MILESTONE 数字自动校验（页数/文件数/链接数从构建产物回读）；
4. STATE 历史证据（0–99 轮）压缩为摘要 + 链接 `ITERATIONS.md`；
5. 依赖审计与预算再压（当前总预算 97%、单页 92%，余量偏紧）。

## 已知问题

- 外部阅读器的真实订阅测试受网络环境限制，未做（feed 结构 / GUID / 日期 / 语言已由 `check-feed` 覆盖）。
- 发布包解压后需要 `pnpm install`（或复用本机 junction 的 `node_modules`）才能构建。
- `theme/install.mjs` 默认只装 CSS + 品牌素材；完整首页封面/编号系统需整站模板或 `--with-components`。
- 搜索面板、归档时间轴样式仍沿用部分 Fuwari 结构，视觉细节可继续收敛。
- 预算余量约 3%（总 97%、单页 92%），新增内容需关注 `check-budget`。
