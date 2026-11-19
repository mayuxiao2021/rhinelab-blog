import type { APIRoute } from 'astro'
import { siteConfig } from '@/config'
import { url } from '@utils/url-utils'

/**
 * PWA manifest：构建期生成，路径全部走 url()，子路径部署也正确。
 */
export const GET: APIRoute = () => {
  const shortcutIcon = (name: string) => ({
    src: url(`/icons/shortcut-${name}-192.png`),
    sizes: '192x192',
    type: 'image/png',
  })

  const icon = (size: number, purpose = 'any') => ({
    src: url(`/icons/icon-${size}.png`),
    sizes: `${size}x${size}`,
    type: 'image/png',
    purpose,
  })

  const manifest = {
    name: siteConfig.title,
    short_name: siteConfig.title,
    description: siteConfig.subtitle || siteConfig.title,
    lang: siteConfig.lang.replace('_', '-'),
    id: url('/'),
    start_url: url('/'),
    scope: url('/'),
    display: 'standalone',
    background_color: '#eae5e1',
    theme_color: '#11181b',
    icons: [icon(192), icon(512), icon(512, 'maskable')],
    categories: ['blog', 'news', 'reference'],
    dir: 'ltr',
    orientation: 'any',
    shortcuts: [
      {
        name: '归档 / Archive',
        short_name: '归档',
        url: url('/archive/'),
        icons: [shortcutIcon('archive')],
      },
      {
        name: '统计 / Stats',
        short_name: '统计',
        url: url('/stats/'),
        icons: [shortcutIcon('stats')],
      },
      {
        name: '订阅 / Subscribe',
        short_name: '订阅',
        url: url('/subscribe/'),
        icons: [shortcutIcon('subscribe')],
      },
      {
        name: '随机档案 / Random',
        short_name: '随机',
        url: url('/random/'),
        icons: [shortcutIcon('random')],
      },
      {
        name: '阅读器兼容 / Readers',
        short_name: '阅读器',
        url: url('/readers/'),
        icons: [shortcutIcon('readers')],
      },
    ],
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  })
}
