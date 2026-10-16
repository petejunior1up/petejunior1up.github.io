/* PJ CORE // CLEANUP — conflict resolution + lightweight performance guards */
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

    /* The OS palette owns Ctrl/Cmd+K. Capture phase prevents the legacy Command Center handler from also opening. */
    document.addEventListener('keydown',e=>{
      if(!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=='k')return;
      if(!window.PJCoreOS?.openPalette)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      window.PJCoreOS.openPalette();
    },true);

    window.PJCoreCleanup={ready:true};
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();