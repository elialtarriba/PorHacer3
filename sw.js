// PorHacer3 · service worker: la app funciona sin conexión
const CACHE = 'porhacer3-v190';
const ARCHIVOS = [
  './', './index.html', './manifest.json', './estilos.css?v=190', './estilos3.css?v=190',
  './i18n.js?v=190', './iconos.js?v=190', './iconos-home.js?v=190', './mio.js?v=190', './agenda.js?v=190', './tickets.js?v=190', './gastos.js?v=190', './guardar.js?v=190', './aparatos.js?v=190', './pdfvisor.js?v=190', './sitios.js?v=190', './grabar.js?v=190', './estudio.js?v=190', './escribir.js?v=190', './celdas.js?v=190', './documentos.js?v=190', './edicion.js?v=190', './portada.js?v=190', './temas.js?v=190', './db.js?v=190', './firebase-config.js?v=190', './email-config.js?v=190', './nube.js?v=190',
  './correo.js?v=190', './audio.js?v=190', './fiesta.js?v=190', './avisos.js?v=190', './bloc.js?v=190', './listas.js?v=190', './listas.png', './lame.min.js', './html2canvas.min.js', './jspdf.min.js', './pdf6.min.js?v=190', './pdf6.worker.min.js?v=190',
  './fotos.js?v=190', './videos.js?v=190', './voz.js?v=190', './calendario.js?v=190', './ajustes.js?v=190',
  './copias.js?v=190', './seguro.js?v=190', './app.js?v=190',
  './zoom.js?v=190', './pipeta.js?v=190', './purify.min.js', './firebase-app-compat.js', './firebase-auth-compat.js', './firebase-firestore-compat.js', './logo.png', './calculadora.html?v=190', './logo_elibi.jpg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
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
