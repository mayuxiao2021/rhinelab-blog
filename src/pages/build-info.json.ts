import type { APIRoute } from 'astro'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { siteConfig } from '@/config'
import gatesData from '../data/gates.json'
import { url } from '@utils/url-utils'

/**
 * 构建指纹：给部署方/自动化脚本一个轻量 JSON 来确认「线上跑的是哪一版」。
 * 版本、迭代数在构建期读取，generated_at 为构建时间。
 */
export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://example.com')).origin
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
  const pkg = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
  const iterations = readFileSync(path.join(projectRoot, 'ITERATIONS.md'), 'utf8')
  const iterationCount = (iterations.match(/^## Iteration /gm) ?? []).length

  const body = {
    name: siteConfig.title,
    version: pkg.version,
    iterations: iterationCount,
    generated_at: new Date().toISOString(),
    site: origin,
    home_page_url: new URL(url('/'), origin).href,
    generator: 'rhinelab-blog',
    stack: 'astro',
    gates: gatesData.verify,
  }

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
