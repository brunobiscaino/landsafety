const CACHE = 'sgoe-pi-v1';
const ASSETS = ['/', '/index.html', '/config.js', '/app.js', '/style.css', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(r => {
        if (r && r.status === 200) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});

self.addEventListener('sync', e => {
  if (e.tag === 'sync-inspections') {
    e.waitUntil(self.clients.matchAll().then(clients =>
      clients.forEach(c => c.postMessage({ type: 'SYNC_NOW' }))
    ));
  }
});
