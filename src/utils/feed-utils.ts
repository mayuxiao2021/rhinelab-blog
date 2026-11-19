import { render, type CollectionEntry } from 'astro:content'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'
import { url } from '@utils/url-utils'

const parser = new MarkdownIt()

/**
 * 把站内相对链接/图片改成绝对地址：RSS / JSON Feed 阅读器里没有当前站点上下文。
 */
function absolutize(html: string, origin: string): string {
  return html
    .replace(/(href|src)="\/(?!\/)/g, `$1="${origin}/`)
    .replace(/(href|src)='\/(?!\/)/g, `$1='${origin}/`)
}

/**
 * 去掉标题自动锚点（`<a href="#slug"><span>#</span></a>`），
 * 阅读器里这些锚点只会在正文中间显示一个多余的 #。
 */
function stripHeadingAnchors(html: string): string {
  return html
    .replace(/<a [^>]*href="#[^"]*"[^>]*>\s*<span[^>]*>#<\/span>\s*<\/a>/g, '')
    .replace(/<a [^>]*href="#[^"]*"[^>]*>#<\/a>/g, '')
}

const FEED_TAGS = [
  'img',
  'span',
  'math',
  'semantics',
  'annotation',
  'annotation-xml',
  'mrow',
  'mi',
  'mo',
  'mn',
  'ms',
  'mtext',
  'mspace',
  'msup',
  'msub',
  'msubsup',
  'mfrac',
  'msqrt',
  'mroot',
  'mover',
  'munder',
  'munderover',
  'mtable',
  'mtr',
  'mtd',
  'menclose',
  'mstyle',
  'mpadded',
  'mphantom',
  'mmultiscripts',
  'mprescripts',
  'none',
]

export type FeedItem = {
  title: string
  description: string
  /** 绝对 URL */
  link: string
  published: Date
  updated?: Date
  /** 净化后的正文 HTML（绝对链接、无标题锚点） */
  html: string
  tags: string[]
}

/**
 * 把 HTML 压成纯文本（摘要 feed 用），保留段落分隔，长度可控。
 */
export function toPlainText(html: string, maxLength = 1200): string {
  const text = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
}

/**
 * 用 Astro 的渲染结果构建 Feed 条目（与站内正文一致：KaTeX/MathML、表格、代码高亮）。
 * 渲染失败时回退到 markdown-it。
 */
export async function buildFeedItems(
  posts: CollectionEntry<'posts'>[],
  origin: string,
): Promise<FeedItem[]> {
  const container = await AstroContainer.create()
  const items: FeedItem[] = []

  for (const post of posts) {
    let html = ''
    try {
      const { Content } = await render(post)
      html = await container.renderToString(Content)
    } catch {
      html = parser.render(post.body ?? '')
    }

    items.push({
      title: post.data.title,
      description: post.data.description || post.data.title,
      link: new URL(url(`/posts/${post.id.replace(/\/index$/, '')}/`), origin).href,
      published: post.data.published,
      updated: post.data.updated,
      html: sanitizeHtml(stripHeadingAnchors(absolutize(html, origin)), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(FEED_TAGS),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          '*': ['class', 'style', 'aria-hidden', 'title'],
        },
      }),
      tags: post.data.tags ?? [],
    })
  }

  return items
}
