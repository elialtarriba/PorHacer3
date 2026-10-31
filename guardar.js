/* PorHacer3 · «Guardar»: dónde se guarda cada apartado
   Tareas, Calendario Tareas, Calculadora y Manual: siempre en la nube (van con la app y tus tableros).
   Agenda, Tickets, Gastos, Sitios y Listas: los lleva «Mio» / «Listas» (ya podían ir a la nube o al aparato).
   Grabar, Escribir y Notas secretas (nuevo): en este aparato o en la nube, en tu cuenta (usuarios/{uid}/…).
   En la nube, lo grande (audios, fotos de los escritos) se parte en trozos, porque Firebase no deja
   documentos de más de 1 MB. Siempre queda una copia en el aparato, para que funcione sin internet. */

const NubeTrozos = {
  T: 300000,      // letras por trozo (cabe de sobra en 1 MB)
  ref(col){ return Nube.db.collection('usuarios').doc(Guardar.uid()).collection(col); },
  async poner(col, id, obj){
    const j = JSON.stringify(obj), T = this.T, n = Math.max(1, Math.ceil(j.length / T)), R = this.ref(col);
    let antes = 0; try{ const d = await R.doc(id).get(); if(d.exists) antes = d.data().n || 1; }catch(e){}
    for(let k = 1; k < n; k++) await R.doc(id + '__p' + k).set({ j:j.slice(k * T, (k + 1) * T), de:id, k });   // primero los trozos…
    await R.doc(id).set({ j:j.slice(0, T), n, t:Date.now() });                                                  // …y al final el principal
    for(let k = n; k < antes; k++) await R.doc(id + '__p' + k).delete().catch(() => {});
  },
  async quitar(col, id){
    const R = this.ref(col); let n = 1; try{ const d = await R.doc(id).get(); if(d.exists) n = d.data().n || 1; }catch(e){}
    await R.doc(id).delete().catch(() => {}); for(let k = 1; k < n; k++) await R.doc(id + '__p' + k).delete().catch(() => {});
  },
  async vaciar(col){ const s = await this.ref(col).get(); for(const d of s.docs) await d.ref.delete().catch(() => {}); },
  // junta los trozos (solo los que están completos)
  armar(docs){
    const prin = {}, partes = {};
    docs.forEach(d => { if(d.id.includes('__p')) partes[d.id] = d.data().j; else prin[d.id] = d.data(); });
    const out = {};
    for(const [id, d] of Object.entries(prin)){
      let j = d.j || '', ok = true;
      for(let k = 1; k < (d.n || 1); k++){ const p = partes[id + '__p' + k]; if(p == null){ ok = false; break; } j += p; }
      if(ok){ try{ out[id] = JSON.parse(j); }catch(e){} }
    }
    return out;
  },
  escuchar(col, fn){ return this.ref(col).onSnapshot(snap => { if(snap.metadata && snap.metadata.hasPendingWrites) return; fn(this.armar(snap.docs), snap); }, e => { console.warn('nube ' + col, e); }); }
};

