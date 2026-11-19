import fs from 'node:fs'
import path from 'node:path'
import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import tailwind from '@astrojs/tailwind'
import swup from '@swup/astro'
import Compress from 'astro-compress'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'

// Markdown 管线（Fuwari 上游默认接线，本地曾丢失）
import remarkMath from 'remark-math'
import remarkDirective from 'remark-directive'
import remarkGithubAdmonitionsToDirectives from 'remark-github-admonitions-to-directives'
import remarkDirectiveRehype from 'remark-directive-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeComponents from 'rehype-components'

import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs'
import { AdmonitionComponent } from './src/plugins/rehype-component-admonition.mjs'
import { GithubCardComponent } from './src/plugins/rehype-component-github-card.mjs'
import { rehypeExternalLinks } from './src/plugins/rehype-external-links.mjs'
import { rehypeFrameTitle } from './src/plugins/rehype-frame-title.mjs'
import { rehypeLazyImages } from './src/plugins/rehype-lazy-images.mjs'

// 代码块行号（CSS 计数器实现，不进入复制文本，可在此开关）
const codeLineNumberTransformer = {
  name: 'rhine-line-numbers',
  pre(node) {
    node.properties['data-line-numbers'] = ''
  },
}

// ⚠️ 部署前把 site 改成你自己的域名（GitHub Pages / 自托管均可）
// 外链插件与 canonical/OG 共用同一个站点 origin；改域名时只改这一处。
// 部署环境变量：SITE_URL 换域名、BASE_PATH 换子路径（如 /blog/），默认根路径
const SITE_URL = process.env.SITE_URL || 'https://github.glmyx.eu.org'
const SITE_ORIGIN = new URL(SITE_URL).origin
const rawBasePath = process.env.BASE_PATH || '/'
const BASE_PATH = rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`

// 扫描文章 frontmatter 的日期，供 sitemap lastmod 使用
const postDates = new Map()
const categoryDates = new Map()
const tagDates = new Map()
let latestContentDate = null
{
  const contentDir = path.join(process.cwd(), 'src/content/posts')
  if (fs.existsSync(contentDir)) {
    const bump = (map, key, date) => {
      if (!key) return
      const current = map.get(key)
      if (!current || date > current) map.set(key, date)
    }
    for (const file of fs.readdirSync(contentDir).filter(name => name.endsWith('.md'))) {
      const text = fs.readFileSync(path.join(contentDir, file), 'utf8')
      const published = text.match(/^published:\s*([0-9T:.\-]+)/m)?.[1]
      const updated = text.match(/^updated:\s*([0-9T:.\-]+)/m)?.[1]
      const dateValue = updated || published
      if (!dateValue) continue
      const date = new Date(dateValue)
      if (Number.isNaN(date.valueOf())) continue

      postDates.set(file.replace(/\.md$/, ''), date)
      const category = text.match(/^category:\s*['"]?([^'"\n]+)['"]?\s*$/m)?.[1]?.trim()
      bump(categoryDates, category, date)
      const tagsLine = text.match(/^tags:\s*\[([^\]]*)\]/m)?.[1] ?? ''
      for (const tag of tagsLine.split(',').map(item => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)) {
        bump(tagDates, tag, date)
      }
      if (!latestContentDate || date > latestContentDate) latestContentDate = date
    }
  }
}

/** 从 sitemap URL 路径反查 lastmod：文章 → 自身日期；分类/标签 → 该聚合最新文章日期 */
function resolveLastmod(pathname) {
  const decoded = decodeURIComponent(pathname)
  const postMatch = decoded.match(/\/posts\/([^/]+)\/?$/)
  if (postMatch?.[1] && postDates.has(postMatch[1])) return postDates.get(postMatch[1])
  const categoryMatch = decoded.match(/\/archive\/category\/([^/]+)\/?$/)
  if (categoryMatch?.[1]) {
    const category = categoryMatch[1] === 'uncategorized' ? '未分类' : categoryMatch[1]
    if (categoryDates.has(category)) return categoryDates.get(category)
  }
  const tagMatch = decoded.match(/\/archive\/tag\/([^/]+)\/?$/)
  if (tagMatch?.[1] && tagDates.has(tagMatch[1])) return tagDates.get(tagMatch[1])
  return latestContentDate
}

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  integrations: [
    tailwind(),
    swup({
      theme: false,
      animationClass: 'transition-swup-',
      containers: ['main'],
      smoothScrolling: true,
      cache: true,
      preload: true,
      accessibility: true,
      updateHead: true,
      updateBodyClass: false,
      globalInstance: true,
    }),
    icon({
      include: {
        'material-symbols': ['*'],
        'fa6-brands': ['*'],
        'fa6-regular': ['*'],
        'fa6-solid': ['*'],
      },
    }),
    svelte(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      // 随机跳转页不进 sitemap（noindex）
      filter: page => !page.endsWith('/random/'),
      // 为 sitemap 补 lastmod：文章用 updated/published，其余页面用最新内容日期
      serialize(item) {
        const date = resolveLastmod(new URL(item.url).pathname)
        if (date) item.lastmod = date.toISOString()
        return item
      },
    }),
    Compress({
      CSS: true,
      // 图片已在生成阶段手工压到目标尺寸/质量；astro-compress 的 Image 通道会重编码 WebP 反而膨胀
      Image: false,
      // 第三方静态页（友链小游戏）保持原样：它们不是本站生成页面，压缩会解析失败
      Exclude: [
        (File) => /EatKun-main|EatKano-main|jump play/.test(File),
      ],
      Action: {
        Passed: async () => true,
      },
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkReadingTime,
      remarkDirective,
      remarkGithubAdmonitionsToDirectives,
      remarkDirectiveRehype,
    ],
    rehypePlugins: [
      rehypeKatex,
      [rehypeExternalLinks, { origin: SITE_ORIGIN }],
      rehypeFrameTitle,
      rehypeLazyImages,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['anchor'], 'data-pagefind-ignore': '' },
          content: {
            type: 'element',
            tagName: 'span',
            properties: { className: ['anchor-icon'] },
            children: [{ type: 'text', value: '#' }],
          },
        },
      ],
      [
        rehypeComponents,
        {
          components: {
            github: GithubCardComponent,
            note: (x, y) => AdmonitionComponent(x, y, 'note'),
            tip: (x, y) => AdmonitionComponent(x, y, 'tip'),
            important: (x, y) => AdmonitionComponent(x, y, 'important'),
            caution: (x, y) => AdmonitionComponent(x, y, 'caution'),
            warning: (x, y) => AdmonitionComponent(x, y, 'warning'),
          },
        },
      ],
    ],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: false,
      transformers: [codeLineNumberTransformer],
    },
  },
  vite: {
    optimizeDeps: {
      // 以 .svelte 源码作为包入口的库无法被 esbuild 预打包
      exclude: ['@iconify/svelte'],
    },
    ssr: {
      noExternal: ['@iconify/svelte'],
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.message.includes('is dynamically imported by') &&
            warning.message.includes('but also statically imported by')
          ) {
            return
          }
          warn(warning)
        },
      },
    },
  },
})
