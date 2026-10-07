/* XYPHER // 404 MODE — hidden alternate experience layer */
(()=>{
  if(window.Xypher404)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let active=false,raf=0,clockTimer=0,msgTimer=0,logoClicks=0,logoTimer=0,keyBuffer='',keyTimer=0;
    let drops=[],fontSize=15,ctx=null;

    const canvas=document.createElement('canvas');canvas.className='xy404-canvas';canvas.setAttribute('aria-hidden','true');document.body.appendChild(canvas);ctx=canvas.getContext('2d');
    const scan=document.createElement('div');scan.className='xy404-scan';scan.setAttribute('aria-hidden','true');document.body.appendChild(scan);
    const spotlight=document.createElement('div');spotlight.className='xy404-spotlight';spotlight.setAttribute('aria-hidden','true');document.body.appendChild(spotlight);

    const hud=document.createElement('aside');hud.className='xy404-hud';hud.setAttribute('aria-label','Xypher 404 mode status');hud.innerHTML=`
      <div class="xy404-hud-top"><strong><i></i>XYPHER // 404 MODE</strong><span class="xy404-clock">00:00:00</span></div>
      <div class="xy404-hud-grid">
        <div class="xy404-hud-cell"><span>IDENTITY</span><strong>XYPHER</strong></div>
        <div class="xy404-hud-cell"><span>SESSION</span><strong class="xy404-session">001</strong></div>
        <div class="xy404-hud-cell"><span>VISUAL CORE</span><strong>OVERRIDDEN</strong></div>
        <div class="xy404-hud-cell"><span>SIGNAL</span><strong>LOCKED</strong></div>
      </div>
      <div class="xy404-message">404 // THE PAGE WAS NEVER MISSING.</div>
      <button class="xy404-exit" type="button">EXIT XYPHER MODE // ESC</button>`;document.body.appendChild(hud);

    const boot=document.createElement('div');boot.className='xy404-boot';boot.setAttribute('aria-hidden','true');boot.innerHTML=`
      <div class="xy404-boot-card">
        <div class="xy404-boot-head"><span>PRIVATE VISUAL LAYER</span><span>ACCESS // 404</span></div>
        <div class="xy404-boot-mark">XYPHER<span>.</span></div>
        <div class="xy404-boot-line" style="animation-delay:.08s"><b>[ OK ]</b> signal handshake accepted</div>
        <div class="xy404-boot-line" style="animation-delay:.24s"><b>[ OK ]</b> identity layer // XYPHER</div>
        <div class="xy404-boot-line" style="animation-delay:.40s"><b>[ OK ]</b> ghost visual core armed</div>
        <div class="xy404-boot-line" style="animation-delay:.56s"><b>[ 404 ]</b> you found what was not supposed to be found</div>
        <div class="xy404-boot-bar"><i></i></div>
      </div>`;document.body.appendChild(boot);

    const clock=()=>{const d=new Date();hud.querySelector('.xy404-clock').textContent=d.toLocaleTimeString([], {hour12:false})};
    const messages=['SIGNAL LOCKED // NOISE FLOOR NOMINAL','GHOST LAYER // STABLE','404 // NOT FOUND WAS THE CLUE','XYPHER CORE // LISTENING','VISUAL ROUTE // REDIRECTED','SYSTEM TRACE // CLEAN'];
    let msgIndex=0;
    const rotateMessage=()=>{hud.querySelector('.xy404-message').textContent=messages[msgIndex++%messages.length]};

    const resize=()=>{
      const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.floor(innerWidth*dpr);canvas.height=Math.floor(innerHeight*dpr);canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);fontSize=innerWidth<700?13:15;drops=Array(Math.ceil(innerWidth/fontSize)).fill(0).map(()=>Math.random()*-40);
    };
    const chars='404XYPHER01<>/{}[]';
    const draw=()=>{
      if(!active||reduced)return;
      ctx.fillStyle='rgba(3,4,5,.12)';ctx.fillRect(0,0,innerWidth,innerHeight);ctx.font=`${fontSize}px monospace`;
      for(let i=0;i<drops.length;i++){
        const ch=chars[(Math.random()*chars.length)|0],x=i*fontSize,y=drops[i]*fontSize;
        ctx.fillStyle=Math.random()>.92?'rgba(255,255,255,.34)':'rgba(255,30,45,.22)';ctx.fillText(ch,x,y);
        if(y>innerHeight&&Math.random()>.974)drops[i]=0;else drops[i]+=.42+Math.random()*.22;
      }
      raf=requestAnimationFrame(draw);
    };

    const sessionNumber=()=>{let n=1;try{n=(Number(localStorage.getItem('xy404Unlocks'))||0)+1;localStorage.setItem('xy404Unlocks',String(n))}catch(_){}return String(n).padStart(3,'0')};

    const activate=(source='secret')=>{
      if(active)return;active=true;document.body.classList.add('xy404-booting');boot.setAttribute('aria-hidden','false');hud.querySelector('.xy404-session').textContent=sessionNumber();
      try{window.PJAudio?.play?.()}catch(_){}
      window.setTimeout(()=>{
        document.body.classList.remove('xy404-booting');document.body.classList.add('xy404-active');boot.setAttribute('aria-hidden','true');resize();ctx.clearRect(0,0,innerWidth,innerHeight);if(!reduced)draw();clock();clearInterval(clockTimer);clockTimer=setInterval(clock,1000);rotateMessage();clearInterval(msgTimer);msgTimer=setInterval(rotateMessage,6500);window.dispatchEvent(new CustomEvent('xypher404change',{detail:{active:true,source}}));
      },reduced?120:1180);
    };
    const deactivate=()=>{
      if(!active)return;active=false;document.body.classList.remove('xy404-active','xy404-booting');cancelAnimationFrame(raf);clearInterval(clockTimer);clearInterval(msgTimer);ctx.clearRect(0,0,innerWidth,innerHeight);window.dispatchEvent(new CustomEvent('xypher404change',{detail:{active:false}}));
    };
    const toggle=()=>active?deactivate():activate('command');

    window.addEventListener('resize',()=>{if(active)resize()});
    window.addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--xy-x',`${e.clientX}px`);document.documentElement.style.setProperty('--xy-y',`${e.clientY}px`)} ,{passive:true});

    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&active){deactivate();return}
      const el=e.target;if(el&&(el.matches?.('input,textarea,select')||el.isContentEditable))return;
      if(e.key.length!==1)return;
      clearTimeout(keyTimer);keyBuffer=(keyBuffer+e.key).slice(-3);if(keyBuffer==='404')activate('keyboard');keyTimer=setTimeout(()=>keyBuffer='',1400);
    });

    const logo=document.querySelector('.logo-mark');
    logo?.addEventListener('click',e=>{
      logoClicks++;clearTimeout(logoTimer);logoTimer=setTimeout(()=>logoClicks=0,1700);
      if(logoClicks>=4){e.preventDefault();logoClicks=0;activate('logo')}
    });
    hud.querySelector('.xy404-exit').addEventListener('click',deactivate);

    window.Xypher404={activate:()=>activate('api'),deactivate,toggle,get active(){return active}};
  });
})();
