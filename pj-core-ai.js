/* PJ CORE // AI — local portfolio intelligence + action layer. No external API. */
(()=>{
  if(window.PJCoreAI)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9+\s]/g,' ').replace(/\s+/g,' ').trim();
    const includesAny=(q,arr)=>arr.some(x=>q.includes(x));
    const scrollTo=id=>{const el=document.querySelector(id);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});return true}return false};
    const openUrl=url=>{window.open(url,'_blank','noopener,noreferrer')};

    const root=document.createElement('section');
    root.className='pjai-root';
    root.setAttribute('aria-label','PJ Core AI assistant');
    root.innerHTML=`
      <button class="pjai-launch" type="button" aria-label="Open PJ Core AI"><i></i><span>PJ CORE // AI</span><b>⌁</b></button>
      <div class="pjai-panel" role="dialog" aria-modal="false" aria-label="PJ Core AI">
        <div class="pjai-head">
          <div class="pjai-brand"><span class="pjai-orb"><i></i><i></i><i></i></span><div><small>LOCAL INTELLIGENCE</small><strong>PJ CORE // AI</strong></div></div>
          <div class="pjai-head-actions"><span class="pjai-state">ONLINE</span><button class="pjai-min" type="button" aria-label="Close PJ Core AI">×</button></div>
        </div>
        <div class="pjai-scope"><span>KNOWLEDGE // THIS PORTFOLIO</span><span>NETWORK // NOT REQUIRED</span></div>
        <div class="pjai-log" aria-live="polite"></div>
        <div class="pjai-chips">
          <button type="button" data-q="Who is Pete?">WHO IS PETE?</button>
          <button type="button" data-q="Show me the projects">PROJECTS</button>
          <button type="button" data-q="What are his skills?">SKILLS</button>
          <button type="button" data-q="Open Xypher mode">XYPHER</button>
        </div>
        <form class="pjai-form">
          <span class="pjai-prompt">&gt;_</span>
          <input class="pjai-input" autocomplete="off" spellcheck="false" maxlength="240" placeholder="Ask about Pete or control the site…" aria-label="Ask PJ Core AI">
          <button type="submit" aria-label="Send to PJ Core AI">↗</button>
        </form>
        <div class="pjai-foot"><span><i></i> SITE-NATIVE</span><em>NO CHAT DATA SENT OFF-SITE</em></div>
      </div>`;
    document.body.appendChild(root);

    const launch=root.querySelector('.pjai-launch'),panel=root.querySelector('.pjai-panel'),log=root.querySelector('.pjai-log'),form=root.querySelector('.pjai-form'),input=root.querySelector('.pjai-input'),state=root.querySelector('.pjai-state');
    let open=false,thinking=false,xypher=false;

    const projects=()=>[...document.querySelectorAll('.project-card:not(.coming-soon)')].map((card,i)=>({
      index:i,
      title:card.querySelector('h3')?.textContent?.trim()||`Project ${i+1}`,
      type:card.querySelector('.project-type')?.textContent?.trim()||'PROJECT',
      desc:card.querySelector('.project-content > p:not(.project-type)')?.textContent?.trim()||'',
      tags:[...card.querySelectorAll('.project-tags span')].map(x=>x.textContent.trim()),
      live:card.querySelector('.project-button.primary')?.href||'',
      source:[...card.querySelectorAll('.project-actions a')].find(a=>/source/i.test(a.textContent))?.href||''
    }));
    const skills=()=>[...document.querySelectorAll('.skill')].map(s=>({name:s.querySelector('.skill-name span')?.textContent?.trim(),level:s.querySelector('.skill-name strong')?.textContent?.trim()})).filter(x=>x.name);
    const identity=()=>window.PJIdentityHologram?.identity||null;

    const add=(role,text,meta='')=>{
      const msg=document.createElement('div');msg.className=`pjai-msg ${role}`;
      msg.innerHTML=`<small>${role==='user'?'VISITOR':'PJ CORE'}${meta?` // ${esc(meta)}`:''}</small><div>${esc(text).replace(/\n/g,'<br>')}</div>`;
      log.appendChild(msg);log.scrollTop=log.scrollHeight;return msg;
    };
    const addAction=(label,fn)=>{
      const wrap=document.createElement('div');wrap.className='pjai-inline-action';const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);wrap.appendChild(b);log.appendChild(wrap);log.scrollTop=log.scrollHeight;
    };
    const setThinking=v=>{thinking=v;root.classList.toggle('is-thinking',v);state.textContent=v?'PROCESSING':(xypher?'XYPHER LINK':'ONLINE')};

    const openPanel=(focus=true)=>{open=true;root.classList.add('open');launch.setAttribute('aria-expanded','true');if(focus)setTimeout(()=>input.focus(),60)};
    const closePanel=()=>{open=false;root.classList.remove('open');launch.setAttribute('aria-expanded','false')};
    launch.addEventListener('click',()=>open?closePanel():openPanel());
    root.querySelector('.pjai-min').addEventListener('click',closePanel);

    const reply=async raw=>{
      const q=norm(raw);if(!q)return;
      add('user',raw);setThinking(true);await new Promise(r=>setTimeout(r,180+Math.random()*220));
      const ps=projects(),ss=skills(),id=identity();
      let text='',action=null,actionLabel='';

      if(includesAny(q,['hello','hey','hi ','good morning','good evening'])||q==='hi'||q==='hey'){
        text=`Signal received${id?.id?`, ${id.id}`:''}. I’m PJ CORE — the local intelligence layer for this portfolio. Ask me about Pete, projects, skills, or tell me to control the interface.`;
      }else if(includesAny(q,['who is pete','about pete','who are you','tell me about pete','who is pj'])){
        const about=[...document.querySelectorAll('#about .about-text > p')].map(p=>p.textContent.trim()).join(' ');
        text=about||'Pete Junior is a student, creator and technology enthusiast focused on learning by building. His interests include software development, cybersecurity, AI, hardware, networking and game development.';
        action=()=>scrollTo('#about');actionLabel='OPEN ABOUT // ↗';
      }else if(includesAny(q,['project','build','work'])&&includesAny(q,['show','open','see','list','what','which'])){
        text=`I found ${ps.length} live project${ps.length===1?'':'s'}: ${ps.map((p,i)=>`${i+1}. ${p.title}`).join('  •  ')}. I can inspect them holographically.`;
        action=()=>window.PJIdentityHologram?.openProject?.(0);actionLabel='OPEN HOLOGRAM // ↗';
      }else if(includesAny(q,['portfolio'])&&includesAny(q,['open','launch','show'])){
        const p=ps.find(p=>/portfolio/i.test(p.title));text='Opening the Personal Portfolio project record.';action=()=>p?window.PJIdentityHologram?.openProject?.(p.index):scrollTo('#projects');actionLabel='INSPECT PORTFOLIO // ↗';
      }else if(includesAny(q,['calculator'])&&includesAny(q,['open','launch','show','project'])){
        const p=ps.find(p=>/calculator/i.test(p.title));text='Scientific Calculator located. I can open its project record or launch the live build.';action=()=>p?window.PJIdentityHologram?.openProject?.(p.index):openUrl('https://petejunior1up.github.io/Scientific-Calculator/');actionLabel='INSPECT CALCULATOR // ↗';
      }else if(includesAny(q,['love archive','archive'])&&includesAny(q,['open','launch','show','project'])){
        const p=ps.find(p=>/love archive/i.test(p.title));text='The Love Archive is online — an editorial web experience built around long-form digital storytelling.';action=()=>p?window.PJIdentityHologram?.openProject?.(p.index):openUrl('https://petejunior1up.github.io/Love-Letters/');actionLabel='INSPECT ARCHIVE // ↗';
      }else if(includesAny(q,['skill','technology','technologies','tech stack','what can pete do'])){
        text=ss.length?`Current skill matrix: ${ss.map(s=>`${s.name}${s.level?` ${s.level}`:''}`).join('  •  ')}.`:'The portfolio highlights HTML, CSS, JavaScript and a growing focus on software, cybersecurity, AI, hardware, networking and game development.';
        action=()=>scrollTo('#skills');actionLabel='OPEN SKILLS // ↗';
      }else if(includesAny(q,['contact','email','whatsapp','reach pete','talk to pete'])){
        text='You can reach Pete through the Contact section. Email and WhatsApp routes are published there.';action=()=>scrollTo('#contact');actionLabel='OPEN CONTACT // ↗';
      }else if(includesAny(q,['support','donate','momo','payment'])){
        text='Support is available through the site’s Support My Work panel using MTN MoMo Uganda. I can take you to the contact area where the support control lives.';action=()=>{scrollTo('#contact');setTimeout(()=>document.querySelector('.pjx-support-btn')?.click(),450)};actionLabel='OPEN SUPPORT // ↗';
      }else if(includesAny(q,['identity','visitor id','who am i','clearance'])){
        text=id?`Your current session identity is ${id.id}. Clearance: ${id.access}. Sector: ${id.sector}. Projects inspected: ${id.projectsInspected}.`:'Visitor Identity is initializing. I can open the card for you.';
        action=()=>window.PJIdentityHologram?.openIdentity?.();actionLabel='SHOW IDENTITY // ↗';
      }else if(includesAny(q,['xypher','404','secret mode','hacker mode'])){
        text=xypher?'XYPHER // 404 is already active. Alternate visual core is linked.':'XYPHER // 404 protocol is available. This will switch the portfolio into its hidden alternate experience.';
        action=()=>window.Xypher404?.toggle?.();actionLabel=xypher?'EXIT XYPHER // ↗':'ENTER XYPHER // ↗';
      }else if(includesAny(q,['music','soundtrack','song','audio'])&&includesAny(q,['play','open','start','show','music','soundtrack'])){
        const st=window.PJAudio?.state;text=st?`PJ Audio is ${st.playing?'playing':'ready'}. Current track: ${st.track}. ${st.totalTracks} original tracks are loaded.`:'PJ Audio is available through the site soundtrack player.';
        action=()=>{window.PJAudio?.open?.();if(/play|start/.test(q))window.PJAudio?.play?.()};actionLabel=/play|start/.test(q)?'PLAY AUDIO // ↗':'OPEN PLAYER // ↗';
      }else if(includesAny(q,['pause music','stop music','mute music'])){
        text='Pausing the PJ soundtrack.';window.PJAudio?.pause?.();
      }else if(includesAny(q,['terminal'])&&includesAny(q,['open','show','launch'])){
        text='Terminal route acquired.';action=()=>{scrollTo('.terminal-section');setTimeout(()=>document.getElementById('terminalInput')?.focus(),450)};actionLabel='OPEN TERMINAL // ↗';
      }else if(includesAny(q,['github','source code','code'])&&includesAny(q,['open','show','profile'])){
        text='Pete’s public GitHub profile contains the source repositories behind these projects.';action=()=>openUrl('https://github.com/petejunior1up');actionLabel='OPEN GITHUB // ↗';
      }else if(includesAny(q,['home','about','projects','skills','contact','lab','activity'])&&includesAny(q,['go','open','show','take me','jump'])){
        const map={home:'#home',about:'#about',projects:'#projects',skills:'#skills',contact:'#contact',lab:'#lab',activity:'#activity'};const key=Object.keys(map).find(k=>q.includes(k));text=`Routing to ${key?.toUpperCase()||'requested sector'}.`;action=()=>key&&scrollTo(map[key]);actionLabel='ROUTE // ↗';
      }else if(includesAny(q,['help','what can you do','commands','abilities'])){
        text='I can answer questions about Pete, projects and skills; show your Visitor Identity; open Hologram View; control PJ Audio; enter XYPHER // 404; route around the site; open GitHub, Calculator or Love Archive; and take you to Contact or Support.';
      }else if(includesAny(q,['best project','favorite project','strongest project'])){
        text='I don’t rank Pete’s work as an objective fact. The portfolio currently presents Personal Portfolio, Scientific Calculator and The Love Archive as live featured projects. Hologram View is the fastest way to compare them.';
        action=()=>window.PJIdentityHologram?.openProject?.(0);actionLabel='COMPARE PROJECTS // ↗';
      }else{
        const terms=q.split(' ').filter(x=>x.length>2);const match=ps.map(p=>({p,score:terms.filter(t=>(p.title+' '+p.type+' '+p.desc+' '+p.tags.join(' ')).toLowerCase().includes(t)).length})).sort((a,b)=>b.score-a.score)[0];
        if(match?.score>0){text=`That lines up with ${match.p.title}: ${match.p.desc}`;action=()=>window.PJIdentityHologram?.openProject?.(match.p.index);actionLabel='INSPECT MATCH // ↗';}
        else{text='That isn’t in my local portfolio knowledge yet. Try asking about Pete, projects, skills, contact, Visitor Identity, music, Terminal, Hologram View or XYPHER // 404.';}
      }
      setThinking(false);add('ai',text,xypher?'XYPHER LINK':'LOCAL');if(action&&actionLabel)addAction(actionLabel,action);
    };

    form.addEventListener('submit',e=>{e.preventDefault();if(thinking)return;const q=input.value.trim();if(!q)return;input.value='';reply(q)});
    root.querySelector('.pjai-chips').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(b&&!thinking){openPanel(false);reply(b.dataset.q)}});
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='/'){e.preventDefault();open?closePanel():openPanel();}if(e.key==='Escape'&&open&&document.activeElement?.closest('.pjai-root'))closePanel()});
    window.addEventListener('xypher404change',e=>{xypher=!!e.detail?.active;root.classList.toggle('is-xypher',xypher);state.textContent=xypher?'XYPHER LINK':'ONLINE'});

    add('ai','Core online. I’m the site-native assistant for Pete Junior’s portfolio. Ask me something — or tell me what to open.','BOOT');
    window.PJCoreAI={open:()=>openPanel(),close:closePanel,ask:q=>{openPanel(false);return reply(q)},get state(){return{open,thinking,xypher,projects:projects().length}}};
  });
})();