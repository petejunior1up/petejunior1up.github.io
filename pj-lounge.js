/* PJ // LOUNGE v3
   Supabase saved chat + replies + reactions + typing + PJ Core mentions.
   XYPHER private rooms keep message/reply/reaction payloads encrypted in-browser with AES-256-GCM.
*/
(()=>{
  if(window.PJLounge)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(async()=>{
    const MSG_PREFIX='~PJL3~',REACT_PREFIX='~PJR3~',SYS_PREFIX='~PJS3~';
    const REACTIONS=['❤️','🔥','😂','👏','👍','👀'];
    const EMOJIS=['😀','😂','🥹','😍','😎','🤝','🔥','❤️','💯','👏','👍','👀','🎯','🚀','💻','🎮','⚡','✨','🫡','😭','🤣','😮','🤔','🙌'];
    const AVATARS=['◈','😎','👾','🤖','🧠','⚡','🔥','🎮','💻','🚀','🕶️','🦾'];

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
            <div class="pjl-room-info public-view"><small>PUBLIC CHANNEL</small><strong>LOUNGE // 01</strong><p>Saved live chat. Reply, react, use emojis, or mention <b>@PJCore</b>.</p></div>
            <div class="pjl-room-info private-view" hidden><small>ENCRYPTED CHANNEL</small><strong id="pjlRoomLabel">NO ROOM</strong><p>Messages, replies and reactions are encrypted before storage.</p><button id="pjlCreateRoom" type="button">CREATE PRIVATE ROOM</button><button id="pjlCopyInvite" type="button" hidden>COPY INVITE LINK</button><button id="pjlExitRoom" type="button" hidden>EXIT PRIVATE ROOM</button></div>
            <div class="pjl-safety"><small>PRIVACY</small><p>Keep passwords, OTPs, home addresses, school locations and other secrets out of public chat.</p></div>
          </aside>
          <div class="pjl-chat">
            <div class="pjl-messages" id="pjlMessages" aria-live="polite"></div>
            <div class="pjl-empty" id="pjlEmpty">No messages yet. Start the conversation.</div>
            <div class="pjl-typing" id="pjlTyping" hidden></div>
            <div class="pjl-replying" id="pjlReplying" hidden><div><small>REPLYING TO <b id="pjlReplyName"></b></small><span id="pjlReplyText"></span></div><button id="pjlCancelReply" type="button" aria-label="Cancel reply">×</button></div>
            <form class="pjl-form" id="pjlForm">
              <button class="pjl-emoji-btn" id="pjlEmojiBtn" type="button" aria-label="Choose emoji">☺</button>
              <textarea id="pjlInput" maxlength="500" rows="1" placeholder="Message the lounge…" aria-label="Message the lounge"></textarea>
              <button type="submit">SEND ↗</button>
              <div class="pjl-emoji-panel" id="pjlEmojiPanel" hidden>${EMOJIS.map(e=>`<button type="button" data-insert-emoji="${e}">${e}</button>`).join('')}</div>
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
              <label>AVATAR / EMOJI<input id="pjlProfileAvatar" maxlength="8"><span class="pjl-avatar-presets">${AVATARS.map(e=>`<button type="button" data-avatar="${e}">${e}</button>`).join('')}</span></label>
              <label>COUNTRY / OPTIONAL<input id="pjlCountry" maxlength="40"></label>
              <label class="wide">BIO / OPTIONAL<textarea id="pjlBio" maxlength="160" rows="3"></textarea></label>
              <label class="wide">PRIVATE EMAIL / OPTIONAL<input id="pjlEmail" type="email" maxlength="120"><small>Stored separately and not shown to other visitors.</small></label>
            </div>
            <div class="pjl-owner-setup" id="pjlOwnerSetup"><small>OWNER BADGE</small><span>Owner identification support is ready. Copy this browser identity when you want to link the badge securely.</span><button id="pjlCopyUid" type="button">COPY MY USER ID</button></div>
            <p class="pjl-profile-note">Only your display name, handle, avatar, country and bio can be visible in the Lounge. Avoid putting exact addresses, school locations or other highly sensitive details in your public profile.</p>
            <button class="pjl-save" type="submit">SAVE PROFILE</button>
          </form>
        </div>
      </div>`;
    document.body.appendChild(root);

    const $=s=>root.querySelector(s);
    const launch=$('.pjl-launch'),messagesEl=$('#pjlMessages'),emptyEl=$('#pjlEmpty'),notice=$('#pjlNotice'),form=$('#pjlForm'),input=$('#pjlInput'),onlineEl=$('#pjlOnline');
    const profilePanel=$('#pjlProfile'),profileForm=$('#pjlProfileForm'),typingEl=$('#pjlTyping'),emojiPanel=$('#pjlEmojiPanel');
    let opened=false,mode='public',connected=false,user=null,sb=null,profile=null,lastSend=0,lastReaction=0,currentRoom=null,currentRoomKey=null,currentInvite='';
    let messageChannel=null,presenceChannel=null,socialChannel=null,presenceTimer=null,typingTimer=null,typingCleanup=null,lastTypingSent=0;
    let replyingTo=null,currentMessages=new Map(),reactionState=new Map();
    const typingUsers=new Map();
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
    function safeJson(raw){try{return JSON.parse(raw)}catch(_){return null}}

    function setProfileUI(){
      const p=profile||{};
      $('#pjlName').textContent=p.displayName||'Visitor';$('#pjlHandle').textContent=p.handle||'@visitor';$('#pjlAvatar').textContent=p.avatar||((p.displayName||'V').trim()[0]||'V').toUpperCase();
      $('#pjlDisplayName').value=p.displayName||'';$('#pjlProfileHandle').value=(p.handle||'').replace(/^@/,'');$('#pjlProfileAvatar').value=p.avatar||'';$('#pjlCountry').value=p.country||'';$('#pjlBio').value=p.bio||'';$('#pjlEmail').value=p.email||'';
      $('#pjlOwnerSetup').hidden=!!window.PJ_SUPABASE_CONFIG?.ownerUid;
    }
    $('.pjl-profile-btn').onclick=()=>{setProfileUI();profilePanel.hidden=false};$('#pjlProfileClose').onclick=()=>profilePanel.hidden=true;
    root.querySelector('.pjl-avatar-presets').onclick=e=>{const b=e.target.closest('[data-avatar]');if(!b)return;$('#pjlProfileAvatar').value=b.dataset.avatar;$('#pjlAvatar').textContent=b.dataset.avatar};
    $('#pjlCopyUid').onclick=async()=>{if(!user)return;try{await navigator.clipboard.writeText(user.id);setNotice('USER ID COPIED // OWNER BADGE READY TO LINK','ok')}catch(_){setNotice(`YOUR USER ID // ${user.id}`,'ok')}};

    function clearReply(){replyingTo=null;$('#pjlReplying').hidden=true;$('#pjlReplyName').textContent='';$('#pjlReplyText').textContent=''}
    function startReply(m){replyingTo={id:m.id,name:m.name||'Visitor',text:(m.text||'').slice(0,100)};$('#pjlReplyName').textContent=replyingTo.name;$('#pjlReplyText').textContent=replyingTo.text;$('#pjlReplying').hidden=false;input.focus({preventScroll:true})}
    $('#pjlCancelReply').onclick=clearReply;

    function insertEmoji(emoji){const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;input.value=input.value.slice(0,start)+emoji+input.value.slice(end);const pos=start+emoji.length;input.setSelectionRange(pos,pos);input.focus({preventScroll:true});input.dispatchEvent(new Event('input',{bubbles:true}))}
    $('#pjlEmojiBtn').onclick=()=>{emojiPanel.hidden=!emojiPanel.hidden};
    emojiPanel.onclick=e=>{const b=e.target.closest('[data-insert-emoji]');if(!b)return;insertEmoji(b.dataset.insertEmoji);emojiPanel.hidden=true};

    function applyReaction(target,emoji,actor,op){
      if(!target||!REACTIONS.includes(emoji)||!actor)return;
      if(!reactionState.has(target))reactionState.set(target,new Map());const map=reactionState.get(target);if(!map.has(emoji))map.set(emoji,new Set());const set=map.get(emoji);
      if(op==='remove')set.delete(actor);else set.add(actor);
    }
    function reactionHtml(id){
      const map=reactionState.get(id)||new Map();const chips=REACTIONS.map(emoji=>{const set=map.get(emoji);if(!set?.size)return'';return `<button type="button" class="pjl-reaction-chip${set.has(user?.id)?' mine':''}" data-react-emoji="${emoji}" data-id="${esc(id)}">${emoji}<b>${set.size}</b></button>`}).join('');
      return `<div class="pjl-reactions">${chips}<button type="button" class="pjl-react-toggle" data-react-toggle="${esc(id)}" aria-label="React">＋</button><span class="pjl-reaction-picker">${REACTIONS.map(e=>`<button type="button" data-react-emoji="${e}" data-id="${esc(id)}">${e}</button>`).join('')}</span></div>`;
    }

    function renderTyping(){
      const now=Date.now();for(const [id,t] of typingUsers)if(t.expires<now||id===user?.id)typingUsers.delete(id);
      const names=[...typingUsers.values()].map(x=>x.name).slice(0,3);if(!names.length){typingEl.hidden=true;typingEl.textContent='';return}
      typingEl.hidden=false;typingEl.textContent=names.length===1?`${names[0]} is typing…`:names.length===2?`${names[0]} and ${names[1]} are typing…`:`${names[0]}, ${names[1]} + others are typing…`;
    }
    function acceptTyping(payload){if(!payload?.uid||payload.uid===user?.id)return;if(payload.active)typingUsers.set(payload.uid,{name:String(payload.name||'Someone').slice(0,32),expires:Date.now()+2600});else typingUsers.delete(payload.uid);renderTyping()}

    function normalizePublicRow(row){
      const raw=String(row.message||'');
      if(raw.startsWith(REACT_PREFIX))return{kind:'reaction',payload:safeJson(raw.slice(REACT_PREFIX.length)),actor:row.user_id};
      if(raw.startsWith(SYS_PREFIX))return{id:row.id,uid:row.user_id,name:'PJ CORE',handle:'@pjcore',avatar:'◈',text:raw.slice(SYS_PREFIX.length),createdAt:row.created_at,system:true,kind:'message'};
      if(raw.startsWith(MSG_PREFIX)){const p=safeJson(raw.slice(MSG_PREFIX.length));if(p)return{id:row.id,uid:row.user_id,name:row.display_name,handle:row.handle,avatar:row.avatar,text:String(p.text||''),reply:p.reply||null,createdAt:row.created_at,kind:'message'};}
      return{id:row.id,uid:row.user_id,name:row.display_name,handle:row.handle,avatar:row.avatar,text:raw,createdAt:row.created_at,kind:'message'};
    }

    function renderMessages(items,encrypted=false){
      messagesEl.innerHTML='';currentMessages=new Map();
      const visible=items.filter(m=>m.kind==='message'&&!blocked.has(m.uid));emptyEl.hidden=visible.length>0;
      visible.forEach(m=>{
        currentMessages.set(m.id,m);const mine=!m.system&&m.uid===user?.id;const owner=!m.system&&window.PJ_SUPABASE_CONFIG?.ownerUid&&m.uid===window.PJ_SUPABASE_CONFIG.ownerUid;
        const article=document.createElement('article');article.className='pjl-msg'+(mine?' mine':'')+(owner?' owner':'')+(m.system?' system':'');article.dataset.messageId=m.id;
        const reply=m.reply?`<div class="pjl-reply-quote"><b>${esc(m.reply.name||'Visitor')}</b><span>${esc(String(m.reply.text||'').slice(0,120))}</span></div>`:'';
        const tools=m.system?`<button data-reply="${esc(m.id)}">REPLY</button>`:`<button data-reply="${esc(m.id)}">REPLY</button>${!mine&&!encrypted?`<button data-report="${esc(m.id)}" data-uid="${esc(m.uid)}">REPORT</button><button data-block="${esc(m.uid)}">BLOCK</button>`:''}`;
        article.innerHTML=`<div class="pjl-msg-avatar">${esc(m.avatar||((m.name||'V')[0]||'V').toUpperCase())}</div><div class="pjl-msg-body"><div class="pjl-msg-meta"><strong>${esc(m.name||'Visitor')}${owner?' <em>OWNER</em>':''}${m.system?' <em class="system-badge">AI SYSTEM</em>':''}</strong><span>${encrypted?'🔒 ':''}${formatTime(m.createdAt)}</span></div>${reply}<p>${esc(m.text||'').replace(/\n/g,'<br>')}</p><div class="pjl-msg-tools">${tools}</div>${reactionHtml(m.id)}</div>`;
        messagesEl.appendChild(article);
      });
      messagesEl.scrollTop=messagesEl.scrollHeight;
    }

    async function saveReaction(target,emoji){
      if(!connected||!currentMessages.has(target)||!REACTIONS.includes(emoji))return;const now=Date.now();if(now-lastReaction<450)return;lastReaction=now;
      const set=reactionState.get(target)?.get(emoji),op=set?.has(user.id)?'remove':'add';
      try{
        if(mode==='public'){
          const body=REACT_PREFIX+JSON.stringify({target,emoji,op});
          const r=await sb.from('lounge_messages').insert({user_id:user.id,display_name:profile.displayName,handle:profile.handle,avatar:profile.avatar||'◈',message:body});throwIf(r);
        }else if(currentRoom&&currentRoomKey){
          const enc=await encryptObject({kind:'reaction',target,emoji,op});const r=await sb.from('private_messages').insert({room_id:currentRoom,user_id:user.id,...enc});throwIf(r);
        }
      }catch(err){console.error(err);setNotice('REACTION FAILED','error')}
    }

    messagesEl.addEventListener('click',async e=>{
      const reply=e.target.closest('[data-reply]');if(reply){const m=currentMessages.get(reply.dataset.reply);if(m)startReply(m);return}
      const rt=e.target.closest('[data-react-toggle]');if(rt){const article=rt.closest('.pjl-msg');messagesEl.querySelectorAll('.pjl-msg.react-open').forEach(x=>{if(x!==article)x.classList.remove('react-open')});article?.classList.toggle('react-open');return}
      const re=e.target.closest('[data-react-emoji]');if(re){await saveReaction(re.dataset.id,re.dataset.reactEmoji);re.closest('.pjl-msg')?.classList.remove('react-open');return}
      const b=e.target.closest('[data-block],[data-report]');if(!b)return;
      if(b.dataset.block&&confirm('Hide messages from this visitor on this device?')){blocked.add(b.dataset.block);localStorage.setItem('pjLoungeBlocked',JSON.stringify([...blocked]));mode==='public'?await loadPublicMessages():await loadPrivateMessages()}
      if(b.dataset.report&&connected){const reason=prompt('Short reason for report:','Spam or inappropriate content');if(!reason)return;try{const r=await sb.from('reports').insert({reporter_id:user.id,target_user_id:b.dataset.uid,message_id:b.dataset.report,reason:reason.slice(0,160)});throwIf(r);setNotice('REPORT SENT // THANK YOU','ok')}catch(err){console.error(err);setNotice('REPORT FAILED // TRY AGAIN','error')}}
    });

    async function loadProfile(){
      const [pub,priv]=await Promise.all([sb.from('public_profiles').select('*').eq('user_id',user.id).maybeSingle(),sb.from('private_profiles').select('email').eq('user_id',user.id).maybeSingle()]);throwIf(pub);throwIf(priv);
      if(pub.data)profile={displayName:pub.data.display_name,handle:pub.data.handle,avatar:pub.data.avatar,country:pub.data.country||'',bio:pub.data.bio||'',email:priv.data?.email||''};
      else{const suffix=rand(2).toLowerCase();profile={displayName:`Visitor ${suffix.toUpperCase()}`,handle:`@visitor_${suffix}`,avatar:'◈',country:'',bio:'',email:''};const created=await sb.from('public_profiles').insert({user_id:user.id,display_name:profile.displayName,handle:profile.handle,avatar:profile.avatar,country:'',bio:''});throwIf(created)}setProfileUI();
    }

    profileForm.addEventListener('submit',async e=>{
      e.preventDefault();if(!connected)return;const displayName=$('#pjlDisplayName').value.trim().slice(0,32),handle=cleanHandle($('#pjlProfileHandle').value),avatar=$('#pjlProfileAvatar').value.trim().slice(0,8)||'◈',country=$('#pjlCountry').value.trim().slice(0,40),bio=$('#pjlBio').value.trim().slice(0,160),email=$('#pjlEmail').value.trim().slice(0,120);if(!displayName||handle==='@')return;
      try{const [pub,priv]=await Promise.all([sb.from('public_profiles').upsert({user_id:user.id,display_name:displayName,handle,avatar,country,bio,updated_at:new Date().toISOString()}),sb.from('private_profiles').upsert({user_id:user.id,email,updated_at:new Date().toISOString()})]);throwIf(pub);throwIf(priv);profile={displayName,handle,avatar,country,bio,email};setProfileUI();profilePanel.hidden=true;setNotice('PROFILE SAVED','ok')}catch(err){console.error(err);setNotice('PROFILE SAVE FAILED','error')}
    });

    async function loadPublicMessages(){
      if(!connected)return;const result=await sb.from('lounge_messages').select('*').order('created_at',{ascending:false}).limit(300);throwIf(result);reactionState=new Map();const rows=(result.data||[]).reverse(),items=[];
      for(const row of rows){const m=normalizePublicRow(row);if(m.kind==='reaction'){const p=m.payload;if(p)applyReaction(p.target,p.emoji,m.actor,p.op);continue}items.push(m)}renderMessages(items,false);
    }

    async function subscribePublic(){
      if(!connected)return;removeChannel(messageChannel);messageChannel=null;try{await loadPublicMessages();setNotice('PUBLIC LOUNGE // LIVE','ok')}catch(err){console.error(err);setNotice('LOUNGE READ BLOCKED // CHECK SUPABASE POLICIES','error');return}
      messageChannel=sb.channel('pj-lounge-public-v3').on('postgres_changes',{event:'*',schema:'public',table:'lounge_messages'},()=>loadPublicMessages().catch(console.error)).subscribe(status=>{if(status==='CHANNEL_ERROR')setNotice('REALTIME CONNECTION ERROR','error')});setupSocialChannel();
    }

    function packPublicMessage(text,reply){
      text=String(text||'').slice(0,500);if(!reply&&!text.startsWith('~PJ'))return text;
      const p={text:text.slice(0,330),reply:reply?{id:reply.id,name:String(reply.name||'Visitor').slice(0,32),text:String(reply.text||'').slice(0,75)}:null};let raw=MSG_PREFIX+JSON.stringify(p);while(raw.length>495&&p.text.length>40){p.text=p.text.slice(0,-20);raw=MSG_PREFIX+JSON.stringify(p)}return raw.slice(0,500);
    }
    async function sendPublic(text){const body=packPublicMessage(text,replyingTo);const r=await sb.from('lounge_messages').insert({user_id:user.id,display_name:profile.displayName,handle:profile.handle,avatar:profile.avatar||'◈',message:body});throwIf(r)}
    async function sendCoreSystem(text){const body=SYS_PREFIX+String(text||'').slice(0,450);const r=await sb.from('lounge_messages').insert({user_id:user.id,display_name:'PJ CORE',handle:'@pjcore',avatar:'◈',message:body});throwIf(r)}

    function coreReply(q){
      const n=String(q||'').toLowerCase().replace(/@pjcore|@core/g,'').trim(),ps=[...document.querySelectorAll('.project-card:not(.coming-soon)')].map(x=>x.querySelector('h3')?.textContent?.trim()).filter(Boolean),ss=[...document.querySelectorAll('.skill')].map(x=>x.querySelector('.skill-name span')?.textContent?.trim()).filter(Boolean);
      if(!n||/^(hi|hey|yo|hello)/.test(n))return 'Hey 👋 PJ Core is in Lounge mode. Ask me about Pete, projects, skills, XYPHER, or the site.';
      if(n.includes('who is pete')||n.includes('about pete')){const a=[...document.querySelectorAll('#about .about-text > p')].map(p=>p.textContent.trim()).join(' ');return a||'Pete Junior is a student, creator and technology enthusiast who learns by building.'}
      if(n.includes('project'))return ps.length?`Live projects right now: ${ps.join(' • ')}.`:'I can’t read the project cards right now.';
      if(n.includes('skill')||n.includes('tech'))return ss.length?`Current skill matrix: ${ss.join(' • ')}.`:'The portfolio focuses on HTML, CSS, JavaScript, software, cybersecurity and AI.';
      if(n.includes('xypher')||n.includes('404'))return 'XYPHER // 404 is the hidden alternate visual mode. Type 404 on the portfolio or open it from PJ // COMMAND.';
      if(n.includes('contact')||n.includes('email')||n.includes('whatsapp'))return 'Pete’s Contact section has the published email and WhatsApp routes.';
      if(n.includes('love archive'))return 'The Love Archive is one of Pete’s featured editorial web projects. You can open it from Projects or PJ // COMMAND.';
      if(n.includes('lounge'))return 'You’re inside PJ // LOUNGE — public messages are saved; XYPHER private rooms encrypt content before it is stored.';
      return 'I’m the Lounge-side PJ Core, so I’m best at this portfolio and its systems. Try “@PJCore projects”, “@PJCore skills”, or “@PJCore who is Pete?”';
    }

    const b64u=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const unb64u=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
    async function importRoomKey(raw){return crypto.subtle.importKey('raw',unb64u(raw),{name:'AES-GCM'},false,['encrypt','decrypt'])}
    async function encryptObject(payload){const iv=crypto.getRandomValues(new Uint8Array(12)),data=new TextEncoder().encode(JSON.stringify(payload)),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},currentRoomKey,data);return{version:1,iv:b64u(iv),ciphertext:b64u(cipher)}}
    async function decryptObject(m){try{const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64u(m.iv)},currentRoomKey,unb64u(m.ciphertext));return JSON.parse(new TextDecoder().decode(plain))}catch(_){return null}}

    function updatePrivateUI(){const has=!!currentRoom;$('#pjlRoomLabel').textContent=has?`ROOM // ${currentRoom.slice(0,8).toUpperCase()}`:'NO ROOM';$('#pjlCopyInvite').hidden=!has;$('#pjlExitRoom').hidden=!has}
    async function loadPrivateMessages(){
      if(!currentRoom||!currentRoomKey)return;const result=await sb.from('private_messages').select('*').eq('room_id',currentRoom).order('created_at',{ascending:false}).limit(300);throwIf(result);reactionState=new Map();const items=[];
      for(const m of (result.data||[]).reverse()){const p=await decryptObject(m);if(!p)continue;if(p.kind==='reaction'){applyReaction(p.target,p.emoji,m.user_id,p.op);continue}items.push({id:m.id,uid:m.user_id,createdAt:m.created_at,name:p.name||'Visitor',avatar:p.avatar||'◈',text:p.text||'',reply:p.reply||null,kind:'message'})}renderMessages(items,true);
    }
    async function createPrivateRoom(){
      if(!connected)return;try{const roomId=crypto.randomUUID(),raw=b64u(crypto.getRandomValues(new Uint8Array(32)));let r=await sb.from('private_rooms').insert({id:roomId,created_by:user.id,version:1});throwIf(r);r=await sb.from('private_room_members').insert({room_id:roomId,user_id:user.id});throwIf(r);currentRoom=roomId;currentRoomKey=await importRoomKey(raw);const url=new URL(location.href);url.searchParams.set('pjroom',roomId);url.hash='k='+raw;currentInvite=url.toString();history.pushState(null,'',url);switchMode('private');updatePrivateUI()}catch(err){console.error(err);setNotice('PRIVATE ROOM CREATION FAILED','error')}
    }
    async function joinAndSubscribePrivate(){
      if(!currentRoom||!currentRoomKey||!connected)return;try{const member=await sb.from('private_room_members').upsert({room_id:currentRoom,user_id:user.id},{onConflict:'room_id,user_id'});throwIf(member);removeChannel(messageChannel);messageChannel=null;await loadPrivateMessages();messageChannel=sb.channel(`pj-private-${currentRoom}`).on('postgres_changes',{event:'*',schema:'public',table:'private_messages',filter:`room_id=eq.${currentRoom}`},()=>loadPrivateMessages().catch(console.error)).subscribe(status=>{if(status==='CHANNEL_ERROR')setNotice('PRIVATE REALTIME ERROR','error')});setupSocialChannel();updatePrivateUI();setNotice('PRIVATE CHANNEL // END-TO-END ENCRYPTED','private')}catch(err){console.error(err);setNotice('PRIVATE ROOM ACCESS FAILED','error')}
    }
    async function sendPrivate(text){const payload={kind:'message',text:String(text).slice(0,500),name:profile.displayName,avatar:profile.avatar||'◈',reply:replyingTo?{id:replyingTo.id,name:replyingTo.name,text:replyingTo.text.slice(0,100)}:null};const enc=await encryptObject(payload);const r=await sb.from('private_messages').insert({room_id:currentRoom,user_id:user.id,...enc});throwIf(r)}

    $('#pjlCreateRoom').onclick=createPrivateRoom;
    $('#pjlCopyInvite').onclick=async()=>{if(!currentInvite)return;try{if(navigator.share)await navigator.share({title:'PJ // XYPHER Private Room',text:'Join my encrypted PJ Lounge room.',url:currentInvite});else await navigator.clipboard.writeText(currentInvite);setNotice('PRIVATE INVITE READY','ok')}catch(e){if(e?.name!=='AbortError')setNotice('COULD NOT SHARE INVITE','error')}};
    $('#pjlExitRoom').onclick=()=>{removeChannel(messageChannel);removeChannel(socialChannel);messageChannel=socialChannel=null;currentRoom=null;currentRoomKey=null;currentInvite='';clearReply();typingUsers.clear();renderTyping();const u=new URL(location.href);u.searchParams.delete('pjroom');u.hash='';history.replaceState(null,'',u);updatePrivateUI();switchMode('public')};

    async function setupSocialChannel(){
      removeChannel(socialChannel);socialChannel=null;typingUsers.clear();renderTyping();if(!connected)return;
      if(mode==='public'){
        socialChannel=sb.channel('pj-lounge-social-v3').on('broadcast',{event:'typing'},({payload})=>acceptTyping(payload)).subscribe();
      }else if(currentRoom&&currentRoomKey){
        socialChannel=sb.channel(`pj-private-social-${currentRoom}`).on('broadcast',{event:'typing'},async({payload})=>{const p=payload?.encrypted?await decryptObject(payload.encrypted):null;if(p?.kind==='typing')acceptTyping(p)}).subscribe();
      }
    }
    async function broadcastTyping(active){
      if(!socialChannel||!connected||!user||!profile)return;const p={kind:'typing',uid:user.id,name:profile.displayName,active:!!active};
      try{if(mode==='public')await socialChannel.send({type:'broadcast',event:'typing',payload:p});else if(currentRoomKey){const encrypted=await encryptObject(p);await socialChannel.send({type:'broadcast',event:'typing',payload:{encrypted}})}}catch(_){}
    }

    function switchMode(next){
      mode=next;root.dataset.mode=mode;clearReply();emojiPanel.hidden=true;root.querySelectorAll('.pjl-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));root.querySelectorAll('.public-view').forEach(x=>x.hidden=mode!=='public');root.querySelectorAll('.private-view').forEach(x=>x.hidden=mode!=='private');$('#pjlModeText').textContent=mode==='public'?'PUBLIC // SAVED':'PRIVATE // AES-256-GCM';input.placeholder=mode==='public'?'Message the lounge…':'Message the encrypted room…';removeChannel(messageChannel);removeChannel(socialChannel);messageChannel=socialChannel=null;messagesEl.innerHTML='';emptyEl.hidden=false;typingUsers.clear();renderTyping();if(!connected)return;if(mode==='public')subscribePublic();else if(currentRoom&&currentRoomKey)joinAndSubscribePrivate();else setNotice('CREATE A PRIVATE ROOM OR OPEN AN INVITE LINK','private');
    }
    root.querySelector('.pjl-tabs').onclick=e=>{const b=e.target.closest('[data-mode]');if(b)switchMode(b.dataset.mode)};

    form.addEventListener('submit',async e=>{
      e.preventDefault();if(!connected||!user||!profile)return;const text=input.value.trim();if(!text)return;const now=Date.now();if(now-lastSend<1800){setNotice('SLOW DOWN // 1.8 SECOND COOLDOWN','warn');return}if(mode==='private'&&(!currentRoom||!currentRoomKey)){setNotice('CREATE OR JOIN A PRIVATE ROOM FIRST','warn');return}input.value='';input.style.height='';emojiPanel.hidden=true;lastSend=now;await broadcastTyping(false);
      const mentionCore=mode==='public'&&/(^|\s)@(?:pjcore|core)\b/i.test(text);try{mode==='public'?await sendPublic(text.slice(0,500)):await sendPrivate(text.slice(0,500));const corePrompt=text;clearReply();if(mentionCore)setTimeout(()=>sendCoreSystem(coreReply(corePrompt)).catch(console.error),350+Math.random()*450)}catch(err){console.error(err);setNotice('MESSAGE FAILED // CHECK CONNECTION','error')}
    });
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
    input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,110)+'px';const now=Date.now();if(now-lastTypingSent>700){lastTypingSent=now;broadcastTyping(true)}clearTimeout(typingTimer);typingTimer=setTimeout(()=>broadcastTyping(false),1300)});

    async function updatePresence(){if(!connected||!user)return;const r=await sb.from('presence').upsert({user_id:user.id,last_seen:new Date().toISOString()});if(r.error)console.warn('Presence update:',r.error.message)}
    async function countPresence(){if(!connected)return;const cutoff=new Date(Date.now()-120000).toISOString(),r=await sb.from('presence').select('user_id',{count:'exact',head:true}).gte('last_seen',cutoff);if(!r.error)onlineEl.textContent=String(r.count||1)}
    async function startPresence(){await updatePresence();await countPresence();clearInterval(presenceTimer);presenceTimer=setInterval(()=>{updatePresence();countPresence()},45000);clearInterval(typingCleanup);typingCleanup=setInterval(renderTyping,1000);removeChannel(presenceChannel);presenceChannel=sb.channel('pj-lounge-presence-db').on('postgres_changes',{event:'*',schema:'public',table:'presence'},()=>countPresence()).subscribe()}

    async function parseInvite(){const u=new URL(location.href),room=u.searchParams.get('pjroom'),hash=new URLSearchParams(u.hash.replace(/^#/,'')),raw=hash.get('k');if(!room||!raw)return false;try{if(!/^[0-9a-f-]{36}$/i.test(room))throw new Error('Invalid room id');currentRoom=room;currentRoomKey=await importRoomKey(raw);currentInvite=u.toString();updatePrivateUI();switchMode('private');open();return true}catch(err){console.error(err);setNotice('INVALID PRIVATE ROOM INVITE','error');return false}}
    async function loadSupabaseSdk(){if(window.supabase?.createClient)return window.supabase;await new Promise((resolve,reject)=>{const existing=document.querySelector('script[data-pj-supabase-sdk]');if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.dataset.pjSupabaseSdk='1';s.onload=resolve;s.onerror=()=>reject(new Error('Supabase SDK failed to load'));document.head.appendChild(s)});return window.supabase}
    async function connectSupabase(){
      const cfg=window.PJ_SUPABASE_CONFIG;if(!cfg?.url||!cfg?.publishableKey){setNotice('LOUNGE SETUP REQUIRED // SUPABASE CONFIG MISSING','error');return}
      try{const sdk=await loadSupabaseSdk();sb=sdk.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});let session=(await sb.auth.getSession()).data.session;if(!session){const auth=await sb.auth.signInAnonymously();if(auth.error)throw auth.error;session=auth.data.session}user=session?.user;if(!user)throw new Error('Anonymous session was not created');connected=true;await loadProfile();await startPresence();const invited=await parseInvite();if(!invited&&mode==='public')await subscribePublic();setNotice(invited?'PRIVATE CHANNEL // CONNECTED':'LOUNGE ONLINE // SOCIAL MODE','ok')}
      catch(err){console.error('PJ Lounge Supabase error',err);const msg=String(err?.message||'').toLowerCase();if(msg.includes('anonymous')||msg.includes('signups'))setNotice('ENABLE ANONYMOUS SIGN-INS IN SUPABASE','error');else if(msg.includes('row-level')||msg.includes('permission')||msg.includes('policy'))setNotice('SUPABASE RLS POLICY BLOCKED THIS REQUEST','error');else setNotice('SUPABASE CONNECTION FAILED // CHECK SETUP','error')}
    }

    document.addEventListener('click',e=>{if(!e.target.closest('#pjlEmojiBtn')&&!e.target.closest('#pjlEmojiPanel'))emojiPanel.hidden=true});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&profilePanel.hidden===false){profilePanel.hidden=true;return}if(e.key==='Escape'&&!emojiPanel.hidden){emojiPanel.hidden=true;return}if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='l'){e.preventDefault();opened?close():open()}});
    window.PJLounge={open,close,createPrivateRoom,copyMyUid:async()=>{if(user&&navigator.clipboard)await navigator.clipboard.writeText(user.id);return user?.id||null},get state(){return{open:opened,mode,connected,uid:user?.id||null,room:currentRoom,backend:'supabase',social:true}}};
    connectSupabase();
  });
})();
