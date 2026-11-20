/**
 * 莱茵档案 · 视觉特效脚本（v0.10.0 · CONTAINMENT PROTOCOL）
 *
 * 1. Hero 活体双螺旋：canvas 实时旋转的 DNA 样本柱，指针靠近时局部膨胀 / 发光；
 *    视口外与标签页隐藏时暂停，prefers-reduced-motion 下只绘制一帧静态图。
 * 2. Hero 显微透镜：指针所在处揭示蓝图网格与隐藏批注（纯 CSS 变量驱动）。
 * 3. 解密读出：.rl-kicker 等仪器标签进入视口时由乱码逐字收敛为正文。
 * 4. 收容失效演习：任意页面键入 `ifrit`，或在诊断终端执行 [05]，触发全屏警报。
 * 5. 审阅印章 + 调阅登记：读到文章末尾盖「已审阅」章；列表卡片标记「已调阅」。
 *
 * 全部为渐进增强：脚本失败时页面内容与导航不受影响。
 */
(() => {
  const html = document.documentElement
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const READ_KEY = 'rl-read'
  const BREACH_KEY = 'rl-breach-log'

  const pad = (n, len = 2) => String(Math.max(0, Math.floor(n))).padStart(len, '0')
  const today = () => {
    const d = new Date()
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
  }
  const isTyping = el => {
    if (!(el instanceof HTMLElement)) return false
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true
    return el.isContentEditable
  }
  const readJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  }
  const writeJSON = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* 隐私模式 / 配额满：调阅记录只是锦上添花，忽略即可 */
    }
  }
  const cssVar = (name, fallback) =>
    getComputedStyle(html).getPropertyValue(name).trim() || fallback

  /* ------------------------------------------------------------------ */
  /* 1. Hero 活体双螺旋                                                  */
  /* ------------------------------------------------------------------ */
  let helix = null

  const initHelix = () => {
    const canvas = document.querySelector('canvas[data-rl-helix]')
    if (helix && helix.canvas === canvas && document.contains(canvas)) return
    if (helix) {
      helix.destroy()
      helix = null
    }
    if (!(canvas instanceof HTMLCanvasElement)) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const hero = canvas.closest('.rhine-hero') || canvas.parentElement

    const PAIRS = ['A·T', 'G·C', 'T·A', 'C·G', 'O·R', 'G·C', 'A·T', 'R·L']
    let w = 0
    let h = 0
    let phase = 0.6
    let boost = 0
    let raf = 0
    let last = 0
    let inView = true
    const pointer = { x: 0, y: 0, active: false, lastY: 0 }
    let palette = {}

    const readPalette = () => {
      palette = {
        amber: cssVar('--rl-amber', '#9b7247'),
        verd: cssVar('--rl-verd', '#5f6f58'),
        signal: cssVar('--rl-signal', '#ed821b'),
        faint: cssVar('--rl-faint', '#66645c'),
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      if (w < 8 || h < 8) return
      const cx = w * 0.4
      const baseAmp = Math.min(w * 0.3, 44)
      const k = (Math.PI * 2) / 230
      const fadeEdge = y => Math.max(0, Math.min(1, y / 70, (h - y) / 70))
      const influence = y => {
        if (!pointer.active) return 0
        const dy = y - pointer.y
        const dx = Math.abs(pointer.x - cx)
        return Math.exp(-(dy * dy) / (2 * 64 * 64)) * Math.exp(-(dx * dx) / (2 * 260 * 260))
      }
      const pointAt = (y, strand) => {
        const inf = influence(y)
        const amp = baseAmp * (1 + 0.55 * inf)
        const a = y * k + phase + strand * Math.PI
        return { x: cx + Math.sin(a) * amp, z: Math.cos(a), inf }
      }

      // 骨架：两条链，按深度调节透明度与线宽（后侧先画）
      ctx.lineCap = 'round'
      for (let strand = 0; strand < 2; strand++) {
        let prev = pointAt(0, strand)
        for (let y = 4; y <= h; y += 4) {
          const p = pointAt(y, strand)
          const depth = (p.z + 1) / 2
          ctx.globalAlpha = (0.16 + depth * 0.62) * fadeEdge(y)
          ctx.strokeStyle = strand === 0 ? palette.amber : palette.verd
          ctx.lineWidth = 0.8 + depth * 1.4 + p.inf * 1.2
          ctx.beginPath()
          ctx.moveTo(prev.x, y - 4)
          ctx.lineTo(p.x, y)
          ctx.stroke()
          prev = p
        }
      }

      // 碱基对横档 + 节点
      ctx.font = '600 9px "JetBrains Mono Variable", "JetBrains Mono", monospace'
      ctx.textBaseline = 'middle'
      const gap = 15
      for (let i = 0, y = gap / 2; y < h; i++, y += gap) {
        const a = pointAt(y, 0)
        const b = pointAt(y, 1)
        const fade = fadeEdge(y)
        const inf = a.inf
        const mid = (a.x + b.x) / 2
        ctx.lineWidth = 1 + inf
        ctx.globalAlpha = (0.2 + inf * 0.55) * fade
        ctx.strokeStyle = palette.amber
        ctx.beginPath()
        ctx.moveTo(a.x, y)
        ctx.lineTo(mid, y)
        ctx.stroke()
        ctx.strokeStyle = palette.verd
        ctx.beginPath()
        ctx.moveTo(mid, y)
        ctx.lineTo(b.x, y)
        ctx.stroke()

        for (const node of [a, b]) {
          const depth = (node.z + 1) / 2
          const r = 1.3 + depth * 1.9 + inf * 2.2
          ctx.globalAlpha = (0.3 + depth * 0.65) * fade
          ctx.fillStyle = inf > 0.35 && depth > 0.5 ? palette.signal : node === a ? palette.amber : palette.verd
          ctx.beginPath()
          ctx.arc(node.x, y, r, 0, Math.PI * 2)
          ctx.fill()
          if (inf > 0.35 && depth > 0.5) {
            ctx.globalAlpha = 0.18 * inf * fade
            ctx.beginPath()
            ctx.arc(node.x, y, r * 3.2, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        if (i % 3 === 0) {
          ctx.globalAlpha = (0.32 + inf * 0.6) * fade
          ctx.fillStyle = inf > 0.3 ? palette.signal : palette.faint
          ctx.fillText(PAIRS[i % PAIRS.length], w - 30, y)
          ctx.fillRect(w - 38, y, 5, 1)
        }
      }
      ctx.globalAlpha = 1
    }

    const frame = t => {
      raf = 0
      const dt = last ? Math.min(48, t - last) : 16
      last = t
      boost *= 0.94
      phase += (0.0105 + boost) * (dt / 16)
      draw()
      schedule()
    }

    const schedule = () => {
      if (raf || reduced.matches || !inView || document.hidden) return
      raf = window.requestAnimationFrame(frame)
    }

    const stop = () => {
      if (raf) window.cancelAnimationFrame(raf)
      raf = 0
      last = 0
    }

    const onMove = event => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active = true
      boost = Math.min(0.06, boost + Math.abs(pointer.y - pointer.lastY) * 0.00028)
      pointer.lastY = pointer.y
      if (reduced.matches) draw()
    }
    const onLeave = () => {
      pointer.active = false
      if (reduced.matches) draw()
    }
    const onVisibility = () => (document.hidden ? stop() : schedule())
    const onResize = () => {
      resize()
      draw()
    }
    const onMotion = () => {
      stop()
      draw()
      schedule()
    }

    const io =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(entries => {
            inView = entries.some(entry => entry.isIntersecting)
            if (inView) schedule()
            else stop()
          })
        : null
    io?.observe(canvas)
    const mo = new MutationObserver(() => {
      readPalette()
      draw()
    })
    mo.observe(html, { attributes: true, attributeFilter: ['class'] })

    hero.addEventListener('pointermove', onMove, { passive: true })
    hero.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    reduced.addEventListener?.('change', onMotion)

    readPalette()
    resize()
    draw()
    canvas.classList.add('is-live')
    schedule()

    helix = {
      canvas,
      destroy() {
        stop()
        io?.disconnect()
        mo.disconnect()
        hero.removeEventListener('pointermove', onMove)
        hero.removeEventListener('pointerleave', onLeave)
        window.removeEventListener('resize', onResize)
        document.removeEventListener('visibilitychange', onVisibility)
        reduced.removeEventListener?.('change', onMotion)
      },
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2. Hero 显微透镜                                                    */
  /* ------------------------------------------------------------------ */
  const initLens = () => {
    const hero = document.querySelector('.rhine-hero[data-rl-lens]')
    if (!(hero instanceof HTMLElement) || hero.dataset.rlLensBound === '1') return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    hero.dataset.rlLensBound = '1'
    const readout = hero.querySelector('[data-rl-lens-read]')
    let raf = 0
    let px = 0
    let py = 0
    const apply = () => {
      raf = 0
      hero.style.setProperty('--rl-lx', `${px}px`)
      hero.style.setProperty('--rl-ly', `${py}px`)
      if (readout) {
        const mag = 40 + Math.round((px / Math.max(1, hero.clientWidth)) * 360)
        readout.textContent = `X ${pad(px, 4)} · Y ${pad(py, 4)} · MAG ×${mag}`
      }
    }
    hero.addEventListener(
      'pointermove',
      event => {
        const rect = hero.getBoundingClientRect()
        px = event.clientX - rect.left
        py = event.clientY - rect.top
        hero.classList.add('is-lens')
        if (!raf) raf = window.requestAnimationFrame(apply)
      },
      { passive: true },
    )
    hero.addEventListener('pointerleave', () => hero.classList.remove('is-lens'))
  }

  /* ------------------------------------------------------------------ */
  /* 3. 解密读出                                                         */
  /* ------------------------------------------------------------------ */
  const GLYPH_LATIN = 'ABCDEF0123456789#%&/<>=+*'
  const GLYPH_CJK = '莱茵生命档案观测结构防卫生态源石样本收容协议研究'
  const DECRYPT_SELECTOR = '.rl-kicker, .rhine-hero__en, .rl-post__title, [data-rl-decrypt]'
  let decryptIO = null

  const scramble = el => {
    const target = el.textContent || ''
    if (!target.trim() || target.length > 72) return
    if (reduced.matches) return
    el.classList.add('is-decrypting')
    const chars = [...target]
    const duration = 520 + Math.min(chars.length, 40) * 14
    const start = performance.now()
    const pick = ch => {
      if (/\s/.test(ch) || /[·/—\-.:,，。]/.test(ch)) return ch
      const pool = /[\u3400-\u9fff]/.test(ch) ? GLYPH_CJK : GLYPH_LATIN
      return pool[Math.floor(Math.random() * pool.length)]
    }
    let lastOut = target
    const tick = now => {
      // 其它脚本（如学部切换台状态栏）在动画期间改写了文本：立即让位，不回写旧值
      if (el.textContent !== lastOut) {
        el.classList.remove('is-decrypting')
        return
      }
      const p = Math.min(1, (now - start) / duration)
      const revealed = Math.floor(p * chars.length)
      let out = ''
      for (let i = 0; i < chars.length; i++) out += i < revealed ? chars[i] : pick(chars[i])
      if (p < 1) {
        el.textContent = out
        lastOut = out
        window.requestAnimationFrame(tick)
      } else {
        el.textContent = target
        el.classList.remove('is-decrypting')
      }
    }
    window.requestAnimationFrame(tick)
  }

  const initDecrypt = () => {
    if (typeof IntersectionObserver !== 'function') return
    if (!decryptIO) {
      decryptIO = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            decryptIO.unobserve(entry.target)
            scramble(entry.target)
          }
        },
        { threshold: 0.6 },
      )
    }
    document.querySelectorAll(DECRYPT_SELECTOR).forEach(el => {
      if (!(el instanceof HTMLElement) || el.dataset.rlDecrypt === 'done') return
      // 只处理纯文本节点，避免破坏内部链接 / 图标结构
      if (el.children.length > 0) return
      el.dataset.rlDecrypt = 'done'
      decryptIO.observe(el)
    })
  }

  /* ------------------------------------------------------------------ */
  /* 4. 收容失效演习（IFRIT）                                            */
  /* ------------------------------------------------------------------ */
  const BREACH_LOG = [
    ['T+00.0', 'SENSOR', 'B-07 收容单元温度突破阈值 · 412°C'],
    ['T+00.7', 'SUBJECT', '伊芙利特 · 收容单元外壳熔穿'],
    ['T+01.5', 'ALERT', '第三区全员撤离 · 防火隔断落下'],
    ['T+02.4', 'DEFENSE', '塞雷娅已抵达现场 · 钙质屏障展开'],
    ['T+03.3', 'MEDICAL', '赫默 · 镇静剂注射完成'],
    ['T+04.2', 'STATUS', '收容恢复 · 伤亡 0 · 档案完好'],
  ]
  let breach = null

  const buildBreach = () => {
    const root = document.createElement('div')
    root.className = 'rl-breach'
    root.hidden = true
    root.setAttribute('role', 'alertdialog')
    root.setAttribute('aria-modal', 'true')
    root.setAttribute('aria-labelledby', 'rl-breach-title')
    root.setAttribute('aria-describedby', 'rl-breach-sub')
    root.innerHTML = `
      <canvas class="rl-breach__embers" aria-hidden="true"></canvas>
      <div class="rl-breach__vignette" aria-hidden="true"></div>
      <div class="rl-breach__stripe rl-breach__stripe--top" aria-hidden="true"></div>
      <div class="rl-breach__stripe rl-breach__stripe--bottom" aria-hidden="true"></div>
      <div class="rl-breach__panel">
        <p class="rl-breach__kicker"><i aria-hidden="true"></i>RHINE LAB // SECTOR-03 // EMERGENCY BROADCAST</p>
        <p class="rl-breach__title" id="rl-breach-title" data-text="CONTAINMENT BREACH">CONTAINMENT BREACH</p>
        <p class="rl-breach__sub" id="rl-breach-sub">收容失效 · 实验体 IFRIT · 单元 B-07</p>
        <div class="rl-breach__gauge" aria-hidden="true">
          <span>CORE TEMP / 核心温度</span>
          <b data-breach-temp>0036.5°C</b>
          <i><em data-breach-bar></em></i>
        </div>
        <ol class="rl-breach__log" data-breach-log></ol>
        <div class="rl-breach__foot">
          <span class="rl-breach__count" data-breach-count></span>
          <button type="button" class="rl-breach__close" data-breach-close>解除警报 / ESC</button>
        </div>
      </div>
    `
    document.body.appendChild(root)

    const canvas = root.querySelector('.rl-breach__embers')
    const ctx = canvas.getContext('2d')
    const titleEl = root.querySelector('#rl-breach-title')
    const subEl = root.querySelector('#rl-breach-sub')
    const tempEl = root.querySelector('[data-breach-temp]')
    const barEl = root.querySelector('[data-breach-bar]')
    const logEl = root.querySelector('[data-breach-log]')
    const countEl = root.querySelector('[data-breach-count]')
    const closeBtn = root.querySelector('[data-breach-close]')

    let particles = []
    let raf = 0
    let timers = []
    let spawning = false
    let returnFocus = null
    let temp = 36.5
    let tempTarget = 36.5
    let W = 0
    let H = 0

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = () => {
      const hot = Math.random()
      particles.push({
        x: Math.random() * W,
        y: H + 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(1.4 + Math.random() * 3.2),
        r: 0.8 + Math.random() * 2.6,
        life: 0,
        max: 90 + Math.random() * 140,
        hue: hot > 0.8 ? 48 : hot > 0.35 ? 26 : 8,
        wob: Math.random() * Math.PI * 2,
      })
    }

    const loop = () => {
      raf = 0
      ctx.clearRect(0, 0, W, H)
      if (spawning) for (let i = 0; i < 5; i++) spawn()
      ctx.globalCompositeOperation = 'lighter'
      particles = particles.filter(p => p.life < p.max && p.y > -20)
      for (const p of particles) {
        p.life++
        p.wob += 0.06
        p.x += p.vx + Math.sin(p.wob) * 0.6
        p.y += p.vy
        p.vy *= 0.996
        const k = 1 - p.life / p.max
        const flicker = 0.7 + Math.random() * 0.3
        ctx.globalAlpha = Math.max(0, k * flicker)
        ctx.fillStyle = `hsl(${p.hue} 100% ${55 + k * 20}%)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * (0.6 + k), 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = Math.max(0, k * 0.16)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1

      temp += (tempTarget - temp) * 0.06
      tempEl.textContent = `${temp.toFixed(1).padStart(6, '0')}°C`
      barEl.style.width = `${Math.min(100, (temp / 420) * 100)}%`

      if (!root.hidden && (particles.length || spawning || Math.abs(temp - tempTarget) > 0.2)) {
        raf = window.requestAnimationFrame(loop)
      }
    }

    const later = (ms, fn) => timers.push(window.setTimeout(fn, ms))

    const addLog = ([t, tag, text], index) => {
      const li = document.createElement('li')
      li.style.setProperty('--i', String(index))
      li.innerHTML = `<time>${t}</time><b>${tag}</b><span></span>`
      li.querySelector('span').textContent = text
      if (tag === 'STATUS') li.classList.add('is-ok')
      logEl.appendChild(li)
    }

    const close = () => {
      if (root.hidden) return
      for (const id of timers) window.clearTimeout(id)
      timers = []
      spawning = false
      if (raf) window.cancelAnimationFrame(raf)
      raf = 0
      particles = []
      root.classList.remove('is-on', 'is-restored')
      root.hidden = true
      html.classList.remove('rl-breach-lock')
      window.removeEventListener('resize', resize)
      if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus()
    }

    const open = () => {
      if (!root.hidden) return
      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      const record = readJSON(BREACH_KEY, { count: 0, last: '' })
      const prevLast = record.last
      record.count = (Number(record.count) || 0) + 1
      record.last = today()
      writeJSON(BREACH_KEY, record)
      countEl.textContent = `累计收容事故 ${pad(record.count, 3)} 次${prevLast ? ` · 上次 ${prevLast}` : ''}`

      logEl.textContent = ''
      titleEl.textContent = 'CONTAINMENT BREACH'
      titleEl.dataset.text = 'CONTAINMENT BREACH'
      subEl.textContent = '收容失效 · 实验体 IFRIT · 单元 B-07'
      temp = 36.5
      tempTarget = 412
      resize()
      window.addEventListener('resize', resize)
      root.hidden = false
      html.classList.add('rl-breach-lock')
      void root.offsetHeight
      root.classList.add('is-on')
      closeBtn.focus()

      const restore = () => {
        spawning = false
        tempTarget = 36.5
        root.classList.add('is-restored')
        titleEl.textContent = 'CONTAINMENT RESTORED'
        titleEl.dataset.text = 'CONTAINMENT RESTORED'
        subEl.textContent = '收容已恢复 · 本次为档案室防火演习，与实际事故无关（大概）'
        if (reduced.matches) {
          temp = tempTarget
          loop()
        }
      }

      if (reduced.matches) {
        BREACH_LOG.forEach(addLog)
        temp = 412
        loop()
        later(1200, restore)
      } else {
        spawning = true
        loop()
        BREACH_LOG.forEach((row, i) => {
          const ms = Number.parseFloat(row[0].slice(2)) * 1000 + 300
          later(ms, () => {
            addLog(row, i)
            if (!raf) loop()
          })
        })
        later(4600, () => {
          restore()
          if (!raf) loop()
        })
      }
      later(reduced.matches ? 9000 : 11000, close)
    }

    closeBtn.addEventListener('click', close)
    root.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        event.preventDefault()
        closeBtn.focus()
      }
    })
    root.addEventListener('click', event => {
      if (event.target === root || event.target === canvas) close()
    })

    return { open, close, root }
  }

  const triggerBreach = () => {
    if (!breach) breach = buildBreach()
    document.getElementById('rl-site-egg-close')?.click()
    breach.open()
  }

  let keyBuffer = ''
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && breach && !breach.root.hidden) {
      event.preventDefault()
      breach.close()
      return
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (isTyping(event.target) || event.key.length !== 1) return
    keyBuffer = (keyBuffer + event.key.toLowerCase()).slice(-5)
    if (keyBuffer === 'ifrit') {
      keyBuffer = ''
      triggerBreach()
    }
  })

  document.addEventListener('click', event => {
    const trigger = event.target instanceof Element ? event.target.closest('[data-rl-breach]') : null
    if (!trigger) return
    event.preventDefault()
    triggerBreach()
  })

  /* ------------------------------------------------------------------ */
  /* 5. 审阅印章 + 调阅登记                                              */
  /* ------------------------------------------------------------------ */
  const normPath = raw => {
    try {
      const p = decodeURI(new URL(raw, window.location.href).pathname)
      return p.endsWith('/') ? p : `${p}/`
    } catch {
      return raw
    }
  }

  const markCards = () => {
    const read = readJSON(READ_KEY, {})
    document.querySelectorAll('.rl-card').forEach(card => {
      const link = card.querySelector('a.rl-card__title[href]')
      if (!link) return
      const stamp = read[normPath(link.getAttribute('href'))]
      const chip = card.querySelector('.rl-card__read')
      card.classList.toggle('is-read', !!stamp)
      if (chip instanceof HTMLElement) {
        chip.hidden = !stamp
        if (stamp) chip.title = `首次审阅 ${stamp}`
      }
    })
  }

  let reviewIO = null
  const initReview = () => {
    const box = document.querySelector('[data-rl-review]')
    if (!(box instanceof HTMLElement) || box.dataset.rlReviewBound === '1') return
    box.dataset.rlReviewBound = '1'
    const key = normPath(window.location.href)
    const dateEl = box.querySelector('[data-rl-review-date]')
    const noteEl = box.querySelector('[data-rl-review-note]')

    const render = (first, isNew) => {
      const read = readJSON(READ_KEY, {})
      const total = Object.keys(read).length
      if (dateEl) dateEl.textContent = `REVIEWED · ${first}`
      if (noteEl) {
        noteEl.textContent = isNew
          ? `OBSERVER-07 签收 · 本档案已归入你的调阅记录（累计 ${pad(total)} 份）`
          : `首次审阅于 ${first} · 调阅记录累计 ${pad(total)} 份`
      }
    }

    const existing = readJSON(READ_KEY, {})[key]
    if (existing) {
      render(existing, false)
      box.classList.add('is-filed')
      return
    }

    const stampNow = () => {
      const read = readJSON(READ_KEY, {})
      if (!read[key]) read[key] = today()
      writeJSON(READ_KEY, read)
      render(read[key], true)
      box.classList.add('is-stamped')
    }

    if (typeof IntersectionObserver !== 'function') {
      stampNow()
      return
    }
    reviewIO?.disconnect()
    reviewIO = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        reviewIO.disconnect()
        stampNow()
      },
      { threshold: 0.75 },
    )
    reviewIO.observe(box)
  }

  /* ------------------------------------------------------------------ */
  /* 页面生命周期：首屏 + Swup 换页后都重新挂载（全部幂等）              */
  /* ------------------------------------------------------------------ */
  const mount = () => {
    initHelix()
    initLens()
    initDecrypt()
    markCards()
    initReview()
  }

  mount()
  document.addEventListener('astro:page-load', mount)
  document.addEventListener('astro:after-swap', () => window.setTimeout(mount, 60))
  const hookSwup = () => window.swup?.hooks?.on?.('page:view', () => window.setTimeout(mount, 30))
  if (window.swup?.hooks) hookSwup()
  else document.addEventListener('swup:enable', hookSwup, { once: true })
})()
