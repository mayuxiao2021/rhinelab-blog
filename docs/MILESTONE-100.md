# 第 100 轮里程碑 · 交付概览

> 版本 **v0.4.1** · 第 **100** 轮迭代 · 更新于 2026-11-19
> 本项目按「每轮至少修复一个严重 bug 或增加一个创新点」的节奏推进，逐轮记录见 [ITERATIONS.md](../ITERATIONS.md)，版本记录见 [CHANGELOG.md](../CHANGELOG.md)。

## 1. 交付物

| 交付物 | 路径 | 说明 |
| --- | --- | --- |
| 模板站点（可独立构建） | 仓库根目录 | Astro 6 + Fuwari，`pnpm install && pnpm build` |
| 主题覆盖层（非破坏安装） | `theme/` | `node theme/install.mjs`，自动备份 / `--restore` 回滚 / `--verify` 校验 |
| 版本化发布包 | `release/rhinelab-blog-v0.4.1.zip` | 含 MANIFEST（sha256 / 体积），`verify-release --full` 校验 |
| 文档 | `README.md`、`docs/` | README / THEMING / DESIGN / ASSETS / DEPLOY / READERS / CONTRIBUTING / ITERATIONS / CHANGELOG / STATE |

## 2. 站点规模

| 指标 | 数值 |
| --- | --- |
| 构建页数（HTML） | 38 |
| 文章 / 分类 / 标签 | 6 / 2 / 12 |
| 搜索索引 | Pagefind（中文分词 + 筛选） |
| 订阅源 | RSS 2.0 / JSON Feed 1.1 / JSON Feed 摘要版 |
| 机器接口 | sitemap-index、robots、stats.json、build-info.json、manifest、opensearch |
| 门禁脚本 | 17 个（含无障碍 fixture 自测、子路径部署自测与静默 catch 门禁） |
| 可访问性规则 | `check-a11y` 17 条 + 全局 reduced-motion 兜底 |
| 文档相对链接 / 有效截图 | 63 条 / 43 张 |
| 产物预算 | 约 6.7 MB / 6.75 MB 上限（97%） |

## 3. 质量门禁（`pnpm verify`）

按顺序：`astro check` → 徽章 → 对比度数据 → 文档一致性 → 主题安装器自测 → OG / 图标 → 构建 → Pagefind → 产物优化 → 链接 → 无障碍 → 无障碍自测 → SEO → 对比度 → Feed → 体积预算。

发布前额外执行：

```bash
pnpm test:subpath          # 子路径（/rhine-test/）构建 + 三门禁 + 恢复默认
node scripts/package.mjs   # 生成 zip + MANIFEST
node scripts/verify-release.mjs <version> --full        # 清单 + 解压包自测 + 文档门禁
node scripts/verify-release.mjs <version> --full --build # 额外验证解压后直接 astro build
```

## 4. 交付检查清单

- [x] 独立构建通过（`astro check` 0 errors / 0 warnings / 0 hints）
- [x] 主题覆盖层安装 / 幂等 / 校验 / 回滚自测通过
- [x] 解压发布包后：主题自测 + 文档一致性通过
- [x] 解压包可直接 `astro build`，构建后链接检查通过（`--build`）
- [x] 站内链接、锚点、sitemap、feed、OG、JSON-LD 全部通过
- [x] 无障碍 17 条规则 + fixture 自测通过
- [x] 亮/暗双主题 32 组对比度通过 WCAG AA
- [x] 体积预算通过（总量 / JS / CSS / 字体 / 单页 / OG）
- [x] 子路径部署验证通过
- [x] 无《明日方舟》官方素材；全部图形为自制 CSS / SVG（见 DESIGN / ASSETS）

## 5. 已知限制

1. **外部阅读器实测**：本环境无公网订阅 URL，feed 兼容性依赖 `check-feed` 的静态预检（脚本清理 / 绝对链接 / MathML 兜底）。
2. **运行时代码**：部署到需要鉴权的环境时，统计/机器状态等运行时小组件会显示不可用（预期降级）。
3. **Pagefind 中文分词**：依赖 Pagefind 1.5.2 默认中文支持，未见异常但未做大规模语料压测。
4. **主题覆盖层**：针对 Fuwari 上游结构做覆盖，若上游大版本改版需按 THEMING 重新核对选择器。

## 6. 里程碑之后

截止时间前继续按轮迭代：优先修可复现的严重问题、补可验证的创新点，并保持每轮「构建 + 浏览器截图 + 发布包校验」全链路可复核。
