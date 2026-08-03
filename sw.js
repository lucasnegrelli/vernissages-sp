/* v3 — HTML e dados sempre da rede quando houver conexão (network-first),
   cache apenas como reserva offline. Trocar o número do cache invalida o antigo. */
const C='vsp-v3';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./dados.js','./manifest.webmanifest']).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request,{cache:'no-cache'}).then(r=>{
      const cl=r.clone(); caches.open(C).then(c=>c.put(e.request,cl)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(e.request))
  );
});
