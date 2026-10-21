(()=>{
  if(window.PJArenaBackend)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
    const pollKey=()=>`hot-take-${new Date().toISOString().slice(0,10)}`;
    let sb=null,user=null,connected=false,setupRequired=false,activeRoom=null,roomChannel=null,pollTimer=null,globalTimer=null;

    function notify(text){window.PJArena?.notify?.(text)}
    function injectUI(){
      if(!$('#arenaGlobalStatus')){
        const chip=document.createElement('span');chip.id='arenaGlobalStatus';chip.className='arena-global-status';chip.textContent='GLOBAL // CONNECTING';
        $('.topbar')?.appendChild(chip);
      }
      if(!$('#arenaGlobalPanel')){
        const panel=document.createElement('section');panel.id='arenaGlobalPanel';panel.className='arena-global-panel';panel.innerHTML=`
          <header><div><small>GLOBAL // TOP PLAYERS</small><h3>WORLD RANKS</h3></div><span id="arenaGlobalMeta">CONNECTING</span></header>
          <div id="arenaGlobalList" class="arena-global-list"><p>Connecting to Arena Network…</p></div>`;
        $('#ranks .rank-layout')?.insertAdjacentElement('afterend',panel);
      }
      if(!$('#arenaRoomPanel')){
        const panel=document.createElement('div');panel.id='arenaRoomPanel';panel.className='arena-room-panel';panel.innerHTML=`
          <div class="arena-room-head"><span>LIVE ROOM // v2</span><b id="arenaRoomState">STANDBY</b></div>
          <p>Turn your latest score into a 7-day room, or join a friend's six-character code.</p>
          <div class="arena-room-actions"><button id="arenaCreateRoom" type="button">CREATE LIVE ROOM</button><div><input id="arenaRoomCode" maxlength="6" placeholder="ROOM CODE" aria-label="Arena room code"><button id="arenaJoinRoom" type="button">JOIN</button></div></div>
          <div id="arenaRoomActive" class="arena-room-active" hidden></div>`;
        $('.share-card')?.appendChild(panel);
      }
      $('#arenaCreateRoom')?.addEventListener('click',createRoom);
      $('#arenaJoinRoom')?.addEventListener('click',()=>joinRoom($('#arenaRoomCode')?.value||''));
      $('#arenaRoomCode')?.addEventListener('input',e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-F0-9]/g,'').slice(0,6));
    }

    function setStatus(text,type=''){
      const el=$('#arenaGlobalStatus');if(!el)return;el.textContent=text;el.dataset.state=type;
      const meta=$('#arenaGlobalMeta');if(meta)meta.textContent=text.replace('GLOBAL // ','');
    }

    function loadScript(src,marker){return new Promise((resolve,reject)=>{if(marker&&document.querySelector(marker))return resolve();const s=document.createElement('script');s.src=src;s.async=true;if(marker?.startsWith('script[')){const m=marker.match(/data-[^\]]+/)?.[0];if(m)s.setAttribute(m,'1')}s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
    async function ensureConfig(){if(window.PJ_SUPABASE_CONFIG)return window.PJ_SUPABASE_CONFIG;await loadScript('../supabase-config.js?v=20261013-3','script[data-arena-config]');return window.PJ_SUPABASE_CONFIG}
    async function ensureSDK(){if(window.supabase?.createClient)return window.supabase;await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2','script[data-arena-supabase]');if(!window.supabase?.createClient)throw new Error('Supabase SDK unavailable');return window.supabase}

    async function connect(){
      injectUI();setStatus('GLOBAL // CONNECTING');
      try{
        const cfg=await ensureConfig();if(!cfg?.url||!cfg?.publishableKey)throw new Error('Supabase config missing');
        const S=await ensureSDK();sb=S.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'pj-arena-auth-v2'}});
        let session=(await sb.auth.getSession()).data.session;
        if(!session){const a=await sb.auth.signInAnonymously();if(a.error)throw a.error;session=a.data.session}
        user=session?.user;if(!user)throw new Error('Arena session unavailable');
        const local=window.PJArena?.getState?.()||{};
        let boot=await sb.rpc('arena_bootstrap',{p_display_name:local.name&&local.name!=='Guest'?local.name:null});
        if(boot.error){if(/arena_bootstrap|schema cache|function/i.test(boot.error.message||'')){setupRequired=true;throw new Error('Arena v2 migration required')}throw boot.error}
        const sync=await sb.rpc('arena_sync_progress',{p_xp:Number(local.xp||0),p_streak:Number(local.streak||0),p_last_daily:local.lastDaily||null});
        if(sync.error)throw sync.error;
        boot=await sb.rpc('arena_bootstrap',{p_display_name:local.name&&local.name!=='Guest'?local.name:null});if(boot.error)throw boot.error;
        const row=boot.data?.[0];if(row)window.PJArena?.applyServerProfile?.({name:row.player_name,xp:row.player_xp,streak:row.player_streak,lastDaily:row.player_last_daily});
        connected=true;setStatus('GLOBAL // ONLINE','ok');
        await Promise.all([loadLeaderboard(),syncGlobalPoll()]);
        bindChallengeButtons();
        const room=new URLSearchParams(location.search).get('room');if(room)await joinRoom(room,false);
        pollTimer=setInterval(syncGlobalPoll,10000);globalTimer=setInterval(loadLeaderboard,20000);
      }catch(err){
        console.warn('PJ Arena backend:',err);connected=false;setStatus(setupRequired?'GLOBAL // SETUP REQUIRED':'GLOBAL // LOCAL MODE',setupRequired?'warn':'offline');
        const list=$('#arenaGlobalList');if(list)list.innerHTML=`<p>${setupRequired?'Run <b>Arena/arena-v2.sql</b> in Supabase to activate global play.':'Global services are unavailable. Local Arena still works.'}</p>`;
      }
    }

    async function loadLeaderboard(){
      if(!connected)return;const r=await sb.rpc('arena_leaderboard',{p_limit:20});if(r.error){console.warn(r.error);return}
      const list=$('#arenaGlobalList');if(!list)return;const rows=r.data||[];
      list.innerHTML=rows.length?rows.map(x=>`<div class="arena-global-row"><span>#${String(x.rank_no).padStart(2,'0')}</span><strong>${escapeHtml(x.display_name)}</strong><b>${x.xp} XP</b><small>${x.streak}D</small></div>`).join(''):'<p>No global scores yet. Be first.</p>';
    }

    async function syncGlobalPoll(){
      if(!connected)return;const key=pollKey();
      const [totals,mine]=await Promise.all([sb.rpc('arena_poll_totals',{p_poll_key:key}),sb.from('arena_poll_votes').select('choice').eq('poll_key',key).maybeSingle()]);
      if(!totals.error){const map={skill:0,strategy:0};(totals.data||[]).forEach(x=>map[x.choice]=Number(x.votes||0));const total=map.skill+map.strategy;$('#voteSkill')&&( $('#voteSkill').textContent=total?`${Math.round(map.skill/total*100)}%`:'0%' );$('#voteStrategy')&&( $('#voteStrategy').textContent=total?`${Math.round(map.strategy/total*100)}%`:'0%' );$('#pollNote')&&( $('#pollNote').textContent=total?`${total} global vote${total===1?'':'s'} // updates live`:'Be the first global vote today.' )}
      if(!mine.error&&mine.data?.choice)window.PJArena?.setPollChoice?.(mine.data.choice);
    }

    async function submitVote(choice){
      if(!connected)return;const r=await sb.rpc('arena_vote',{p_poll_key:pollKey(),p_choice:choice});if(r.error){console.warn(r.error);return}
      await syncGlobalPoll();notify(r.data?'GLOBAL VOTE LOCKED':'GLOBAL VOTE ALREADY EXISTS');
    }

    async function submitResult(result){
      if(!connected||!result)return;const roomCode=activeRoom?.mode===result.mode?activeRoom.code:null;
      const r=await sb.rpc('arena_submit_result',{p_mode:result.mode,p_score:result.score,p_correct:result.correct,p_total:result.total,p_played_on:result.date,p_room_code:roomCode});
      if(r.error){console.warn('submit result',r.error);notify('GLOBAL SCORE SYNC FAILED');return}
      const row=r.data?.[0];if(row)window.PJArena?.applyServerProfile?.({xp:row.total_xp,streak:row.current_streak,lastDaily:result.mode==='daily'?result.date:undefined});
      await loadLeaderboard();if(roomCode)await loadRoomScores();
    }

    async function setName(name){if(!connected)return;const r=await sb.rpc('arena_set_name',{p_name:name});if(r.error){console.warn(r.error);notify('GLOBAL NAME SYNC FAILED');return}await loadLeaderboard()}

    function bindChallengeButtons(){
      ['#challengeFriend','#challengeFriendHero'].forEach(sel=>{const b=$(sel);if(!b||b.dataset.arenaV2Bound)return;b.dataset.arenaV2Bound='1';const fallback=b.onclick;b.onclick=()=>connected?createRoom():fallback?.()});
    }

    async function createRoom(){
      if(!connected)return notify(setupRequired?'RUN ARENA V2 SQL FIRST':'GLOBAL NETWORK OFFLINE');
      const last=window.PJArena?.lastResult;if(!last)return notify('PLAY AN ARENA FIRST');
      const r=await sb.rpc('arena_create_room',{p_mode:last.mode,p_target_score:last.score});if(r.error){console.warn(r.error);return notify('ROOM CREATE FAILED')}
      const code=String(r.data||'').toUpperCase();if(!code)return notify('ROOM CREATE FAILED');
      await sb.rpc('arena_room_score',{p_code:code,p_score:last.score,p_correct:last.correct,p_total:last.total});
      await joinRoom(code,false);const url=roomUrl(code);try{if(navigator.share)await navigator.share({title:'PJ Arena Live Room',text:`Beat my ${last.score} point ${last.mode.toUpperCase()} score. Room ${code}.`,url});else await navigator.clipboard.writeText(url)}catch(e){if(e?.name!=='AbortError')console.warn(e)}notify(`LIVE ROOM ${code} READY`);
    }

    function roomUrl(code){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('room',code);return u.href}
    async function joinRoom(raw,announce=true){
      if(!connected)return notify('GLOBAL NETWORK OFFLINE');const code=String(raw||'').toUpperCase().replace(/[^A-F0-9]/g,'').slice(0,6);if(code.length!==6)return announce&&notify('ENTER A 6-CHARACTER ROOM CODE');
      const r=await sb.from('arena_rooms').select('code,mode,target_score,expires_at').eq('code',code).maybeSingle();if(r.error||!r.data){announce&&notify('ROOM NOT FOUND OR EXPIRED');return}
      activeRoom=r.data;const u=new URL(location.href);u.searchParams.delete('challenge');u.searchParams.delete('target');u.searchParams.set('room',code);history.replaceState(null,'',u);
      renderRoom();subscribeRoom();await loadRoomScores();if(announce)notify(`JOINED ROOM ${code}`);
    }

    function renderRoom(){
      const box=$('#arenaRoomActive');if(!box||!activeRoom)return;box.hidden=false;$('#arenaRoomState').textContent='ROOM '+activeRoom.code;
      box.innerHTML=`<div class="arena-room-banner"><div><small>ROOM ${activeRoom.code}</small><strong>${activeRoom.mode.toUpperCase()} // TARGET ${activeRoom.target_score} PTS</strong></div><div><button type="button" id="arenaPlayRoom">PLAY ROOM</button><button type="button" id="arenaShareRoom">SHARE</button></div></div><div id="arenaRoomScores" class="arena-room-scores"><p>Loading room scores…</p></div>`;
      $('#arenaPlayRoom').onclick=()=>window.PJArena?.openGame?.(activeRoom.mode);$('#arenaShareRoom').onclick=async()=>{const url=roomUrl(activeRoom.code);try{if(navigator.share)await navigator.share({title:`PJ Arena Room ${activeRoom.code}`,text:`Target ${activeRoom.target_score} points in ${activeRoom.mode.toUpperCase()}.`,url});else{await navigator.clipboard.writeText(url);notify('ROOM LINK COPIED')}}catch(_){} };
    }

    async function loadRoomScores(){
      if(!connected||!activeRoom)return;const r=await sb.from('arena_room_scores').select('display_name,score,correct_count,total_questions,updated_at').eq('room_code',activeRoom.code).order('score',{ascending:false}).limit(25);if(r.error){console.warn(r.error);return}
      const box=$('#arenaRoomScores');if(!box)return;const rows=r.data||[];box.innerHTML=rows.length?rows.map((x,i)=>`<div><span>#${i+1}</span><strong>${escapeHtml(x.display_name)}</strong><b>${x.score} PTS</b><small>${x.correct_count}/${x.total_questions}</small></div>`).join(''):'<p>No scores yet. Start the room.</p>';
    }

    function subscribeRoom(){
      if(!sb||!activeRoom)return;if(roomChannel)sb.removeChannel(roomChannel);
      roomChannel=sb.channel(`arena-room-${activeRoom.code}`).on('postgres_changes',{event:'*',schema:'public',table:'arena_room_scores',filter:`room_code=eq.${activeRoom.code}`},()=>loadRoomScores()).subscribe();
    }

    function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

    window.addEventListener('pjarena:result',e=>submitResult(e.detail));
    window.addEventListener('pjarena:vote',e=>submitVote(e.detail?.choice));
    window.addEventListener('pjarena:rename',e=>setName(e.detail?.name));
    window.addEventListener('online',()=>{if(!connected)connect();else setStatus('GLOBAL // ONLINE','ok')});
    window.addEventListener('offline',()=>setStatus('GLOBAL // OFFLINE','offline'));

    window.PJArenaBackend={get connected(){return connected},get room(){return activeRoom},joinRoom,createRoom,refresh:()=>Promise.all([loadLeaderboard(),syncGlobalPoll(),loadRoomScores()])};
    connect();
  });
})();
