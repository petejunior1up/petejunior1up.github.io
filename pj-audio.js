/* PJ AUDIO ENGINE — original in-browser cyber soundtrack. No Spotify, no external audio files. */
(()=>{
  if(window.PJAudio)return;

  const tracks=[
    {name:'RED PROTOCOL',tag:'DARK CYBER // ORIGINAL',bpm:82,root:36,scale:[0,3,5,7,10],arp:[0,2,4,1,3,2,4,0],progression:[0,-2,3,-4],wave:'sawtooth',pad:'triangle'},
    {name:'NIGHT SHELL',tag:'STEALTH MODE // ORIGINAL',bpm:74,root:33,scale:[0,2,3,7,9],arp:[0,3,1,4,2,1,3,0],progression:[0,3,-2,5],wave:'triangle',pad:'sine'},
    {name:'ZERO TRACE',tag:'GLITCH SECTOR // ORIGINAL',bpm:96,root:38,scale:[0,1,5,7,8],arp:[0,4,2,3,1,4,3,0],progression:[0,-5,1,-3],wave:'square',pad:'triangle'}
  ];

  let ctx=null,master=null,bus=null,delay=null,feedback=null,compressor=null,noiseBuffer=null;
  let timer=null,nextNoteTime=0,step=0,trackIndex=0,isPlaying=false,armed=true,hiddenSuspended=false;
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
    if(s%4===0){kick(when,trackIndex===2?.09:.105);tone(midi(root-12),when,.42,t.wave,.045,320)}
    if(s%2===1)hat(when,trackIndex===2?.024:.014);
    if(s%2===0){const degree=t.arp[(s/2)%t.arp.length]%t.scale.length;const note=root+12+t.scale[degree];tone(midi(note),when,.18,trackIndex===2?'square':'triangle',trackIndex===2?.018:.024,trackIndex===2?1900:2500,trackIndex===2?((s%4)?-7:7):0)}
    if(s===0){
      const chord=[root,root+t.scale[2]+12,root+t.scale[4]+12];
      chord.forEach((n,i)=>{tone(midi(n),when,3.5,t.pad,.012,720,[-7,0,7][i])});
    }
    if(trackIndex===2&&s%4===2){tone(midi(root+24+t.scale[(beat+1)%t.scale.length]),when,.08,'square',.012,2600,12)}
  }

  function scheduler(){
    if(!ctx||!isPlaying)return;
    const t=tracks[trackIndex],stepDur=(60/t.bpm)/4;
    while(nextNoteTime<ctx.currentTime+.12){schedule(step,nextNoteTime);nextNoteTime+=stepDur;step=(step+1)%64}
  }

  async function start(fromAuto=false){
    setupAudio();if(!ctx)return;
    isPlaying=true;setPlayUI(true);
    try{await ctx.resume()}catch(_){}
    if(ctx.state!=='running'){
      armed=true;setStatus('AUTO ARMED');
      if(fromAuto)setPlayUI(false);
      return;
    }
    armed=false;setStatus('PLAYING');nextNoteTime=ctx.currentTime+.04;clearInterval(timer);timer=setInterval(scheduler,25);scheduler();
  }

  function pause(){
    isPlaying=false;clearInterval(timer);timer=null;setPlayUI(false);setStatus('PAUSED');if(ctx&&ctx.state==='running')ctx.suspend().catch(()=>{});
  }

  function toggle(){isPlaying&&ctx?.state==='running'?pause():start(false)}
  function next(dir=1){trackIndex=(trackIndex+dir+tracks.length)%tracks.length;updateTrack();if(isPlaying&&ctx?.state==='running'){nextNoteTime=ctx.currentTime+.05;step=0}}
  function open(){player.classList.add('pja-focus');setTimeout(()=>player.classList.remove('pja-focus'),1400)}

  $('.pja-play').addEventListener('click',e=>{e.stopPropagation();toggle()});
  $('.pja-prev').addEventListener('click',e=>{e.stopPropagation();next(-1)});
  $('.pja-next').addEventListener('click',e=>{e.stopPropagation();next(1)});
  vol.addEventListener('input',()=>{volume=Number(vol.value);if(master&&ctx)master.gain.setTargetAtTime(volume*.17,ctx.currentTime,.05);try{localStorage.setItem('pjAudioVolume',String(volume))}catch(_){}});

  const unlock=()=>{if(armed||!ctx||ctx.state!=='running')start(true)};
  document.addEventListener('pointerdown',unlock,{once:true,capture:true});
  document.addEventListener('keydown',unlock,{once:true,capture:true});
  window.addEventListener('load',()=>start(true),{once:true});

  document.addEventListener('visibilitychange',()=>{
    if(!ctx)return;
    if(document.hidden&&isPlaying&&ctx.state==='running'){hiddenSuspended=true;ctx.suspend().catch(()=>{})}
    else if(!document.hidden&&hiddenSuspended&&isPlaying){hiddenSuspended=false;ctx.resume().then(()=>{nextNoteTime=ctx.currentTime+.04}).catch(()=>{})}
  });

  window.PJAudio={play:()=>start(false),pause,toggle,next:()=>next(1),previous:()=>next(-1),open,get state(){return{playing:isPlaying,track:tracks[trackIndex].name,armed}}};
})();