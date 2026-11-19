# 主题包 · Theme Pack

把「莱茵档案」的视觉层装进**任意同版本 Fuwari / Astro 博客**，不替换组件逻辑，可一键回滚。

## 它包含什么

```text
theme/install.mjs                  # 安装 / 预演 / 回滚（零依赖 Node 脚本）
../src/styles/rhinelab.css         # ★ 设计令牌 + 全部视觉规则（可移植主体）
../src/components/rhine/*.astro    # 徽标、首页封面（可选组件）
../public/rhine/*.svg              # 徽标 / favicon / 头像（自制素材）
```

## 用法

```bash
# 1. 预演：只打印计划，不写文件
node theme/install.mjs --target ../my-blog --dry-run

# 2. 安装（标准：CSS + 品牌素材）
node theme/install.mjs --target ../my-blog

# 3. 只装 CSS 覆盖层（最轻量）
node theme/install.mjs --target ../my-blog --minimal

# 4. 回滚最近一次安装
node theme/install.mjs --target ../my-blog --rollback

# 5. 只看计划 / 只验证安装状态（都不写盘）
node theme/install.mjs --target ../my-blog --list
node theme/install.mjs --target ../my-blog --verify

# 6. 安装器自测（隔离临时目录，不碰真实站点）
node theme/selftest.mjs
```

## 安装器做了什么

| 动作 | 说明 |
| --- | --- |
| 复制 `rhinelab.css` | 到目标的 `src/styles/rhinelab.css` |
| 复制品牌素材 | `public/rhine/*.svg`（`--minimal` 跳过） |
| 复制主题组件 | `--with-components` 时复制 **7 个组件**（徽标 / 首页封面 / 目录 / 刻度进度轨 / 相关档案 / 分享条 / 代码复制）与**系列工具** `src/utils/series-utils.ts`，并把 `@/`、`@utils/` 等别名**自动改写为相对路径**，无需目标站配置 tsconfig paths |
| 注入 import | 在 `src/layouts/Layout.astro` 的 frontmatter import 末尾插入带标记的 `import '../styles/rhinelab.css'` |
| 备份 | 每个被修改/新建的文件都先记录到 `<target>/.rhine-backup/<时间戳>/` |
| 幂等 | 已注入过会跳过；文件内容相同会跳过 |
| 只读模式零写入 | `--dry-run` / `--list` / `--verify` 不会创建 `.rhine-backup/`（备份目录延迟到真正写入时才创建） |
| 自检 | 安装结束自动检查 CSS / Layout 注入 / 组件是否齐全；`--verify` 可单独复查 |

## 安全边界

- **不修改** `package.json`、`astro.config.*`、`src/config.ts`、任何组件逻辑；
- **不安装依赖**、不联网；
- 目标不像 Fuwari/Astro 博客时拒绝执行（除非 `--force`）；
- 任何时刻都可以 `--rollback` 恢复到安装前。

## 样式层的生效原理

`rhinelab.css` 不碰组件，只做两件事：

1. 用 `html:root:root` 覆盖 Fuwari 的 CSS 变量（`--primary`、`--card-bg`、`--radius-large` 等），并把它们映射到 `--rl-*` 令牌；
2. 用未分层（unlayered）选择器覆盖 `@layer components` 里的 `.card-base` / `.btn-*` / `#navbar` 等视觉规则。

因此样式层**先于/后于** Fuwari 样式加载都可以工作；想撤掉时删掉注入块与 CSS 文件即可。

## 已知限制

- 首页「档案封面」、`X-001` 编号、目录 / 刻度进度轨 / 相关档案需要模板里的页面接线（`render()` 的 `headings`、文章页插入组件等）；只装样式层时这些不会出现，但配色、排版、卡片、导航、正文样式会生效。
- `--with-components` 只负责复制与改写组件文件；页面接线仍需按 `docs/THEMING.md` 手动完成。
- 系列（SERIES）属于整站模板能力：需要 `series` / `seriesOrder` 内容字段、`src/utils/series-utils.ts` 与文章页接线，安装器不自动复制，可直接参考整站模板。
- 若目标站点深度定制了 `GlobalStyles.astro` / `Layout.astro` 结构，注入点可能不同——安装器会在找不到 frontmatter 时报错而不是猜测。
- 暗色模式下如果目标站点使用 `:root.dark` 重新声明 Fuwari 变量，样式层用更高特异性（`html:root:root`）仍然生效；若目标自己又用了 `html:root:root` 同款写法，需要手动合并令牌。

## 完整换肤

想要 100% 效果（含首页封面、编号、进度轨、404）：

- 直接把本仓库作为站点起点（推荐），或
- 参考 `docs/THEMING.md` 手动替换 5 个展示组件 + 2 个页面。
