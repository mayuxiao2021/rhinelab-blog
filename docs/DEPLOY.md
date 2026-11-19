# 部署指南 · Deploy

> 本站是纯静态输出（`dist/`），可部署到任何静态托管。构建前先改 `astro.config.mjs` 里的 `site`（必填，用于 canonical / RSS / sitemap / OG）。

## 0. 构建前检查

```bash
node -v        # >= 22.12（package.json engines）
pnpm install --frozen-lockfile
# 改 astro.config.mjs：
#   site: 'https://your-domain.com'
#   base: '/'            # 部署在子路径时改成 '/repo-name/'
pnpm build     # 生成 OG 图 → astro build → pagefind 索引 → 产物优化
```

`pnpm build` 会依次执行：

1. `scripts/generate-og.mjs`：生成 `public/og/*.png`（需要中文字体，Windows/macOS 自带，Linux 装 Noto Sans CJK）；
2. `astro build`；
3. `pagefind --site dist`：生成搜索索引；
4. `scripts/optimize-dist.mjs`：删旧格式字体与未使用 Pagefind UI 资源（约 1.2 MB）。

可选用 `pnpm verify` 完整验收（类型检查 → 安装器自测 → OG → 构建 → 索引 → 链接检查 → 体积预算）。

## 1. GitHub Pages（含子路径）

仓库 → Settings → Pages → Source 选 **GitHub Actions**，新建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**部署在 `https://<user>.github.io/<repo>/` 时**：

```js
// astro.config.mjs
site: 'https://<user>.github.io/<repo>',
base: '/<repo>/',
```

canonical / OG 图 / RSS 条目链接 / sitemap 都会自动带上 `/<repo>/`（v0.2.9 起已验证）。字体与 Pagefind 资源同样走 `BASE_URL`。

> 仓库根目录若已有 `admin/`、`run.bat` 等本地文件，建议发布前用 `pnpm package`（本仓库脚本）或 `.gitignore` 排除，避免 `dist/` 混入无关文件。

## 2. Cloudflare Pages / Netlify / Vercel

| 平台 | 构建命令 | 输出目录 | Node |
| --- | --- | --- | --- |
| Cloudflare Pages | `pnpm install --frozen-lockfile && pnpm build` | `dist` | 22 |
| Netlify | `pnpm build` | `dist` | 22（`NODE_VERSION=22`） |
| Vercel | `pnpm build` | `dist`（Framework: Astro 可自动识别） | 22 |

根域名部署时 `base: '/'` 即可；平台若把站点挂在子路径（少见），同样设置 `base`。

## 3. 自托管（Nginx / Caddy）

