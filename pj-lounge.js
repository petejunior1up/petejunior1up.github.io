/* PJ // LOUNGE
   Saved public chat + browser-encrypted private rooms.
   Supabase Auth + Postgres + Realtime. No database password or secret key belongs here.
*/
(()=>{
  if(window.PJLounge)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(async()=>{
    const root=document.createElement('section');
    root.className='pjl-root';
    root.setAttribute('aria-label','PJ Lounge');
    root.innerHTML=`
      <button class="pjl-launch" type="button" aria-expanded="false"><i></i><span>PJ // LOUNGE</span><b>CHAT</b></button>
      <div class="pjl-shell" role="dialog" aria-modal="false" aria-label="PJ Lounge">
        <header class="pjl-head">
          <div><small>PORTFOLIO NETWORK</small><strong>PJ // LOUNGE</strong></div>
          <div class="pjl-head-meta"><span class="pjl-online"><i></i><b id="pjlOnline">—</b> ACTIVE</span><button class="pjl-profile-btn" type="button">PROFILE</button><button class="pjl-close" type="button" aria-label="Minimize lounge">—</button></div>
        </header>
        <div class="pjl-tabs" role="tablist"><button class="active" type="button" data-mode="public">PUBLIC LOUNGE</button><button type="button" data-mode="private">XYPHER // PRIVATE</button></div>
        <div class="pjl-notice" id="pjlNotice">CONNECTING TO LOUNGE…</div>
        <div class="pjl-main">
          <aside class="pjl-side">
            <div class="pjl-me"><span class="pjl-avatar" id="pjlAvatar">V</span><div><strong id="pjlName">Visitor</strong><small id="pjlHandle">@visitor</small></div></div>
            <div class="pjl-room-info public-view"><small>PUBLIC CHANNEL</small><strong>LOUNGE // 01</strong><p>Messages here are saved and visible to other signed-in lounge visitors.</p></div>
            <div class="pjl-room-info private-view" hidden><small>ENCRYPTED CHANNEL</small><strong id="pjlRoomLabel">NO ROOM</strong><p>Message content is encrypted in your browser before it is stored.</p><button id="pjlCreateRoom" type="button">CREATE PRIVATE ROOM</button><button id="pjlCopyInvite" type="button" hidden>COPY INVITE LINK</button><button id="pjlExitRoom" type="button" hidden>EXIT PRIVATE ROOM</button></div>
            <div class="pjl-safety"><small>PRIVACY</small><p>Keep passwords, OTPs, home addresses, school locations and other secrets out of public chat.</p></div>
          </aside>
          <div class="pjl-chat">
            <div class="pjl-messages" id="pjlMessages" aria-live="polite"></div>
            <div class="pjl-empty" id="pjlEmpty">No messages yet. Start the conversation.</div>
            <form class="pjl-form" id="pjlForm">
              <textarea id="pjlInput" maxlength="500" rows="1" placeholder="Message the lounge…" aria-label="Message the lounge"></textarea>
              <button type="submit">SEND ↗</button>
            </form>
            <div class="pjl-form-foot"><span id="pjlModeText">PUBLIC // SAVED</span><span>500 MAX</span></div>
          </div>
        </div>
        <div class="pjl-profile" id="pjlProfile" hidden>
          <form id="pjlProfileForm">
            <div class="pjl-profile-head"><div><small>ACCOUNT PROFILE</small><strong>YOUR LOUNGE IDENTITY</strong></div><button type="button" id="pjlProfileClose">×</button></div>
            <div class="pjl-profile-grid">
              <label>DISPLAY NAME<input id="pjlDisplayName" maxlength="32" required></label>
              <label>HANDLE<input id="pjlProfileHandle" maxlength="24" required></label>
              <label>AVATAR / EMOJI<input id="pjlProfileAvatar" maxlength="4"></label>
              <label>COUNTRY / OPTIONAL<input id="pjlCountry" maxlength="40"></label>
              <label class="wide">BIO / OPTIONAL<textarea id="pjlBio" maxlength="160" rows="3"></textarea></label>
              <label class="wide">PRIVATE EMAIL / OPTIONAL<input id="pjlEmail" type="email" maxlength="120"><small>Stored separately and not shown to other visitors.</small></label>
            </div>
            <p class="pjl-profile-note">Only your display name, handle, avatar, country and bio can be visible in the Lounge. Avoid putting exact addresses, school locations or other highly sensitive details in your public profile.</p>
            <button class="pjl-save" type="submit">SAVE PROFILE</button>
          </form>
        </div>
      </div>`;
    document.body.appendChild(root);

    const $=s=>root.querySelector(s);
    const launch=$('.pjl-launch'),messagesEl=$('#pjlMessages'),emptyEl=$('#pjlEmpty'),notice=$('#pjlNotice'),form=$('#pjlForm'),input=$('#pjlInput'),onlineEl=$('#pjlOnline');
    const profilePanel=$('#pjlProfile'),profileForm=$('#pjlProfileForm');
    let opened=false,mode='public',connected=false,user=null,sb=null,profile=null,lastSend=0,currentRoom=null,currentRoomKey=null,currentInvite='';
    let messageChannel=null,presenceChannel=null,presenceTimer=null;
    const blocked=new Set(JSON.parse(localStorage.getItem('pjLoungeBlocked')||'[]'));

    const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const rand=(n=4)=>{const b=new Uint8Array(n);crypto.getRandomValues(b);return [...b].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()};
    const cleanHandle=s=>'@'+String(s||'visitor').replace(/^@/,'').replace(/[^a-zA-Z0-9_]/g,'').slice(0,23).toLowerCase();
    const formatTime=t=>{const d=t?new Date(t):null;return d&&!isNaN(d)?d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'NOW'};
    const setNotice=(text,type='')=>{notice.textContent=text;notice.dataset.type=type};
    const open=()=>{opened=true;root.classList.add('open');launch.setAttribute('aria-expanded','true');setTimeout(()=>input.focus({preventScroll:true}),80)};
    const close=()=>{opened=false;root.classList.remove('open');launch.setAttribute('aria-expanded','false')};
    launch.onclick=()=>opened?close():open();$('.pjl-close').onclick=close;

    const throwIf=({error},fallback='Request failed')=>{if(error)throw new Error(error.message||fallback)};
    function removeChannel(ch){if(ch&&sb)sb.removeChannel(ch).catch?.(()=>{});}

    function setProfileUI(){
      const p=profile||{};
      $('#pjlName').textContent=p.displayName||'Visitor';
      $('#pjlHandle').textContent=p.handle||'@visitor';
      $('#pjlAvatar').textContent=p.avatar||((p.displayName||'V').trim()[0]||'V').toUpperCase();
      $('#pjlDisplayName').value=p.displayName||'';
      $('#pjlProfileHandle').value=(p.handle||'').replace(/^@/,'');
      $('#pjlProfileAvatar').value=p.avatar||'';
      $('#pjlCountry').value=p.country||'';
      $('#pjlBio').value=p.bio||'';
      $('#pjlEmail').value=p.email||'';
    }
    $('.pjl-profile-btn').onclick=()=>{setProfileUI();profilePanel.hidden=false};
    $('#pjlProfileClose').onclick=()=>profilePanel.hidden=true;

    function renderMessages(items,encrypted=false){
      messagesEl.innerHTML='';
      const visible=items.filter(m=>!blocked.has(m.uid));
      emptyEl.hidden=visible.length>0;
      visible.forEach(m=>{
        const mine=m.uid===user?.id;
        const owner=window.PJ_SUPABASE_CONFIG?.ownerUid&&m.uid===window.PJ_SUPABASE_CONFIG.ownerUid;
        const article=document.createElement('article');
        article.className='pjl-msg'+(mine?' mine':'')+(owner?' owner':'');
        article.innerHTML=`<div class="pjl-msg-avatar">${esc(m.avatar||((m.name||'V')[0]||'V').toUpperCase())}</div><div class="pjl-msg-body"><div class="pjl-msg-meta"><strong>${esc(m.name||'Visitor')}${owner?' <em>OWNER</em>':''}</strong><span>${encrypted?'🔒 ':''}${formatTime(m.createdAt)}</span></div><p>${esc(m.text||'').replace(/\n/g,'<br>')}</p>${!mine&&!encrypted?`<div class="pjl-msg-tools"><button data-report="${esc(m.id)}" data-uid="${esc(m.uid)}">REPORT</button><button data-block="${esc(m.uid)}">BLOCK</button></div>`:''}</div>`;
        messagesEl.appendChild(article);
      });
      messagesEl.scrollTop=messagesEl.scrollHeight;
    }

    messagesEl.addEventListener('click',async e=>{
      const b=e.target.closest('[data-block],[data-report]');if(!b)return;
      if(b.dataset.block&&confirm('Hide messages from this visitor on this device?')){
        blocked.add(b.dataset.block);localStorage.setItem('pjLoungeBlocked',JSON.stringify([...blocked]));await loadPublicMessages();
      }
      if(b.dataset.report&&connected){
        const reason=prompt('Short reason for report:','Spam or inappropriate content');if(!reason)return;
        try{
          const result=await sb.from('reports').insert({reporter_id:user.id,target_user_id:b.dataset.uid,message_id:b.dataset.report,reason:reason.slice(0,160)});throwIf(result);
          setNotice('REPORT SENT // THANK YOU','ok');
        }catch(err){console.error(err);setNotice('REPORT FAILED // TRY AGAIN','error')}
      }
    });

    async function loadProfile(){
      const [pub,priv]=await Promise.all([
        sb.from('public_profiles').select('*').eq('user_id',user.id).maybeSingle(),
        sb.from('private_profiles').select('email').eq('user_id',user.id).maybeSingle()
      ]);
      throwIf(pub);throwIf(priv);
      if(pub.data){
        profile={displayName:pub.data.display_name,handle:pub.data.handle,avatar:pub.data.avatar,country:pub.data.country||'',bio:pub.data.bio||'',email:priv.data?.email||''};
      }else{
        const suffix=rand(2).toLowerCase();
        profile={displayName:`Visitor ${suffix.toUpperCase()}`,handle:`@visitor_${suffix}`,avatar:'◈',country:'',bio:'',email:''};
        const created=await sb.from('public_profiles').insert({user_id:user.id,display_name:profile.displayName,handle:profile.handle,avatar:profile.avatar,country:'',bio:''});throwIf(created);
      }
      setProfileUI();
    }

    profileForm.addEventListener('submit',async e=>{
      e.preventDefault();if(!connected)return;
      const displayName=$('#pjlDisplayName').value.trim().slice(0,32),handle=cleanHandle($('#pjlProfileHandle').value),avatar=$('#pjlProfileAvatar').value.trim().slice(0,4)||'◈',country=$('#pjlCountry').value.trim().slice(0,40),bio=$('#pjlBio').value.trim().slice(0,160),email=$('#pjlEmail').value.trim().slice(0,120);
      if(!displayName||handle==='@')return;
      try{
        const [pub,priv]=await Promise.all([
          sb.from('public_profiles').upsert({user_id:user.id,display_name:displayName,handle,avatar,country,bio,updated_at:new Date().toISOString()}),
          sb.from('private_profiles').upsert({user_id:user.id,email,updated_at:new Date().toISOString()})
        ]);
        throwIf(pub);throwIf(priv);profile={displayName,handle,avatar,country,bio,email};setProfileUI();profilePanel.hidden=true;setNotice('PROFILE SAVED','ok');
      }catch(err){console.error(err);setNotice('PROFILE SAVE FAILED','error')}
    });

    async function loadPublicMessages(){
      if(!connected)return;
      const result=await sb.from('lounge_messages').select('*').order('created_at',{ascending:false}).limit(100);throwIf(result);
      renderMessages((result.data||[]).reverse().map(m=>({id:m.id,uid:m.user_id,name:m.display_name,handle:m.handle,avatar:m.avatar,text:m.message,createdAt:m.created_at})),false);
    }

    async function subscribePublic(){
      if(!connected)return;
      removeChannel(messageChannel);messageChannel=null;
      try{await loadPublicMessages();setNotice('PUBLIC LOUNGE // LIVE','ok')}catch(err){console.error(err);setNotice('LOUNGE READ BLOCKED // CHECK SUPABASE POLICIES','error');return}
      messageChannel=sb.channel('pj-lounge-public')
        .on('postgres_changes',{event:'*',schema:'public',table:'lounge_messages'},()=>loadPublicMessages().catch(console.error))
        .subscribe(status=>{if(status==='CHANNEL_ERROR')setNotice('REALTIME CONNECTION ERROR','error')});
    }

    async function sendPublic(text){
      const result=await sb.from('lounge_messages').insert({user_id:user.id,display_name:profile.displayName,handle:profile.handle,avatar:profile.avatar||'◈',message:text});throwIf(result);
    }

    const b64u=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const unb64u=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0));};
    async function importRoomKey(raw){return crypto.subtle.importKey('raw',unb64u(raw),{name:'AES-GCM'},false,['encrypt','decrypt'])}
    async function encryptPayload(payload){const iv=crypto.getRandomValues(new Uint8Array(12)),data=new TextEncoder().encode(JSON.stringify(payload)),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},currentRoomKey,data);return{version:1,iv:b64u(iv),ciphertext:b64u(cipher)}}
    async function decryptPayload(m){try{const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64u(m.iv)},currentRoomKey,unb64u(m.ciphertext));return JSON.parse(new TextDecoder().decode(plain))}catch(_){return null}}

    function updatePrivateUI(){
      const has=!!currentRoom;$('#pjlRoomLabel').textContent=has?`ROOM // ${currentRoom.slice(0,8).toUpperCase()}`:'NO ROOM';$('#pjlCopyInvite').hidden=!has;$('#pjlExitRoom').hidden=!has;
    }

    async function loadPrivateMessages(){
      if(!currentRoom||!currentRoomKey)return;
      const result=await sb.from('private_messages').select('*').eq('room_id',currentRoom).order('created_at',{ascending:false}).limit(100);throwIf(result);
      const rows=[];
      for(const m of (result.data||[]).reverse()){
        const payload=await decryptPayload(m);if(payload)rows.push({id:m.id,uid:m.user_id,createdAt:m.created_at,...payload});
      }
      renderMessages(rows,true);
    }

    async function createPrivateRoom(){
      if(!connected)return;
      try{
        const roomId=crypto.randomUUID(),raw=b64u(crypto.getRandomValues(new Uint8Array(32)));
        const room=await sb.from('private_rooms').insert({id:roomId,created_by:user.id,version:1});throwIf(room);
        const member=await sb.from('private_room_members').insert({room_id:roomId,user_id:user.id});throwIf(member);
        currentRoom=roomId;currentRoomKey=await importRoomKey(raw);
        const url=new URL(location.href);url.searchParams.set('pjroom',roomId);url.hash='k='+raw;currentInvite=url.toString();history.pushState(null,'',url);
        switchMode('private');updatePrivateUI();
      }catch(err){console.error(err);setNotice('PRIVATE ROOM CREATION FAILED','error')}
    }

    async function joinAndSubscribePrivate(){
      if(!currentRoom||!currentRoomKey||!connected)return;
      try{
        const member=await sb.from('private_room_members').upsert({room_id:currentRoom,user_id:user.id},{onConflict:'room_id,user_id'});throwIf(member);
        removeChannel(messageChannel);messageChannel=null;
        await loadPrivateMessages();
        messageChannel=sb.channel(`pj-private-${currentRoom}`)
          .on('postgres_changes',{event:'*',schema:'public',table:'private_messages',filter:`room_id=eq.${currentRoom}`},()=>loadPrivateMessages().catch(console.error))
          .subscribe(status=>{if(status==='CHANNEL_ERROR')setNotice('PRIVATE REALTIME ERROR','error')});
        updatePrivateUI();setNotice('PRIVATE CHANNEL // END-TO-END ENCRYPTED','private');
      }catch(err){console.error(err);setNotice('PRIVATE ROOM ACCESS FAILED','error')}
    }

    async function sendPrivate(text){
      const enc=await encryptPayload({text,name:profile.displayName,avatar:profile.avatar||'◈'});
      const result=await sb.from('private_messages').insert({room_id:currentRoom,user_id:user.id,...enc});throwIf(result);
    }

    $('#pjlCreateRoom').onclick=createPrivateRoom;
    $('#pjlCopyInvite').onclick=async()=>{
      if(!currentInvite)return;
      try{
        if(navigator.share)await navigator.share({title:'PJ // XYPHER Private Room',text:'Join my encrypted PJ Lounge room.',url:currentInvite});
        else await navigator.clipboard.writeText(currentInvite);
        setNotice('PRIVATE INVITE READY','ok');
      }catch(e){if(e?.name!=='AbortError')setNotice('COULD NOT SHARE INVITE','error')}
    };
    $('#pjlExitRoom').onclick=()=>{
      removeChannel(messageChannel);messageChannel=null;currentRoom=null;currentRoomKey=null;currentInvite='';
      const u=new URL(location.href);u.searchParams.delete('pjroom');u.hash='';history.replaceState(null,'',u);updatePrivateUI();switchMode('public');
    };

    function switchMode(next){
      mode=next;root.dataset.mode=mode;
      root.querySelectorAll('.pjl-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
      root.querySelectorAll('.public-view').forEach(x=>x.hidden=mode!=='public');
      root.querySelectorAll('.private-view').forEach(x=>x.hidden=mode!=='private');
      $('#pjlModeText').textContent=mode==='public'?'PUBLIC // SAVED':'PRIVATE // AES-256-GCM';
      input.placeholder=mode==='public'?'Message the lounge…':'Message the encrypted room…';
      removeChannel(messageChannel);messageChannel=null;messagesEl.innerHTML='';emptyEl.hidden=false;
      if(!connected)return;
      if(mode==='public')subscribePublic();
      else if(currentRoom&&currentRoomKey)joinAndSubscribePrivate();
      else setNotice('CREATE A PRIVATE ROOM OR OPEN AN INVITE LINK','private');
    }
    root.querySelector('.pjl-tabs').onclick=e=>{const b=e.target.closest('[data-mode]');if(b)switchMode(b.dataset.mode)};

    form.addEventListener('submit',async e=>{
      e.preventDefault();if(!connected||!user||!profile)return;
      const text=input.value.trim();if(!text)return;
      const now=Date.now();if(now-lastSend<2500){setNotice('SLOW DOWN // 2.5 SECOND COOLDOWN','warn');return}
      if(mode==='private'&&(!currentRoom||!currentRoomKey)){setNotice('CREATE OR JOIN A PRIVATE ROOM FIRST','warn');return}
      input.value='';lastSend=now;
      try{mode==='public'?await sendPublic(text.slice(0,500)):await sendPrivate(text.slice(0,500));}
      catch(err){console.error(err);setNotice('MESSAGE FAILED // CHECK CONNECTION','error')}
    });
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});

    async function updatePresence(){
      if(!connected||!user)return;
      const result=await sb.from('presence').upsert({user_id:user.id,last_seen:new Date().toISOString()});if(result.error)console.warn('Presence update:',result.error.message);
    }
    async function countPresence(){
      if(!connected)return;
      const cutoff=new Date(Date.now()-120000).toISOString();
      const result=await sb.from('presence').select('user_id',{count:'exact',head:true}).gte('last_seen',cutoff);
      if(!result.error)onlineEl.textContent=String(result.count||1);
    }
    async function startPresence(){
      await updatePresence();await countPresence();
      clearInterval(presenceTimer);presenceTimer=setInterval(()=>{updatePresence();countPresence()},45000);
      removeChannel(presenceChannel);
      presenceChannel=sb.channel('pj-lounge-presence-db')
        .on('postgres_changes',{event:'*',schema:'public',table:'presence'},()=>countPresence())
        .subscribe();
    }

    async function parseInvite(){
      const u=new URL(location.href),room=u.searchParams.get('pjroom'),hash=new URLSearchParams(u.hash.replace(/^#/,'')),raw=hash.get('k');
      if(!room||!raw)return false;
      try{
        if(!/^[0-9a-f-]{36}$/i.test(room))throw new Error('Invalid room id');
        currentRoom=room;currentRoomKey=await importRoomKey(raw);currentInvite=u.toString();updatePrivateUI();switchMode('private');open();return true;
      }catch(err){console.error(err);setNotice('INVALID PRIVATE ROOM INVITE','error');return false}
    }

    async function loadSupabaseSdk(){
      if(window.supabase?.createClient)return window.supabase;
      await new Promise((resolve,reject)=>{
        const existing=document.querySelector('script[data-pj-supabase-sdk]');
        if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}
        const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.dataset.pjSupabaseSdk='1';s.onload=resolve;s.onerror=()=>reject(new Error('Supabase SDK failed to load'));document.head.appendChild(s);
      });
      return window.supabase;
    }

    async function connectSupabase(){
      const cfg=window.PJ_SUPABASE_CONFIG;
      if(!cfg?.url||!cfg?.publishableKey){setNotice('LOUNGE SETUP REQUIRED // SUPABASE CONFIG MISSING','error');return}
      try{
        const sdk=await loadSupabaseSdk();
        sb=sdk.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
        let session=(await sb.auth.getSession()).data.session;
        if(!session){const auth=await sb.auth.signInAnonymously();if(auth.error)throw auth.error;session=auth.data.session}
        user=session?.user;if(!user)throw new Error('Anonymous session was not created');
        connected=true;await loadProfile();await startPresence();
        const invited=await parseInvite();if(!invited&&mode==='public')await subscribePublic();
        setNotice(invited?'PRIVATE CHANNEL // CONNECTED':'LOUNGE ONLINE // MESSAGES SAVED','ok');
      }catch(err){
        console.error('PJ Lounge Supabase error',err);
        const msg=String(err?.message||'').toLowerCase();
        if(msg.includes('anonymous')||msg.includes('signups'))setNotice('ENABLE ANONYMOUS SIGN-INS IN SUPABASE','error');
        else if(msg.includes('row-level')||msg.includes('permission')||msg.includes('policy'))setNotice('SUPABASE RLS POLICY BLOCKED THIS REQUEST','error');
        else setNotice('SUPABASE CONNECTION FAILED // CHECK SETUP','error');
      }
    }

    addEventListener('beforeunload',()=>{if(connected&&user){navigator.sendBeacon?.(`${window.PJ_SUPABASE_CONFIG?.url}/rest/v1/presence?user_id=eq.${encodeURIComponent(user.id)}`,new Blob([],{}))}});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&profilePanel.hidden===false){profilePanel.hidden=true;return}if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='l'){e.preventDefault();opened?close():open()}});
    window.PJLounge={open,close,createPrivateRoom,get state(){return{open:opened,mode,connected,uid:user?.id||null,room:currentRoom,backend:'supabase'}}};
    connectSupabase();
  });
})();
