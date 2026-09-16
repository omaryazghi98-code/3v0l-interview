const CACHE = '3v0l-interview-v1';
const APP_SHELL = [
  './',
  './index.html',
  './styles-v2.css',
  './styles-v3.css',
  './responsive.css',
  './copilot.css',
  './data/content.js',
  './copilot-reference-accuracy.js',
  './data/phonecalls.js',
  './runtime-fixes.js',
  './app-v3.js',
  './boot-fixes.js',
  './nav-bridge.js',
  './copilot-ui.js',
  './copilot-reference-fix.js',
  './copilot-call-suggestion.js',
  './remote-bridge.js',
  './nexq-transcript-bridge.js',
  './lan-audio-transcript.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(req)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
  );
});
