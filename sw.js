// PorHacer3 · service worker: la app funciona sin conexión
const CACHE = 'porhacer3-v194';
const ARCHIVOS = [
  './', './index.html', './manifest.json', './estilos.css?v=194', './estilos3.css?v=194',
  './i18n.js?v=194', './iconos.js?v=194', './iconos-home.js?v=194', './mio.js?v=194', './agenda.js?v=194', './tickets.js?v=194', './gastos.js?v=194', './guardar.js?v=194', './aparatos.js?v=194', './pdfvisor.js?v=194', './sitios.js?v=194', './grabar.js?v=194', './estudio.js?v=194', './escribir.js?v=194', './celdas.js?v=194', './documentos.js?v=194', './edicion.js?v=194', './portada.js?v=194', './temas.js?v=194', './db.js?v=194', './firebase-config.js?v=194', './email-config.js?v=194', './nube.js?v=194',
  './correo.js?v=194', './audio.js?v=194', './fiesta.js?v=194', './avisos.js?v=194', './bloc.js?v=194', './listas.js?v=194', './listas.png', './lame.min.js', './html2canvas.min.js', './jspdf.min.js', './pdf6.min.js?v=194', './pdf6.worker.min.js?v=194',
  './fotos.js?v=194', './videos.js?v=194', './voz.js?v=194', './calendario.js?v=194', './ajustes.js?v=194',
  './copias.js?v=194', './seguro.js?v=194', './app.js?v=194',
  './zoom.js?v=194', './pipeta.js?v=194', './purify.min.js', './firebase-app-compat.js', './firebase-auth-compat.js', './firebase-firestore-compat.js', './logo.png', './calculadora.html?v=194', './logo_elibi.jpg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
];
// V19: la librería de Firebase va dentro de la app (carpeta firebase/), así funciona sin internet desde el primer día

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ARCHIVOS.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => k !== CACHE && k.startsWith('porhacer3-') ? caches.delete(k) : null))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  if(new URL(req.url).origin !== location.origin) return;
  if(/\.pdf$/i.test(new URL(req.url).pathname)) return;      // el manual (PDF): directo de internet, sin guardarlo
  // Archivos de la app: primero internet (versión nueva); si no hay o tarda, lo guardado
  e.respondWith(new Promise(ok => {
    let hecho = false;
    const deCache = async () => { const h = await caches.match(req, { ignoreSearch:req.mode === 'navigate' }); if(h) return h; if(req.mode === 'navigate') return (await caches.match('./index.html')) || Response.error(); return null; };
    const t = setTimeout(async () => { if(!hecho){ const h=await deCache(); if(h && !hecho){ hecho=true;ok(h); } } }, 3500);
    fetch(req).then(r => {
      if(r && r.ok && r.type === 'basic'){ const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      if(!hecho){ hecho = true; clearTimeout(t); ok(r); }
    }).catch(() => { if(!hecho){ hecho = true; clearTimeout(t); deCache().then(h=>ok(h||Response.error())); } });
  }));
});
