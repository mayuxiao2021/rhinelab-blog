# 验收记录 · Rhine Archive Template v0.4.1

> 本文件记录最终交付版本的验收命令、实测结果与已知限制，便于接手者复现与核对。
> 版本号以 `package.json` 与 `release/` 下最新 MANIFEST 为准。

## 1. 交付物

| 交付物 | 路径 | 说明 |
| --- | --- | --- |
| 模板站（可独立构建） | 仓库根目录 | Astro 6 + Fuwari 基座，38 个 HTML 页 |
| 主题覆盖层 | `theme/install.mjs` | 安装 / 幂等 / 验证 / 回滚 + selftest |
| 发布包 | `release/rhinelab-blog-v<version>.zip` | 236 文件；MANIFEST 含 sha256 与体积 |
| 文档 | `README.md` + `docs/` | THEMING / DESIGN / ASSETS / DEPLOY / READERS / MILESTONE-100 / 本文件等 |

## 2. 验收命令（按顺序执行）

```bash
pnpm check                     # astro check：0 errors / 0 warnings / 0 hints（89 files）
pnpm verify                    # 18 步门禁（类型、徽章、对比度数据、文档、主题自测、OG、图标、构建、Pagefind、优化、链接、无障碍、无障碍自测、SEO、对比度、Feed、静默 catch、体积预算）
pnpm test:subpath              # BASE_PATH=/rhine-test/ 构建 + 3 门禁 + 恢复默认构建
node scripts/package.mjs       # 生成 zip + MANIFEST
node scripts/verify-release.mjs --full --build   # 清单一致性 + 解压包自测 + 文档门禁 + 解压后 astro build + check-links
```

## 3. 实测结果（v0.4.1 · 演示站 + CI）

- `pnpm verify`：**18/18 通过**；`astro check` 89 files 0/0/0。
- 页面与索引：**39 页**（新增 `/operators/` 演示页）/ 39 唯一标题 / 13 段 JSON-LD / 37 canonical / 39 张 OG / 37 条 sitemap URL / 6 篇文章 / 2 分类 / 12 标签。
- 链接与无障碍：2126 站内链接 / 234 锚点 / 254 资源 0 断链；无障碍 39 页通过 17 条规则，fixture 自测命中 9 类提示。
- Feed：RSS 2.0 6 items + JSON Feed 1.1 6 items；GUID/id 唯一、绝对地址、自引用与 URL 契约校验通过。
- 体积预算：总产物 6738 KB / 6912 KB（97%）、JS 85%、CSS 83%、字体 73%、单页最大 107.4 KB / 112 KB、OG 61%、41 张 `<img>` 全部带 width/height。
- 子路径部署：`BASE_PATH=/rhine-test/` 构建 + 断链/SEO/Feed 检查全过，并恢复默认构建。
- 解压包自身可构建：`--build` 下解压 zip → 复用 `node_modules` → `astro build` 通过 → 构建后 `check-links --strict` 通过。
- GitHub Actions：`.github/workflows/verify.yml` 在 Ubuntu 上跑同一套 18 步 + 子路径 + 打包 + 解压构建，连续 3 轮 push/dispatch 全绿，并上传 dist 与 zip artifact。
- 运行时采样（本机 Chromium，静态服务）：FCP **164ms**、load **320ms**、44 资源 / 255KB、DOM 632 节点。
- 版本沿革：**133 条迭代记录**（Iteration 0–132），每轮至少 1 个修复或创新点，见 `ITERATIONS.md`。

## 4. 已知限制

1. **外部阅读器实测**：Feedly / Inoreader / NetNewsWire 等真实订阅测试受网络环境限制未做；feed 结构、GUID、日期、语言、自引用、URL 契约均由 `check-feed` 覆盖。
2. **发布包构建前置**：解压后需 `pnpm install`（或复用本机 `node_modules`）才能构建；`verify-release --build` 即复用本机依赖验证。
3. **预算余量**：总预算约 3%、单页 HTML 约 6%，新增内容需关注 `check-budget`。
4. **主题覆盖层范围**：`install.mjs` 默认安装 CSS + 品牌素材；完整首页/组件需 `--with-components` 或直接使用整站模板。
5. **版权边界**：模板核心图形均为自制 CSS/SVG；演示站额外包含 8 位干员的公开立绘（Aceship/Arknight-Images，版权归鹰角网络，仅非商业演示）。商用/再分发前请删除 `public/rhine/art/` 与 `/operators/` 页面，详见 `docs/ASSETS.md` 3.1。

## 5. 复现提示

- 本机 `node_modules` 为指向 `..\blog_astro\node_modules` 的 junction（离线复用）；干净机器直接 `pnpm install`。
- 修改 remark/rehype 插件后若内容不更新，删除 `.astro/` 与 `node_modules/.astro/` 缓存再构建（见 `docs/THEMING.md` FAQ）。
- 截图与发布包不随仓库提交（`.shots/`、`release/`），以 `pnpm build` + `node scripts/package.mjs` 重新生成。
