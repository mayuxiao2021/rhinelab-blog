# 定制指南 · 把莱茵档案改成你的

主题所有可调项分为三层：**配置**（改值）→ **令牌**（改 CSS 变量）→ **组件**（改结构）。优先用前两层。

## 系列（SERIES）

在文章 frontmatter 增加两个字段即可把文章编入系列：

```yaml
series: 建站日志
seriesOrder: 2
```

- 同 `series` 名的文章会自动聚合；`seriesOrder` 缺省时按发布时间排序；
- 系列只有 1 篇时不显示系列块；
- 文章页会在「相关档案」上方自动渲染刻度进度、`03 / 04` 计数与可点击条目列表（当前条目高亮并带 `aria-current`）。

## 1. 站点身份：`src/config.ts`

```ts
export const siteConfig: SiteConfig = {
  title: '莱茵档案',                  // 导航品牌与首页 H1
  subtitle: 'RHINE LAB-STYLE FIELD ARCHIVE',
  themeColor: { hue: 70, fixed: true }, // fixed=true 隐藏访客调色按钮
  banner: { enable: false, ... },       // 本主题建议 false，用 CSS 档案场背景
}
```

| 想改什么 | 改哪里 |
| --- | --- |
| 站点名 / 副标题 | `siteConfig` |
| 导航链接与顺序 | `navBarConfig.links`（`LinkPreset.Home/Archive/About` 或自定义对象） |
| 作者名 / 头像 / 社交链接 | `profileConfig` |
| 友链 | `FRIENDLY_LINKS` |
| 侧栏部件顺序 | `layoutConfig.sidebar`（`profile / categories / tags / links`） |
| 版权协议 | `licenseConfig` |

新增文章：

```bash
pnpm new-post "04 · 我的第一条观测" 04-my-post
```

会在 `src/content/posts/` 生成带 frontmatter 的草稿。

## 2. 设计令牌：`src/styles/rhinelab.css`

文件顶部两组 `html:root` / `html:root.dark` 就是全部颜色与尺寸来源。

```css
html:root {
  --rl-amber: #9b7247;      /* 图形强调 */
  --rl-amber-ink: #7a5526;  /* 文字强调（必须保证对比度） */
  --rl-radius: 3px;         /* 卡片圆角 */
}
```

**改色只改令牌，不要改下游规则。** 主题组件全部消费 `var(--rl-*)`。

### 换成别的强调色

1. 选一个"图形色"（亮色下 ≥3:1）与一个"文字色"（≥4.5:1）；
2. 同时改亮色与暗色两处的 `--rl-amber` / `--rl-amber-ink`；
3. 检查 `.rl-prose a`、`#navbar` 编号、卡片角标三处可读性。

### 调字体

改 `rhinelab.css` 的 `--rl-sans` / `--rl-mono` 即可。默认中文走系统字体栈（Windows YaHei / macOS PingFang / Linux Noto CJK），模板不打包 CJK 字体；需要统一跨平台观感时可自行引入 `@fontsource-variable/noto-sans-sc`（会显著增大产物，`pnpm check:budget` 会提示）。注意构建 OG 图需要构建机具备中文字体。

字体在 `--rl-sans` / `--rl-mono` 两个变量里。主题只自带 JetBrains Mono（OFL）与 Roboto（Apache-2.0），中文用系统栈；若要自托管中文字体，推荐 `@fontsource/noto-sans-sc`（OFL-1.1），按 unicode-range 分片引入。

## 3. 组件层（主题专属）

| 文件 | 作用 | 注意 |
| --- | --- | --- |
| `src/components/rhine/RhineMark.astro` | 站点徽标（扫描环 + 双折线） | `currentColor` 驱动，换尺寸用 `size` |
| `src/components/rhine/RhineHero.astro` | 首页档案封面 | 统计数字来自构建期内容集合 |
| `src/components/PostCard.astro` | 文章卡片 | `index` 来自分页序号，生成 `X-001` |
| `src/components/Navbar.astro` | 导航 | 已植入徽标与双语标签 |
| `src/components/Footer.astro` | 页脚 | 含同人声明，建议保留 |
| `src/pages/404.astro` | 404 | 档案式空态 |

### 首页封面

`RhineHero` 只出现在第 1 页（`src/pages/[...page].astro`）。想把统计项换成别的：

```astro
<div>
  <span>ENTRIES / 条目</span>
  <b>{pad(posts.length)}</b>
</div>
```

`getSortedPosts / getCategoryList / getTagList` 都来自 `src/utils/content-utils.ts`。

## 4. 换图形素材

- 徽标：替换 `src/components/rhine/RhineMark.astro` 的 path；
- favicon：`public/rhine/favicon.svg` + `siteConfig.favicon`；
- 头像：`public/rhine/avatar.svg` + `profileConfig.avatar`；
- 背景场：`src/styles/rhinelab.css` 第 4 节 `body::before` / `body::after`（纯 CSS 渐变 + SVG mask）。

## 5. 迁移到已有 Fuwari 站点

如果不想整站替换，只复制：

```text
src/styles/rhinelab.css
src/components/rhine/
public/rhine/
```

然后在 `src/layouts/Layout.astro` 顶部加：

```ts
import '../styles/rhinelab.css'
```

样式层通过覆盖 Fuwari 的 CSS 变量与类名生效，不改组件逻辑；删掉这行 import 即完全还原。

> 注意：如果目标站点的 `Layout.astro` 把样式拆在 `src/styles/*`（上游 Fuwari 原版），把 `rhinelab.css` 的引入放在那些样式**之后**，或直接粘贴到全局样式文件末尾。

