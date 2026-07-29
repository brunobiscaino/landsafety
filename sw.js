/* LandSafety ISP — Service Worker
   IMPORTANTE: sempre que fizer deploy de mudança relevante em index.html/extintor.html,
   incrementar CACHE_VERSION (v1 -> v2 -> ...) para forçar atualização nos dispositivos
   dos inspetores em campo. Sem isso, o app pode ficar "preso" numa versão antiga. */

const CACHE_VERSION = 'v2';
const CACHE_NAME = 'landsafety-shell-' + CACHE_VERSION;

const APP_SHELL = [
  '/landsafety/',
  '/landsafety/index.html',
  '/landsafety/extintor.html',
  '/landsafety/manifest.json',
  '/landsafety/icon-192.png',
  '/landsafety/icon-512.png'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function (err) {
        console.warn('[SW] Falha ao pré-cachear app shell:', err);
      });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key.startsWith('landsafety-shell-') && key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);

  /* Nunca interceptar chamadas ao Supabase — dados sempre direto da rede.
     O app já tem seu próprio fallback offline via localStorage. */
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  /* Só tratar requisições GET do próprio app (HTML/CSS/JS/ícones) */
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      const networkFetch = fetch(event.request)
        .then(function (response) {
          if (response && response.status === 200 && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
          }
          return response;
        })
        .catch(function () {
          return cached; // offline: usa o que tiver em cache
        });

      /* Cache-first para app shell: resposta imediata, atualiza em segundo plano */
      return cached || networkFetch;
    })
  );
});
