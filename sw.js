// PorHacer3 · service worker: la app funciona sin conexión
const CACHE = 'porhacer3-v192';
const ARCHIVOS = [
  './', './index.html', './manifest.json', './estilos.css?v=192', './estilos3.css?v=192',
  './i18n.js?v=192', './iconos.js?v=192', './iconos-home.js?v=192', './mio.js?v=192', './agenda.js?v=192', './tickets.js?v=192', './gastos.js?v=192', './guardar.js?v=192', './aparatos.js?v=192', './pdfvisor.js?v=192', './sitios.js?v=192', './grabar.js?v=192', './estudio.js?v=192', './escribir.js?v=192', './celdas.js?v=192', './documentos.js?v=192', './edicion.js?v=192', './portada.js?v=192', './temas.js?v=192', './db.js?v=192', './firebase-config.js?v=192', './email-config.js?v=192', './nube.js?v=192',
  './correo.js?v=192', './audio.js?v=192', './fiesta.js?v=192', './avisos.js?v=192', './bloc.js?v=192', './listas.js?v=192', './listas.png', './lame.min.js', './html2canvas.min.js', './jspdf.min.js', './pdf6.min.js?v=192', './pdf6.worker.min.js?v=192',
  './fotos.js?v=192', './videos.js?v=192', './voz.js?v=192', './calendario.js?v=192', './ajustes.js?v=192',
  './copias.js?v=192', './seguro.js?v=192', './app.js?v=192',
  './zoom.js?v=192', './pipeta.js?v=192', './purify.min.js', './firebase-app-compat.js', './firebase-auth-compat.js', './firebase-firestore-compat.js', './logo.png', './calculadora.html?v=192', './logo_elibi.jpg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
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
