/* v4 — correção crítica:
   a versão anterior podia devolver "undefined" quando a rede falhava e o item
   não estava em cache, o que derruba a página inteira (tela em branco no celular).
   Agora: só trata o próprio domínio, nunca devolve resposta vazia e tem
   página de reserva para navegação offline. */
const C='vsp-v4';
const ESSENCIAIS=['./','./index.html','./dados.js','./manifest.webmanifest'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(ESSENCIAIS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))
      .then(()=>self.clients.claim())
  );
});

/* permite desligar o service worker pela página, em caso de emergência */
self.addEventListener('message',e=>{
  if(e.data==='desligar'){
    self.registration.unregister().then(()=>caches.keys().then(k=>Promise.all(k.map(x=>caches.delete(x)))));
  }
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  let url;
  try{url=new URL(req.url);}catch(_){return;}
  /* fontes, tiles do mapa e imagens de galerias vão direto para a rede:
     interceptá-los só cria pontos de falha */
  if(url.origin!==self.location.origin)return;

  e.respondWith((async()=>{
    try{
      const r=await fetch(req);
      if(r&&r.ok){const cl=r.clone();caches.open(C).then(c=>c.put(req,cl)).catch(()=>{});}
      return r;
    }catch(_){
      const emCache=await caches.match(req);
      if(emCache)return emCache;
      if(req.mode==='navigate'){
        const home=await caches.match('./index.html')||await caches.match('./');
        if(home)return home;
      }
      return new Response('',{status:504,statusText:'offline'});
    }
  })());
});
