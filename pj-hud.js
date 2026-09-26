/* PJ PULSE HUD — ambient node field + live interface status */
(() => {
  const init = () => {
    if (document.querySelector('.pjhud')) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer:fine)').matches;

    const canvas = document.createElement('canvas');
    canvas.id = 'pjhud-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const scan = document.createElement('div');
    scan.className = 'pjhud-scan';
    scan.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scan);

    const hud = document.createElement('div');
    hud.className = 'pjhud';
    hud.innerHTML = `
      <div class="pjhud-core" aria-hidden="true"><span class="pjhud-logo">PJ</span></div>
      <div class="pjhud-panel" role="status" aria-live="polite">
        <div class="pjhud-top">
          <span>PJ // INTERFACE</span>
          <span class="pjhud-online">ONLINE</span>
        </div>
        <div class="pjhud-row">
          <span class="pjhud-section">HOME</span>
          <time class="pjhud-clock">00:00:00</time>
        </div>
        <div class="pjhud-track" aria-hidden="true"><i></i></div>
        <div class="pjhud-percent">SCROLL // 000%</div>
      </div>
    `;
    document.body.appendChild(hud);

    const sectionEl = hud.querySelector('.pjhud-section');
    const clockEl = hud.querySelector('.pjhud-clock');
    const barEl = hud.querySelector('.pjhud-track > i');
    const percentEl = hud.querySelector('.pjhud-percent');
    const onlineEl = hud.querySelector('.pjhud-online');

    const sections = [...document.querySelectorAll('main section[id]')];
    const namedFallbacks = [
      ['.hero', 'HOME'],
      ['.mission', 'MISSION'],
      ['.terminal-section', 'SYSTEM ACCESS']
    ].map(([selector, name]) => [document.querySelector(selector), name]).filter(([el]) => el);

    function updateClock() {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour12: false });
    }

    function updateOnline() {
      const online = navigator.onLine;
      onlineEl.textContent = online ? 'ONLINE' : 'OFFLINE';
      onlineEl.style.color = online ? '' : '#ff6b7a';
    }

    function currentSection() {
      const probe = window.scrollY + Math.min(window.innerHeight * .42, 360);
      let best = 'HOME';
      const candidates = [
        ...namedFallbacks.map(([el, name]) => ({ el, name })),
        ...sections.map(el => ({ el, name: el.id.replace(/-/g, ' ') }))
      ];
      candidates.forEach(({ el, name }) => {
        if (el.offsetTop <= probe) best = name;
      });
      return best;
    }

    function updateScroll() {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.max(0, Math.min(100, (window.scrollY / max) * 100));
      barEl.style.width = pct.toFixed(2) + '%';
      percentEl.textContent = 'SCROLL // ' + String(Math.round(pct)).padStart(3, '0') + '%';
      sectionEl.textContent = currentSection();
    }

    updateClock();
    updateOnline();
    updateScroll();
    const clockTimer = setInterval(updateClock, 1000);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx || reduced) return;

    let width = 0, height = 0, dpr = 1, raf = 0;
    let nodes = [];
    const pointer = { x: -9999, y: -9999, active: false };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(18, Math.min(54, Math.floor((width * height) / 28000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - .5) * .18,
        vy: (Math.random() - .5) * .18,
        r: Math.random() * 1.25 + .55
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        if (pointer.active && finePointer) {
          const dx = pointer.x - n.x, dy = pointer.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180 && dist > 1) {
            const pull = (1 - dist / 180) * .006;
            n.vx += dx * pull * .02;
            n.vy += dy * pull * .02;
          }
        }

        n.x += n.vx;
        n.y += n.vy;
        n.vx *= .995;
        n.vy *= .995;
        if (n.x < -10) n.x = width + 10;
        if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10;
        if (n.y > height + 10) n.y = -10;
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 118) {
            ctx.strokeStyle = 'rgba(99,245,255,' + ((1 - dist / 118) * .12).toFixed(3) + ')';
            ctx.lineWidth = .65;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.fillStyle = i % 5 === 0 ? 'rgba(159,124,255,.52)' : 'rgba(99,245,255,.48)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    window.addEventListener('pointermove', e => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener('pointerleave', () => { pointer.active = false; });
    window.addEventListener('resize', resize, { passive: true });

    resize();
    draw();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        cancelAnimationFrame(raf);
        draw();
      }
    });

    window.addEventListener('pagehide', () => {
      clearInterval(clockTimer);
      cancelAnimationFrame(raf);
    }, { once: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
