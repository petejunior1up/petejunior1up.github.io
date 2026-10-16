/* PJ CORE // HUB — unified launcher, modes, deep links, performance + accessibility */
(()=>{
  if(window.PJCoreHub)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const html=document.documentElement;
    const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const slug=s=>String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    let lastFocus=null;

    const root=document.createElement('section');
    root.className='pjhub-root';
    root.setAttribute('aria-label','PJ Core system hub');
    root.innerHTML=`
      <button class="pjhub-launch" type="button" aria-expanded="false" aria-controls="pjhubOverlay"><i></i><span>PJ CORE</span><b>◆</b></button>
      <div class="pjhub-overlay" id="pjhubOverlay" aria-hidden="true">
        <div class="pjhub-shell" role="dialog" aria-modal="true" aria-label="PJ Core system hub">
          <header class="pjhub-head">
            <div class="pjhub-brand"><span class="pjhub-orb"></span><div><small>UNIFIED SYSTEM ACCESS</small><strong>PJ CORE // HUB</strong></div></div>
            <div class="pjhub-head-actions"><span class="pjhub-mode-chip" id="pjhubMode" data-mode="visitor">VISITOR MODE</span><button class="pjhub-close" type="button" aria-label="Close PJ Core hub">×</button></div>
          </header>
          <div class="pjhub-statusbar" role="status" aria-live="polite"><span class="pjhub-status ok" id="pjhubCoreStatus">CORE // ONLINE</span><span class="pjhub-status" id="pjhubNetworkStatus">NETWORK // STANDBY</span><span class="pjhub-status danger" id="pjhubAdminStatus">ADMIN // LOCKED</span><span class="pjhub-status" id="pjhubPerfStatus">PERFORMANCE // AUTO</span></div>
          <div class="pjhub-body">
            <div class="pjhub-intro">
              <article class="pjhub-hero"><small>PJ CORE // ROUTER</small><h2>One door. Every system.</h2><p>Projects stay first. Community tools, AI, owner controls, themes and performance settings now live behind one launcher instead of competing across the screen.</p></article>
              <article class="pjhub-system-card"><div class="pjhub-system-row"><span>EXPERIENCE</span><strong>PORTFOLIO FIRST</strong></div><div class="pjhub-system-row"><span>MODE</span><strong id="pjhubModeDetail">VISITOR</strong></div><div class="pjhub-system-row"><span>PROJECTS</span><strong>03 LIVE</strong></div><div class="pjhub-system-row"><span>BUILD</span><strong>2026.10</strong></div></article>
            </div>

            <section class="pjhub-section"><small>EXPLORE // ROUTES</small><div class="pjhub-grid">
              <button class="pjhub-card" type="button" data-open="dossiers"><i>◇</i><strong>PROJECT DOSSIERS</strong><small>Inspect the builds, process, challenges and lessons.</small></button>
              <button class="pjhub-card" type="button" data-open="network"><i>⌁</i><strong>PJ NETWORK</strong><small>Profiles, DMs, builds, events and community systems.</small></button>
              <button class="pjhub-card" type="button" data-open="lounge"><i>◌</i><strong>PJ LOUNGE</strong><small>Community conversation and private Lounge channels.</small></button>
              <button class="pjhub-card" type="button" data-open="social"><i>◎</i><strong>PJ SOCIAL</strong><small>Public activity, polls, reactions and visitor wall.</small></button>
              <button class="pjhub-card" type="button" data-open="ai"><i>AI</i><strong>PJ CORE // AI</strong><small>Ask about Pete, projects, skills or navigate the site.</small></button>
              <button class="pjhub-card" type="button" data-open="terminal"><i>&gt;_</i><strong>TERMINAL</strong><small>Jump directly to the interactive terminal.</small></button>
              <button class="pjhub-card" type="button" data-open="command"><i>⌘</i><strong>COMMAND CENTER</strong><small>Open the main portfolio system controls.</small></button>
              <button class="pjhub-card" type="button" data-open="identity"><i>ID</i><strong>VISITOR ID</strong><small>View the current anonymous session identity card.</small></button>
              <button class="pjhub-card" type="button" data-open="audio"><i>♪</i><strong>SOUNDTRACK</strong><small>Open the original PJ audio player.</small></button>
              <button class="pjhub-card owner" id="pjhubAdminCard" type="button" data-open="admin" data-locked="1"><i>◆</i><strong>PJ ADMIN</strong><small>Owner authentication, moderation and publishing.</small></button>
            </div></section>

            <section class="pjhub-section"><small>SYSTEM // PREFERENCES</small><div class="pjhub-controls">
              <div class="pjhub-control"><span>THEME ENGINE</span><div class="pjhub-options" id="pjhubThemes"><button type="button" data-theme="red">RED</button><button type="button" data-theme="cyan">CYAN</button><button type="button" data-theme="violet">VIOLET</button><button type="button" data-theme="mono">MONO</button></div></div>
              <div class="pjhub-control"><span>PERFORMANCE MODE</span><div class="pjhub-options" id="pjhubPerformance"><button type="button" data-perf="auto">AUTO</button><button type="button" data-perf="full">FULL</button><button type="button" data-perf="lite">LITE</button></div></div>
            </div></section>

            <section class="pjhub-section pjhub-owner-secure-only"><small>OWNER // SESSION CONTROLS</small><div class="pjhub-owner-actions"><button type="button" data-owner-action="admin">OPEN ADMIN</button><button type="button" data-owner-action="lock">LOCK ADMIN</button><button class="danger" type="button" data-owner-action="signout">SIGN OUT ADMIN</button></div></section>
            <footer class="pjhub-foot"><span>PJ CORE // UNIFIED INTERFACE // v1</span><b>ESC CLOSES // CTRL+K COMMANDS</b></footer>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);

    const launch=$('.pjhub-launch',root),overlay=$('.pjhub-overlay',root),shell=$('.pjhub-shell',root),closeBtn=$('.pjhub-close',root);
    const modeChip=$('#pjhubMode',root),modeDetail=$('#pjhubModeDetail',root),adminCard=$('#pjhubAdminCard',root),adminStatus=$('#pjhubAdminStatus',root),networkStatus=$('#pjhubNetworkStatus',root),perfStatus=$('#pjhubPerfStatus',root);

    function open(){lastFocus=document.activeElement;overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');launch.setAttribute('aria-expanded','true');syncState();setTimeout(()=>closeBtn.focus(),0)}
    function close(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');launch.setAttribute('aria-expanded','false');lastFocus?.focus?.()}
    launch.onclick=open;closeBtn.onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close()});

    function route(action){
      close();
      if(action==='dossiers'){const card=$('.project-card:not(.coming-soon)');card?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});setTimeout(()=>card?.querySelector('[data-pjd-open]')?.click(),reduced?0:300);return}
      if(action==='network'){window.PJNetwork?.open?.();return}
      if(action==='lounge'){window.PJLounge?.open?.();return}
      if(action==='social'){window.PJSocial?.open?.();return}
      if(action==='ai'){window.PJCoreAI?.open?.();return}
      if(action==='terminal'){$('.terminal-section')?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});setTimeout(()=>$('#terminalInput')?.focus(),220);return}
      if(action==='command'){$('.pjcc-btn')?.click();return}
      if(action==='identity'){window.PJIdentityHologram?.openIdentity?.();return}
      if(action==='audio'){window.PJAudio?.open?.();return}
      if(action==='admin'){window.PJAdminAuth?.open?.();return}
    }
    $$('[data-open]',root).forEach(b=>b.onclick=()=>route(b.dataset.open));

    function applyTheme(theme){
      const button=$(`.pjx-theme-btn[data-theme="${theme}"]`);if(button)button.click();else{html.dataset.pjTheme=theme;try{localStorage.setItem('pjTheme',theme)}catch(_){}}
      syncThemeButtons();
    }
    function syncThemeButtons(){const theme=html.dataset.pjTheme||'red';$$('[data-theme]',root).forEach(b=>b.classList.toggle('active',b.dataset.theme===theme))}
    $('#pjhubThemes',root).addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(b)applyTheme(b.dataset.theme)});

    function autoPerformance(){
      const save=!!navigator.connection?.saveData;
      const mem=Number(navigator.deviceMemory||8);
      const cores=Number(navigator.hardwareConcurrency||8);
      const small=innerWidth<620;
      return reduced||save||mem<=4||cores<=4||(small&&cores<=6)?'lite':'full';
    }
    function getPerformancePreference(){try{return localStorage.getItem('pjPerformanceMode')||'auto'}catch(_){return'auto'}}
    function applyPerformance(pref=getPerformancePreference(),persist=false){
      if(!['auto','full','lite'].includes(pref))pref='auto';
      if(persist)try{localStorage.setItem('pjPerformanceMode',pref)}catch(_){}
      const resolved=pref==='auto'?autoPerformance():pref;
      html.dataset.pjPerformance=resolved;html.dataset.pjPerformancePreference=pref;
      const video=$('.pjx-bg-video');
      if(video){if(resolved==='lite')video.pause();else if(!reduced){const p=video.play();p?.catch?.(()=>{})}}
      $$('[data-perf]',root).forEach(b=>b.classList.toggle('active',b.dataset.perf===pref));
      perfStatus.textContent=`PERFORMANCE // ${pref==='auto'?`AUTO → ${resolved.toUpperCase()}`:resolved.toUpperCase()}`;
      perfStatus.className=`pjhub-status ${resolved==='lite'?'warn':'ok'}`;
    }
    $('#pjhubPerformance',root).addEventListener('click',e=>{const b=e.target.closest('[data-perf]');if(b)applyPerformance(b.dataset.perf,true)});

    function syncState(){
      const auth=window.PJAdminAuth?.state;const owner=!!auth?.secure;html.dataset.pjOwnerMode=owner?'1':'0';
      modeChip.textContent=owner?'OWNER MODE':'VISITOR MODE';modeChip.dataset.mode=owner?'owner':'visitor';modeDetail.textContent=owner?'OWNER // SECURE':'VISITOR';
      adminCard.dataset.locked=owner?'0':'1';adminStatus.textContent=`ADMIN // ${owner?'SECURE':'LOCKED'}`;adminStatus.className=`pjhub-status ${owner?'ok':'danger'}`;
      const network=window.PJNetwork?.state;const online=!!network?.connected;networkStatus.textContent=`NETWORK // ${online?'READY':'STANDBY'}`;networkStatus.className=`pjhub-status ${online?'ok':''}`;
      syncThemeButtons();
    }
    $$('[data-owner-action]',root).forEach(b=>b.onclick=async()=>{
      const action=b.dataset.ownerAction;
      if(action==='admin'){close();window.PJAdminAuth?.open?.();setTimeout(()=>{window.PJNetwork?.open?.();window.PJNetwork?.switchTab?.('admin')},160)}
      if(action==='lock'){await window.PJAdminAuth?.lock?.();syncState()}
      if(action==='signout')window.PJAdminAuth?.signOut?.();
    });

    /* Project dossier deep links + real, non-invented build facts. */
    const FACTS={
      'Personal Portfolio':[['DEPLOYMENT','GITHUB PAGES'],['FEATURED BUILDS','03 LIVE'],['SYSTEM','PJ CORE v4'],['UPDATED','OCT 2026']],
      'Scientific Calculator':[['DEPLOYMENT','GITHUB PAGES'],['ROOT FILES','04'],['STACK','HTML / CSS / JS'],['STATUS','LIVE']],
      'The Love Archive':[['DEPLOYMENT','GITHUB PAGES'],['HTML PAGES','06+'],['FORMAT','EDITORIAL'],['VOLUME','01']]
    };
    function currentDossierTitle(){return $('.pjd-overlay.open .pjd-hero-copy h1')?.textContent.trim()||''}
    function addDossierFacts(){
      const title=currentDossierTitle();if(!title)return;
      const meta=$('.pjd-overlay.open .pjd-meta');if(!meta)return;
      $('.pjhub-dossier-facts',meta.parentElement)?.remove();
      const facts=FACTS[title]||[['DEPLOYMENT','GITHUB PAGES'],['STATUS','LIVE']];
      const box=document.createElement('div');box.className='pjhub-dossier-facts';box.innerHTML=facts.map(([k,v])=>`<div><small>${k}</small><strong>${v}</strong></div>`).join('');meta.insertAdjacentElement('afterend',box);
    }
    function projectHash(title){return `#project=${encodeURIComponent(slug(title))}`}
    function setProjectHash(title){history.replaceState(null,'',projectHash(title))}
    function clearProjectHash(){if(/^#project=/.test(location.hash))history.replaceState(null,'',location.pathname+location.search)}
    function titleFromSlug(s){const cards=$$('.project-card:not(.coming-soon)');const card=cards.find(c=>slug($('h3',c)?.textContent)===s);return $('h3',card)?.textContent.trim()||''}
    function tryDeepLink(attempt=0){
      const m=location.hash.match(/^#project=([^&]+)/);if(!m)return;
      const requested=decodeURIComponent(m[1]);const title=titleFromSlug(requested);if(!title)return;
      if(window.PJProjectDossier?.openByTitle){window.PJProjectDossier.openByTitle(title);setTimeout(addDossierFacts,30);return}
      if(attempt<30)setTimeout(()=>tryDeepLink(attempt+1),100);
    }
    document.addEventListener('click',e=>{
      const inspect=e.target.closest('[data-pjd-open]');if(inspect){const title=$('h3',inspect.closest('.project-card'))?.textContent.trim();if(title){setProjectHash(title);setTimeout(addDossierFacts,30)}}
      if(e.target.closest('#pjdPrev,#pjdNext'))setTimeout(()=>{const t=currentDossierTitle();if(t){setProjectHash(t);addDossierFacts()}},30);
      if(e.target.closest('.pjd-close'))clearProjectHash();
      if(e.target.classList?.contains('pjd-overlay'))clearProjectHash();
    },true);
    window.addEventListener('hashchange',()=>tryDeepLink());

    /* Share/copy the dossier deep link instead of only the live project URL. */
    document.addEventListener('click',async e=>{
      const share=e.target.closest('#pjdShare'),copy=e.target.closest('#pjdCopy');if(!share&&!copy)return;
      const title=currentDossierTitle();if(!title)return;
      e.preventDefault();e.stopImmediatePropagation();
      const url=new URL(location.href);url.hash=`project=${encodeURIComponent(slug(title))}`;
      try{
        if(share&&navigator.share)await navigator.share({title:`${title} // PJ Project Dossier`,text:`Inspect ${title} in Pete Junior's portfolio.`,url:url.href});
        else await navigator.clipboard.writeText(url.href);
      }catch(err){if(err?.name!=='AbortError')console.warn('PJ Dossier share:',err)}
    },true);

    /* Generic focus trap for the site's major modal layers. */
    function activeModal(){return $('.pjhub-overlay.open .pjhub-shell')||$('.pjd-overlay.open .pjd-shell')||$('.pjn-overlay.open .pjn-shell')||$('.pjsoc-overlay.open .pjsoc-shell')||$('.pja2-overlay.open .pja2-card')||$('.pjx-modal.open .pjx-modal-card')}
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&overlay.classList.contains('open')){e.preventDefault();close();return}
      if(e.key==='Escape'&&$('.pjd-overlay.open'))setTimeout(clearProjectHash,0);
      if(e.key!=='Tab')return;
      const modal=activeModal();if(!modal)return;
      const focusables=$$('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',modal).filter(x=>x.offsetParent!==null);
      if(!focusables.length){e.preventDefault();modal.focus?.();return}
      const first=focusables[0],last=focusables.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    },true);

    applyPerformance(getPerformancePreference());
    syncState();
    tryDeepLink();
    setInterval(syncState,2000);
    window.addEventListener('pjthemechange',syncThemeButtons);
    window.addEventListener('resize',()=>{if(getPerformancePreference()==='auto')applyPerformance('auto')},{passive:true});

    html.dataset.pjHubReady='1';
    window.PJCoreHub={open,close,setPerformance:m=>applyPerformance(m,true),get state(){return{owner:html.dataset.pjOwnerMode==='1',performance:html.dataset.pjPerformance,preference:html.dataset.pjPerformancePreference,ready:true}}};
  });
})();