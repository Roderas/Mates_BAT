/* Atomic application shell cache. Version changes are activated by user confirmation. */
const VERSION='2.0.0';
const SCOPE_PATH=new URL(self.registration.scope).pathname;
const PREFIX='mates-batx-'+encodeURIComponent(SCOPE_PATH)+'-';
const CACHE=PREFIX+VERSION;
const ASSETS=['./','./index.html','./styles.css','./manifest.json','./ANALISI_PAU_2024_2026.html',
 './js/app.mjs','./js/engine.mjs','./js/solver.mjs','./js/generator.mjs','./js/worker.mjs',
 './data/topics.json','./data/exams.json','./data/plans.json','./data/presets.json',
 './docs/curriculum-matematiques.pdf','./docs/curriculum-socials.pdf',
 './icons/icon-32.png','./icons/icon-96.png','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png',
 './icons/maskable-192.png','./icons/maskable-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 // Bypass HTTP cache so the new cache contains a coherent published version.
 await cache.addAll(ASSETS.map(p=>new Request(new URL(p,self.registration.scope),{cache:'reload'})));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 for(const name of names){
  if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
  // The prior release used this constant name. Only remove it if it contains THIS app's URL.
  if(name==='mates-docent-v1'){
   const old=await caches.open(name);const matches=await old.match(new URL('./index.html',self.registration.scope).href);
   if(matches)await caches.delete(name);
  }
 }
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(SCOPE_PATH))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(req,{ignoreSearch:false});
  if(cached)return cached;
  try{return await fetch(req);}catch(e){
   if(req.mode==='navigate')return(await cache.match(new URL('./index.html',self.registration.scope).href))||Response.error();
   return Response.error();
  }
 })());
});
