// PorHacer3 · service worker: la app funciona sin conexión
const CACHE = 'porhacer3-v188';
const ARCHIVOS = [
  './', './index.html', './manifest.json', './estilos.css?v=188', './estilos3.css?v=188',
  './iconos.js?v=188', './iconos-home.js?v=188', './mio.js?v=188', './agenda.js?v=188', './tickets.js?v=188', './gastos.js?v=188', './guardar.js?v=188', './aparatos.js?v=188', './pdfvisor.js?v=188', './sitios.js?v=188', './grabar.js?v=188', './estudio.js?v=188', './escribir.js?v=188', './celdas.js?v=188', './documentos.js?v=188', './edicion.js?v=188', './portada.js?v=188', './temas.js?v=188', './db.js?v=188', './firebase-config.js?v=188', './email-config.js?v=188', './nube.js?v=188',
  './correo.js?v=188', './audio.js?v=188', './fiesta.js?v=188', './avisos.js?v=188', './bloc.js?v=188', './listas.js?v=188', './listas.png', './lame.min.js', './html2canvas.min.js', './jspdf.min.js', './pdf6.min.js?v=188', './pdf6.worker.min.js?v=188',
  './fotos.js?v=188', './videos.js?v=188', './voz.js?v=188', './calendario.js?v=188', './ajustes.js?v=188',
  './copias.js?v=188', './app.js?v=188',
  './zoom.js?v=188', './pipeta.js?v=188', './purify.min.js', './firebase-app-compat.js', './firebase-auth-compat.js', './firebase-firestore-compat.js', './logo.png', './calculadora.html?v=188', './logo_elibi.jpg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
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
