/* PJ IDENTITY + HOLOGRAM SYSTEM — session-native, anonymous, no tracking */
(()=>{
  if(window.PJIdentityHologram)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const hash=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).toUpperCase().padStart(8,'0')};
    const randomHex=n=>{const a=new Uint8Array(Math.ceil(n/2));crypto.getRandomValues(a);return [...a].map(v=>v.toString(16).padStart(2,'0')).join('').slice(0,n).toUpperCase()};

    /* ---------- VISITOR IDENTITY CARD ---------- */
    let visitorId='';
    try{visitorId=sessionStorage.getItem('pjVisitorIdentity')||''}catch(_){}
    if(!visitorId){visitorId=`VIS-${randomHex(4)}-${randomHex(4)}`;try{sessionStorage.setItem('pjVisitorIdentity',visitorId)}catch(_){}}
    const sessionStart=Date.now();
    let inspected=0,sector='HOME',xypher=false,cardOpen=true;
    const access=()=>xypher?'XYPHER':inspected>=3?'OPERATOR':inspected>=1?'EXPLORER':'OBSERVER';

    const idCard=document.createElement('aside');
    idCard.className='pji-card';
    idCard.setAttribute('aria-label','Visitor identity card');
    idCard.innerHTML=`
      <button class="pji-toggle" type="button" aria-label="Toggle visitor identity card"><span class="pji-dot"></span><b>VISITOR ID</b><i>−</i></button>
      <div class="pji-body">
        <div class="pji-head"><div><small>SESSION IDENTITY</small><strong class="pji-id">${visitorId}</strong></div><span class="pji-clearance">OBSERVER</span></div>
        <div class="pji-code" aria-hidden="true"></div>
        <div class="pji-grid">
          <div><span>ACCESS</span><strong class="pji-access">OBSERVER</strong></div>
          <div><span>SECTOR</span><strong class="pji-sector">HOME</strong></div>
          <div><span>UPTIME</span><strong class="pji-uptime">00:00</strong></div>
          <div><span>PROJECTS</span><strong class="pji-projects">00</strong></div>
        </div>
        <div class="pji-foot"><span><i></i> LOCAL SESSION</span><em>NO PERSONAL DATA</em></div>
      </div>`;
    document.body.appendChild(idCard);

    const code=idCard.querySelector('.pji-code');
    const bits=hash(visitorId)+hash(visitorId.split('').reverse().join(''));
    for(let i=0;i<49;i++){const b=document.createElement('i');const c=parseInt(bits[i%bits.length],16);if(((c+i*3)%5)<2)b.className='on';code.appendChild(b)}

    const refreshIdentity=()=>{
      const level=access();
      idCard.querySelector('.pji-access').textContent=level;
      idCard.querySelector('.pji-clearance').textContent=level;
      idCard.querySelector('.pji-sector').textContent=sector;
      idCard.querySelector('.pji-projects').textContent=String(inspected).padStart(2,'0');
      idCard.dataset.level=level.toLowerCase();
    };
    const tick=()=>{const s=Math.floor((Date.now()-sessionStart)/1000),m=Math.floor(s/60),r=s%60;idCard.querySelector('.pji-uptime').textContent=`${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`};
    tick();setInterval(tick,1000);
    idCard.querySelector('.pji-toggle').addEventListener('click',()=>{cardOpen=!cardOpen;idCard.classList.toggle('is-collapsed',!cardOpen);idCard.querySelector('.pji-toggle i').textContent=cardOpen?'−':'+'});

    const sections=[...document.querySelectorAll('main section[id]')];
    if('IntersectionObserver'in window&&sections.length){
      const io=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;sector=(visible.target.id||'HOME').toUpperCase().replace(/-/g,' ').slice(0,16);refreshIdentity()},{rootMargin:'-28% 0px -58% 0px',threshold:[0,.15,.35,.6]});
      sections.forEach(s=>io.observe(s));
    }
    window.addEventListener('xypher404change',e=>{xypher=!!e.detail?.active;refreshIdentity();idCard.classList.toggle('is-xypher',xypher)});

    /* ---------- PROJECT HOLOGRAM VIEW ---------- */
    const cards=[...document.querySelectorAll('.project-card:not(.coming-soon)')];
    const holo=document.createElement('div');
    holo.className='pjh-overlay';
    holo.setAttribute('aria-hidden','true');
    holo.innerHTML=`
      <div class="pjh-noise" aria-hidden="true"></div>
      <div class="pjh-frame" role="dialog" aria-modal="true" aria-label="Project hologram inspector">
        <div class="pjh-topbar"><span><i></i> PJ CORE // HOLOGRAPHIC PROJECT ANALYSIS</span><div><b class="pjh-index">01 / 03</b><button class="pjh-close" type="button" aria-label="Close project inspector">×</button></div></div>
        <div class="pjh-scanline" aria-hidden="true"></div>
        <div class="pjh-layout">
          <div class="pjh-visual">
            <div class="pjh-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
            <div class="pjh-preview"></div>
            <div class="pjh-radar" aria-hidden="true"><i></i><span></span></div>
            <div class="pjh-visual-meta"><span>RENDER // LIVE</span><span class="pjh-hash">HASH // --------</span></div>
          </div>
          <div class="pjh-data">
            <div class="pjh-kicker">PROJECT // <span class="pjh-number">01</span></div>
            <h2 class="pjh-title">PROJECT</h2>
            <p class="pjh-type">WEB DEVELOPMENT</p>
            <p class="pjh-desc"></p>
            <div class="pjh-tags"></div>
            <div class="pjh-telemetry">
              <div><span>STATUS</span><strong class="pjh-status">LIVE</strong></div>
              <div><span>STACK NODES</span><strong class="pjh-stack">00</strong></div>
              <div><span>ACCESS</span><strong>PUBLIC</strong></div>
              <div><span>SIGNAL</span><strong class="pjh-signal">STABLE</strong></div>
            </div>
            <div class="pjh-actions"></div>
            <div class="pjh-nav"><button class="pjh-prev" type="button">← PREVIOUS</button><span class="pjh-dots"></span><button class="pjh-next" type="button">NEXT →</button></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(holo);
    const frame=holo.querySelector('.pjh-frame'),preview=holo.querySelector('.pjh-preview');
    let current=0,lastFocus=null;

    const projectData=card=>{
      const title=card.querySelector('h3')?.textContent?.trim()||'Untitled Project';
      const type=card.querySelector('.project-type')?.textContent?.trim()||'PROJECT';
      const desc=card.querySelector('.project-content > p:not(.project-type)')?.textContent?.trim()||'';
      const tags=[...card.querySelectorAll('.project-tags span')].map(x=>x.textContent.trim());
      const status=card.querySelector('.project-status')?.textContent?.trim()||'ACTIVE';
      const number=card.querySelector('.project-number')?.textContent?.trim()||String(cards.indexOf(card)+1).padStart(2,'0');
      const img=card.querySelector('.project-image img')?.getAttribute('src')||'';
      const links=[...card.querySelectorAll('.project-actions a')].map(a=>({label:a.textContent.trim(),href:a.href}));
      return{title,type,desc,tags,status,number,img,links,hash:hash(title+'|'+type+'|PJ')};
    };

    const render=(idx,source='button')=>{
      if(!cards.length)return;current=(idx+cards.length)%cards.length;const d=projectData(cards[current]);
      holo.querySelector('.pjh-index').textContent=`${String(current+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
      holo.querySelector('.pjh-number').textContent=d.number;holo.querySelector('.pjh-title').textContent=d.title;holo.querySelector('.pjh-type').textContent=d.type;holo.querySelector('.pjh-desc').textContent=d.desc;holo.querySelector('.pjh-status').textContent=d.status;holo.querySelector('.pjh-stack').textContent=String(d.tags.length).padStart(2,'0');holo.querySelector('.pjh-hash').textContent=`HASH // ${d.hash}`;
      holo.querySelector('.pjh-tags').innerHTML=d.tags.map(t=>`<span>${esc(t)}</span>`).join('');
      holo.querySelector('.pjh-actions').innerHTML=d.links.map((l,i)=>`<a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer" class="${i===0?'primary':''}">${esc(l.label)}</a>`).join('');
      if(d.img){preview.innerHTML=`<img src="${esc(d.img)}" alt="${esc(d.title)} project preview"><div class="pjh-img-overlay"></div>`}else{preview.innerHTML=`<div class="pjh-generated"><small>PROJECT // ${esc(d.number)}</small><strong>${esc(d.title)}</strong><span>${esc(d.type)}</span></div>`}
      holo.querySelector('.pjh-dots').innerHTML=cards.map((_,i)=>`<button type="button" data-holo-index="${i}" class="${i===current?'active':''}" aria-label="Open project ${i+1}"></button>`).join('');
      frame.classList.remove('pjh-refresh');void frame.offsetWidth;frame.classList.add('pjh-refresh');
      inspected=Math.min(99,inspected+1);refreshIdentity();window.dispatchEvent(new CustomEvent('pjprojectinspect',{detail:{title:d.title,index:current,total:cards.length,source}}));
    };
    const openHolo=(idx=0,source='button')=>{lastFocus=document.activeElement;render(idx,source);holo.classList.add('open');holo.setAttribute('aria-hidden','false');document.body.classList.add('pjh-open');setTimeout(()=>holo.querySelector('.pjh-close')?.focus(),40)};
    const closeHolo=()=>{holo.classList.remove('open');holo.setAttribute('aria-hidden','true');document.body.classList.remove('pjh-open');frame.style.removeProperty('--rx');frame.style.removeProperty('--ry');lastFocus?.focus?.()};

    cards.forEach((card,i)=>{
      card.classList.add('pjh-ready');
      const actions=card.querySelector('.project-actions');if(!actions)return;
      const b=document.createElement('button');b.type='button';b.className='pjh-inspect';b.innerHTML='<span>◈</span> HOLOGRAM VIEW';b.addEventListener('click',()=>openHolo(i,'button'));actions.insertAdjacentElement('afterend',b);
    });

    holo.querySelector('.pjh-close').addEventListener('click',closeHolo);holo.querySelector('.pjh-prev').addEventListener('click',()=>render(current-1,'nav'));holo.querySelector('.pjh-next').addEventListener('click',()=>render(current+1,'nav'));
    holo.querySelector('.pjh-dots').addEventListener('click',e=>{const b=e.target.closest('[data-holo-index]');if(b)render(Number(b.dataset.holoIndex),'dot')});
    holo.addEventListener('click',e=>{if(e.target===holo)closeHolo()});
    document.addEventListener('keydown',e=>{if(!holo.classList.contains('open'))return;if(e.key==='Escape'){e.stopPropagation();closeHolo()}if(e.key==='ArrowRight')render(current+1,'keyboard');if(e.key==='ArrowLeft')render(current-1,'keyboard')});
    frame.addEventListener('pointermove',e=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=frame.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;frame.style.setProperty('--ry',`${x*2.4}deg`);frame.style.setProperty('--rx',`${y*-1.8}deg`)});
    frame.addEventListener('pointerleave',()=>{frame.style.setProperty('--ry','0deg');frame.style.setProperty('--rx','0deg')});

    window.PJIdentityHologram={
      openIdentity:()=>{if(!cardOpen)idCard.querySelector('.pji-toggle').click();idCard.classList.add('pji-pulse');setTimeout(()=>idCard.classList.remove('pji-pulse'),900)},
      openProject:i=>openHolo(Number.isFinite(i)?i:0,'api'),
      closeProject:closeHolo,
      get identity(){return{id:visitorId,access:access(),sector,uptime:Math.floor((Date.now()-sessionStart)/1000),projectsInspected:inspected}}
    };
    refreshIdentity();
  });
})();