const Guardar = {
  NUEVOS: { grabar:'Grabar', escribir:'Escribir', bloc:'las Notas secretas' },
  _subs: {}, _clave: {},
  donde(sec){ return lsGet('ph3-donde-' + sec) === 'nube' ? 'nube' : 'aparato'; },
  uid(){ return (typeof Nube !== 'undefined' && Nube.user && Nube.user.emailVerified !== false) ? Nube.user.uid : null; },
  enNube(sec){ return this.donde(sec) === 'nube' && !!this.uid(); },
  conocidos(sec){ try{ return new Set(JSON.parse(lsGet('ph3-sync-' + sec) || '[]')); }catch(e){ return new Set(); } },
  ponerConocidos(sec, ids){ lsSet('ph3-sync-' + sec, JSON.stringify([...ids])); },
  vigilar(){
    for(const sec of Object.keys(this.NUEVOS)){
      const k = this.donde(sec) + '|' + this.uid();
      if(this._clave[sec] === k) continue;
      this._clave[sec] = k;
      if(this._subs[sec]){ try{ this._subs[sec](); }catch(e){} this._subs[sec] = null; }
      if(this.enNube(sec)) this._subs[sec] = this['escuchar_' + sec]();
    }
  },
  iniciar(){ setTimeout(() => this.vigilar(), 1500); setInterval(() => this.vigilar(), 2500); },

  /* ---------- Escribir: cada escrito, un documento (con trozos si lleva fotos) ---------- */
  escuchar_escribir(){
    return NubeTrozos.escuchar('escritos', async nube => {
      const loc = Escribir.lista(), con = this.conocidos('escribir'), out = [], subir = [];
      let cambio = false;
      for(const [id, c] of Object.entries(nube)){
        const l = loc.find(x => x.id === id);
        if(!l || (c.cambiado || 0) > (l.cambiado || 0)){ out.push(c); cambio = true; }
        else { out.push(l); if((l.cambiado || 0) > (c.cambiado || 0)) subir.push(l); }
      }
      for(const l of loc){ if(nube[l.id]) continue;
        if(con.has(l.id)) cambio = true;                                // se borró en otro aparato
        else { out.push(l); if(!Escribir.vacio(l)) subir.push(l); } }
      this._nubeEscribir = Object.fromEntries(Object.entries(nube).map(([id, c]) => [id, c.cambiado || 0]));
      if(cambio){
        this._aplicando = true; try{ localStorage.setItem('ph3-escritos', JSON.stringify(out)); }catch(e){} this._aplicando = false;
        const act = out.find(x => x.id === Escribir.id), ed = document.activeElement && document.activeElement.closest && document.activeElement.closest('#vEscribir');
        if(Escribir.activa() && !ed){ if(!act){ Escribir.id = null; Escribir.abrir(); } else Escribir.cargar(); }
        if(typeof Portada !== 'undefined') Portada.pintar && Portada.pintar();
      }
      for(const l of subir){ try{ await NubeTrozos.poner('escritos', l.id, l); this._nubeEscribir[l.id] = l.cambiado || 0; }catch(e){ console.warn(e); } }
      this.ponerConocidos('escribir', new Set([...Object.keys(nube), ...subir.map(x => x.id)]));
    });
  },
  // Escribir ha guardado su lista: se sube lo que ha cambiado (2 s después de dejar de escribir)
  cambioEscribir(){
    if(this._aplicando || !this.enNube('escribir')) return;
    clearTimeout(this._tEsc); this._tEsc = setTimeout(async () => {
      const l = Escribir.lista(), n = this._nubeEscribir || {}, con = this.conocidos('escribir');
      for(const d of l){ if(Escribir.vacio(d) && !n[d.id]) continue; if(n[d.id] !== (d.cambiado || 0)){ try{ await NubeTrozos.poner('escritos', d.id, d); n[d.id] = d.cambiado || 0; con.add(d.id); }catch(e){ console.warn(e); } } }
      for(const id of Object.keys(n)) if(!l.some(d => d.id === id)){ await NubeTrozos.quitar('escritos', id).catch(() => {}); delete n[id]; con.delete(id); }
      this._nubeEscribir = n; this.ponerConocidos('escribir', con);
    }, 2000);
  },

  /* ---------- Notas secretas: el paquete cifrado (sigue cifrado también en la nube) ---------- */
  escuchar_bloc(){
    let primera = true;
    return NubeTrozos.escuchar('bloc', async nube => {
      const c = nube.paq, tLoc = +(lsGet('ph3-bloc-t') || 0), loc = await Bloc._op('readonly', st => st.get('paq')).catch(() => null);
      if(c && c.s && (c.t || 0) > tLoc){
        this._aplicando = true; await Bloc._op('readwrite', st => st.put(c.s, 'paq')).catch(() => {}); this._aplicando = false;
        lsSet('ph3-bloc-t', String(c.t)); Bloc._hay = true;
        if(!primera && Bloc.clave) toast('🔒 Las notas secretas han cambiado en otro aparato: ciérralas y ábrelas para verlo', null, null, 6000);
      } else if(!c && loc){
        if(lsGet('ph3-sync-bloc') === '1' && !primera){ await Bloc._op('readwrite', st => st.delete('paq')).catch(() => {}); Bloc._hay = false; lsSet('ph3-sync-bloc', null); }   // borrado en otro aparato
        else { const t = tLoc || Date.now(); await NubeTrozos.poner('bloc', 'paq', { s:loc, t }); lsSet('ph3-bloc-t', String(t)); lsSet('ph3-sync-bloc', '1'); }
      } else if(c && (c.t || 0) < tLoc && loc){ await NubeTrozos.poner('bloc', 'paq', { s:loc, t:tLoc }); }
      if(c) lsSet('ph3-sync-bloc', '1');
      primera = false;
    });
  },
  async cambioBloc(str){
    const t = Date.now(); lsSet('ph3-bloc-t', String(t));
    if(this._aplicando || !this.enNube('bloc')) return;
    try{ if(str) await NubeTrozos.poner('bloc', 'paq', { s:str, t }); else { await NubeTrozos.quitar('bloc', 'paq'); lsSet('ph3-sync-bloc', null); } }catch(e){ console.warn(e); }
  },

  /* ---------- Grabar: cada nota de voz, con su audio (en trozos) ---------- */
  escuchar_grabar(){
    return NubeTrozos.escuchar('grabaciones', async nube => {
      const loc = ((await Grabar.tx('readonly', st => st.getAll()).catch(() => [])) || []), con = this.conocidos('grabar'), subir = [];
      let cambio = false;
      this._aplicando = true;
      for(const [id, c] of Object.entries(nube)){
        const l = loc.find(x => x.id === id), tc = c.cambiado || c.fecha || 0, tl = l ? (l.cambiado || l.fecha || 0) : -1;
        if(!l || tc > tl){ const { datos, ...m } = c; await Grabar.tx('readwrite', st => st.put({ ...m, blob:datosABlob(datos) })).catch(() => {}); cambio = true; }
        else if(tl > tc) subir.push(l);
      }
      for(const l of loc){ if(nube[l.id]) continue;
        if(con.has(l.id)){ await Grabar.tx('readwrite', st => st.delete(l.id)).catch(() => {}); cambio = true; }
        else subir.push(l); }
      this._aplicando = false;
      if(cambio){ await Grabar.cargar(); if(Grabar.activa && Grabar.activa()) Grabar.pintar(); }
      for(const l of subir){ try{ await this.subirGrabacion(l); }catch(e){ console.warn(e); } }
      this.ponerConocidos('grabar', new Set([...Object.keys(nube), ...subir.map(x => x.id)]));
    });
  },
  async subirGrabacion(n){ const { blob, ...m } = n; await NubeTrozos.poner('grabaciones', n.id, { ...m, datos:await blobADatos(blob) }); },
  async cambioGrabar(n, quitado){
    if(this._aplicando || !this.enNube('grabar')) return;
    const con = this.conocidos('grabar');
    try{ if(quitado){ await NubeTrozos.quitar('grabaciones', quitado); con.delete(quitado); } else { await this.subirGrabacion(n); con.add(n.id); } }catch(e){ console.warn(e); }
    this.ponerConocidos('grabar', con);
  },

  /* ---------- Cambiar de sitio (desde «Guardar» o Configuración) ---------- */
  async cambiar(sec, a, borrarNube){
    if(this.donde(sec) === a) return;
    const col = { grabar:'grabaciones', escribir:'escritos', bloc:'bloc' }[sec];
    if(this._subs[sec]){ try{ this._subs[sec](); }catch(e){} this._subs[sec] = null; }
    this.ponerConocidos(sec, []); if(sec === 'bloc') lsSet('ph3-sync-bloc', null);
    if(a === 'aparato'){ if(borrarNube && this.uid()) await NubeTrozos.vaciar(col); lsSet('ph3-donde-' + sec, 'aparato'); }
    else lsSet('ph3-donde-' + sec, 'nube');          // al escuchar la nube por primera vez se sube lo que hay aquí
    this._clave[sec] = null; this.vigilar();
  },
  hayEnNube(sec){ return this.donde(sec) === 'nube'; }
};
