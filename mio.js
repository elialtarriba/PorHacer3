/* PorHacer3 · «Lo mío»: Agenda, Tickets y Sitios
   Son tuyos, como las listas sencillas: no pertenecen a ningún tablero.
   - Con sesión: se guardan en la nube, en tu cuenta (usuarios/{uid}/agenda, tickets, sitios, fotos)
     y se ven en todos tus aparatos. Solo los ves tú.
   - Sin sesión (o si la nube no deja): se guardan en este aparato.
   Además hay una copia en el aparato (IndexedDB) para que todo funcione sin internet.
   Las fotos van aparte (colección «fotos»), ya aligeradas, para no pasar del límite de 1 MB por documento. */

const Mio = {
  COLS: ['agenda', 'tickets', 'sitios', 'fotos'],
  datos: { agenda:{}, tickets:{}, sitios:{}, fotos:{} },
  uid: null, dueno: 'local', modo: 'local', _subs: [], _oyentes: {}, _listo: false,

  /* ---------- Almacén del aparato (IndexedDB) ---------- */
  _db: null,
  idb(){
    if(this._db) return this._db;
    this._db = new Promise((ok, mal) => {
      const r = indexedDB.open('PorHacer3-mio', 1);
      r.onupgradeneeded = () => { r.result.createObjectStore('d'); r.result.createObjectStore('pend'); };
      r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error);
    });
    return this._db;
  },
  async tx(store, modo, fn){
    const db = await this.idb();
    return new Promise((ok, mal) => {
      const t = db.transaction(store, modo), st = t.objectStore(store); let out;
      const r = fn(st); if(r && 'onsuccess' in r) r.onsuccess = () => { out = r.result; };
      t.oncomplete = () => ok(out); t.onerror = () => mal(t.error); t.onabort = () => mal(t.error);
    });
  },
  clave(col, id){ return this.dueno + '|' + col + '|' + id; },
  async cargarAparato(){
    const pre = this.dueno + '|';
    const todo = await this.tx('d', 'readonly', st => st.getAll(IDBKeyRange.bound(pre, pre + '￿'))).catch(() => []);
    const claves = await this.tx('d', 'readonly', st => st.getAllKeys(IDBKeyRange.bound(pre, pre + '￿'))).catch(() => []);
    this.COLS.forEach(c => this.datos[c] = {});
    (claves || []).forEach((k, i) => { const [, col, id] = k.split('|'); if(this.datos[col]) this.datos[col][id] = todo[i]; });
  },
  guardarAparato(col, id, obj){ return this.tx('d', 'readwrite', st => obj == null ? st.delete(this.clave(col, id)) : st.put(obj, this.clave(col, id))).catch(e => console.warn('mio idb', e)); },
  async vaciarDueno(d){
    const pre = d + '|';
    await this.tx('d', 'readwrite', st => st.delete(IDBKeyRange.bound(pre, pre + '￿'))).catch(() => {});
    await this.tx('pend', 'readwrite', st => st.delete(IDBKeyRange.bound(pre, pre + '￿'))).catch(() => {});
  },

  /* ---------- Nube ---------- */
  ref(col){ return Nube.db.collection('usuarios').doc(this.uid).collection(col); },
  async vigilar(){
    const u = (typeof Nube !== 'undefined' && Nube.user && Nube.user.emailVerified !== false) ? Nube.user.uid : null;
    if(this._listo && u === this.uid) return;
    const antes = this.uid;
    this._listo = true;
    this._subs.forEach(f => { try{ f(); }catch(e){} }); this._subs = [];
    if(antes && !u) await this.vaciarDueno(antes);        // al salir de la cuenta no queda nada tuyo en el aparato
    this.uid = u; this.dueno = u || 'local';
    await this.cargarAparato(); this.avisar();
    if(!u){ this.modo = 'local'; return; }
    this.modo = 'nube';
    // lo que hubiera en el aparato sin cuenta se sube una sola vez a tu cuenta
    if(!lsGet('ph3-mio-subido-' + u)){
      const pre = 'local|';
      const vals = await this.tx('d', 'readonly', st => st.getAll(IDBKeyRange.bound(pre, pre + '￿'))).catch(() => []);
      const ks = await this.tx('d', 'readonly', st => st.getAllKeys(IDBKeyRange.bound(pre, pre + '￿'))).catch(() => []);
      try{
        for(let i = 0; i < (ks || []).length; i++){ const [, col, id] = ks[i].split('|'); await this.ref(col).doc(id).set(limpioFS(vals[i])); }
        if(ks && ks.length) await this.vaciarDueno('local');
        lsSet('ph3-mio-subido-' + u, '1');
      }catch(e){ console.warn('mio subir', e); }
    }
    this.COLS.forEach(col => {
      this._subs.push(this.ref(col).onSnapshot(snap => {
        snap.docChanges().forEach(ch => {
          const id = ch.doc.id;
          if(ch.type === 'removed'){ delete this.datos[col][id]; this.guardarAparato(col, id, null); }
          else { const v = ch.doc.data(); this.datos[col][id] = v; this.guardarAparato(col, id, v); }
        });
        // lo que ya no está en la nube, fuera también del aparato
        if(!(snap.metadata && snap.metadata.fromCache)){ const ids = new Set(snap.docs.map(d => d.id));
          Object.keys(this.datos[col]).forEach(id => { if(!ids.has(id)){ delete this.datos[col][id]; this.guardarAparato(col, id, null); } }); }
        this.avisar(col);
      }, e => this.falloNube(e)));
    });
  },
  falloNube(e){
    console.warn('mio', e);
    if(this.modo === 'local') return;
    this.modo = 'local';
    this._subs.forEach(f => { try{ f(); }catch(_){} }); this._subs = [];
    if(e && e.code === 'permission-denied' && !this._avisado){ this._avisado = true;
      popAviso('Guardado en este aparato', 'La nube no deja guardar la Agenda, los Tickets y los Sitios en tu cuenta (falta la regla de «usuarios» en Firebase). Mientras tanto se guardan en este aparato.'); }
  },

  /* ---------- Leer y escribir ---------- */
  todos(col){ return Object.values(this.datos[col] || {}); },
  uno(col, id){ return (this.datos[col] || {})[id] || null; },
  async poner(col, id, obj){
    obj = limpioFS(obj);
    this.datos[col][id] = obj; this.avisar(col);
    await this.guardarAparato(col, id, obj);
    if(this.modo === 'nube') this.ref(col).doc(id).set(obj).catch(e => { console.warn(e); if(e && /exceeds|too large|size/i.test(e.message || '')) toast('⚠️ Es demasiado grande para la nube'); });
  },
  async quitar(col, id){
    delete this.datos[col][id]; this.avisar(col);
    await this.guardarAparato(col, id, null);
    if(this.modo === 'nube') this.ref(col).doc(id).delete().catch(e => console.warn(e));
  },
  // fotos: se guardan aparte; devuelve el id
  async ponerFoto(img, id){ id = id || nuevoId('f'); await this.poner('fotos', id, { img, t:Date.now() }); return id; },
  foto(id){ const f = this.uno('fotos', id); return f ? f.img : ''; },
  async quitarFotos(ids){ for(const id of (ids || [])) if(id) await this.quitar('fotos', id); },

  // quién quiere enterarse de cambios (para volver a pintar)
  al(col, fn){ (this._oyentes[col] = this._oyentes[col] || []).push(fn); },
  avisar(col){
    clearTimeout(this._tAv); const cols = col ? [col] : this.COLS;
    this._pendAv = [...new Set([...(this._pendAv || []), ...cols])];
    this._tAv = setTimeout(() => { const c = this._pendAv; this._pendAv = []; c.forEach(k => (this._oyentes[k] || []).forEach(f => { try{ f(); }catch(e){ console.warn(e); } })); }, 30);
  },

  /* ---------- Copia: exportar e importar ---------- */
  async exportar(que){
    const out = { app:'PorHacer3', tipo:'copia-mia', fecha:new Date().toISOString(), version:VERSION };
    const fotosUsadas = new Set();
    const usa = ids => (ids || []).forEach(i => i && fotosUsadas.add(i));
    if(que.agenda){ out.agenda = this.todos('agenda'); out.agenda.forEach(d => (d.items || []).forEach(it => usa(it.fotos))); }
    if(que.tickets){ out.tickets = this.todos('tickets'); out.tickets.forEach(t => usa([t.foto, t.fotoProd])); }
    if(que.sitios){ out.sitios = this.todos('sitios'); out.sitios.forEach(s => { usa(s.fotos); usa([s.fotoCasa]); Object.values(s.cosas || {}).forEach(c => usa(c.fotos)); }); }
    if(que.listas && typeof Listas !== 'undefined'){ out.listas = Listas.datos; out.fondos = Listas.fondos; }
    if(fotosUsadas.size){ out.fotos = {}; fotosUsadas.forEach(id => { const f = this.uno('fotos', id); if(f) out.fotos[id] = f; }); }
    return out;
  },
  async importar(obj, modo){       // modo: 'juntar' (añade y actualiza) o 'cambiar' (borra lo de antes)
    if(!obj || obj.tipo !== 'copia-mia') throw new Error('No es una copia de PorHacer3');
    for(const col of ['agenda', 'tickets', 'sitios']){
      if(!obj[col]) continue;
      if(modo === 'cambiar') for(const id of Object.keys(this.datos[col])) await this.quitar(col, id);
      for(const d of obj[col]) if(d && d.id) await this.poner(col, d.id, d);
    }
    for(const [id, f] of Object.entries(obj.fotos || {})) await this.poner('fotos', id, f);
    let nl = 0;
    if(obj.listas && typeof Listas !== 'undefined'){
      for(const l of obj.listas){ if(!l || !l.id) continue; nl++;
        const i = Listas.datos.findIndex(x => x.id === l.id); if(i >= 0) Listas.datos[i] = l; else Listas.datos.push(l);
        if(Listas.modo === 'nube') await Listas.ref('listas').doc(l.id).set(limpioFS(l)).catch(() => {}); }
      for(const [id, img] of Object.entries(obj.fondos || {})){ Listas.fondos[id] = img; if(Listas.modo === 'nube') await Listas.ref('fondos').doc(id).set({ img }).catch(() => {}); }
      if(Listas.modo !== 'nube') Listas.lsGuardar();
      Listas.pintar && Listas.pintar();
    }
    return { agenda:(obj.agenda || []).length, tickets:(obj.tickets || []).length, sitios:(obj.sitios || []).length, listas:nl };
  },

  iniciar(){
    this.vigilar();
    setInterval(() => this.vigilar(), 1500);
  }
};

