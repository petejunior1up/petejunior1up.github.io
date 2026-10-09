/* PJ CORE // AI v2 — conversational local portfolio intelligence. No external API. */
(()=>{
  if(window.PJCoreAI)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9+%\s]/g,' ').replace(/\s+/g,' ').trim();
    const has=(q,arr)=>arr.some(x=>q.includes(x));
    const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
    const delay=ms=>new Promise(r=>setTimeout(r,ms));
    const scrollTo=id=>{const el=document.querySelector(id);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});return true}return false};
    const openUrl=url=>window.open(url,'_blank','noopener,noreferrer');

    const root=document.createElement('section');
    root.className='pjai-root';
    root.setAttribute('aria-label','PJ Core AI assistant');
    root.innerHTML=`
      <button class="pjai-launch" type="button" aria-label="Open PJ Core AI" aria-expanded="false"><i></i><span>PJ CORE // AI</span><b>⌁</b></button>
      <div class="pjai-panel" role="dialog" aria-modal="false" aria-label="PJ Core AI">
        <div class="pjai-head">
          <div class="pjai-brand"><span class="pjai-orb"><i></i><i></i><i></i></span><div><small>CONVERSATIONAL CORE</small><strong>PJ CORE // AI</strong></div></div>
          <div class="pjai-head-actions"><span class="pjai-state"><i></i>ONLINE</span><button class="pjai-min" type="button" aria-label="Minimize PJ Core AI">—</button></div>
        </div>
        <div class="pjai-scope"><span>MEMORY // SESSION ACTIVE</span><span>CORE // ALWAYS ONLINE</span></div>
        <div class="pjai-log" aria-live="polite"></div>
        <div class="pjai-chips">
          <button type="button" data-q="Who is Pete?">WHO IS PETE?</button>
          <button type="button" data-q="Show me his projects">PROJECTS</button>
          <button type="button" data-q="What are his skills?">SKILLS</button>
          <button type="button" data-q="What can you do?">HELP</button>
        </div>
        <form class="pjai-form">
          <span class="pjai-prompt">&gt;_</span>
          <input class="pjai-input" autocomplete="off" autocapitalize="sentences" enterkeyhint="send" inputmode="text" spellcheck="true" maxlength="500" placeholder="Talk to PJ Core…" aria-label="Message PJ Core AI">
          <button type="submit" aria-label="Send to PJ Core AI">↗</button>
        </form>
        <div class="pjai-foot"><span><i></i> ONLINE</span><em>SESSION MEMORY // LOCAL</em></div>
      </div>`;
    document.body.appendChild(root);

    const launch=root.querySelector('.pjai-launch'),log=root.querySelector('.pjai-log'),form=root.querySelector('.pjai-form'),input=root.querySelector('.pjai-input');
    let panelOpen=false,thinking=false,xypher=false;
    let history=[];
    const ctx={topic:'intro',project:null,section:null,lastIntent:null};

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
    const about=()=>[...document.querySelectorAll('#about .about-text > p')].map(p=>p.textContent.trim()).join(' ');

    const remember=(role,text,topic=ctx.topic)=>{
      history.push({role,text,topic,at:Date.now()});
      history=history.slice(-14);
      try{sessionStorage.setItem('pjCoreConversation',JSON.stringify(history.slice(-10)))}catch(_){}
    };
    try{const saved=JSON.parse(sessionStorage.getItem('pjCoreConversation')||'[]');if(Array.isArray(saved))history=saved.slice(-10)}catch(_){}

    const add=(role,text,meta='')=>{
      const msg=document.createElement('div');msg.className=`pjai-msg ${role}`;
      msg.innerHTML=`<small>${role==='user'?'VISITOR':'PJ CORE'}${meta?` // ${esc(meta)}`:''}</small><div>${esc(text).replace(/\n/g,'<br>')}</div>`;
      log.appendChild(msg);log.scrollTop=log.scrollHeight;return msg;
    };
    const addAction=(label,fn)=>{
      const wrap=document.createElement('div');wrap.className='pjai-inline-action';const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);wrap.appendChild(b);log.appendChild(wrap);log.scrollTop=log.scrollHeight;
    };
    const showTyping=()=>{const el=document.createElement('div');el.className='pjai-msg ai pjai-typing';el.innerHTML='<small>PJ CORE // ONLINE</small><div><i></i><i></i><i></i></div>';log.appendChild(el);log.scrollTop=log.scrollHeight;return el};
    const setThinking=v=>{thinking=v;root.classList.toggle('is-thinking',v)};

    const openPanel=(focus=true)=>{panelOpen=true;root.classList.add('open');launch.setAttribute('aria-expanded','true');if(focus)setTimeout(()=>{input.focus({preventScroll:true});log.scrollTop=log.scrollHeight},80)};
    const minimize=()=>{panelOpen=false;root.classList.remove('open');launch.setAttribute('aria-expanded','false')};
    launch.addEventListener('click',()=>panelOpen?minimize():openPanel());
    root.querySelector('.pjai-min').addEventListener('click',minimize);

    const ordinalIndex=q=>{
      const words={first:0,one:0,'1st':0,second:1,two:1,'2nd':1,third:2,three:2,'3rd':2,fourth:3,four:3,'4th':3};
      for(const [k,v] of Object.entries(words))if(q.includes(k))return v;
      const m=q.match(/(?:project\s*)?(\d+)/);return m?Math.max(0,Number(m[1])-1):null;
    };
    const findProject=(q,ps)=>{
      const ord=ordinalIndex(q);if(ord!==null&&ps[ord])return ps[ord];
      let best=null,score=0;
      ps.forEach(p=>{
        const title=norm(p.title),blob=norm(`${p.title} ${p.type} ${p.tags.join(' ')}`);let s=0;
        q.split(' ').filter(x=>x.length>2).forEach(t=>{if(title.includes(t))s+=3;else if(blob.includes(t))s+=1});
        if(s>score){score=s;best=p}
      });
      return score>=2?best:null;
    };
    const projectFromContext=(q,ps)=>findProject(q,ps)||(ctx.project!==null?ps[ctx.project]:null);
    const isFollowUp=q=>has(q,['tell me more','more about','what about it','what about that','and it','and that','that one','this one','open it','launch it','show it','built with','stack','source','live version','why did','why was','what did he use']);

    const responseFor=raw=>{
      const q=norm(raw),ps=projects(),ss=skills(),id=identity();
      let text='',actions=[],topic=ctx.topic,intent='chat';
      const p=findProject(q,ps);
      if(p){ctx.project=p.index;topic='project'}

      if(!q)return null;

      if(has(q,['hello','hey','hiya','yo','sup','good morning','good afternoon','good evening'])||q==='hi'){
        topic='smalltalk';intent='greeting';
        text=pick([
          `Hey${id?.id?` ${id.id}`:''} — I’m here. What do you want to explore?`,
          'Hey. PJ Core is online — what are we looking at today?',
          'Yo 👋 I’m online. Ask me about Pete, his projects, or just tell me where you want to go.'
        ]);
      }else if(has(q,['how are you','how you doing','how s it going','you good'])){
        topic='smalltalk';intent='smalltalk';text=pick(['Running clean 😌 What are you curious about?','All systems good over here. What’s up?','Doing good — fully online and listening. What do you want to know?']);
      }else if(has(q,['thanks','thank you','thx','appreciate it'])){
        topic='smalltalk';intent='thanks';text=pick(['Anytime.','Got you 🤝','No problem — what else do you want to check out?','You’re welcome. Keep going.']);
      }else if(has(q,['nice','cool','awesome','great','fire','sick'])&&q.split(' ').length<8){
        topic='smalltalk';intent='reaction';text=pick(['Glad you like it 😎','Yeah, the system’s getting serious now 😂','That’s the vibe. Want to see another part of it?']);
      }else if(has(q,['who are you','what are you','your name','are you ai'])){
        topic='ai';intent='identity';text='I’m PJ CORE // AI — the conversational layer built into Pete’s portfolio. I run locally in the site, remember the current session, understand the portfolio, and can control parts of the interface. I’m not a full cloud model like ChatGPT, so I’m strongest when the conversation stays around this site and its content.';
      }else if(has(q,['what can you do','help','abilities','commands','what do you know'])){
        topic='ai';intent='help';text='I can chat about Pete, explain and compare his projects, remember what we were just discussing, answer follow-ups, show skills and contact info, inspect projects in Hologram View, control the soundtrack, open the terminal, show your Visitor ID, enter XYPHER // 404, and route you around the site.';
      }else if(has(q,['who is pete','about pete','tell me about pete','who is pj','what is pete like'])){
        topic='about';intent='about';text=about()||'Pete Junior is a student and technology enthusiast who learns by building. His interests include software development, cybersecurity, AI, hardware, networking and game development.';
        actions.push(['OPEN ABOUT // ↗',()=>scrollTo('#about')]);
      }else if((has(q,['project','projects','built','builds','work'])&&has(q,['show','list','what','which','see','made','has']))||q==='projects'){
        topic='projects';intent='project-list';ctx.project=null;
        text=`Pete currently has ${ps.length} live featured project${ps.length===1?'':'s'}: ${ps.map((x,i)=>`${i+1}. ${x.title}`).join(' • ')}. Pick one by name or number and I’ll stay on that project with you.`;
        actions.push(['OPEN HOLOGRAM // ↗',()=>window.PJIdentityHologram?.openProject?.(0)]);
      }else if(p || (isFollowUp(q)&&ctx.project!==null)){
        const cp=p||projectFromContext(q,ps);if(cp){ctx.project=cp.index;topic='project';intent='project-detail';
          if(has(q,['built with','stack','technology','technologies','tech','what did he use','made with'])){
            text=cp.tags.length?`${cp.title} uses ${cp.tags.join(', ')}.`:`The portfolio doesn’t list a technology stack for ${cp.title}.`;
          }else if(has(q,['source','code','github'])){
            text=cp.source?`${cp.title} has a public source repository available.`:`I don’t see a public source link listed for ${cp.title}.`;
            if(cp.source)actions.push(['OPEN SOURCE // ↗',()=>openUrl(cp.source)]);
          }else if(has(q,['live','launch','open it','show it','visit'])){
            text=cp.live?`${cp.title} is live. I can launch it or inspect it here.`:`I don’t see a live link published for ${cp.title}.`;
            if(cp.live)actions.push(['LAUNCH LIVE // ↗',()=>openUrl(cp.live)]);
          }else if(has(q,['why did','why was','reason','purpose'])){
            text=`The site describes ${cp.title} as: ${cp.desc||'a featured portfolio project'}. It doesn’t publish a separate “why I built this” note yet, so I won’t invent one.`;
          }else{
            text=`${cp.title} — ${cp.desc||cp.type}. ${cp.tags.length?`It’s built around ${cp.tags.join(', ')}.`:''}`.trim();
            actions.push(['INSPECT PROJECT // ↗',()=>window.PJIdentityHologram?.openProject?.(cp.index)]);
          }
        }
      }else if(has(q,['skill','skills','technology','technologies','tech stack','what can pete do','what does pete know'])){
        topic='skills';intent='skills';text=ss.length?`His current skill matrix shows ${ss.map(s=>`${s.name}${s.level?` ${s.level}`:''}`).join(', ')}. The About section also lists software development, cybersecurity, AI, hardware, networking and game development as active interests.`:'The portfolio highlights HTML, CSS, JavaScript and broader interests in software, cybersecurity, AI, hardware, networking and game development.';
        actions.push(['OPEN SKILLS // ↗',()=>scrollTo('#skills')]);
      }else if(has(q,['contact','email','whatsapp','reach pete','talk to pete','message pete'])){
        topic='contact';intent='contact';text='You can reach Pete through the Contact section — both email and WhatsApp are published there.';actions.push(['OPEN CONTACT // ↗',()=>scrollTo('#contact')]);
      }else if(has(q,['support','donate','momo','payment','mobile money'])){
        topic='support';intent='support';text='Support is available through MTN MoMo Uganda in the Support My Work panel.';actions.push(['OPEN SUPPORT // ↗',()=>{scrollTo('#contact');setTimeout(()=>document.querySelector('.pjx-support-btn')?.click(),450)}]);
      }else if(has(q,['identity','visitor id','who am i','clearance','my id'])){
        topic='identity';intent='visitor-id';text=id?`You’re ${id.id}. Current clearance: ${id.access}. Sector: ${id.sector}. Projects inspected: ${id.projectsInspected}.`:'Your Visitor Identity layer is still initializing, but I can open the card.';actions.push(['SHOW IDENTITY // ↗',()=>window.PJIdentityHologram?.openIdentity?.()]);
      }else if(has(q,['xypher','404','secret mode','hacker mode'])){
        topic='xypher';intent='xypher';text=xypher?'XYPHER // 404 is active right now. Want me to switch back to the normal visual core?':'XYPHER // 404 is the hidden alternate visual mode. I can activate it for you.';actions.push([xypher?'EXIT XYPHER // ↗':'ENTER XYPHER // ↗',()=>window.Xypher404?.toggle?.()]);
      }else if(has(q,['pause music','stop music','mute music'])){
        topic='music';intent='music-pause';window.PJAudio?.pause?.();text='Paused. I’m still here — only the soundtrack stopped.';
      }else if(has(q,['music','soundtrack','song','audio'])){
        topic='music';intent='music';const st=window.PJAudio?.state;text=st?`The soundtrack is ${st.playing?'playing':'ready'}. Current track: ${st.track}. There are ${st.totalTracks} original tracks loaded.`:'The PJ soundtrack player is available.';
        actions.push([has(q,['play','start'])?'PLAY MUSIC // ↗':'OPEN PLAYER // ↗',()=>{window.PJAudio?.open?.();if(has(q,['play','start']))window.PJAudio?.play?.()}]);
      }else if(has(q,['terminal'])){
        topic='terminal';intent='terminal';text='Yep — there’s a working terminal section on the site.';actions.push(['OPEN TERMINAL // ↗',()=>{scrollTo('.terminal-section');setTimeout(()=>document.getElementById('terminalInput')?.focus(),450)}]);
      }else if(has(q,['github','source code','repositories','repo'])){
        topic='github';intent='github';text='Pete’s public GitHub holds the repositories behind the portfolio and its projects.';actions.push(['OPEN GITHUB // ↗',()=>openUrl('https://github.com/petejunior1up')]);
      }else if(has(q,['calculator'])){
        const cp=ps.find(x=>/calculator/i.test(x.title));ctx.project=cp?.index??ctx.project;topic='project';intent='calculator';text=cp?`${cp.title}: ${cp.desc}`:'The Scientific Calculator is one of Pete’s live projects.';actions.push(['OPEN CALCULATOR // ↗',()=>cp?.live?openUrl(cp.live):openUrl('https://petejunior1up.github.io/Scientific-Calculator/')]);
      }else if(has(q,['love archive','the archive'])){
        const cp=ps.find(x=>/love archive/i.test(x.title));ctx.project=cp?.index??ctx.project;topic='project';intent='archive';text=cp?`${cp.title}: ${cp.desc}`:'The Love Archive is Pete’s editorial web experience.';actions.push(['OPEN LOVE ARCHIVE // ↗',()=>cp?.live?openUrl(cp.live):openUrl('https://petejunior1up.github.io/Love-Letters/')]);
      }else if(has(q,['best project','favorite project','strongest project'])){
        topic='projects';intent='compare';text='I wouldn’t pretend there’s an objective “best” one. The Personal Portfolio shows the broadest interface work, the Scientific Calculator shows functional logic, and The Love Archive leans more into editorial experience and storytelling. Which kind of work do you care about most?';
      }else if(has(q,['go home','open home','show about','open about','show projects','open projects','show skills','open skills','open contact','show contact','project lab','activity log'])){
        const map={home:'#home',about:'#about',projects:'#projects',skills:'#skills',contact:'#contact',lab:'#lab',activity:'#activity'};const key=Object.keys(map).find(k=>q.includes(k));topic=key||'navigation';intent='navigate';text=`Sure — taking you to ${key?.toUpperCase()||'that section'}.`;if(key)actions.push(['GO // ↗',()=>scrollTo(map[key])]);
      }else if(has(q,['tell me more','go on','continue','what else','and what else'])){
        intent='follow-up';topic=ctx.topic;
        if(ctx.project!==null&&ps[ctx.project]){const cp=ps[ctx.project];text=`A bit more on ${cp.title}: it’s classified as ${cp.type}. ${cp.tags.length?`The listed stack is ${cp.tags.join(', ')}.`:''} ${cp.live?'There’s also a live build you can launch.':''}`.trim();actions.push(['INSPECT IT // ↗',()=>window.PJIdentityHologram?.openProject?.(cp.index)]);}
        else if(ctx.topic==='about'){text='Pete’s portfolio frames him as someone who learns through experimentation: building software, exploring cybersecurity and AI, and connecting that with hardware, networking and game development.';}
        else if(ctx.topic==='skills'){text='The strongest visible web skills are HTML, CSS and JavaScript, while the broader interests show where the portfolio is heading next.';}
        else{text='Sure — tell me which part you want me to go deeper on: Pete himself, projects, skills, the site systems, or how this AI works.';}
      }else if(has(q,['can you chat','normal conversation','talk normally','talk to me'])){
        topic='ai';intent='conversation';text='Yeah. You don’t have to talk to me like a command line anymore. I can hold onto the current topic and follow the thread. Just know I’m still a local portfolio AI, so I don’t have broad world knowledge or live web access behind me.';
      }else{
        const terms=q.split(' ').filter(x=>x.length>2);const match=ps.map(x=>({p:x,score:terms.filter(t=>norm(`${x.title} ${x.type} ${x.desc} ${x.tags.join(' ')}`).includes(t)).length})).sort((a,b)=>b.score-a.score)[0];
        if(match?.score>0){ctx.project=match.p.index;topic='project';intent='project-match';text=`That sounds closest to ${match.p.title}. ${match.p.desc}`;actions.push(['INSPECT MATCH // ↗',()=>window.PJIdentityHologram?.openProject?.(match.p.index)]);}
        else{topic='ai';intent='fallback';text=pick([
          'I can follow the conversation, but that specific answer isn’t in the knowledge available to this local site. If it’s about Pete or the portfolio, give me a little more context and I’ll connect it.',
          'That goes beyond what this local build actually knows. I’d rather say that than make something up. I can still help with Pete, his projects, skills, or anything on the site.',
          'I’m with you, but I don’t have enough verified site knowledge to answer that one properly. Try tying it back to Pete or one of the projects and I can keep going.'
        ]);}
      }
      ctx.topic=topic;ctx.lastIntent=intent;return{text,actions,topic,intent};
    };

    const reply=async raw=>{
      if(thinking)return;const clean=String(raw||'').trim();if(!clean)return;
      add('user',clean);remember('user',clean);setThinking(true);const typing=showTyping();
      await delay(260+Math.random()*360);
      const out=responseFor(clean);typing.remove();setThinking(false);if(!out)return;
      add('ai',out.text,'ONLINE');remember('ai',out.text,out.topic);out.actions.forEach(([label,fn])=>addAction(label,fn));
    };

    form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();if(!q||thinking)return;input.value='';reply(q)});
    root.querySelector('.pjai-chips').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(b&&!thinking){openPanel(false);reply(b.dataset.q)}});
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='/'){e.preventDefault();openPanel();}if(e.key==='Escape'&&panelOpen&&document.activeElement?.closest('.pjai-root'))minimize()});
    window.addEventListener('xypher404change',e=>{xypher=!!e.detail?.active;root.classList.toggle('is-xypher',xypher)});

    const syncViewport=()=>{const vv=window.visualViewport;document.documentElement.style.setProperty('--pjai-vvh',`${Math.round(vv?.height||innerHeight)}px`);document.documentElement.style.setProperty('--pjai-vvo',`${Math.round(vv?.offsetTop||0)}px`)};
    syncViewport();window.addEventListener('resize',syncViewport,{passive:true});window.visualViewport?.addEventListener('resize',()=>{syncViewport();requestAnimationFrame(()=>log.scrollTop=log.scrollHeight)},{passive:true});window.visualViewport?.addEventListener('scroll',syncViewport,{passive:true});
    input.addEventListener('focus',()=>setTimeout(()=>{syncViewport();log.scrollTop=log.scrollHeight},180));

    if(history.length){add('ai','Welcome back. I kept the thread from this session — we can continue where you left off.','ONLINE');}
    else add('ai','Hey — PJ Core is online. You can talk to me normally now. Ask about Pete, a project, or just tell me what you want to explore.','ONLINE');

    window.PJCoreAI={open:()=>openPanel(),minimize,ask:q=>{openPanel(false);return reply(q)},get state(){return{online:true,open:panelOpen,thinking,xypher,topic:ctx.topic,project:ctx.project,projects:projects().length,history:history.length}}};
  });
})();