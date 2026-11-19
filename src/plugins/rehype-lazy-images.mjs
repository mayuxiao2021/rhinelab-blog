/**
 * 给 Markdown 正文图片补 loading="lazy" decoding="async"（首屏之外更省流量）。
 * 已显式声明 loading/decoding 的图片不覆盖。
 */
import { visit } from 'unist-util-visit'

export function rehypeLazyImages() {
  return tree => {
    visit(tree, 'element', node => {
      if (node.tagName !== 'img') return
      const properties = node.properties ?? (node.properties = {})
      if (properties.loading === undefined) properties.loading = 'lazy'
      if (properties.decoding === undefined) properties.decoding = 'async'
    })
  }
}
