// PorHacer3 · service worker: la app funciona sin conexión
const CACHE = 'porhacer3-v189';
const ARCHIVOS = [
  './', './index.html', './manifest.json', './estilos.css?v=189', './estilos3.css?v=189',
  './i18n.js?v=189', './iconos.js?v=189', './iconos-home.js?v=189', './mio.js?v=189', './agenda.js?v=189', './tickets.js?v=189', './gastos.js?v=189', './guardar.js?v=189', './aparatos.js?v=189', './pdfvisor.js?v=189', './sitios.js?v=189', './grabar.js?v=189', './estudio.js?v=189', './escribir.js?v=189', './celdas.js?v=189', './documentos.js?v=189', './edicion.js?v=189', './portada.js?v=189', './temas.js?v=189', './db.js?v=189', './firebase-config.js?v=189', './email-config.js?v=189', './nube.js?v=189',
  './correo.js?v=189', './audio.js?v=189', './fiesta.js?v=189', './avisos.js?v=189', './bloc.js?v=189', './listas.js?v=189', './listas.png', './lame.min.js', './html2canvas.min.js', './jspdf.min.js', './pdf6.min.js?v=189', './pdf6.worker.min.js?v=189',
  './fotos.js?v=189', './videos.js?v=189', './voz.js?v=189', './calendario.js?v=189', './ajustes.js?v=189',
  './copias.js?v=189', './app.js?v=189',
  './zoom.js?v=189', './pipeta.js?v=189', './purify.min.js', './firebase-app-compat.js', './firebase-auth-compat.js', './firebase-firestore-compat.js', './logo.png', './calculadora.html?v=189', './logo_elibi.jpg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
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
