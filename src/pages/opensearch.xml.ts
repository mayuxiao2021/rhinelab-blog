import type { APIRoute } from 'astro'
import { siteConfig, profileConfig } from '@/config'
import { url } from '@utils/url-utils'

/**
 * OpenSearch 描述：让浏览器把本站添加为搜索引擎（搜索走站内 ?q= 参数）。
 */
export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://example.com')).origin
  const template = `${new URL(url('/'), origin).href}?q={searchTerms}`
  const iconUrl = new URL(url('/icons/icon-192.png'), origin).href
  const contactUrl = profileConfig.links.find(link => link.name === 'GitHub')?.url || new URL(url('/'), origin).href

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${siteConfig.title}</ShortName>
  <Description>在「${siteConfig.title}」站内检索</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <OutputEncoding>UTF-8</OutputEncoding>
  <Language>${siteConfig.lang.replace('_', '-')}</Language>
  <Tags>莱茵档案, Astro, Fuwari, 博客, RSS</Tags>
  <Image width="192" height="192">${iconUrl}</Image>
  <Contact>${contactUrl}</Contact>
  <Url type="text/html" method="get" template="${template}"/>
</OpenSearchDescription>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/opensearchdescription+xml; charset=utf-8' },
  })
}
