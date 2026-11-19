import type { APIRoute } from 'astro'
import packageJson from '../../package.json'
import { render } from 'astro:content'
import { getCategoryList, getSortedPosts, getTagList } from '@utils/content-utils'
import { getPostUrlBySlug, url } from '@utils/url-utils'

/**
 * 机器可读统计：给模板使用者/自动化脚本一个轻量 JSON 接口。
 */
export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://example.com')).origin
  const posts = await getSortedPosts()
  const categories = await getCategoryList()
  const tags = await getTagList()

  const entries = []
  for (const post of posts) {
    const { remarkPluginFrontmatter } = await render(post)
    entries.push({
      title: post.data.title,
      url: new URL(getPostUrlBySlug(post.id.replace(/\/index$/, '')), origin).href,
      published: post.data.published.toISOString(),
      updated: post.data.updated?.toISOString() ?? null,
      category: post.data.category || '未分类',
      tags: post.data.tags ?? [],
      words: Number(remarkPluginFrontmatter.words ?? 0),
      chars: Number(remarkPluginFrontmatter.chars ?? 0),
      minutes: Number(remarkPluginFrontmatter.minutes ?? 0),
    })
  }

  const byYear = new Map<number, { count: number; words: number; minutes: number }>()
  for (const entry of entries) {
    const year = new Date(entry.published).getFullYear()
    const agg = byYear.get(year) ?? { count: 0, words: 0, minutes: 0 }
    agg.count += 1
    agg.words += entry.words
    agg.minutes += entry.minutes
    byYear.set(year, agg)
  }

  const body = {
    generated_at: new Date().toISOString(),
    build: String(packageJson.version),
    site: origin,
    home_page_url: new URL(url('/'), origin).href,
    counts: {
      posts: entries.length,
      words: entries.reduce((sum, item) => sum + item.words, 0),
      chars: entries.reduce((sum, item) => sum + item.chars, 0),
      minutes: entries.reduce((sum, item) => sum + item.minutes, 0),
      categories: categories.length,
      tags: tags.length,
    },
    years: [...byYear.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, agg]) => ({ year, ...agg })),
    categories: categories.map(item => ({ name: item.name, count: item.count })),
    tags: tags.map(item => ({ name: item.name, count: item.count })),
    posts: entries,
  }

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
