/* PJ CORE // OS — cohesive interface layer */
(()=>{
  if(window.PJCoreOS)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    document.body.classList.add('pjcore-os');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
    const THEME_NAMES={red:'RED CORE',cyan:'CYAN PROTOCOL',violet:'VIOLET VOID',mono:'MONO STEALTH'};
    const startedAt=Date.now();
    let idle=false,idleTimer=null,paletteIndex=0,commandRows=[];

    /* ---------- Global top bar ---------- */
    const top=document.createElement('div');
    top.className='pjcore-topbar';
    top.innerHTML=`<div class="pjcore-top-left"><span class="pjcore-core"><i></i>PJ CORE // <b id="pjcoreState">ONLINE</b></span><span id="pjcoreTheme">RED CORE</span></div><div class="pjcore-top-right"><span id="pjcoreNetwork">NETWORK // …</span><span id="pjcoreAdmin">ADMIN // LOCKED</span><button type="button" id="pjcorePaletteBtn" title="Open Command Palette">CTRL + K</button><button type="button" id="pjcoreHelpBtn" title="Keyboard shortcuts">?</button></div>`;
    document.body.prepend(top);

    /* ---------- Command palette ---------- */
    const palette=document.createElement('div');
    palette.className='pjcore-palette';palette.setAttribute('aria-hidden','true');
    palette.innerHTML=`<div class="pjcore-palette-card" role="dialog" aria-modal="true" aria-label="PJ command palette"><div class="pjcore-palette-head"><span>PJ CORE // COMMAND PALETTE</span><kbd>ESC</kbd></div><div class="pjcore-palette-search"><span>›</span><input id="pjcoreCommandInput" autocomplete="off" spellcheck="false" placeholder="Search commands, routes, themes…"></div><div class="pjcore-command-list" id="pjcoreCommandList"></div><div class="pjcore-palette-foot"><span>↑↓ NAVIGATE</span><span>ENTER EXECUTE</span><span>CTRL+K TOGGLE</span></div></div>`;
    document.body.appendChild(palette);
    const commandInput=$('#pjcoreCommandInput',palette), commandList=$('#pjcoreCommandList',palette);
    const click=(sel)=>document.querySelector(sel)?.click();
    const go=id=>{document.querySelector(id)?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});closePalette()};
    const commands=[
      {name:'Home',hint:'Route',keys:'home',run:()=>go('#home')},
      {name:'About Me',hint:'Route',keys:'about profile',run:()=>go('#about')},
      {name:'Projects',hint:'Route',keys:'projects work builds',run:()=>go('#projects')},
      {name:'Skills',hint:'Route',keys:'skills stack',run:()=>go('#skills')},
      {name:'Contact',hint:'Route',keys:'contact email whatsapp',run:()=>go('#contact')},
      {name:'Open Command Center',hint:'System',keys:'command center terminal controls',run:()=>{closePalette();click('.pjcc-btn')}},
      {name:'Focus Terminal',hint:'System',keys:'terminal shell command line',run:()=>{closePalette();$('.terminal-section')?.scrollIntoView({behavior:reduced?'auto':'smooth'});setTimeout(()=>$('#terminalInput')?.focus(),250)}},
      {name:'Open PJ Network',hint:'Community',keys:'network community',run:()=>{closePalette();window.PJNetwork?.open?.()}},
      {name:'Open PJ Lounge',hint:'Community',keys:'lounge chat private',run:()=>{closePalette();window.PJLounge?.open?.()}},
      {name:'Open PJ Social',hint:'Community',keys:'social follow polls',run:()=>{closePalette();window.PJSocial?.open?.()}},
      {name:'Open PJ Admin',hint:'Owner',keys:'admin owner secure',run:()=>{closePalette();window.PJAdminAuth?.open?.()}},
      {name:'Theme: Red Core',hint:'Theme',keys:'red theme',run:()=>setTheme('red')},
      {name:'Theme: Cyan Protocol',hint:'Theme',keys:'cyan blue theme',run:()=>setTheme('cyan')},
      {name:'Theme: Violet Void',hint:'Theme',keys:'violet purple theme',run:()=>setTheme('violet')},
      {name:'Theme: Mono Stealth',hint:'Theme',keys:'mono white grayscale theme',run:()=>setTheme('mono')},
      {name:'Show Keyboard Shortcuts',hint:'Help',keys:'help shortcuts keyboard',run:()=>{closePalette();openHelp()}},
      {name:'Scroll to Top',hint:'Utility',keys:'top beginning',run:()=>{closePalette();scrollTo({top:0,behavior:reduced?'auto':'smooth'})}}
    ];
    function setTheme(theme){
      const b=document.querySelector(`.pjx-theme-btn[data-theme="${theme}"]`);if(b)b.click();
      else{document.documentElement.dataset.pjTheme=theme;try{localStorage.setItem('pjTheme',theme)}catch(_){}}
      closePalette();
    }
    function renderCommands(){
      const q=commandInput.value.trim().toLowerCase();
      commandRows=commands.filter(c=>!q||`${c.name} ${c.hint} ${c.keys}`.toLowerCase().includes(q)).slice(0,12);
      paletteIndex=Math.min(paletteIndex,Math.max(0,commandRows.length-1));
      commandList.innerHTML=commandRows.length?commandRows.map((c,i)=>`<button type="button" class="pjcore-command ${i===paletteIndex?'active':''}" data-i="${i}"><span>${c.name}</span><small>${c.hint}</small></button>`).join(''):`<div class="pjcore-command-empty">NO MATCHING COMMANDS // TRY ANOTHER SIGNAL</div>`;
      $$('.pjcore-command',commandList).forEach(b=>b.onclick=()=>commandRows[+b.dataset.i]?.run());
    }
    function openPalette(){palette.classList.add('open');palette.setAttribute('aria-hidden','false');paletteIndex=0;commandInput.value='';renderCommands();setTimeout(()=>commandInput.focus(),0)}
    function closePalette(){palette.classList.remove('open');palette.setAttribute('aria-hidden','true')}
    commandInput.addEventListener('input',()=>{paletteIndex=0;renderCommands()});
    commandInput.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();paletteIndex=Math.min(commandRows.length-1,paletteIndex+1);renderCommands()}else if(e.key==='ArrowUp'){e.preventDefault();paletteIndex=Math.max(0,paletteIndex-1);renderCommands()}else if(e.key==='Enter'){e.preventDefault();commandRows[paletteIndex]?.run()}});
    palette.addEventListener('click',e=>{if(e.target===palette)closePalette()});
    $('#pjcorePaletteBtn').onclick=openPalette;

    /* ---------- Keyboard overlay ---------- */
    const help=document.createElement('div');help.className='pjcore-help';help.setAttribute('aria-hidden','true');
    help.innerHTML=`<div class="pjcore-help-card"><div class="pjcore-help-head"><div><small>PJ CORE // INPUT MAP</small><strong>KEYBOARD SHORTCUTS</strong></div><button type="button" aria-label="Close shortcuts">×</button></div><div class="pjcore-help-grid"><div><kbd>Ctrl K</kbd><span>Command Palette</span></div><div><kbd>Ctrl Shift N</kbd><span>PJ Network</span></div><div><kbd>Ctrl Shift A</kbd><span>PJ Admin</span></div><div><kbd>?</kbd><span>This Overlay</span></div><div><kbd>Esc</kbd><span>Close Active Layer</span></div><div><kbd>↑ ↓ Enter</kbd><span>Palette Navigation</span></div></div><p>Keyboard focus uses the active theme so every control stays visible.</p></div>`;
    document.body.appendChild(help);
    function openHelp(){help.classList.add('open');help.setAttribute('aria-hidden','false')}
    function closeHelp(){help.classList.remove('open');help.setAttribute('aria-hidden','true')}
    $('.pjcore-help-head button',help).onclick=closeHelp; help.onclick=e=>{if(e.target===help)closeHelp()}; $('#pjcoreHelpBtn').onclick=openHelp;

    /* ---------- Hero telemetry ---------- */
    const hero=$('.hero-content');
    if(hero&&!$('.pjcore-telemetry',hero)){
      const projects=$$('.project-card:not(.coming-soon)').length;
      const tele=document.createElement('div');tele.className='pjcore-telemetry';tele.innerHTML=`<span><small>STATUS</small><strong><i></i>ONLINE</strong></span><span><small>PROJECTS</small><strong>${String(projects).padStart(2,'0')}</strong></span><span><small>SYSTEM</small><strong>V4</strong></span><span><small>LOCATION</small><strong>UGANDA</strong></span>`;
      hero.appendChild(tele);
    }

    /* ---------- Footer diagnostics ---------- */
    const footer=$('footer');
    if(footer&&!$('.pjcore-diagnostics',footer)){
      const diag=document.createElement('div');diag.className='pjcore-diagnostics';diag.innerHTML=`<span><i></i>CORE ONLINE</span><span id="pjcoreDiagNet">NETWORK READY</span><span>BUILD 2026.10</span><span id="pjcoreUptime">UPTIME 00:00</span>`;footer.appendChild(diag);
    }

    /* ---------- Smooth boot handoff ---------- */
    function bootHandoff(){
      const boot=$('.pj-boot');
      if(!boot){document.body.classList.add('pjcore-ready');return}
      document.body.classList.add('pjcore-booting');
      const obs=new MutationObserver(()=>{
        if(!document.body.contains(boot)||boot.classList.contains('is-done')){
          document.body.classList.remove('pjcore-booting');document.body.classList.add('pjcore-ready');obs.disconnect();
        }
      });obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
      setTimeout(()=>{document.body.classList.remove('pjcore-booting');document.body.classList.add('pjcore-ready');obs.disconnect()},2300);
    }
    bootHandoff();

    /* ---------- Staggered section entrances ---------- */
    const revealTargets=$$('.section-heading,.project-card,.lab-card,.now-building,.activity-log,.contact-box,.terminal-window,.mission>div');
    revealTargets.forEach((el,i)=>{el.classList.add('pjcore-reveal');el.style.setProperty('--pjcore-delay',`${(i%5)*45}ms`)});
    if(reduced||!('IntersectionObserver'in window))revealTargets.forEach(el=>el.classList.add('shown'));
    else{
      const io=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('shown');io.unobserve(en.target)}}),{threshold:.08,rootMargin:'0px 0px -5%'});
      revealTargets.forEach(el=>io.observe(el));
    }

    /* ---------- Project card depth ---------- */
    if(!reduced&&matchMedia('(hover:hover) and (pointer:fine)').matches){
      $$('.project-card:not(.coming-soon)').forEach(card=>{
        card.classList.add('pjcore-tilt');
        card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.setProperty('--rx',`${(-y*3.2).toFixed(2)}deg`);card.style.setProperty('--ry',`${(x*4).toFixed(2)}deg`);card.style.setProperty('--mx',`${((x+.5)*100).toFixed(1)}%`);card.style.setProperty('--my',`${((y+.5)*100).toFixed(1)}%`)});
        card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg')});
      });
    }

    /* ---------- Status language ---------- */
    function normalizeStatuses(root=document){
      $$('.project-status,.lab-status,.system-live,.terminal-status,.pjn-chip,.pjl-notice',root).forEach(el=>{
        const t=el.textContent.trim().toUpperCase();
        el.classList.add('pjcore-status-chip');
        el.dataset.pjcoreStatus=/LOCK|ERROR|DANGER|REJECT|MUTE/.test(t)?'danger':/BUILD|WAIT|WARN|PLAN|BUSY|CODING/.test(t)?'warn':/LIVE|ONLINE|SECURE|VERIFIED|READY|ACTIVE|SHIPPED|OK/.test(t)?'ok':/PRIVATE/.test(t)?'private':'neutral';
      });
    }

    /* ---------- Toast enhancement ---------- */
    function polishToast(el){
      if(!el)return;const t=el.textContent.trim().toUpperCase();
      el.dataset.pjcoreToast=/ERROR|FAILED|DENIED|BLOCK|LOCKED/.test(t)?'error':/WARN|WAIT|BUILDING/.test(t)?'warn':/SAVED|READY|ONLINE|CREATED|PUBLISHED|UPDATED|COPIED|COMPLETE|VERIFIED|SECURE/.test(t)?'ok':'info';
    }

    /* ---------- Loading skeletons ---------- */
    function pulsePanel(tab){
      const k=tab?.dataset?.tab;if(!k)return;const panel=document.querySelector(`.pjn-panel[data-panel="${CSS.escape(k)}"]`);if(!panel)return;
      panel.classList.add('pjcore-loading');clearTimeout(panel._pjcoreLoadTimer);panel._pjcoreLoadTimer=setTimeout(()=>panel.classList.remove('pjcore-loading'),360);
    }

    /* ---------- Mobile Network bottom nav ---------- */
    const mobileTabs=[['home','HOME','⌂'],['notifications','NOTIFS','◌'],['dms','DMS','✉'],['builds','BUILDS','◇'],['admin','ADMIN','◆']];
    function ensureMobileNav(){
      const shell=$('.pjn-shell');if(!shell||$('.pjcore-mobile-nav',shell))return;
      const nav=document.createElement('nav');nav.className='pjcore-mobile-nav';nav.setAttribute('aria-label','PJ Network mobile navigation');nav.innerHTML=mobileTabs.map(([k,n,i])=>`<button type="button" data-tab="${k}"><i>${i}</i><span>${n}</span></button>`).join('');shell.appendChild(nav);
      $$('button',nav).forEach(b=>b.onclick=()=>{window.PJNetwork?.switchTab?.(b.dataset.tab);syncMobileNav()});syncMobileNav();
    }
    function syncMobileNav(){const active=$('.pjn-tabs button.active')?.dataset.tab;$$('.pjcore-mobile-nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===active))}

    /* ---------- Presence rings ---------- */
    function syncPresence(){
      const v=$('#pjnAvailability')?.value||document.documentElement.dataset.pjPresence||'online';
      document.documentElement.dataset.pjPresence=v;
      $$('.pjn-id-avatar,.pjl-avatar,.pjl-msg-avatar').forEach(el=>el.dataset.pjPresence=v);
    }

    /* ---------- Visual Admin session timeline ---------- */
    const activityKey='pjCoreAdminVisualActivity';
    function readActivity(){try{return JSON.parse(sessionStorage.getItem(activityKey)||'[]')}catch(_){return[]}}
    function logActivity(label,kind='info'){
      const rows=readActivity();const now=Date.now();
      if(rows[0]?.label===label&&now-rows[0].time<1200)return;
      rows.unshift({label:String(label).slice(0,90),kind,time:now});
      try{sessionStorage.setItem(activityKey,JSON.stringify(rows.slice(0,8)))}catch(_){}
      mountAdminTimeline();
    }
    function mountAdminTimeline(){
      const panel=$('#pjnAdmin'), auth=window.PJAdminAuth?.state;if(!panel||!auth?.secure)return;
      let box=$('.pjcore-admin-timeline',panel);if(!box){box=document.createElement('section');box.className='pjcore-admin-timeline';const foot=$('.pjap-footer',panel);foot?panel.insertBefore(box,foot):panel.appendChild(box)}
      const rows=readActivity();const sig=JSON.stringify(rows.map(r=>[r.label,r.kind,r.time]));if(box.dataset.sig===sig)return;box.dataset.sig=sig;box.innerHTML=`<div class="pjcore-timeline-head"><div><small>SESSION ACTIVITY // VISUAL LOG</small><strong>ADMIN SIGNAL TIMELINE</strong></div><span>THIS BROWSER SESSION</span></div><div class="pjcore-timeline-list">${(rows.length?rows:[{label:'Secure owner session active',kind:'ok',time:Date.now()}]).map(r=>`<div class="pjcore-timeline-row" data-kind="${r.kind}"><i></i><div><strong>${escapeHtml(r.label)}</strong><small>${new Date(r.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}</small></div></div>`).join('')}</div>`;
    }
    function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]))}

    /* ---------- Idle ambience ---------- */
    function wake(){
      if(idle){idle=false;document.documentElement.dataset.pjCoreIdle='0';logActivity('PJ CORE resumed from idle','info')}
      clearTimeout(idleTimer);idleTimer=setTimeout(()=>{idle=true;document.documentElement.dataset.pjCoreIdle='1'},45000);
    }
    ['pointerdown','pointermove','keydown','touchstart','scroll'].forEach(ev=>window.addEventListener(ev,wake,{passive:true}));wake();

    /* ---------- Global event wiring ---------- */
    document.addEventListener('keydown',e=>{
      const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')||document.activeElement?.isContentEditable;
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palette.classList.contains('open')?closePalette():openPalette();return}
      if(e.key==='Escape'){closePalette();closeHelp();return}
      if(e.key==='?'&&!typing&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();openHelp()}
    });
    document.addEventListener('click',e=>{
      const tab=e.target.closest('.pjn-tabs button');if(tab){pulsePanel(tab);setTimeout(syncMobileNav,60)}
      const btn=e.target.closest('button');if(!btn)return;
      const txt=btn.textContent.trim().replace(/\s+/g,' ').toUpperCase();
      if(!$('#pjnAdmin')?.contains(btn))return;
      if(/CREATE EVENT/.test(txt))logActivity('Event publish requested','ok');
      else if(/PUBLISH CHANGELOG/.test(txt))logActivity('Changelog publish requested','ok');
      else if(/CREATE POLL/.test(txt))logActivity('Poll creation requested','ok');
      else if(/MUTE 24H/.test(txt))logActivity('User moderation: 24H mute requested','warn');
      else if(/^CLEAR$/.test(txt))logActivity('Moderation clearance requested','warn');
      else if(/SIGN OUT ADMIN/.test(txt))logActivity('Admin sign-out requested','danger');
      else if(/LOCK ADMIN/.test(txt))logActivity('Admin lock requested','warn');
    },true);
    document.addEventListener('change',e=>{if(e.target?.id==='pjnAvailability')syncPresence()});

    /* ---------- Mutation pass ---------- */
    let mutationQueued=false;
    const observer=new MutationObserver(()=>{
      if(mutationQueued)return;mutationQueued=true;queueMicrotask(()=>{
        mutationQueued=false;normalizeStatuses();ensureMobileNav();syncMobileNav();syncPresence();mountAdminTimeline();
        $$('.pjn-toast,.pjx-toast,.pja2-status').forEach(polishToast);
      });
    });observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','data-type']});

    /* ---------- Periodic system state ---------- */
    let lastAdminSecure=false;
    function updateSystem(){
      const theme=document.documentElement.dataset.pjTheme||'red';$('#pjcoreTheme').textContent=THEME_NAMES[theme]||theme.toUpperCase();
      const net=window.PJNetwork?.state;const networkOnline=!!net?.connected;$('#pjcoreNetwork').textContent=`NETWORK // ${networkOnline?'READY':'STANDBY'}`;$('#pjcoreNetwork').dataset.state=networkOnline?'ok':'neutral';
      const auth=window.PJAdminAuth?.state;const secure=!!auth?.secure;$('#pjcoreAdmin').textContent=`ADMIN // ${secure?'SECURE':auth?.signedIn?'LOCKED':'LOCKED'}`;$('#pjcoreAdmin').dataset.state=secure?'ok':'danger';
      $('#pjcoreState').textContent=idle?'IDLE':'ONLINE';top.classList.toggle('idle',idle);
      const up=Math.floor((Date.now()-startedAt)/1000),m=Math.floor(up/60),s=up%60;const out=$('#pjcoreUptime');if(out)out.textContent=`UPTIME ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      const dn=$('#pjcoreDiagNet');if(dn)dn.textContent=networkOnline?'NETWORK READY':'NETWORK STANDBY';
      if(secure&&!lastAdminSecure)logActivity('Secure owner session active','ok');
      if(!secure&&lastAdminSecure)logActivity('Secure owner session closed','warn');
      lastAdminSecure=secure;
      mountAdminTimeline();
    }

    normalizeStatuses();ensureMobileNav();syncPresence();renderCommands();updateSystem();
    setInterval(updateSystem,1000);
    window.addEventListener('pjthemechange',updateSystem);

    window.PJCoreOS={openPalette,openHelp,refresh:()=>{normalizeStatuses();ensureMobileNav();syncPresence();mountAdminTimeline();updateSystem()},logActivity};
  });
})();
