/* PJ // LOUNGE
   Saved public chat + browser-encrypted private rooms.
   Firebase Authentication + Cloud Firestore. No service-account credentials belong here.
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
    const launch=$('.pjl-launch'),shell=$('.pjl-shell'),messagesEl=$('#pjlMessages'),emptyEl=$('#pjlEmpty'),notice=$('#pjlNotice'),form=$('#pjlForm'),input=$('#pjlInput'),onlineEl=$('#pjlOnline');
    const profilePanel=$('#pjlProfile'),profileForm=$('#pjlProfileForm');
    let opened=false,mode='public',firebaseReady=false,authUser=null,db=null,fb=null,profile=null,unsubscribeMessages=null,unsubscribePresence=null,lastSend=0,currentRoom=null,currentRoomKey=null,currentInvite='';
    const blocked=new Set(JSON.parse(localStorage.getItem('pjLoungeBlocked')||'[]'));
    const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const rand=(n=8)=>{const b=new Uint8Array(n);crypto.getRandomValues(b);return [...b].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()};
    const cleanHandle=s=>'@'+String(s||'visitor').replace(/^@/,'').replace(/[^a-zA-Z0-9_]/g,'').slice(0,23).toLowerCase();
    const formatTime=t=>{const d=t?.toDate?t.toDate():t?new Date(t):null;return d&&!isNaN(d)?d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'NOW'};
    const setNotice=(text,type='')=>{notice.textContent=text;notice.dataset.type=type};
    const open=()=>{opened=true;root.classList.add('open');launch.setAttribute('aria-expanded','true');setTimeout(()=>input.focus({preventScroll:true}),80)};
    const close=()=>{opened=false;root.classList.remove('open');launch.setAttribute('aria-expanded','false')};
    launch.onclick=()=>opened?close():open();$('.pjl-close').onclick=close;

    function setProfileUI(){
      const p=profile||{};$('#pjlName').textContent=p.displayName||'Visitor';$('#pjlHandle').textContent=p.handle||'@visitor';$('#pjlAvatar').textContent=p.avatar||((p.displayName||'V').trim()[0]||'V').toUpperCase();
      $('#pjlDisplayName').value=p.displayName||'';$('#pjlProfileHandle').value=(p.handle||'').replace(/^@/,'');$('#pjlProfileAvatar').value=p.avatar||'';$('#pjlCountry').value=p.country||'';$('#pjlBio').value=p.bio||'';$('#pjlEmail').value=p.email||'';
    }
    $('.pjl-profile-btn').onclick=()=>{setProfileUI();profilePanel.hidden=false};$('#pjlProfileClose').onclick=()=>profilePanel.hidden=true;

    function renderMessages(items,encrypted=false){
      messagesEl.innerHTML='';const visible=items.filter(m=>!blocked.has(m.uid));emptyEl.hidden=visible.length>0;
      visible.forEach(m=>{
        const mine=m.uid===authUser?.uid;const owner=window.PJ_LOUNGE_CONFIG?.ownerUid&&m.uid===window.PJ_LOUNGE_CONFIG.ownerUid;
        const article=document.createElement('article');article.className='pjl-msg'+(mine?' mine':'')+(owner?' owner':'');
        article.innerHTML=`<div class="pjl-msg-avatar">${esc(m.avatar||((m.name||'V')[0]||'V').toUpperCase())}</div><div class="pjl-msg-body"><div class="pjl-msg-meta"><strong>${esc(m.name||'Visitor')}${owner?' <em>OWNER</em>':''}</strong><span>${encrypted?'🔒 ':''}${formatTime(m.createdAt)}</span></div><p>${esc(m.text||'').replace(/\n/g,'<br>')}</p>${!mine&&!encrypted?`<div class="pjl-msg-tools"><button data-report="${esc(m.id)}" data-uid="${esc(m.uid)}">REPORT</button><button data-block="${esc(m.uid)}">BLOCK</button></div>`:''}</div>`;
        messagesEl.appendChild(article);
      });
      messagesEl.scrollTop=messagesEl.scrollHeight;
    }

    messagesEl.addEventListener('click',async e=>{
      const b=e.target.closest('[data-block],[data-report]');if(!b)return;
      if(b.dataset.block){if(confirm('Hide messages from this visitor on this device?')){blocked.add(b.dataset.block);localStorage.setItem('pjLoungeBlocked',JSON.stringify([...blocked]));subscribePublic();}}
      if(b.dataset.report&&firebaseReady){const reason=prompt('Short reason for report:','Spam or inappropriate content');if(!reason)return;try{await fb.addDoc(fb.collection(db,'reports'),{messageId:b.dataset.report,targetUid:b.dataset.uid,reporterUid:authUser.uid,reason:reason.slice(0,160),createdAt:fb.serverTimestamp()});setNotice('REPORT SENT // THANK YOU','ok')}catch(_){setNotice('REPORT FAILED // TRY AGAIN','error')}}
    });

    function switchMode(next){
      mode=next;root.dataset.mode=mode;root.querySelectorAll('.pjl-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));root.querySelectorAll('.public-view').forEach(x=>x.hidden=mode!=='public');root.querySelectorAll('.private-view').forEach(x=>x.hidden=mode!=='private');
      $('#pjlModeText').textContent=mode==='public'?'PUBLIC // SAVED':'PRIVATE // AES-256-GCM';input.placeholder=mode==='public'?'Message the lounge…':'Message the encrypted room…';
      unsubscribeMessages?.();unsubscribeMessages=null;messagesEl.innerHTML='';emptyEl.hidden=false;
      if(!firebaseReady)return;if(mode==='public')subscribePublic();else if(currentRoom&&currentRoomKey)joinAndSubscribePrivate();else setNotice('CREATE A PRIVATE ROOM OR OPEN AN INVITE LINK','private');
    }
    root.querySelector('.pjl-tabs').onclick=e=>{const b=e.target.closest('[data-mode]');if(b)switchMode(b.dataset.mode)};

    async function loadProfile(){
      const pubRef=fb.doc(db,'publicProfiles',authUser.uid),privRef=fb.doc(db,'privateProfiles',authUser.uid);const [pubSnap,privSnap]=await Promise.all([fb.getDoc(pubRef),fb.getDoc(privRef)]);
      if(pubSnap.exists())profile={...pubSnap.data(),email:privSnap.exists()?privSnap.data().email||'':''};else{
        const suffix=rand(2);profile={displayName:`Visitor ${suffix}`,handle:`@visitor_${suffix.toLowerCase()}`,avatar:'◈',country:'',bio:'',email:''};
        await fb.setDoc(pubRef,{displayName:profile.displayName,handle:profile.handle,avatar:profile.avatar,country:'',bio:'',createdAt:fb.serverTimestamp(),updatedAt:fb.serverTimestamp()},{merge:true});
      }setProfileUI();
    }

    profileForm.addEventListener('submit',async e=>{e.preventDefault();if(!firebaseReady)return;const displayName=$('#pjlDisplayName').value.trim().slice(0,32),handle=cleanHandle($('#pjlProfileHandle').value),avatar=$('#pjlProfileAvatar').value.trim().slice(0,4)||'◈',country=$('#pjlCountry').value.trim().slice(0,40),bio=$('#pjlBio').value.trim().slice(0,160),email=$('#pjlEmail').value.trim().slice(0,120);if(!displayName||handle==='@')return;
      try{await Promise.all([fb.setDoc(fb.doc(db,'publicProfiles',authUser.uid),{displayName,handle,avatar,country,bio,updatedAt:fb.serverTimestamp()},{merge:true}),fb.setDoc(fb.doc(db,'privateProfiles',authUser.uid),{email,updatedAt:fb.serverTimestamp()},{merge:true})]);profile={displayName,handle,avatar,country,bio,email};setProfileUI();profilePanel.hidden=true;setNotice('PROFILE SAVED','ok')}catch(err){console.error(err);setNotice('PROFILE SAVE FAILED','error')}
    });

    function subscribePublic(){
      if(!firebaseReady)return;unsubscribeMessages?.();const q=fb.query(fb.collection(db,'loungeMessages'),fb.orderBy('createdAt','desc'),fb.limit(100));unsubscribeMessages=fb.onSnapshot(q,snap=>{const rows=snap.docs.map(d=>({id:d.id,...d.data()})).reverse();renderMessages(rows,false);setNotice('PUBLIC LOUNGE // LIVE','ok')},err=>{console.error(err);setNotice('LOUNGE READ BLOCKED // CHECK FIRESTORE RULES','error')});
    }

    async function sendPublic(text){
      await fb.addDoc(fb.collection(db,'loungeMessages'),{uid:authUser.uid,name:profile.displayName,handle:profile.handle,avatar:profile.avatar||'◈',text,createdAt:fb.serverTimestamp()});
    }

    const b64u=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const unb64u=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0));};
    async function importRoomKey(raw){return crypto.subtle.importKey('raw',unb64u(raw),{name:'AES-GCM'},false,['encrypt','decrypt'])}
    async function encryptPayload(payload){const iv=crypto.getRandomValues(new Uint8Array(12)),data=new TextEncoder().encode(JSON.stringify(payload)),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},currentRoomKey,data);return{v:1,iv:b64u(iv),cipher:b64u(cipher)}}
    async function decryptPayload(m){try{const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64u(m.iv)},currentRoomKey,unb64u(m.cipher));return JSON.parse(new TextDecoder().decode(plain))}catch(_){return null}}

    async function createPrivateRoom(){
      if(!firebaseReady)return;const roomId=rand(8).toLowerCase(),raw=b64u(crypto.getRandomValues(new Uint8Array(32)));currentRoom=roomId;currentRoomKey=await importRoomKey(raw);const url=new URL(location.href);url.searchParams.set('pjroom',roomId);url.hash='k='+raw;currentInvite=url.toString();history.pushState(null,'',url);
      await fb.setDoc(fb.doc(db,'privateRooms',roomId),{createdBy:authUser.uid,createdAt:fb.serverTimestamp(),version:1},{merge:true});await fb.setDoc(fb.doc(db,'privateRooms',roomId,'members',authUser.uid),{joinedAt:fb.serverTimestamp()},{merge:true});switchMode('private');updatePrivateUI();
    }
    async function joinAndSubscribePrivate(){
      if(!currentRoom||!currentRoomKey)return;try{await fb.setDoc(fb.doc(db,'privateRooms',currentRoom,'members',authUser.uid),{joinedAt:fb.serverTimestamp()},{merge:true});unsubscribeMessages?.();const q=fb.query(fb.collection(db,'privateRooms',currentRoom,'messages'),fb.orderBy('createdAt','desc'),fb.limit(100));unsubscribeMessages=fb.onSnapshot(q,async snap=>{const rows=[];for(const d of snap.docs.reverse()){const meta=d.data(),payload=await decryptPayload(meta);if(payload)rows.push({id:d.id,uid:meta.uid,createdAt:meta.createdAt,...payload});}renderMessages(rows,true);setNotice('PRIVATE CHANNEL // END-TO-END ENCRYPTED','private')},err=>{console.error(err);setNotice('PRIVATE ROOM ACCESS FAILED','error')});updatePrivateUI()}catch(err){console.error(err);setNotice('PRIVATE ROOM JOIN FAILED','error')}
    }
    async function sendPrivate(text){const enc=await encryptPayload({text,name:profile.displayName,avatar:profile.avatar||'◈'});await fb.addDoc(fb.collection(db,'privateRooms',currentRoom,'messages'),{uid:authUser.uid,createdAt:fb.serverTimestamp(),...enc});}
    function updatePrivateUI(){const has=!!currentRoom;$('#pjlRoomLabel').textContent=has?`ROOM // ${currentRoom.toUpperCase()}`:'NO ROOM';$('#pjlCopyInvite').hidden=!has;$('#pjlExitRoom').hidden=!has}
    $('#pjlCreateRoom').onclick=createPrivateRoom;$('#pjlCopyInvite').onclick=async()=>{if(!currentInvite)return;try{if(navigator.share)await navigator.share({title:'PJ // XYPHER Private Room',text:'Join my encrypted PJ Lounge room.',url:currentInvite});else await navigator.clipboard.writeText(currentInvite);setNotice('PRIVATE INVITE READY','ok')}catch(e){if(e?.name!=='AbortError')setNotice('COULD NOT SHARE INVITE','error')}};
    $('#pjlExitRoom').onclick=()=>{unsubscribeMessages?.();unsubscribeMessages=null;currentRoom=null;currentRoomKey=null;currentInvite='';const u=new URL(location.href);u.searchParams.delete('pjroom');u.hash='';history.replaceState(null,'',u);updatePrivateUI();switchMode('public')};

    form.addEventListener('submit',async e=>{e.preventDefault();if(!firebaseReady||!authUser||!profile)return;const text=input.value.trim();if(!text)return;const now=Date.now();if(now-lastSend<2500){setNotice('SLOW DOWN // 2.5 SECOND COOLDOWN','warn');return}if(mode==='private'&&(!currentRoom||!currentRoomKey)){setNotice('CREATE OR JOIN A PRIVATE ROOM FIRST','warn');return}input.value='';lastSend=now;try{mode==='public'?await sendPublic(text.slice(0,500)):await sendPrivate(text.slice(0,500));}catch(err){console.error(err);setNotice('MESSAGE FAILED // CHECK CONNECTION','error')}});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});

    async function startPresence(){
      const ref=fb.doc(db,'presence',authUser.uid);const beat=async()=>{try{await fb.setDoc(ref,{uid:authUser.uid,lastSeen:fb.serverTimestamp()},{merge:true})}catch(_){}};await beat();setInterval(beat,45000);
      unsubscribePresence=fb.onSnapshot(fb.collection(db,'presence'),snap=>{const cutoff=Date.now()-120000;let n=0;snap.forEach(d=>{const t=d.data().lastSeen?.toMillis?.()||0;if(t>=cutoff)n++});onlineEl.textContent=n||'1'});
    }

    async function parseInvite(){
      const u=new URL(location.href),room=u.searchParams.get('pjroom'),hash=new URLSearchParams(u.hash.replace(/^#/,'')),raw=hash.get('k');if(!room||!raw)return;try{currentRoom=room.replace(/[^a-z0-9]/gi,'').slice(0,40);currentRoomKey=await importRoomKey(raw);currentInvite=u.toString();switchMode('private');updatePrivateUI();await joinAndSubscribePrivate();open()}catch(err){console.error(err);setNotice('INVALID PRIVATE ROOM KEY','error')}
    }

    async function connectFirebase(){
      const cfg=window.FIREBASE_CONFIG||window.PJ_FIREBASE_CONFIG;if(!cfg){setNotice('LOUNGE SETUP REQUIRED // FIREBASE CONFIG MISSING','error');return}
      try{
        const V='12.19.0';const [appMod,authMod,fsMod]=await Promise.all([import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)]);
        const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg),auth=authMod.getAuth(app);db=fsMod.getFirestore(app);fb={...fsMod};
        let user=auth.currentUser;if(!user){const cred=await authMod.signInAnonymously(auth);user=cred.user}authUser=user;firebaseReady=true;await loadProfile();await startPresence();await parseInvite();if(mode==='public')subscribePublic();setNotice('LOUNGE ONLINE // MESSAGES SAVED','ok');
      }catch(err){console.error('PJ Lounge Firebase error',err);const code=err?.code||'';if(code.includes('operation-not-allowed'))setNotice('ENABLE ANONYMOUS AUTH IN FIREBASE CONSOLE','error');else if(code.includes('permission-denied'))setNotice('FIRESTORE RULES NEED TO BE DEPLOYED','error');else setNotice('FIREBASE CONNECTION FAILED // SETUP REQUIRED','error')}
    }

    addEventListener('popstate',()=>{location.reload()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&profilePanel.hidden===false){profilePanel.hidden=true;return}if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='l'){e.preventDefault();opened?close():open()}});
    window.PJLounge={open,close,createPrivateRoom,get state(){return{open:opened,mode,connected:firebaseReady,uid:authUser?.uid||null,room:currentRoom}}};
    connectFirebase();
  });
})();
