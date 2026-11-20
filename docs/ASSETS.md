# 素材与许可清单

本主题的发布边界：**代码开放，图形自制，不打包任何游戏素材。**

## 1. 自制素材（随代码以 MIT 提供）

| 文件 | 内容 | 制作方式 |
| --- | --- | --- |
| `public/rhine/mark.svg` | 站点徽标（扫描环 + 双折线 + 刻度） | 手写 SVG，原创几何 |
| `public/rhine/favicon.svg` | 32–64px 图标 | 同上 |
| `public/rhine/avatar.svg` | 抽象观测者头像（无面部特征、不指向任何角色） | 手写 SVG，原创 |
| `src/styles/rhinelab.css` 内联 SVG | 背景准星阵列、封面扫描环水印、代码块装饰 | 手写 SVG data URI |
| `public/rhine/ui.js`、`public/rhine/fx.js` | 快捷键、复制增强、诊断终端、双螺旋/显微透镜/收容失效演习/审阅印章交互脚本 | 原创 vanilla JS |
| `src/components/rhine/*.astro` | 徽标组件、首页封面 | 原创代码 |

> 这些图形只借鉴"档案/仪器"的通用视觉语言（圆环、刻度、细线、方点），**不复制**任何官方徽标、角色或宣传图。

## 2. 开源依赖（保留声明）

