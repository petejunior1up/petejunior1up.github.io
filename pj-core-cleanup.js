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
      const link=document.createElement('link');link.rel='stylesheet';link.href='pj-core-v5.css?v=20261018-1';link.dataset.pjCoreV5='1';document.head.appendChild(link);
    }
    if(!document.querySelector('script[data-pj-core-v5]')){
      const script=document.createElement('script');script.src='pj-core-v5.js?v=20261018-1';script.defer=true;script.dataset.pjCoreV5='1';document.head.appendChild(script);
    }

    /* The OS palette owns Ctrl/Cmd+K. Capture phase keeps the detached legacy handler inert. */
    document.addEventListener('keydown',e=>{
      if(!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=='k')return;
      if(!window.PJCoreOS?.openPalette)return;
      e.preventDefault();e.stopImmediatePropagation();window.PJCoreOS.openPalette();
    },true);

    window.PJCoreCleanup={ready:true,version:5};
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();