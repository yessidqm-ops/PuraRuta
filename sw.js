const V='pura-ruta-v5';
const BASE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* La página: primero la red (si tarda más de 3 s, la copia guardada). Lo demás: copia y se refresca atrás. */
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||r.url.includes('.supabase.co')||r.url.includes('?v='))return;
  const pag=r.mode==='navigate';
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true})||(pag?await c.match('index.html'):null);
    const net=fetch(r,pag?{cache:'no-cache'}:undefined).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(pag?'index.html':r,res.clone());return res}).catch(()=>null);
    if(pag){const t=new Promise(ok=>setTimeout(()=>ok(null),3000));const res=await Promise.race([net,t]);if(res)return res;e.waitUntil(net);return hit||(await net)||Response.error()}
    if(hit){e.waitUntil(net);return hit}
    return (await net)||Response.error()}))});
