import type { APIRoute } from 'astro'
import packageJson from '../../package.json'
import { siteConfig, profileConfig } from '@/config'
import { getSortedPosts } from '@utils/content-utils'
import { buildFeedItems, toPlainText } from '@utils/feed-utils'
import { url } from '@utils/url-utils'

/**
 * 摘要版 JSON Feed 1.1：只带标题 + 摘要 + 截断纯文本，体积约全文 feed 的 1/6。
 * 适合只想要「有什么新东西」的阅读器 / 脚本。
 */
export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://example.com')).origin
  const posts = await getSortedPosts()
  const items = await buildFeedItems(posts, origin)

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: `${siteConfig.title} · 摘要`,
    home_page_url: new URL(url('/'), origin).href,
    feed_url: new URL(url('/feed-summary.json'), origin).href,
    description: siteConfig.subtitle || siteConfig.title,
    language: siteConfig.lang.replace('_', '-'),
    favicon: new URL(url('/icons/icon-192.png'), origin).href,
    icon: new URL(url('/icons/icon-512.png'), origin).href,
    authors: [{ name: profileConfig.name, url: new URL(url('/'), origin).href }],
    _site: {
      name: siteConfig.title,
      url: new URL(url('/'), origin).href,
      generator: 'rhinelab-blog',
      build: String(packageJson.version),
      variant: 'summary',
    },
    items: items.map(item => ({
      id: item.link,
      url: item.link,
      title: item.title,
      summary: item.description,
      content_text: toPlainText(item.html, 600),
      date_published: item.published.toISOString(),
      ...(item.updated ? { date_modified: item.updated.toISOString() } : {}),
      tags: item.tags,
    })),
  }

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  })
}
