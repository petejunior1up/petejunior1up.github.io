/* PJ // PROJECT DOSSIER — cinematic project case-study system */
(()=>{
  if(window.PJProjectDossier)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();

  ready(()=>{
    const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
    const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

    const DETAILS={
      'Personal Portfolio':{
        code:'PROJECT 001',kind:'WEB SYSTEM',role:'DESIGN + DEVELOPMENT',status:'LIVE',
        mission:'Build a personal digital space that works as both a portfolio and an evolving interactive system.',
        overview:'The portfolio started as a clean HTML, CSS and JavaScript site and gradually evolved into a modular digital environment with project showcases, terminal interactions, PJ CORE, community tools, protected owner controls and theme-aware interface systems.',
        process:[
          ['01','FOUNDATION','Built the core portfolio structure, navigation, project cards and responsive layout.'],
          ['02','INTERACTION','Added JavaScript-driven terminal, command controls, HUD layers and interface feedback.'],
          ['03','SYSTEMS','Expanded the site with Lounge, Social, Network, Admin authentication and PJ CORE modules.'],
          ['04','REFINEMENT','Added mobile tuning, accessibility-minded focus states, theme handling and layered visual polish.']
        ],
        challenges:[
          ['FEATURE DENSITY','Keeping many interactive systems available without letting them overpower the actual portfolio content.'],
          ['STATE + AUTH','Coordinating visitor sessions, owner authentication and protected Admin controls across browser-side modules.'],
          ['CACHE + DEPLOYMENT','Managing GitHub Pages asset caching while frequently shipping modular CSS and JavaScript updates.']
        ],
        lessons:[
          'A portfolio gets stronger when features support the work instead of competing with it.',
          'Modular scripts and styles are easier to evolve than repeatedly rewriting the core page.',
          'Security-sensitive controls need server-enforced checks; interface styling alone is never a security boundary.'
        ],
        history:[
          ['FOUNDATION','Portfolio launched on GitHub Pages with the core HTML/CSS/JS experience.'],
          ['SYSTEM ERA','Terminal, Command Center, HUD, Project Lab and hidden interface systems were introduced.'],
          ['COMMUNITY ERA','Lounge, Social and PJ Network expanded the site beyond a static portfolio.'],
          ['PJ CORE','Owner Admin flow, OS-style navigation, command palette and system polish were added.']
        ]
      },
      'Scientific Calculator':{
        code:'PROJECT 002',kind:'WEB APP',role:'DEVELOPMENT',status:'LIVE',
        mission:'Turn a browser calculator into a useful scientific tool while learning how expression handling and interface logic work.',
        overview:'A browser-based scientific calculator built with HTML, CSS and JavaScript. The project grew beyond basic arithmetic into a larger calculation interface with scientific functions and an expanding expression engine.',
        process:[
          ['01','CORE ENGINE','Built number entry, operators, expression handling and result output.'],
          ['02','SCIENTIFIC TOOLS','Expanded the interface with scientific and inverse functions.'],
          ['03','ADVANCED INPUT','Improved keyboard interaction and added more special calculation paths.'],
          ['04','EXPANSION','Extended the calculator toward special and complex-number functions.']
        ],
        challenges:[
          ['INPUT RULES','Handling user-entered expressions consistently while keeping the interface responsive.'],
          ['FUNCTION GROWTH','Adding more operations without turning the calculator controls into an unreadable wall of buttons.'],
          ['EDGE CASES','Accounting for invalid operations and special mathematical cases without breaking the main flow.']
        ],
        lessons:[
          'Calculation tools need clear input rules as much as they need mathematical functions.',
          'Breaking the engine into smaller responsibilities makes advanced functions easier to add.',
          'Keyboard support can make a web tool feel dramatically faster and more serious.'
        ],
        history:[
          ['BASE BUILD','Working scientific calculator created with pure HTML, CSS and JavaScript.'],
          ['FUNCTION PASS','Scientific and inverse operations expanded.'],
          ['ENGINE PASS','Special and complex-number capabilities were added to the growing calculation engine.']
        ]
      },
      'The Love Archive':{
        code:'PROJECT 003',kind:'EDITORIAL WEB EXPERIENCE',role:'DESIGN + DEVELOPMENT',status:'LIVE',
        mission:'Create a cinematic digital publication where writing, memory and interface design feel like one experience.',
        overview:'The Love Archive is an editorial web experience built around long-form reading, atmosphere and visual storytelling. Instead of behaving like a normal project page, it treats the browser like a digital publication with its own identity.',
        process:[
          ['01','CONCEPT','Defined the archive idea, editorial voice and visual direction.'],
          ['02','EDITORIAL SYSTEM','Built typography, spacing and section rhythm around long-form reading.'],
          ['03','ATMOSPHERE','Added cinematic styling and interaction without sacrificing readability.'],
          ['04','PUBLICATION','Published the experience as a standalone GitHub Pages project.']
        ],
        challenges:[
          ['MOOD VS READABILITY','Keeping the cinematic aesthetic strong while making longer writing comfortable to read.'],
          ['CONSISTENCY','Maintaining one editorial visual language across different pieces and sections.'],
          ['RESPONSIVE TYPE','Preserving hierarchy and atmosphere across desktop and smaller screens.']
        ],
        lessons:[
          'Typography and spacing can carry as much emotion as imagery.',
          'A strong concept makes interface decisions easier because every element has a reason to exist.',
          'Editorial websites need restraint; too much animation can weaken the writing instead of supporting it.'
        ],
        history:[
          ['VOL. 01','The Love Archive launched as a cinematic editorial web experience.'],
          ['SYSTEM PASS','Navigation, reading flow and presentation were refined into a more cohesive publication.'],
          ['PORTFOLIO LINK','The project became one of the main featured builds in the PJ portfolio.']
        ]
      }
    };

    const cards=$$('.project-card:not(.coming-soon)');
    if(!cards.length)return;

    const root=document.createElement('section');
    root.className='pjd-root';
    root.innerHTML=`
      <div class="pjd-overlay" aria-hidden="true">
        <div class="pjd-shell" role="dialog" aria-modal="true" aria-label="Project dossier">
          <header class="pjd-head">
            <div class="pjd-head-brand"><i></i><div><small>PJ CORE // PROJECT INTELLIGENCE</small><strong>PROJECT DOSSIER</strong></div></div>
            <div class="pjd-head-actions"><span id="pjdCounter">01 / 03</span><button class="pjd-icon" id="pjdShare" type="button" title="Share project">↗</button><button class="pjd-close" type="button" aria-label="Close project dossier">×</button></div>
          </header>
          <div class="pjd-status"><span><i></i> CASE FILE ACTIVE</span><span id="pjdStatusText">LOADING PROJECT DATA…</span></div>
          <main class="pjd-main" id="pjdMain"></main>
          <footer class="pjd-foot"><button type="button" id="pjdPrev">← PREVIOUS PROJECT</button><span>PJ CORE // DOSSIER SYSTEM // v1</span><button type="button" id="pjdNext">NEXT PROJECT →</button></footer>
        </div>
      </div>`;
    document.body.appendChild(root);

    const overlay=$('.pjd-overlay',root),main=$('#pjdMain',root),closeBtn=$('.pjd-close',root),shareBtn=$('#pjdShare',root),prevBtn=$('#pjdPrev',root),nextBtn=$('#pjdNext',root);
    let currentIndex=0,current=null,lastFocus=null;

    function cardData(card,index){
      const title=$('h3',card)?.textContent.trim()||`Project ${index+1}`;
      const base=DETAILS[title]||{};
      const desc=$('.project-content>p:not(.project-type)',card)?.textContent.trim()||base.overview||'';
      const tags=$$('.project-tags span',card).map(x=>x.textContent.trim());
      const live=$('.project-button.primary',card)?.href||'';
      const source=$$('.project-button',card).find(a=>/SOURCE/i.test(a.textContent))?.href||'';
      const type=$('.project-type',card)?.textContent.trim()||base.kind||'PROJECT';
      const number=$('.project-number',card)?.textContent.trim()||String(index+1).padStart(2,'0');
      const img=$('.project-image img',card)?.getAttribute('src')||'';
      const code=$('.project-terminal-preview code',card)?.textContent||'';
      const love=$('.love-preview',card)?.innerHTML||'';
      return {title,desc,tags,live,source,type,number,img,code,love,...base};
    }

    const projects=cards.map(cardData);

    function previewHTML(p){
      if(p.img)return `<div class="pjd-preview image"><img src="${esc(p.img)}" alt="${esc(p.title)} preview"><div class="pjd-preview-grid"></div><span>${esc(p.code||`PROJECT ${p.number}`)}</span></div>`;
      if(p.love)return `<div class="pjd-preview editorial"><div class="pjd-love">${p.love}</div><div class="pjd-preview-grid"></div><span>${esc(p.code||`PROJECT ${p.number}`)}</span></div>`;
      if(p.code)return `<div class="pjd-preview code"><div class="pjd-code-top"><i></i><i></i><i></i></div><pre>${esc(p.code)}</pre><div class="pjd-preview-grid"></div><span>${esc(p.code||`PROJECT ${p.number}`)}</span></div>`;
      return `<div class="pjd-preview abstract"><b>${esc(p.number)}</b><strong>${esc(p.title)}</strong><div class="pjd-preview-grid"></div></div>`;
    }

    function processHTML(rows=[]){return rows.map(([n,t,b])=>`<article class="pjd-step"><span>${esc(n)}</span><div><small>${esc(t)}</small><p>${esc(b)}</p></div></article>`).join('')}
    function challengeHTML(rows=[]){return rows.map(([t,b])=>`<article class="pjd-challenge"><small>${esc(t)}</small><p>${esc(b)}</p></article>`).join('')}
    function historyHTML(rows=[]){return rows.map(([t,b],i)=>`<article class="pjd-history-row"><i></i><div><small>${String(i+1).padStart(2,'0')} // ${esc(t)}</small><p>${esc(b)}</p></div></article>`).join('')}

    function render(index){
      currentIndex=(index+projects.length)%projects.length;
      current=projects[currentIndex];
      const p=current;
      $('#pjdCounter',root).textContent=`${String(currentIndex+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}`;
      $('#pjdStatusText',root).textContent=`${p.status||'LIVE'} // ${p.kind||p.type}`;
      main.innerHTML=`
        <section class="pjd-hero">
          ${previewHTML(p)}
          <div class="pjd-hero-copy">
            <div class="pjd-kicker">${esc(p.code||`PROJECT ${p.number}`)} // ${esc(p.kind||p.type)}</div>
            <h1>${esc(p.title)}</h1>
            <p class="pjd-mission">${esc(p.mission||p.desc)}</p>
            <div class="pjd-meta"><div><small>STATUS</small><strong class="ok">${esc(p.status||'LIVE')}</strong></div><div><small>ROLE</small><strong>${esc(p.role||'DESIGN + DEVELOPMENT')}</strong></div><div><small>STACK</small><strong>${esc(p.tags.join(' / ')||'WEB')}</strong></div></div>
            <div class="pjd-actions">${p.live?`<a href="${esc(p.live)}" target="_blank" rel="noopener noreferrer">OPEN LIVE PROJECT ↗</a>`:''}${p.source?`<a class="secondary" href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">VIEW SOURCE ↗</a>`:''}<button type="button" class="secondary" id="pjdCopy">COPY PROJECT LINK</button></div>
          </div>
        </section>
        <nav class="pjd-tabs" aria-label="Project dossier sections">
          <button class="active" type="button" data-pjd-tab="overview">OVERVIEW</button>
          <button type="button" data-pjd-tab="build">BUILD PROCESS</button>
          <button type="button" data-pjd-tab="challenges">CHALLENGES</button>
          <button type="button" data-pjd-tab="lessons">LESSONS</button>
          <button type="button" data-pjd-tab="history">HISTORY</button>
        </nav>
        <div class="pjd-panels">
          <section class="pjd-panel active" data-pjd-panel="overview"><div class="pjd-section-title"><small>CASE FILE // 01</small><h2>What this project is.</h2></div><div class="pjd-overview-grid"><article class="pjd-copy-card"><small>OVERVIEW</small><p>${esc(p.overview||p.desc)}</p></article><article class="pjd-copy-card"><small>ORIGINAL BRIEF</small><p>${esc(p.desc)}</p></article></div><div class="pjd-tech">${p.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div></section>
          <section class="pjd-panel" data-pjd-panel="build"><div class="pjd-section-title"><small>CASE FILE // 02</small><h2>How it was built.</h2></div><div class="pjd-process">${processHTML(p.process||[])}</div></section>
          <section class="pjd-panel" data-pjd-panel="challenges"><div class="pjd-section-title"><small>CASE FILE // 03</small><h2>Problems worth solving.</h2></div><div class="pjd-challenge-grid">${challengeHTML(p.challenges||[])}</div></section>
          <section class="pjd-panel" data-pjd-panel="lessons"><div class="pjd-section-title"><small>CASE FILE // 04</small><h2>What the build taught me.</h2></div><div class="pjd-lessons">${(p.lessons||[]).map((x,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><p>${esc(x)}</p></article>`).join('')}</div></section>
          <section class="pjd-panel" data-pjd-panel="history"><div class="pjd-section-title"><small>CASE FILE // 05</small><h2>How the project evolved.</h2></div><div class="pjd-history">${historyHTML(p.history||[])}</div></section>
        </div>`;

      $$('.pjd-tabs button',main).forEach(btn=>btn.onclick=()=>switchPanel(btn.dataset.pjdTab));
      $('#pjdCopy',main)?.addEventListener('click',copyLink);
      main.scrollTop=0;
    }

    function switchPanel(name){
      $$('.pjd-tabs button',main).forEach(b=>b.classList.toggle('active',b.dataset.pjdTab===name));
      $$('.pjd-panel',main).forEach(p=>p.classList.toggle('active',p.dataset.pjdPanel===name));
      const active=$(`.pjd-panel[data-pjd-panel="${CSS.escape(name)}"]`,main);active?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});
    }

    function open(index=0){
      lastFocus=document.activeElement;
      render(index);
      overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.documentElement.classList.add('pjd-open');
      setTimeout(()=>closeBtn.focus(),0);
    }
    function close(){
      overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.documentElement.classList.remove('pjd-open');
      lastFocus?.focus?.();
    }
    async function copyLink(){
      const url=current?.live||location.href;
      try{await navigator.clipboard.writeText(url);toast('PROJECT LINK COPIED')}catch(_){toast('COPY FAILED')}
    }
    async function share(){
      if(!current)return;
      const data={title:`${current.title} // PJ Project Dossier`,text:current.mission||current.desc,url:current.live||location.href};
      try{if(navigator.share)await navigator.share(data);else await copyLink()}catch(e){if(e?.name!=='AbortError')toast('SHARE CANCELLED')}
    }
    function toast(text){
      let t=$('.pjd-toast',root);if(!t){t=document.createElement('div');t.className='pjd-toast';root.appendChild(t)}
      t.textContent=text;t.classList.add('show');clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove('show'),1800);
    }

    closeBtn.onclick=close;shareBtn.onclick=share;prevBtn.onclick=()=>render(currentIndex-1);nextBtn.onclick=()=>render(currentIndex+1);
    overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    document.addEventListener('keydown',e=>{
      if(!overlay.classList.contains('open'))return;
      if(e.key==='Escape'){e.preventDefault();close();return}
      const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'');if(typing)return;
      if(e.key==='ArrowLeft'){e.preventDefault();render(currentIndex-1)}
      if(e.key==='ArrowRight'){e.preventDefault();render(currentIndex+1)}
    });

    cards.forEach((card,index)=>{
      if(card.querySelector('[data-pjd-open]'))return;
      const actions=$('.pjx-actions',card)||$('.project-actions',card);
      if(!actions)return;
      const btn=document.createElement('button');btn.type='button';btn.dataset.pjdOpen=String(index);btn.className='pjd-inspect';btn.innerHTML='INSPECT PROJECT <span>↗</span>';btn.onclick=()=>open(index);
      actions.appendChild(btn);
    });

    window.PJProjectDossier={open,close,openByTitle(title){const i=projects.findIndex(p=>p.title.toLowerCase()===String(title).toLowerCase());if(i>=0)open(i)},get projects(){return projects.map(p=>({title:p.title,status:p.status,kind:p.kind,live:p.live,source:p.source}))}};
  });
})();
