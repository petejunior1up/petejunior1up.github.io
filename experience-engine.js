/* PJ EXPERIENCE ENGINE */
(()=>{const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();ready(()=>{
const themes={red:'RED CORE',cyan:'CYAN PROTOCOL',violet:'VIOLET VOID',mono:'MONO STEALTH'};let saved='red';try{saved=localStorage.getItem('pjTheme')||'red'}catch(_){};if(!themes[saved])saved='red';
const applyTheme=t=>{document.documentElement.dataset.pjTheme=t;document.querySelectorAll('.pjx-theme-btn').forEach(b=>b.classList.toggle('active',b.dataset.theme===t));try{localStorage.setItem('pjTheme',t)}catch(_){};window.dispatchEvent(new CustomEvent('pjthemechange',{detail:{theme:t}}))};
const dock=document.createElement('div');dock.className='pjx-theme-dock';dock.setAttribute('aria-label','Theme engine');dock.innerHTML=Object.entries(themes).map(([k,v])=>`<button class="pjx-theme-btn" type="button" data-theme="${k}" title="${v}" aria-label="${v}" style="--swatch:${k==='red'?'#ff1e2d':k==='cyan'?'#63f5ff':k==='violet'?'#a77cff':'#e8edf2'}"><i></i></button>`).join('');document.body.appendChild(dock);dock.addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(b)applyTheme(b.dataset.theme)});applyTheme(saved);
const toast=document.createElement('div');toast.className='pjx-toast';document.body.appendChild(toast);let toastTimer;const notify=t=>{toast.textContent=t;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1700)};
const share=async(title,url)=>{try{if(navigator.share){await navigator.share({title,text:`Check out ${title} by Pete Junior`,url});return}await navigator.clipboard.writeText(url);notify('LINK COPIED // READY TO TRANSMIT')}catch(e){if(e?.name!=='AbortError')notify('SHARE CANCELLED')}};
document.querySelectorAll('.project-card:not(.coming-soon)').forEach(card=>{const title=card.querySelector('h3')?.textContent?.trim()||'Project';const live=card.querySelector('.project-button.primary')?.href||location.href;const actions=card.querySelector('.project-actions');if(!actions)return;const wrap=document.createElement('div');wrap.className='pjx-actions';const b=document.createElement('button');b.type='button';b.className='pjx-share';b.textContent='SHARE PROJECT ↗';b.addEventListener('click',()=>share(title,live));wrap.appendChild(b);actions.insertAdjacentElement('afterend',wrap)});
const modal=document.createElement('div');modal.className='pjx-modal';modal.innerHTML=`<div class="pjx-modal-card" role="dialog" aria-modal="true" aria-label="Support my work"><div class="pjx-modal-top"><span>SUPPORT // PJ CORE</span><button class="pjx-close" type="button" aria-label="Close">×</button></div><h3>SUPPORT MY WORK.</h3><p>If something I build helps or inspires you, you can support future experiments and projects here.</p><div class="pjx-support-note"><strong style="color:var(--pj-accent);display:block;margin-bottom:6px">MTN MOMO // UGANDA</strong><span style="color:#dce2e6;font-size:.9rem;letter-spacing:1px">+256 789 075 695</span><br><small style="color:#69737c">Send support via MTN Mobile Money.</small></div></div>`;document.body.appendChild(modal);const close=()=>modal.classList.remove('open');modal.querySelector('.pjx-close').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
const contact=document.querySelector('#contact .contact-links');if(contact){const b=document.createElement('button');b.type='button';b.className='pjx-support-btn';b.innerHTML='💚 SUPPORT MY WORK <span>↗</span>';b.onclick=()=>modal.classList.add('open');contact.appendChild(b)};

/* Native PJ soundtrack: original cyber loops generated in-browser. */
if(!document.querySelector('link[data-pj-audio]')){const link=document.createElement('link');link.rel='stylesheet';link.href='pj-audio.css?v=20261007-1';link.dataset.pjAudio='1';document.head.appendChild(link)}
if(!document.querySelector('script[data-pj-audio]')){const script=document.createElement('script');script.src='pj-audio.js?v=20261007-2';script.defer=true;script.dataset.pjAudio='1';document.head.appendChild(script)}

/* Hidden XYPHER // 404 alternate experience. */
if(!document.querySelector('link[data-xy404]')){const link=document.createElement('link');link.rel='stylesheet';link.href='xypher-mode.css?v=20261007-1';link.dataset.xy404='1';document.head.appendChild(link)}
if(!document.querySelector('script[data-xy404]')){const script=document.createElement('script');script.src='xypher-mode.js?v=20261007-1';script.defer=true;script.dataset.xy404='1';document.head.appendChild(script)}

/* Anonymous visitor identity + project hologram inspector. */
if(!document.querySelector('link[data-pj-identity-holo]')){const link=document.createElement('link');link.rel='stylesheet';link.href='pj-identity-hologram.css?v=20261007-1';link.dataset.pjIdentityHolo='1';document.head.appendChild(link)}
if(!document.querySelector('script[data-pj-identity-holo]')){const script=document.createElement('script');script.src='pj-identity-hologram.js?v=20261007-1';script.defer=true;script.dataset.pjIdentityHolo='1';document.head.appendChild(script)}

/* PJ CORE // AI — conversational local portfolio intelligence. */
if(!document.querySelector('link[data-pj-core-ai]')){const link=document.createElement('link');link.rel='stylesheet';link.href='pj-core-ai.css?v=20261009-1';link.dataset.pjCoreAi='1';document.head.appendChild(link)}
if(!document.querySelector('script[data-pj-core-ai]')){const script=document.createElement('script');script.src='pj-core-ai.js?v=20261009-1';script.defer=true;script.dataset.pjCoreAi='1';document.head.appendChild(script)}

/* PJ // LOUNGE + SOCIAL + NETWORK v4 + phone-free secure ADMIN auth. */
if(!document.querySelector('link[data-pj-lounge]')){const link=document.createElement('link');link.rel='stylesheet';link.href='pj-lounge.css?v=20261012-1';link.dataset.pjLounge='1';document.head.appendChild(link)}
if(!document.querySelector('link[data-pj-lounge-social]')){const link=document.createElement('link');link.rel='stylesheet';link.href='pj-lounge-social.css?v=20261012-1';link.dataset.pjLoungeSocial='1';document.head.appendChild(link)}
if(!document.querySelector('link[data-pj-social-hub]')){const link=document.createElement('link');link.rel='stylesheet';link.href='pj-social-hub.css?v=20261012-1';link.dataset.pjSocialHub='1';document.head.appendChild(link)}
if(!document.querySelector('link[data-pj-network-v4]')){const link=document.createElement('link');link.rel='stylesheet';link.href='pj-network-v4.css?v=20261013-1';link.dataset.pjNetworkV4='1';document.head.appendChild(link)}
if(!document.querySelector('link[data-pj-admin-auth-v2]')){const link=document.createElement('link');link.rel='stylesheet';link.href='pj-admin-auth-v2.css?v=20261013-1';link.dataset.pjAdminAuthV2='1';document.head.appendChild(link)}
const loadLounge=()=>{if(!document.querySelector('script[data-pj-lounge]')){const script=document.createElement('script');script.src='pj-lounge.js?v=20261012-3';script.defer=true;script.dataset.pjLounge='1';document.head.appendChild(script)}};
const loadSocial=()=>{if(!document.querySelector('script[data-pj-social-hub]')){const script=document.createElement('script');script.src='pj-social-hub.js?v=20261012-1';script.defer=true;script.dataset.pjSocialHub='1';document.head.appendChild(script)}};
const loadNetwork=()=>{if(!document.querySelector('script[data-pj-network-v4]')){const script=document.createElement('script');script.src='pj-network-v4.js?v=20261013-1';script.defer=true;script.dataset.pjNetworkV4='1';document.head.appendChild(script)}};
const loadAdminAuth=()=>{if(!document.querySelector('script[data-pj-admin-auth-v2]')){const script=document.createElement('script');script.src='pj-admin-auth-v2.js?v=20261013-3';script.defer=true;script.dataset.pjAdminAuthV2='1';document.head.appendChild(script)}};
const loadCommunity=()=>{loadLounge();loadSocial();loadNetwork();loadAdminAuth()};
if(window.PJ_SUPABASE_CONFIG){loadCommunity()}else if(!document.querySelector('script[data-pj-supabase-config]')){const cfg=document.createElement('script');cfg.src='supabase-config.js?v=20261013-3';cfg.defer=true;cfg.dataset.pjSupabaseConfig='1';cfg.addEventListener('load',loadCommunity,{once:true});cfg.addEventListener('error',loadCommunity,{once:true});document.head.appendChild(cfg)}else{const cfg=document.querySelector('script[data-pj-supabase-config]');cfg.addEventListener('load',loadCommunity,{once:true});setTimeout(()=>{if(window.PJ_SUPABASE_CONFIG)loadCommunity()},0)}

/* Real cinematic hacker video background. */
if(!document.querySelector('.pjx-bg-motion')){
  const bg=document.createElement('div');bg.className='pjx-bg-motion';bg.setAttribute('aria-hidden','true');
  bg.innerHTML='<video class="pjx-bg-video" autoplay muted loop playsinline preload="metadata"><source src="Hacker_PJ_Red.mp4" type="video/mp4"></video><div class="pjx-bg-tint"></div><div class="pjx-bg-vignette"></div>';
  document.body.prepend(bg);const video=bg.querySelector('.pjx-bg-video');const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){video.pause();video.removeAttribute('autoplay')}else{const p=video.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}
  video.addEventListener('error',()=>bg.classList.add('video-unavailable'));
}
});})();