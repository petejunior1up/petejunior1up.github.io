/* PJ EXPERIENCE ENGINE */
(()=>{const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();ready(()=>{
const themes={red:'RED CORE',cyan:'CYAN PROTOCOL',violet:'VIOLET VOID',mono:'MONO STEALTH'};let saved='red';try{saved=localStorage.getItem('pjTheme')||'red'}catch(_){};if(!themes[saved])saved='red';
const applyTheme=t=>{document.documentElement.dataset.pjTheme=t;document.querySelectorAll('.pjx-theme-btn').forEach(b=>b.classList.toggle('active',b.dataset.theme===t));try{localStorage.setItem('pjTheme',t)}catch(_){};window.dispatchEvent(new CustomEvent('pjthemechange',{detail:{theme:t}}))};
const dock=document.createElement('div');dock.className='pjx-theme-dock';dock.setAttribute('aria-label','Theme engine');dock.innerHTML=Object.entries(themes).map(([k,v])=>`<button class="pjx-theme-btn" type="button" data-theme="${k}" title="${v}" aria-label="${v}" style="--swatch:${k==='red'?'#ff1e2d':k==='cyan'?'#63f5ff':k==='violet'?'#a77cff':'#e8edf2'}"><i></i></button>`).join('');document.body.appendChild(dock);dock.addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(b)applyTheme(b.dataset.theme)});applyTheme(saved);
const toast=document.createElement('div');toast.className='pjx-toast';document.body.appendChild(toast);let toastTimer;const notify=t=>{toast.textContent=t;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1700)};
const share=async(title,url)=>{try{if(navigator.share){await navigator.share({title,text:`Check out ${title} by Pete Junior`,url});return}await navigator.clipboard.writeText(url);notify('LINK COPIED // READY TO TRANSMIT')}catch(e){if(e?.name!=='AbortError')notify('SHARE CANCELLED')}};
document.querySelectorAll('.project-card:not(.coming-soon)').forEach(card=>{const title=card.querySelector('h3')?.textContent?.trim()||'Project';const live=card.querySelector('.project-button.primary')?.href||location.href;const actions=card.querySelector('.project-actions');if(!actions)return;const wrap=document.createElement('div');wrap.className='pjx-actions';const b=document.createElement('button');b.type='button';b.className='pjx-share';b.textContent='SHARE PROJECT ↗';b.addEventListener('click',()=>share(title,live));wrap.appendChild(b);actions.insertAdjacentElement('afterend',wrap)});
const modal=document.createElement('div');modal.className='pjx-modal';modal.innerHTML=`<div class="pjx-modal-card" role="dialog" aria-modal="true" aria-label="Support my work"><div class="pjx-modal-top"><span>SUPPORT // PJ CORE</span><button class="pjx-close" type="button" aria-label="Close">×</button></div><h3>SUPPORT MY WORK.</h3><p>If something I build helps or inspires you, you can support future experiments and projects here.</p><div class="pjx-support-note">PAYMENT DETAILS // COMING NEXT<br>No payment information has been published yet.</div></div>`;document.body.appendChild(modal);const close=()=>modal.classList.remove('open');modal.querySelector('.pjx-close').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
const contact=document.querySelector('#contact .contact-links');if(contact){const b=document.createElement('button');b.type='button';b.className='pjx-support-btn';b.innerHTML='💚 SUPPORT MY WORK <span>↗</span>';b.onclick=()=>modal.classList.add('open');contact.appendChild(b)};

/* PJ Soundtrack — official Spotify Embed based on the connected playlist. */
const spotifyUri='spotify:playlist:37i9dQZF1F5p3rmiWPIYgZ';
const spotifyUrl='https://open.spotify.com/playlist/37i9dQZF1F5p3rmiWPIYgZ?utm_source=openai&utm_medium=chatgpt&request_id=d32885b6-fcba-4db9-97ef-3d8805eff8e3';
const skills=document.getElementById('skills');
if(skills&&!document.getElementById('soundtrack')){
  const section=document.createElement('section');
  section.id='soundtrack';
  section.className='pjx-soundtrack section';
  section.innerHTML=`
    <div class="pjx-soundtrack-head">
      <div>
        <div class="section-label">03.9 // PJ SOUNDTRACK</div>
        <h2>MUSIC FOR THE <span>SYSTEM.</span></h2>
      </div>
      <p>My Spotify rotation, built into the portfolio. Hit play when you want the site to have a soundtrack.</p>
    </div>
    <div class="pjx-spotify-card">
      <div class="pjx-spotify-meta">
        <img src="https://misc.scdn.co/liked-songs/liked-songs-300.png" alt="" loading="lazy">
        <div><small>SPOTIFY // CONNECTED</small><strong>Liked Songs</strong><span>Playback starts when you press play.</span></div>
      </div>
      <div class="pjx-spotify-embed" id="pjx-spotify-embed"><span>LOADING SPOTIFY PLAYER...</span></div>
      <a class="pjx-spotify-open" href="${spotifyUrl}" target="_blank" rel="noopener noreferrer">OPEN IN SPOTIFY ↗</a>
    </div>`;
  skills.insertAdjacentElement('beforebegin',section);

  const embed=section.querySelector('#pjx-spotify-embed');
  const previousReady=window.onSpotifyIframeApiReady;
  window.onSpotifyIframeApiReady=IFrameAPI=>{
    if(typeof previousReady==='function'){try{previousReady(IFrameAPI)}catch(_){}}
    try{
      embed.textContent='';
      IFrameAPI.createController(embed,{uri:spotifyUri,width:'100%',height:152},()=>{});
    }catch(_){
      embed.innerHTML='<span>PLAYER UNAVAILABLE // OPEN IN SPOTIFY</span>';
    }
  };
  if(!document.querySelector('script[data-pjx-spotify]')){
    const api=document.createElement('script');
    api.src='https://open.spotify.com/embed/iframe-api/v1';
    api.async=true;
    api.dataset.pjxSpotify='1';
    document.head.appendChild(api);
  }
  window.setTimeout(()=>{if(embed&&!embed.querySelector('iframe')&&!embed.textContent.includes('UNAVAILABLE'))embed.innerHTML='<span>PLAYER TAKING TOO LONG // OPEN IN SPOTIFY</span>'},7000);
}

/* Real cinematic hacker video background. */
if(!document.querySelector('.pjx-bg-motion')){
  const bg=document.createElement('div');
  bg.className='pjx-bg-motion';
  bg.setAttribute('aria-hidden','true');
  bg.innerHTML='<video class="pjx-bg-video" autoplay muted loop playsinline preload="metadata"><source src="Hacker_PJ_Red.mp4" type="video/mp4"></video><div class="pjx-bg-tint"></div><div class="pjx-bg-vignette"></div>';
  document.body.prepend(bg);
  const video=bg.querySelector('.pjx-bg-video');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){video.pause();video.removeAttribute('autoplay')}
  else{const p=video.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}
  video.addEventListener('error',()=>bg.classList.add('video-unavailable'));
}
});})();