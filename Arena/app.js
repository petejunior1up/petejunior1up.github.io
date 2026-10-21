(()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const storeKey='pjArenaV1';
  const today=()=>new Date().toISOString().slice(0,10);
  const yesterday=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)};
  const banks={
    general:[
      ['Which planet is known as the Red Planet?',['Venus','Mars','Jupiter','Mercury'],1],
      ['What is the largest ocean on Earth?',['Atlantic','Indian','Pacific','Arctic'],2],
      ['How many sides does a hexagon have?',['5','6','7','8'],1],
      ['Which gas do plants mainly absorb from the air?',['Oxygen','Nitrogen','Carbon dioxide','Helium'],2],
      ['What is 15 × 6?',['80','85','90','95'],2],
      ['Which continent is the Sahara Desert mostly in?',['Asia','Africa','Australia','South America'],1],
      ['What does H2O represent?',['Hydrogen','Water','Salt','Oxygen'],1],
      ['Which number is prime?',['21','27','29','33'],2],
      ['What is the opposite of “ancient”?',['Modern','Heavy','Narrow','Silent'],0]
    ],
    football:[
      ['How many players does one football team normally have on the pitch at kickoff?',['9','10','11','12'],2],
      ['What card sends a player off?',['Blue','Yellow','Red','White'],2],
      ['A hat-trick means one player scores how many goals?',['2','3','4','5'],1],
      ['Which body part can an outfield player not deliberately use to control the ball?',['Head','Chest','Hand or arm','Thigh'],2],
      ['What is awarded when a defender commits certain fouls inside their own penalty area?',['Corner','Penalty kick','Throw-in','Drop ball'],1],
      ['How long is a standard senior football match, excluding added and extra time?',['80 minutes','90 minutes','100 minutes','120 minutes'],1],
      ['What is a clean sheet?',['Winning by one goal','Not conceding a goal','Scoring from outside the box','Having no bookings'],1],
      ['Who may normally use their hands inside their own penalty area?',['Captain','Striker','Goalkeeper','Any defender'],2],
      ['What restarts play when the whole ball crosses the touchline?',['Throw-in','Penalty','Kick-off','Goal kick'],0]
    ],
    tech:[
      ['What does HTML mainly describe on a web page?',['Structure','Internet speed','Battery life','File encryption'],0],
      ['Which language is commonly used to add interaction in a browser?',['JavaScript','SQL only','PNG','HTTP'],0],
      ['What does CSS mainly control?',['Visual presentation','Email delivery','CPU temperature','Passwords'],0],
      ['Which is the strongest password habit?',['Reuse one password','Use long unique passwords','Use your birthday','Share it with friends'],1],
      ['What does HTTPS help protect while data travels between browser and website?',['Screen brightness','Connection security','Keyboard layout','Storage size'],1],
      ['What is phishing?',['A graphics format','A deceptive attempt to steal information','A coding language','A backup method'],1],
      ['What does CPU stand for?',['Central Processing Unit','Computer Power Utility','Core Program Upload','Central Pixel Unit'],0],
      ['What is two-factor authentication designed to add?',['Another verification step','More storage','Faster Wi-Fi','A second username'],0],
      ['Which file type is commonly used for web page styling?',['.css','.mp3','.zip','.exe'],0]
    ],
    gaming:[
      ['What does “NPC” commonly mean in games?',['Non-player character','New play controller','Network performance core','Next player challenge'],0],
      ['What does “FPS” often mean when talking about performance?',['Frames per second','Final player score','Fast play system','First person save'],0],
      ['What is a respawn?',['Returning to play after being eliminated','Saving the game','Changing graphics','Leaving a lobby'],0],
      ['What is “lag”?',['A cosmetic item','A delay between input and response','A bonus level','A game ending'],1],
      ['What is a multiplayer lobby?',['A game store','A waiting area before players enter a match','A graphics menu','A single-player save'],1],
      ['What is a speedrun?',['Finishing a game or goal as fast as possible','Playing at low FPS','Skipping internet setup','Only using fast characters'],0],
      ['What does “GG” usually mean after a match?',['Great graphics','Good game','Game glitch','Go again'],1],
      ['What is a patch in gaming?',['A physical controller part','A software update','A score multiplier','A tournament bracket'],1],
      ['What is matchmaking?',['Pairing players into games','Changing player names','Buying games','Streaming gameplay'],0]
    ],
    riddles:[
      ['What has keys but cannot open locks?',['A map','A piano','A clock','A ladder'],1],
      ['What gets wetter the more it dries?',['A towel','Sand','Paper','Smoke'],0],
      ['What has a face and two hands but no arms or legs?',['A clock','A mirror','A book','A shoe'],0],
      ['What can travel around the world while staying in one corner?',['A stamp','A shadow','A key','A cloud'],0],
      ['What has many teeth but cannot bite?',['A comb','A zipper','A saw','A fork'],0],
      ['What goes up but never comes down?',['Smoke','Your age','Rain','A balloon'],1],
      ['What has one eye but cannot see?',['A needle','A storm','A potato','A camera'],0],
      ['The more you take, the more you leave behind. What are they?',['Pictures','Footsteps','Coins','Words'],1],
      ['What belongs to you but other people use it more than you do?',['Your name','Your phone','Your shoes','Your room'],0]
    ]
  };
  const mixed=()=>[banks.general[0],banks.football[2],banks.tech[5],banks.riddles[3],banks.gaming[6]];
  let state={name:'Guest',xp:0,streak:0,lastDaily:'',best:{},badges:[],poll:null,lastResult:null};
  try{state={...state,...JSON.parse(localStorage.getItem(storeKey)||'{}')}}catch(_){}
  const save=()=>localStorage.setItem(storeKey,JSON.stringify(state));
  const level=()=>Math.floor(state.xp/100)+1;
  const rank=()=>['ROOKIE','CHALLENGER','CONTENDER','ELITE','MASTER','LEGEND'][Math.min(5,Math.floor((level()-1)/3))];
  const toast=$('#toast');let toastTimer;function notify(t){toast.textContent=t;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1800)}
  function shuffle(arr,seed=Date.now()){const a=[...arr];let x=seed||1;for(let i=a.length-1;i>0;i--){x=(x*9301+49297)%233280;const j=Math.floor((x/233280)*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  const seedFrom=s=>[...s].reduce((a,c)=>((a*31)+c.charCodeAt(0))>>>0,7);
  function updateUI(){
    const lv=level();$('#profileChip').textContent=`${state.name.toUpperCase()} // LVL ${lv}`;$('#heroStreak').textContent=`${state.streak} DAY${state.streak===1?'':'S'}`;$('#heroXp').textContent=`${state.xp} XP`;
    $('#rankName').textContent=rank();$('#levelNumber').textContent=String(lv).padStart(2,'0');const inLevel=state.xp%100;$('#xpBar').style.width=`${inLevel}%`;$('#xpProgress').textContent=`${inLevel} / 100 XP TO NEXT LEVEL`;
    $('#playerName').textContent=state.name.toUpperCase();$('#avatar').textContent=(state.name[0]||'G').toUpperCase();$('#playerMeta').textContent=`LEVEL ${lv} // ${state.xp} XP // ${state.streak} DAY STREAK`;
    const modes=['daily','football','tech','gaming','general','riddles'];$('#rankList').innerHTML=modes.map((m,i)=>`<div class="rank-row"><span>${String(i+1).padStart(2,'0')}</span><strong>${m==='daily'?'DAILY ARENA':m.toUpperCase()}</strong><b>${state.best[m]??'—'}${state.best[m]!=null?' PTS':''}</b></div>`).join('');
    const badgeDefs=[['FIRST RUN',state.badges.includes('first')],['3 DAY STREAK',state.streak>=3],['500 XP',state.xp>=500],['PERFECT',state.badges.includes('perfect')]];$('#badgeRow').innerHTML=badgeDefs.map(([n,on])=>`<span class="badge ${on?'on':''}">${n}</span>`).join('');
    syncPoll();
  }
  $('#dailyDate').textContent=new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'}).toUpperCase();
  function tick(){const n=new Date(),end=new Date(n);end.setHours(24,0,0,0);const s=Math.max(0,Math.floor((end-n)/1000));$('#resetClock').textContent=[Math.floor(s/3600),Math.floor((s%3600)/60),s%60].map(x=>String(x).padStart(2,'0')).join(':')}
  tick();setInterval(tick,1000);

  const overlay=$('#gameOverlay'),body=$('#gameBody');let game=null;
  function openGame(mode){
    const daily=mode==='daily';const seed=seedFrom(daily?today():`${mode}-${Date.now()}`);const bank=daily?mixed():banks[mode]||banks.general;const count=daily?5:7;const q=daily?bank:shuffle(bank,seed).slice(0,count);
    game={mode,questions:q,index:0,score:0,correct:0,answered:false};$('#gameTitle').textContent=daily?'DAILY ARENA':mode.toUpperCase();$('#gameKicker').textContent=daily?`${today()} // SHARED DAILY`:'CATEGORY RUN';$('#gameScore').textContent='000 PTS';overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';renderQuestion();
  }
  function closeGame(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  $('#gameClose').onclick=closeGame;
  function renderQuestion(){
    const q=game.questions[game.index];$('#gameProgress').style.width=`${(game.index/game.questions.length)*100}%`;body.innerHTML=`<div class="question-count">QUESTION ${game.index+1} / ${game.questions.length}</div><h2 class="question-text">${q[0]}</h2><div class="answers">${q[1].map((a,i)=>`<button type="button" data-answer="${i}">${String.fromCharCode(65+i)} // ${a}</button>`).join('')}</div>`;$$('[data-answer]',body).forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));
  }
  function answer(index){if(game.answered)return;game.answered=true;const q=game.questions[game.index],correct=q[2];$$('[data-answer]',body).forEach((b,i)=>{b.disabled=true;if(i===correct)b.classList.add('correct');if(i===index&&i!==correct)b.classList.add('wrong')});if(index===correct){game.correct++;game.score+=100;$('#gameScore').textContent=`${String(game.score).padStart(3,'0')} PTS`}setTimeout(()=>{game.index++;game.answered=false;if(game.index<game.questions.length)renderQuestion();else finishGame()},650)}
  function finishGame(){
    const perfect=game.correct===game.questions.length;let earned=game.correct*20+20;if(perfect)earned+=40;state.xp+=earned;if(!state.badges.includes('first'))state.badges.push('first');if(perfect&&!state.badges.includes('perfect'))state.badges.push('perfect');
    if(game.mode==='daily'&&state.lastDaily!==today()){if(state.lastDaily===yesterday())state.streak++;else state.streak=1;state.lastDaily=today()}
    state.best[game.mode]=Math.max(state.best[game.mode]||0,game.score);state.lastResult={mode:game.mode,score:game.score,correct:game.correct,total:game.questions.length,date:today()};save();updateUI();$('#gameProgress').style.width='100%';
    const target=new URLSearchParams(location.search).get('target');const challengeNote=target?` Friend target: ${target} pts. ${game.score>Number(target)?'You beat it 🔥':'Run it back.'}`:'';
    body.innerHTML=`<div class="result"><small>ARENA COMPLETE</small><div class="result-score">${game.score}</div><h2>${game.correct}/${game.questions.length} CORRECT</h2><p>+${earned} XP earned.${challengeNote}</p><div class="result-actions"><button class="hot" id="shareResult" type="button">SHARE RESULT</button><button id="rematch" type="button">PLAY AGAIN</button><button id="doneGame" type="button">DONE</button></div></div>`;$('#shareResult').onclick=shareResult;$('#rematch').onclick=()=>openGame(game.mode);$('#doneGame').onclick=closeGame;
  }
  async function shareResult(){if(!state.lastResult)return;const r=state.lastResult;const text=`I scored ${r.score} points on PJ Arena (${r.mode.toUpperCase()}) — ${r.correct}/${r.total} correct. Beat me.`;const url=challengeUrl(r.mode,r.score);try{if(navigator.share)await navigator.share({title:'PJ Arena Challenge',text,url});else{await navigator.clipboard.writeText(`${text} ${url}`);notify('CHALLENGE LINK COPIED')}}catch(e){if(e?.name!=='AbortError')notify('SHARE FAILED')}}
  function challengeUrl(mode=state.lastResult?.mode||'daily',score=state.lastResult?.score||0){const u=new URL(location.href);u.hash='';u.search='';u.searchParams.set('challenge',mode);u.searchParams.set('target',score);return u.href}
  async function createChallenge(){if(!state.lastResult){notify('PLAY AN ARENA FIRST');return}const u=challengeUrl();try{await navigator.clipboard.writeText(u);notify('FRIEND CHALLENGE LINK COPIED')}catch(_){notify('COPY UNAVAILABLE')}}
  $('#challengeFriend').onclick=createChallenge;$('#challengeFriendHero').onclick=createChallenge;
  $('#dailyStart').onclick=()=>openGame('daily');$('#dailyStartCard').onclick=()=>openGame('daily');$$('[data-mode]').forEach(b=>b.onclick=()=>openGame(b.dataset.mode));

  function syncPoll(){const base={skill:51,strategy:49};let votes={...base};if(state.poll==='skill')votes.skill++;if(state.poll==='strategy')votes.strategy++;const total=votes.skill+votes.strategy;$('#voteSkill').textContent=`${Math.round(votes.skill/total*100)}%`;$('#voteStrategy').textContent=`${Math.round(votes.strategy/total*100)}%`;$$('[data-vote]').forEach(b=>b.classList.toggle('selected',b.dataset.vote===state.poll));$('#pollNote').textContent=state.poll?'Vote saved on this device. Global live voting comes with the Arena backend.':'Vote once on this device. v1 shows a local demo result.'}
  $$('#pollOptions [data-vote]').forEach(b=>b.onclick=()=>{if(state.poll){notify('YOU ALREADY VOTED');return}state.poll=b.dataset.vote;save();syncPoll();notify('VOTE LOCKED IN')});
  $('#renamePlayer').onclick=()=>{const n=prompt('Choose an Arena player name (2–16 characters):',state.name==='Guest'?'':state.name);if(!n)return;const clean=n.trim().replace(/[^a-zA-Z0-9 _-]/g,'').slice(0,16);if(clean.length<2)return notify('NAME TOO SHORT');state.name=clean;save();updateUI();notify('PLAYER NAME UPDATED')};
  $('#profileChip').onclick=()=>document.querySelector('#profile').scrollIntoView({behavior:'smooth'});
  $('#shareProfile').onclick=async()=>{const text='PJ Arena — daily quizzes, friend challenges and hot takes.';try{if(navigator.share)await navigator.share({title:'PJ Arena',text,url:location.origin+location.pathname});else{await navigator.clipboard.writeText(location.origin+location.pathname);notify('ARENA LINK COPIED')}}catch(_){}};
  const params=new URLSearchParams(location.search);const challenged=params.get('challenge');if(challenged&&['daily','football','tech','gaming','general','riddles'].includes(challenged)){setTimeout(()=>{notify(`FRIEND CHALLENGE // TARGET ${params.get('target')||0} PTS`);openGame(challenged)},500)}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeGame()});
  updateUI();
})();