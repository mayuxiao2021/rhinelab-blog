# 验收记录 · 黯的博客 · Rhine Archive v0.8.0

> 本文件记录最终交付版本的验收命令、实测结果与已知限制，便于接手者复现与核对。
> 版本号以 `package.json` 与 `release/` 下最新 MANIFEST 为准。

## 1. 交付物

| 交付物 | 路径 | 说明 |
| --- | --- | --- |
| 模板站（可独立构建） | 仓库根目录 | Astro 6 + Fuwari 基座，38 个 HTML 页 |
| 主题覆盖层 | `theme/install.mjs` | 安装 / 幂等 / 验证 / 回滚 + selftest |
| 发布包 | `release/rhinelab-blog-v0.5.0.zip` | 326 文件（8643 KB）；MANIFEST 含 sha256 与体积 |
| 文档 | `README.md` + `docs/` | THEMING / DESIGN / ASSETS / DEPLOY / READERS / MILESTONE-100 / 本文件等 |

## 2. 验收命令（按顺序执行）

```bash
pnpm check                     # astro check：0 errors / 0 warnings / 0 hints（89 files）
pnpm verify                    # 18 步门禁（类型、徽章、对比度数据、文档、主题自测、OG、图标、构建、Pagefind、优化、链接、无障碍、无障碍自测、SEO、对比度、Feed、静默 catch、体积预算）
pnpm test:subpath              # BASE_PATH=/rhine-test/ 构建 + 3 门禁 + 恢复默认构建
node scripts/package.mjs       # 生成 zip + MANIFEST
node scripts/verify-release.mjs --full --build   # 清单一致性 + 解压包自测 + 文档门禁 + 解压后 astro build + check-links
```

## 3. 实测结果（v0.8.0 · 莱茵生命细节 + 彩蛋）

- `pnpm verify`：**18/18 通过**；`astro check` 89 files 0/0/0。
- 页面与索引：**49 个 HTML 页**（47 个参与 SEO；第三方静态小游戏页除外）/ 47 唯一标题 / 15 段 JSON-LD / 45 canonical / 47 张 OG / 45 条 sitemap URL / **7 篇文章** / 4 分类 / 16 标签。
- 链接与无障碍：**3034 站内链接 / 309 锚点 / 312 资源** 0 断链；无障碍 **49 页**通过 17 条规则，fixture 自测命中 9 类提示。
- Feed：RSS 2.0 6 items + JSON Feed 1.1 6 items；GUID/id 唯一、绝对地址、自引用与 URL 契约校验通过。
- 体积预算：总产物 **11786 KB / 12800 KB（92%）**、JS 87%、CSS 95%、字体 73%、单页最大 **150.5 KB / 160 KB（94%）**、OG 60%、**79 张 `<img>` 全部带 width/height**。
- 子路径部署：`BASE_PATH=/rhine-test/` 构建 + 断链/SEO/Feed 检查全过，并恢复默认构建。
- 解压包自身可构建：`--build` 下解压 zip → 复用 `node_modules` → `astro build` 通过 → 构建后 `check-links --strict` 通过。
- GitHub Actions：`verify.yml`（18 步 + 子路径 + 打包 + 解压构建）与 `pages.yml`（构建 + Actions 部署）均全绿。
- **博客内容**：7 篇文章（2 篇安全研究长文）、关于页、头像、友链与静态小游戏页面已完整迁移（v0.5.0）。
- **引导与动效**：`/start/` 三风格入口、莱茵启动序列、英雄区入场动画（v0.6.0；尊重 reduced-motion，可跳过）。
- **莱茵生命细节（v0.8.0）**：Portal 与 `/start/` 加入遥测读数、标本标签、跑马灯、SECTOR-03 时钟；全站隐藏 `rhine` 诊断彩蛋。
- **部署拓扑（v0.7.0）**：根域名 `/` = 选择界面 Portal（`mayuxiao2021.github.io` 的 `portal` 分支）；`/rhinelab-blog/` = 博客；`/legacy-blog/` = 旧版 Fuwari 归档（`mayuxiao2021/legacy-blog`）。三处均已线上核验 200。
- **在线演示（GitHub Pages）**：<https://mayuxiao2021.github.io/rhinelab-blog/>（`BASE_PATH=/rhinelab-blog/`；备用域 <https://github.glmyx.eu.org/rhinelab-blog/>）。
- 运行时采样（本机 Chromium，静态服务）：FCP **164ms**、load **320ms**、44 资源 / 255KB、DOM 632 节点。
- 版本沿革：**139 条迭代记录**（Iteration 0–138），每轮至少 1 个修复或创新点，见 `ITERATIONS.md`。

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
