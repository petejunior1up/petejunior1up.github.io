/* PJ // ADMIN POLISH — visual control-room layer for PJ Network */
(()=>{
  if(window.PJAdminPolish)return;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  let timer=null;
  let expiryRefresh=false;
  let busy=false;

  const CARD_META={
    'DEVELOPER INBOX':['INBOX','✦'],
    'REPORTS':['REPORTS','⚑'],
    'POLL CONTROL':['POLLS','◉'],
    'PUBLISH':['PUBLISH','↗'],
    'BUILD PIPELINE':['BUILDS','◇'],
    'USER MODERATION':['MODERATION','⌁']
  };

  const emptyCopy=text=>{
    const t=String(text||'').trim().toUpperCase();
    if(t.includes('INBOX EMPTY'))return '✓ ALL CLEAR // INBOX ZERO';
    if(t.includes('NO OPEN REPORTS'))return '✓ ALL CLEAR // NO ACTIVE REPORTS';
    if(t.includes('NO BUILD REQUESTS'))return '◇ NO BUILD SIGNALS YET';
    if(t.includes('NO NOTIFICATIONS'))return '✓ ALL CLEAR // NO NEW SIGNALS';
    if(t.includes('NOTHING PINNED'))return '◇ NO PINNED SIGNALS';
    if(t.includes('NO EVENTS'))return '◇ NO LIVE EVENTS SCHEDULED';
    if(t.includes('NO CHANGELOG'))return '◇ NO CHANGELOG SIGNALS';
    if(t.includes('NO DMS'))return '◇ NO DIRECT SIGNALS YET';
    if(t.includes('NOTHING SAVED'))return '◇ NO SAVED SIGNALS';
    if(t.includes('NO RESULTS'))return '◇ NO MATCHING SIGNALS';
    return text;
  };

  function state(){return window.PJAdminAuth?.state||null}

  function formatRemaining(until){
    const ms=Math.max(0,new Date(until).getTime()-Date.now());
    const total=Math.floor(ms/1000);
    const m=Math.floor(total/60),s=total%60;
    return {ms,text:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`};
  }

  function markDanger(panel){
    $$('button',panel).forEach(btn=>{
      const txt=btn.textContent.trim().toUpperCase();
      if(/SIGN OUT|MUTE|CLEAR|DELETE|REMOVE|LOCK ADMIN/.test(txt))btn.classList.add('pjap-danger');
    });
  }

  function polishEmptyStates(root=document){
    $$('.pjn-empty',root).forEach(el=>{
      const next=emptyCopy(el.textContent);
      if(next!==el.textContent){el.textContent=next;el.classList.add('pjap-empty-state')}
    });
  }

  function classifyCards(panel){
    $$('.pjn-admin-grid > .pjn-card',panel).forEach((card,i)=>{
      const label=$(':scope > small',card)?.textContent.trim().toUpperCase()||'';
      const meta=CARD_META[label]||[`MODULE ${String(i+1).padStart(2,'0')}`,'◆'];
      card.dataset.pjAdminCard=meta[0].toLowerCase().replace(/\s+/g,'-');
      if(!$('.pjap-card-icon',card)){
        const icon=document.createElement('span');icon.className='pjap-card-icon';icon.setAttribute('aria-hidden','true');icon.textContent=meta[1];card.prepend(icon);
      }
    });
  }

  function lockedPanel(panel){
    panel.dataset.pjAdminSecure='0';
    if($('.pjap-lock-panel',panel))return;
    const box=document.createElement('section');box.className='pjap-lock-panel';box.innerHTML=`
      <div class="pjap-lock-mark">◆</div>
      <small>OWNER CONTROL // LOCKED</small>
      <h2>Secure session required.</h2>
      <p>Unlock PJ // ADMIN with your owner password and Private Admin Key to expose moderation and publishing controls.</p>
      <button class="pjn-btn" type="button" id="pjapUnlock">UNLOCK ADMIN</button>`;
    panel.prepend(box);
    $('#pjapUnlock',box).onclick=()=>window.PJAdminAuth?.open?.();
  }

  function secureHeader(panel,auth){
    panel.dataset.pjAdminSecure='1';
    $('.pjap-lock-panel',panel)?.remove();
    let head=$('.pjap-command',panel);
    if(!head){
      head=document.createElement('section');head.className='pjap-command';head.innerHTML=`
        <div class="pjap-command-main">
          <span class="pjap-live-dot" aria-hidden="true"></span>
          <div><small>OWNER CONTROL // SECURE</small><strong>PJ ADMIN COMMAND</strong><p>Moderation, publishing and system control.</p></div>
        </div>
        <div class="pjap-command-actions">
          <div class="pjap-session"><small>SECURE SESSION</small><strong id="pjapCountdown">--:--</strong></div>
          <span class="pjn-chip good pjap-secure-chip">● VERIFIED</span>
          <button class="pjn-btn secondary" id="pjapLock" type="button">LOCK ADMIN</button>
          <button class="pjn-btn secondary pjap-danger" id="pjapSignOut" type="button">SIGN OUT ADMIN</button>
        </div>`;
      panel.prepend(head);
      $('#pjapLock',head).onclick=async()=>{
        await window.PJAdminAuth?.lock?.();
        panel.dataset.pjAdminSecure='0';
        enhance();
        window.PJAdminAuth?.open?.();
      };
      $('#pjapSignOut',head).onclick=()=>window.PJAdminAuth?.signOut?.();
    }
    updateCountdown(auth);
  }

  function footer(panel){
    if($('.pjap-footer',panel))return;
    const foot=document.createElement('footer');foot.className='pjap-footer';foot.innerHTML=`<span>PJ CORE // OWNER SYSTEM // v4</span><span class="pjap-footer-state">● SECURE CHANNEL</span>`;panel.appendChild(foot);
  }

  function updateCountdown(auth=state()){
    const out=$('#pjapCountdown');if(!out)return;
    if(!auth?.verifiedUntil){out.textContent='--:--';return}
    const r=formatRemaining(auth.verifiedUntil);out.textContent=r.text;
    out.closest('.pjap-session')?.classList.toggle('ending',r.ms>0&&r.ms<=300000);
    if(r.ms<=0&&!expiryRefresh){
      expiryRefresh=true;out.textContent='EXPIRED';
      Promise.resolve(window.PJAdminAuth?.refresh?.()).finally(()=>{setTimeout(()=>{expiryRefresh=false;enhance()},150)});
    }
  }

  function enhance(){
    if(busy)return;busy=true;
    try{
      polishEmptyStates(document);
      const panel=$('#pjnAdmin');if(!panel)return;
      const auth=state();
      if(!auth?.secure){lockedPanel(panel);return}
      secureHeader(panel,auth);
      classifyCards(panel);
      markDanger(panel);
      polishEmptyStates(panel);
      footer(panel);
      const old=$('.pjn-section-head',panel);
      if(old&&!old.classList.contains('pjap-original-head'))old.classList.add('pjap-original-head');
    }finally{busy=false}
  }

  const observer=new MutationObserver(()=>queueMicrotask(enhance));
  const start=()=>{
    observer.observe(document.body,{childList:true,subtree:true});
    enhance();
    timer=setInterval(()=>{updateCountdown();if($('#pjnAdmin'))enhance()},1000);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('beforeunload',()=>{observer.disconnect();if(timer)clearInterval(timer)});

  window.PJAdminPolish={refresh:enhance};
})();