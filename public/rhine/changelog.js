/**
 * 版本沿革页：
 * 1. 通过 #v0-2-1 这类锚点直达折叠内版本时自动展开 <details>
 * 2. 顶部输入框按版本号/关键词过滤版本块（跨可见区与折叠区）
 */
(() => {
  const openAnchoredRelease = () => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
    if (!id) return
    const target = document.getElementById(id)
    if (!target) return
    const details = target.closest('details')
    if (details) details.open = true
  }

  openAnchoredRelease()
  window.addEventListener('hashchange', openAnchoredRelease)
  document.addEventListener('astro:page-load', openAnchoredRelease)

  const article = document.querySelector('.rl-changelog')
  const input = document.getElementById('rl-changelog-filter')
  const count = document.getElementById('rl-changelog-count')
  const empty = document.getElementById('rl-changelog-empty')
  if (!article || !input || !count) return

  const details = article.querySelector('details.rl-changelog__older')

  // 把若干兄弟节点按 <h2> 切分为版本组；非版本节点（导语/折叠区容器）单独返回
  const collectGroups = root => {
    const groups = []
    const loose = []
    let current = null
    for (const node of Array.from(root.children)) {
      if (node.tagName === 'H2') {
        current = { heading: node, nodes: [node] }
        groups.push(current)
      } else if (current) {
        current.nodes.push(node)
      } else {
        loose.push({ heading: null, nodes: [node] })
      }
    }
    return { groups, loose }
  }

  const visible = collectGroups(article)
  const older = details ? collectGroups(details) : { groups: [], loose: [] }
  const allGroups = [...visible.groups, ...older.groups]
  const total = allGroups.length

  // 多关键词：空格分隔，需全部命中（AND）
  const matchTerms = (text, terms) => terms.every(term => text.includes(term))

  const matchedLimitExceeded = (groups, terms) => {
    if (terms.length === 0) return false
    let hits = 0
    for (const group of groups) {
      const text = group.nodes.map(node => node.textContent || '').join(' ').toLowerCase()
      if (matchTerms(text, terms)) hits += 1
      if (hits > 40) return true
    }
    return false
  }

  const unmark = root => {
    for (const mark of root.querySelectorAll('mark.rl-hl')) {
      mark.replaceWith(...mark.childNodes)
      mark.remove()
    }
  }

  const MAX_HIGHLIGHTS = 300
  let highlightBudget = MAX_HIGHLIGHTS

  const highlight = (root, terms) => {
    if (terms.length === 0 || highlightBudget <= 0) return
    const pattern = new RegExp(`(${terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const textNodes = []
    let node
    while ((node = walker.nextNode())) textNodes.push(node)
    for (const textNode of textNodes) {
      const value = textNode.nodeValue ?? ''
      if (!pattern.test(value)) continue
      pattern.lastIndex = 0
      const fragment = document.createDocumentFragment()
      let lastIndex = 0
      let match
      while ((match = pattern.exec(value))) {
        if (match.index > lastIndex) fragment.appendChild(document.createTextNode(value.slice(lastIndex, match.index)))
        const mark = document.createElement('mark')
        mark.className = 'rl-hl'
        mark.textContent = match[0]
        fragment.appendChild(mark)
        highlightBudget -= 1
        if (highlightBudget <= 0) break
        lastIndex = match.index + match[0].length
      }
      if (lastIndex < value.length) fragment.appendChild(document.createTextNode(value.slice(lastIndex)))
      textNode.replaceWith(fragment)
    }
  }

  const syncUrl = raw => {
    try {
      const next = new URL(window.location.href)
      if (raw) next.searchParams.set('q', raw)
      else next.searchParams.delete('q')
      window.history.replaceState(null, '', next)
    } catch {
      /* 忽略 */
    }
  }

  const applyFilter = updateUrl => {
    const raw = input.value.trim()
    const terms = raw.toLowerCase().split(/\s+/).filter(Boolean)
    let matched = 0
    // 超大匹配（例如单字符）只过滤、不做高亮，避免一次插入数千个节点
    highlightBudget = terms.length > 0 && matchedLimitExceeded(allGroups, terms) ? 0 : MAX_HIGHLIGHTS
    for (const group of allGroups) {
      const text = group.nodes.map(node => node.textContent || '').join(' ').toLowerCase()
      const hit = terms.length === 0 || matchTerms(text, terms)
      for (const node of group.nodes) {
        node.hidden = !hit
        if (hit) {
          unmark(node)
          highlight(node, terms)
        } else {
          unmark(node)
        }
      }
      if (hit) matched += 1
    }
    if (details) {
      const olderHit = older.groups.some(group =>
        matchTerms(group.nodes.map(node => node.textContent || '').join(' ').toLowerCase(), terms),
      )
      if (terms.length > 0) {
        if (olderHit) details.open = true
      } else {
        details.open = false
      }
    }
    for (const group of visible.loose) {
      for (const node of group.nodes) node.hidden = false
    }
    const skippedHighlight = terms.length > 0 && highlightBudget <= 0
    count.textContent = terms.length > 0 ? '匹配 ' + matched + ' / ' + total : total + ' 个版本'
    if (skippedHighlight && terms.length > 0) count.textContent += ' · 已省略高亮'
    count.title = skippedHighlight ? '匹配过多，只过滤不高亮，避免页面卡顿' : ''
    if (empty) empty.hidden = !(terms.length > 0) || matched > 0
    if (clearButton) clearButton.hidden = raw.length === 0
    if (updateUrl) syncUrl(raw)
  }

  // 从 ?q= 恢复过滤状态
  try {
    const q = new URLSearchParams(window.location.search).get('q')
    if (q) input.value = q
  } catch {
    /* 忽略 */
  }

  const clearButton = document.getElementById('rl-changelog-clear')
  const clear = () => {
    input.value = ''
    applyFilter(true)
    input.focus()
  }
  if (clearButton) clearButton.addEventListener('click', clear)
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape' && input.value) {
      event.preventDefault()
      clear()
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const firstHit = allGroups.find(group => !group.heading.hidden)
      if (firstHit?.heading) {
        const heading = firstHit.heading
        heading.setAttribute('tabindex', '-1')
        heading.scrollIntoView({ block: 'start', behavior: 'smooth' })
        heading.focus({ preventScroll: true })
      }
    }
  })

  input.addEventListener('input', () => {
    if (clearButton) clearButton.hidden = input.value.trim().length === 0
    applyFilter(true)
  })
  input.addEventListener('search', () => applyFilter(true))
  applyFilter(false)
})()
