/* PJ // ADMIN AUTH v3 — phone-free
   Permanent owner login: Supabase email/password + private server-verified Admin Key.
   The Admin Key is never stored in GitHub; only its one-way hash lives in Supabase.
*/
(()=>{
  if(window.PJAdminAuth)return;
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(async()=>{
    const root=document.createElement('section');root.className='pja2-root';root.innerHTML=`
      <button class="pja2-launch" type="button" aria-label="Admin sign in">PJ // ADMIN <b>LOCKED</b></button>
      <div class="pja2-overlay" aria-hidden="true"><div class="pja2-card" role="dialog" aria-modal="true" aria-label="Secure admin sign in">
        <div class="pja2-head"><small>OWNER AUTHENTICATION // PHONE-FREE</small><button type="button" aria-label="Close">×</button></div>
        <div class="pja2-body"></div>
      </div></div>`;
    document.body.appendChild(root);
    const overlay=root.querySelector('.pja2-overlay'),body=root.querySelector('.pja2-body'),launch=root.querySelector('.pja2-launch');
    let sb=null,user=null,isAdminAccount=false,secure=false,configured=false,verifiedUntil=null,lockedUntil=null;
    const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const status=(text,type='')=>{const e=body.querySelector('.pja2-status');if(e){e.textContent=text;e.dataset.type=type}};
    const open=()=>{overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');render().catch(console.error)};
    const close=()=>{overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true')};
    launch.onclick=open;root.querySelector('.pja2-head button').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close()};

    async function sdk(){if(window.supabase?.createClient)return window.supabase;await new Promise((res,rej)=>{let s=document.querySelector('script[data-pj-supabase-sdk]');if(s){if(window.supabase?.createClient)return res();s.addEventListener('load',res,{once:true});s.addEventListener('error',rej,{once:true});return}s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.dataset.pjSupabaseSdk='1';s.onload=res;s.onerror=()=>rej(new Error('Supabase SDK failed'));document.head.appendChild(s)});return window.supabase}
    async function client(){if(sb)return sb;const cfg=window.PJ_SUPABASE_CONFIG;if(!cfg?.url||!cfg?.publishableKey)throw new Error('Supabase config missing');const S=await sdk();sb=S.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});return sb}
    async function refreshState(){
      await client();const ses=(await sb.auth.getSession()).data.session;user=ses?.user||null;isAdminAccount=false;secure=false;configured=false;verifiedUntil=null;lockedUntil=null;
      if(user&&!user.is_anonymous){
        const m=await sb.from('site_admins').select('user_id').eq('user_id',user.id).maybeSingle();isAdminAccount=!m.error&&!!m.data;
        if(isAdminAccount){const st=await sb.rpc('pj_admin_session_status');if(!st.error&&st.data){configured=!!st.data.configured;secure=!!st.data.secure;verifiedUntil=st.data.verified_until||null;lockedUntil=st.data.locked_until||null}}
      }
      updateLauncher();
      setTimeout(mountNetworkSignOut,0);
    }
    function updateLauncher(){launch.classList.toggle('secure',secure);launch.innerHTML=secure?'PJ // ADMIN <b>SECURE</b>':'PJ // ADMIN <b>LOCKED</b>';document.documentElement.dataset.pjAdminSecure=secure?'1':'0'}

    async function render(){await refreshState();if(secure)return renderSecure();if(isAdminAccount)return renderKey();return renderLogin()}
    function renderLogin(){body.innerHTML=`<div class="pja2-kicker">PERMANENT OWNER LOGIN</div><h2>ADMIN SIGN IN.</h2><p>Sign in with the permanent Supabase owner account. Only the account registered in the site's Admin allowlist can continue.</p><form class="pja2-form" id="pja2Login"><label>EMAIL<input id="pja2Email" type="email" autocomplete="username" required></label><label>PASSWORD<input id="pja2Password" type="password" autocomplete="current-password" required></label><button class="pja2-btn">CONTINUE SECURELY</button></form><div class="pja2-status">PASSWORD IS SENT DIRECTLY TO SUPABASE AUTH // NOT STORED IN THIS SITE</div><p class="pja2-note">Visitors remain anonymous. This sign-in route is only for the pre-approved owner account.</p>`;body.querySelector('#pja2Login').onsubmit=login}
    async function login(e){e.preventDefault();const email=body.querySelector('#pja2Email').value.trim(),password=body.querySelector('#pja2Password').value;status('AUTHENTICATING…','warn');try{await client();const r=await sb.auth.signInWithPassword({email,password});if(r.error)throw r.error;user=r.data.user;const m=await sb.from('site_admins').select('user_id').eq('user_id',user.id).maybeSingle();if(m.error||!m.data){await sb.auth.signOut();await sb.auth.signInAnonymously();throw new Error('This account is not authorized as site owner.')}await refreshState();await render()}catch(err){renderLogin();status(err.message||'Sign-in failed','error')}}

    function renderKey(){
      if(!configured){body.innerHTML=`<div class="pja2-kicker">STEP 2 // PRIVATE ADMIN KEY</div><h2>KEY NOT CONFIGURED.</h2><p>Your owner account is recognized, but the phone-free Admin Key has not been created in Supabase yet.</p><div class="pja2-status" data-type="warn">RUN pj-admin-set-key.sql IN SUPABASE, CHOOSE YOUR KEY THERE, THEN REFRESH.</div><div class="pja2-actions"><button class="pja2-btn secondary" id="pja2SignOut" type="button">SIGN OUT</button></div>`;body.querySelector('#pja2SignOut').onclick=logout;return}
      const lock=lockedUntil&&new Date(lockedUntil)>new Date();body.innerHTML=`<div class="pja2-kicker">STEP 2 // PRIVATE ADMIN KEY</div><h2>${lock?'TEMPORARILY LOCKED.':'VERIFY IT\'S YOU.'}</h2><p>No phone or QR code is required. Enter the separate private Admin Key you created directly in Supabase. The stored database value is only a one-way hash.</p>${lock?`<div class="pja2-status" data-type="error">TOO MANY FAILED ATTEMPTS // TRY AGAIN AFTER ${esc(new Date(lockedUntil).toLocaleTimeString())}</div>`:`<form class="pja2-form" id="pja2KeyForm"><label>PRIVATE ADMIN KEY<input id="pja2Key" type="password" autocomplete="off" minlength="12" maxlength="200" required autofocus></label><button class="pja2-btn">UNLOCK ADMIN</button></form><div class="pja2-status">SESSION-SPECIFIC STEP-UP // EXPIRES AFTER 30 MINUTES</div>`}<div class="pja2-actions"><button class="pja2-btn secondary" id="pja2SignOut" type="button">SIGN OUT</button></div>`;
      const form=body.querySelector('#pja2KeyForm');if(form)form.onsubmit=verifyKey;body.querySelector('#pja2SignOut').onclick=logout;
    }
    async function verifyKey(e){e.preventDefault();const key=body.querySelector('#pja2Key').value;status('VERIFYING PRIVATE KEY…','warn');try{const r=await sb.rpc('pj_admin_stepup',{p_key:key});if(r.error)throw r.error;if(r.data!==true){await refreshState();renderKey();status(lockedUntil?'TOO MANY ATTEMPTS // SESSION TEMPORARILY LOCKED':'PRIVATE ADMIN KEY NOT ACCEPTED','error');return}await refreshState();if(!secure)throw new Error('Session step-up was not activated.');renderSecure()}catch(err){await refreshState();renderKey();status(err.message||'Verification failed','error')}}

    function renderSecure(){updateLauncher();const until=verifiedUntil?new Date(verifiedUntil).toLocaleTimeString():'';body.innerHTML=`<div class="pja2-kicker">OWNER CONTROL // SESSION VERIFIED</div><h2>ADMIN SECURE.</h2><p><span class="pja2-shield"><i></i>PASSWORD + PRIVATE ADMIN KEY VERIFIED</span></p><p>This signed-in browser session can now use protected moderation and publishing controls.${until?` Step-up expires around <strong>${esc(until)}</strong>.`:''}</p><div class="pja2-actions"><button class="pja2-btn" id="pja2OpenAdmin" type="button">OPEN NETWORK ADMIN</button><button class="pja2-btn secondary" id="pja2Lock" type="button">LOCK ADMIN NOW</button><button class="pja2-btn secondary" id="pja2Logout" type="button">SIGN OUT ADMIN</button></div><div class="pja2-status" data-type="ok">PHONE-FREE OWNER SESSION VERIFIED</div>`;body.querySelector('#pja2OpenAdmin').onclick=()=>{close();window.PJNetwork?.open?.();setTimeout(()=>window.PJNetwork?.switchTab?.('admin'),120)};body.querySelector('#pja2Lock').onclick=lockAdmin;body.querySelector('#pja2Logout').onclick=logout;setTimeout(mountNetworkSignOut,0)}
    async function lockAdmin(){try{await sb.rpc('pj_admin_lock')}catch(_){}await refreshState();renderKey()}
    async function logout(){try{await client();try{await sb.rpc('pj_admin_lock')}catch(_){}await sb.auth.signOut();await sb.auth.signInAnonymously()}catch(_){}location.reload()}

    function mountNetworkSignOut(){
      const panel=document.querySelector('#pjnAdmin');
      if(!panel)return;
      if(window.PJAdminPolish||panel.querySelector('.pjap-command')){
        panel.querySelector('#pjnAdminSignOut')?.remove();
        return;
      }
      if(!secure||panel.querySelector('#pjnAdminSignOut'))return;
      const head=panel.querySelector('.pjn-section-head');
      if(!head)return;
      const button=document.createElement('button');
      button.type='button';button.id='pjnAdminSignOut';button.className='pjn-btn secondary';button.textContent='SIGN OUT ADMIN';button.title='Sign out of the permanent owner account';button.onclick=logout;
      head.appendChild(button);
    }
    const networkObserver=new MutationObserver(()=>mountNetworkSignOut());
    networkObserver.observe(document.body,{childList:true,subtree:true});

    document.addEventListener('click',e=>{const tab=e.target.closest('.pjn-tabs [data-tab="admin"]');if(!tab)return;if(!secure){e.preventDefault();e.stopImmediatePropagation();open();return}setTimeout(mountNetworkSignOut,120)},true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))close();if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='a'){e.preventDefault();open()}},true);

    window.PJAdminAuth={open,close,refresh:refreshState,signOut:logout,lock:lockAdmin,get state(){return{signedIn:!!user&&!user.is_anonymous,adminAccount:isAdminAccount,configured,secure,verifiedUntil,lockedUntil,uid:user?.id||null}}};
    try{await refreshState()}catch(err){console.warn('PJ Admin Auth:',err.message)}
  });
})();