/* PJ COMMAND CENTER — Ctrl/Cmd + K */
(() => {
  'use strict';

  const actions = [
    ['Home', 'Jump to the hero', '#home', '01'],
    ['About', 'Who is Pete Junior?', '#about', '02'],
    ['Projects', 'Explore featured builds', '#projects', '03'],
    ['Skills', 'View the tech stack', '#skills', '04'],
    ['Contact', 'Start a conversation', '#contact', '05'],
    ['Terminal', 'Focus the interactive terminal', 'terminal', '/'],
    ['GitHub', 'Open Pete Junior on GitHub', 'https://github.com/petejunior1up', '↗'],
    ['Scientific Calculator', 'Open the live project', 'https://petejunior1up.github.io/Scientific-Calculator/', '↗'],
    ['The Love Archive', 'Open the editorial project', 'https://petejunior1up.github.io/Love-Letters/', '↗'],
    ['Top', 'Return to the beginning', 'top', '↑']
  ];

  const style = document.createElement('style');
  style.textContent = `
    .pjcc-trigger{position:fixed;right:22px;bottom:22px;z-index:9997;border:1px solid rgba(255,255,255,.16);background:rgba(10,10,10,.78);backdrop-filter:blur(18px);color:#fff;padding:10px 13px;font:700 11px/1 monospace;letter-spacing:.08em;cursor:pointer;box-shadow:0 14px 40px rgba(0,0,0,.28)}
    .pjcc-trigger span{opacity:.48;margin-left:8px}.pjcc{position:fixed;inset:0;z-index:9999;display:grid;place-items:start center;padding-top:min(16vh,140px);background:rgba(0,0,0,.68);backdrop-filter:blur(12px);opacity:0;pointer-events:none;transition:opacity .18s ease}.pjcc.open{opacity:1;pointer-events:auto}
    .pjcc-panel{width:min(680px,calc(100vw - 28px));max-height:min(650px,76vh);overflow:hidden;background:#0b0b0b;border:1px solid rgba(255,255,255,.14);box-shadow:0 35px 100px rgba(0,0,0,.65);transform:translateY(-10px) scale(.985);transition:transform .18s ease}.pjcc.open .pjcc-panel{transform:none}
    .pjcc-head{display:flex;align-items:center;gap:13px;padding:17px 18px;border-bottom:1px solid rgba(255,255,255,.1)}.pjcc-mark{display:grid;place-items:center;width:30px;height:30px;background:#fff;color:#050505;font:900 11px monospace}.pjcc-input{flex:1;border:0;outline:0;background:transparent;color:#fff;font:600 15px/1.3 system-ui,sans-serif}.pjcc-input::placeholder{color:#666}.pjcc-esc{color:#666;font:10px monospace;border:1px solid #292929;padding:4px 6px}
    .pjcc-label{padding:13px 18px 8px;color:#555;font:700 9px monospace;letter-spacing:.18em}.pjcc-list{overflow:auto;max-height:470px;padding:0 8px 8px}.pjcc-item{width:100%;display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;text-align:left;border:0;background:transparent;color:#fff;padding:13px 11px;cursor:pointer}.pjcc-item:hover,.pjcc-item.active{background:#151515}.pjcc-title{display:block;font:700 13px system-ui,sans-serif}.pjcc-desc{display:block;margin-top:3px;color:#666;font:11px system-ui,sans-serif}.pjcc-key{color:#777;font:700 10px monospace}.pjcc-empty{padding:30px 12px;color:#666;text-align:center;font:12px monospace}.pjcc-foot{display:flex;justify-content:space-between;padding:11px 18px;border-top:1px solid rgba(255,255,255,.08);color:#555;font:9px monospace;letter-spacing:.08em}
    @media(max-width:600px){.pjcc{padding-top:9vh}.pjcc-trigger{right:14px;bottom:14px}.pjcc-trigger span{display:none}.pjcc-foot span:last-child{display:none}}
    @media(prefers-reduced-motion:reduce){.pjcc,.pjcc-panel{transition:none}}
  `;
  document.head.appendChild(style);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'pjcc-trigger';
  trigger.setAttribute('aria-label', 'Open PJ Command Center');
  trigger.innerHTML = 'PJ // COMMAND <span>⌘K</span>';
  document.body.appendChild(trigger);

  const root = document.createElement('div');
  root.className = 'pjcc';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `<div class="pjcc-panel" role="dialog" aria-modal="true" aria-label="PJ Command Center"><div class="pjcc-head"><span class="pjcc-mark">PJ</span><input class="pjcc-input" type="search" autocomplete="off" placeholder="Where do you want to go?" aria-label="Search commands"><span class="pjcc-esc">ESC</span></div><div class="pjcc-label">COMMAND CENTER // QUICK ACCESS</div><div class="pjcc-list"></div><div class="pjcc-foot"><span>↑↓ NAVIGATE &nbsp; ENTER SELECT</span><span>PJ CORE // 2026</span></div></div>`;
  document.body.appendChild(root);

  const input = root.querySelector('.pjcc-input');
  const list = root.querySelector('.pjcc-list');
  let filtered = actions.slice();
  let active = 0;

  function render() {
    if (!filtered.length) { list.innerHTML = '<div class="pjcc-empty">NO COMMAND FOUND // TRY SOMETHING ELSE</div>'; return; }
    list.innerHTML = filtered.map((a,i) => `<button class="pjcc-item${i===active?' active':''}" type="button" data-i="${i}"><span><span class="pjcc-title">${a[0]}</span><span class="pjcc-desc">${a[1]}</span></span><span class="pjcc-key">${a[3]}</span></button>`).join('');
  }

  function open() { root.classList.add('open'); root.setAttribute('aria-hidden','false'); input.value=''; filtered=actions.slice(); active=0; render(); setTimeout(()=>input.focus(),20); }
  function close() { root.classList.remove('open'); root.setAttribute('aria-hidden','true'); trigger.focus(); }
  function run(action) {
    close();
    const target = action[2];
    if (target === 'terminal') { document.getElementById('terminalInput')?.focus(); document.querySelector('.terminal-section')?.scrollIntoView({behavior:'smooth',block:'center'}); return; }
    if (target === 'top') { window.scrollTo({top:0,behavior:'smooth'}); return; }
    if (target.startsWith('#')) { document.querySelector(target)?.scrollIntoView({behavior:'smooth'}); history.replaceState(null,'',target); return; }
    window.open(target, '_blank', 'noopener,noreferrer');
  }

  trigger.addEventListener('click', open);
  root.addEventListener('click', e => { if (e.target === root) close(); const btn=e.target.closest('.pjcc-item'); if(btn) run(filtered[Number(btn.dataset.i)]); });
  input.addEventListener('input', () => { const q=input.value.trim().toLowerCase(); filtered=actions.filter(a => `${a[0]} ${a[1]}`.toLowerCase().includes(q)); active=0; render(); });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k') { e.preventDefault(); root.classList.contains('open') ? close() : open(); return; }
    if (!root.classList.contains('open')) return;
    if (e.key==='Escape') close();
    if (e.key==='ArrowDown' && filtered.length) { e.preventDefault(); active=(active+1)%filtered.length; render(); list.querySelector('.active')?.scrollIntoView({block:'nearest'}); }
    if (e.key==='ArrowUp' && filtered.length) { e.preventDefault(); active=(active-1+filtered.length)%filtered.length; render(); list.querySelector('.active')?.scrollIntoView({block:'nearest'}); }
    if (e.key==='Enter' && filtered[active]) { e.preventDefault(); run(filtered[active]); }
  });
  render();
})();
