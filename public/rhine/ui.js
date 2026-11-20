/**
 * 莱茵档案 · 界面增强脚本（外置，避免每页内联 ~2.5KB）
 *
 * - `g` 序列快捷键：h/a/t/s/r/b/c → 首页 / 归档 / 时间线 / 统计 / 随机 / 订阅 / 制作说明
 * - `?` 打开快捷键帮助浮层（懒创建 dialog，Esc / 背景 / 关闭按钮关闭）
 *
 * base 路径从 <html data-base="..."> 读取，子路径部署可用。
 */
(() => {
  const html = document.documentElement
  const base = (html.dataset.base || '/').replace(/\/$/, '')

  const copyText = async text => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  let toastTimer = 0
  const toast = message => {
    let el = document.getElementById('rl-toast')
    if (!el) {
      el = document.createElement('div')
      el.id = 'rl-toast'
      el.className = 'rl-toast'
      el.setAttribute('role', 'status')
      el.setAttribute('aria-live', 'polite')
      document.body.appendChild(el)
    }
    el.textContent = message
    el.classList.add('is-visible')
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => el.classList.remove('is-visible'), 1800)
  }
  const routes = {
    h: '/',
    a: '/archive/',
    t: '/timeline/',
    s: '/stats/',
    r: '/random/',
    b: '/subscribe/',
    c: '/colophon/',
  }

  const isTyping = (el) => {
    if (!(el instanceof HTMLElement)) return false
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true
    return el.isContentEditable || !!el.closest('[contenteditable="true"]')
  }

  const SHORTCUT_ROWS = `
    <div><dt><kbd>/</kbd></dt><dd>聚焦检索</dd></div>
    <div><dt><kbd>Esc</kbd></dt><dd>关闭检索面板 / 本浮层</dd></div>
    <div><dt><kbd>↑</kbd> <kbd>↓</kbd></dt><dd>在检索结果间移动</dd></div>
    <div><dt><kbd>Enter</kbd></dt><dd>打开选中的检索结果</dd></div>
    <div><dt><kbd>Tab</kbd></dt><dd>跳到主内容（skip link）</dd></div>
    <div><dt><kbd>g</kbd> + <kbd>h</kbd><kbd>a</kbd><kbd>t</kbd><kbd>s</kbd><kbd>r</kbd><kbd>b</kbd><kbd>c</kbd></dt><dd>首页 / 归档 / 时间线 / 统计 / 随机 / 订阅 / 制作说明</dd></div>
    <div><dt><kbd>?</kbd></dt><dd>打开本浮层</dd></div>
  `

  let shortcutDialog = null
  let dialogReturnFocus = null

  const ensureShortcuts = () => {
    if (shortcutDialog) return shortcutDialog
    const wrapper = document.createElement('div')
    wrapper.id = 'rl-shortcuts'
    wrapper.className = 'rl-shortcuts'
    wrapper.hidden = true
    wrapper.setAttribute('role', 'dialog')
    wrapper.setAttribute('aria-modal', 'true')
    wrapper.setAttribute('aria-labelledby', 'rl-shortcuts-title')
    wrapper.innerHTML = `
      <div class="rl-shortcuts__card">
        <div class="rl-shortcuts__head">
          <p class="rl-kicker" id="rl-shortcuts-title">SHORTCUTS / 键盘快捷键</p>
          <button type="button" class="rl-shortcuts__close" data-rl-shortcuts-close aria-label="关闭快捷键说明">×</button>
        </div>
        <dl class="rl-shortcuts__list">${SHORTCUT_ROWS}</dl>
      </div>
    `
    wrapper.addEventListener('click', event => {
      if (event.target === wrapper) closeShortcuts()
    })
    wrapper.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return
      const focusables = wrapper.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    })
    wrapper.querySelectorAll('[data-rl-shortcuts-close]').forEach(button => {
      button.addEventListener('click', closeShortcuts)
    })
    document.body.appendChild(wrapper)
    shortcutDialog = wrapper
    return wrapper
  }

  const closeShortcuts = () => {
    if (!shortcutDialog || shortcutDialog.hidden) return
    shortcutDialog.hidden = true
    if (dialogReturnFocus && typeof dialogReturnFocus.focus === 'function') {
      dialogReturnFocus.focus()
    }
  }

  const openShortcuts = () => {
    const dialog = ensureShortcuts()
    dialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.hidden = false
    const close = dialog.querySelector('[data-rl-shortcuts-close]')
    if (close) close.focus()
  }

  let pending = false
  let timer = 0

  document.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (isTyping(event.target)) return

    if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
      event.preventDefault()
      openShortcuts()
      return
    }
    if (event.key === 'Escape') {
      closeShortcuts()
      return
    }

    const key = event.key.toLowerCase()
    if (pending) {
      pending = false
      window.clearTimeout(timer)
      const path = routes[key]
      if (!path) return
      event.preventDefault()
      const target = `${base}${path}`
      if (window.swup && typeof window.swup.navigate === 'function') {
        window.swup.navigate(target)
      } else {
        window.location.assign(target)
      }
      return
    }
    if (key === 'g') {
      pending = true
      timer = window.setTimeout(() => {
        pending = false
      }, 1200)
    }
  })

  // Mermaid 图表：右上角「复制源码」按钮

  let mermaidTimer = 0
  const scheduleMermaidEnhance = () => {
    window.clearTimeout(mermaidTimer)
    mermaidTimer = window.setTimeout(enhanceMermaid, 120)
  }

  const enhanceMermaid = () => {
    document.querySelectorAll('.mermaid-container[data-mermaid-src]').forEach(container => {
      if (container.dataset.rlCopy === '1') return
      container.dataset.rlCopy = '1'
      // Mermaid 重新渲染会重置 container.innerHTML，按钮必须放在容器外层的 wrapper 里
      let wrapper = container.closest('.rl-mermaid-wrap')
      if (!wrapper) {
        wrapper = document.createElement('div')
        wrapper.className = 'rl-mermaid-wrap'
        container.parentNode?.insertBefore(wrapper, container)
        wrapper.appendChild(container)
      }
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'rl-mermaid-copy'
      button.setAttribute('aria-label', '复制 Mermaid 图表源码')
      button.textContent = '复制源码'
      button.addEventListener('click', async () => {
        const source = container.getAttribute('data-mermaid-src') || ''
        const ok = await copyText(source)
        button.textContent = ok ? '已复制' : '复制失败'
        button.classList.toggle('is-done', ok)
        window.setTimeout(() => {
          button.textContent = '复制源码'
          button.classList.remove('is-done')
        }, 1600)
      })
      wrapper.appendChild(button)
    })
  }

  enhanceMermaid()
  window.setTimeout(enhanceMermaid, 900)
  window.setTimeout(enhanceMermaid, 2200)
  const mermaidObserver = new MutationObserver(scheduleMermaidEnhance)
  mermaidObserver.observe(document.body, { childList: true, subtree: true })
  document.addEventListener('astro:page-load', scheduleMermaidEnhance)
  document.addEventListener('astro:after-swap', scheduleMermaidEnhance)

  // KaTeX：点击公式复制 LaTeX（选中文本时不劫持）
  const enhanceMath = () => {
    document.querySelectorAll('#post-container .katex').forEach(el => {
      if (el.dataset.rlTex === '1') return
      el.dataset.rlTex = '1'
      el.setAttribute('title', '点击复制 LaTeX')
      el.style.cursor = 'copy'
      el.addEventListener('click', async event => {
        const selection = window.getSelection()
        if (selection && selection.toString().trim()) return
        const tex = el.querySelector('annotation[encoding="application/x-tex"]')?.textContent
        if (!tex) return
        event.preventDefault()
        const ok = await copyText(tex)
        toast(ok ? `已复制 LaTeX：${tex.slice(0, 36)}` : '复制失败')
      })
    })
  }

  // 目录折叠状态记忆（桌面端；移动端保持默认折叠）
  const TOC_KEY = 'rl-toc-open'
  const enhanceToc = () => {
    document.querySelectorAll('details.rl-toc').forEach(toc => {
      const stored = (() => {
        try {
          return localStorage.getItem(TOC_KEY)
        } catch {
          return null
        }
      })()
      if (toc.dataset.rlBound !== '1') {
        toc.dataset.rlBound = '1'
        if (stored !== null && window.innerWidth >= 768) toc.open = stored === '1'
        toc.addEventListener('toggle', () => {
          try {
            localStorage.setItem(TOC_KEY, toc.open ? '1' : '0')
          } catch {
            /* 忽略 */
          }
        })
      } else if (stored !== null && window.innerWidth >= 768) {
        toc.open = stored === '1'
      }
    })
  }

  // 标题锚点：点击复制章节绝对链接（保留默认跳转）
  const enhanceAnchors = () => {
    document.querySelectorAll('#post-container .anchor').forEach(anchor => {
      if (anchor.dataset.rlAnchor === '1') return
      anchor.dataset.rlAnchor = '1'
      anchor.addEventListener('click', async () => {
        const href = anchor.getAttribute('href')
        if (!href) return
        let target
        try {
          target = new URL(href, window.location.href).href
        } catch {
          return
        }
        const ok = await copyText(target)
        toast(ok ? '已复制章节链接' : '复制失败')
        if (ok) {
          anchor.classList.add('is-copied')
          window.setTimeout(() => anchor.classList.remove('is-copied'), 1400)
        }
      })
    })
  }

  // 通用「复制链接」按钮：<button data-rl-copy-url="...">
  document.addEventListener('click', async event => {
    const button = event.target instanceof Element ? event.target.closest('[data-rl-copy-url]') : null
    if (!button) return
    const raw = button.getAttribute('data-rl-copy-url') || ''
    if (!raw) return
    let absolute = raw
    // 只有像路径/URL 的值才做绝对化；命令文本（如 curl ...）原样复制
    if (/^\/(?!\/)|^https?:\/\//i.test(raw)) {
      try {
        absolute = new URL(raw, window.location.href).href
      } catch {
        /* 保留原值 */
      }
    }
    const ok = await copyText(absolute)
    const label = button.getAttribute('data-rl-copy-label') || '已复制链接'
    toast(ok ? label : '复制失败')
    if (ok) {
      button.classList.add('is-copied')
      window.setTimeout(() => button.classList.remove('is-copied'), 1400)
    }
  })

  // Skip link：跳转后把焦点交给主内容，键盘用户不必重新 Tab 穿过导航
  document.querySelectorAll('a.rl-skip').forEach(link => {
    if (link.dataset.rlSkipBound === '1') return
    link.dataset.rlSkipBound = '1'
    link.addEventListener('click', () => {
      const target = document.getElementById('swup-container')
      if (!target) return
      window.setTimeout(() => target.focus({ preventScroll: true }), 60)
    })
  })

  enhanceMath()
  enhanceToc()
  enhanceAnchors()
  document.addEventListener('astro:page-load', () => {
    enhanceMath()
    enhanceToc()
    enhanceAnchors()
  })
  document.addEventListener('astro:after-swap', () => {
    window.setTimeout(enhanceMath, 200)
    window.setTimeout(enhanceToc, 200)
    window.setTimeout(enhanceAnchors, 200)
  })

  // 全站诊断终端彩蛋（#rl-site-egg）与左下角仪器 HUD（.rl-hud）
  const egg = document.getElementById('rl-site-egg')
  if (egg) {
    const closeButton = document.getElementById('rl-site-egg-close')
    const themeCmd = document.getElementById('rl-egg-cmd-theme')
    const logCmd = document.getElementById('rl-egg-cmd-log')
    const secret = document.getElementById('rl-egg-secret')
    const clockEl = document.getElementById('rl-egg-clock')
    const themeEl = document.getElementById('rl-egg-theme')
    const hudTicks = [...document.querySelectorAll('[data-rl-hud-theme]')]
    let buffer = ''
    let autoTimer = 0

    const syncStatus = () => {
      const now = new Date()
      const pad = n => String(n).padStart(2, '0')
      if (clockEl) {
        clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      }
      if (themeEl) {
        const isDark = document.documentElement.classList.contains('dark')
        themeEl.textContent = isDark ? 'DARK // 墨绿暗场' : 'LIGHT // 暖骨档案纸'
      }
    }

    const syncHud = () => {
      const isDark = document.documentElement.classList.contains('dark')
      for (const tick of hudTicks) {
        const target = tick.getAttribute('data-rl-hud-theme')
        const pressed = target === 'dark' ? isDark : !isDark
        tick.setAttribute('aria-pressed', pressed ? 'true' : 'false')
      }
    }

    const applyTheme = next => {
      const isDark = next === 'dark'
      document.documentElement.classList.toggle('dark', isDark)
      try {
        localStorage.setItem('theme', next)
        localStorage.setItem('rhine-theme', next)
      } catch {
        /* 忽略 */
      }
      syncHud()
      syncStatus()
    }

    const closeEgg = () => {
      window.clearTimeout(autoTimer)
      egg.classList.remove('is-on')
      egg.hidden = true
    }

    const openEgg = () => {
      syncStatus()
      egg.hidden = false
      void egg.offsetHeight
      egg.classList.add('is-on')
      closeButton?.focus()
      window.clearTimeout(autoTimer)
      autoTimer = window.setTimeout(closeEgg, 20000)
    }

    window.addEventListener('keydown', event => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'Escape' && !egg.hidden) {
        event.preventDefault()
        closeEgg()
        return
      }
      if (isTyping(event.target)) return
      if (event.key.length !== 1) return
      buffer = (buffer + event.key.toLowerCase()).slice(-5)
      if (buffer !== 'rhine') return
      buffer = ''
      openEgg()
    })

    document.addEventListener('click', event => {
      const trigger = event.target instanceof Element ? event.target.closest('[data-rl-open-egg]') : null
      if (trigger) {
        event.preventDefault()
        openEgg()
      }
    })

    themeCmd?.addEventListener('click', () => {
      applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')
    })

    for (const tick of hudTicks) {
      tick.addEventListener('click', () => {
        applyTheme(tick.getAttribute('data-rl-hud-theme') === 'dark' ? 'dark' : 'light')
      })
    }

    syncHud()
    if (typeof MutationObserver === 'function') {
      new MutationObserver(syncHud).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })
    }

    logCmd?.addEventListener('click', () => {
      if (!secret) return
      const willShow = secret.hidden
      secret.hidden = !willShow
      logCmd.setAttribute('aria-pressed', willShow ? 'true' : 'false')
    })

    for (const link of egg.querySelectorAll('a.rl-egg__cmd')) {
      link.addEventListener('click', closeEgg)
    }

    closeButton?.addEventListener('click', closeEgg)
    egg.addEventListener('click', event => {
      if (event.target === egg) closeEgg()
    })
  }
})()
