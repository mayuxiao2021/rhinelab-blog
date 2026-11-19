/**
 * 给正文里的站外链接自动加 target="_blank" + rel="noopener noreferrer" + 图标 class。
 *
 * 只处理 Markdown 渲染出的 `<a>`（rehype 阶段），不影响导航/页脚等手写链接。
 * 站内链接以 origin 判断，保持同标签页跳转。
 */
import { visit } from 'unist-util-visit'

export function rehypeExternalLinks(options = {}) {
  const origin = options.origin ?? ''
  const originPrefix = origin ? `${origin.replace(/\/$/, '')}/` : ''

  return tree => {
    visit(tree, 'element', node => {
      if (node.tagName !== 'a') return
      const href = node.properties?.href
      if (typeof href !== 'string') return
      if (!/^https?:\/\//i.test(href)) return
      if (originPrefix && (href === originPrefix.slice(0, -1) || href.startsWith(originPrefix))) return

      node.properties = {
        ...node.properties,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: [...(node.properties.className ?? []), 'rl-external-link'],
      }
    })
  }
}
