// Service worker: deja la app disponible sin conexión (la calculadora funciona offline;
// el mercado y los datos requieren internet).
const CACHE = 'semaforo-p2p-v9';
const ARCHIVOS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Nunca cachear Supabase ni Binance: siempre red.
  if (url.hostname.includes('supabase') || url.hostname.includes('binance')) return;
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
