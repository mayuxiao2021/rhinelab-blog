<script lang="ts">
import { onMount } from 'svelte'
import { url } from '@utils/url-utils.ts'
import { i18n } from '@i18n/translation'
import I18nKey from '@i18n/i18nKey'
import Icon from '@iconify/svelte'
import { rhineOperators } from '../data/operators'

let keywordDesktop = $state('')
let keywordMobile = $state('')
let result = $state<any[]>([])
let filterGroups = $state<Record<string, Record<string, number>>>({})
let selectedCategory = $state('')
let selectedTag = $state('')
let searching = $state(false)
let panelOpen = $state(false)
let activeIndex = $state(-1)
let recentSearches = $state<string[]>([])

const activeQuery = $derived((keywordDesktop || keywordMobile).trim().toLowerCase())
const matchedOperators = $derived(
    activeQuery.length >= 1
        ? rhineOperators.filter(op =>
              `${op.code} ${op.cn} ${op.en} ${op.role} ${op.division} ${op.tags.join(' ')}`
                  .toLowerCase()
                  .includes(activeQuery),
          )
        : [],
)

const HISTORY_KEY = 'rl-search-history'

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        recentSearches = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
    } catch {
        recentSearches = []
    }
}

function rememberSearch(term: string) {
    const keyword = term.trim()
    if (keyword.length < 2) return
    const next = [keyword, ...recentSearches.filter(item => item !== keyword)].slice(0, 6)
    recentSearches = next
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
    } catch {
        /* 忽略 */
    }
}

function removeHistory(term: string) {
    const next = recentSearches.filter(item => item !== term)
    recentSearches = next
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
    } catch {
        /* 忽略 */
    }
}

function clearHistory() {
    recentSearches = []
    try {
        localStorage.removeItem(HISTORY_KEY)
    } catch {
        /* 忽略 */
    }
}

const fakeResult = [
    {
        url: url('/'),
        meta: { title: 'This Is a Fake Search Result' },
        excerpt: 'Because the search cannot work in the <mark>dev</mark> environment.',
    },
    {
        url: url('/'),
        meta: { title: 'If You Want to Test the Search' },
        excerpt: 'Try running <mark>pnpm build && pnpm preview</mark> instead.',
    },
]

type PagefindApi = {
    search: (keyword: string | null, options?: any) => Promise<any>
    filters: () => Promise<Record<string, Record<string, number>>>
}

async function ensurePagefind(): Promise<PagefindApi | null> {
    if (!import.meta.env.PROD) return null
    for (let i = 0; i < 60; i++) {
        const api = (window as any).pagefind as PagefindApi | undefined
        if (api?.search) return api
        await new Promise(resolve => setTimeout(resolve, 60))
    }
    return null
}

function activeFilters(): Record<string, string> | null {
    const filters: Record<string, string> = {}
    if (selectedCategory) filters.category = selectedCategory
    if (selectedTag) filters.tag = selectedTag
    return Object.keys(filters).length > 0 ? filters : null
}

function panelEl() {
    return document.getElementById('search-panel')
}

function syncPanelState() {
    const panel = panelEl()
    panelOpen = !!panel && !panel.classList.contains('float-panel-closed')
}

function openPanel() {
    const panel = panelEl()
    if (!panel) return
    const wasClosed = panel.classList.contains('float-panel-closed')
    panel.classList.remove('float-panel-closed')
    syncPanelState()
    if (wasClosed) loadHistory()
}

function closePanel() {
    panelEl()?.classList.add('float-panel-closed')
    syncPanelState()
}

async function runSearch(keyword: string, isDesktop: boolean) {
    const panel = panelEl()
    if (!panel) return

    const filters = activeFilters()
    if (!keyword && !filters && isDesktop) {
        // 桌面端聚焦搜索框且为空时：显示最近检索，而不是直接关掉面板
        const focusedInSearchBar = Boolean(document.activeElement?.closest('#search-bar'))
        if (focusedInSearchBar) {
            result = []
            openPanel()
        } else {
            closePanel()
        }
        return
    }

    searching = true
    let arr: any[] = []
    const pagefind = await ensurePagefind()
    if (pagefind) {
        try {
            const ret = filters
                ? await pagefind.search(keyword || null, { filters })
                : await pagefind.search(keyword)
            for (const item of ret.results) arr.push(await item.data())
        } catch (error) {
            console.error('pagefind search failed', error)
        }
    } else if (!import.meta.env.PROD) {
        arr = fakeResult
    }
    searching = false

    if (!arr.length && isDesktop && !keyword && !filters) {
        closePanel()
        return
    }

    if (isDesktop) openPanel()
    result = arr
    activeIndex = -1
}

async function loadFilters() {
    const pagefind = await ensurePagefind()
    if (!pagefind) return
    try {
        filterGroups = await pagefind.filters()
    } catch (error) {
        console.error('pagefind filters failed', error)
    }
}

