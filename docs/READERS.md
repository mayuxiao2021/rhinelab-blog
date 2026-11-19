# 阅读器兼容 / READER COMPATIBILITY

本站提供三种订阅源，全部在构建期生成、无第三方服务。本文说明它们在常见 RSS / JSON Feed 阅读器中的表现、验证方法与已知限制。

## 1. 订阅源一览

| 订阅源 | 地址 | 内容 | 典型用途 |
| --- | --- | --- | --- |
| RSS 2.0 | `/rss.xml` | 全文 HTML（含 MathML 公式、代码高亮降级、绝对链接） | 最通用的阅读器（Feedly、Inoreader、NetNewsWire、FreshRSS…） |
| JSON Feed 1.1 | `/feed.json` | 全文 HTML，字段同 JSON Feed 规范 | 支持 JSON Feed 的现代阅读器 / 脚本 |
| JSON Feed 摘要版 | `/feed-summary.json` | 标题 + 摘要 + 600 字纯文本（约全文版 28% 体积） | 只想扫一眼更新、移动流量敏感的场景 |

HTML 之外还提供 `<link rel="alternate">` 自动发现（RSS / JSON Feed / 摘要版各一条），大多数阅读器输入站点地址即可自动识别。

## 2. 为阅读器做的处理

构建时会对 feed 正文做以下处理，避免在阅读器中“坏掉”：

- **绝对地址**：站内 `href="/…"`、`src="/…"` 全部改写为带域名的绝对地址；
- **去掉标题锚点**：正文里自动生成的 `#` 锚点链接会移除，避免阅读器中出现孤立 `#`；
- **MathML 兜底**：KaTeX 公式同时保留 `<math>` 结构，不支持 KaTeX CSS 的阅读器仍能显示公式；
- **脚本与嵌入清理**：正文不包含 `<script>` / `<iframe>` / `<object>` / `<embed>` / `<style>`，也没有内联事件处理器；
- **图片可访问**：`<img>` 必须带 `alt`，`src` 必须为绝对地址；
- **实体只转义一次**：不会出现 `&amp;lt;` 这类双重转义；
- **分类与作者**：RSS 每条带 `<category>` 与 `<dc:creator>`，JSON Feed 带 `tags` / `authors`。

以上约束由 `scripts/check-feed.mjs` 在 `pnpm verify` 中静态校验（含 GUID/id 唯一、日期顺序、与 sitemap/stats 数量一致）。

## 3. 常见阅读器建议

| 阅读器 | 推荐订阅源 | 说明 |
| --- | --- | --- |
| Feedly / Inoreader | `/rss.xml` | 全文渲染；公式在支持 MathML 的客户端可见 |
| NetNewsWire / Reeder | `/rss.xml` 或 `/feed.json` | 均可自动发现 |
| FreshRSS / Miniflux（自建） | `/rss.xml` | 可开启全文抓取；无需额外配置 |
| 脚本 / 自动化 | `/feed.json` 或 `/feed-summary.json` | 摘要版字段更小，适合 LLM/通知类消费 |
| 浏览器 | 直接打开任一地址 | 用于人工检查输出 |

## 4. 手动验证

```bash
curl -sI https://你的域名/rss.xml | head -5          # 200 + application/rss+xml
curl -s  https://你的域名/feed.json | head -20        # JSON Feed 1.1
curl -s  https://你的域名/feed-summary.json | head -20
node scripts/check-feed.mjs                           # 本地静态校验（构建后）
```

## 5. 已知限制

- **Mermaid 图表**：需要 JavaScript 渲染，阅读器里会显示为代码块文本（这是静态源的安全降级）；
- **代码高亮**：阅读器不加载 Shiki 样式时退化为等宽纯文本，仍可复制；
- **全文体积**：RSS / JSON 全文约 36KB（6 篇文章），文章增多后建议同时提供摘要版（已内置）；
- **样式**：阅读器会按自己的阅读样式重排正文，本站的纸张底色/栅格不会带入；
- **评论**：默认不嵌入第三方评论系统，feed 中也不会出现评论内容。