## 5.3 运行时小组件与降级

主题里有少量「构建后由浏览器补数据」的小组件，全部是渐进增强，禁用 JavaScript 不影响阅读：

| 位置 | 数据源 | 行为 |
| --- | --- | --- |
| 统计页「构建产物构成」 | `/build-info.json` | 渲染 9 类资产条形、TOP FILES、生成时间；失败显示「BUILD-INFO 不可用」 |
| 阅读器页「当前体积」 | `/rss.xml`、`/feed.json`、`/feed-summary.json` | 显示体积 / 条目数 / 语言 / 最近更新；失败显示「不可用」 |
| 站点索引「机器入口」 | 9 个机器端点 | 显示 `200 OK · 体积` 与 `9/9 OK` 汇总，可手动重新检查 |
| 可访问性页「动效偏好」 | `matchMedia` | 显示系统 reduced-motion 偏好，并可手动预览减少动效 |
| 制作说明「LAST BUILD」 | `/build-info.json` | 显示构建时间 / 文件数 / 体积 |

所有请求都带 **8 秒超时**（`AbortController`），失败不会卡在加载态。站点索引的机器状态还支持重试配置：

```html
<section data-retry-count="1" data-retry-delay="700">…</section>
```

- `data-retry-count`：失败后重试次数（默认 1，每次检查重新读取）
- `data-retry-delay`：重试间隔毫秒（默认 700）

若小组件显示「不可用」或一直 `CHECKING…`，按顺序排查：

1. 直接访问对应端点（如 `/build-info.json`、`/rss.xml`）是否能返回 200；
2. 部署是否把 `dist/` 完整上传（尤其 `_astro/`、`pagefind/`、`og/`）；
3. 若站点带鉴权/防盗链，运行时 GET 会被拦截，属预期降级；
4. 8 秒超时对慢网较紧，可在组件脚本里调整 `setTimeout` 值；
5. 机器状态失败会自动重试一次，两次都失败才会标记 UNAVAILABLE。

若站点部署在需要鉴权的环境，这些小组件可能显示不可用，属于预期降级。

## 6. 文章增强组件接线（安装到已有站点）

`theme/install.mjs --with-components` 只会复制组件文件，页面接线需要手动完成。以下以 Fuwari 的文章页 `src/pages/posts/[...slug].astro` 为例。

### 6.1 目录 + 刻度进度轨 + 相关档案

```astro
---
// 1) 拿到 headings（Fuwari 文章页默认已有 render）
const { Content, headings, remarkPluginFrontmatter } = await render(entry)
// 2) 引入组件（安装器已把 @/ 别名改写为相对路径）
import RhineToc from '../../components/rhine/RhineToc.astro'
import RhineProgress from '../../components/rhine/RhineProgress.astro'
import RhineRelated from '../../components/rhine/RhineRelated.astro'
---
<!-- 3) 正文之前放进度轨（只在 >=1440px 显示）与目录 -->
<RhineProgress headings={headings} />
<RhineToc headings={headings} />

<Markdown class="mb-6 markdown-content">
  <Content />
</Markdown>

<!-- 4) 正文之后放相关档案；组件内部会自己取 getSortedPosts() -->
<RhineRelated id={entry.id} category={entry.data.category} tags={entry.data.tags} />
```

### 6.2 系列（SERIES）

需要额外的数据层：

1. `src/content/config.ts` schema 加两个字段：

```ts
series: z.string().optional().default(''),
seriesOrder: z.number().optional().default(0),
```

2. 复制 `src/utils/series-utils.ts` 与 `src/components/rhine/RhineSeries.astro`（安装器不会自动复制这两个文件）；
3. 文章 frontmatter 写 `series: 建站日志`、`seriesOrder: 2`；
4. 在相关档案前插入：

```astro
<RhineSeries posts={await getSortedPosts()} entry={entry} />
```

> 注意：`getSortedPosts()` 会写回 `prevSlug/nextSlug`，上一页/下一页导航依赖它，不要用 `getCollection()` 直接渲染详情页。

### 6.3 打印样式

`rhinelab.css` 末尾自带 `@media print`：打印文章时自动隐藏导航/侧栏/目录/相关档案，改为白底黑字单栏，并把正文中的外部链接展开为 `文字 (URL)`。无需额外配置，直接用浏览器「打印 / 另存为 PDF」即可。

## 7. 常见问题

| 现象 | 原因 / 处理 |
| --- | --- |
| 搜索无结果 | 只跑了 `astro build`；要跑 `pnpm build`（含 pagefind） |
| 首页背景 404 | 开了 `banner.enable` 但 `public/banners/` 为空；关掉即可 |
| 中文显示为宋体 | 系统缺黑体回退；在 `--rl-sans` 补 `Microsoft YaHei / PingFang SC` |
| 卡片 hover 不位移 | 系统开了"减少动态效果"，这是预期行为 |
| 修改 config 后 admin 面板覆盖 | 本项目不含 admin；若接入本地管理端，注意它会整段重建 `config.ts` |
| 构建出现 `markdown.remarkPlugins ... deprecated` 告警 | Astro 6.4 会自动把旧插件配置迁移到内置 processor，功能不受影响；迁移到手动 `unified()` 反而会额外触发 `markdown.gfm/smartypants` 告警（上游行为），因此模板暂保留旧配置 |
| 修改 remark/rehype 插件后字数、阅读时长等 frontmatter 未更新 | Astro 的 content layer 缓存位于 `node_modules/.astro/data-store.json`；改动插件后需删除 `node_modules/.astro` 与 `.astro` 再构建 |