onMount(() => {
    loadFilters()
    syncPanelState()

    // 支持 ?q= 直达检索（OpenSearch / 分享链接）
    const applyQueryParam = () => {
        const query = new URLSearchParams(window.location.search).get('q')
        if (!query) return
        keywordDesktop = query
        openPanel()
        runSearch(query, true)
        rememberSearch(query)
    }
    applyQueryParam()
    document.addEventListener('astro:after-swap', applyQueryParam)

    const onKeydown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return
        if (!panelOpen) return
        event.preventDefault()
        closePanel()
        // 桌面端返回搜索框，移动端返回开关按钮（lg 断点下开关按钮隐藏，不能聚焦）
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches
        const target = isDesktop
            ? document.querySelector<HTMLInputElement>('#search-bar input')
            : document.getElementById('search-switch')
        target?.focus()
    }

    const onDocumentClick = (event: MouseEvent) => {
        const target = event.target as Node | null
        const panel = panelEl()
        if (!panel || !target) return
        if (panel.contains(target)) return
        if (document.getElementById('search-bar')?.contains(target)) return
        if (document.getElementById('search-switch')?.contains(target)) return
        // Fuwari 的 setClickOutsideToClose 也会关闭面板，这里只同步状态
        syncPanelState()
    }

    const onAfterSwap = () => {
        closePanel()
    }

    window.addEventListener('keydown', onKeydown)
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('astro:after-swap', onAfterSwap)

    return () => {
        document.removeEventListener('astro:after-swap', applyQueryParam)
        window.removeEventListener('keydown', onKeydown)
        document.removeEventListener('click', onDocumentClick)
        document.removeEventListener('astro:after-swap', onAfterSwap)
    }
})

function handleResultKeydown(event: KeyboardEvent) {
    if (result.length === 0) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const step = event.key === 'ArrowDown' ? 1 : -1
        activeIndex = (activeIndex + step + result.length) % result.length
        const panel = panelEl()
        const active = panel?.querySelector<HTMLAnchorElement>(`[data-rl-result="${activeIndex}"]`)
        active?.scrollIntoView({ block: 'nearest' })
        return
    }
    if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault()
        const active = panelEl()?.querySelector<HTMLAnchorElement>(`[data-rl-result="${activeIndex}"]`)
        rememberSearch(keywordDesktop || keywordMobile)
        active?.click()
    }
}

const togglePanel = () => {
    const panel = panelEl()
    if (!panel) return
    const willOpen = panel.classList.contains('float-panel-closed')
    if (willOpen) loadHistory()
    panel.classList.toggle('float-panel-closed')
    syncPanelState()
    if (panelOpen) {
        panel.querySelector<HTMLInputElement>('input')?.focus()
    }
}

function toggleCategory(name: string) {
    selectedCategory = selectedCategory === name ? '' : name
}

function toggleTag(name: string) {
    selectedTag = selectedTag === name ? '' : name
}

function clearFilters() {
    selectedCategory = ''
    selectedTag = ''
}

$effect(() => {
    keywordDesktop
    selectedCategory
    selectedTag
    runSearch(keywordDesktop, true)
})

$effect(() => {
    keywordMobile
    selectedCategory
    selectedTag
    runSearch(keywordMobile, false)
})
</script>

<!-- search bar for desktop view -->
<div id="search-bar" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
">
    <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30" />
    <input placeholder="{i18n(I18nKey.search)}" bind:value={keywordDesktop}
           aria-label="搜索文章"
           role="combobox" aria-autocomplete="list"
           aria-controls="rl-search-results" aria-expanded={panelOpen}
           aria-activedescendant={activeIndex >= 0 ? `rl-search-opt-${activeIndex}` : undefined}
           onkeydown={handleResultKeydown}
           onfocus={() => runSearch(keywordDesktop, true)}
           class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
    >
</div>

<!-- toggle btn for phone/tablet view -->
<button onclick={togglePanel} aria-label="打开/关闭检索面板" id="search-switch"
        aria-expanded={panelOpen} aria-controls="search-panel"
        class="btn-plain scale-animation lg:hidden rounded-lg w-11 h-11 active:scale-90">
    <Icon icon="material-symbols:search" class="text-[1.25rem]" />
</button>

