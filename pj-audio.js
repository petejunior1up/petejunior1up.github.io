/* PJ AUDIO ENGINE — original in-browser cyber soundtrack. No Spotify, no external audio files. */
(()=>{
  if(window.PJAudio)return;

  const tracks=[
    {name:'RED PROTOCOL',tag:'DARK CYBER // ORIGINAL',bpm:82,root:36,scale:[0,3,5,7,10],arp:[0,2,4,1,3,2,4,0],progression:[0,-2,3,-4],wave:'sawtooth',pad:'triangle'},
    {name:'NIGHT SHELL',tag:'STEALTH MODE // ORIGINAL',bpm:74,root:33,scale:[0,2,3,7,9],arp:[0,3,1,4,2,1,3,0],progression:[0,3,-2,5],wave:'triangle',pad:'sine'},
    {name:'ZERO TRACE',tag:'GLITCH SECTOR // ORIGINAL',bpm:96,root:38,scale:[0,1,5,7,8],arp:[0,4,2,3,1,4,3,0],progression:[0,-5,1,-3],wave:'square',pad:'triangle'},
    {name:'NEON GHOST',tag:'NIGHT DRIVE // ORIGINAL',bpm:88,root:35,scale:[0,3,5,8,10],arp:[0,1,3,4,2,3,1,4],progression:[0,5,3,-2],wave:'triangle',pad:'sine'},
    {name:'BLACK ICE',tag:'COLD NETWORK // ORIGINAL',bpm:78,root:31,scale:[0,2,5,7,10],arp:[0,4,1,3,2,4,1,0],progression:[0,-3,2,-5],wave:'sawtooth',pad:'triangle'},
    {name:'GHOST PACKET',tag:'DATA RUN // ORIGINAL',bpm:102,root:40,scale:[0,2,3,7,10],arp:[0,2,1,4,3,2,4,1],progression:[0,-2,5,3],wave:'square',pad:'sine'},
    {name:'VOID ACCESS',tag:'DEEP SYSTEM // ORIGINAL',bpm:68,root:29,scale:[0,3,5,7,11],arp:[0,3,2,4,1,2,3,0],progression:[0,3,-4,-2],wave:'triangle',pad:'sine'},
    {name:'ROOTKIT DREAMS',tag:'AFTER HOURS // ORIGINAL',bpm:84,root:34,scale:[0,2,5,7,9],arp:[0,2,4,3,1,4,2,0],progression:[0,4,-3,2],wave:'sawtooth',pad:'triangle'}
  ];

  let ctx=null,master=null,bus=null,delay=null,feedback=null,compressor=null,noiseBuffer=null;
  let timer=null,nextNoteTime=0,step=0,trackIndex=0,isPlaying=false,armed=true,hiddenSuspended=false,userPaused=false;
  let volume=.42;
  try{const saved=Number(localStorage.getItem('pjAudioVolume'));if(Number.isFinite(saved)&&saved>=0&&saved<=1)volume=saved}catch(_){}

  const midi=n=>440*Math.pow(2,(n-69)/12);
  const player=document.createElement('div');
  player.className='pja-player';
  player.id='soundtrack';
  player.innerHTML=`
    <div class="pja-signal" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="pja-meta">
      <small>PJ AUDIO // <span class="pja-status">AUTO ARMED</span></small>
      <strong class="pja-title">${tracks[0].name}</strong>
      <span class="pja-tag">${tracks[0].tag}</span>
    </div>
    <div class="pja-controls">
      <button type="button" class="pja-prev" aria-label="Previous track">‹</button>
      <button type="button" class="pja-play" aria-label="Play or pause soundtrack">▶</button>
      <button type="button" class="pja-next" aria-label="Next track">›</button>
    </div>
    <label class="pja-volume" aria-label="Soundtrack volume"><span>VOL</span><input type="range" min="0" max="1" step="0.01" value="${volume}"></label>
  `;
  document.body.appendChild(player);

  const $=s=>player.querySelector(s);
  const statusEl=$('.pja-status'),titleEl=$('.pja-title'),tagEl=$('.pja-tag'),playBtn=$('.pja-play'),vol=$('.pja-volume input');
  const setStatus=t=>{statusEl.textContent=t;player.dataset.state=t.toLowerCase().replace(/\s+/g,'-')};
  const updateTrack=()=>{const t=tracks[trackIndex];titleEl.textContent=t.name;tagEl.textContent=t.tag;step=0;player.classList.add('pja-switch');setTimeout(()=>player.classList.remove('pja-switch'),220)};
  const setPlayUI=on=>{playBtn.textContent=on?'Ⅱ':'▶';playBtn.setAttribute('aria-label',on?'Pause soundtrack':'Play soundtrack');player.classList.toggle('is-playing',on)};

  function setupAudio(){
    if(ctx)return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){setStatus('UNSUPPORTED');return}
    ctx=new AC();
    master=ctx.createGain();master.gain.value=volume*.17;
    compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-20;compressor.knee.value=18;compressor.ratio.value=4;compressor.attack.value=.01;compressor.release.value=.28;
    bus=ctx.createGain();bus.gain.value=.9;
    delay=ctx.createDelay(.8);delay.delayTime.value=.28;
    feedback=ctx.createGain();feedback.gain.value=.22;
    bus.connect(master);bus.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(master);master.connect(compressor);compressor.connect(ctx.destination);
    noiseBuffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.08),ctx.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
  }

  function tone(freq,when,dur,type='sine',level=.04,cutoff=1400,detune=0){
    const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
    o.type=type;o.frequency.setValueAtTime(freq,when);o.detune.value=detune;
    f.type='lowpass';f.frequency.setValueAtTime(cutoff,when);f.Q.value=1.2;
    g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level),when+.025);g.gain.exponentialRampToValueAtTime(.0001,when+dur);
    o.connect(f);f.connect(g);g.connect(bus);o.start(when);o.stop(when+dur+.03);
  }

  function kick(when,level=.11){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(92,when);o.frequency.exponentialRampToValueAtTime(34,when+.13);g.gain.setValueAtTime(level,when);g.gain.exponentialRampToValueAtTime(.0001,when+.16);o.connect(g);g.connect(bus);o.start(when);o.stop(when+.18);
  }

  function hat(when,level=.018){
    if(!noiseBuffer)return;const s=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter();s.buffer=noiseBuffer;f.type='highpass';f.frequency.value=5200;g.gain.setValueAtTime(level,when);g.gain.exponentialRampToValueAtTime(.0001,when+.045);s.connect(f);f.connect(g);g.connect(bus);s.start(when);s.stop(when+.05);
  }

  function schedule(currentStep,when){
    const t=tracks[trackIndex],bar=Math.floor(currentStep/16),s=currentStep%16,beat=Math.floor(s/4),root=t.root+t.progression[bar%t.progression.length];
    const fast=t.bpm>=96,slow=t.bpm<=72,glitch=t.wave==='square';
    if(s%4===0){kick(when,fast?.09:slow?.085:.105);tone(midi(root-12),when,slow?.62:.42,t.wave,.045,slow?260:320)}
    if(s%2===1)hat(when,glitch?.022:slow?.009:.014);
    if(s%2===0){const degree=t.arp[(s/2)%t.arp.length]%t.scale.length;const note=root+12+t.scale[degree];tone(midi(note),when,slow?.3:.18,glitch?'square':'triangle',glitch?.018:.024,glitch?1900:(slow?1500:2500),glitch?((s%4)?-7:7):0)}
    if(s===0){const chord=[root,root+t.scale[2]+12,root+t.scale[4]+12];chord.forEach((n,i)=>tone(midi(n),when,slow?4.5:3.5,t.pad,slow?.016:.012,slow?620:720,[-7,0,7][i]))}
    if(glitch&&s%4===2)tone(midi(root+24+t.scale[(beat+1)%t.scale.length]),when,.08,'square',.012,2600,12);
    if(trackIndex===3&&s===12)tone(midi(root+19),when,.7,'sine',.018,1800,5);
    if(trackIndex===4&&s===8)tone(midi(root+7),when,1.1,'triangle',.02,900,-8);
    if(trackIndex===5&&s%4===3)tone(midi(root+24+t.scale[beat%t.scale.length]),when,.07,'square',.01,3000,6);
    if(trackIndex===6&&s===8)tone(midi(root+12),when,2.5,'sine',.02,560,-5);
    if(trackIndex===7&&s===12)tone(midi(root+17),when,.9,'triangle',.018,1400,7);
  }

  function scheduler(){
    if(!ctx||!isPlaying)return;
    const t=tracks[trackIndex],stepDur=(60/t.bpm)/4;
    while(nextNoteTime<ctx.currentTime+.12){schedule(step,nextNoteTime);nextNoteTime+=stepDur;step=(step+1)%64}
  }

  async function start(fromAuto=false){
    setupAudio();if(!ctx)return;
    try{await ctx.resume()}catch(_){}
    if(ctx.state!=='running'){
      isPlaying=false;armed=true;setPlayUI(false);setStatus('AUTO ARMED');return;
    }
    userPaused=false;isPlaying=true;armed=false;setPlayUI(true);setStatus('PLAYING');nextNoteTime=ctx.currentTime+.04;clearInterval(timer);timer=setInterval(scheduler,25);scheduler();
  }

  function pause(manual=true){
    if(manual)userPaused=true;isPlaying=false;clearInterval(timer);timer=null;setPlayUI(false);setStatus('PAUSED');if(ctx&&ctx.state==='running')ctx.suspend().catch(()=>{});
  }

  function toggle(){isPlaying&&ctx?.state==='running'?pause(true):start(false)}
  function next(dir=1){trackIndex=(trackIndex+dir+tracks.length)%tracks.length;updateTrack();if(isPlaying&&ctx?.state==='running'){nextNoteTime=ctx.currentTime+.05;step=0}}
  function open(){player.classList.add('pja-focus');setTimeout(()=>player.classList.remove('pja-focus'),1400)}

  $('.pja-play').addEventListener('click',e=>{e.stopPropagation();toggle()});
  $('.pja-prev').addEventListener('click',e=>{e.stopPropagation();next(-1)});
  $('.pja-next').addEventListener('click',e=>{e.stopPropagation();next(1)});
  vol.addEventListener('input',()=>{volume=Number(vol.value);if(master&&ctx)master.gain.setTargetAtTime(volume*.17,ctx.currentTime,.05);try{localStorage.setItem('pjAudioVolume',String(volume))}catch(_){}});

  const unlock=()=>{if(!userPaused&&(armed||!ctx||ctx.state!=='running'))start(true)};
  document.addEventListener('click',unlock,{once:true});
  document.addEventListener('keydown',unlock,{once:true,capture:true});

  document.addEventListener('visibilitychange',()=>{
    if(!ctx)return;
    if(document.hidden&&isPlaying&&ctx.state==='running'){hiddenSuspended=true;ctx.suspend().catch(()=>{})}
    else if(!document.hidden&&hiddenSuspended&&isPlaying){hiddenSuspended=false;ctx.resume().then(()=>{nextNoteTime=ctx.currentTime+.04}).catch(()=>{})}
  });

  window.PJAudio={play:()=>start(false),pause:()=>pause(true),toggle,next:()=>next(1),previous:()=>next(-1),open,get state(){return{playing:isPlaying,track:tracks[trackIndex].name,armed,totalTracks:tracks.length}}};

  /* Try immediately. Browsers that block audible autoplay will start it on the visitor's first interaction instead. */
  start(true);
})();