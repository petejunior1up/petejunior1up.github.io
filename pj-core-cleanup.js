/* PJ CORE // CLEANUP — stable loader + lightweight performance guards */
(()=>{
  if(window.PJCoreCleanup)return;
  const start=()=>{
    const style=document.createElement('style');
    style.dataset.pjCoreCleanup='1';
    style.textContent=`
      html[data-pj-hub-ready="1"] .pjcc-btn{display:none!important}
      html[data-pj-performance="lite"] #pjhud-canvas,
      html[data-pj-performance="lite"] .pjhud-scan{display:none!important}
      html[data-pj-performance="lite"] .pjhud-core{animation:none!important}
      html[data-pj-performance="lite"] .pjhud{filter:none!important}
    `;
    document.head.appendChild(style);

    if(!document.querySelector('link[data-pj-core-v5]')){
      const link=document.createElement('link');link.rel='stylesheet';link.href='pj-core-v5.css?v=20261018-2';link.dataset.pjCoreV5='1';document.head.appendChild(link);
    }
    if(!document.querySelector('script[data-pj-core-v5]')){
      const script=document.createElement('script');script.src='pj-core-v5.js?v=20261018-1';script.defer=true;script.dataset.pjCoreV5='1';document.head.appendChild(script);
    }

    const openHub=()=>{
      const palette=document.querySelector('.pjcore-palette');if(palette){palette.classList.remove('open');palette.setAttribute('aria-hidden','true')}
      document.querySelector('.pjhub-launch')?.click();
    };
    const isLegacyCommandRow=el=>el?.closest?.('.pjcore-command')?.querySelector('span')?.textContent?.trim()==='Open Command Center';

    /* The OS palette owns Ctrl/Cmd+K. Capture phase keeps the detached legacy handler inert. */
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
        if(!window.PJCoreOS?.openPalette)return;
        e.preventDefault();e.stopImmediatePropagation();window.PJCoreOS.openPalette();return;
      }
      if(e.key==='Enter'&&document.activeElement?.id==='pjcoreCommandInput'){
        const active=document.querySelector('.pjcore-command.active');
        if(isLegacyCommandRow(active)){e.preventDefault();e.stopImmediatePropagation();openHub()}
      }
    },true);
    document.addEventListener('click',e=>{
      if(!isLegacyCommandRow(e.target))return;
      e.preventDefault();e.stopImmediatePropagation();openHub();
    },true);

    /* Force the current worker URL so stale v4 caches are replaced promptly. */
    if('serviceWorker'in navigator){navigator.serviceWorker.register('service-worker.js?v=20261018-2',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{})}

    window.PJCoreCleanup={ready:true,version:5};
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();