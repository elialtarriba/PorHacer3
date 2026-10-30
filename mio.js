/* PorHacer3 · «Lo mío»: Agenda, Tickets y Sitios (y dónde se guardan las Listas)
   Son tuyos, como las listas sencillas: no pertenecen a ningún tablero.
   En Configuración → General eliges, para cada apartado, DÓNDE se guarda:
   - ☁️ En la nube (Firebase, en tu cuenta: usuarios/{uid}/agenda, tickets, sitios, fotos). Lo ves en todos tus aparatos.
       Sin sesión se guarda en el aparato y se sube a tu cuenta al entrar.
   - 📱 Solo en este aparato (IndexedDB). No sale del móvil u ordenador; para pasarlo a otro, exportar/importar.
   Siempre hay copia en el aparato para que funcione sin internet.
   Las fotos van aparte (colección «fotos»), aligeradas, y cada una sabe de qué apartado es (campo «de»). */

const Mio = {
  SECC: ['agenda', 'tickets', 'sitios'],
  COLS: ['agenda', 'tickets', 'sitios', 'fotos'],
  datos: { agenda:{}, tickets:{}, sitios:{}, fotos:{} },
  uid: null, falla: false, _subs: [], _oyentes: {}, _listo: false, _clave: null,

  /* ---------- ¿Dónde se guarda cada apartado? ---------- */
  donde(sec){ return lsGet('ph3-donde-' + sec) === 'aparato' ? 'aparato' : 'nube'; },
  enNube(sec){ return this.donde(sec) === 'nube' && !!this.uid && !this.falla; },
  // dueño de los datos en el almacén del aparato: «aparato» (elegido), el uid (copia de la nube) o «local» (sin sesión, se subirá)
  duenoDe(sec){ return this.donde(sec) === 'aparato' ? 'aparato' : (this.uid || 'local'); },
  secDeFoto(f){ return (f && this.SECC.includes(f.de)) ? f.de : 'agenda'; },
  get modo(){ return this.SECC.some(s => this.enNube(s)) ? 'nube' : 'local'; },

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
  async leerRango(pre){
    const r = IDBKeyRange.bound(pre, pre + '￿');
    const vals = await this.tx('d', 'readonly', st => st.getAll(r)).catch(() => []);
    const ks = await this.tx('d', 'readonly', st => st.getAllKeys(r)).catch(() => []);
    return (ks || []).map((k, i) => ({ k, id:k.split('|')[2], v:vals[i] }));
  },
  async cargarAparato(){
    this.COLS.forEach(c => this.datos[c] = {});
    for(const sec of this.SECC) for(const x of await this.leerRango(this.duenoDe(sec) + '|' + sec + '|')) this.datos[sec][x.id] = x.v;
    // fotos de todos los dueños que tocan; cada una se queda si su apartado se guarda en ese dueño
    const duenos = [...new Set(this.SECC.map(s => this.duenoDe(s)))];
    for(const d of duenos) for(const x of await this.leerRango(d + '|fotos|')) if(this.duenoDe(this.secDeFoto(x.v)) === d) this.datos.fotos[x.id] = x.v;
  },
  guardarAparato(dueno, col, id, obj){ const k = dueno + '|' + col + '|' + id; return this.tx('d', 'readwrite', st => obj == null ? st.delete(k) : st.put(obj, k)).catch(e => console.warn('mio idb', e)); },
  async vaciarDueno(d){
    const pre = d + '|';
    await this.tx('d', 'readwrite', st => st.delete(IDBKeyRange.bound(pre, pre + '￿'))).catch(() => {});
  },

  /* ---------- Nube ---------- */
  ref(col){ return Nube.db.collection('usuarios').doc(this.uid).collection(col); },
  usuario(){ return (typeof Nube !== 'undefined' && Nube.user && Nube.user.emailVerified !== false) ? Nube.user.uid : null; },
  async vigilar(forzar){
    const u = this.usuario(), clave = u + '|' + this.SECC.map(s => this.donde(s)).join(',');
    if(this._listo && clave === this._clave && !forzar) return;
    if(this._ocupado) return; this._ocupado = true;
    try{
      const antes = this.uid;
      this._listo = true; this._clave = clave;
      this._subs.forEach(f => { try{ f(); }catch(e){} }); this._subs = [];
      if(antes && antes !== u) await this.vaciarDueno(antes);      // al salir de la cuenta no queda nada de la nube en el aparato
      this.uid = u; this.falla = false;
      await this.cargarAparato(); this.avisar();
      if(!u) return;
      // lo que hubiera en el aparato sin cuenta (de los apartados «en la nube») se sube una sola vez a tu cuenta
      const nube = this.SECC.filter(s => this.donde(s) === 'nube');
      if(nube.length && !lsGet('ph3-mio-subido-' + u)){
        try{
          for(const sec of nube) for(const x of await this.leerRango('local|' + sec + '|')){ await this.ref(sec).doc(x.id).set(limpioFS(x.v)); }
          for(const x of await this.leerRango('local|fotos|')) if(nube.includes(this.secDeFoto(x.v))) await this.ref('fotos').doc(x.id).set(limpioFS(x.v));
          await this.vaciarDueno('local');
          lsSet('ph3-mio-subido-' + u, '1');
        }catch(e){ console.warn('mio subir', e); }
      }
      if(!nube.length) return;
      [...nube, 'fotos'].forEach(col => {
        const mia = col === 'fotos' ? (v => nube.includes(this.secDeFoto(v))) : (() => true);
        this._subs.push(this.ref(col).onSnapshot(snap => {
          snap.docChanges().forEach(ch => {
            const id = ch.doc.id;
            if(ch.type === 'removed'){ if(this.datos[col][id] && mia(this.datos[col][id])){ delete this.datos[col][id]; this.guardarAparato(u, col, id, null); } }
            else { const v = ch.doc.data(); if(!mia(v)) return; this.datos[col][id] = v; this.guardarAparato(u, col, id, v); }
          });
          // lo que ya no está en la nube, fuera también del aparato
          if(!(snap.metadata && snap.metadata.fromCache)){ const ids = new Set(snap.docs.map(d => d.id));
            Object.keys(this.datos[col]).forEach(id => { const v = this.datos[col][id]; if(!ids.has(id) && mia(v)){ delete this.datos[col][id]; this.guardarAparato(u, col, id, null); } }); }
          this.avisar(col);
        }, e => this.falloNube(e)));
      });
    } finally { this._ocupado = false; }
  },
  falloNube(e){
    console.warn('mio', e);
    if(this.falla) return;
    this.falla = true;
    this._subs.forEach(f => { try{ f(); }catch(_){} }); this._subs = [];
    if(e && e.code === 'permission-denied' && !this._avisado){ this._avisado = true;
      popAviso('Guardado en este aparato', 'La nube no deja guardar la Agenda, los Tickets y los Sitios en tu cuenta (falta la regla de «usuarios» en Firebase). Mientras tanto se guardan en este aparato.'); }
  },

  /* ---------- Leer y escribir ---------- */
  todos(col){ return Object.values(this.datos[col] || {}); },
  uno(col, id){ return (this.datos[col] || {})[id] || null; },
  secDe(col, obj){ return col === 'fotos' ? this.secDeFoto(obj) : col; },
  async poner(col, id, obj){
    obj = limpioFS(obj);
    const sec = this.secDe(col, obj);
    this.datos[col][id] = obj; this.avisar(col);
    await this.guardarAparato(this.duenoDe(sec), col, id, obj);
    if(this.enNube(sec)) this.ref(col).doc(id).set(obj).catch(e => { console.warn(e); if(e && /exceeds|too large|size/i.test(e.message || '')) toast('⚠️ Es demasiado grande para la nube'); });
  },
  async quitar(col, id){
    const viejo = this.datos[col][id], sec = this.secDe(col, viejo);
    delete this.datos[col][id]; this.avisar(col);
    await this.guardarAparato(this.duenoDe(sec), col, id, null);
    if(this.enNube(sec)) this.ref(col).doc(id).delete().catch(e => console.warn(e));
  },
  // fotos: se guardan aparte, con el apartado al que pertenecen; devuelve el id
  async ponerFoto(img, id, de){ id = id || nuevoId('f'); await this.poner('fotos', id, { img, t:Date.now(), de:de || 'agenda' }); return id; },
  foto(id){ const f = this.uno('fotos', id); return f ? f.img : ''; },
  async quitarFotos(ids){ for(const id of (ids || [])) if(id && this.datos.fotos[id]) await this.quitar('fotos', id); },

  // quién quiere enterarse de cambios (para volver a pintar)
  al(col, fn){ (this._oyentes[col] = this._oyentes[col] || []).push(fn); },
  avisar(col){
    clearTimeout(this._tAv); const cols = col ? [col] : this.COLS;
    this._pendAv = [...new Set([...(this._pendAv || []), ...cols])];
    this._tAv = setTimeout(() => { const c = this._pendAv; this._pendAv = []; c.forEach(k => (this._oyentes[k] || []).forEach(f => { try{ f(); }catch(e){ console.warn(e); } })); }, 30);
  },

  /* ---------- Cambiar dónde se guarda un apartado ---------- */
  // sec: agenda | tickets | sitios | listas · a: 'nube' | 'aparato' · borrarNube: al pasar al aparato, quitarlo también de la nube
  async cambiarDonde(sec, a, borrarNube){
    if(sec === 'listas') return this.cambiarDondeListas(a, borrarNube);
    if(this.donde(sec) === a) return;
    const docs = this.todos(sec), fotos = this.todos('fotos').filter(f => this.secDeFoto(f) === sec);
    const idsF = Object.keys(this.datos.fotos).filter(id => this.secDeFoto(this.datos.fotos[id]) === sec);
    const viejoDueno = this.duenoDe(sec), estabaEnNube = this.enNube(sec);
    if(a === 'aparato'){
      for(const d of docs) await this.guardarAparato('aparato', sec, d.id, d);
      for(const id of idsF) await this.guardarAparato('aparato', 'fotos', id, this.datos.fotos[id]);
      if(viejoDueno !== 'aparato'){ for(const d of docs) await this.guardarAparato(viejoDueno, sec, d.id, null); for(const id of idsF) await this.guardarAparato(viejoDueno, 'fotos', id, null); }
      if(estabaEnNube && borrarNube){ for(const d of docs) await this.ref(sec).doc(d.id).delete().catch(() => {}); for(const id of idsF) await this.ref('fotos').doc(id).delete().catch(() => {}); }
      lsSet('ph3-donde-' + sec, 'aparato');
    } else {
      lsSet('ph3-donde-' + sec, null);
      const nuevo = this.duenoDe(sec), subir = !!this.uid && !this.falla;
      for(const d of docs){ await this.guardarAparato(nuevo, sec, d.id, d); if(subir) await this.ref(sec).doc(d.id).set(limpioFS(d)); }
      for(const id of idsF){ const f = this.datos.fotos[id]; await this.guardarAparato(nuevo, 'fotos', id, f); if(subir) await this.ref('fotos').doc(id).set(limpioFS(f)); }
      for(const d of docs) await this.guardarAparato('aparato', sec, d.id, null);
      for(const id of idsF) await this.guardarAparato('aparato', 'fotos', id, null);
    }
    await this.vigilar(true);
    return { docs:docs.length, fotos:fotos.length };
  },
  async cambiarDondeListas(a, borrarNube){
    if(typeof Listas === 'undefined') return;
    if(Listas.donde() === a) return;
    const datos = JSON.parse(JSON.stringify(Listas.datos)), fondos = { ...Listas.fondos }, estabaNube = Listas.modo === 'nube';
    const R = n => Nube.db.collection('usuarios').doc(this.uid).collection(n);
    if(a === 'aparato'){
      try{ localStorage.setItem('ph3-listas-aparato', JSON.stringify({ datos, fondos })); }catch(e){ throw new Error('No caben las imágenes de fondo de las listas en este aparato'); }
      if(estabaNube && borrarNube){ for(const l of datos) await R('listas').doc(l.id).delete().catch(() => {}); for(const id of Object.keys(fondos)) await R('fondos').doc(id).delete().catch(() => {}); }
      lsSet('ph3-donde-listas', 'aparato');
    } else {
      lsSet('ph3-donde-listas', null);
      if(this.uid){ for(const l of datos) await R('listas').doc(l.id).set(limpioFS(l)).catch(() => {});
        for(const [id, img] of Object.entries(fondos)) await R('fondos').doc(id).set({ img }).catch(() => {}); lsSet('ph3-listas-subidas-' + this.uid, '1'); }
      else { try{ localStorage.setItem('ph3-listas', JSON.stringify({ datos, fondos })); }catch(e){} }
      lsSet('ph3-listas-aparato', null);
    }
    Listas._iniciado = false; Listas.vigilar();
    return { docs:datos.length };
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
  // Tickets de la app HOME (copia «hogar-copia-….json»): se pasan a los tickets de PorHacer3 sin repetir
  async desdeHome(obj, avance){
    const lista = (obj && Array.isArray(obj.tickets)) ? obj.tickets.filter(t => t && t.id) : [];
    const lig = async (src, max, q) => { if(!src) return null; try{ const b = await (await fetch(src)).blob(); return await aligerarImg(b, max, q); }catch(e){ return src; } };
    let n = 0, ya = 0;
    for(const t of lista){
      const id = 'home_' + t.id;
      if(this.uno('tickets', id)){ ya++; continue; }
      const foto = t.photo ? await this.ponerFoto(await lig(t.photo, 1400, .78), 'fh_' + t.id, 'tickets') : null;
      const fotoProd = t.prodPhoto ? await this.ponerFoto(await lig(t.prodPhoto, 1280, .75), 'fhp_' + t.id, 'tickets') : null;
      const fecha = /^\d{4}-\d{2}-\d{2}$/.test(t.date || '') ? t.date : hoyIso();
      await this.poner('tickets', id, { id, fecha, titulo:(t.title || '').trim(), importe:(typeof t.amount === 'number' && !isNaN(t.amount)) ? t.amount : null,
        foto, mini:t.thumb || null, fotoProd, miniProd:t.prodThumb || null, creado:t.created || Date.now(), cambiado:Date.now(), deHome:true });
      n++; avance && avance(n + ya, lista.length);
    }
    return { nuevos:n, ya, total:lista.length };
  },
  async importar(obj, modo){       // modo: 'juntar' (añade y actualiza) o 'cambiar' (borra lo de antes)
    if(!obj || obj.tipo !== 'copia-mia') throw new Error('No es una copia de PorHacer3');
    for(const col of ['agenda', 'tickets', 'sitios']){
      if(!obj[col]) continue;
      if(modo === 'cambiar') for(const id of Object.keys(this.datos[col])) await this.quitar(col, id);
      for(const d of obj[col]) if(d && d.id) await this.poner(col, d.id, d);
    }
    const deFoto = {};
    (obj.agenda || []).forEach(d => (d.items || []).forEach(it => (it.fotos || []).forEach(f => deFoto[f] = 'agenda')));
    (obj.tickets || []).forEach(t => [t.foto, t.fotoProd].forEach(f => { if(f) deFoto[f] = 'tickets'; }));
    (obj.sitios || []).forEach(x => [...(x.fotos || []), x.fotoCasa, ...Object.values(x.cosas || {}).flatMap(c => c.fotos || [])].forEach(f => { if(f) deFoto[f] = 'sitios'; }));
    for(const [id, f] of Object.entries(obj.fotos || {})) await this.poner('fotos', id, { ...f, de:f.de || deFoto[id] || 'agenda' });
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
    // Si se cancela: el aviso «cancel» del navegador. (Antes se miraba al volver a la app, pero en Chrome del iPhone
    // la foto de la cámara llega más tarde y se perdía.)
    i.addEventListener('cancel', () => fin([]));
    setTimeout(() => { if(!hecho && !(i.files && i.files.length)) i.remove(); }, 600000);
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
