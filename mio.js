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
    if(que.tickets){ out.tickets = this.todos('tickets'); out.tickets.forEach(t => usa([t.foto, t.fotoProd, ...(t.fotos || [])])); }   // con la lista de Gastos
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
  // Cuenta lo que trae una copia de HOME (para preguntar antes)
  resumenHome(obj){
    const casas = Array.isArray(obj && obj.houses) ? obj.houses.filter(h => h && h.id) : [];
    const rooms = Object.values((obj && obj.rooms) || {}).filter(r => r && r.houseId);
    const cosas = rooms.reduce((n, r) => n + Object.keys(r.tasks || {}).length, 0);
    return { casas:casas.length, sitios:rooms.length, cosas, tickets:Array.isArray(obj && obj.tickets) ? obj.tickets.length : 0 };
  },
  // Casas, sitios y cosas de HOME → Sitios de PorHacer3 (con sus fotos). Lo que ya se pasó antes no se repite.
  async sitiosDesdeHome(obj, avance){
    const fotosH = (obj && obj.photos) || {}, ph = k => fotosH[k] || null;
    const lig = async src => { if(!src || !String(src).startsWith('data:')) return null; try{ const b = await (await fetch(src)).blob(); return await aligerarImg(b, 1280, .74); }catch(e){ return src; } };
    const nm = s => norm(String(s || '')).replace(/[^a-z0-9]/g, '');
    const casasYa = this.todos('sitios').filter(x => x.tipo === 'casa');
    const casaId = {};   // id de HOME → id en PorHacer3
    let nCasas = 0, nSitios = 0, nCosas = 0, ya = 0, paso = 0;
    const houses = Array.isArray(obj.houses) ? obj.houses.filter(h => h && h.id) : [];
    const rooms = Object.entries(obj.rooms || {}).filter(([, r]) => r && r.houseId);
    const total = houses.length + rooms.length;
    for(const h of houses){
      const id = 'home_' + h.id, mismo = casasYa.find(c => c.id === id || nm(c.nombre) === nm(h.name));
      if(mismo){ casaId[h.id] = mismo.id; ya++; avance && avance(++paso, total); continue; }
      const c = { id, tipo:'casa', nombre:String(h.name || 'Casa').toUpperCase(), emoji:h.emoji || '🏠', img:h.iconImage || null, color:(h.color && PALETTES[h.color]) ? h.color : 'verde',
        orden:casasYa.length + nCasas, creada:Date.now(), deHome:true };
      if(h.btnSitio) c.bSitio = h.btnSitio; if(h.btnCosa) c.bCosa = h.btnCosa;
      const portada = await lig(ph('ph_house_' + h.id)); if(portada) c.fotoCasa = await this.ponerFoto(portada, 'fhc_' + h.id, 'sitios');
      await this.poner('sitios', id, c); casaId[h.id] = id; nCasas++; avance && avance(++paso, total);
    }
    for(const [rid, r] of rooms){
      const id = 'home_' + rid, casa = casaId[r.houseId] || ('home_' + r.houseId);
      if(this.uno('sitios', id)){ ya++; avance && avance(++paso, total); continue; }
      const cosas = {};
      for(const [tid, t] of Object.entries(r.tasks || {})){
        const ids = [...(Array.isArray(t.photoIds) ? t.photoIds : []), ...(t.photoId ? [t.photoId] : [])].filter((v, i, a) => v && a.indexOf(v) === i);
        const fotos = []; for(const pid of ids){ const src = await lig(ph('ph_task_' + pid)); if(src) fotos.push(await this.ponerFoto(src, 'fht_' + pid, 'sitios')); }
        cosas[tid] = { texto:String(t.text || '').trim(), fotos, orden:t.order || 0, creada:Date.now() }; nCosas++;
      }
      let adj = []; try{ adj = JSON.parse(ph('ph_list_' + rid) || '[]'); }catch(e){}
      const fotos = []; for(const pid of adj){ const src = await lig(ph('ph_attach_' + pid)); if(src) fotos.push(await this.ponerFoto(src, 'fha_' + pid, 'sitios')); }
      await this.poner('sitios', id, { id, tipo:'sitio', casa, padre:r.parentId ? 'home_' + r.parentId : null, nombre:String(r.name || 'Sitio'), emoji:r.emoji || '📦', img:r.iconImage || null,
        orden:r.order || 0, cosas, fotos, creado:Date.now(), deHome:true });
      nSitios++; avance && avance(++paso, total);
    }
    return { casas:nCasas, sitios:nSitios, cosas:nCosas, ya };
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
// Ver una foto en grande: con dos dedos se hace grande o pequeña, con un dedo se mueve,
// dos toques seguidos amplían o vuelven al tamaño normal. Y se puede guardar en el aparato.
function verFotoGrande(src, nombre){
  if(!src) return;
  const v = document.createElement('div'); v.className = 'mio-foto-velo vfg';
  v.innerHTML = `<div class="vfg-zona"><img src="${src}" alt="" draggable="false"></div>
    <div class="vfg-barra"><button class="vfg-b" data-g aria-label="Guardar la foto">⬇️ Guardar</button><button class="vfg-b" data-menos aria-label="Más pequeña">－</button><button class="vfg-b" data-mas aria-label="Más grande">＋</button><button class="vfg-b vfg-x" data-x aria-label="Cerrar">✕</button></div>
    <p class="vfg-pista">🤏 Con dos dedos, más grande o más pequeña · dos toques: ampliar</p>`;
  document.body.appendChild(v);
  const zona = $('.vfg-zona', v), img = $('img', v);
  let k = 1, tx = 0, ty = 0;
  const pon = (anim) => { img.style.transition = anim ? 'transform .2s' : 'none'; img.style.transform = `translate(${tx}px,${ty}px) scale(${k})`; v.classList.toggle('ampliada', k > 1.02); };
  const limitar = () => { const r = zona.getBoundingClientRect(), w = img.offsetWidth * k, h = img.offsetHeight * k;
    const mx = Math.max(0, (w - r.width) / 2), my = Math.max(0, (h - r.height) / 2); tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty)); };
  // ampliar hacia un punto (cx, cy relativos al centro de la zona)
  const zoomA = (nk, cx, cy, anim) => { nk = Math.max(1, Math.min(6, nk)); tx = cx - (cx - tx) * nk / k; ty = cy - (cy - ty) * nk / k; k = nk; if(k <= 1.01){ k = 1; tx = ty = 0; } limitar(); pon(anim); };
  const centro = (x, y) => { const r = zona.getBoundingClientRect(); return [x - r.left - r.width / 2, y - r.top - r.height / 2]; };
  const P = new Map(); let ini = null, ultToque = 0, movio = false;
  zona.addEventListener('pointerdown', e => { e.preventDefault(); try{ zona.setPointerCapture(e.pointerId); }catch(_){} P.set(e.pointerId, { x:e.clientX, y:e.clientY }); movio = false;
    const ps = [...P.values()];
    if(ps.length === 2){ const d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y); ini = { d, k, tx, ty, c:centro((ps[0].x + ps[1].x) / 2, (ps[0].y + ps[1].y) / 2) }; }
    else ini = { x:e.clientX, y:e.clientY, tx, ty }; });
  zona.addEventListener('pointermove', e => { if(!P.has(e.pointerId) || !ini) return; P.set(e.pointerId, { x:e.clientX, y:e.clientY }); const ps = [...P.values()];
    if(ps.length >= 2 && ini.d){ const d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y), c = centro((ps[0].x + ps[1].x) / 2, (ps[0].y + ps[1].y) / 2);
      const nk = Math.max(1, Math.min(6, ini.k * d / Math.max(10, ini.d)));
      tx = c[0] - (ini.c[0] - ini.tx) * nk / ini.k; ty = c[1] - (ini.c[1] - ini.ty) * nk / ini.k; k = nk; limitar(); pon(false); movio = true; }
    else if(ps.length === 1 && ini.x != null){ const dx = e.clientX - ini.x, dy = e.clientY - ini.y; if(Math.hypot(dx, dy) > 6) movio = true; if(k > 1){ tx = ini.tx + dx; ty = ini.ty + dy; limitar(); pon(false); } } });
  const suelta = e => { P.delete(e.pointerId);
    if(P.size === 1){ const q = [...P.values()][0]; ini = { x:q.x, y:q.y, tx, ty }; return; }
    if(P.size) return; ini = null; if(k <= 1.01){ k = 1; tx = ty = 0; pon(true); }
    if(!movio && e.type === 'pointerup'){ const n = Date.now(); if(n - ultToque < 320){ const [cx, cy] = centro(e.clientX, e.clientY); zoomA(k > 1.5 ? 1 : 2.6, cx, cy, true); ultToque = 0; } else ultToque = n; } };
  zona.addEventListener('pointerup', suelta); zona.addEventListener('pointercancel', suelta);
  zona.addEventListener('wheel', e => { e.preventDefault(); const [cx, cy] = centro(e.clientX, e.clientY); zoomA(k * (e.deltaY < 0 ? 1.15 : 1 / 1.15), cx, cy, false); }, { passive:false });
  const cerrarV = () => { v.remove(); document.removeEventListener('keydown', tecla); };
  const tecla = e => { if(e.key === 'Escape') cerrarV(); };
  document.addEventListener('keydown', tecla);
  v.addEventListener('click', async e => { const b = e.target.closest('button'); if(!b) return; e.stopPropagation();
    if('x' in b.dataset) cerrarV();
    else if('mas' in b.dataset) zoomA(k * 1.5, 0, 0, true);
    else if('menos' in b.dataset) zoomA(k / 1.5, 0, 0, true);
    else if('g' in b.dataset) guardarFoto(src, nombre); });
}
// Guardar una foto en el aparato (en el iPhone sale «Guardar imagen»)
async function guardarFoto(src, nombre){
  try{
    const blob = await (await fetch(src)).blob(), ext = /png/.test(blob.type) ? 'png' : 'jpg';
    const nom = (String(nombre || 'foto').replace(/[\\/:*?"<>|]/g, '').trim() || 'foto') + '.' + ext;
    const f = new File([blob], nom, { type:blob.type || 'image/jpeg' });
    if(navigator.canShare && navigator.canShare({ files:[f] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)){
      try{ await navigator.share({ files:[f] }); }catch(e){} return; }
    descargar(blob, nom); toast('⬇️ Foto guardada');
  }catch(e){ console.warn(e); toast('⚠️ No se ha podido guardar la foto'); }
}
// Filas que se borran deslizándolas a la IZQUIERDA (sale rojo con «Eliminar»).
// html de cada fila: <div class="desl-fila" data-id="…"><div class="desl-del"><span>🗑 Eliminar</span></div><button class="desl-cara …">…</button></div>
function deslizarBorrar(cont, alBorrar){
  let D = null; const UMBRAL = 100;
  cont.addEventListener('pointerdown', e => { const cara = e.target.closest('.desl-cara'); if(!cara || e.button > 0 || e.target.closest('textarea,input,select,label') || cara.closest('.ed')) return; D = { cara, fila:cara.closest('.desl-fila'), x:e.clientX, y:e.clientY, dx:0, mov:false, id:e.pointerId }; });
  cont.addEventListener('pointermove', e => {
    if(!D || e.pointerId !== D.id) return;
    const rdx = e.clientX - D.x, dx = Math.min(0, rdx), dy = e.clientY - D.y;
    if(!D.mov){ if(Math.abs(rdx) < 8) return; if(Math.abs(dy) > Math.abs(rdx)){ D = null; return; } D.mov = true; try{ D.cara.setPointerCapture(e.pointerId); }catch(_){} D.fila.classList.add('desliza'); }
    D.dx = dx; D.cara.style.transform = `translateX(${dx}px)`; D.fila.classList.toggle('listo', dx < -UMBRAL);
  });
  const suelta = () => {
    if(!D) return; const d = D; D = null; if(!d.mov) return;
    cont._sinClick = Date.now();
    if(d.dx < -UMBRAL){
      d.cara.style.transition = 'transform .2s'; d.cara.style.transform = 'translateX(-110%)';
      setTimeout(() => { d.fila.style.transition = 'height .2s, opacity .2s, margin .2s'; d.fila.style.height = d.fila.offsetHeight + 'px';
        requestAnimationFrame(() => { d.fila.style.height = '0'; d.fila.style.opacity = '0'; d.fila.style.marginTop = '0'; });
        setTimeout(() => d.fila.remove(), 230); alBorrar(d.fila.dataset.id, d.fila); }, 180);
      return;
    }
    d.cara.style.transition = 'transform .25s'; d.cara.style.transform = '';
    setTimeout(() => { d.fila.classList.remove('desliza', 'listo'); d.cara.style.transition = ''; }, 260);
  };
  cont.addEventListener('pointerup', suelta); cont.addEventListener('pointercancel', suelta);
  // después de deslizar no cuenta como «tocar»
  cont.addEventListener('click', e => { if(Date.now() - (cont._sinClick || 0) < 400){ e.stopPropagation(); e.preventDefault(); } }, true);
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
  fueraVelo(v, () => cerrarHojaMio());
  document.body.appendChild(v); requestAnimationFrame(() => v.classList.add('mio-ver'));
  return v.querySelector('.mio-hoja');
}
function cerrarHojaMio(){ const v = $('#mioVelo'); if(v) v.remove(); }
// Ventana centrada (como los popups de HOME)
function popMio(html, clase){
  cerrarPopMio();
  const v = document.createElement('div'); v.className = 'mio-velo mio-velo-c'; v.id = 'mioPop';
  v.innerHTML = `<div class="mio-pop ${clase || ''}" role="dialog">${html}</div>`;
  fueraVelo(v, () => { if(v._alCerrar) v._alCerrar(); cerrarPopMio(); });
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
    const pw = 210, ph = 297, altoPag = Math.floor(cv.width * ph / pw), hojas = [];
    for(let y = 0, n = 0; y < cv.height; y += altoPag, n++){
      if(n) doc.addPage();
      const trozo = document.createElement('canvas'); trozo.width = cv.width; trozo.height = altoPag;   // cada hoja, entera (A4)
      const tx = trozo.getContext('2d'); tx.fillStyle = papel; tx.fillRect(0, 0, trozo.width, trozo.height); tx.drawImage(cv, 0, -y);
      const jpg = trozo.toDataURL('image/jpeg', 0.88); hojas.push(jpg);
      doc.addImage(jpg, 'JPEG', 0, 0, pw, ph);
    }
    const blob = doc.output('blob'); nombre = String(nombre || 'documento').replace(/[^\w\- áéíóúñç]/gi, '').trim().slice(0, 50) + '.pdf';
    $('#toast').classList.remove('ver');
    verPdf(hojas, blob, nombre);      // primero se ve; se guarda solo si quieres
  }catch(e){ console.warn(e); toast('⚠️ No se pudo hacer el PDF'); }
  finally{ z.remove(); }
}

// Ver un PDF antes de guardarlo: ocupa toda la pantalla, se pasa hacia abajo y con dos dedos se amplía.
function verPdf(hojas, blob, nombre){
  const v = document.createElement('div'); v.className = 'vpd';
  v.innerHTML = `<div class="vpd-top"><button class="vpd-b vpd-x" data-x aria-label="Cerrar">✕</button><b>${esc(nombre)}</b><button class="vpd-b vpd-g" data-g>📤 Guardar</button></div>
    <div class="vpd-zona"><div class="vpd-hojas">${hojas.map((h, i) => `<img src="${h}" alt="Hoja ${i + 1}" draggable="false">`).join('')}</div></div>
    <div class="vpd-pie"><button class="vpd-b" data-menos aria-label="Más pequeño">－</button><span class="vpd-n">${hojas.length} ${hojas.length === 1 ? 'hoja' : 'hojas'} · 🤏 dos dedos para ampliar</span><button class="vpd-b" data-mas aria-label="Más grande">＋</button></div>`;
  document.body.appendChild(v);
  const zona = $('.vpd-zona', v), hs = $('.vpd-hojas', v); let k = 1;
  // ampliar cambiando el ancho de las hojas: así se mueve con el dedo de forma normal (arriba, abajo y a los lados)
  const zoom = (nk, fx, fy) => {
    nk = Math.max(1, Math.min(5, nk)); const r = zona.getBoundingClientRect();
    fx = fx == null ? r.width / 2 : fx; fy = fy == null ? r.height / 2 : fy;
    const px = (zona.scrollLeft + fx) / k, py = (zona.scrollTop + fy) / k;
    k = nk; hs.style.width = (k * 100) + '%';
    zona.scrollLeft = px * k - fx; zona.scrollTop = py * k - fy; v.classList.toggle('ampliado', k > 1.02);
  };
  const P = new Map(); let ini = null;
  zona.addEventListener('pointerdown', e => { if(e.pointerType !== 'touch') return; P.set(e.pointerId, e); if(P.size === 2){ const [a, b] = [...P.values()]; const r = zona.getBoundingClientRect(); ini = { d:Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), k, fx:(a.clientX + b.clientX) / 2 - r.left, fy:(a.clientY + b.clientY) / 2 - r.top }; } });
  zona.addEventListener('pointermove', e => { if(!P.has(e.pointerId)) return; P.set(e.pointerId, e); if(P.size === 2 && ini){ const [a, b] = [...P.values()]; zoom(ini.k * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / Math.max(10, ini.d), ini.fx, ini.fy); } });
  const fuera = e => { P.delete(e.pointerId); if(P.size < 2) ini = null; };
  zona.addEventListener('pointerup', fuera); zona.addEventListener('pointercancel', fuera);
  zona.addEventListener('wheel', e => { if(!e.ctrlKey) return; e.preventDefault(); const r = zona.getBoundingClientRect(); zoom(k * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX - r.left, e.clientY - r.top); }, { passive:false });
  let ult = 0; zona.addEventListener('click', e => { const n = Date.now(); if(n - ult < 320){ const r = zona.getBoundingClientRect(); zoom(k > 1.5 ? 1 : 2.5, e.clientX - r.left, e.clientY - r.top); ult = 0; } else ult = n; });
  const cerrarV = () => { v.remove(); document.removeEventListener('keydown', tecla); };
  const tecla = e => { if(e.key === 'Escape') cerrarV(); };
  document.addEventListener('keydown', tecla);
  v.addEventListener('click', async e => { const b = e.target.closest('.vpd-b'); if(!b) return;
    if('x' in b.dataset) cerrarV();
    else if('mas' in b.dataset) zoom(k * 1.4); else if('menos' in b.dataset) zoom(k / 1.4);
    else if('g' in b.dataset){
      const file = new File([blob], nombre, { type:'application/pdf' });
      if(matchMedia('(pointer:coarse)').matches && navigator.canShare && navigator.canShare({ files:[file] })){
        try{ await navigator.share({ files:[file], title:nombre }); toast('📄 PDF «' + nombre + '» listo'); }catch(err){ if(err.name !== 'AbortError') descargar(blob, nombre); }
      } else { descargar(blob, nombre); toast('📄 PDF «' + nombre + '» guardado'); }
    } });
}
// Una fila que se desliza de lado: con el dedo ya va sola; con el ratón, arrastrando (y sin que cuente como clic)
function deslizarLado(el){
  if(!el || el._lado) return; el._lado = true;
  let D = null;
  const marcar = () => { el.classList.toggle('mas-der', el.scrollLeft + el.clientWidth < el.scrollWidth - 4); el.classList.toggle('mas-izq', el.scrollLeft > 4); };
  el.addEventListener('scroll', marcar, { passive:true }); setTimeout(marcar, 60);
  el.addEventListener('pointerdown', e => { if(e.pointerType !== 'mouse' || e.button) return; D = { x:e.clientX, s:el.scrollLeft, mov:false }; });
  addEventListener('pointermove', e => { if(!D) return; const dx = e.clientX - D.x; if(Math.abs(dx) > 5) D.mov = true; if(D.mov){ el.scrollLeft = D.s - dx; e.preventDefault(); } });
  addEventListener('pointerup', () => { if(D && D.mov){ const quita = ev => { ev.stopPropagation(); ev.preventDefault(); }; el.addEventListener('click', quita, { capture:true, once:true }); setTimeout(() => el.removeEventListener('click', quita, true), 50); } D = null; });
  el.addEventListener('wheel', e => { if(Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth){ el.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive:false });
}

/* Cerrar una ventana tocando fuera, pero SOLO si el toque empezó y acabó fuera.
   (Al seleccionar texto, o cuando sale el teclado del móvil y la ventana se mueve, el «toque» podía caer fuera y cerraba la nota.) */
let _vpCambio = 0;
if(window.visualViewport) visualViewport.addEventListener('resize', () => { _vpCambio = Date.now(); });
addEventListener('resize', () => { _vpCambio = Date.now(); });
document.addEventListener('focusin', e => { if(e.target.matches && e.target.matches('input,textarea,[contenteditable]')) _vpCambio = Date.now(); });
function fueraVelo(v, cerrar){
  let empezo = false;
  v.addEventListener('pointerdown', e => { empezo = e.target === v; });
  v.addEventListener('click', e => {
    if(e.target !== v) return;
    const conTexto = (() => { try{ return String(getSelection()).length > 0; }catch(_){ return false; } })();
    if(!empezo || conTexto || Date.now() - _vpCambio < 800){ empezo = false; return; }
    empezo = false; cerrar();
  });
}