### Nginx（根路径）

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/rhine/dist;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    error_page 404 /404.html;
    location = /404.html { internal; }

    # 带 hash 的构建资源可以长缓存
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /pagefind/ { expires 7d; }
    location /og/ { expires 30d; }
}
```

### Caddy

```caddy
example.com {
    root * /var/www/rhine/dist
    encode zstd gzip
    try_files {path} {path}/ {path}.html {path}/index.html
    file_server
    handle_errors {
        rewrite * /404.html
        file_server
    }
    header /_astro/* Cache-Control "public, max-age=31536000, immutable"
}
```

### 子路径（`/blog/`）

```nginx
location /blog/ {
    alias /var/www/rhine/dist/;
    try_files $uri $uri/ $uri.html /blog/404.html;
}
```

> 注意 `alias` 结尾的 `/` 与 `try_files` 路径；同时 `astro.config.mjs` 的 `base` 必须是 `/blog/`。

## 4. 子路径部署检查清单

`base` 不是 `/` 时，构建后逐项确认（把 `<base>` 换成你的路径）：

- [ ] 页面 `<link rel="canonical">` 以 `<base>` 开头；
- [ ] `og:image` 指向 `<base>/og/<slug>.png`，且 `dist/og/` 里存在对应文件；
- [ ] `dist/rss.xml` 的 `<link>` 与 `<guid>` 为绝对地址且含 `<base>`；
- [ ] `dist/sitemap-0.xml` 的 `<loc>` 含 `<base>`；
- [ ] 浏览器打开任意文章，搜索一次（Pagefind 索引路径走 `BASE_URL`）；
- [ ] 打开 `/404.html`（多数静态托管默认回退到它）。

## 4.1 订阅与搜索的对外声明

构建产物已包含完整的“被发现”入口，无需额外配置：

| 入口 | 产物 | 说明 |
| --- | --- | --- |
| RSS 2.0 | `/rss.xml` | 全文（含 MathML/KaTeX），channel 带 `lastBuildDate` |
| JSON Feed 1.1 | `/feed.json` | 全文 + `date_modified`，`rel=alternate type=application/feed+json` |
| JSON Feed 摘要版 | `/feed-summary.json` | 标题 / 摘要 / 截断纯文本（约 600 字/条），文件体积约为全文版 28%（约 10KB vs 36KB） |
| OpenSearch | `/opensearch.xml` | 浏览器可添加本站为搜索引擎，走站内 `?q=` |
| 结构化数据 | 首页 `WebSite + SearchAction` | `?q={search_term_string}`，配合站内检索 |
| Sitemap | `/sitemap-index.xml` | `robots.txt` 已声明 |
| 人类可读索引 | `/sitemap/` | 页面/文章/分类/标签/机器入口汇总 |
| 机器统计 | `/stats.json` | 计数、分类、标签与文章明细（自动化友好） |
| 构建指纹 | `/build-info.json` | 版本、迭代数、构建时间（部署后确认线上版本） |

## 4.2 子路径部署（/blog/ 等）

`astro.config.mjs` 支持两个环境变量，默认根路径部署无需设置：

```bash
# 部署到 https://example.com/blog/
SITE_URL=https://example.com BASE_PATH=/blog/ pnpm build
```

构建后的 canonical、sitemap、RSS/JSON Feed、静态资源 URL 都会带 `/blog/` 前缀；把 `dist/` 放到该子路径即可。
本地校验静态门禁时也让脚本知道 base：

```bash
BASE_PATH=/blog/ node scripts/check-links.mjs --strict
BASE_PATH=/blog/ node scripts/check-seo.mjs
```

> 主题安装器覆盖到已有 Fuwari 站点时，如果目标站点也用子路径，请同样设置 `BASE_PATH`，`url()` 工具会自动拼前缀。

## 5. 常见问题

| 现象 | 原因 / 处理 |
| --- | --- |
| 页面能开但资源 404 | `base` 与实际访问路径不一致；`site` 多写/少写尾斜杠不影响，但 `base` 必须以 `/` 开头结尾 |
| 搜索框无结果 | 没执行 `pagefind --site dist`；请用 `pnpm build` 而不是只跑 `astro build` |
| OG 图 404 | 构建时跳过了 `scripts/generate-og.mjs`（如用了 `astro build` 直出）；OG 图在 `dist/og/` |
| OG 图中文变方框 | 构建机缺中文字体：Linux 安装 `fonts-noto-cjk` |
| RSS 里链接是 `example.com` | `astro.config.mjs` 的 `site` 未改 |
| 404 页面没有样式 | 静态托管需把 `404.html` 配为错误页；GitHub Pages / Netlify / Cloudflare 默认支持 |
| 站点部署在 /repo/ 但 `/repo/` 打不开首页 | 需要 `dist/index.html` 在仓库根（GitHub Pages Actions 会处理）；或设置 redirect |

## 发布包强校验（解压后可直接构建）

```bash
node scripts/package.mjs
node scripts/verify-release.mjs <version> --full --build
```

- `--full`：MANIFEST 逐项（sha256 / 体积 / 文件列表）、必需文件、解压包主题自测与文档门禁
- `--build`：解压后用本机 `node_modules`（junction / symlink）跑一次 `astro build`，并执行 `check-links --strict`，证明「zip 解压即可构建」而不是只有仓库内可构建

注意：`--build` 复用本机 `node_modules`；在干净机器上需先 `pnpm install`。
