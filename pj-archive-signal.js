/* PJ // ARCHIVE SIGNAL — makes the protected archive discoverable without exposing access. */
(()=>{
  if(window.PJArchiveSignal)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const root=document.createElement('aside');
    root.className='pjas-root';
    root.setAttribute('aria-label','Classified archive signal');
    root.innerHTML=`
      <button class="pjas-beacon" type="button" aria-expanded="false"><i></i><span>CLASSIFIED // 04.5</span><b>LOCKED</b></button>
      <div class="pjas-panel" role="dialog" aria-modal="false" aria-label="Restricted archive signal">
        <div class="pjas-head"><span>RESTRICTED SIGNAL // 04.5</span><button type="button" class="pjas-close" aria-label="Close">×</button></div>
        <div class="pjas-body">
          <small>UNLISTED SECTOR DETECTED</small>
          <h3>THERE IS MORE<br>THAN THE PUBLIC SITE.</h3>
          <p>A protected personal archive exists somewhere inside this portfolio. It is intentionally absent from normal navigation.</p>
          <div class="pjas-readout"><span>SECTOR</span><b>ARCHIVE // 04.5</b><span>STATUS</span><b>ACCESS RESTRICTED</b><span>ROUTE</span><b>HIDDEN IN SYSTEM LAYERS</b></div>
          <p class="pjas-clue">CLUE // The public interface will not hand you the door. Explorers notice patterns, terminals, developer signals and things that react when used differently.</p>
          <button class="pjas-hunt" type="button">BEGIN THE HUNT ↗</button>
        </div>
      </div>`;
    document.body.appendChild(root);

    const beacon=root.querySelector('.pjas-beacon'),panel=root.querySelector('.pjas-panel');
    let open=false;
    const show=()=>{open=true;root.classList.add('open');beacon.setAttribute('aria-expanded','true');try{sessionStorage.setItem('pjArchiveSignalSeen','1')}catch(_){}};
    const hide=()=>{open=false;root.classList.remove('open');beacon.setAttribute('aria-expanded','false')};
    beacon.onclick=()=>open?hide():show();
    root.querySelector('.pjas-close').onclick=hide;
    root.querySelector('.pjas-hunt').onclick=()=>{hide();document.querySelector('.terminal-section')?.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>document.getElementById('terminalInput')?.focus(),500)};

    const footer=document.querySelector('footer,.footer');
    if(footer&&!document.querySelector('.pjas-footer-signal')){
      const hint=document.createElement('button');
      hint.type='button';hint.className='pjas-footer-signal';hint.innerHTML='<i></i> SIGNAL 04.5 // RESTRICTED SECTOR EXISTS';hint.onclick=show;footer.appendChild(hint);
    }

    const form=document.getElementById('terminalForm'),input=document.getElementById('terminalInput'),out=document.getElementById('terminalOutput');
    if(form&&input&&out){
      form.addEventListener('submit',e=>{
        const q=input.value.trim().toLowerCase();
        if(!['archive','classified','vault','04.5'].includes(q))return;
        e.preventDefault();e.stopImmediatePropagation();
        const write=(t,c='')=>{const p=document.createElement('p');p.textContent=t;if(c)p.className=c;out.appendChild(p)};
        write(`pete@portfolio:~$ ${q}`,'terminal-command');
        write('[ SIGNAL DETECTED ] ARCHIVE // 04.5');
        write('PUBLIC ROUTE: UNAVAILABLE');
        write('ACCESS: RESTRICTED');
        write('HINT: This archive belongs to the developer layer, not the public terminal.');
        write('Some interfaces reveal more when you interact with them differently.');
        out.scrollTop=out.scrollHeight;input.value='';
      },true);
    }

    let announced=false;
    const maybeAnnounce=()=>{
      if(announced)return;
      const max=document.documentElement.scrollHeight-innerHeight;if(max<=0)return;
      if(scrollY/max>.68){announced=true;try{if(sessionStorage.getItem('pjArchiveSignalSeen'))return}catch(_){}
        const toast=document.createElement('div');toast.className='pjas-toast';toast.textContent='UNLISTED SECTOR DETECTED // ARCHIVE 04.5';document.body.appendChild(toast);
        requestAnimationFrame(()=>toast.classList.add('show'));setTimeout(()=>toast.classList.remove('show'),4200);setTimeout(()=>toast.remove(),4800);
      }
    };
    addEventListener('scroll',maybeAnnounce,{passive:true});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)hide()});

    window.PJArchiveSignal={open:show,close:hide,get state(){return{open,sector:'04.5',status:'restricted'}}};
  });
})();