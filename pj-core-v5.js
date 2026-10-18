/* PJ CORE // v5 — runtime refinement, admin consistency and performance governor */
(()=>{
  if(window.PJCoreV5)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const html=document.documentElement;
    const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const slug=s=>String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    let queued=false,longTaskScore=0,longTaskWindow=Date.now();
    html.dataset.pjCoreVersion='5';

    function closeHub(){const b=$('.pjhub-close');if(b)b.click()}
    function projectTitle(index){return window.PJProjectDossier?.projects?.[index]?.title||$$('.project-card:not(.coming-soon) h3')[index]?.textContent?.trim()||''}
    function dossierHash(title){return `#project=${encodeURIComponent(slug(title))}`}
    function openDossier(index=0){
      const title=projectTitle(index);if(title)history.replaceState(null,'',dossierHash(title));
      window.PJCoreAI?.minimize?.();
      if(window.PJProjectDossier?.open){window.PJProjectDossier.open(index);return true}
      const card=$$('.project-card:not(.coming-soon)')[index];card?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});setTimeout(()=>card?.querySelector('[data-pjd-open]')?.click(),reduced?0:220);return !!card;
    }

    /* --------- Remove superseded Command Center UI. PJ CORE palette is canonical in v5. --------- */
    function removeLegacyCommandCenter(){
      $$('.pjcc-btn,.pjcc-root').forEach(el=>el.remove());
      const card=$('.pjhub-card[data-open="command"]');
      if(card){card.querySelector('strong')&&(card.querySelector('strong').textContent='COMMAND PALETTE');const small=card.querySelector('small');if(small)small.textContent='Search routes, systems, themes and controls.'}
    }

    /* --------- Version stamps --------- */
    function stampV5(){
      $$('.pjcore-telemetry span').forEach(x=>{if(x.querySelector('small')?.textContent.trim()==='SYSTEM'){const s=x.querySelector('strong');if(s&&s.textContent!=='V5')s.textContent='V5'}});
      $$('.pjcore-diagnostics span').forEach(x=>{if(/^BUILD\s/i.test(x.textContent)&&!x.textContent.includes('V5'))x.textContent='BUILD 2026.10 // V5'});
      const foot=$('.pjhub-foot span');if(foot&&/v1/i.test(foot.textContent))foot.textContent='PJ CORE // UNIFIED INTERFACE // v5';
    }

    /* --------- Admin consistency: secure PJAdminAuth is the UI authority. DB RLS remains the security boundary. --------- */
    function authState(){return window.PJAdminAuth?.state||null}
    function netState(){return window.PJNetwork?.state||null}
    function syncAdminState(){
      const auth=authState(),net=netState(),secure=!!auth?.secure;
      html.dataset.pjOwnerMode=secure?'1':'0';
      const adminPanel=$('#pjnAdmin');if(adminPanel)adminPanel.dataset.pjV5Secure=secure?'1':'0';
      const mobileAdmin=$('.pjcore-mobile-nav [data-tab="admin"]');if(mobileAdmin){mobileAdmin.setAttribute('aria-label',secure?'Admin, secure':'Admin, locked');mobileAdmin.dataset.locked=secure?'0':'1'}
      if(!secure)return;
      if(net?.connected&&auth?.uid&&net?.uid&&(auth.uid!==net.uid||net.admin===false)){
        const key=`${auth.uid}:${net.uid||'none'}:${String(net.admin)}`;
        if(sessionStorage.getItem('pjV5AdminSync')!==key){
          sessionStorage.setItem('pjV5AdminSync',key);
          html.dataset.pjAdminSync='pending';
          setTimeout(()=>location.reload(),120);
        }
      }else if(net?.connected&&auth?.uid===net?.uid&&net?.admin!==false){
        sessionStorage.removeItem('pjV5AdminSync');html.dataset.pjAdminSync='ready';
      }
    }

    function fallbackAdminLock(){
      const panel=$('#pjnAdmin'),auth=authState();if(!panel||auth?.secure||$('.pjap-lock-panel',panel)||$('.pjv5-admin-lock',panel))return;
      const box=document.createElement('section');box.className='pjv5-admin-lock';box.innerHTML='<small>OWNER CONTROL // LOCKED</small><h2>Secure owner session required.</h2><p>Sign in and complete Private Admin Key verification before Admin tools are shown.</p><button type="button">UNLOCK ADMIN</button>';
      box.querySelector('button').onclick=()=>window.PJAdminAuth?.open?.();panel.prepend(box);
    }

    /* --------- Dossier: prevent recursive self-embedding for the portfolio itself. --------- */
    function sameDocument(url){try{const u=new URL(url,location.href),a=u.pathname.replace(/\/+$/,''),b=location.pathname.replace(/\/+$/,'');return u.origin===location.origin&&a===b}catch(_){return false}}
    function protectDossierPreview(){
      const overlay=$('.pjd-overlay.open');if(!overlay)return;
      const live=[...overlay.querySelectorAll('.pjd-actions a')].find(a=>/OPEN LIVE PROJECT/i.test(a.textContent))?.href||'';
      const box=$('.pjdlp',overlay);if(!box||!sameDocument(live))return;
      const replacement=document.createElement('section');replacement.className='pjv5-current-preview';replacement.innerHTML='<div><small>LIVE PREVIEW // CURRENT SYSTEM</small><strong>YOU ARE ALREADY INSIDE THIS BUILD.</strong><p>The Personal Portfolio cannot preview itself inside itself without creating a recursive page. The project image is used here instead.</p></div><img src="images/portfolio.png" alt="Pete Junior portfolio project preview" loading="lazy">';box.replaceWith(replacement);
    }

    function watchDossierClose(){
      const overlay=$('.pjd-overlay');if(!overlay||overlay.dataset.pjV5Watch)return;overlay.dataset.pjV5Watch='1';
      new MutationObserver(()=>{if(!overlay.classList.contains('open')&&/^#project=/.test(location.hash))history.replaceState(null,'',location.pathname+location.search)}).observe(overlay,{attributes:true,attributeFilter:['class']});
    }

    /* --------- Accessibility touch-ups on dynamically-created systems. --------- */
    function accessibilityPass(){
      const labels=[['#pjnClose','Close PJ Network'],['#pjnOpenSocial','Open PJ Social'],['.pjl-close','Close PJ Lounge'],['#pjsocClose','Close PJ Social']];
      labels.forEach(([s,t])=>{const el=$(s);if(el&&!el.getAttribute('aria-label'))el.setAttribute('aria-label',t)});
      $$('.pjn-tabs button,.pjcore-mobile-nav button').forEach(b=>b.setAttribute('aria-selected',b.classList.contains('active')?'true':'false'));
      const net=$('.pjn-overlay');if(net)net.setAttribute('aria-hidden',net.classList.contains('open')?'false':'true');
    }

    /* --------- Page visibility + AUTO performance governor. --------- */
    function video(){return $('.pjx-bg-video')}
    function syncVisibility(){
      html.dataset.pjPageHidden=document.hidden?'1':'0';const v=video();if(!v)return;
      if(document.hidden||html.dataset.pjPerformance==='lite')v.pause();
      else if(!reduced){const p=v.play();p?.catch?.(()=>{})}
    }
    document.addEventListener('visibilitychange',syncVisibility,{passive:true});

    if('PerformanceObserver'in window){
      try{
        const po=new PerformanceObserver(list=>{
          if(Date.now()-longTaskWindow>8000){longTaskScore=0;longTaskWindow=Date.now()}
          list.getEntries().forEach(e=>{longTaskScore+=e.duration});
          if(longTaskScore>=550&&html.dataset.pjPerformancePreference==='auto'&&html.dataset.pjPerformance!=='lite'){
            html.dataset.pjPerformance='lite';html.dataset.pjV5AutoLite='1';syncVisibility();
          }
        });po.observe({type:'longtask',buffered:true});
      }catch(_){}
    }

    /* --------- One capture router replaces several legacy cross-system routes. --------- */
    document.addEventListener('click',e=>{
      const command=e.target.closest('.pjhub-root [data-open="command"]');
      if(command){e.preventDefault();e.stopImmediatePropagation();closeHub();window.PJCoreOS?.openPalette?.();return}

      const admin=e.target.closest('.pjn-tabs [data-tab="admin"],.pjcore-mobile-nav [data-tab="admin"]');
      if(admin&&!authState()?.secure){e.preventDefault();e.stopImmediatePropagation();window.PJAdminAuth?.open?.();return}

      const aiAction=e.target.closest('.pjai-inline-action button');
      if(aiAction&&/INSPECT|OPEN HOLOGRAM/i.test(aiAction.textContent)){
        e.preventDefault();e.stopImmediatePropagation();const idx=Math.max(0,Number(window.PJCoreAI?.state?.project??0));openDossier(idx);return
      }
    },true);

    /* --------- Cheap, child-only mutation pass. No attribute/text observation. --------- */
    function refresh(){
      queued=false;removeLegacyCommandCenter();stampV5();syncAdminState();fallbackAdminLock();protectDossierPreview();watchDossierClose();accessibilityPass();
    }
    const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(refresh)};
    const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});

    refresh();syncVisibility();
    window.addEventListener('pjthemechange',schedule);
    window.addEventListener('hashchange',schedule);
    window.PJCoreV5={version:5,refresh:schedule,openDossier,get state(){return{owner:!!authState()?.secure,performance:html.dataset.pjPerformance||'full',hidden:document.hidden}}};
  });
})();