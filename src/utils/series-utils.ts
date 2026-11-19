import type { CollectionEntry } from 'astro:content'

export type SeriesItem = {
  entry: CollectionEntry<'posts'>
  order: number
}

export type SeriesInfo = {
  name: string
  items: SeriesItem[]
}

/**
 * 根据文章的 `series` / `seriesOrder` 字段汇总同系列条目。
 * 只有一个条目时返回 null（不显示系列块）。
 */
export function getSeriesInfo(
  posts: CollectionEntry<'posts'>[],
  current: CollectionEntry<'posts'>,
): SeriesInfo | null {
  const name = current.data.series?.trim()
  if (!name) return null

  const items = posts
    .filter(post => post.data.series?.trim() === name)
    .map(post => ({ entry: post, order: post.data.seriesOrder ?? 0 }))
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return +a.entry.data.published - +b.entry.data.published
    })

  if (items.length < 2) return null
  return { name, items }
}
