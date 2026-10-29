/* PorHacer3 · Agenda (igual que en HOME)
   Día · Mes · Año. Varias notas por día, cada una con color, fotos, aviso y «hecha».
   Color del día. Nota por voz diciendo la fecha. Pasar hoja con el dedo.
   Se guarda en «lo mío» (Mio, colección agenda): un documento por día. */

const Agenda = {
  modo: lsGet('ph3-ag-modo') || 'mes',
  mes: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  dia: null, sel: null, NE: null,
  NOTA_COLORES: ['none','celeste','azul','verdeclaro','verdeoscuro','amarillo','naranja','rosa','rojo','marronclaro','marronoscuro','caqui'],

  /* ---------- Datos ---------- */
  doc(k){ return Mio.uno('agenda', k) || { id:k, color:'none', items:[] }; },
  notas(k){ return (this.doc(k).items || []); },
  colorDia(k){ const c = this.doc(k).color; return c && CAL_COLORS[c] ? c : 'none'; },
  async guardarDia(k, items, color){
    const d = this.doc(k);
    const nuevo = { id:k, color:color !== undefined ? color : (d.color || 'none'), items:items !== undefined ? items : (d.items || []) };
    if(!nuevo.items.length && (!nuevo.color || nuevo.color === 'none')) await Mio.quitar('agenda', k);
    else await Mio.poner('agenda', k, nuevo);
  },
  col(k){ return CAL_COLORS[k] || CAL_COLORS.none; },
  puntoNota(it){ return it.color && it.color !== 'none' ? this.col(it.color).dot : 'color-mix(in srgb, var(--accent), #000 10%)'; },

  /* ---------- Pantalla ---------- */
  abrir(){ soloVista('vAgenda'); this.pintar(); setTimeout(() => this.revisarAvisos(), 600); },
  activa(){ return $('#vAgenda').classList.contains('activa'); },
  pintar(){
    if(!this.activa()) return;
    const c = $('#agCuerpo'), sc = c.scrollTop;
    const modos = `<div class="ag-modos"><div class="seg">${[['dia','Día'],['mes','Mes'],['anio','Año']].map(([m, t]) => `<button data-m="${m}" class="${this.modo === m ? 'on' : ''}">${t}</button>`).join('')}</div></div>`;
    let cab, cuerpo;
    if(this.modo === 'anio'){
      const y = this.mes.getFullYear();
      cab = `<div class="ag-titulo">Año ${y}</div>`;
      cuerpo = `<div class="ag-anio">${MESES_C.map((n, m) => `<div class="ag-mini ${y === new Date().getFullYear() && m === new Date().getMonth() ? 'ahora' : ''}"><button class="ag-mini-t" data-mes="${m}">${n}</button>${this.rejilla(y, m, true)}</div>`).join('')}</div>`;
    } else if(this.modo === 'dia'){
      cab = `<label class="ag-titulo ag-titulo-dia">${fechaBonita(this.dia)}<small>${deIso(this.dia).getFullYear()}${this.dia === hoyIso() ? ' · Hoy' : ''}</small><input type="date" id="agElegirDia" value="${this.dia}"></label>`;
      cuerpo = this.vistaDia();
    } else {
      const y = this.mes.getFullYear(), m = this.mes.getMonth();
      cab = `<div class="ag-titulo">${MESES_C[m]} <span>${y}</span></div>`;
      cuerpo = this.rejilla(y, m, false);
    }
    const nf = this.modo === 'anio' ? 0 : this.fotosDe(this.modo === 'dia' ? this.dia.slice(0, 7) : iso(this.mes).slice(0, 7)).length;
    c.innerHTML = `<div class="ag-card ag-m-${this.modo}">${modos}
      <div class="ag-cab"><button class="flecha" data-mv="-1" aria-label="Anterior">‹</button>${cab}<button class="flecha" data-mv="1" aria-label="Siguiente">›</button></div>
      ${cuerpo}
      <div class="ag-pie"><button class="hoy-btn" data-hoy>Fecha actual</button>${nf ? `<button class="mini-btn" data-fotos>📷 ${nf}</button>` : ''}<button class="mini-btn" data-colores>🔎 Colores</button></div>
    </div>`;
    c.scrollTop = sc;
    $('#agSub').textContent = this.modo === 'mes' ? this.resumenMes() : this.modo === 'dia' ? (this.notas(this.dia).length ? this.notas(this.dia).length + (this.notas(this.dia).length === 1 ? ' nota' : ' notas') : 'Día libre') : 'Todo el año';
    if(this.modo === 'anio' && this._irMes != null){ const el = $$('.ag-mini', c)[this._irMes]; this._irMes = null; if(el) setTimeout(() => el.scrollIntoView({ block:'start', behavior:'smooth' }), 50); }
  },
  resumenMes(){ const p = iso(this.mes).slice(0, 7); let n = 0; Mio.todos('agenda').forEach(d => { if(d.id.startsWith(p)) n += (d.items || []).length; }); return n ? n + (n === 1 ? ' nota este mes' : ' notas este mes') : 'Toca un día para apuntar'; },
  rejilla(y, m, mini){
    const pri = new Date(y, m, 1), off = (pri.getDay() + 6) % 7, ini = new Date(y, m, 1 - off), hoy = hoyIso();
    let h = `<div class="ag-sem">${'LMXJVSD'.split('').map(x => `<span>${x}</span>`).join('')}</div><div class="ag-rej">`;
    for(let i = 0; i < 42; i++){
      const d = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + i), k = iso(d), fuera = d.getMonth() !== m;
      if(mini && fuera){ h += '<span class="ag-d ag-hueco"></span>'; continue; }
      const its = this.notas(k), cd = this.colorDia(k), cc = this.col(cd);
      const est = cd !== 'none' ? `style="--dc:${cc.bg};--db:${cc.border}"` : '';
      h += `<button class="ag-d ${fuera ? 'fuera' : ''} ${i % 7 > 4 ? 'finde' : ''} ${k === hoy ? 'hoy' : ''} ${k === this.sel ? 'sel' : ''} ${cd !== 'none' ? 'conc' : ''} ${its.length ? 'tiene' : ''}" data-k="${k}" ${est}>
        <span class="ag-n">${d.getDate()}</span>${mini ? (its.length ? '<i class="ag-pt"></i>' : '') : `<span class="ag-ls">${its.slice(0, 3).map(it => `<span class="ag-l ${it.hecha ? 'hecha' : ''}"><i style="background:${it.color && it.color !== 'none' ? this.col(it.color).bg : '#fff'};border-color:${this.puntoNota(it)}"></i><em>${it.aviso && !it.avisoVisto ? '⏰ ' : ''}${esc(it.texto) || ((it.fotos || []).length ? '📷' : '')}</em></span>`).join('')}${its.length > 3 ? `<span class="ag-mas">+${its.length - 3}</span>` : ''}</span>`}</button>`;
    }
    return h + '</div>';
  },
  vistaDia(){
    const k = this.dia, d = deIso(k), hoy = hoyIso(), lun = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
    let sem = '';
    for(let i = 0; i < 7; i++){
      const w = new Date(lun.getFullYear(), lun.getMonth(), lun.getDate() + i), wk = iso(w), c = this.colorDia(wk);
      sem += `<button class="ag-wd ${wk === k ? 'sel' : ''} ${wk === hoy ? 'hoy' : ''} ${i > 4 ? 'finde' : ''}" data-dia="${wk}" ${c !== 'none' ? `style="--dc:${this.col(c).bg}"` : ''}><span>${'LMXJVSD'[i]}</span><b>${w.getDate()}</b>${this.notas(wk).length ? '<i></i>' : ''}</button>`;
    }
    const its = this.notas(k), cd = this.colorDia(k);
    const lista = its.length ? its.map(it => {
      const fs = (it.fotos || []).map(f => Mio.foto(f)).filter(Boolean);
      return `<div class="ag-item ${it.hecha ? 'hecha' : ''}" data-nota="${it.id}"><span class="ag-pto" style="background:${this.puntoNota(it)}"></span>
        <div class="ag-tx">${it.texto ? esc(it.texto).replace(/\n/g, '<br>') : '<em>Foto</em>'}${it.aviso && !it.avisoVisto ? `<span class="ag-rem">⏰ ${this.avisoBonito(it.aviso)}</span>` : ''}${fs.length ? `<div class="ag-fotos">${fs.map(s => `<img src="${s}" alt="" data-ver>`).join('')}</div>` : ''}</div>
        <button class="ag-check" data-hecha="${it.id}" aria-label="Hecha">${it.hecha ? '✓' : ''}</button></div>`;
    }).join('') : '<div class="ag-vacio">Nada apuntado este día.</div>';
    return `<div class="ag-semana">${sem}</div>
      <div class="ag-dcuerpo" ${cd !== 'none' ? `style="background:${this.col(cd).bg}"` : ''}>${lista}</div>
      <div class="ag-dacc"><button class="btn-pri" data-nueva="${k}">＋ Añadir nota</button><button class="btn-sec ag-mas3" data-opc="${k}" aria-label="Opciones del día">⋯</button></div>`;
  },
  mover(dir){
    if(this.modo === 'anio') this.mes = new Date(this.mes.getFullYear() + dir, this.mes.getMonth(), 1);
    else if(this.modo === 'dia'){ this.dia = sumaDias(this.dia, dir); const d = deIso(this.dia); this.mes = new Date(d.getFullYear(), d.getMonth(), 1); }
    else this.mes = new Date(this.mes.getFullYear(), this.mes.getMonth() + dir, 1);
    this.pintar();
  },
  pasar(dir){
    const card = $('#agCuerpo .ag-card');
    if(!card || matchMedia('(prefers-reduced-motion: reduce)').matches){ this.mover(dir); return; }
    const ctx = paginaEmpieza(card, dir, d => this.mover(d), getComputedStyle(card).backgroundColor);
    if(ctx) paginaA(ctx, 1, 760);
  },
  ponerModo(m){ this.modo = m; lsSet('ph3-ag-modo', m); if(m === 'dia' && !this.sel) this.dia = this.dia || hoyIso(); this.pintar(); },
  irHoy(){ const h = new Date(); this.mes = new Date(h.getFullYear(), h.getMonth(), 1); this.dia = hoyIso(); if(this.modo === 'anio') this._irMes = h.getMonth(); this.pintar();
    const t = $('#agCuerpo .ag-d.hoy'); if(t){ t.classList.add('brilla'); setTimeout(() => t.classList.remove('brilla'), 2000); } },
  irDia(k){ this.dia = k; this.sel = k; const d = deIso(k); this.mes = new Date(d.getFullYear(), d.getMonth(), 1); this.modo = 'dia'; lsSet('ph3-ag-modo', 'dia'); this.pintar(); },

  /* ---------- «¿Qué quieres hacer?» al tocar un día ---------- */
  elegirDia(k){
    const n = this.notas(k).length, dc = this.colorDia(k);
    const p = popMio(`
      <div class="mp-fecha">${fechaBonita(k, true)}</div>
      <h3 class="mp-h">¿Qué quieres hacer?</h3>
      <button class="mp-op" data-a="nueva"><span class="mp-ic">${icono('mas')}</span><span><b>Añadir una nota</b><small>Escribe algo nuevo para este día</small></span></button>
      ${n ? `<button class="mp-op" data-a="editar"><span class="mp-ic">${icono('lapiz')}</span><span><b>Editar una nota</b><small>${n === 1 ? 'Hay 1 nota este día' : 'Hay ' + n + ' notas este día'}</small></span></button>` : ''}
      <button class="mp-op" data-a="ver"><span class="mp-ic">${icono('calendario')}</span><span><b>Ver el día</b><small>Sus notas, fotos y avisos</small></span></button>
      <button class="mp-op" data-a="sel"><span class="mp-ic">${icono('chincheta')}</span><span><b>Solo seleccionar el día</b><small>Marcarlo y verlo, sin escribir nada</small></span></button>
      <details class="mp-desp"><summary><span class="mp-ic mp-circ" style="background:${dc === 'none' ? '#fff' : this.col(dc).bg};border-color:${dc === 'none' ? 'var(--line)' : this.col(dc).border}"></span><span><b>Color del día</b><small>${this.col(dc).name}</small></span><span class="mp-chev">▾</span></summary>
        <div class="mp-colores">${CAL_COLOR_KEYS.map(c => `<button data-c="${c}" class="${c === dc ? 'on' : ''}"><i style="background:${c === 'none' ? '#fff' : this.col(c).bg};border-color:${c === 'none' ? '#ccc' : this.col(c).border}">${c === 'none' ? '✕' : ''}</i>${this.col(c).name}</button>`).join('')}</div></details>
      <button class="mp-cancelar" data-a="x">Cancelar</button>`);
    p.onclick = async e => {
      const b = e.target.closest('[data-a],[data-c]'); if(!b) return;
      if(b.dataset.c){ await this.guardarDia(k, undefined, b.dataset.c); cerrarPopMio(); this.pintar(); toast('🎨 ' + (b.dataset.c === 'none' ? 'Día sin color' : 'Color ' + this.col(b.dataset.c).name)); return; }
      const a = b.dataset.a;
      if(a === 'x') cerrarPopMio();
      else if(a === 'nueva') this.editor(k, null);
      else if(a === 'editar') this.elegirNota(k);
      else if(a === 'ver'){ cerrarPopMio(); this.irDia(k); }
      else if(a === 'sel'){ cerrarPopMio(); this.sel = k; this.dia = k; this.pintar(); toast('📍 Día seleccionado: ' + fechaBonita(k)); }
    };
  },
  elegirNota(k){
    const its = this.notas(k);
    if(its.length === 1) return this.editor(k, its[0].id);
    const p = popMio(`<div class="mp-fecha">${fechaBonita(k, true)}</div><h3 class="mp-h">¿Qué nota quieres editar?</h3>
      <div class="mp-notas">${its.map(it => `<button class="mp-nota ${it.hecha ? 'hecha' : ''}" data-id="${it.id}"><i style="background:${this.puntoNota(it)}"></i><span>${it.aviso && !it.avisoVisto ? '⏰ ' : ''}${it.texto ? esc(it.texto) : '<em>Foto</em>'}${(it.fotos || []).length ? ` <small>📷 ${it.fotos.length}</small>` : ''}</span><b>›</b></button>`).join('')}</div>
      <button class="mp-cancelar" data-volver>‹ Volver</button>`);
    p.onclick = e => { const b = e.target.closest('[data-id]'); if(b) this.editor(k, b.dataset.id); else if(e.target.closest('[data-volver]')) this.elegirDia(k); };
  },

  /* ---------- Editor de una nota ---------- */
  editor(k, id){
    const it = id ? this.notas(k).find(x => x.id === id) : null;
    this.NE = { k, nk:k, id:id || null, texto:it ? it.texto || '' : '', color:it ? it.color || 'none' : 'none', hecha:!!(it && it.hecha),
      fotos:it ? [...(it.fotos || [])] : [], orig:it ? [...(it.fotos || [])] : [], nuevas:[], aviso:it && it.aviso && !it.avisoVisto ? it.aviso : '', panel:null };
    this.pintarEditor(true);
  },
  leerEd(){ const N = this.NE; if(!N) return; const t = $('#neTexto'); if(t) N.texto = t.value; const r = $('#neAviso'); if(r) N.aviso = r.value; },
  pintarEditor(foco){
    const N = this.NE; if(!N) return;
    if(Voz.activo) Voz.parar();
    this.leerEd();
    const pto = c => c === 'none' ? '#fff' : this.col(c).dot;
    let panel = '';
    if(N.panel === 'color') panel = `<div class="ne-panel ne-colores">${this.NOTA_COLORES.map(c => `<button data-col="${c}" class="${c === N.color ? 'on' : ''}"><i style="background:${pto(c)}"></i>${this.col(c).name}${c === N.color ? '<b>✓</b>' : ''}</button>`).join('')}</div>`;
    else if(N.panel === 'dia') panel = `<div class="ne-panel"><div class="ne-et">Cambiar la nota de día</div><input type="date" id="neDia" value="${N.nk}">${N.nk !== N.k ? `<div class="ne-movida">Se moverá del ${fechaCortaB(N.k)} al <b>${fechaCortaB(N.nk)}</b></div>` : ''}</div>`;
    else if(N.panel === 'aviso') panel = `<div class="ne-panel"><div class="ne-et">Aviso</div>
      <div class="ne-aviso"><span>⏰</span><input type="datetime-local" id="neAviso" value="${N.aviso}"><button data-quitaraviso aria-label="Quitar aviso">✕</button></div>
      <button class="ne-ical" data-ical><b>📅 Añadir también al calendario del móvil</b><small>Así te avisa aunque la app esté cerrada</small></button></div>`;
    const fotos = N.fotos.map(f => ({ f, s:Mio.foto(f) })).filter(x => x.s);
    const p = popMio(`
      <div class="ne-top"><button class="mp-fecha ne-fechab" data-panel="dia">${fechaBonita(N.nk, true)} ▾</button><span class="ne-modo">${N.id ? 'Editar nota' : 'Nueva nota'}</span></div>
      <textarea class="ne-texto" id="neTexto" placeholder="Escribe aquí tu nota…">${esc(N.texto)}</textarea>
      ${fotos.length ? `<div class="ne-fotos">${fotos.map(x => `<div class="ne-foto"><img src="${x.s}" alt="" data-ver><button data-quitarfoto="${x.f}" aria-label="Quitar foto">✕</button></div>`).join('')}</div>` : ''}
      <div class="ne-chips">
        <button class="ne-chip ${N.panel === 'color' ? 'on' : ''}" data-panel="color"><i style="background:${pto(N.color)}"></i>${N.color === 'none' ? 'Color' : this.col(N.color).name} ▾</button>
        <button class="ne-chip ${N.panel === 'aviso' ? 'on' : ''} ${N.aviso ? 'tiene' : ''}" data-panel="aviso">⏰ ${N.aviso ? this.avisoBonito(N.aviso) : 'Aviso'}</button>
        <button class="ne-chip" id="neMic" data-dictar>${icIn('mic')}Dictar</button>
        <button class="ne-chip" data-foto>${icIn('camara')}Foto</button>
        ${N.id ? `<button class="ne-chip ${N.hecha ? 'tiene' : ''}" data-hecha>${N.hecha ? '✓ Hecha' : '○ Hecha'}</button>` : ''}
      </div>
      ${panel}
      <div class="mp-fila">${N.id ? '<button class="mp-b mp-borrar" data-borrar aria-label="Borrar nota">🗑️</button>' : ''}<button class="mp-b" data-cancelar>Cancelar</button><button class="mp-b mp-pri" data-guardar>${N.id ? 'Guardar' : 'Añadir'}</button></div>`, 'ne-pop');
    p.parentNode._alCerrar = () => this.cancelar(true);
    p.onclick = async e => {
      const b = e.target.closest('button,img[data-ver]'); if(!b) return;
      const d = b.dataset;
      if(b.tagName === 'IMG'){ verFotoGrande(b.src); return; }
      if(d.panel){ this.leerEd(); N.panel = N.panel === d.panel ? null : d.panel; if(N.panel === 'aviso' && !N.aviso) N.aviso = this.avisoPorDefecto(N.nk); this.pintarEditor(false); }
      else if(d.col){ this.leerEd(); N.color = d.col; N.panel = null; this.pintarEditor(false); }
      else if('quitaraviso' in d){ N.aviso = ''; N.panel = null; this.pintarEditor(false); }
      else if('ical' in d){ this.leerEd(); this.alCalendario(N.texto, N.aviso, N.nk); }
      else if('dictar' in d) Voz.empezar($('#neTexto'), b, null);
      else if('foto' in d) this.anadirFoto();
      else if(d.quitarfoto){ this.leerEd(); N.fotos = N.fotos.filter(x => x !== d.quitarfoto); this.pintarEditor(false); }
      else if('hecha' in d){ this.leerEd(); N.hecha = !N.hecha; this.pintarEditor(false); }
      else if('borrar' in d) this.borrarNota();
      else if('cancelar' in d) this.cancelar();
      else if('guardar' in d) this.guardarNota();
    };
    const di = $('#neDia'); if(di) di.onchange = () => { if(di.value){ this.leerEd(); N.nk = di.value; N.panel = null; this.pintarEditor(false); } };
    if(foco) setTimeout(() => { const t = $('#neTexto'); if(t){ t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }, 150);
  },
  async anadirFoto(){
    this.leerEd();
    const fs = await elegirFotos(false, true); if(!fs.length || !this.NE) return;
    toast('📷 Guardando foto…');
    for(const f of fs){ try{ const id = await Mio.ponerFoto(await aligerarImg(f, 1280, .72)); this.NE.fotos.push(id); this.NE.nuevas.push(id); }catch(e){ toast('⚠️ No se ha podido añadir esa imagen'); } }
    this.pintarEditor(false);
  },
  cancelar(yaCerrado){
    if(Voz.activo) Voz.parar();
    if(this.NE) Mio.quitarFotos(this.NE.nuevas);
    this.NE = null; if(!yaCerrado) cerrarPopMio();
  },
  async guardarNota(){
    const N = this.NE; if(!N) return;
    if(Voz.activo) Voz.parar();
    this.leerEd();
    const texto = N.texto.trim();
    if(!texto && !N.fotos.length){ $('#neTexto') && $('#neTexto').focus(); toast('Escribe la nota o añade una foto'); return; }
    const origen = this.notas(N.k).map(x => ({ ...x }));
    let nota = N.id ? origen.find(x => x.id === N.id) : null;
    const nueva = !nota;
    if(!nota) nota = { id:nuevoId('n'), creada:Date.now() };
    nota.texto = texto; nota.color = N.color; nota.hecha = N.id ? N.hecha : false; nota.fotos = [...N.fotos];
    if(N.aviso){ if(nota.aviso !== N.aviso) nota.avisoVisto = false; nota.aviso = N.aviso; } else { delete nota.aviso; delete nota.avisoVisto; }
    await Mio.quitarFotos(N.orig.filter(f => !N.fotos.includes(f)));
    const av = N.aviso ? ' · aviso ' + this.avisoBonito(N.aviso) : '';
    this.NE = null; cerrarPopMio();
    if(N.nk !== N.k){
      await this.guardarDia(N.k, origen.filter(x => x.id !== nota.id));
      await this.guardarDia(N.nk, [...this.notas(N.nk), nota]);
      toast('📅 Nota movida al ' + fechaCortaB(N.nk) + av);
    } else {
      if(nueva) origen.push(nota); else origen[origen.findIndex(x => x.id === nota.id)] = nota;
      await this.guardarDia(N.k, origen);
      toast((nueva ? '📝 Nota añadida' : '✅ Nota guardada') + av);
    }
    this.pintar(); setTimeout(() => this.revisarAvisos(), 500);
  },
  async borrarNota(){
    const N = { ...this.NE }; this.leerEd();
    if(!await confirmarMio('Borrar nota', '¿Seguro que quieres borrar esta nota?')){ this.pintarEditor(false); return; }
    const it = this.notas(N.k).find(x => x.id === N.id);
    await this.guardarDia(N.k, this.notas(N.k).filter(x => x.id !== N.id));
    this.NE = null; this.pintar();
    toast('🗑 Nota borrada', 'Deshacer', async () => { await this.guardarDia(N.k, [...this.notas(N.k), it]); this.pintar(); });
    setTimeout(() => { if(!this.notas(N.k).some(x => x.id === N.id)) Mio.quitarFotos((it && it.fotos) || []); }, 9000);
  },
  async marcarHecha(k, id){
    const its = this.notas(k).map(x => ({ ...x })), it = its.find(x => x.id === id); if(!it) return;
    it.hecha = !it.hecha; await this.guardarDia(k, its); this.pintar();
  },

  /* ---------- Avisos ---------- */
  avisoBonito(v){ if(!v) return ''; const d = new Date(v); if(isNaN(d)) return ''; const k = iso(d), hh = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    return (k === hoyIso() ? 'Hoy' : k === sumaDias(hoyIso(), 1) ? 'Mañana' : fechaCortaB(k)) + ' ' + hh; },
  avisoPorDefecto(k){ if(k === hoyIso()){ const d = new Date(Date.now() + 3600000); return k + 'T' + String(d.getHours()).padStart(2, '0') + ':00'; } return k + 'T09:00'; },
  pendientes(){
    const ahora = Date.now(), out = [];
    Mio.todos('agenda').forEach(d => (d.items || []).forEach(it => { if(it.aviso && !it.avisoVisto){ const t = new Date(it.aviso).getTime(); if(!isNaN(t) && t <= ahora) out.push({ k:d.id, it, t }); } }));
    return out.sort((a, b) => a.t - b.t);
  },
  revisarAvisos(){
    if($('#mioPop') || $('.mio-hoja') || $('.velo.abierto')) return;
    const p = this.pendientes(); if(!p.length) return;
    const r = p[0], it = r.it, d = new Date(it.aviso), fs = (it.fotos || []).map(f => Mio.foto(f)).filter(Boolean);
    this._avisoAbierto = true;
    try{ Avisos.campana(); }catch(e){}
    try{ navigator.vibrate && navigator.vibrate([120, 80, 120]); }catch(e){}
    const v = popMio(`<div class="rem-campana">⏰</div>
      <div class="mp-fecha rem-cuando">${fechaBonita(r.k)} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}</div>
      <div class="rem-texto">${it.texto ? esc(it.texto) : 'Tienes un aviso'}</div>
      ${fs.length ? `<div class="ag-fotos">${fs.map(s => `<img src="${s}" alt="" data-ver>`).join('')}</div>` : ''}
      ${p.length > 1 ? `<div class="rem-mas">Tienes ${p.length} avisos</div>` : ''}
      <div class="mp-fila"><button class="mp-b" data-r="10">⏱ En 10 min</button><button class="mp-b" data-r="ver">Ver el día</button></div>
      <button class="mp-b mp-pri rem-ok" data-r="ok">Leído, cerrar</button>`, 'rem-pop');
    v.parentNode._alCerrar = () => { this._avisoAbierto = false; };
    v.onclick = async e => {
      const img = e.target.closest('img[data-ver]'); if(img){ verFotoGrande(img.src); return; }
      const b = e.target.closest('[data-r]'); if(!b) return;
      const its = this.notas(r.k).map(x => ({ ...x })), x = its.find(y => y.id === it.id);
      if(x){ if(b.dataset.r === '10'){ const n = new Date(Date.now() + 10 * 60000); x.aviso = iso(n) + 'T' + String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'); x.avisoVisto = false; }
        else x.avisoVisto = true; await this.guardarDia(r.k, its); }
      cerrarPopMio(); this._avisoAbierto = false;
      if(b.dataset.r === '10') toast('⏱ Te lo recuerdo en 10 minutos');
      if(b.dataset.r === 'ver'){ irA('agenda'); this.irDia(r.k); } else this.pintar();
      setTimeout(() => this.revisarAvisos(), 400);
    };
  },
  alCalendario(texto, aviso, k){
    if(!aviso){ toast('⏰ Pon antes la hora del aviso'); return; }
    const d = new Date(aviso), utc = x => x.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z', e = s => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, m => '\\' + m);
    const fin = new Date(d.getTime() + 30 * 60000);
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PorHacer3//ES', 'BEGIN:VEVENT', 'UID:' + nuevoId('ag') + '@porhacer3', 'DTSTAMP:' + utc(new Date()),
      'DTSTART:' + utc(d), 'DTEND:' + utc(fin), 'SUMMARY:' + e(texto || 'Agenda'), 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + e(texto || 'Agenda'), 'TRIGGER:-PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    descargar(new Blob([ics], { type:'text/calendar' }), 'agenda-' + (k || iso(d)) + '.ics');
  },

  /* ---------- Fotos del mes y buscar por colores ---------- */
  fotosDe(pref){ const out = []; Mio.todos('agenda').forEach(d => { if(d.id.startsWith(pref)) (d.items || []).forEach(it => (it.fotos || []).forEach(f => out.push({ k:d.id, f, it }))); }); return out.sort((a, b) => a.k < b.k ? -1 : 1); },
  verFotosMes(){
    const pref = this.modo === 'dia' ? this.dia.slice(0, 7) : iso(this.mes).slice(0, 7), fs = this.fotosDe(pref), [y, m] = pref.split('-').map(Number);
    const p = popMio(`<h3 class="mp-h">📷 Fotos de ${MESES[m - 1]} ${y}</h3>
      <div class="ag-galeria">${fs.map(x => `<button data-k="${x.k}" data-f="${x.f}"><img src="${Mio.foto(x.f)}" alt=""><span>${deIso(x.k).getDate()}</span></button>`).join('')}</div>
      <button class="mp-cancelar" data-x>Cerrar</button>`);
    p.onclick = e => { const b = e.target.closest('[data-f]'); if(b){ verFotoGrande(Mio.foto(b.dataset.f)); return; } if(e.target.closest('[data-x]')) cerrarPopMio(); };
  },
  buscarColores(c){
    const lista = c ? (() => { const out = [];
      Mio.todos('agenda').sort((a, b) => a.id < b.id ? 1 : -1).forEach(d => {
        if(d.color === c) out.push({ k:d.id, dia:true });
        (d.items || []).forEach(it => { if(it.color === c) out.push({ k:d.id, it }); });
      }); return out; })() : null;
    const p = popMio(`<h3 class="mp-h">🔎 Buscar por colores</h3>
      <div class="mp-colores mp-colores-b">${CAL_COLOR_KEYS.filter(k => k !== 'none').map(k => `<button data-c="${k}" class="${k === c ? 'on' : ''}"><i style="background:${this.col(k).bg};border-color:${this.col(k).border}"></i>${this.col(k).name}</button>`).join('')}</div>
      ${lista ? (lista.length ? `<div class="mp-notas">${lista.slice(0, 120).map(x => `<button class="mp-nota" data-k="${x.k}"><i style="background:${this.col(c).dot}"></i><span><b>${fechaCortaB(x.k)} ${deIso(x.k).getFullYear()}</b> · ${x.dia ? 'Color del día' : (x.it.texto ? esc(x.it.texto) : '📷 Foto')}</span><b>›</b></button>`).join('')}</div>` : '<p class="mp-p">No hay nada de este color.</p>') : '<p class="mp-p">Elige un color para ver los días y las notas que lo tienen.</p>'}
      <button class="mp-cancelar" data-x>Cerrar</button>`);
    p.onclick = e => { const b = e.target.closest('[data-c],[data-k],[data-x]'); if(!b) return;
      if(b.dataset.c) this.buscarColores(b.dataset.c); else if(b.dataset.k){ cerrarPopMio(); this.irDia(b.dataset.k); } else cerrarPopMio(); };
  },

  /* ---------- Nota por voz: «mañana dentista a las cinco» ---------- */
  notaVoz(){
    const idi = (App.ajustes && App.ajustes.idiomaVoz) || 'es-ES';
    const p = popMio(`<div class="mp-fecha">🎤 Nota por voz</div>
      <h3 class="mp-h">Di la fecha y después la nota</h3>
      <div class="seg vn-idioma"><button data-l="es-ES" class="${idi.startsWith('es') ? 'on' : ''}">Castellano</button><button data-l="ca-ES" class="${idi.startsWith('ca') ? 'on' : ''}">Català</button></div>
      <p class="mp-p vn-ayuda">Ejemplos: «mañana dentista a las cinco», «el lunes de la semana que viene reunión», «el dilluns de la setmana que ve metge», «2 de abril cumpleaños», «comprar pan el viernes». Pulsa el micro para empezar y otra vez para terminar: la nota se crea sola.</p>
      <button class="vn-mic" id="vnMic" aria-label="Hablar">${icono('mic')}</button>
      <textarea class="ne-texto vn-texto" id="vnTexto" placeholder="Aquí aparecerá lo que digas (también puedes escribir)"></textarea>
      <div class="vn-prev" id="vnPrev"></div>
      <div class="mp-fila"><button class="mp-b" data-x>Cancelar</button><button class="mp-b mp-pri" data-crear>Crear nota</button></div>`, 'vn-pop');
    const t = $('#vnTexto'), prev = () => { const r = parseVoiceDate(t.value); $('#vnPrev').innerHTML = t.value.trim() ? `📅 <b>${fechaBonita(iso(r.date || new Date()), true)}</b>${r.date ? '' : ' (no he entendido la fecha: hoy)'}<br>📝 ${esc((r.date ? r.rest : t.value).trim() || '…')}` : ''; };
    t.oninput = prev;
    p.parentNode._alCerrar = () => { if(Voz.activo) Voz.parar(); clearInterval(this._vn); };
    p.onclick = async e => {
      const b = e.target.closest('button'); if(!b) return;
      if(b.dataset.l){ App.ajustes.idiomaVoz = b.dataset.l; await guardarAjustes(); $$('.vn-idioma button', p).forEach(x => x.classList.toggle('on', x === b)); }
      else if(b.id === 'vnMic'){
        if(Voz.activo){ Voz.parar(); return; }
        Voz.empezar(t, b, null); clearInterval(this._vn);
        this._vn = setInterval(() => { if(!Voz.activo){ clearInterval(this._vn); setTimeout(() => { if($('#vnTexto') && t.value.trim()) this.crearNotaVoz(t.value); else if($('#vnTexto')) toast('No he oído nada. Prueba otra vez.'); }, 400); } }, 300);
      }
      else if('crear' in b.dataset) this.crearNotaVoz(t.value);
      else if('x' in b.dataset){ if(Voz.activo) Voz.parar(); clearInterval(this._vn); cerrarPopMio(); }
    };
  },
  async crearNotaVoz(txt){
    txt = String(txt || '').trim(); if(!txt){ toast('Di o escribe algo primero'); return; }
    clearInterval(this._vn); if(Voz.activo) Voz.parar();
    const r = parseVoiceDate(txt), k = iso(r.date || new Date());
    let texto = ((r.date ? r.rest : txt).trim() || txt); texto = texto.charAt(0).toUpperCase() + texto.slice(1);
    await this.guardarDia(k, [...this.notas(k), { id:nuevoId('n'), texto, color:'none', hecha:false, fotos:[], creada:Date.now() }]);
    cerrarPopMio();
    const d = deIso(k); this.mes = new Date(d.getFullYear(), d.getMonth(), 1); if(this.modo === 'dia') this.dia = k; this.sel = k;
    this.pintar(); toast('🎤 Nota creada el ' + fechaCortaB(k));
  },

  /* ---------- Arranque ---------- */
  iniciar(){
    this.dia = hoyIso();
    $('#agMic').innerHTML = icono('mic');
    $('#agMic').onclick = () => this.notaVoz();
    const c = $('#agCuerpo');
    c.addEventListener('click', e => {
      if(Date.now() - (this._desliz || 0) < 400) return;
      const b = e.target.closest('button,img[data-ver],.ag-item'); if(!b) return;
      const d = b.dataset;
      if(b.tagName === 'IMG'){ verFotoGrande(b.src); return; }
      if(d.m) this.ponerModo(d.m);
      else if(d.mv) this.pasar(+d.mv);
      else if('hoy' in d) this.irHoy();
      else if('fotos' in d) this.verFotosMes();
      else if('colores' in d) this.buscarColores(null);
      else if(d.mes != null && b.classList.contains('ag-mini-t')){ this.mes = new Date(this.mes.getFullYear(), +d.mes, 1); this.ponerModo('mes'); }
      else if(d.k) this.elegirDia(d.k);
      else if(d.dia){ this.dia = d.dia; this.pintar(); }
      else if(d.nueva) this.editor(d.nueva, null);
      else if(d.opc) this.elegirDia(d.opc);
      else if(d.hecha) this.marcarHecha(this.dia, d.hecha);
      else if(d.nota) this.editor(this.dia, d.nota);
    });
    c.addEventListener('change', e => { if(e.target.id === 'agElegirDia' && e.target.value){ this.dia = e.target.value; const d = deIso(this.dia); this.mes = new Date(d.getFullYear(), d.getMonth(), 1); this.pintar(); } });
    deslizarPaginas(c, {
      ignorar: t => !!t.closest('input, .seg, .ag-semana'),
      puede: () => true,
      cont: () => $('#agCuerpo .ag-card'),
      fondo: () => { const k = $('#agCuerpo .ag-card'); return k ? getComputedStyle(k).backgroundColor : '#fff'; },
      cambio: dir => { this._desliz = Date.now(); this.mover(dir); }
    });
    Mio.al('agenda', () => { this.pintar(); });
    Mio.al('fotos', () => { if(this.activa() && this.modo === 'dia') this.pintar(); });
    setInterval(() => this.revisarAvisos(), 15000);
    document.addEventListener('visibilitychange', () => { if(!document.hidden) setTimeout(() => this.revisarAvisos(), 500); });
    setTimeout(() => this.revisarAvisos(), 4000);
  }
};
