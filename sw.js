// PorHacer3 · service worker: la app funciona sin conexión
const CACHE = 'porhacer3-v191';
const ARCHIVOS = [
  './', './index.html', './manifest.json', './estilos.css?v=191', './estilos3.css?v=191',
  './i18n.js?v=191', './iconos.js?v=191', './iconos-home.js?v=191', './mio.js?v=191', './agenda.js?v=191', './tickets.js?v=191', './gastos.js?v=191', './guardar.js?v=191', './aparatos.js?v=191', './pdfvisor.js?v=191', './sitios.js?v=191', './grabar.js?v=191', './estudio.js?v=191', './escribir.js?v=191', './celdas.js?v=191', './documentos.js?v=191', './edicion.js?v=191', './portada.js?v=191', './temas.js?v=191', './db.js?v=191', './firebase-config.js?v=191', './email-config.js?v=191', './nube.js?v=191',
  './correo.js?v=191', './audio.js?v=191', './fiesta.js?v=191', './avisos.js?v=191', './bloc.js?v=191', './listas.js?v=191', './listas.png', './lame.min.js', './html2canvas.min.js', './jspdf.min.js', './pdf6.min.js?v=191', './pdf6.worker.min.js?v=191',
  './fotos.js?v=191', './videos.js?v=191', './voz.js?v=191', './calendario.js?v=191', './ajustes.js?v=191',
  './copias.js?v=191', './seguro.js?v=191', './app.js?v=191',
  './zoom.js?v=191', './pipeta.js?v=191', './purify.min.js', './firebase-app-compat.js', './firebase-auth-compat.js', './firebase-firestore-compat.js', './logo.png', './calculadora.html?v=191', './logo_elibi.jpg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
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
