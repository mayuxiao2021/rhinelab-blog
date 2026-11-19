import type { AstroIntegration } from '@swup/astro'

declare global {
  interface Window {
    // type from '@swup/astro' is incorrect
    swup: AstroIntegration
    // Layout.astro 注入的背景图列表
    __BANNERS__?: string[]
    // 目录滚动高亮的清理函数（Swup 换页时释放监听）
    __rlTocCleanup?: () => void
  }
}
