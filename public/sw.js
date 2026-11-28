const CACHE="pri-anime-shell-v1";
const SHELL=["/","/manifest.json","/prianime-logo.jpg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{const req=event.request;if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;const url=new URL(req.url);if(url.pathname.startsWith("/api/")||url.pathname.includes("/watch")||url.pathname.includes("/embed"))return;if(req.mode==="navigate"){event.respondWith(fetch(req).catch(()=>caches.match("/")));return;}event.respondWith(fetch(req).then(res=>{if(res.ok&& (url.pathname.endsWith(".js")||url.pathname.endsWith(".css")||url.pathname.endsWith(".woff2"))) {const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}return res;}).catch(()=>caches.match(req)));});
