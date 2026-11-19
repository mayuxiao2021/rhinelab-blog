import { siteConfig, profileConfig } from '@/config'
import rss from '@astrojs/rss'
import { getSortedPosts } from '@utils/content-utils.ts'
import { url } from '@utils/url-utils'
import { buildFeedItems } from '@utils/feed-utils'

// biome-ignore lint/suspicious/noExplicitAny: Astro endpoint context
export async function GET(context: any) {
  const blog = await getSortedPosts()
  const site: URL = context.site ?? new URL('https://example.com')
  const origin = site.origin
  const items = await buildFeedItems(blog, origin)
  const latest = items.reduce(
    (max, item) => Math.max(max, (item.updated ?? item.published).valueOf()),
    0,
  )

  const feedUrl = new URL(url('/rss.xml'), origin).href

  const logoUrl = new URL(url('/icons/icon-192.png'), origin).href
  const escapeXml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return rss({
    title: siteConfig.title,
    description: siteConfig.subtitle || 'No description',
    site: new URL(url('/'), origin).href,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
      dc: 'http://purl.org/dc/elements/1.1/',
    },
    items: items.map(item => ({
      title: item.title,
      pubDate: item.published,
      description: item.description,
      link: item.link,
      content: item.html,
      categories: item.tags,
      customData: `<dc:creator>${profileConfig.name}</dc:creator>`,
    })),
    customData: `<language>${siteConfig.lang.replace('_', '-')}</language>` +
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>` +
      (latest > 0 ? `<lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>` : '') +
      `<image><url>${logoUrl}</url><title>${escapeXml(siteConfig.title)}</title>` +
      `<link>${new URL(url('/'), origin).href}</link><width>192</width><height>192</height></image>`,
  })
}
