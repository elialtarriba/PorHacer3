/* PorHacer3 · Tickets (igual que en HOME)
   Fotos de tickets por día (y si quieres, una foto de lo que es), con título e importe.
   Calendario del mes con las miniaturas, buscar, y PDF con totales por fechas o por nombre.
   Se guardan en «lo mío» (Mio): el ticket (con miniaturas) en «tickets» y la foto grande en «fotos». */

const Tickets = {
  mes: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  dia: null, q: '', A: null, S: null,
  TEMAS: [
    { k:'app', name:'Como la app' },
    { k:'marron', name:'Marrón', bg:'#f2e6d8', card:'#fffaf4', acc:'#b08a6a', soft:'#e2cbb3', ink:'#4a3426' },
    { k:'logo', name:'Tonos del logo', bg:'#fbf3dc', card:'#fffdf6', acc:'#c4935f', soft:'#e8d6a8', ink:'#5a3e2b' },
    { k:'miel', name:'Miel', bg:'#fdf6e0', card:'#fffdf5', acc:'#c9962e', soft:'#f5dc8c', ink:'#5a4a1e' },
    { k:'salvia', name:'Salvia', bg:'#eef4e8', card:'#fbfdf8', acc:'#6f8f62', soft:'#c9dfc0', ink:'#2f4a3d' },
    { k:'azul', name:'Azul', bg:'#eaf2f9', card:'#fbfdff', acc:'#4f7fa8', soft:'#c4dcef', ink:'#2f3a4a' },
    { k:'rosa', name:'Rosa', bg:'#fbeff3', card:'#fffbfc', acc:'#b0577a', soft:'#f6d3de', ink:'#6b2f45' },
    { k:'lavanda', name:'Lavanda', bg:'#f4f1fb', card:'#fdfcff', acc:'#6f5cb5', soft:'#e1daf5', ink:'#4a3f57' }
  ],
  tema(){ return this.TEMAS.find(t => t.k === lsGet('ph3-tk-tema')) || this.TEMAS[0]; },
  ponerTema(){
    const t = this.tema(), v = $('#vTickets');
    if(t.k === 'app'){ ['--tk-bg','--tk-card','--tk-acc','--tk-soft','--tk-ink'].forEach(k => v.style.removeProperty(k)); v.classList.remove('tk-propio'); return; }
    Object.entries({ '--tk-bg':t.bg, '--tk-card':t.card, '--tk-acc':t.acc, '--tk-soft':t.soft, '--tk-ink':t.ink }).forEach(([k, x]) => v.style.setProperty(k, x));
    v.classList.add('tk-propio');
  },

  /* ---------- Datos ---------- */
  todos(){ return Mio.todos('tickets').filter(t => !t.tipo); },      // (los de la lista «Gastos» van aparte)
  deDia(k){ return this.todos().filter(t => t.fecha === k).sort((a, b) => (a.creado || 0) - (b.creado || 0)); },
  deMes(y, m){ const p = `${y}-${String(m + 1).padStart(2, '0')}-`; return this.todos().filter(t => (t.fecha || '').startsWith(p)).sort((a, b) => a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : (b.creado || 0) - (a.creado || 0)); },
  importe(v){ const s = String(v || '').replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'); const n = parseFloat(s); return isFinite(n) ? Math.round(n * 100) / 100 : null; },

  /* ---------- Pantalla ---------- */
  abrir(){ soloVista('vTickets'); this.ponerTema(); this.pintar(); },
  activa(){ return $('#vTickets').classList.contains('activa'); },
  pintar(){ if(!this.activa()) return; this.pintarCal(); this.pintarLista(); },
  pintarCal(){
    const y = this.mes.getFullYear(), m = this.mes.getMonth(), ini = new Date(y, m, 1 - ((new Date(y, m, 1).getDay() + 6) % 7)), hoy = hoyIso();
    let celdas = '';
    for(let i = 0; i < 42; i++){
      const d = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + i), k = iso(d), fuera = d.getMonth() !== m, ls = fuera ? [] : this.deDia(k);
      celdas += `<button class="tk-d ${fuera ? 'fuera' : ''} ${i % 7 > 4 ? 'finde' : ''} ${k === hoy ? 'hoy' : ''} ${k === this.dia ? 'sel' : ''} ${ls.length ? 'tiene' : ''}" ${fuera ? 'disabled' : ''} data-k="${k}">
        <span class="tk-n">${d.getDate()}</span>${ls.length ? `<span class="tk-mini" style="background-image:url('${ls[0].mini || ls[0].miniProd || ''}')">${ls[0].mini || ls[0].miniProd ? '' : icono('tickets')}</span>${ls.length > 1 ? `<span class="tk-cuenta">${ls.length}</span>` : ''}` : ''}</button>`;
    }
    const mt = this.deMes(y, m), tot = mt.reduce((s, t) => s + (t.importe || 0), 0);
    $('#tkCal').innerHTML = `<div class="tk-card">
      <div class="tk-cab"><button class="flecha" data-mv="-1" aria-label="Mes anterior">‹</button><div class="tk-tit">${MESES_C[m]} <span>${y}</span></div><button class="flecha" data-mv="1" aria-label="Mes siguiente">›</button></div>
      <div class="tk-suma"><span>🧾 ${mt.length} ${mt.length === 1 ? 'ticket' : 'tickets'}</span>${tot ? `<b>${dinero(tot)}</b>` : ''}</div>
      <div class="tk-sem">${'LMXJVSD'.split('').map(c => `<span>${c}</span>`).join('')}</div>
      <div class="tk-rej">${celdas}</div></div>`;
    $('#tkSub').textContent = mt.length ? mt.length + (mt.length === 1 ? ' ticket' : ' tickets') + ' en ' + MESES[m] + (tot ? ' · ' + dinero(tot) : '') : 'Fotos de tus tickets, por días';
  },
  tarjeta(t){
    return `<button class="tk-item" data-ver="${t.id}">
      <span class="tk-ph" style="background-image:url('${t.mini || ''}')">${t.mini ? '' : icono('tickets')}</span>
      ${t.miniProd ? `<span class="tk-ph tk-prod" style="background-image:url('${t.miniProd}')"></span>` : ''}
      <span class="tk-it"><b>${esc(t.titulo || 'Ticket')}</b><small>${fechaCortaB(t.fecha)}</small></span>
      ${t.importe != null ? `<span class="tk-imp">${dinero(t.importe)}</span>` : ''}</button>`;
  },
  pintarLista(){
    let ls, cab;
    if(this.q.trim()){
      const q = norm(this.q.trim());
      ls = this.todos().filter(t => norm([t.titulo, t.fecha, fechaCortaB(t.fecha), t.importe != null ? String(t.importe).replace('.', ',') : ''].join(' ')).includes(q)).sort((a, b) => a.fecha < b.fecha ? 1 : -1);
      cab = `<div class="tk-lc"><b>${ls.length} ${ls.length === 1 ? 'resultado' : 'resultados'}</b></div>`;
    } else if(this.dia){
      ls = this.deDia(this.dia);
      cab = `<div class="tk-lc"><b>${fechaBonita(this.dia)}</b><button data-todo>Ver todo el mes</button></div>`;
    } else {
      ls = this.deMes(this.mes.getFullYear(), this.mes.getMonth());
      cab = `<div class="tk-lc"><b>Tickets de ${MESES[this.mes.getMonth()]}</b></div>`;
    }
    $('#tkLista').innerHTML = cab + (ls.length ? `<div class="tk-items">${ls.map(t => this.tarjeta(t)).join('')}</div>` : `<div class="tk-vacio">${this.q.trim() ? 'No encuentro ningún ticket con esa palabra.' : 'Aún no hay tickets aquí.<br>Pulsa «＋ Guardar ticket».'}</div>`);
  },
  mover(dir){ this.mes = new Date(this.mes.getFullYear(), this.mes.getMonth() + dir, 1); this.dia = null; this.pintar(); },
  pasar(dir){
    const card = $('#tkCal .tk-card');
    if(!card || matchMedia('(prefers-reduced-motion: reduce)').matches){ this.mover(dir); return; }
    const ctx = paginaEmpieza(card, dir, d => this.mover(d), getComputedStyle(card).backgroundColor);
    if(ctx) paginaA(ctx, 1, 760);
  },
  tocarDia(k){
    this.dia = this.dia === k ? null : k; this.q = ''; $('#tkQ').value = '';
    this.pintar();
    if(this.dia && !this.deDia(k).length) this.nuevo(k);
  },

  /* ---------- Guardar un ticket ---------- */
  nuevo(dia){ this.A = { fecha:dia || this.dia || hoyIso(), foto:null, mini:null, fotoProd:null, miniProd:null, titulo:'', importe:'', editar:null, paso:1 }; this.paso1(); },
  chipsFecha(){
    const h = hoyIso(), a = sumaDias(h, -1), A = this.A;
    return `<div class="tk-chips"><button data-f="${h}" class="${A.fecha === h ? 'on' : ''}">Hoy</button><button data-f="${a}" class="${A.fecha === a ? 'on' : ''}">Ayer</button><label class="tk-fpick">📅 ${fechaCortaB(A.fecha)}<input type="date" id="tkFecha" value="${A.fecha}"></label></div>`;
  },
  enlazarFecha(p){
    p.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { this.leer(); this.A.fecha = b.dataset.f; this.repintar(); });
    const i = p.querySelector('#tkFecha'); if(i) i.onchange = () => { if(i.value){ this.leer(); this.A.fecha = i.value; this.repintar(); } };
  },
  repintar(){ if(!this.A) return; if(this.A.foto || this.A.editar || this.A.paso === 2) this.paso2(); else this.paso1(); },
  leer(){ const a = $('#tkTitulo'), b = $('#tkImporte'); if(!this.A) return; if(a) this.A.titulo = a.value; if(b) this.A.importe = b.value; },
  paso1(){
    this.A.paso = 1;
    const p = popMio(`<div class="tk-pop-ic">${icono('tickets')}</div>
      <h3 class="mp-h tk-centro">Guardar un ticket</h3>
      <div class="tk-preg">¿De qué día es?</div>${this.chipsFecha()}
      <div class="tk-preg">Foto del ticket</div>
      <div class="tk-dos"><button data-cam="1"><span>${icono('camara')}</span>Hacer foto</button><button data-cam="0"><span>${icono('galeria')}</span>Elegir de Fotos</button></div>
      <button class="tk-enlace" data-sin>Guardar sin foto del ticket</button>
      <button class="mp-cancelar" data-x>Cancelar</button>`, 'tk-pop');
    this.enlazarFecha(p);
    p.onclick = e => { const b = e.target.closest('[data-cam],[data-sin],[data-x]'); if(!b) return;
      if(b.dataset.cam) this.fotoTicket(b.dataset.cam === '1'); else if('sin' in b.dataset){ this.A.paso = 2; this.paso2(); } else { this.A = null; cerrarPopMio(); } };
  },
  async sacarFoto(cam){
    const [f] = await elegirFotos(cam, false); if(!f) return null;
    toast('📷 Preparando la foto…');
    try{ return { full:await aligerarImg(f, 1600, .72), mini:await aligerarImg(f, 320, .7) }; }catch(e){ toast('⚠️ No se ha podido leer esta imagen'); return null; }
  },
  async fotoTicket(cam){ this.leer(); const r = await this.sacarFoto(cam); if(!r || !this.A) return; this.A.foto = r.full; this.A.mini = r.mini; this.A.paso = 2; this.paso2(); },
  async fotoProd(cam){ this.leer(); const r = await this.sacarFoto(cam); if(!r || !this.A) return; this.A.fotoProd = r.full; this.A.miniProd = r.mini; this.paso2(); },
  paso2(){
    const A = this.A; A.paso = 2;
    const caja = (src, quitar, sacar, et) => `<div class="tk-pbox">${src ? `<img src="${src}" alt="${et}" data-grande><button class="tk-px" data-quitar="${quitar}" aria-label="Quitar foto">✕</button>` : `<div class="tk-pvacio"><button data-${sacar}="1">${icono('camara')}</button><button data-${sacar}="0">${icono('galeria')}</button></div>`}<span>${et}</span></div>`;
    const p = popMio(`<div class="tk-arriba"><b>${A.editar ? 'Editar ticket' : 'Nuevo ticket'}</b></div>
      ${this.chipsFecha()}
      <div class="tk-fotos2">${caja(A.foto, 'foto', 'tk', 'Ticket')}${caja(A.fotoProd, 'prod', 'pr', 'Lo que es <i>(opcional)</i>')}</div>
      <input class="mp-input" id="tkTitulo" placeholder="¿Qué es? Ej.: Mercadona, zapatillas, farmacia…" value="${esc(A.titulo)}" autocomplete="off">
      <input class="mp-input" id="tkImporte" placeholder="Importe (opcional) · Ej.: 23,50" inputmode="decimal" value="${esc(A.importe)}" autocomplete="off">
      <div class="mp-fila">${A.editar ? '<button class="mp-b mp-borrar" data-borrar aria-label="Borrar">🗑️</button>' : ''}<button class="mp-b" data-x>Cancelar</button><button class="mp-b mp-pri" data-guardar>Guardar</button></div>`, 'tk-pop');
    this.enlazarFecha(p);
    p.onclick = e => { const b = e.target.closest('button,img[data-grande]'); if(!b) return; const d = b.dataset;
      if(b.tagName === 'IMG'){ verFotoGrande(b.src); return; }
      if(d.tk) this.fotoTicket(d.tk === '1'); else if(d.pr) this.fotoProd(d.pr === '1');
      else if(d.quitar){ this.leer(); if(d.quitar === 'foto'){ A.foto = A.mini = null; } else { A.fotoProd = A.miniProd = null; } this.paso2(); }
      else if('borrar' in d) this.borrar(A.editar);
      else if('guardar' in d) this.guardar();
      else if('x' in d){ this.A = null; cerrarPopMio(); } };
  },
  async guardar(){
    const A = this.A; if(!A) return; this.leer();
    if(!A.foto && !A.titulo.trim()){ toast('Pon una foto o escribe qué es'); return; }
    const viejo = A.editar ? Mio.uno('tickets', A.editar) : null;
    const id = viejo ? viejo.id : nuevoId('tk');
    // fotos grandes aparte (si han cambiado)
    const fotoId = A.foto ? (viejo && viejo.foto && Mio.foto(viejo.foto) === A.foto ? viejo.foto : await Mio.ponerFoto(A.foto, null, 'tickets')) : null;
    const prodId = A.fotoProd ? (viejo && viejo.fotoProd && Mio.foto(viejo.fotoProd) === A.fotoProd ? viejo.fotoProd : await Mio.ponerFoto(A.fotoProd, null, 'tickets')) : null;
    if(viejo){ const q = []; if(viejo.foto && viejo.foto !== fotoId) q.push(viejo.foto); if(viejo.fotoProd && viejo.fotoProd !== prodId) q.push(viejo.fotoProd); await Mio.quitarFotos(q); }
    const t = { id, fecha:A.fecha, titulo:A.titulo.trim(), importe:this.importe(A.importe), foto:fotoId, mini:A.mini || null, fotoProd:prodId, miniProd:A.miniProd || null,
      creado:viejo ? viejo.creado : Date.now(), cambiado:Date.now() };
    await Mio.poner('tickets', id, t);
    const [y, m] = t.fecha.split('-').map(Number); this.mes = new Date(y, m - 1, 1); this.dia = t.fecha;
    this.A = null; cerrarPopMio(); this.pintar();
    toast(viejo ? '🧾 Ticket guardado' : '🧾 Ticket guardado el ' + fechaCortaB(t.fecha));
  },
  ver(id){
    const t = Mio.uno('tickets', id); if(!t) return;
    const f = t.foto && Mio.foto(t.foto), fp = t.fotoProd && Mio.foto(t.fotoProd);
    const p = popMio(`<div class="tk-arriba"><b>${esc(t.titulo || 'Ticket')}</b>${t.importe != null ? `<span class="tk-imp">${dinero(t.importe)}</span>` : ''}</div>
      <div class="tk-vfecha">📅 ${fechaBonita(t.fecha, true)}</div>
      ${f ? `<div class="tk-vimg"><img src="${f}" alt="Ticket" data-grande><span>🔍 Tócalo para verlo en grande, ampliarlo y guardarlo</span></div>` : t.foto ? '<div class="tk-vacio">La foto aún se está bajando de la nube…</div>' : '<div class="tk-vacio">Sin foto del ticket</div>'}
      ${fp ? `<div class="tk-vprod"><img src="${fp}" alt="" data-grande><span>Lo que es</span></div>` : ''}
      <div class="mp-fila"><button class="mp-b mp-borrar" data-borrar aria-label="Borrar">🗑️</button><button class="mp-b" data-editar>✏️ Editar</button><button class="mp-b mp-pri" data-x>Cerrar</button></div>`, 'tk-pop');
    p.onclick = e => { const b = e.target.closest('button,img[data-grande]'); if(!b) return;
      if(b.tagName === 'IMG'){ verFotoGrande(b.src, 'Ticket ' + (t.titulo || '') + ' ' + t.fecha); return; }
      if('borrar' in b.dataset) this.borrar(id); else if('editar' in b.dataset) this.editar(id); else cerrarPopMio(); };
  },
  editar(id){
    const t = Mio.uno('tickets', id); if(!t) return;
    this.A = { fecha:t.fecha, foto:t.foto ? Mio.foto(t.foto) || null : null, mini:t.mini || null, fotoProd:t.fotoProd ? Mio.foto(t.fotoProd) || null : null, miniProd:t.miniProd || null,
      titulo:t.titulo || '', importe:t.importe != null ? String(t.importe).replace('.', ',') : '', editar:id, paso:2 };
    this.paso2();
  },
  async borrar(id){
    if(!await confirmarMio('Borrar ticket', '¿Seguro que quieres borrar este ticket y sus fotos?')) return;
    const t = Mio.uno('tickets', id); this.A = null;
    await Mio.quitar('tickets', id); if(t) await Mio.quitarFotos([t.foto, t.fotoProd]);
    this.pintar(); toast('🗑 Ticket borrado');
  },

  /* ---------- Colores de los tickets ---------- */
  elegirTema(){
    const act = this.tema().k;
    const p = popMio(`<h3 class="mp-h">🎨 Colores de los tickets</h3>
      <div class="tk-temas">${this.TEMAS.map(t => `<button data-t="${t.k}" class="${t.k === act ? 'on' : ''}"><span class="tk-tm" style="${t.k === 'app' ? 'background:linear-gradient(135deg,var(--bg),var(--card));border-color:var(--accent)' : `background:linear-gradient(135deg,${t.bg},${t.soft});border-color:${t.acc}`}"><i style="background:${t.k === 'app' ? 'var(--accent)' : t.acc}"></i></span>${t.name}</button>`).join('')}</div>
      <button class="mp-cancelar" data-x>Cerrar</button>`);
    p.onclick = e => { const b = e.target.closest('[data-t],[data-x]'); if(!b) return; if(b.dataset.t){ lsSet('ph3-tk-tema', b.dataset.t); this.ponerTema(); this.elegirTema(); } else cerrarPopMio(); };
  },

  /* ---------- Buscar por fechas o por nombre y crear un PDF ---------- */
  buscarPdf(){
    const h = new Date();
    this.S = this.S || { modo:'fechas', desde:iso(new Date(h.getFullYear(), h.getMonth(), 1)), hasta:hoyIso(), q:'' };
    this.pintarBuscar();
  },
  preset(p){
    const n = new Date(); let a, b;
    if(p === 'mes'){ a = new Date(n.getFullYear(), n.getMonth(), 1); b = new Date(n.getFullYear(), n.getMonth() + 1, 0); }
    else if(p === 'pasado'){ a = new Date(n.getFullYear(), n.getMonth() - 1, 1); b = new Date(n.getFullYear(), n.getMonth(), 0); }
    else if(p === 'visto'){ a = new Date(this.mes.getFullYear(), this.mes.getMonth(), 1); b = new Date(this.mes.getFullYear(), this.mes.getMonth() + 1, 0); }
    else { a = new Date(n.getFullYear(), 0, 1); b = new Date(n.getFullYear(), 11, 31); }
    this.S.desde = iso(a); this.S.hasta = iso(b); this.pintarBuscar();
  },
  resultados(){
    const S = this.S; if(!S) return [];
    let r = this.todos();
    const q = norm((S.q || '').trim());
    if(S.modo !== 'nombre') r = r.filter(t => t.fecha >= S.desde && t.fecha <= S.hasta);
    if(S.modo === 'nombre'){ if(!q) return []; r = r.filter(t => norm(t.titulo || '').includes(q)); }
    if(S.modo === 'ambos' && q) r = r.filter(t => norm(t.titulo || '').includes(q));
    return r.sort((a, b) => a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : (a.creado || 0) - (b.creado || 0));
  },
  cuenta(res){ const tot = res.reduce((s, t) => s + (t.importe || 0), 0);
    return res.length ? `<b>${res.length} ${res.length === 1 ? 'ticket' : 'tickets'}</b>${tot ? ` · Total <b>${dinero(tot)}</b>` : ''}` : `<span>${this.S.modo === 'nombre' && !this.S.q.trim() ? 'Escribe un nombre para buscar' : 'No hay tickets con esta búsqueda'}</span>`; },
  pintarBuscar(){
    const S = this.S, q = $('#tksQ'); if(q) S.q = q.value;
    const res = this.resultados();
    const fechas = `<div class="tk-chips"><button data-p="visto">Mes que veo</button><button data-p="mes">Este mes</button><button data-p="pasado">Mes pasado</button><button data-p="anio">Este año</button></div>
      <div class="tks-rango"><label><span>Desde</span><input type="date" id="tksDesde" value="${S.desde}"></label><label><span>Hasta</span><input type="date" id="tksHasta" value="${S.hasta}"></label></div>`;
    const nombre = `<input class="mp-input" id="tksQ" type="search" enterkeyhint="search" placeholder="${S.modo === 'ambos' ? 'Y que contenga… Ej.: Mercadona' : 'Ej.: Mercadona, farmacia, zapatillas…'}" value="${esc(S.q)}" autocomplete="off">`;
    const p = popMio(`<div class="tk-pop-ic">${icono('buscar')}</div>
      <h3 class="mp-h tk-centro">¿Qué quieres buscar?</h3>
      <div class="seg tks-modos">${[['fechas','📅 Fechas'],['nombre','🔤 Nombre'],['ambos','📅+🔤 Las dos']].map(([m, t]) => `<button data-m="${m}" class="${S.modo === m ? 'on' : ''}">${t}</button>`).join('')}</div>
      ${S.modo === 'fechas' ? fechas : S.modo === 'nombre' ? nombre : fechas + nombre}
      <div class="tks-cuenta" id="tksCuenta">${this.cuenta(res)}</div>
      <div class="tks-pdfs"><button class="mp-op" id="tksRes" ${res.length ? '' : 'disabled'}><span class="mp-ic">📊</span><span><b>Resumen con gráfico</b><small>En qué gastas, sin fotos: gráfico redondo, mes a mes y la lista</small></span></button>
        <button class="mp-op" id="tksPdf" ${res.length ? '' : 'disabled'}><span class="mp-ic">🧾</span><span><b>PDF con las fotos</b><small>Todos los tickets, con su foto</small></span></button></div>
      <div class="mp-fila"><button class="mp-b" data-x>Cerrar</button></div>`, 'tk-pop');
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return;
      if(b.dataset.m){ S.modo = b.dataset.m; this.pintarBuscar(); } else if(b.dataset.p) this.preset(b.dataset.p);
      else if(b.closest('#tksPdf')) this.pdf(); else if(b.closest('#tksRes')) this.resumen(); else if('x' in b.dataset) cerrarPopMio(); };
    const d1 = $('#tksDesde'), d2 = $('#tksHasta'), qi = $('#tksQ');
    if(d1) d1.onchange = () => { if(d1.value){ S.desde = d1.value; this.pintarBuscar(); } };
    if(d2) d2.onchange = () => { if(d2.value){ S.hasta = d2.value; this.pintarBuscar(); } };
    if(qi){ qi.oninput = () => { S.q = qi.value; const r = this.resultados(); $('#tksCuenta').innerHTML = this.cuenta(r); $('#tksPdf').disabled = $('#tksRes').disabled = !r.length; };
      qi.onkeydown = e => { if(e.key === 'Enter') qi.blur(); }; }
  },
  /* ---------- Resumen con gráficos (sin fotos) ---------- */
  COL_GR: ['#e5484d','#2f80ed','#3fae5a','#f2a20c','#8b5adf','#14a3a3','#e84898','#8a5a3c','#5b6b7a','#f26b1d','#9aa0a6'],
  // «Mercadona», «MERCADONA 2», «Ferretería: pintura» → se juntan por el nombre (lo de antes de «:» o « - »)
  categoria(t){ const base = String(t.titulo || '').split(/:| - | – |,/)[0].trim() || 'Sin nombre'; return { k:norm(base).replace(/[^a-z0-9ñ ]/g, '').replace(/\s+\d+$/, '').trim() || 'sin nombre', n:base.charAt(0).toUpperCase() + base.slice(1) }; },
  grupos(res){
    const g = {}; res.forEach(t => { if(t.importe == null) return; const c = this.categoria(t); (g[c.k] = g[c.k] || { k:c.k, n:c.n, tot:0, n2:0, items:[] }); g[c.k].tot += t.importe; g[c.k].n2++; g[c.k].items.push(t); });
    let l = Object.values(g).sort((a, b) => b.tot - a.tot);
    if(l.length > 10){ const resto = l.slice(9); l = l.slice(0, 9); l.push({ k:'__otros', n:'Otros (' + resto.length + ')', tot:resto.reduce((s, x) => s + x.tot, 0), n2:resto.reduce((s, x) => s + x.n2, 0), otros:resto.map(x => x.n) }); }
    l.forEach((x, i) => x.c = this.COL_GR[i % this.COL_GR.length]);
    return l;
  },
  grafRedondo(l, tot){
    const S = 760, c = document.createElement('canvas'); c.width = S; c.height = S; const x = c.getContext('2d'), R = S / 2 - 10, r = R * 0.58;
    let a = -Math.PI / 2;
    l.forEach(g => { const da = (g.tot / tot) * Math.PI * 2; x.beginPath(); x.moveTo(S / 2, S / 2); x.arc(S / 2, S / 2, R, a, a + da); x.closePath(); x.fillStyle = g.c; x.fill();
      x.strokeStyle = '#fff'; x.lineWidth = 5; x.stroke();
      if(da > 0.32){ const m = a + da / 2, px = S / 2 + Math.cos(m) * (R + r) / 2, py = S / 2 + Math.sin(m) * (R + r) / 2; x.fillStyle = '#fff'; x.font = '900 34px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(Math.round(g.tot / tot * 100) + '%', px, py); }
      a += da; });
    x.beginPath(); x.arc(S / 2, S / 2, r, 0, Math.PI * 2); x.fillStyle = '#fff'; x.fill();
    x.fillStyle = '#3a3a3c'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '800 34px Arial'; x.fillText('TOTAL', S / 2, S / 2 - 38);
    x.font = '900 60px Arial'; x.fillText(dinero(tot), S / 2, S / 2 + 22);
    return c.toDataURL('image/png');
  },
  // barras de cada mes, partidas por lo que has gastado en cada cosa
  grafMeses(meses, l, max){
    const W = 1400, H = 640, pad = { l:120, r:20, t:30, b:90 }, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const aw = W - pad.l - pad.r, ah = H - pad.t - pad.b, n = meses.length, bw = Math.min(110, aw / n * 0.62);
    const paso = (() => { const e = Math.pow(10, Math.floor(Math.log10(max || 1))); return [1, 2, 2.5, 5, 10].map(m => m * e).find(s => max / s <= 5) || e * 10; })(), top = Math.ceil((max || 1) / paso) * paso;
    x.font = '700 24px Arial'; x.fillStyle = '#6b6b70'; x.textAlign = 'right'; x.textBaseline = 'middle'; x.strokeStyle = '#e3e3e6'; x.lineWidth = 2;
    for(let v = 0; v <= top + 0.001; v += paso){ const y = pad.t + ah - v / top * ah; x.beginPath(); x.moveTo(pad.l, y); x.lineTo(W - pad.r, y); x.stroke(); x.fillText(Math.round(v) + ' €', pad.l - 12, y); }
    meses.forEach((m, i) => { const cx = pad.l + aw * (i + 0.5) / n; let y = pad.t + ah;
      l.forEach(g => { const v = m.por[g.n] || 0; if(!v) return; const h = v / top * ah; x.fillStyle = g.c; x.fillRect(cx - bw / 2, y - h, bw, h); y -= h; });
      x.fillStyle = '#3a3a3c'; x.textAlign = 'center'; x.textBaseline = 'bottom'; x.font = '900 24px Arial'; if(m.tot) x.fillText(Math.round(m.tot) + ' €', cx, y - 6);
      x.textBaseline = 'top'; x.font = '800 24px Arial'; x.fillStyle = '#6b6b70'; x.fillText(m.et, cx, pad.t + ah + 14); });
    return c.toDataURL('image/png');
  },
  async resumen(){
    const res = this.resultados(); if(!res.length) return;
    const S = this.S, th = this.tema().k === 'app' ? (() => { const c = App.ajustes.colores; return { bg:c.bg, acc:c.accent, soft:c.line, ink:c.ink }; })() : this.tema();
    const fl = k => deIso(k).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
    const crit = S.modo === 'nombre' ? `Búsqueda: «${esc(S.q.trim())}»` : `Del ${fl(S.desde)} al ${fl(S.hasta)}${S.modo === 'ambos' && S.q.trim() ? ` · «${esc(S.q.trim())}»` : ''}`;
    const conImp = res.filter(t => t.importe != null), tot = conImp.reduce((s, t) => s + t.importe, 0), l = this.grupos(res);
    if(!tot){ popAviso('Resumen', 'Estos tickets no tienen importe, así que no se puede hacer el gráfico. Pon el importe al guardar el ticket.'); return; }
    // meses que abarca la búsqueda
    const ini = S.modo === 'nombre' ? res[0].fecha : S.desde, fin = S.modo === 'nombre' ? res[res.length - 1].fecha : S.hasta, meses = [];
    for(let d = new Date(+ini.slice(0, 4), +ini.slice(5, 7) - 1, 1); iso(d).slice(0, 7) <= fin.slice(0, 7) && meses.length < 24; d.setMonth(d.getMonth() + 1)){
      const k = iso(d).slice(0, 7), its = conImp.filter(t => t.fecha.startsWith(k)), por = {};
      its.forEach(t => { const c = this.categoria(t), g = l.find(x => x.k === c.k) || l.find(x => x.otros); if(g) por[g.n] = (por[g.n] || 0) + t.importe; });
      meses.push({ k, et:MESES_C[d.getMonth()].slice(0, 3) + (meses.length === 0 || d.getMonth() === 0 ? ' ' + String(d.getFullYear()).slice(2) : ''), tot:its.reduce((s, t) => s + t.importe, 0), por, n:its.length });
    }
    const varios = meses.length > 1, maxMes = Math.max(...meses.map(m => m.tot)), conDatos = meses.filter(m => m.tot);
    const media = conDatos.length ? tot / conDatos.length : tot, mayor = meses.reduce((a, b) => b.tot > a.tot ? b : a, meses[0]);
    toast('📊 Preparando el resumen…', null, null, 15000);
    const redondo = this.grafRedondo(l, tot), barras = varios ? this.grafMeses(meses, l, maxMes) : null;
    const tarjeta = (et, v, fondo, color) => `<div style="flex:1;padding:12px 14px;border-radius:14px;background:${fondo};color:${color || th.ink};border:2px solid ${fondo === '#fff' ? th.soft : fondo}"><div style="font-size:11px;font-weight:800;opacity:.7;letter-spacing:.04em">${et}</div><div style="font-size:22px;font-weight:900;margin-top:2px">${v}</div></div>`;
    const td = `padding:7px 8px;border-bottom:1px solid ${th.soft}`;
    // tabla de cada cosa por mes (si son pocos meses)
    const tablaMeses = varios && meses.length <= 6 ? `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:10px"><tr style="font-weight:900;opacity:.75"><td style="${td}"></td>${meses.map(m => `<td style="${td};text-align:right">${m.et}</td>`).join('')}<td style="${td};text-align:right">Total</td></tr>
        ${l.map(g => `<tr><td style="${td};font-weight:800"><span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${g.c};margin-right:6px"></span>${esc(g.n)}</td>${meses.map(m => `<td style="${td};text-align:right">${m.por[g.n] ? dinero(m.por[g.n]) : '—'}</td>`).join('')}<td style="${td};text-align:right;font-weight:900">${dinero(g.tot)}</td></tr>`).join('')}
        <tr style="font-weight:900"><td style="padding:8px">Total</td>${meses.map(m => `<td style="padding:8px;text-align:right">${m.tot ? dinero(m.tot) : '—'}</td>`).join('')}<td style="padding:8px;text-align:right;color:${th.acc}">${dinero(tot)}</td></tr></table>` : '';
    const html = `<div style="color:${th.ink}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:16px;border-bottom:4px solid ${th.acc}">
        <div style="display:flex;align-items:center;gap:16px"><div style="width:62px;height:62px;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:38px">📊</div>
          <div><div style="font-size:28px;font-weight:900;line-height:1.1">¿En qué gasto?</div><div style="margin-top:6px;font-size:14px;font-weight:700;opacity:.75">${crit}</div></div></div>
        <img src="logo.png" style="width:52px;height:52px;border-radius:13px;object-fit:cover"></div>
      <div style="display:flex;gap:10px;margin:18px 0 4px">${tarjeta('TOTAL', dinero(tot), th.acc, '#fff')}${tarjeta('TICKETS', res.length, '#fff')}${tarjeta('MEDIA POR TICKET', dinero(tot / conImp.length), '#fff')}${varios ? tarjeta('MEDIA AL MES', dinero(media), '#fff') : ''}</div>
      <div style="margin-top:16px;padding:18px;border-radius:16px;background:#fff;display:flex;gap:22px;align-items:center">
        <img src="${redondo}" style="width:300px;height:300px;flex:none">
        <table style="flex:1;border-collapse:collapse;font-size:14px">${l.map(g => `<tr><td style="padding:6px 4px;width:18px"><span style="display:block;width:15px;height:15px;border-radius:4px;background:${g.c}"></span></td>
          <td style="padding:6px 4px;font-weight:800">${esc(g.n)}<div style="font-size:11px;font-weight:600;opacity:.6">${g.n2} ${g.n2 === 1 ? 'ticket' : 'tickets'}${g.otros ? ' · ' + esc(g.otros.slice(0, 6).join(', ')) + (g.otros.length > 6 ? '…' : '') : ''}</div></td>
          <td style="padding:6px 4px;text-align:right;font-weight:900;white-space:nowrap">${dinero(g.tot)}</td><td style="padding:6px 4px;text-align:right;font-weight:800;opacity:.65;width:48px">${Math.round(g.tot / tot * 100)}%</td></tr>`).join('')}</table></div>
      ${varios ? `<div style="margin-top:16px;padding:16px 18px;border-radius:16px;background:#fff">
        <div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:18px;font-weight:900">Mes a mes</div><div style="font-size:13px;font-weight:700;opacity:.7">El mes que más: <b>${MESES_C[+mayor.k.slice(5) - 1]} ${mayor.k.slice(0, 4)}</b> (${dinero(mayor.tot)})</div></div>
        <img src="${barras}" style="width:100%;margin-top:8px">${tablaMeses}</div>` : ''}
      <div style="margin-top:16px;padding:14px 16px;border-radius:16px;background:#fff">
        <div style="font-size:18px;font-weight:900;margin-bottom:4px">Todos los tickets</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">${res.map(t => { const c = l.find(x => x.k === this.categoria(t).k) || l.find(x => x.otros);
          return `<tr><td style="${td};white-space:nowrap;opacity:.7;font-weight:700;width:110px">${deIso(t.fecha).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'2-digit' })}</td>
          <td style="${td};font-weight:700"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${t.importe != null && c ? c.c : '#ccc'};margin-right:7px"></span>${esc(t.titulo || 'Ticket')}</td>
          <td style="${td};text-align:right;font-weight:900;white-space:nowrap;color:${th.acc}">${t.importe != null ? dinero(t.importe) : '—'}</td></tr>`; }).join('')}
          <tr><td colspan="2" style="padding:10px 8px;text-align:right;font-weight:900">Total</td><td style="padding:10px 8px;text-align:right;font-weight:900;font-size:16px;color:${th.acc}">${dinero(tot)}</td></tr></table>
        ${conImp.length < res.length ? `<div style="font-size:12px;opacity:.6;margin-top:6px">${res.length - conImp.length} ticket(s) sin importe no cuentan en el gráfico.</div>` : ''}</div>
      <div style="margin-top:14px;font-size:11px;opacity:.5;text-align:center">PorHacer3 · ${new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</div></div>`;
    cerrarPopMio();
    await pdfDeHtml(html, 'resumen-gastos-' + (S.modo === 'nombre' ? S.q.trim() : S.desde + '-a-' + S.hasta), th.bg);
  },
  async pdf(){
    const res = this.resultados(); if(!res.length) return;
    const S = this.S, th = this.tema().k === 'app' ? (() => { const c = App.ajustes.colores; return { bg:c.bg, acc:c.accent, soft:c.line, ink:c.ink }; })() : this.tema();
    const fl = k => deIso(k).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
    const crit = S.modo === 'nombre' ? `Búsqueda: «${esc(S.q.trim())}»` : `Del ${fl(S.desde)} al ${fl(S.hasta)}${S.modo === 'ambos' && S.q.trim() ? ` · «${esc(S.q.trim())}»` : ''}`;
    const tot = res.reduce((s, t) => s + (t.importe || 0), 0), grupos = [];
    res.forEach(t => { const k = t.fecha.slice(0, 7); let g = grupos.find(x => x.k === k); if(!g){ g = { k, items:[] }; grupos.push(g); } g.items.push(t); });
    const td = `padding:9px 8px;border-bottom:1px solid ${th.soft}`;
    const fila = t => `<tr><td style="${td};width:64px">${t.mini ? `<img src="${t.mini}" style="width:52px;height:52px;object-fit:cover;border-radius:10px;display:block">` : `<div style="width:52px;height:52px;border-radius:10px;background:${th.soft};text-align:center;line-height:52px;font-size:22px">🧾</div>`}</td>
      <td style="${td};font-size:13px;font-weight:700;white-space:nowrap;opacity:.75">${deIso(t.fecha).toLocaleDateString('es-ES', { weekday:'short', day:'numeric', month:'short' })}</td>
      <td style="${td};font-size:15px;font-weight:800">${esc(t.titulo || 'Ticket')}${t.miniProd ? `<img src="${t.miniProd}" style="width:30px;height:30px;object-fit:cover;border-radius:7px;vertical-align:middle;margin-left:8px">` : ''}</td>
      <td style="${td};font-size:15px;font-weight:900;text-align:right;white-space:nowrap;color:${th.acc}">${t.importe != null ? dinero(t.importe) : '—'}</td></tr>`;
    const html = `<div style="color:${th.ink}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:18px;border-bottom:4px solid ${th.acc}">
        <div style="display:flex;align-items:center;gap:16px"><div style="width:66px;height:66px;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:40px">🧾</div>
          <div><div style="font-size:30px;font-weight:900;line-height:1.1">Tickets</div><div style="margin-top:6px;font-size:14px;font-weight:700;opacity:.75">${crit}</div></div></div>
        <img src="logo.png" style="width:56px;height:56px;border-radius:13px;object-fit:cover"></div>
      <div style="display:flex;gap:12px;margin:20px 0 6px">
        <div style="flex:1;padding:14px 16px;border-radius:14px;background:#fff;border:2px solid ${th.soft}"><div style="font-size:12px;font-weight:800;opacity:.6">TICKETS</div><div style="font-size:26px;font-weight:900">${res.length}</div></div>
        <div style="flex:1;padding:14px 16px;border-radius:14px;background:${th.acc};color:#fff"><div style="font-size:12px;font-weight:800;opacity:.85">TOTAL</div><div style="font-size:26px;font-weight:900">${dinero(tot)}</div></div></div>
      ${grupos.map(g => { const sub = g.items.reduce((s, t) => s + (t.importe || 0), 0), [y, m] = g.k.split('-').map(Number);
        return `<div style="margin-top:18px;padding:14px 14px 8px;border-radius:16px;background:#fff">
          <div style="display:flex;justify-content:space-between;align-items:baseline;padding:0 8px 6px"><div style="font-size:18px;font-weight:900">${MESES_C[m - 1]} ${y}</div><div style="font-size:14px;font-weight:800;opacity:.7">${g.items.length} ${g.items.length === 1 ? 'ticket' : 'tickets'}</div></div>
          <table style="width:100%;border-collapse:collapse;text-align:left">${g.items.map(fila).join('')}
            <tr><td colspan="3" style="padding:11px 8px;font-size:14px;font-weight:900;text-align:right">Subtotal</td><td style="padding:11px 8px;font-size:16px;font-weight:900;text-align:right;white-space:nowrap;color:${th.acc}">${dinero(sub)}</td></tr></table></div>`; }).join('')}
      <div style="margin-top:22px;display:flex;justify-content:flex-end"><div style="padding:14px 20px;border-radius:14px;background:${th.ink};color:#fff;font-size:20px;font-weight:900">Total: ${dinero(tot)}</div></div>
      <div style="margin-top:26px;text-align:center;font-size:11px;font-weight:700;opacity:.5">PorHacer3 · ${new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })} · Elisabeth Altarriba</div></div>`;
    cerrarPopMio();
    await pdfDeHtml(html, 'tickets-' + (S.modo === 'nombre' ? S.q.trim() : S.desde + '-a-' + S.hasta + (S.modo === 'ambos' && S.q.trim() ? '-' + S.q.trim() : '')), th.bg);
  },

  /* ---------- Arranque ---------- */
  iniciar(){
    $('#tkBuscarPdf').innerHTML = icono('buscar');
    $('#tkBuscarPdf').onclick = () => this.buscarPdf();
    $('#tkNuevo').onclick = () => this.nuevo();
    $('#tkTema').onclick = () => this.elegirTema(); $('#tkTema').innerHTML = icono('paleta'); $('#tkLupa').innerHTML = icono('buscar'); $('#tkNuevo span').innerHTML = icono('tickets');
    const q = $('#tkQ'); q.oninput = () => { this.q = q.value; this.pintarLista(); }; q.onkeydown = e => { if(e.key === 'Enter') q.blur(); };
    $('#tkCuerpo').addEventListener('click', e => {
      if(Date.now() - (this._desliz || 0) < 400) return;
      const b = e.target.closest('button'); if(!b) return; const d = b.dataset;
      if(d.mv) this.pasar(+d.mv); else if(d.k) this.tocarDia(d.k); else if(d.ver) this.ver(d.ver); else if('todo' in d){ this.dia = null; this.pintar(); }
    });
    const zona = $('#tkCal');
    deslizarPaginas(zona, { puede: () => true, ignorar: t => !!t.closest('input'), cont: () => $('#tkCal .tk-card'),
      fondo: () => { const k = $('#tkCal .tk-card'); return k ? getComputedStyle(k).backgroundColor : '#fff'; },
      cambio: dir => { this._desliz = Date.now(); this.mover(dir); } });
    Mio.al('tickets', () => this.pintar());
    this.ponerTema();
    if(typeof Gastos !== 'undefined') Gastos.iniciar();
  }
};
