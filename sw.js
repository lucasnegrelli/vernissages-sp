/* AUTODESTRUIÇÃO.
   Este arquivo substitui o service worker anterior apenas para desinstalá-lo
   dos aparelhos que já o registraram. Ele não intercepta nenhuma requisição:
   apaga os caches, remove o próprio registro e sai de cena.
   O site passou a ser um site comum, sem PWA. */
self.addEventListener('install',()=>{ self.skipWaiting(); });

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    try{
      const chaves=await caches.keys();
      await Promise.all(chaves.map(k=>caches.delete(k)));
    }catch(_){}
    try{ await self.registration.unregister(); }catch(_){}
  })());
});
/* sem listener de 'fetch': as requisições vão direto para a rede */
