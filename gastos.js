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
  uno(id){ const x = Mio.uno('tickets', id); return x && x.tipo === 'gasto' ? x : null; },
  async poner(x){ x.cambiado = Date.now(); await Mio.poner('tickets', x.id, x); },
  color(c){ return (this.COLORES.find(x => x[0] === (c || '')) || this.COLORES[0]); },
  ordenados(){
    const t = this.todos(), q = norm(this.q.trim());
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
  pintarCols(){
    const n = c => this.todos().filter(x => !x.ok && (x.color || '') === c).length;
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
              <label class="gx-hb" aria-label="Poner una fecha">📅<input type="date" id="gxFecha"></label>
              <button class="gx-hb gx-band" data-bandera aria-label="Color de la banderita" style="--bc:${c[2]}">${this.svgBandera(c[2])}</button>
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
    const c = $('#gxCuerpo'), sc = c.scrollTop, { pend, hechos } = this.ordenados(), total = this.todos().length;
    this.pintarCols();
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
  ponerFecha(v){
    const t = $('#gxTxt'); if(!t || !v) return;
    const [y, m, d] = v.split('-'), txt = d + '/' + m + '/' + y.slice(2);
    const a = t.selectionStart != null ? t.selectionStart : t.value.length, b = t.selectionEnd != null ? t.selectionEnd : a;
    t.value = t.value.slice(0, a) + txt + t.value.slice(b); t.focus(); t.setSelectionRange(a + txt.length, a + txt.length); this.auto(t);
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
      else if(d.quitarfoto) this.quitarFoto(id, d.quitarfoto);
      else if('listo' in d){ await this.guardarEdicion(); this.pintar(); }
    });
    // tocar fuera de la nota que se edita: se guarda
    v.addEventListener('pointerdown', async e => { if(this.editando && !e.target.closest('.gx-fila.ed, .gx-mas, [data-gxcerrar]')){ await this.guardarEdicion(); if(!e.target.closest('.gx-fila, #gxCols, #gxQ')) this.pintar(); } });
    c.addEventListener('input', e => { if(e.target.id === 'gxTxt') this.auto(e.target); });
    c.addEventListener('change', e => { if(e.target.id === 'gxFecha'){ this.ponerFecha(e.target.value); e.target.value = ''; } });
    // en el iPhone, el calendario se abre al tocar el 📅 (si el navegador deja abrirlo a mano, mejor)
    c.addEventListener('click', e => { const l = e.target.closest('.gx-hb'); if(l && l.querySelector('#gxFecha') && e.target.id !== 'gxFecha'){ const i = $('#gxFecha'); try{ i.showPicker(); e.preventDefault(); }catch(_){} } });
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
