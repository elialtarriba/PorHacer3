/* PorHacer3 · «Gastos»: una lista dentro de Tickets (como los Recordatorios del iPhone)
   Cada nota: varias líneas, fotos, una banderita de color (se pulsa y va cambiando: amarillo,
   naranja, verde, azul, rosa y sin color) y fechas que se ponen donde está el cursor.
   La redonda la marca como hecha: se va al final, tachada. Deslizar a la izquierda la borra.
   Se guarda con los Tickets (misma colección, tipo «gasto»), así va a la nube y a las copias. */

const Gastos = {
  COLORES: [['', 'Sin color', 'transparent'], ['amarillo', 'Amarillo', '#f2c418'], ['naranja', 'Naranja', '#f08a1a'], ['verde', 'Verde', '#3fae5a'], ['azul', 'Azul', '#2f80ed'], ['rosa', 'Rosa', '#e84898']],
  q: '', filtro: '', editando: null,

  /* ---------- Datos ---------- */
  meta(){ return Mio.uno('tickets', 'gx__meta') || { id:'gx__meta', tipo:'gastos-meta', nombre:'Gastos' }; },
  nombre(){ return (this.meta().nombre || '').trim() || 'Gastos'; },
  todos(){ return Mio.todos('tickets').filter(x => x.tipo === 'gasto'); },
  /* Pestañas (por ejemplo, los 12 meses): cada nota es de una pestaña; las de antes, de la primera */
  tabs(){ return this.meta().tabs || []; },
  tabDe(x){ const ts = this.tabs(); return x.tab && ts.some(t => t.id === x.tab) ? x.tab : (ts[0] ? ts[0].id : ''); },
  tabActiva(){ const ts = this.tabs(), a = lsGet('ph3-gx-tab'); return ts.some(t => t.id === a) ? a : (ts[0] ? ts[0].id : ''); },
  deTab(){ const a = this.tabActiva(); return this.todos().filter(x => !a || this.tabDe(x) === a); },
  uno(id){ const x = Mio.uno('tickets', id); return x && x.tipo === 'gasto' ? x : null; },
  async poner(x){ x.cambiado = Date.now(); await Mio.poner('tickets', x.id, x); },
  color(c){ return (this.COLORES.find(x => x[0] === (c || '')) || this.COLORES[0]); },
  ordenados(){
    const t = this.deTab(), q = norm(this.q.trim());
    const ok = x => (!this.filtro || x.color === this.filtro) && (!q || norm(x.texto || '').includes(q));
    const pend = t.filter(x => !x.ok && ok(x)).sort((a, b) => (b.orden || b.creado || 0) - (a.orden || a.creado || 0));
    const hechos = t.filter(x => x.ok && ok(x)).sort((a, b) => (b.hecho || 0) - (a.hecho || 0));
    return { pend, hechos };
  },

  /* ---------- Pantalla ---------- */
  abrir(){
    let v = $('#gx');
    if(!v){
      v = document.createElement('div'); v.id = 'gx'; v.className = 'gx';
      v.innerHTML = `<div class="gx-top">
          <button class="gx-cerrar" data-gxcerrar aria-label="Cerrar la lista">‹ Cerrar</button>
          <input class="gx-tit" id="gxTit" maxlength="40" aria-label="Nombre de la lista" autocomplete="off">
          <button class="gx-mas" data-nueva aria-label="Añadir una nota">＋</button>
        </div>
        <div class="gx-tabs" id="gxTabs"></div>
        <div class="gx-filtros">
          <div class="gx-buscar"><span>🔍</span><input id="gxQ" type="search" placeholder="Buscar…" autocomplete="off" enterkeyhint="search"></div>
          <div class="gx-cols" id="gxCols"></div>
        </div>
        <div class="gx-cuerpo" id="gxCuerpo"></div>`;
      document.body.appendChild(v);
      this.enlazar(v);
    }
    this.q = ''; this.filtro = ''; this.editando = null;
    $('#gxQ').value = ''; $('#gxTit').value = this.nombre();
    v.classList.add('abierto'); this.pintar();
  },
  abierto(){ const v = $('#gx'); return !!(v && v.classList.contains('abierto')); },
  async cerrar(){ await this.guardarEdicion(); const v = $('#gx'); if(v) v.classList.remove('abierto'); Tickets.pintar && Tickets.pintar(); },
  pintarTabs(){
    const ts = this.tabs(), a = this.tabActiva(), n = id => this.todos().filter(x => !x.ok && this.tabDe(x) === id).length;
    $('#gxTabs').innerHTML = ts.map(t => `<button class="gx-tab ${t.id === a ? 'on' : ''}" data-tab="${t.id}">${esc(t.nombre)}${n(t.id) ? `<small>${n(t.id)}</small>` : ''}${t.id === a ? '<em>▾</em>' : ''}</button>`).join('')
      + `<button class="gx-tab gx-tab-mas" data-tabnueva>＋ ${ts.length ? 'Pestaña' : 'Crear pestañas'}</button>`;
    const on = $('#gxTabs .gx-tab.on'); if(on && !this._tabVisto){ on.scrollIntoView({ inline:'center', block:'nearest' }); this._tabVisto = true; }
  },
  pedirNombreTab(tit, val){
    return new Promise(ok => {
      const usados = this.tabs().map(t => norm(t.nombre));
      const p = popMio(`<h3 class="mp-h">${tit}</h3><input class="mp-input" id="gxTabNom" value="${esc(val || '')}" placeholder="Nombre de la pestaña" maxlength="30" autocomplete="off">
        <div class="mp-p" style="margin-top:10px">O toca un mes:</div>
        <div class="gx-meses">${MESES_C.map(m => `<button data-mes="${m}" class="${usados.includes(norm(m)) ? 'usado' : ''}">${m}</button>`).join('')}</div>
        <button class="mp-op" data-doce><span class="mp-ic">📅</span><span><b>Crear los 12 meses de golpe</b><small>Enero, Febrero… Diciembre (los que falten)</small></span></button>
        <div class="mp-fila"><button class="mp-b" data-x>Cancelar</button><button class="mp-b mp-pri" data-ok>Guardar</button></div>`);
      if(val) $('[data-doce]', p).remove();
      p.parentNode._alCerrar = () => ok(null);
      const i = $('#gxTabNom', p); setTimeout(() => i.focus(), 150);
      i.onkeydown = e => { if(e.key === 'Enter') $('[data-ok]', p).click(); };
      p.onclick = e => { const b = e.target.closest('button'); if(!b) return;
        if(b.dataset.mes){ i.value = b.dataset.mes; return; }
        const fin = v => { p.parentNode._alCerrar = null; cerrarPopMio(); ok(v); };
        if('doce' in b.dataset) fin('__12');
        else if('ok' in b.dataset){ const v = i.value.trim(); if(!v){ i.focus(); return; } fin(v); }
        else if('x' in b.dataset) fin(null); };
    });
  },
  async nuevaTab(){
    await this.guardarEdicion();
    const n = await this.pedirNombreTab('＋ Nueva pestaña', ''); if(!n) return;
    const m = this.meta(), ts = [...(m.tabs || [])];
    if(n === '__12'){ for(const mes of MESES_C) if(!ts.some(t => norm(t.nombre) === norm(mes))) ts.push({ id:'tb_' + nuevoId('t'), nombre:mes });
      m.tabs = ts; await Mio.poner('tickets', m.id, m);
      const hoy = ts.find(t => norm(t.nombre) === norm(MESES_C[new Date().getMonth()])); if(hoy) lsSet('ph3-gx-tab', hoy.id);
      this.pintar(); toast('📅 Pestañas de los 12 meses creadas'); return; }
    if(ts.some(t => norm(t.nombre) === norm(n))){ toast('Ya hay una pestaña «' + n + '»'); return; }
    const t = { id:'tb_' + nuevoId('t'), nombre:n }; ts.push(t); m.tabs = ts; await Mio.poner('tickets', m.id, m);
    lsSet('ph3-gx-tab', t.id); this._tabVisto = false; this.pintar(); toast('📑 Pestaña «' + n + '» creada');
  },
  async opcionesTab(id){
    const t = this.tabs().find(x => x.id === id); if(!t) return;
    const n = this.todos().filter(x => this.tabDe(x) === id).length;
    const p = popMio(`<h3 class="mp-h">📑 ${esc(t.nombre)}</h3>
      <button class="mp-op" data-a="nom"><span class="mp-ic">✏️</span><span><b>Cambiar el nombre</b></span></button>
      <button class="mp-op" data-a="izq"><span class="mp-ic">⬅️</span><span><b>Mover a la izquierda</b></span></button>
      <button class="mp-op" data-a="der"><span class="mp-ic">➡️</span><span><b>Mover a la derecha</b></span></button>
      <button class="mp-op" data-a="borrar"><span class="mp-ic">🗑️</span><span><b>Borrar la pestaña</b><small>${n ? 'Y sus ' + n + (n === 1 ? ' nota' : ' notas') : 'Está vacía'}</small></span></button>
      <div class="mp-fila"><button class="mp-b" data-a="x">Cerrar</button></div>`);
    p.onclick = async e => { const b = e.target.closest('[data-a]'); if(!b) return; const a = b.dataset.a; cerrarPopMio();
      const m = this.meta(), ts = [...(m.tabs || [])], i = ts.findIndex(x => x.id === id);
      if(a === 'nom'){ const v = await this.pedirNombreTab('✏️ Nombre de la pestaña', t.nombre); if(v && v !== '__12'){ ts[i] = { ...ts[i], nombre:v }; m.tabs = ts; await Mio.poner('tickets', m.id, m); this.pintar(); } }
      else if(a === 'izq' || a === 'der'){ const j = a === 'izq' ? i - 1 : i + 1; if(j < 0 || j >= ts.length) return; [ts[i], ts[j]] = [ts[j], ts[i]]; m.tabs = ts; await Mio.poner('tickets', m.id, m); this.pintar(); }
      else if(a === 'borrar'){
        if(!await confirmarMio('Borrar pestaña', n ? `¿Borrar la pestaña «${esc(t.nombre)}» y sus ${n} ${n === 1 ? 'nota' : 'notas'}?` : `¿Borrar la pestaña «${esc(t.nombre)}»?`, 'Borrar')) return;
        const notas = this.todos().filter(x => this.tabDe(x) === id), copiaTabs = [...ts];
        for(const x of notas) await Mio.quitar('tickets', x.id);
        m.tabs = ts.filter(x => x.id !== id); await Mio.poner('tickets', m.id, m); this.pintar();
        toast('🗑 Pestaña borrada', 'Deshacer', async () => { const m2 = this.meta(); m2.tabs = copiaTabs; await Mio.poner('tickets', m2.id, m2); for(const x of notas) await Mio.poner('tickets', x.id, x); lsSet('ph3-gx-tab', id); this.pintar(); toast('↩️ La pestaña vuelve a estar'); }, 6000);
        setTimeout(() => { notas.forEach(x => { if(!this.uno(x.id)) Mio.quitarFotos(x.fotos || []); }); }, 8000);
      } };
  },
  pintarCols(){
    const n = c => this.deTab().filter(x => !x.ok && (x.color || '') === c).length;
    $('#gxCols').innerHTML = `<button data-f="" class="${!this.filtro ? 'on' : ''}">Todas</button>` + this.COLORES.slice(1).map(([c, t, h]) =>
      `<button data-f="${c}" class="${this.filtro === c ? 'on' : ''}" aria-label="${t}"><i style="background:${h}"></i>${n(c) || ''}</button>`).join('');
  },
  fila(x){
    const lineas = (x.texto || '').split('\n'), c = this.color(x.color), fotos = (x.fotos || []).map(f => ({ f, s:Mio.foto(f) })).filter(o => o.s);
    const ed = this.editando === x.id;
    return `<div class="desl-fila gx-fila ${x.ok ? 'ok' : ''} ${ed ? 'ed' : ''}" data-id="${x.id}"><div class="desl-del"><span>🗑 Eliminar</span></div>
      <div class="desl-cara gx-cara">
        <button class="gx-check" data-check aria-label="${x.ok ? 'Desmarcar' : 'Marcar como hecha'}"></button>
        <div class="gx-cont">
          ${ed ? `<textarea class="gx-txt" id="gxTxt" rows="1" placeholder="Escribe aquí… (puedes poner varias líneas)">${esc(x.texto || '')}</textarea>`
               : `<div class="gx-ver" data-editar>${lineas[0] ? `<b>${esc(lineas[0])}</b>` : '<b class="gx-vacia">Nota vacía</b>'}${lineas.slice(1).map(l => `<span>${esc(l) || '&nbsp;'}</span>`).join('')}</div>`}
          ${fotos.length ? `<div class="gx-fotos">${fotos.map(o => `<span class="gx-foto"><img src="${o.s}" alt="" data-ver="${o.f}">${ed ? `<button data-quitarfoto="${o.f}" aria-label="Quitar foto">✕</button>` : ''}</span>`).join('')}</div>` : ''}
          ${ed ? `<div class="gx-herr">
              <button class="gx-hb" data-hoy aria-label="Poner la fecha de hoy">📅</button>
              <button class="gx-hb gx-band" data-bandera aria-label="Color de la banderita" style="--bc:${c[2]}">${this.svgBandera(c[2])}</button>
              <button class="gx-hb" data-iconos aria-label="Poner un icono">✅</button>
              <button class="gx-hb gx-hbt" data-ins="€" aria-label="Poner €">€</button>
              <button class="gx-hb gx-hbt" data-ins="." aria-label="Poner un punto">.</button>
              <button class="gx-hb gx-hbt" data-lista aria-label="Lista con números o puntos">1≡</button>
              <button class="gx-hb" data-foto aria-label="Añadir foto">📷</button>
              <button class="gx-hb gx-listo" data-listo>Listo</button>
            </div>` : ''}
        </div>
        ${!ed && x.color ? `<span class="gx-flag" aria-label="${c[1]}">${this.svgBandera(c[2])}</span>` : ''}
      </div></div>`;
  },
  svgBandera(col){ const r = col === 'transparent'; return `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 21V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 4h11l-2 4 2 4H5" fill="${r ? 'none' : col}" stroke="${r ? 'currentColor' : col}" stroke-width="2" stroke-linejoin="round"/></svg>`; },
  pintar(){
    if(!$('#gx')) return;
    const c = $('#gxCuerpo'), sc = c.scrollTop, { pend, hechos } = this.ordenados(), total = this.deTab().length;
    this.pintarTabs(); this.pintarCols();
    c.innerHTML = (pend.length ? pend.map(x => this.fila(x)).join('') : `<p class="gx-nada">${total ? 'No hay notas con esto.' : 'Pulsa <b>＋</b> para añadir tu primera nota.'}</p>`)
      + (hechos.length ? `<div class="gx-sep">✓ Hechas · ${hechos.length}</div>` + hechos.map(x => this.fila(x)).join('') : '')
      + (total ? '<p class="desl-pista">👈 Desliza una nota a la izquierda para eliminarla</p>' : '');
    c.scrollTop = sc;
    const t = $('#gxTxt'); if(t){ this.auto(t); }
  },
  auto(t){ t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; },

  /* ---------- Editar ---------- */
  async nueva(){
    await this.guardarEdicion();
    const x = { id:'gx_' + nuevoId('g'), tipo:'gasto', texto:'', ok:false, color:'', fotos:[], creado:Date.now(), orden:Date.now() };
    const tb = this.tabActiva(); if(tb) x.tab = tb;
    await this.poner(x);
    this.q = ''; $('#gxQ').value = ''; this.filtro = '';
    this.editar(x.id); $('#gxCuerpo').scrollTop = 0;
  },
  editar(id){
    if(this.editando === id) return;
    this.editando = id; this.pintar();
    const t = $('#gxTxt'); if(t){ t.focus(); t.setSelectionRange(t.value.length, t.value.length); }
  },
  async guardarEdicion(){
    const id = this.editando; if(!id) return;
    const t = $('#gxTxt'), x = this.uno(id); this.editando = null;
    if(!x) return;
    const texto = t ? t.value.replace(/\s+$/, '') : x.texto;
    if(!texto.trim() && !(x.fotos || []).length){ await Mio.quitar('tickets', x.id); return; }     // nota vacía: fuera
    if(texto !== x.texto){ x.texto = texto; await this.poner(x); }
  },
  async marcar(id){
    await this.guardarEdicion();
    const x = this.uno(id); if(!x) return;
    x.ok = !x.ok; x.hecho = x.ok ? Date.now() : null; if(!x.ok) x.orden = Date.now();
    await this.poner(x); this.pintar();
  },
  async bandera(id){
    const x = this.uno(id); if(!x) return;
    const t = $('#gxTxt'); if(t) x.texto = t.value;
    const i = this.COLORES.findIndex(c => c[0] === (x.color || '')); x.color = this.COLORES[(i + 1) % this.COLORES.length][0];
    await this.poner(x);
    const b = $('#gxCuerpo .gx-band'); if(b){ const c = this.color(x.color); b.innerHTML = this.svgBandera(c[2]); b.style.setProperty('--bc', c[2]); }
    this.pintarCols();
    toast(x.color ? '🚩 ' + this.color(x.color)[1] : 'Sin color', null, null, 900);
  },
  // poner un texto donde está el cursor
  insertar(txt){
    const t = $('#gxTxt'); if(!t) return;
    const a = t.selectionStart != null ? t.selectionStart : t.value.length, b = t.selectionEnd != null ? t.selectionEnd : a;
    t.value = t.value.slice(0, a) + txt + t.value.slice(b); t.focus(); t.setSelectionRange(a + txt.length, a + txt.length); this.auto(t);
  },
  ponerHoy(){ const d = new Date(); this.insertar(String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getFullYear()).slice(2)); },
  iconos(){
    const t = $('#gxTxt'); const sel = t ? [t.selectionStart, t.selectionEnd] : null;
    const hj = hojaMio('✅ Poner un icono', `<div class="es-iconos">${Escribir.ICONOS.map(i => `<button data-i="${i}">${i}</button>`).join('')}</div><button class="sh-btn" data-a="x">Cerrar</button>`, 'es-ico');
    hj.onclick = ev => { const b = ev.target.closest('[data-i],[data-a]'); if(!b) return;
      if(b.dataset.i){ const t2 = $('#gxTxt'); if(t2 && sel){ t2.setSelectionRange(sel[0], sel[1]); } this.insertar(b.dataset.i); const t3 = $('#gxTxt'); if(t3){ sel[0] = sel[1] = t3.selectionStart; t3.blur(); } toast(b.dataset.i + ' puesto', null, null, 900); }
      else { cerrarHojaMio(); const t4 = $('#gxTxt'); if(t4) t4.focus(); } };
  },
  // Lista: 1.ª vez números (1. 2. 3.), 2.ª vez puntos (•), 3.ª vez nada. En las líneas elegidas o, si no hay nada elegido, en todas menos la primera (el título)
  RE_NUM: /^(\d+)\.\s/, RE_PTO: /^•\s/,
  lista(){
    const t = $('#gxTxt'); if(!t) return;
    const v = t.value, a = t.selectionStart, b = t.selectionEnd, ls = v.split('\n');
    let ini, fin;
    if(a !== b){ ini = v.slice(0, a).split('\n').length - 1; fin = v.slice(0, b).split('\n').length - 1; }
    else if(ls.length > 1){ ini = 1; fin = ls.length - 1; }
    else { ini = fin = 0; }
    const zona = ls.slice(ini, fin + 1).filter(l => l.trim());
    const modo = zona.length && zona.every(l => this.RE_NUM.test(l)) ? 'pto' : zona.length && zona.every(l => this.RE_PTO.test(l)) ? 'nada' : 'num';
    let n = 0;
    for(let i = ini; i <= fin; i++){
      const limpio = ls[i].replace(this.RE_NUM, '').replace(this.RE_PTO, '');
      if(!limpio.trim()){ ls[i] = limpio; continue; }
      ls[i] = modo === 'num' ? (++n) + '. ' + limpio : modo === 'pto' ? '• ' + limpio : limpio;
    }
    t.value = ls.join('\n'); this.auto(t); t.focus();
    const fl = ls.slice(0, fin + 1).join('\n').length; t.setSelectionRange(fl, fl);
    toast(modo === 'num' ? '1. 2. 3. Lista con números' : modo === 'pto' ? '• Lista con puntos' : 'Sin lista', null, null, 1100);
  },
  // al pulsar Intro en una línea de la lista, la siguiente sigue la lista
  intro(e){
    const t = e.target; if(e.key !== 'Enter' || t.selectionStart !== t.selectionEnd) return;
    const v = t.value, a = t.selectionStart, ini = v.lastIndexOf('\n', a - 1) + 1, linea = v.slice(ini, a);
    let m = linea.match(this.RE_NUM), sig = m ? (+m[1] + 1) + '. ' : this.RE_PTO.test(linea) ? '• ' : null;
    if(!sig) return;
    e.preventDefault();
    if(!linea.replace(this.RE_NUM, '').replace(this.RE_PTO, '').trim()){ t.value = v.slice(0, ini) + v.slice(a); t.setSelectionRange(ini, ini); this.auto(t); return; }   // línea vacía: se acaba la lista
    this.insertar('\n' + sig);
  },
  async foto(id){
    const x = this.uno(id); if(!x) return; const t = $('#gxTxt'); if(t) x.texto = t.value;
    const fs = await elegirFotos(false, true); if(!fs.length) return;
    toast('📷 Guardando foto…');
    for(const f of fs){ try{ const fid = await Mio.ponerFoto(await aligerarImg(f, 1400, .75), null, 'tickets'); x.fotos = [...(x.fotos || []), fid]; }catch(e){ toast('⚠️ No se ha podido añadir esa imagen'); } }
    await this.poner(x); this.pintar();
  },
  async quitarFoto(id, f){
    const x = this.uno(id); if(!x) return; const t = $('#gxTxt'); if(t) x.texto = t.value;
    if(!await confirmarMio('Borrar foto', '¿Seguro que quieres borrar esta foto de la nota?', 'Borrar')){ return; }
    x.fotos = (x.fotos || []).filter(o => o !== f); await this.poner(x); await Mio.quitarFotos([f]); this.pintar();
  },
  async borrar(id){
    if(this.editando === id) this.editando = null;
    const x = this.uno(id); if(!x) return;
    await Mio.quitar('tickets', id); this.pintarCols();
    toast('🗑 Nota eliminada', 'Deshacer', async () => { await Mio.poner('tickets', x.id, x); this.pintar(); toast('↩️ La nota vuelve a estar'); }, 5000);
    setTimeout(() => { if(!this.uno(id)) Mio.quitarFotos(x.fotos || []); }, 7000);
    setTimeout(() => this.pintar(), 260);
  },
  async renombrar(){
    const i = $('#gxTit'), n = i.value.trim() || 'Gastos'; i.value = n;
    if(n === this.nombre()) return;
    const m = this.meta(); m.nombre = n; await Mio.poner('tickets', m.id, m);
    this.pintarBoton(); toast('✏️ La lista se llama «' + n + '»', null, null, 1500);
  },
  pintarBoton(){ const b = $('#tkGastos'); if(b) b.innerHTML = `💶 <span>${esc(this.nombre())}</span>`; },

  enlazar(v){
    const c = $('#gxCuerpo', v);
    v.addEventListener('click', async e => {
      const b = e.target.closest('button,[data-editar],img[data-ver]'); if(!b) return;
      if(b.dataset.ver){ verFotoGrande(b.src); return; }
      const fila = b.closest('.gx-fila'), id = fila && fila.dataset.id, d = b.dataset;
      if('gxcerrar' in d) this.cerrar();
      else if('nueva' in d) this.nueva();
      else if(d.f !== undefined && b.closest('#gxCols')){ this.filtro = d.f; await this.guardarEdicion(); this.pintar(); }
      else if('check' in d) this.marcar(id);
      else if('editar' in d){ await this.guardarEdicion(); this.editar(id); }
      else if('bandera' in d) this.bandera(id);
      else if('foto' in d) this.foto(id);
      else if('hoy' in d) this.ponerHoy();
      else if(d.ins) this.insertar(d.ins);
      else if('iconos' in d) this.iconos();
      else if('lista' in d) this.lista();
      else if(d.tab){ await this.guardarEdicion(); if(d.tab === this.tabActiva()) this.opcionesTab(d.tab); else { lsSet('ph3-gx-tab', d.tab); this.pintar(); } }
      else if('tabnueva' in d) this.nuevaTab();
      else if(d.quitarfoto) this.quitarFoto(id, d.quitarfoto);
      else if('listo' in d){ await this.guardarEdicion(); this.pintar(); }
    });
    // tocar fuera de la nota que se edita: se guarda
    v.addEventListener('pointerdown', async e => { if(this.editando && !e.target.closest('.gx-fila.ed, .gx-mas, [data-gxcerrar]') && !$('#mioVelo')){ await this.guardarEdicion(); if(!e.target.closest('.gx-fila, #gxCols, #gxQ, #gxTabs')) this.pintar(); } });
    c.addEventListener('input', e => { if(e.target.id === 'gxTxt') this.auto(e.target); });
    c.addEventListener('keydown', e => { if(e.target.id === 'gxTxt') this.intro(e); });
    // los botones de debajo de la nota no quitan el cursor del texto (así el teclado no se esconde)
    c.addEventListener('pointerdown', e => { const b = e.target.closest('.gx-herr button'); if(b && !b.matches('[data-listo],[data-foto]')) e.preventDefault(); });
    c.addEventListener('mousedown', e => { if(e.target.closest('.gx-herr button')) e.preventDefault(); });
    deslizarBorrar(c, id => this.borrar(id));
    const q = $('#gxQ', v); q.oninput = () => { this.q = q.value; this.pintar(); };
    const t = $('#gxTit', v); t.onchange = () => this.renombrar(); t.onkeydown = e => { if(e.key === 'Enter') t.blur(); };
    document.addEventListener('keydown', e => { if(e.key === 'Escape' && this.abierto() && !$('#mioPop') && !$('.vfg')) this.cerrar(); });
    Mio.al('tickets', () => { this.pintarBoton(); if(this.abierto() && !this.editando) this.pintar(); });
    Mio.al('fotos', () => { if(this.abierto() && !this.editando) this.pintar(); });
  },
  iniciar(){
    const caja = $('#vTickets .tk-buscar'); if(!caja || $('#tkGastos')) return;
    const b = document.createElement('button'); b.id = 'tkGastos'; b.className = 'tk-gastos-b'; b.title = 'Lista de gastos';
    caja.insertBefore(b, $('#tkTema')); b.onclick = () => this.abrir();
    this.pintarBoton();
  }
};