| 依赖 | 版本 | 许可 | 说明 |
| --- | --- | --- | --- |
| [Fuwari](https://github.com/saicaca/fuwari) | v0.0.1 衍生 | MIT | 主题基座；本仓库保留其 LICENSE 与署名 |
| [Astro](https://astro.build) | ^6.4.8 | MIT | 框架 |
| [Tailwind CSS](https://tailwindcss.com) | ^3.4.7 | MIT | 原子化样式 |
| [Svelte](https://svelte.dev) | ^5.56.8 | MIT | 交互组件 |
| [Pagefind](https://pagefind.app) | ^1.5.2 | MIT | 全文检索 |
| [Swup](https://swup.js.org) | ^1.4.1 | MIT | 页面过渡 |
| [KaTeX](https://katex.org) | ^0.18.1 | MIT | 数学公式 |
| [Mermaid](https://mermaid.js.org) | ^11.16.1 | MIT | 图表 |
| [PhotoSwipe](https://photoswipe.com) | ^5.4.4 | MIT | 图片灯箱 |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | ^5.0.21（fontsource） | **OFL-1.1** | 编号 / 微标签 / 终端文本 |
| [Roboto](https://fonts.google.com/specimen/Roboto) | ^5.0.13（fontsource） | **Apache-2.0** | 拉丁正文 |
| [Material Symbols](https://fonts.google.com/icons) | iconify 数据包 | **Apache-2.0** | UI 图标（构建期内联） |
| [Font Awesome Free](https://fontawesome.com/license/free) | iconify 数据包 | 图标 **CC-BY-4.0** / 字体 OFL / 代码 MIT | 品牌与少量实心图标（GitHub、RSS 等），按 CC-BY 要求署名 |

### 2.1 其余构建期依赖与工具链

许可信息均取自本机 `node_modules/<pkg>/package.json` 的实际元数据（2026-11 核对）：

| 依赖 | 许可 | 用途 |
| --- | --- | --- |
| [Shiki](https://shiki.style) | MIT | 代码高亮（随 Astro） |
| [markdown-it](https://github.com/markdown-it/markdown-it) | MIT | RSS 兜底渲染 |
| [sanitize-html](https://github.com/apostrophecms/sanitize-html) | MIT | RSS/内容净化 |
| [sharp](https://sharp.pixelplumbing.com) | Apache-2.0 | OG 图与应用图标栅格化 |
| [astro-icon](https://github.com/natemoo-re/astro-icon) + [Iconify](https://iconify.design) | MIT（代码） | 图标内联；图标集许可见上表 |
| [OverlayScrollbars](https://kingsora.github.io/OverlayScrollbars/) | MIT | 滚动条（Fuwari 基座） |
| [astro-compress](https://github.com/PlayForm/Compress) | 见其 LICENSE（MIT 系） | HTML/CSS/图片压缩 |
| [@astrojs/rss](https://docs.astro.build/en/guides/rss/) / [sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) / [svelte](https://docs.astro.build/en/guides/integrations-guide/svelte/) / [tailwind](https://docs.astro.build/en/guides/integrations-guide/tailwind/) | MIT | 官方集成 |
| [@swup/astro](https://github.com/swup/astro) | MIT | Swup 集成 |
| [remark-math](https://github.com/remarkjs/remark-math) / [rehype-katex](https://github.com/remarkjs/remark-math) | MIT | 数学公式管线 |
| [remark-directive](https://github.com/remarkjs/remark-directive) / [remark-directive-rehype](https://github.com/ezzatron/remark-directive-rehype) | MIT / Unlicense | 指令语法（admonition / github 卡片） |
| [rehype-slug](https://github.com/rehypejs/rehype-slug) / [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings) | MIT | 标题锚点 |
| [reading-time](https://github.com/ngryman/reading-time) | MIT | 已从依赖中移除（v0.2.42，自研 CJK 计数，锁文件手术同步） |
| [@fontsource](https://fontsource.org) 打包器 | MIT（字体本身许可见上表） | 字体 CSS 分发 |
| [@astrojs/partytown](https://docs.astro.build/en/guides/integrations-guide/partytown/) | MIT | 已从依赖中移除（v0.2.20，锁文件同步） |

> 所有依赖均为构建期或运行时开源许可；**不包含**任何《明日方舟》官方图像、字体、音频或文本素材。

中文不打包字体文件，使用系统字体栈（PingFang SC / Microsoft YaHei / Noto Sans SC 等），避免数 MB 的自托管 CJK 字体。

应用图标 `public/icons/icon-{180,192,512}.png` 由 `scripts/generate-icons.mjs` 从自制 `public/rhine/favicon.svg` 栅格化生成（sharp，Apache-2.0），不是外部素材。

发布产物只保留 `woff2`：构建后的 `scripts/optimize-dist.mjs` 会删除 KaTeX 等 CSS 中 `.woff` / `.ttf` 旧格式 fallback 与文件（现代浏览器均支持 woff2），并移除未使用的 Pagefind 自带 UI 资源。

## 3. 明确不包含的内容（模板核心）

| 内容 | 权利方 | 说明 |
| --- | --- | --- |
| 《明日方舟》官方徽标、PV 截图、3D 模型 | 鹰角网络 / 画师 | 未包含，也不建议用户自行打包进公开仓库 |
| 游戏内字体（如商业字族） | 各字体厂商 | 未包含；主题使用 OFL/Apache 字体 |
| 游戏音频 / BGM / UI 音效 | 鹰角网络 / 塞壬唱片 | 未包含；如需音效建议 WebAudio 实时合成 |
| 第三方同人图 / 模型 | 各作者 | 模板核心未包含；演示站仅使用下述公开立绘（非商业） |

## 3.1 演示站立绘素材（非商业同人演示）

v0.4.0–v0.9.0 的演示站（首页 + `/operators/` + 全局仪表面板）额外包含以下 17 个非商业素材文件（8 位干员 × 立绘/档案图 + 阵营徽记遮罩），
全部来自公开素材归档 [Aceship/Arknight-Images](https://github.com/Aceship/Arknight-Images) 与 PRTS Wiki：

| 文件 | 干员 | 来源 | 权利方 | 使用范围 |
| --- | --- | --- | --- | --- |
| `art-*.webp`（8 张，1400px 内） | 塞雷娅 / 赫默 / 伊芙利特 / 白面鸮 / 梅尔 / 麦哲伦 / 多萝西 / 缪尔赛思 | `characters/<id>_2.png` | 鹰角网络（Hypergryph） | 仅非商业同人演示 |
| `card-*.webp`（8 张，700px） | 同上 | `characters/<id>_1.png` | 鹰角网络（Hypergryph） | 仅非商业同人演示 |
| `rhine-mark.png`（453×257 RGBA） | 莱茵生命阵营徽记（白底透明遮罩） | PRTS Wiki `Logo_莱茵生命.png` | 鹰角网络（Hypergryph） | 仅非商业同人演示 |

说明：

- 这些文件**不属于**本项目的 MIT 代码许可；版权与角色相关权利归鹰角网络所有，本站为**非官方、非营利**同人演示，不构成授权或合作。
- 若你要商用、公开发布模板或二次分发，请**删除 / 回退**：
  1. `public/rhine/art/`（17 个演示素材）；
  2. `src/data/operators.ts`、`src/pages/operators.astro`；
  3. `src/config.ts` 中导航「研究员」入口；
  4. `src/pages/[...page].astro` 中 `rl-org` / `rl-field` / `rl-teaser` / `rl-banner` 四段演示区块；
  5. `src/components/rhine/RhineHero.astro` 中的 `rhine-hero__art` 立绘组合（可保留其余标题/数据条）。
  替换为拥有授权的素材，并保留同人声明。
- 素材经本机脚本压缩为 WebP（长边 1400 / 700，质量 0.72–0.8），未做二次描摹或修改人物形象。

## 3.2 作者博客内容与第三方静态页

**文章与关于内容**

- `src/content/posts/**`（7 篇）与 `src/content/spec/about.md` 由博主「黯」创作，版权归作者所有，以 **CC BY-NC-SA 4.0** 发布（与站点许可一致），不属于 MIT 代码许可。
- 文中代码片段、命令与截图均为作者原创或已脱敏；安全研究文章仅用于授权测试与技术学习。

**头像与图片**

- `src/assets/images/demo-avatar.png`：作者博客头像（原站素材，来源见关于页「Sources of images」：Unsplash、星と少女 by Stella、Rabbit by Rabbit_YourMajesty）。
- `public/gallery/*`：项目索引预览图，随站点一起托管。
- `public/banners/`、`public/favicon/`：作者原博客静态资源。

**友链静态小游戏**

- `public/EatKun-main/`、`public/EatKano-main/`、`public/jump play/`：来自开源项目 [EatKano](https://github.com/arcxingye/EatKano) / [EatKun](https://github.com/fangkuai767/EatKun) 的静态页面，作为友链「吃掉明卓 / 明卓跑酷」托管；许可见上游仓库，本项目仅补充了无障碍属性（`lang`、`alt`、`h1`），未修改游戏逻辑。
- 若你要复用本模板，请删除上述目录并同步修改 `src/config.ts` 的 `FRIENDLY_LINKS`。

## 4. 同人使用声明


「莱茵生命」「明日方舟」等名称与相关设定的权利归鹰角网络（Hypergryph）所有。

本项目是**非官方、非营利的同人风格主题**，与鹰角网络无隶属或合作关系。除 3.1 节列出的演示立绘外，仓库内图形均为原创几何绘制，仅表达"档案 / 仪器 / 实验室"的通用气质；若你二次分发或商用，请自行确认当地法律与权利人政策，并保留本声明与页脚的同人声明。

参考（公开政策，链接可能变动）：

- 鹰角网络 游戏使用许可及服务协议
- 《明日方舟》二次创作相关指引（各区域发行方页面）

## 5. 替换清单（发布前自检）

- [ ] `src/config.ts` 中作者、GitHub、友链均为自己的信息
- [ ] `astro.config.mjs` 的 `site` 为自己的域名
- [ ] `public/rhine/*.svg` 为自制或已获授权图形
- [ ] 页脚保留同人声明（或替换为等效声明）
- [ ] 未提交任何官方截图 / 立绘 / 音频（演示站默认包含 3.1 节立绘；商用/再分发前必须删除 `public/rhine/art/` 与 `/operators/` 页面）
