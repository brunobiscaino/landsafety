const CACHE='landsafety-v4';
const ASSETS=['/landsafety/','/landsafety/index.html'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting();
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});

self.addEventListener('fetch',function(e){
  var url=e.request.url;
  /* Supabase e fonts: sempre network */
  if(url.includes('supabase.co')||url.includes('googleapis')||url.includes('gstatic')){return;}
  if(e.request.method!=='GET')return;
  /* Cache first para o app */
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var network=fetch(e.request).then(function(r){
        if(r&&r.status===200){
          var clone=r.clone();
          caches.open(CACHE).then(function(c){c.put(e.request,clone);});
        }
        return r;
      }).catch(function(){return cached;});
      return cached||network;
    })
  );
});
