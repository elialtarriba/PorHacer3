// PorHacer3 · service worker: la app funciona sin conexión
const CACHE = 'porhacer3-v91';
const ARCHIVOS = [
  './', './index.html', './manifest.json', './estilos.css?v=91', './estilos3.css?v=91',
  './iconos.js?v=91', './iconos-home.js?v=91', './mio.js?v=91', './agenda.js?v=91', './tickets.js?v=91', './sitios.js?v=91', './portada.js?v=91', './temas.js?v=91', './db.js?v=91', './firebase-config.js?v=91', './email-config.js?v=91', './nube.js?v=91',
  './correo.js?v=91', './audio.js?v=91', './fiesta.js?v=91', './avisos.js?v=91', './bloc.js?v=91', './listas.js?v=91', './listas.png', './lame.min.js', './html2canvas.min.js', './jspdf.min.js',
  './fotos.js?v=91', './videos.js?v=91', './voz.js?v=91', './calendario.js?v=91', './ajustes.js?v=91',
  './copias.js?v=91', './app.js?v=91',
  './logo.png', './calculadora.html?v=91', './logo_elibi.jpg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
];
// Librería de Firebase: también se guarda para poder abrir la app sin internet
const SDK = ['app','auth','firestore'].map(n => `https://www.gstatic.com/firebasejs/10.14.1/firebase-${n}-compat.js`);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all([
    ...ARCHIVOS.map(u => c.add(u).catch(() => {})),
    ...SDK.map(u => fetch(u, { mode:'cors' }).then(r => r.ok && c.put(u, r)).catch(() => {}))
  ])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => k !== CACHE && k.startsWith('porhacer3-') ? caches.delete(k) : null))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  // Firebase SDK: primero lo guardado
  if(SDK.includes(req.url)){
    e.respondWith(caches.match(req.url).then(h => h || fetch(req).then(r => { const c2 = r.clone(); caches.open(CACHE).then(c => c.put(req.url, c2)); return r; })));
    return;
  }
  if(new URL(req.url).origin !== location.origin) return;
  // Archivos de la app: primero internet (versión nueva); si no hay o tarda, lo guardado
  e.respondWith(new Promise(ok => {
    let hecho = false;
    const deCache = () => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(h => h || caches.match('./index.html'));
    const t = setTimeout(() => { if(!hecho){ hecho = true; ok(deCache()); } }, 3500);
    fetch(req).then(r => {
      if(r && r.ok && r.type === 'basic'){ const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      if(!hecho){ hecho = true; clearTimeout(t); ok(r); }
    }).catch(() => { if(!hecho){ hecho = true; clearTimeout(t); ok(deCache()); } });
  }));
});
