// PorHacer3 · service worker: la app funciona sin conexión
const CACHE = 'porhacer3-v193';
const ARCHIVOS = [
  './', './index.html', './manifest.json', './estilos.css?v=193', './estilos3.css?v=193',
  './i18n.js?v=193', './iconos.js?v=193', './iconos-home.js?v=193', './mio.js?v=193', './agenda.js?v=193', './tickets.js?v=193', './gastos.js?v=193', './guardar.js?v=193', './aparatos.js?v=193', './pdfvisor.js?v=193', './sitios.js?v=193', './grabar.js?v=193', './estudio.js?v=193', './escribir.js?v=193', './celdas.js?v=193', './documentos.js?v=193', './edicion.js?v=193', './portada.js?v=193', './temas.js?v=193', './db.js?v=193', './firebase-config.js?v=193', './email-config.js?v=193', './nube.js?v=193',
  './correo.js?v=193', './audio.js?v=193', './fiesta.js?v=193', './avisos.js?v=193', './bloc.js?v=193', './listas.js?v=193', './listas.png', './lame.min.js', './html2canvas.min.js', './jspdf.min.js', './pdf6.min.js?v=193', './pdf6.worker.min.js?v=193',
  './fotos.js?v=193', './videos.js?v=193', './voz.js?v=193', './calendario.js?v=193', './ajustes.js?v=193',
  './copias.js?v=193', './seguro.js?v=193', './app.js?v=193',
  './zoom.js?v=193', './pipeta.js?v=193', './purify.min.js', './firebase-app-compat.js', './firebase-auth-compat.js', './firebase-firestore-compat.js', './logo.png', './calculadora.html?v=193', './logo_elibi.jpg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
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
