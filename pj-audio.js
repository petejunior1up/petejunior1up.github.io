/* PJ AUDIO ENGINE — original in-browser soundtrack tuned for PJ's dark cyber / night-drive vibe. */
(()=>{
  if(window.PJAudio)return;

  const tracks=[
    {name:'XYPHER MODE',tag:'DARK PHONK // NIGHT SYSTEM',style:'phonk',bpm:92,root:34,scale:[0,3,5,7,10],arp:[0,2,4,1,3,4,2,0],progression:[0,-2,3,-4],wave:'sawtooth',pad:'triangle'},
    {name:'404 AFTER DARK',tag:'DARK LUXURY // AFTER HOURS',style:'luxury',bpm:72,root:31,scale:[0,2,3,7,10],arp:[0,3,1,4,2,3,1,0],progression:[0,3,-2,5],wave:'triangle',pad:'sine'},
    {name:'RED PROTOCOL',tag:'CYBER CORE // RED SYSTEM',style:'cyber',bpm:84,root:36,scale:[0,3,5,7,10],arp:[0,2,4,1,3,2,4,0],progression:[0,-2,3,-4],wave:'sawtooth',pad:'triangle'},
    {name:'NIGHT SHELL',tag:'STEALTH MODE // LOW SIGNAL',style:'stealth',bpm:70,root:33,scale:[0,2,3,7,9],arp:[0,3,1,4,2,1,3,0],progression:[0,3,-2,5],wave:'triangle',pad:'sine'},
    {name:'GHOST IN THE WIRE',tag:'HAUNTED NETWORK // DEEP CYBER',style:'ambient',bpm:68,root:29,scale:[0,3,5,7,11],arp:[0,3,2,4,1,2,3,0],progression:[0,3,-4,-2],wave:'triangle',pad:'sine'},
    {name:'BLACKOUT PROTOCOL',tag:'INDUSTRIAL // HARD SYSTEM',style:'industrial',bpm:100,root:38,scale:[0,1,5,7,8],arp:[0,4,2,3,1,4,3,0],progression:[0,-5,1,-3],wave:'square',pad:'triangle'},
    {name:'NEON STATIC',tag:'NIGHT DRIVE // NEON CITY',style:'drive',bpm:88,root:35,scale:[0,3,5,8,10],arp:[0,1,3,4,2,3,1,4],progression:[0,5,3,-2],wave:'triangle',pad:'sine'},
    {name:'ROOTKIT DREAMS',tag:'MOODY TECH // 02:17 AM',style:'dream',bpm:80,root:34,scale:[0,2,5,7,9],arp:[0,2,4,3,1,4,2,0],progression:[0,4,-3,2],wave:'sawtooth',pad:'triangle'}
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
    delay=ctx.createDelay(.9);delay.delayTime.value=.28;
    feedback=ctx.createGain();feedback.gain.value=.22;
    bus.connect(master);bus.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(master);master.connect(compressor);compressor.connect(ctx.destination);
    noiseBuffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.09),ctx.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
  }

  function tone(freq,when,dur,type='sine',level=.04,cutoff=1400,detune=0){
    const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
    o.type=type;o.frequency.setValueAtTime(freq,when);o.detune.value=detune;
    f.type='lowpass';f.frequency.setValueAtTime(cutoff,when);f.Q.value=1.2;
    g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level),when+.025);g.gain.exponentialRampToValueAtTime(.0001,when+dur);
    o.connect(f);f.connect(g);g.connect(bus);o.start(when);o.stop(when+dur+.03);
  }

  function kick(when,level=.11){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(96,when);o.frequency.exponentialRampToValueAtTime(34,when+.14);g.gain.setValueAtTime(level,when);g.gain.exponentialRampToValueAtTime(.0001,when+.17);o.connect(g);g.connect(bus);o.start(when);o.stop(when+.19);
  }

  function hat(when,level=.018,open=false){
    if(!noiseBuffer)return;const s=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter();s.buffer=noiseBuffer;f.type='highpass';f.frequency.value=open?4200:5400;g.gain.setValueAtTime(level,when);g.gain.exponentialRampToValueAtTime(.0001,when+(open?.11:.045));s.connect(f);f.connect(g);g.connect(bus);s.start(when);s.stop(when+(open?.12:.05));
  }

  function schedule(currentStep,when){
    const t=tracks[trackIndex],bar=Math.floor(currentStep/16),s=currentStep%16,beat=Math.floor(s/4),root=t.root+t.progression[bar%t.progression.length];
    const slow=t.bpm<=72;

    if(t.style==='phonk'){
      if([0,6,10].includes(s))kick(when,s===0?.12:.085);
      if([3,7,11,15].includes(s))hat(when,.018,s===15);
      if([0,4,8,12].includes(s))tone(midi(root-12),when,.48,'sawtooth',.055,290,s===8?-9:0);
      if([2,5,9,13].includes(s)){const d=t.arp[s%t.arp.length]%t.scale.length;tone(midi(root+12+t.scale[d]),when,.16,'triangle',.02,1750,(s%2?-6:6))}
    }else if(t.style==='luxury'){
      if(s===0||s===10)kick(when,.075);
      if(s===7||s===15)hat(when,.008,true);
      if(s%4===0)tone(midi(root-12),when,.68,'triangle',.04,240);
      if(s%4===2){const d=t.arp[(s/2)%t.arp.length]%t.scale.length;tone(midi(root+12+t.scale[d]),when,.42,'sine',.022,1250,4)}
    }else if(t.style==='stealth'){
      if(s===0||s===12)kick(when,.07);
      if([5,9,13].includes(s))hat(when,.008);
      if(s%4===0)tone(midi(root-12),when,.58,'triangle',.035,230);
      if(s===6||s===14)tone(midi(root+19),when,.24,'sine',.015,1100,-5);
    }else if(t.style==='ambient'){
      if(s===0)kick(when,.055);
      if(s===8)hat(when,.006,true);
      if(s%8===0)tone(midi(root-12),when,1.15,'sine',.03,210);
      if(s===4||s===12)tone(midi(root+12+t.scale[3]),when,1.4,'triangle',.016,760,s===12?7:-7);
    }else if(t.style==='industrial'){
      if(s%4===0||s===6||s===14)kick(when,s%4===0?.105:.07);
      if(s%2===1)hat(when,.023,s===15);
      if(s%4===0)tone(midi(root-12),when,.34,'square',.047,350,s===8?-8:5);
      if(s%4===2)tone(midi(root+24+t.scale[(beat+1)%t.scale.length]),when,.09,'square',.014,2700,12);
    }else if(t.style==='drive'){
      if(s%4===0)kick(when,.095);
      if(s%2===1)hat(when,.013,s===15);
      if(s%4===0)tone(midi(root-12),when,.45,'triangle',.04,310);
      if(s%2===0){const d=t.arp[(s/2)%t.arp.length]%t.scale.length;tone(midi(root+12+t.scale[d]),when,.2,'triangle',.023,2300,s===12?6:0)}
    }else if(t.style==='dream'){
      if(s===0||s===8)kick(when,.08);
      if(s===3||s===11)hat(when,.009,true);
      if(s%4===0)tone(midi(root-12),when,.62,'sawtooth',.035,260);
      if(s===4||s===12)tone(midi(root+17),when,.72,'triangle',.018,1200,s===12?7:-7);
    }else{
      if(s%4===0){kick(when,.1);tone(midi(root-12),when,.42,t.wave,.045,320)}
      if(s%2===1)hat(when,.014);
      if(s%2===0){const degree=t.arp[(s/2)%t.arp.length]%t.scale.length;const note=root+12+t.scale[degree];tone(midi(note),when,.18,'triangle',.024,2200)}
    }

    if(s===0){const chord=[root,root+t.scale[2]+12,root+t.scale[4]+12];chord.forEach((n,i)=>tone(midi(n),when,slow?4.8:3.6,t.pad,slow?.015:.011,slow?580:720,[-7,0,7][i]))}
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
  start(true);
})();