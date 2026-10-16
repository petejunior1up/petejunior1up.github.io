/* PJ // DOSSIER LIVE PREVIEW — real deployed project, loaded only on demand */
(()=>{
  if(window.PJDossierLivePreview)return;
  const $=(s,r=document)=>r.querySelector(s);
  const style=document.createElement('style');
  style.dataset.pjDossierLivePreview='1';
  style.textContent=`
    .pjdlp{margin-top:10px;border:1px solid #242d33;background:#080b0d}
    .pjdlp>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px;padding:0 12px;cursor:pointer;color:#aeb8be;font:900 .35rem var(--mono,monospace);letter-spacing:.7px}
    .pjdlp>summary::-webkit-details-marker{display:none}.pjdlp>summary:after{content:'+';color:var(--pj-accent,#ff2638);font-size:.8rem}.pjdlp[open]>summary:after{content:'−'}
    .pjdlp-note{padding:0 12px 10px;color:#606c74;font:500 .6rem/1.5 system-ui,sans-serif}
    .pjdlp-frame{position:relative;min-height:440px;border-top:1px solid #242d33;background:#050607}.pjdlp-frame iframe{display:block;width:100%;height:520px;border:0;background:#050607}
    .pjdlp-loading{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;color:#5f6b73;font:900 .34rem var(--mono,monospace);letter-spacing:.7px}.pjdlp-frame.loaded .pjdlp-loading{display:none}
    @media(max-width:700px){.pjdlp-frame{min-height:360px}.pjdlp-frame iframe{height:430px}}
  `;
  document.head.appendChild(style);

  function title(){return $('.pjd-overlay.open .pjd-hero-copy h1')?.textContent.trim()||''}
  function liveUrl(){return [...document.querySelectorAll('.pjd-overlay.open .pjd-actions a')].find(a=>/OPEN LIVE PROJECT/i.test(a.textContent))?.href||''}
  function mount(){
    const meta=$('.pjd-overlay.open .pjd-meta');if(!meta)return;
    const parent=meta.parentElement;if(!parent)return;
    parent.querySelector('.pjdlp')?.remove();
    const url=liveUrl();if(!url)return;
    const box=document.createElement('details');box.className='pjdlp';box.innerHTML=`<summary>LIVE PROJECT PREVIEW <span>REAL DEPLOYED BUILD</span></summary><div class="pjdlp-note">Loaded only when opened. This is the actual live project, not a mock screenshot.</div><div class="pjdlp-frame"><div class="pjdlp-loading">LOADING LIVE BUILD…</div></div>`;
    const anchor=parent.querySelector('.pjhub-dossier-facts')||meta;
    anchor.insertAdjacentElement('afterend',box);
    box.addEventListener('toggle',()=>{
      if(!box.open||box.dataset.loaded==='1')return;
      box.dataset.loaded='1';
      const frame=box.querySelector('.pjdlp-frame'),iframe=document.createElement('iframe');
      iframe.title=`${title()||'Project'} live preview`;iframe.loading='lazy';iframe.src=url;iframe.referrerPolicy='strict-origin-when-cross-origin';
      iframe.addEventListener('load',()=>frame.classList.add('loaded'),{once:true});frame.appendChild(iframe);
    });
  }
  function schedule(){setTimeout(mount,60)}
  document.addEventListener('click',e=>{if(e.target.closest('[data-pjd-open],#pjdPrev,#pjdNext'))schedule()},true);
  window.addEventListener('hashchange',()=>{if(/^#project=/.test(location.hash))setTimeout(mount,180)});
  if(/^#project=/.test(location.hash)){let tries=0;const t=setInterval(()=>{mount();if($('.pjdlp')||++tries>30)clearInterval(t)},100)}
  window.PJDossierLivePreview={refresh:mount};
})();