/* ---------- Ayudas comunes para fotos ---------- */
// Aligera una imagen: lado mayor «max» px, calidad «q». Devuelve dataURL JPEG.
function aligerarImg(file, max, q){
  return new Promise((ok, mal) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let d = c.toDataURL('image/jpeg', q);
      while(d.length > 900000 && q > 0.35){ q -= 0.1; d = c.toDataURL('image/jpeg', q); }   // que quepa en la nube
      ok(d);
    };
    img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('img')); };
    img.src = url;
  });
}
// Abre la cámara o la galería. Devuelve la lista de archivos elegidos.
function elegirFotos(camara, varias){
  return new Promise(ok => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; if(varias) i.multiple = true;
    if(camara) i.setAttribute('capture', 'environment');
    i.style.display = 'none'; document.body.appendChild(i);
    let hecho = false; const fin = v => { if(hecho) return; hecho = true; i.remove(); ok(v); };
    i.onchange = () => fin([...i.files]);
    addEventListener('focus', () => setTimeout(() => { if(!i.files || !i.files.length) fin([]); }, 1200), { once:true });
    i.click();
  });
}
// Ver una foto en grande
function verFotoGrande(src){
  if(!src) return;
  const v = document.createElement('div'); v.className = 'mio-foto-velo';
  v.innerHTML = `<img src="${src}" alt=""><button aria-label="Cerrar">✕</button>`;
  v.onclick = () => v.remove(); document.body.appendChild(v);
}
const icIn = n => `<span class="ic-in">${icono(n)}</span>`;
const capital = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const MESES_C = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
function fechaBonita(k, conAnio){ const d = deIso(k); return capital(d.toLocaleDateString('es-ES', conAnio ? { weekday:'long', day:'numeric', month:'long', year:'numeric' } : { weekday:'long', day:'numeric', month:'long' })); }
function fechaCortaB(k){ return capital(deIso(k).toLocaleDateString('es-ES', { weekday:'short', day:'numeric', month:'short' })); }

