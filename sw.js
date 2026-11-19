// PorHacer3 · service worker: la app funciona sin conexión
const CACHE = 'porhacer3-v186';
const ARCHIVOS = [
  './', './index.html', './manifest.json', './estilos.css?v=186', './estilos3.css?v=186',
  './iconos.js?v=186', './iconos-home.js?v=186', './mio.js?v=186', './agenda.js?v=186', './tickets.js?v=186', './gastos.js?v=186', './guardar.js?v=186', './aparatos.js?v=186', './pdfvisor.js?v=186', './sitios.js?v=186', './grabar.js?v=186', './estudio.js?v=186', './escribir.js?v=186', './celdas.js?v=186', './documentos.js?v=186', './edicion.js?v=186', './portada.js?v=186', './temas.js?v=186', './db.js?v=186', './firebase-config.js?v=186', './email-config.js?v=186', './nube.js?v=186',
  './correo.js?v=186', './audio.js?v=186', './fiesta.js?v=186', './avisos.js?v=186', './bloc.js?v=186', './listas.js?v=186', './listas.png', './lame.min.js', './html2canvas.min.js', './jspdf.min.js', './pdf6.min.js?v=186', './pdf6.worker.min.js?v=186',
  './fotos.js?v=186', './videos.js?v=186', './voz.js?v=186', './calendario.js?v=186', './ajustes.js?v=186',
  './copias.js?v=186', './app.js?v=186',
  './zoom.js?v=186', './pipeta.js?v=186', './purify.min.js', './firebase-app-compat.js', './firebase-auth-compat.js', './firebase-firestore-compat.js', './logo.png', './calculadora.html?v=186', './logo_elibi.jpg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
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