<!-- search panel -->
<div id="search-panel" role="dialog" aria-label="档案检索终端"
     class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2">

    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
        <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30" />
        <input placeholder="Search" aria-label="搜索文章" bind:value={keywordMobile}
               role="combobox" aria-autocomplete="list"
               aria-controls="rl-search-results" aria-expanded={panelOpen}
               aria-activedescendant={activeIndex >= 0 ? `rl-search-opt-${activeIndex}` : undefined}
               onkeydown={handleResultKeydown}
               class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
        >
    </div>

    <!-- 分类 / 标签筛选（Pagefind filters） -->
    {#if Object.keys(filterGroups).length > 0}
        <div class="rl-search-filters">
            {#if filterGroups.category}
                <span class="rl-search-filters__label">CATEGORY / 分类</span>
                {#each Object.entries(filterGroups.category) as [name, count]}
                    <button type="button" class="rl-chip"
                            aria-pressed={selectedCategory === name}
                            onclick={() => toggleCategory(name)}>
                        {name}<span>{count}</span>
                    </button>
                {/each}
            {/if}
            {#if filterGroups.tag}
                <span class="rl-search-filters__label">TAG / 标签</span>
                {#each Object.entries(filterGroups.tag).slice(0, 16) as [name, count]}
                    <button type="button" class="rl-chip"
                            aria-pressed={selectedTag === name}
                            onclick={() => toggleTag(name)}>
                        {name}<span>{count}</span>
                    </button>
                {/each}
            {/if}
            {#if selectedCategory || selectedTag}
                <button type="button" class="rl-chip rl-chip--clear" onclick={clearFilters}>
                    清除筛选 CLEAR
                </button>
            {/if}
        </div>
    {/if}

    {#if matchedOperators.length > 0}
        <div class="rl-search-ops" role="region" aria-label="研究员档案直达">
            <span class="rl-search-filters__label">PERSONNEL REGISTRY / 研究员卷宗直达 ({matchedOperators.length})</span>
            <div class="rl-search-ops__list">
                {#each matchedOperators as op}
                    <a
                        class="rl-search-ops__card"
                        href={url(`/operators/?op=${op.slug}`)}
                        onclick={() => { rememberSearch(keywordDesktop || keywordMobile); closePanel() }}
                    >
                        <span class="rl-search-ops__code">{op.code}</span>
                        <span class="rl-search-ops__name">{op.cn} <i>{op.en}</i></span>
                        <span class="rl-search-ops__role">{op.division} · {op.role}</span>
                        <span class="rl-search-ops__go" aria-hidden="true">调阅 →</span>
                    </a>
                {/each}
            </div>
        </div>
    {/if}

    {#if result.length > 0}
        <div class="rl-search-count" role="status" aria-live="polite">
            RESULTS / {result.length} 条档案{#if selectedCategory || selectedTag}（已筛选）{/if}
        </div>
    {:else if searching}
        <div class="rl-search-empty" role="status" aria-live="polite">SEARCHING / 检索中…</div>
    {:else if (keywordDesktop || keywordMobile || selectedCategory || selectedTag) && matchedOperators.length === 0}
        {#if recentSearches.length > 0}
            <div class="rl-search-history">
                <span class="rl-search-history__label">RECENT / 最近检索</span>
                {#each recentSearches as term}
                    <span class="rl-search-history__item">
                        <button type="button" class="rl-chip" onclick={() => { keywordDesktop = term; keywordMobile = term; runSearch(term, true); rememberSearch(term) }}>
                            {term}
                        </button>
                        <button type="button" class="rl-search-history__remove" aria-label={`删除检索历史：${term}`} onclick={() => removeHistory(term)}>×</button>
                    </span>
                {/each}
                <button type="button" class="rl-chip rl-chip--clear" onclick={clearHistory}>清除</button>
            </div>
        {/if}
        <div class="rl-search-empty">
            没有匹配的档案 / NO MATCH
            {#if selectedCategory || selectedTag}
                <button type="button" class="rl-chip rl-chip--clear" onclick={clearFilters}>清除筛选</button>
            {/if}
            {#if Object.keys(filterGroups.tag ?? {}).length > 0}
                <div class="rl-search-suggest">
                    <span class="rl-search-suggest__label">TRY / 试试这些标签</span>
                    {#each Object.entries(filterGroups.tag).slice(0, 8) as [name, count]}
                        <button type="button" class="rl-chip" onclick={() => toggleTag(name)}>
                            {name}<span>{count}</span>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}

    {#if recentSearches.length > 0 && !keywordDesktop && !keywordMobile && !selectedCategory && !selectedTag}
        <div class="rl-search-history">
            <span class="rl-search-history__label">RECENT / 最近检索</span>
            {#each recentSearches as term}
                <span class="rl-search-history__item">
                    <button type="button" class="rl-chip" onclick={() => { keywordDesktop = term; keywordMobile = term; runSearch(term, true); rememberSearch(term) }}>
                        {term}
                    </button>
                    <button type="button" class="rl-search-history__remove" aria-label={`删除检索历史：${term}`} onclick={() => removeHistory(term)}>×</button>
                </span>
            {/each}
            <button type="button" class="rl-chip rl-chip--clear" onclick={clearHistory}>清除</button>
        </div>
    {/if}

    <!-- search results -->
    <div id="rl-search-results" role="listbox" aria-label="检索结果" class="rl-search-results">
    {#each result as item, i}
        <a href={item.url} onclick={() => { rememberSearch(keywordDesktop || keywordMobile); closePanel() }}
           id={`rl-search-opt-${i}`}
           role="option" aria-selected={activeIndex === i}
           data-rl-result={i}
           class={"transition first-of-type:mt-2 lg:first-of-type:mt-0 group block rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]" + (activeIndex === i ? ' is-active' : '')}>
            <div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
                {item.meta.title}<Icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-0.5 my-auto text-[var(--primary)] inline ml-1" />
            </div>
            <div class="transition text-sm text-50">
                {@html item.excerpt}
            </div>
        </a>
    {/each}
    </div>
</div>