/* ---------- Hoja que sale desde abajo (menús) y popups propios ---------- */
function hojaMio(tit, html, clase){
  cerrarHojaMio();
  const v = document.createElement('div'); v.className = 'mio-velo'; v.id = 'mioVelo';
  v.innerHTML = `<div class="mio-hoja ${clase || ''}" role="dialog"><div class="mio-asa"></div>${tit ? `<h3>${tit}</h3>` : ''}<div class="mio-hoja-c">${html}</div></div>`;
  v.addEventListener('click', e => { if(e.target === v) cerrarHojaMio(); });
  document.body.appendChild(v); requestAnimationFrame(() => v.classList.add('mio-ver'));
  return v.querySelector('.mio-hoja');
}
function cerrarHojaMio(){ const v = $('#mioVelo'); if(v) v.remove(); }
// Ventana centrada (como los popups de HOME)
function popMio(html, clase){
  cerrarPopMio();
  const v = document.createElement('div'); v.className = 'mio-velo mio-velo-c'; v.id = 'mioPop';
  v.innerHTML = `<div class="mio-pop ${clase || ''}" role="dialog">${html}</div>`;
  v.addEventListener('click', e => { if(e.target === v){ if(v._alCerrar) v._alCerrar(); cerrarPopMio(); } });
  document.body.appendChild(v); requestAnimationFrame(() => v.classList.add('mio-ver'));
  return v.querySelector('.mio-pop');
}
function cerrarPopMio(){ const v = $('#mioPop'); if(v) v.remove(); }
function confirmarMio(tit, txt, si){
  return new Promise(ok => {
    const p = popMio(`<h3 class="mp-h">${tit}</h3><p class="mp-p">${txt}</p><div class="mp-fila"><button class="mp-b" data-n>Cancelar</button><button class="mp-b mp-peligro" data-s>${si || 'Borrar'}</button></div>`);
    p.querySelector('[data-n]').onclick = () => { cerrarPopMio(); ok(false); };
    p.querySelector('[data-s]').onclick = () => { cerrarPopMio(); ok(true); };
    p.parentNode._alCerrar = () => ok(false);
  });
}
// Crea un PDF (A4) a partir de un trozo de página hecho a medida y lo comparte o descarga
async function pdfDeHtml(html, nombre, papel){
  papel = papel || '#ffffff';
  toast('📄 Preparando el PDF…', null, null, 20000);
  try{
    if(!window.html2canvas) await cargarScript('html2canvas.min.js');
    if(!window.jspdf) await cargarScript('jspdf.min.js');
  }catch(e){ toast('⚠️ No se pudo preparar el PDF (¿sin internet la primera vez?)'); return; }
  const z = document.createElement('div');
  z.style.cssText = `position:fixed;left:-10000px;top:0;width:794px;background:${papel};padding:40px 42px;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif`;
  z.innerHTML = html; document.body.appendChild(z);
  try{
    await Promise.all([...z.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    const cv = await html2canvas(z, { scale:2, backgroundColor:papel, useCORS:true, logging:false });
    const { jsPDF } = window.jspdf, doc = new jsPDF({ unit:'mm', format:'a4', compress:true });
    const pw = 210, ph = 297, altoPag = Math.floor(cv.width * ph / pw);
    for(let y = 0, n = 0; y < cv.height; y += altoPag, n++){
      if(n) doc.addPage();
      const trozo = document.createElement('canvas'); trozo.width = cv.width; trozo.height = Math.min(altoPag, cv.height - y);
      const tx = trozo.getContext('2d'); tx.fillStyle = papel; tx.fillRect(0, 0, trozo.width, trozo.height); tx.drawImage(cv, 0, -y);
      doc.addImage(trozo.toDataURL('image/jpeg', 0.88), 'JPEG', 0, 0, pw, trozo.height * pw / cv.width);
    }
    const blob = doc.output('blob'); nombre = String(nombre || 'documento').replace(/[^\w\- áéíóúñç]/gi, '').trim().slice(0, 50) + '.pdf';
    const file = new File([blob], nombre, { type:'application/pdf' });
    if(matchMedia('(pointer:coarse)').matches && navigator.canShare && navigator.canShare({ files:[file] })){
      try{ await navigator.share({ files:[file], title:nombre }); }catch(e){ if(e.name !== 'AbortError') descargar(blob, nombre); }
    } else descargar(blob, nombre);
    toast('📄 PDF «' + nombre + '» listo');
  }catch(e){ console.warn(e); toast('⚠️ No se pudo hacer el PDF'); }
  finally{ z.remove(); }
}
