const CACHE='pj-network-v4-20261016-3';
const CORE=['/','/index.html','/404.html','/style.css','/script.js','/experience-engine.js','/pj-core-os.js','/pj-core-hub.css','/pj-core-hub.js','/pj-project-dossier.css','/pj-project-dossier.js','/pj-network-icon.svg','/manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pj-network-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(u.origin!==location.origin||u.pathname.startsWith('/rest/')||u.pathname.startsWith('/auth/'))return;
  event.respondWith(fetch(req).then(res=>{
    if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{})}
    return res;
  }).catch(async()=>{
    const cached=await caches.match(req);if(cached)return cached;
    if(req.mode==='navigate')return (await caches.match('/index.html'))||Response.error();
    return Response.error();
  }));
});