# 根域名入口（Portal）源码

这是 **https://github.glmyx.eu.org/** 根域名选择界面的可编辑源码（自包含单页，无构建步骤）。

## 重要：它不是由本仓库部署的

根域名的 Pages 来自用户站仓库 `mayuxiao2021/mayuxiao2021.github.io` 的 **`portal` 分支**（Pages 源已设为该分支、`build_type: legacy`）。
本目录只是同一份源码的版本化镜像，方便在博客仓库里追溯和交接。

## 修改与发布流程

1. 修改 `portal/index.html`
2. 复制到用户站仓库并推送 `portal` 分支：

```bash
git clone git@github.com:mayuxiao2021/mayuxiao2021.github.io.git
cd mayuxiao2021.github.io
git checkout portal
cp /path/to/rhinelab-blog/portal/index.html ./index.html
git commit -am "portal: update"
git push
```

3. 等待 GitHub Pages 构建（`GET /repos/mayuxiao2021/mayuxiao2021.github.io/pages/builds/latest`，状态 `built` 即完成）。
   若 Pages 源/自定义域丢失，见 `docs/AI-HANDOFF.md` 的「部署 Runbook」。

## 约定

- 全部链接使用根相对路径（`/rhinelab-blog/...`、`/legacy-blog/`），保证自定义域与 `mayuxiao2021.github.io` 两个域名都可用；
- 启动动画开关与博客共用 `localStorage['rhine-boot-enabled']`；
- 主题键为 `localStorage['rhine-theme']`（博客本体 Fuwari 用的是 `theme`，暂未统一）；
- 页脚/彩蛋提示：输入 `rhine` 触发诊断浮层；
- 改动后至少验证亮/暗两套、390px 移动端和 4 个跳转目标。
