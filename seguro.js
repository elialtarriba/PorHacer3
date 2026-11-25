/* PorHacer3 · Copias seguras (V19.6)
   - Copia por apartados: Tareas (y Calendario), Listas, Agenda, Tickets (con Gastos), Sitios, Grabar y Notas secretas.
     «Copia de todo» = los 7 apartados en un solo archivo. Se puede elegir qué apartados recuperar.
   - Al recuperar NUNCA se repite nada: todo va por su identificador; si ya existe, se queda el más nuevo.
     Además, «Juntar» une los puntos de las listas, las notas de cada día y las cosas de cada sitio.
   - Copias automáticas: cada día, al abrir la app, se guarda sola una copia de cada apartado
     (en este aparato, los últimos 14 días; y en tu cuenta de la nube, los últimos 10 días).
     Antes de «Dejarlo como en la copia» o de «Quitar repetidos» también se guarda una, por si acaso.
   - Quitar repetidos: busca tickets, notas, puntos de listas, cosas de sitios y tareas iguales, enseña cuántos hay y los quita. */

const Seguro = {
  SECC: [
    { k:'tareas',  ico:'✅', t:'Tareas y Calendario' },
    { k:'listas',  ico:'📝', t:'Listas' },
    { k:'agenda',  ico:'📒', t:'Agenda' },
    { k:'tickets', ico:'🧾', t:'Tickets (y Gastos)' },
    { k:'sitios',  ico:'🏡', t:'Sitios' },
    { k:'grabar',  ico:'🎙️', t:'Grabar' },
    { k:'bloc',    ico:'🔒', t:'Notas secretas' }
  ],
  AUTO: ['tareas', 'listas', 'agenda', 'tickets', 'sitios', 'bloc'],   // Grabar no: los audios ocupan demasiado
  DIAS_APARATO: 14, DIAS_NUBE: 10,
  nombre(k){ const s = this.SECC.find(x => x.k === k); return s ? s.ico + ' ' + s.t : k; },
  espera(ms){ return new Promise(r => setTimeout(r, ms)); },

  /* ================= LEER CADA APARTADO ================= */
  fotosDe(ids){ const out = {}; (ids || []).forEach(id => { if(!id) return; const f = Mio.uno('fotos', id); if(f) out[id] = f; }); return out; },
  async leer(k, o = {}){            // o.ligero: sin fotos ni audios (para las copias automáticas)
    if(k === 'tareas'){
      if(typeof Nube !== 'undefined' && Nube.user){
        for(let i = 0; i < 40 && Nube.listos < 2; i++) await this.espera(250);
        if(Nube.listos < 2) throw new Error('La cuenta aún está conectando');
        if(!o.ligero) return { tableros:await Nube.copiaTableros(false, o.avance) };
        const out = [];
        for(const t of [...Nube.misTableros(), ...Nube.compartidos()]){
          const get = async n => (await Nube.colDe(t.id, n).get()).docs.map(d => d.data());
          const cf = await Nube.colDe(t.id, 'config').doc('tablero').get().catch(() => null);
          out.push({ id:t.id, nombre:t.nombre || '', mio:Nube.esDueno(t), creado:t.creado || 0, tareas:await get('tareas'), personas:await get('personas'), config:cf && cf.exists ? cf.data() : null, media:[] });
        }
        return { tableros:out };
      }
      return { local:o.ligero ? { app:'PorHacer', ajustes:App.ajustes, tareas:App.tareas.map(limpiaTarea), personas:App.personas, fotos:[], videos:[], audios:[] } : await Copias.datos(true, false) };
    }
    if(k === 'listas') return { listas:JSON.parse(JSON.stringify(Listas.datos || [])), fondos:o.ligero ? {} : { ...(Listas.fondos || {}) } };
    if(k === 'agenda'){ const agenda = Mio.todos('agenda'); return { agenda, fotos:o.ligero ? {} : this.fotosDe(agenda.flatMap(d => (d.items || []).flatMap(it => it.fotos || []))) }; }
    if(k === 'tickets'){ const tickets = Mio.todos('tickets'), gastos = Mio.todos('gastos');
      return { tickets, gastos, fotos:o.ligero ? {} : this.fotosDe([...tickets.flatMap(t => [t.foto, t.fotoProd, ...(t.fotos || [])]), ...gastos.flatMap(t => t.fotos || [])]) }; }
    if(k === 'sitios'){ const sitios = Mio.todos('sitios');
      return { sitios, fotos:o.ligero ? {} : this.fotosDe(sitios.flatMap(s => [...(s.fotos || []), s.fotoCasa, ...Object.values(s.cosas || {}).flatMap(c => c.fotos || [])])) }; }
    if(k === 'grabar'){ const g = []; for(const x of (await Completa.grabaciones())) g.push({ ...x, blob:await blobADatos(x.blob) }); return { grabaciones:g }; }
    if(k === 'bloc') return { paq:await Bloc.leerPaq().catch(() => null) };
    return null;
  },
  // cuántas cosas hay (para enseñarlo)
  contar(k, d){
    if(!d) return 0;
    if(k === 'tareas') return d.tableros ? d.tableros.reduce((n, b) => n + (b.tareas || []).length, 0) : ((d.local && d.local.tareas) || []).length;
    if(k === 'listas') return (d.listas || []).reduce((n, l) => n + (l.items || []).length, 0);
    if(k === 'agenda') return (d.agenda || []).reduce((n, x) => n + (x.items || []).length, 0);
    if(k === 'tickets') return (d.tickets || []).filter(t => !t.tipo).length + (d.gastos || []).filter(t => t.tipo === 'gasto').length;
    if(k === 'sitios') return (d.sitios || []).reduce((n, s) => n + 1 + Object.keys(s.cosas || {}).length, 0);
    if(k === 'grabar') return (d.grabaciones || []).length;
    if(k === 'bloc') return d.paq ? 1 : 0;
    return 0;
  },
  unidad(k, n){ const u = { tareas:['tarea','tareas'], listas:['punto','puntos'], agenda:['nota','notas'], tickets:['ticket','tickets'], sitios:['sitio o cosa','sitios y cosas'], grabar:['grabación','grabaciones'], bloc:['bloc','bloc'] }[k]; return n + ' ' + (n === 1 ? u[0] : u[1]); },

  /* ================= PONER UN APARTADO (sin repetir) ================= */
  nuevo(a, b){ const t = x => (x && (x.cambiado || x.cambiada || x.actualizada || x.t || x.creado || x.creada)) || 0; return t(a) > t(b); },
  claveTicket(t){ return [t.tipo || '', t.fecha || '', norm(String(t.titulo || '').trim()).replace(/\s+/g, ' '), t.importe == null ? '' : Number(t.importe).toFixed(2)].join('|'); },
  // une dos listas de cosas con id (puntos, notas): lo que falta se añade y, si está en las dos, se queda el más nuevo
  unirPorId(mios, copia){
    const out = (mios || []).map(x => ({ ...x })), idx = {}; out.forEach((x, i) => { if(x && x.id) idx[x.id] = i; });
    for(const x of copia || []){ if(!x) continue; if(x.id && idx[x.id] != null){ if(this.nuevo(x, out[idx[x.id]])) out[idx[x.id]] = { ...x }; } else out.push({ ...x }); }
    return out;
  },
  async ponerFotos(fotos, de){ for(const [id, f] of Object.entries(fotos || {})) if(f && !Mio.uno('fotos', id)) await Mio.poner('fotos', id, { ...f, de:f.de || de }); },
  async poner(k, d, modo){            // modo: 'juntar' | 'cambiar'
    if(!d) return;
    if(k === 'tareas'){
      if(d.tableros && d.tableros.length){
        if(!(typeof Nube !== 'undefined' && Nube.user)) throw new Error('Para recuperar los tableros entra antes con tu cuenta');
        for(const b of d.tableros) await Nube.restaurarTablero(b, modo);
        return;
      }
      if(d.local) await Copias.meter(d.local, modo === 'cambiar' && !Nube.activa ? 'sustituir' : 'anadir', false);
      [App.tareas, App.personas] = await Promise.all([DB.todos('tareas'), DB.todos('personas')]); await contarMedia(); pintarTodo();
      return;
    }
    if(k === 'agenda' || k === 'tickets' || k === 'sitios'){
      await this.ponerFotos(d.fotos, k);
      const cols = k === 'tickets' ? ['tickets', 'gastos'] : [k];
      for(const col of cols){
        const copia = (d[col] || []).filter(x => x && x.id);
        if(modo === 'cambiar'){ const ids = new Set(copia.map(x => x.id)); for(const id of Object.keys(Mio.datos[col])) if(!ids.has(id)) await Mio.quitar(col, id); for(const x of copia) await Mio.poner(col, x.id, x); continue; }
        const claves = col === 'tickets' ? new Set(Mio.todos('tickets').map(t => this.claveTicket(t))) : null;
        for(const x of copia){
          const ya = Mio.uno(col, x.id);
          if(!ya){ if(claves && claves.has(this.claveTicket(x))) continue;     // ese mismo ticket ya está (con otro id): no se repite
            await Mio.poner(col, x.id, x); if(claves) claves.add(this.claveTicket(x)); continue; }
          if(col === 'agenda'){ const items = this.unirPorId(ya.items, x.items); if(JSON.stringify(items) !== JSON.stringify(ya.items)) await Mio.poner(col, x.id, { ...ya, items }); continue; }
          if(col === 'sitios'){ const base = this.nuevo(x, ya) ? x : ya, cosas = { ...(x.cosas || {}), ...(ya.cosas || {}) };
            for(const [cid, c] of Object.entries(x.cosas || {})) if(ya.cosas && ya.cosas[cid] && this.nuevo(c, ya.cosas[cid])) cosas[cid] = c;
            const n = { ...base, cosas }; if(JSON.stringify(n) !== JSON.stringify(ya)) await Mio.poner(col, x.id, n); continue; }
          if(this.nuevo(x, ya)) await Mio.poner(col, x.id, x);
        }
      }
      if(k === 'tickets' && typeof Gastos !== 'undefined'){ try{ Gastos.pintarBoton(); }catch(e){} }
      return;
    }
    if(k === 'listas'){
      const copia = (d.listas || []).filter(l => l && l.id);
      if(modo === 'cambiar'){ const ids = new Set(copia.map(l => l.id)); for(const l of [...Listas.datos]) if(!ids.has(l.id)) await Listas.borrar(l, true); }
      for(const l of copia){
        let ya = Listas.datos.find(x => x.id === l.id);
        if(!ya && modo !== 'cambiar') ya = Listas.datos.find(x => Listas.mismoNombre(x.nombre, l.nombre));
        if(ya && modo !== 'cambiar'){ ya.items = this.unirPorId(ya.items, l.items);
          // puntos iguales que entraron con otro id: se quedan una sola vez
          const vistos = new Set(); ya.items = ya.items.filter(it => { const c = Listas.norm(it.t) + '|' + !!it.ok; if(vistos.has(c)) return false; vistos.add(c); return true; });
          await Listas.guardar(ya); continue; }
        const i = Listas.datos.findIndex(x => x.id === l.id); if(i >= 0) Listas.datos[i] = l; else Listas.datos.push(l);
        await Listas.guardar(l);
      }
      for(const [id, img] of Object.entries(d.fondos || {})){ if(Listas.fondos[id] && modo !== 'cambiar') continue; Listas.fondos[id] = img; if(Listas.modo === 'nube') await Listas.ref('fondos').doc(id).set({ img }).catch(() => {}); }
      if(Listas.modo !== 'nube') Listas.lsGuardar(); Listas.pintar && Listas.pintar();
      return;
    }
    if(k === 'grabar'){
      const copia = (d.grabaciones || []).filter(g => g && g.id), ids = new Set(copia.map(g => g.id));
      if(modo === 'cambiar') for(const g of [...Grabar.lista]) if(!ids.has(g.id)) await Grabar.quitar(g.id);
      for(const g of copia){ const ya = Grabar.lista.find(x => x.id === g.id); if(ya && !this.nuevo(g, ya) && modo !== 'cambiar') continue; if(!g.blob) continue;
        await Grabar.tx('readwrite', st => st.put({ ...g, blob:datosABlob(g.blob) })); if(typeof Guardar !== 'undefined') try{ Guardar.cambioGrabar({ ...g, blob:datosABlob(g.blob) }); }catch(e){} }
      await Grabar.cargar(); return;
    }
    if(k === 'bloc'){ if(!d.paq) return; const ya = await Bloc.leerPaq().catch(() => null); if(!ya || modo === 'cambiar') await Bloc.ponerPaq(d.paq); return; }
  },

  /* ================= EXPORTAR / IMPORTAR ARCHIVOS ================= */
  async exportar(secs, boton){
    if(this.ocupado) return; this.ocupado = true;
    const txt0 = boton && boton.textContent; if(boton) boton.disabled = true;
    try{
      const c = { app:'PorHacer3', tipo:'copia-segura', v:1, fecha:new Date().toISOString(), version:VERSION, secciones:{} };
      for(const k of secs){ if(boton) boton.textContent = '⏳ ' + this.nombre(k) + '…';
        c.secciones[k] = await esperaCopia(this.leer(k, { avance:t => { if(boton) boton.textContent = '⏳ ' + t; } }), this.nombre(k), 180000); }
      const blob = new Blob([JSON.stringify(c)], { type:'application/json' });
      const todo = secs.length === this.SECC.length, nom = 'PorHacer_' + (todo ? 'Todo' : secs.map(capital).join('_')) + '_' + hoyIso() + '.json';
      const lista = secs.map(k => `<li>${this.nombre(k)} · <b>${this.unidad(k, this.contar(k, c.secciones[k]))}</b></li>`).join('');
      await popup({ tit:'💾 Copia preparada', html:`<ul class="cc-lista">${lista}</ul><p>${esc(tamTxt(blob.size))} · Pulsa <b>Guardar copia</b> y guárdala en iCloud Drive (por ejemplo en la carpeta «Copies Seg»).</p><p class="aj-ayuda">No subas nunca este archivo a GitHub: lleva tus datos.</p>`,
        botones:[{ txt:'Cerrar', val:false }, { txt:'💾 Guardar copia', cls:'btn-pri', val:() => { descargar(blob, nom); return true; } }] });
    }catch(e){ console.error(e); popAviso('No se pudo hacer la copia', e.message || String(e)); }
    finally{ this.ocupado = false; if(boton){ boton.disabled = false; boton.textContent = txt0; } }
  },
  // Convierte cualquier copia (nueva o de las de antes) a apartados
  aSecciones(c){
    if(!c) return null;
    if(c.tipo === 'copia-segura') return c.secciones || {};
    const s = {};
    const deMio = m => { if(!m) return;
      if(m.agenda) s.agenda = { agenda:m.agenda, fotos:m.fotos || {} };
      if(m.tickets || m.gastos) s.tickets = { tickets:m.tickets || [], gastos:m.gastos || [], fotos:m.fotos || {} };
      if(m.sitios) s.sitios = { sitios:m.sitios, fotos:m.fotos || {} };
      if(m.listas) s.listas = { listas:m.listas, fondos:m.fondos || {} }; };
    if(c.tipo === 'copia-completa'){
      if(c.tableros && c.tableros.length) s.tareas = { tableros:c.tableros }; else if(c.tareas) s.tareas = { local:c.tareas };
      deMio(c.mio);
      if(c.grabaciones && c.grabaciones.length) s.grabar = { grabaciones:c.grabaciones };
      if(c.bloc) s.bloc = { paq:c.bloc };
      return s;
    }
    if(c.tipo === 'copia-mia'){ deMio(c); return s; }
    if(c.app === 'PorHacer' && Array.isArray(c.tareas)){ s.tareas = { local:c }; return s; }
    return null;
  },
  async importar(f){
    let c; try{ c = JSON.parse(await f.text()); }catch(e){ popAviso('Recuperar', 'Este archivo no es una copia válida.'); return; }
    if(c && c.app === 'Hogar'){ await Ajustes.importarHome(c); return; }
    if(c && c.tipo === 'copia-completa-cifrada'){ const t = await Completa.descifrarTexto(c); if(!t) return; try{ c = JSON.parse(t); }catch(e){ popAviso('Recuperar', 'La copia cifrada está dañada.'); return; } }
    c = limpiarDato(c);
    const s = this.aSecciones(c);
    if(!s || !Object.keys(s).length){ popAviso('Recuperar', 'Este archivo no es una copia de PorHacer3.'); return; }
    await this.preguntarYPoner(s, 'Copia del ' + new Date(c.fecha || Date.now()).toLocaleString('es-ES', { dateStyle:'long', timeStyle:'short' }));
  },
  // Enseña qué trae la copia, deja elegir apartados y cómo, y lo pone
  async preguntarYPoner(s, titulo){
    const ks = this.SECC.map(x => x.k).filter(k => s[k]);
    const filas = ks.map(k => { const n = this.contar(k, s[k]); return `<label class="check"><input type="checkbox" data-sk="${k}" ${n ? 'checked' : ''}><span class="caja"></span><span>${this.nombre(k)}<small>${this.unidad(k, n)}</small></span></label>`; }).join('');
    let elegidos = [];
    const modo = await popup({ tit:'🛟 Recuperar', html:`<p><b>${esc(titulo)}</b></p><p class="aj-ayuda">Marca lo que quieres recuperar:</p>${filas}
        <button class="opcion opc2" data-v="juntar" style="margin-top:12px">➕ Juntar con lo que tengo<small>No se borra nada y nada se repite: se añade lo que falta</small></button>
        <button class="opcion opc2" data-v="cambiar">♻️ Dejarlo como en la copia<small>Solo en lo marcado. Antes se guarda una copia automática de cómo está ahora</small></button>`,
      botones:[{ txt:'Cancelar', val:null }], alAbrir:(cx, fin) => $$('[data-v]', cx).forEach(b => b.onclick = () => { elegidos = $$('[data-sk]', cx).filter(i => i.checked).map(i => i.dataset.sk); fin(b.dataset.v); }) });
    if(!modo) return;
    if(!elegidos.length){ toast('No has marcado nada'); return; }
    if(modo === 'cambiar' && !await popConfirmar('¿Dejarlo como en la copia?', 'En ' + elegidos.map(k => this.nombre(k)).join(', ') + ' lo que tienes ahora se cambiará por lo de la copia. Antes se guarda una copia automática por si quieres volver atrás.', 'Sí, dejarlo así')) return;
    if(modo === 'cambiar'){ toast('🛟 Guardando cómo está ahora…', null, null, 20000); for(const k of elegidos) await this.instantanea(k, 'antes').catch(e => console.warn(e)); }
    const fallos = [];
    for(const k of elegidos){ toast('⏳ Recuperando ' + this.nombre(k) + '…', null, null, 60000); try{ await this.poner(k, s[k], modo); }catch(e){ console.warn(e); fallos.push(this.nombre(k) + ' (' + (e.message || e) + ')'); } }
    if(fallos.length) popAviso('Recuperado… casi', 'No se ha podido recuperar: ' + fallos.join(', ') + '. Lo demás, sí.');
    else toast('✅ Recuperado: ' + elegidos.map(k => this.nombre(k)).join(', '), null, null, 5000);
    try{ Ajustes.refrescar(); }catch(e){}
  },

  /* ================= COPIAS AUTOMÁTICAS ================= */
  _db: null,
  idb(){
    if(this._db) return this._db;
    this._db = new Promise((ok, mal) => { const r = indexedDB.open('ph3-seguro', 1); r.onupgradeneeded = () => r.result.createObjectStore('c'); r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error); });
    return this._db;
  },
  async op(modo, fn){ const db = await this.idb(); return new Promise((ok, mal) => { const t = db.transaction('c', modo), st = t.objectStore('c'); const r = fn(st); let out; if(r) r.onsuccess = () => out = r.result; t.oncomplete = () => ok(out); t.onerror = () => mal(t.error); }); },
  uid(){ return (typeof Nube !== 'undefined' && Nube.user && Nube.user.emailVerified !== false) ? Nube.user.uid : null; },
  refNube(){ return Nube.db.collection('usuarios').doc(this.uid()).collection('copiasAuto'); },
  listo(k){
    if(k === 'tareas') return !(typeof Nube !== 'undefined' && Nube.user) || Nube.listos >= 2;
    if(k === 'listas') return !!Listas._iniciado && (Listas.modo !== 'nube' || Listas.datos.length > 0);
    if(k === 'bloc') return true;
    const col = k === 'tickets' ? 'tickets' : k;
    return !!Mio._listo && !Mio._ocupado && (!Mio.enNube(col) || !!(Mio._servidor || {})[col]);
  },
  // Guarda una copia de un apartado (tipo «dia»: una al día; «antes»: antes de cambiar algo)
  async instantanea(k, tipo = 'dia'){
    const d = await this.leer(k, { ligero:true }), n = this.contar(k, d);
    if(!n && tipo === 'dia') return false;                    // vacío: no hace falta
    const t = Date.now(), dia = hoyIso(), id = k + '|' + (tipo === 'dia' ? dia : 'antes-' + t);
    const reg = { id, sec:k, tipo, dia, t, n, datos:JSON.stringify(d) };
    await this.op('readwrite', st => st.put(reg, id));
    if(this.uid() && reg.datos.length < 900000) await this.refNube().doc(id.replace('|', '__')).set(reg).catch(e => console.warn('copia auto nube', e));
    return true;
  },
  async auto(){
    if(this._autoEnMarcha) return; this._autoEnMarcha = true;
    try{
      const dia = hoyIso(), hechas = new Set((await this.op('readonly', st => st.getAllKeys())) || []);
      for(const k of this.AUTO){
        if(hechas.has(k + '|' + dia) || !this.listo(k)) continue;
        try{ await this.instantanea(k, 'dia'); }catch(e){ console.warn('copia auto', k, e); }
      }
      await this.limpiar();
    }finally{ this._autoEnMarcha = false; }
  },
  // Se quedan los últimos días; lo más viejo se quita
  async limpiar(){
    const lim = d => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
    const todas = (await this.op('readonly', st => st.getAll())) || [], l1 = lim(this.DIAS_APARATO);
    for(const r of todas) if(r.dia < l1) await this.op('readwrite', st => st.delete(r.id));
    if(this.uid() && !lsGet('ph3-seguro-limpio-' + hoyIso())){
      try{ const l2 = lim(this.DIAS_NUBE); for(const d of (await this.refNube().where('dia', '<', l2).get()).docs) await d.ref.delete(); lsSet('ph3-seguro-limpio-' + hoyIso(), '1'); }catch(e){ console.warn(e); }
    }
  },
  async lista(k){
    const out = {};
    for(const r of ((await this.op('readonly', st => st.getAll())) || [])) if(r.sec === k) out[r.id] = { ...r, donde:'📱' };
    if(this.uid()){ try{ for(const d of (await this.refNube().where('sec', '==', k).get()).docs){ const r = d.data(); out[r.id] = out[r.id] ? { ...out[r.id], donde:'📱☁️' } : { ...r, donde:'☁️' }; } }catch(e){ console.warn(e); } }
    return Object.values(out).sort((a, b) => b.t - a.t);
  },
  async verAutomaticas(){
    const k = await popup({ tit:'🕒 Copias automáticas', html:'<p>¿De qué apartado?</p>' + this.AUTO.map(k => `<button class="opcion" data-k="${k}">${this.nombre(k)}</button>`).join('')
      + '<p class="aj-ayuda" style="margin-top:10px">La app guarda sola una copia de cada apartado cada día. Guarda los textos: las fotos y las grabaciones no van en estas copias (para eso, haz una copia a mano de vez en cuando).</p>',
      botones:[{ txt:'Cerrar', val:null }], alAbrir:(c, fin) => $$('[data-k]', c).forEach(b => b.onclick = () => fin(b.dataset.k)) });
    if(!k) return;
    toast('⏳ Buscando copias…', null, null, 8000);
    const l = await this.lista(k);
    if(!l.length){ popAviso(this.nombre(k), 'Todavía no hay copias automáticas de este apartado. Se hace una cada día al abrir la app.'); return; }
    const fecha = r => new Date(r.t).toLocaleString('es-ES', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' });
    const id = await popup({ tit:this.nombre(k), html:'<p>Elige el día que quieres recuperar:</p>' + l.map(r => `<button class="opcion opc2" data-id="${esc(r.id)}">${r.tipo === 'antes' ? '🛟 Antes de cambiar · ' : '📅 '}${esc(fecha(r))}<small>${this.unidad(k, r.n)} · ${r.donde === '📱' ? 'en este aparato' : r.donde === '☁️' ? 'en tu cuenta' : 'en este aparato y en tu cuenta'}</small></button>`).join(''),
      botones:[{ txt:'Cerrar', val:null }], alAbrir:(c, fin) => $$('[data-id]', c).forEach(b => b.onclick = () => fin(b.dataset.id)) });
    if(!id) return;
    const r = l.find(x => x.id === id); let d; try{ d = limpiarDato(JSON.parse(r.datos)); }catch(e){ popAviso('Copia dañada', 'No se puede leer esta copia.'); return; }
    await this.preguntarYPoner({ [k]:d }, 'Copia automática del ' + fecha(r));
  },

  /* ================= QUITAR REPETIDOS ================= */
  buscarRepetidos(){
    const r = { tickets:[], agenda:[], listas:[], sitios:[], tareas:[] };
    // Tickets: misma fecha, mismo nombre y mismo importe → se queda el primero que se hizo (o el que tiene foto)
    const g = {}; Mio.todos('tickets').filter(t => !t.tipo).forEach(t => (g[this.claveTicket(t)] = g[this.claveTicket(t)] || []).push(t));
    Object.values(g).forEach(a => { if(a.length < 2) return; a.sort((x, y) => (!!y.foto - !!x.foto) || ((x.creado || 0) - (y.creado || 0))); a.slice(1).forEach(t => r.tickets.push({ id:t.id, txt:(t.titulo || 'Ticket') + ' · ' + (t.fecha || '') })); });
    // Agenda: la misma nota dos veces el mismo día
    Mio.todos('agenda').forEach(d => { const v = new Set(); (d.items || []).forEach(it => { const c = norm(String(it.texto || '')).trim() + '|' + (it.hora || ''); if(!c.trim() || c === '|') return; if(v.has(c)) r.agenda.push({ dia:d.id, id:it.id, txt:it.texto + ' · ' + d.id }); else v.add(c); }); });
    // Listas: el mismo punto dos veces en la misma lista
    (Listas.datos || []).forEach(l => { const v = new Set(); (l.items || []).forEach(it => { const c = Listas.norm(it.t) + '|' + !!it.ok; if(v.has(c)) r.listas.push({ lista:l.id, id:it.id, txt:it.t + ' · ' + l.nombre }); else v.add(c); }); });
    // Sitios: la misma cosa dos veces en el mismo sitio
    Mio.todos('sitios').forEach(s => { const v = new Set(); Object.entries(s.cosas || {}).sort((a, b) => (a[1].creada || 0) - (b[1].creada || 0)).forEach(([cid, c]) => { const k = norm(String(c.texto || '')).trim(); if(!k) return; if(v.has(k)) r.sitios.push({ sitio:s.id, id:cid, txt:c.texto + ' · ' + s.nombre }); else v.add(k); }); });
    // Tareas: misma tarea (título, notas, columna y fechas) repetida en el tablero que tienes abierto
    const gt = {}; (App.tareas || []).forEach(t => { const c = [norm(String(t.titulo || '')).trim(), norm(String(t.notas || '')).trim(), t.colId, t.ini || '', t.fin || ''].join('|'); (gt[c] = gt[c] || []).push(t); });
    Object.values(gt).forEach(a => { if(a.length < 2 || !a[0].titulo) return; a.sort((x, y) => (x.creada || 0) - (y.creada || 0)); a.slice(1).forEach(t => r.tareas.push({ id:t.id, txt:t.titulo })); });
    return r;
  },
  async quitarRepetidos(){
    const r = this.buscarRepetidos(), nom = { tickets:'🧾 Tickets', agenda:'📒 Notas de la agenda', listas:'📝 Puntos de las listas', sitios:'🏡 Cosas de los sitios', tareas:'✅ Tareas (del tablero abierto)' };
    const ks = Object.keys(r).filter(k => r[k].length);
    if(!ks.length){ popAviso('🧹 Quitar repetidos', '¡Todo en orden! No hay nada repetido.'); return; }
    const ej = a => a.slice(0, 4).map(x => esc(x.txt)).join(' · ') + (a.length > 4 ? ' …' : '');
    let marcados = [];
    const ok = await popup({ tit:'🧹 Quitar repetidos', html:'<p>He encontrado cosas repetidas. Se queda <b>una</b> de cada y se quitan las otras:</p>' + ks.map(k => `<label class="check"><input type="checkbox" data-rk="${k}" checked><span class="caja"></span><span>${nom[k]} · <b>${r[k].length}</b> de más<small>${ej(r[k])}</small></span></label>`).join('')
      + '<p class="aj-ayuda" style="margin-top:10px">Antes de quitar nada se guarda una copia automática, por si acaso.</p>',
      botones:[{ txt:'Cancelar', val:false }, { txt:'🧹 Quitar repetidos', cls:'btn-pri', val:true }], alAbrir:(c) => { c._leer = () => marcados = $$('[data-rk]', c).filter(i => i.checked).map(i => i.dataset.rk); $$('[data-rk]', c).forEach(i => i.onchange = c._leer); c._leer(); } });
    if(!ok || !marcados.length) return;
    toast('🛟 Guardando una copia antes…', null, null, 20000);
    for(const k of marcados) await this.instantanea(k, 'antes').catch(e => console.warn(e));
    let n = 0;
    if(marcados.includes('tickets')) for(const x of r.tickets){ await Mio.quitar('tickets', x.id); n++; }
    if(marcados.includes('agenda')){ const por = {}; r.agenda.forEach(x => (por[x.dia] = por[x.dia] || new Set()).add(x.id));
      for(const [dia, ids] of Object.entries(por)){ const d = Mio.uno('agenda', dia); if(!d) continue; await Mio.poner('agenda', dia, { ...d, items:(d.items || []).filter(it => !ids.has(it.id)) }); n += ids.size; } }
    if(marcados.includes('listas')){ const por = {}; r.listas.forEach(x => (por[x.lista] = por[x.lista] || new Set()).add(x.id));
      for(const [lid, ids] of Object.entries(por)){ const l = Listas.datos.find(x => x.id === lid); if(!l) continue; l.items = (l.items || []).filter(it => !ids.has(it.id)); await Listas.guardar(l); n += ids.size; } }
    if(marcados.includes('sitios')){ const por = {}; r.sitios.forEach(x => (por[x.sitio] = por[x.sitio] || []).push(x.id));
      for(const [sid, ids] of Object.entries(por)){ const s = Mio.uno('sitios', sid); if(!s) continue; const cosas = { ...(s.cosas || {}) }; ids.forEach(id => delete cosas[id]); await Mio.poner('sitios', sid, { ...s, cosas, cambiado:Date.now() }); n += ids.length; } }
    if(marcados.includes('tareas')){ for(const x of r.tareas){ try{ App.tareas = App.tareas.filter(t => t.id !== x.id); await DB.borrar('tareas', x.id); n++; }catch(e){ console.warn(e); } } pintarTodo(); }
    toast('🧹 ' + n + (n === 1 ? ' repetido quitado' : ' repetidos quitados'), null, null, 5000);
    try{ Ajustes.refrescar(); }catch(e){}
  },

  iniciar(){
    setTimeout(() => this.auto().catch(e => console.warn(e)), 25000);
    setInterval(() => this.auto().catch(e => console.warn(e)), 30 * 60000);
    document.addEventListener('visibilitychange', () => { if(!document.hidden) setTimeout(() => this.auto().catch(() => {}), 8000); });
  }
};
