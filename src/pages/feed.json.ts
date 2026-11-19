import type { APIRoute } from 'astro'
import packageJson from '../../package.json'
import { siteConfig, profileConfig } from '@/config'
import { getSortedPosts } from '@utils/content-utils'
import { buildFeedItems } from '@utils/feed-utils'
import { url } from '@utils/url-utils'

/**
 * JSON Feed 1.1：现代阅读器/自动化工具可直接消费的 JSON 格式全文订阅。
 */
export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://example.com')).origin
  const posts = await getSortedPosts()
  const items = await buildFeedItems(posts, origin)

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: siteConfig.title,
    home_page_url: new URL(url('/'), origin).href,
    feed_url: new URL(url('/feed.json'), origin).href,
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
    },
    items: items.map(item => ({
      id: item.link,
      url: item.link,
      title: item.title,
      summary: item.description,
      content_html: item.html,
      date_published: item.published.toISOString(),
      ...(item.updated ? { date_modified: item.updated.toISOString() } : {}),
      tags: item.tags,
    })),
  }

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  })
}
