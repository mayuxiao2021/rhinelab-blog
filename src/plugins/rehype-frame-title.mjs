/**
 * 给正文中嵌入的 iframe / video / audio 补可访问属性：
 * - iframe 缺少 title 时补默认标题（屏幕阅读器需要）
 * - 视口外的 iframe 默认懒加载，避免首屏阻塞
 *
 * 只处理 Markdown 渲染出的媒体元素，不影响组件内手写 iframe。
 */
import { visit } from 'unist-util-visit'

export function rehypeFrameTitle(options = {}) {
  const fallbackTitle = options.title ?? '嵌入媒体'
  const labels = {
    iframe: '嵌入页面',
    video: '嵌入视频',
    audio: '嵌入音频',
  }

  return tree => {
    visit(tree, 'element', node => {
      if (!labels[node.tagName]) return
      node.properties = node.properties ?? {}

      if (!node.properties.title) {
        node.properties.title =
          node.tagName === 'iframe' ? fallbackTitle : labels[node.tagName]
      }

      if (node.tagName === 'iframe' && !node.properties.loading) {
        node.properties.loading = 'lazy'
      }
    })
  }
}
