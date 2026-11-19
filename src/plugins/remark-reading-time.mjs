// 中日韩混排的字数与阅读时长估算：
// - 中文/日文假名/韩文按「字」计，阅读速度约 300 字/分钟；
// - 拉丁词按「词」计，约 220 词/分钟；
// 旧的 reading-time 库按空格切词，整段中文会被算成 1 个词，严重低估。
import { toString } from 'mdast-util-to-string'

const CJK_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g
const LATIN_WORD_RE = /[A-Za-z0-9][A-Za-z0-9'’_-]*/g

export function remarkReadingTime() {
  return (tree, { data }) => {
    const text = toString(tree)
    const cjk = (text.match(CJK_RE) ?? []).length
    const latin = (text.replace(CJK_RE, ' ').match(LATIN_WORD_RE) ?? []).length
    const words = cjk + latin
    const chars = [...text].filter(char => !/\s/.test(char)).length

    data.astro.frontmatter.words = words
    data.astro.frontmatter.chars = chars
    data.astro.frontmatter.minutes = Math.max(1, Math.round(cjk / 300 + latin / 220))
  }
}
