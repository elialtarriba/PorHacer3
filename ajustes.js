/* PorHacer3 · Configuración, ordenada:
   - «Para toda la app»: General · Tema y colores · Cuenta y nube · Copias de seguridad
   - «Cada apartado»: PorHacer · Calendario · Listas · Agenda · Tickets · Sitios · Calculadora · Notas secretas
   En el móvil: primero el menú y al tocar, su página (con ‹ para volver). En pantalla ancha: menú a la izquierda y página a la derecha. */

const Ajustes = {
  pagina: null,
  PAGS: [
    { grupo:'Para toda la app' },
    { k:'general', ico:'portada',    t:'General',              s:'Qué se ve al abrir · micrófono' },
    { k:'tema',    ico:'paleta',     t:'Tema y colores',       s:'Los colores de toda la app' },
    { k:'cuenta',  ico:'ajustes',    t:'Cuenta y nube',        s:'Tu cuenta, tus tableros y dónde se guarda cada cosa' },
    { k:'copias',  ico:'copia',      t:'Copias de seguridad',  s:'Guardar y recuperar tus datos' },
    { grupo:'Cada apartado' },
    { k:'porhacer', ico:'tablero',    t:'Tareas',   s:'Colores, columnas, personas, al acabar, fotos y emails' },
    { k:'cal',      ico:'calendario', t:'Calendario Tareas',          s:'Cómo se ve al abrirlo · colores' },
    { k:'listas',   ico:'listas',     t:'Listas',              s:'El color de cada lista · sonidos' },
    { k:'agenda',   ico:'agenda',     t:'Agenda',              s:'Cómo se ve al abrirla · colores' },
    { k:'tickets',  ico:'tickets',    t:'Tickets',             s:'Colores de los tickets' },
    { k:'sitios',   ico:'sitios',     t:'Sitios',              s:'Colores · el color de cada casa' },
    { k:'calc',     ico:'calculadora',t:'Calculadora',         s:'Temas de la calculadora' },
    { k:'bloc',     ico:'bloc',       t:'Notas secretas',      s:'Contraseña y copia' },
    { k:'grabar',   ico:'grabar',     t:'Grabar',              s:'Dónde se guardan las notas · colores' }
  ],
  // nombres de antes → página y apartado a abrir
  ANTES: { general:['general'], temas:['tema'], colores:['tema','colores'], tableros:['cuenta'], columnas:['porhacer','columnas'], personas:['porhacer','personas'],
    fiesta:['porhacer','fiesta'], mas:['porhacer'], bloc:['bloc'], calc:['calc'], copias:['copias'] },

  ancho(){ return matchMedia('(min-width: 760px)').matches; },
  abrir(t){
    this.pintarMenu();
    TemaSec.aplicar('conf');
    abrir('ajustes');
    if(t) this.tab(t); else if(this.ancho()) this.ir(this.pagina || 'general'); else this.alMenu();
  },
  tab(t){ const [p, ac] = this.ANTES[t] || [t]; this.ir(p, ac); },
  refrescar(){ if($('#ajustes').classList.contains('abierto') && this.pagina) this.ir(this.pagina, null, true); },
  pintarMenu(){
    $('#ajMenu').innerHTML = this.PAGS.map(p => p.grupo ? `<div class="aj-grupo">${p.grupo}</div>` :
      `<button class="aj-m ${p.k === this.pagina ? 'on' : ''}" data-p="${p.k}"><span class="aj-m-ico">${icono(p.ico)}</span><span class="aj-m-tx"><b>${p.t}</b><small>${p.s}</small></span><em>›</em></button>`).join('')
      + `<div class="pie-copy">PorHacer3 ${VERSION} · © Elisabeth Altarriba</div>`;
    $$('#ajMenu [data-p]').forEach(b => b.onclick = () => this.ir(b.dataset.p));
    $('#ajAtras').onclick = () => this.alMenu();
  },
  alMenu(){
    this.pagina = null; $('#ajustes').classList.remove('en-pagina'); $('#ajTit').textContent = 'Configuración';
    $$('#ajMenu .aj-m').forEach(b => b.classList.remove('on')); $('#ajMenu').scrollTop = 0;
  },
  ir(p, ac, quieto){
    const P = this.PAGS.find(x => x.k === p); if(!P) return;
    const sc = $('#ajPagina').scrollTop;
    this.pagina = p; $('#ajustes').classList.add('en-pagina'); $('#ajTit').textContent = P.t;
    $$('#ajMenu .aj-m').forEach(b => b.classList.toggle('on', b.dataset.p === p));
    const cont = $('#ajPagina');
    cont.innerHTML = `<div class="aj-pcab"><span class="aj-m-ico">${icono(P.ico)}</span><div><h3>${P.t}</h3><small>${P.s}</small></div></div>` + this['p_' + p]();
    // los apartados que se despliegan: se abre uno cada vez
    $$('.aj-acord', cont).forEach(d => d.addEventListener('toggle', () => { if(d.open){ $$('.aj-acord', cont).forEach(o => { if(o !== d) o.open = false; }); this._ac = d.dataset.ac; } }));
    if(ac){ const d = $(`.aj-acord[data-ac="${ac}"]`, cont); if(d){ d.open = true; setTimeout(() => d.scrollIntoView({ block:'start', behavior:'smooth' }), 80); } }
    (this['e_' + p] || (() => {})).call(this, cont);
    cont.scrollTop = quieto ? sc : 0;
  },
  async guardar(){ await guardarAjustes(); },

  /* ---------- Piezas ---------- */
  tarjeta(tit, html, ayuda){ return `<div class="aj-tarj"><h4>${tit}</h4>${ayuda ? `<p class="aj-ayuda">${ayuda}</p>` : ''}${html}</div>`; },
  acord(k, ico, tit, sub, html){ return `<details class="aj-acord" data-ac="${k}"><summary><span class="aj-ac-ico">${ico}</span><span class="aj-ac-tx"><b>${tit}</b><small>${sub}</small></span><em>›</em></summary><div class="aj-ac-c">${html}</div></details>`; },
  seg(id, ops, val){ return `<div class="seg aj-seg" id="${id}">${ops.map(([v, t]) => `<button data-v="${v}" class="${String(v) === String(val) ? 'on' : ''}">${t}</button>`).join('')}</div>`; },
  enlazarSeg(id, fn){ $$('#' + id + ' button').forEach(b => b.onclick = async () => { $$('#' + id + ' button').forEach(x => x.classList.toggle('on', x === b)); await fn(b.dataset.v); }); },
  nota(txt){ return `<div class="aj-nota">${txt}</div>`; },
  enlace(p, txt){ return `<button class="aj-enlace" data-irp="${p}">${txt} ›</button>`; },
  enlazarEnlaces(cont){ $$('[data-irp]', cont).forEach(b => b.onclick = () => { const [p, ac] = b.dataset.irp.split(':'); this.ir(p, ac); }); },

  /* ---------- GENERAL ---------- */
  p_general(){
    const a = App.ajustes, ini = a.inicio === 'tablero' ? 'tareas' : (a.inicio || 'portada');
    const ops = [['portada','portada','Portada'],['tareas','tablero','Tareas'],['cal','calendario','Calendario Tareas'],['listas','listas','Listas'],['agenda','agenda','Agenda'],['tickets','tickets','Tickets'],['sitios','sitios','Sitios'],['calc','calculadora','Calculadora'],['grabar','grabar','Grabar']];
    return this.tarjeta('🚪 Al abrir la app, ver…', `<div class="gen-inicio">${ops.map(([k, ic, t]) => `<button data-ini="${k}" class="${k === ini ? 'on' : ''}"><span>${icono(ic)}</span>${t}</button>`).join('')}</div>`, 'Lo primero que se ve al entrar en la app, en este aparato.')
      + this.acord('colores', '🎨', 'Colores de la portada', 'Ahora: ' + TemaSec.nombre('portada'), TemaSec.rejilla('portada') + '<p class="aj-ayuda">Solo cambia la pantalla de inicio (también con el botón 🎨 de la portada).</p>')
      + this.tarjeta('↕️ Orden de la portada', '<button class="btn-sec btn-ancho" id="ajOrden">↺ Volver al orden de siempre</button>', 'Para cambiar de sitio un botón de la portada, <b>mantenlo pulsado</b> un momento y <b>arrástralo</b> donde quieras.')
      + this.tarjeta('🎤 Idioma del micrófono', this.seg('ajVoz', [['es-ES','Castellano'],['ca-ES','Català'],['en-GB','English']], a.idiomaVoz),
        'Para dictar en las tareas, la agenda y las notas. Puedes decir «coma», «punto», «punto y aparte», «nueva línea».')
      + this.nota('Los <b>colores</b> de toda la app están en ' + this.enlace('tema', '🎨 Tema y colores') + ' · Tu <b>cuenta</b> y <b>dónde se guarda</b> cada cosa, en ' + this.enlace('cuenta', '☁️ Cuenta y nube'));
  },
  e_general(cont){
    const a = App.ajustes;
    $$('[data-ini]', cont).forEach(b => b.onclick = async () => { a.inicio = b.dataset.ini; await this.guardar(); $$('[data-ini]', cont).forEach(x => x.classList.toggle('on', x === b)); toast('🚪 Al abrir: ' + b.textContent.trim()); });
    this.enlazarSeg('ajVoz', async v => { a.idiomaVoz = v; await this.guardar(); });
    TemaSec.enlazar(cont, 'portada');
    $('#ajOrden').onclick = () => { Portada.ordenDeSiempre(); toast('↺ La portada vuelve al orden de siempre'); };
    this.enlazarEnlaces(cont);
  },

  /* ---------- TEMA Y COLORES ---------- */
  p_tema(){
    const tk = Tickets.tema(), calc = Calc.actual || 'Como la app (PorHacer3)';
    const fila = (ico, t, v, p) => `<button class="aj-propio" data-irp="${p}"><span class="aj-ac-ico">${icono(ico)}</span><span class="aj-ac-tx"><b>${t}</b><small>${v}</small></span><em>›</em></button>`;
    return this.tarjeta('🎨 Tema de toda la app', '<div class="temas" id="ajTemas"></div>',
        'Cambia los colores de <b>toda la app</b>: la portada, las tareas, el calendario, la agenda, los botones y las ventanas.')
      + this.acord('colores', '🖌️', 'Cambiar cada color, uno a uno', 'Si quieres afinar el tema: el fondo, los botones, la letra…', '<div id="ajColores"></div>')
      + this.tarjeta('🧩 Apartados que pueden tener sus propios colores',
        fila('portada', 'Portada (pantalla de inicio)', 'Ahora: ' + TemaSec.nombre('portada') + ' · con el botón 🎨 de la portada', 'general:colores')
        + fila('tablero', 'Tareas', 'Ahora: ' + TemaSec.nombre('tareas'), 'porhacer:colores')
        + fila('calendario', 'Calendario Tareas', 'Ahora: ' + TemaSec.nombre('cal'), 'cal')
        + fila('agenda', 'Agenda', 'Ahora: ' + TemaSec.nombre('agenda'), 'agenda')
        + fila('listas', 'Listas', 'Cada lista tiene su color (o «Como la app»)', 'listas')
        + fila('tickets', 'Tickets', 'Ahora: ' + tk.name, 'tickets')
        + fila('sitios', 'Sitios', 'Ahora: ' + TemaSec.nombre('sitios') + ' · y cada casa su color', 'sitios')
        + fila('calculadora', 'Calculadora', 'Ahora: ' + calc, 'calc')
        + fila('grabar', 'Grabar', 'Ahora: ' + TemaSec.nombre('grabar'), 'grabar')
        + fila('ajustes', 'Configuración', 'Ahora: ' + TemaSec.nombre('conf') + ' · con el botón 🎨 de arriba', 'tema'),
        'Estos colores <b>solo cambian su apartado</b>. Si eliges «Como la app», siguen el tema de arriba.');
  },
  e_tema(cont){ this.temas(); this.colores(); this.enlazarEnlaces(cont); const c = $('[data-irp="tema"]', cont); if(c) c.onclick = () => TemaSec.elegir('conf'); },

  /* ---------- CUENTA Y NUBE ---------- */
  p_cuenta(){
    return this.tarjeta('👤 Tu cuenta y tus tableros', '<div id="ajNube"></div>')
      + this.tarjeta('☁️ ¿Dónde se guarda cada cosa?', `<div class="gen-donde">${[['agenda','📒 Agenda'],['tickets','🧾 Tickets'],['sitios','🏡 Sitios'],['listas','📝 Listas']].map(([k, t]) => { const d = k === 'listas' ? Listas.donde() : Mio.donde(k);
          return `<div class="gen-donde-f"><b>${t}</b><div class="seg" data-donde="${k}"><button data-v="nube" class="${d === 'nube' ? 'on' : ''}">☁️ Nube</button><button data-v="aparato" class="${d === 'aparato' ? 'on' : ''}">📱 Este aparato</button></div></div>`; }).join('')}</div>`,
        `<b>Nube</b>: en tu cuenta de Firebase; solo lo ves tú y lo tienes en todos tus aparatos. <b>Este aparato</b>: no sale de este móvil u ordenador (para pasarlo a otro, haz una copia en ${this.enlace('copias', '💾 Copias')}).${Mio.uid ? '' : ' <b>Ahora no has entrado con tu cuenta</b>: lo de «nube» se guarda en el aparato y se sube al entrar.'} Las tareas siempre van con su tablero.`);
  },
  e_cuenta(cont){
    Nube.pintarTableros($('#ajNube'));
    this.enlazarEnlaces(cont);
    $$('[data-donde] button', cont).forEach(b => b.onclick = async () => {
      const sec = b.parentNode.dataset.donde, a = b.dataset.v, nom = { agenda:'la Agenda', tickets:'los Tickets', sitios:'los Sitios', listas:'las Listas' }[sec], n = sec === 'agenda' ? '' : 'n';
      const ahora = sec === 'listas' ? Listas.donde() : Mio.donde(sec); if(ahora === a) return;
      let borrar = false;
      if(a === 'aparato'){
        const enNube = sec === 'listas' ? Listas.modo === 'nube' : Mio.enNube(sec);
        if(enNube){
          const v = await popup({ tit:'📱 Guardar ' + nom + ' en este aparato', html:`<p>Desde ahora ${nom} se guardará${n} solo en este aparato. ¿Qué hago con lo que hay en la nube?</p>
            <button class="opcion" data-v="dejar">☁️ Dejar también una copia en la nube</button><button class="opcion" data-v="borrar">🗑 Quitarlo de la nube</button>
            <p class="aj-ayuda" style="margin-top:10px">En tus otros aparatos ya no se verán los cambios que hagas aquí.</p>`,
            botones:[{ txt:'Cancelar', val:null }], alAbrir:(c, fin) => $$('[data-v]', c).forEach(x => x.onclick = () => fin(x.dataset.v)) });
          if(!v) return; borrar = v === 'borrar';
        }
      } else if(!Mio.uid){
        if(!await popConfirmar('☁️ Guardar ' + nom + ' en la nube', 'Ahora no has entrado con tu cuenta. Se guardará' + n + ' en el aparato y se subirá' + n + ' a la nube cuando entres.', 'De acuerdo')) return;
      }
      toast('⏳ Pasando ' + nom + '…', null, null, 20000);
      try{ await Mio.cambiarDonde(sec, a, borrar); toast(a === 'nube' ? '☁️ ' + capital(nom) + ' se guarda' + n + ' en la nube' : '📱 ' + capital(nom) + ' se guarda' + n + ' en este aparato'); }
      catch(e){ console.warn(e); popAviso('No se ha podido cambiar', e.message || 'Inténtalo otra vez.'); }
      this.ir('cuenta', null, true); Portada.pintar();
    });
  },

  /* ---------- COPIAS DE SEGURIDAD ---------- */
  p_copias(){
    const nNotas = Mio.todos('agenda').reduce((n, d) => n + (d.items || []).length, 0), nCasas = Mio.todos('sitios').filter(x => x.tipo === 'casa').length;
    const mia = `<div class="gen-que">${[['agenda','📒 Agenda', nNotas + (nNotas === 1 ? ' nota' : ' notas')],['tickets','🧾 Tickets', Mio.todos('tickets').length + ''],['sitios','🏡 Sitios', nCasas + (nCasas === 1 ? ' casa' : ' casas')],['listas','📝 Listas', Listas.datos.length + '']].map(([k, t, n]) =>
        `<label class="check" style="margin-top:0"><input type="checkbox" data-que="${k}" checked><span class="caja"></span><span>${t}<small>${n}</small></span></label>`).join('')}</div>
      <div class="gen-btns"><button class="btn-pri" id="genExp">⬇️ Exportar copia</button><button class="btn-sec" id="genImp">⬆️ Importar copia</button></div>
      <input type="file" id="genImpIn" accept=".json,application/json" hidden>`;
    return this.nota('💡 Haz copias de vez en cuando y guárdalas en un sitio seguro (iCloud, un pendrive…). <b>No subas nunca estos archivos a GitHub</b>: tienen tus datos.')
      + this.acord('tareas', '✅', 'Tareas de PorHacer', 'Las tareas, personas, fotos, vídeos y audios · espacio usado', '<div id="ajCopias"></div>')
      + this.acord('mio', '📒', 'Agenda, Tickets, Sitios y Listas', 'En un solo archivo, con sus fotos', mia)
      + this.acord('bloc', '🔒', 'Notas secretas', 'Van cifradas, con tu contraseña', `<p class="aj-ayuda">La copia del bloc se hace desde su página, porque va cifrada.</p>${this.enlace('bloc', '🔒 Ir a Notas secretas')}`);
  },
  e_copias(cont){
    this.enlazarEnlaces(cont);
    // la copia de las tareas se pinta al abrir su apartado
    const dT = $('.aj-acord[data-ac="tareas"]', cont); dT.addEventListener('toggle', () => { if(dT.open) Copias.pintar(); });
    const que = () => { const q = {}; $$('[data-que]', cont).forEach(c => q[c.dataset.que] = c.checked); return q; };
    $('#genExp').onclick = async () => {
      const q = que(); if(!Object.values(q).some(Boolean)){ toast('Marca al menos una cosa'); return; }
      const obj = await Mio.exportar(q), txt = JSON.stringify(obj);
      descargar(new Blob([txt], { type:'application/json' }), 'PorHacer3-copia-' + hoyIso() + '.json');
      toast('💾 Copia guardada (' + tamTxt(txt.length) + ')');
    };
    $('#genImp').onclick = () => $('#genImpIn').click();
    $('#genImpIn').onchange = async e => {
      const f = e.target.files[0]; e.target.value = ''; if(!f) return;
      let obj; try{ obj = JSON.parse(await f.text()); }catch(err){ popAviso('Importar', 'Este archivo no es una copia válida.'); return; }
      if(!obj || obj.tipo !== 'copia-mia'){ popAviso('Importar', 'Este archivo no es una copia de Agenda, Tickets, Sitios y Listas de PorHacer3. (Si es una copia de las tareas, impórtala en «Tareas de PorHacer»).'); return; }
      const modo = await popup({ tit:'⬆️ Importar copia', html:`<p>Copia del ${new Date(obj.fecha).toLocaleDateString('es-ES')}: ${['agenda','tickets','sitios','listas'].filter(k => obj[k]).map(k => ({ agenda:'📒 Agenda', tickets:'🧾 Tickets', sitios:'🏡 Sitios', listas:'📝 Listas' })[k]).join(', ')}.</p>
        <button class="opcion" data-v="juntar">➕ Juntar con lo que ya tengo</button><button class="opcion" data-v="cambiar">♻️ Cambiar lo que tengo por la copia</button>`,
        botones:[{ txt:'Cancelar', val:null }], alAbrir:(c, fin) => $$('[data-v]', c).forEach(b => b.onclick = () => fin(b.dataset.v)) });
      if(!modo) return;
      if(modo === 'cambiar' && !await popConfirmar('¿Cambiar lo que tienes?', 'Se borrará la Agenda, los Tickets y los Sitios que tienes ahora y se pondrá lo de la copia.', 'Cambiar')) return;
      toast('⬆️ Importando…', null, null, 20000);
      try{ const r = await Mio.importar(obj, modo); toast('✅ Importado: ' + r.agenda + ' días, ' + r.tickets + ' tickets, ' + r.sitios + ' sitios, ' + r.listas + ' listas'); this.ir('copias', 'mio', true); }
      catch(err){ console.warn(err); popAviso('Importar', 'No se ha podido importar: ' + err.message); }
    };
  },

  /* ---------- PORHACER (TAREAS) ---------- */
  p_porhacer(){
    const a = App.ajustes;
    return this.nota('Los <b>tableros</b> (crear, compartir, cambiar) están en ' + this.enlace('cuenta', '☁️ Cuenta y nube'))
      + this.acord('colores', '🎨', 'Colores de Tareas', 'Ahora: ' + TemaSec.nombre('tareas'), TemaSec.rejilla('tareas') + '<p class="aj-ayuda">Solo cambian <b>Tareas</b> (también con el botón 🎨 de arriba, dentro de Tareas).</p>')
      + this.acord('columnas', '🗂️', 'Columnas', 'Nombre, color, orden, mostrar u ocultar', '<div id="ajColumnas"></div>')
      + this.acord('personas', '👥', 'Personas', 'A quién se le pueden asignar tareas', '<div id="ajPersonas"></div>')
      + this.acord('fiesta', '🎉', 'Al acabar una tarea', 'Confeti, mensaje, música y email', '<div id="ajFiesta"></div>')
      + this.acord('fotos', '📷', 'Fotos y vídeos', 'Cuánto se aligeran al guardarlos',
        `<h5 class="aj-sub">Calidad de las fotos</h5>${this.seg('ajFoto', [['ligera','Ligera'],['normal','Normal'],['alta','Alta']], a.calidadFoto)}
         <p class="aj-ayuda">Ligera ≈ 150 KB · Normal ≈ 300 KB · Alta ≈ 700 KB por foto (una foto del móvil sin aligerar suele pesar 3-5 MB).</p>
         <h5 class="aj-sub">Calidad de los vídeos</h5>${this.seg('ajVid', [['ligera','Ligera'],['normal','Normal'],['alta','Alta']], a.calidadVideo)}
         <p class="aj-ayuda">Ligera ≈ 5 MB/min · Normal ≈ 10 MB/min · Alta ≈ 19 MB/min.</p>`)
      + this.acord('emails', '✉️', 'Emails', 'La firma de los emails que envía la app',
        `<input id="ajFirma" class="aj-input" placeholder="Por ejemplo: Elisabeth" value="${esc(a.firma || '')}"><p class="aj-ayuda">Sale al final de los emails de tareas y recordatorios.</p>`);
  },
  e_porhacer(cont){
    const a = App.ajustes;
    this.enlazarEnlaces(cont); TemaSec.enlazar(cont, 'tareas');
    this.columnas(); this.personas(); this.fiesta();
    this.enlazarSeg('ajFoto', async v => { a.calidadFoto = v; await this.guardar(); });
    this.enlazarSeg('ajVid', async v => { a.calidadVideo = v; await this.guardar(); });
    $('#ajFirma').onchange = async e => { a.firma = e.target.value.trim(); await this.guardar(); toast('✉️ Firma guardada'); };
  },

  /* ---------- CALENDARIO ---------- */
  p_cal(){
    return this.tarjeta('📅 Al abrir el calendario, ver…', this.seg('ajCalModo', [['dia','Día'],['mes','Mes'],['anio','Año']], App.ajustes.calModo || 'mes'),
        'El calendario muestra las tareas que tienen fecha. Si cambias de vista dentro del calendario, se recuerda.')
      + this.tarjeta('🎨 Colores de el Calendario Tareas', TemaSec.rejilla('cal'), 'Solo cambian <b>el Calendario Tareas</b> (también se cambian con el botón 🎨 de arriba, dentro del apartado). «Como la app» = el tema de toda la app.');
  },
  e_cal(cont){ this.enlazarEnlaces(cont); TemaSec.enlazar(cont, 'cal'); this.enlazarSeg('ajCalModo', async v => { App.ajustes.calModo = v; Cal.modo = v; await this.guardar(); }); },

  /* ---------- LISTAS ---------- */
  p_listas(){
    const a = App.ajustes;
    const filas = Listas.datos.map(l => { const act = Listas.colorDe(l), img = !!Listas.fondos[l.id];
      return `<div class="aj-lista"><b>📝 ${esc(l.nombre)}${img ? ' <small>(con imagen de fondo)</small>' : ''}</b>
        <div class="aj-muestras">${Listas.TEMAS.map(([k, n, g]) => `<button data-lista="${l.id}" data-t="${k}" class="${k === act && !img ? 'on' : ''}" title="${n}" style="background:${g || 'linear-gradient(180deg,var(--bg),var(--card))'}">${k === 'app' ? 'App' : ''}</button>`).join('')}</div></div>`; }).join('');
    return this.tarjeta('🎨 El color de cada lista', filas || '<p class="aj-ayuda">Aún no tienes listas.</p>',
        'Cada lista puede tener su color. «App» = como el tema de toda la app. La imagen de fondo se pone dentro de la lista, en ⚙️.')
      + this.tarjeta('🔊 Sonidos', this.seg('ajSonL', [['si','🔊 Con sonido'],['no','🔇 Sin sonido']], a.sonidoListas || 'si'), 'El «tilín» al marcar un punto como hecho y al ponerle la estrella ⭐.')
      + this.tarjeta('📨 Aviso al pasar un punto al PorHacer', this.seg('ajPopL', [['4','4 s'],['8','8 s'],['15','15 s'],['0','Hasta cerrarlo']], String(a.popupLista || '8')), 'Cuánto rato se ve la ventanita «¡Pasado al PorHacer!».');
  },
  e_listas(cont){
    const a = App.ajustes;
    $$('[data-lista]', cont).forEach(b => b.onclick = async () => {
      const l = Listas.datos.find(x => x.id === b.dataset.lista); if(!l) return;
      l.tema = { color:b.dataset.t, elegido:b.dataset.t !== 'app' }; if(Listas.fondos[l.id]) await Listas.ponerFondo(l, null);
      await Listas.guardar(l); this.ir('listas', null, true); toast('🎨 «' + l.nombre + '»: ' + (Listas.TEMAS.find(t => t[0] === b.dataset.t) || [])[1]);
    });
    this.enlazarSeg('ajSonL', async v => { a.sonidoListas = v; await this.guardar(); });
    this.enlazarSeg('ajPopL', async v => { a.popupLista = v; await this.guardar(); });
  },

  /* ---------- AGENDA ---------- */
  p_agenda(){
    return this.tarjeta('📒 Al abrir la agenda, ver…', this.seg('ajAgModo', [['dia','Día'],['mes','Mes'],['anio','Año']], Agenda.modo || 'mes'),
        'Si cambias de vista dentro de la agenda, se recuerda.')
      + this.tarjeta('🎨 Colores de la Agenda', TemaSec.rejilla('agenda'), 'Solo cambian <b>la Agenda</b> (también se cambian con el botón 🎨 de arriba, dentro del apartado). «Como la app» = el tema de toda la app.')
      + this.nota('Los colores de cada nota y de cada día se eligen en la misma agenda, al tocar el día.');
  },
  e_agenda(cont){ this.enlazarEnlaces(cont); TemaSec.enlazar(cont, 'agenda'); this.enlazarSeg('ajAgModo', async v => { Agenda.modo = v; lsSet('ph3-ag-modo', v); Agenda.pintar(); }); },

  /* ---------- TICKETS ---------- */
  p_tickets(){
    const act = Tickets.tema().k;
    return this.tarjeta('🎨 Colores de los tickets', `<div class="tk-temas">${Tickets.TEMAS.map(t => `<button data-tkt="${t.k}" class="${t.k === act ? 'on' : ''}"><span class="tk-tm" style="${t.k === 'app' ? 'background:linear-gradient(135deg,var(--bg),var(--card));border-color:var(--accent)' : `background:linear-gradient(135deg,${t.bg},${t.soft});border-color:${t.acc}`}"><i style="background:${t.k === 'app' ? 'var(--accent)' : t.acc}"></i></span>${t.name}</button>`).join('')}</div>`,
      'Solo cambian la pantalla de los tickets y su PDF. «Como la app» = el tema de toda la app.');
  },
  e_tickets(cont){ $$('[data-tkt]', cont).forEach(b => b.onclick = () => { lsSet('ph3-tk-tema', b.dataset.tkt); Tickets.ponerTema(); this.ir('tickets', null, true); }); },

  /* ---------- SITIOS ---------- */
  p_sitios(){
    const cs = Sitios.casas();
    const filas = cs.map(h => { const p = Sitios.pal(h.color);
      return `<details class="aj-casa"><summary><span class="aj-casa-m" style="background:${p.shades[1]};border-color:${p.ac}">${Sitios.icoHtml(h, '🏠')}</span><span class="aj-ac-tx"><b>${esc(h.nombre)}</b><small>${esc(p.name || '')} · toca para cambiar</small></span><em>›</em></summary>
        <div class="st-pals">${PAL_KEYS.map(k => `<button data-casa="${h.id}" data-pal="${k}" class="${k === h.color ? 'on' : ''}" title="${esc(PALETTES[k].name)}" style="background:${PALETTES[k].shades[1]};border-color:${PALETTES[k].ac}"></button>`).join('')}</div></details>`; }).join('');
    return this.tarjeta('🎨 Colores de Sitios (fondo y botones)', TemaSec.rejilla('sitios'), 'El fondo de «Mis sitios», los botones y las ventanas. También se cambia con el botón 🎨 de arriba, dentro de Sitios. Dentro de cada casa manda el color de la casa.')
      + this.tarjeta('🏠 El color de cada casa', filas || '<p class="aj-ayuda">Aún no tienes casas. Créalas en Sitios.</p>',
      'Cada casa tiene su color: se ve en su tarjeta y dentro de la casa. También se cambia desde el ⋯ de cada casa.');
  },
  e_sitios(cont){ TemaSec.enlazar(cont, 'sitios'); $$('[data-casa]', cont).forEach(b => b.onclick = async () => { const h = Sitios.s(b.dataset.casa); if(!h) return; await Sitios.guardar({ ...h, color:b.dataset.pal }); this.ir('sitios', null, true); toast('🎨 ' + h.nombre + ': ' + PALETTES[b.dataset.pal].name); }); },

  /* ---------- CALCULADORA y NOTAS SECRETAS ---------- */
  p_calc(){ return '<div id="ajCalc"></div>'; },
  e_calc(){ Calc.pintarAjustes($('#ajCalc')); },
  p_grabar(){
    const n = Grabar.lista.length, t = Grabar.lista.reduce((s, x) => s + (x.size || 0), 0);
    return this.tarjeta('🎙️ Notas de voz', `<p class="aj-ayuda">Tienes <b>${n}</b> ${n === 1 ? 'nota' : 'notas'} (${tamTxt(t)}).</p>`,
      'Se guardan <b>solo en este aparato</b>, en mp3 ligero (unos 360 KB por minuto). Para tener una nota en otro sitio, deslízala a la <b>derecha</b> y guárdala en Archivos o Descargas.')
      + this.tarjeta('🎨 Colores de Grabar', TemaSec.rejilla('grabar'), 'Solo cambian <b>Grabar</b> (también se cambian con el botón 🎨 de arriba, dentro del apartado). «Como la app» = el tema de toda la app.');
  },
  e_grabar(cont){ TemaSec.enlazar(cont, 'grabar'); },
  p_bloc(){ return '<div id="ajBloc"></div>'; },
  e_bloc(){ Bloc.pintarAjustes($('#ajBloc')); },

  /* Temas rápidos */
  temas(){
    const a = App.ajustes;
    const titulo = g => `<h4 class="temas-grupo">${g === 'blanco' ? '⚪ Con fondo blanco' : g === 'home' ? '🏠 Como en HOME' : g === 'pastel' ? '🌸 Pasteles (como la agenda de HOME)' : g === 'especial' ? '✨ Especiales, con fondo de dos colores' : '🎨 Con fondo de color'}</h4>`;
    let grupoAnt = null;
    $('#ajTemas').innerHTML = Object.entries(TEMAS).map(([k, t]) => {
      const c = t.c, g = t.grupo || 'color', cab = g !== grupoAnt ? titulo(g) : ''; grupoAnt = g;
      return cab + `<button class="tema ${a.tema===k?'on':''}" data-k="${k}">
        <div class="prev" style="background:linear-gradient(180deg,${c.bg},${c.bg2})">
          <i style="background:${c.card};border-color:#e5484d"></i><i style="background:${c.card};border-color:#3b82f6"></i><i style="background:${c.card};border-color:#22a55a"></i>
          <em style="background:linear-gradient(180deg,${c.accent2},${c.accent});box-shadow:0 0 0 3px ${c.dark}"></em>
        </div><b>${esc(t.nombre)}</b></button>`;
    }).join('') + (a.tema === 'propio' ? '<p class="aj-ayuda" style="grid-column:1/-1">Ahora usas tus propios colores (cambiados uno a uno). Elige un tema para volver a empezar desde él.</p>' : '')
      + '<p class="aj-ayuda" style="grid-column:1/-1">Si quieres, más abajo puedes cambiar cada color uno a uno.</p>';
    $$('#ajTemas .tema').forEach(b => b.onclick = async () => {
      a.tema = b.dataset.k; a.colores = { ...TEMAS[a.tema].c };
      TemaSec.aplicar(TemaSec.actual); await this.guardar(); this.temas(); pintarTodo();
      toast('🎨 Tema «' + TEMAS[a.tema].nombre + '»');
    });
  },

  /* Colores uno a uno */
  colores(){
    const a = App.ajustes, cont = $('#ajColores');
    cont.innerHTML = '<div class="aj-sec"><h4>Cambia cada color</h4><p class="aj-ayuda">Los cambios se ven al momento. «Otro color…» abre el selector libre.</p><div id="ajListaCol"></div></div>'
      + '<button class="btn-sec btn-ancho" id="ajResetCol">↺ Volver a los colores del tema</button>';
    const l = $('#ajListaCol');
    PARTES_COLOR.forEach(([k, nombre]) => {
      const f = document.createElement('div'); f.className = 'aj-fila';
      f.innerHTML = `<span>${esc(nombre)}</span><div></div>`;
      l.appendChild(f);
      selColor(f.lastElementChild, a.colores[k], PALETA.filter(p => p[0]).concat([['blanco','Blanco','#ffffff']]), async v => {
        a.colores[k] = v || '#ffffff'; a.tema = 'propio'; TemaSec.aplicar(TemaSec.actual); await this.guardar(); pintarTodo();
      });
    });
    $('#ajResetCol').onclick = async () => {
      const base = TEMAS[a.tema] ? a.tema : 'grises';
      a.tema = base; a.colores = { ...TEMAS[base].c }; TemaSec.aplicar(TemaSec.actual); await this.guardar(); this.colores(); pintarTodo();
    };
  },

  /* Columnas: mostrar/ocultar, nombre, color del borde, orden, nuevas */
  columnas(){
    const a = App.ajustes, cont = $('#ajColumnas');
    cont.innerHTML = `<div class="aj-sec"><h4>Borde de las tareas</h4>
        <label class="check" style="margin-top:0"><input type="checkbox" id="ajBorde" ${a.bordeColumna?'checked':''}><span class="caja"></span><span>El borde de cada tarea toma el color de su columna<small>Ej.: Nueva = rojo, En curso = azul, En pausa = naranja, Acabada = verde</small></span></label></div>
      <div class="aj-sec"><h4>Columnas</h4><p class="aj-ayuda">👁 muestra u oculta · ↑↓ cambia el orden · ✓ = las tareas de esa columna cuentan como «acabadas» (se tachan y no salen como vencidas).</p><div id="ajListaCols"></div>
      <button class="btn-pri btn-ancho" id="ajNuevaCol">＋ Nueva columna</button></div>`;
    $('#ajBorde').onchange = async e => { a.bordeColumna = e.target.checked; await this.guardar(); pintarTodo(); };
    const l = $('#ajListaCols');
    a.columnas.forEach((c, i) => {
      const n = App.tareas.filter(t => t.colId === c.id).length;
      const f = document.createElement('div'); f.className = 'col-fila'; f.style.setProperty('--cc', c.color);
      f.innerHTML = `<div class="r1"><input class="nom" value="${esc(c.nombre)}" maxlength="30"><button class="ico-b ${c.visible?'':'off'}" data-a="ver" title="Mostrar / ocultar">${c.visible?'👁':'🙈'}</button></div>
        <div class="r2"><div class="selc"></div><button class="ico-b ${c.hecha?'':'off'}" data-a="hecha" title="Cuenta como acabada">✓</button><button class="ico-b" data-a="sube" ${i===0?'disabled':''}>↑</button><button class="ico-b" data-a="baja" ${i===a.columnas.length-1?'disabled':''}>↓</button><button class="ico-b peligro" data-a="borrar" title="Borrar columna" ${a.columnas.length<2?'disabled':''}>🗑</button></div>
        <p class="aj-ayuda" style="margin:6px 2px 0">${n} tarea${n===1?'':'s'}</p>`;
      l.appendChild(f);
      selColor(f.querySelector('.selc'), c.color, PALETA.filter(p => p[0]), async v => { c.color = v; f.style.setProperty('--cc', v); await this.guardar(); pintarTodo(); }, true);
      f.querySelector('.nom').onchange = async e => { c.nombre = e.target.value.trim() || c.nombre; await this.guardar(); pintarTodo(); };
      f.querySelectorAll('[data-a]').forEach(b => b.onclick = async () => {
        const ac = b.dataset.a;
        if(ac === 'ver') c.visible = !c.visible;
        if(ac === 'hecha') c.hecha = !c.hecha;
        if(ac === 'sube' && i > 0) [a.columnas[i-1], a.columnas[i]] = [a.columnas[i], a.columnas[i-1]];
        if(ac === 'baja' && i < a.columnas.length-1) [a.columnas[i+1], a.columnas[i]] = [a.columnas[i], a.columnas[i+1]];
        if(ac === 'borrar'){
          const otras = a.columnas.filter(x => x.id !== c.id);
          let destino = otras[0].id;
          if(n){
            destino = await popup({ tit:'Borrar «'+c.nombre+'»', html:`<p>Tiene ${n} tarea${n>1?'s':''}. ¿A qué columna las paso?</p><select id="dest">${otras.map(o=>`<option value="${o.id}">${esc(o.nombre)}</option>`).join('')}</select>`,
              botones:[{txt:'Cancelar', val:null}, {txt:'Borrar', cls:'btn-pri', val:cx => $('#dest',cx).value}] });
            if(!destino) return;
          } else if(!await popConfirmar('Borrar «'+c.nombre+'»', 'La columna está vacía. ¿La borro?', 'Borrar')) return;
          for(const t of App.tareas.filter(t => t.colId === c.id)){ t.colId = destino; await guardarTarea(t); }
          a.columnas = otras;
        }
        await this.guardar(); this.columnas(); pintarTodo();
      });
    });
    $('#ajNuevaCol').onclick = async () => {
      const v = await popup({ tit:'Nueva columna', html:'<input id="ncNom" placeholder="Nombre (p. ej. Esperando respuesta)" maxlength="30">',
        botones:[{txt:'Cancelar', val:null}, {txt:'Crear', cls:'btn-pri', val:cx => $('#ncNom',cx).value.trim()}],
        alAbrir: cx => setTimeout(() => $('#ncNom',cx).focus(), 200) });
      if(!v) return;
      const usados = a.columnas.map(c => c.color);
      const libre = ['#8b5cf6','#14b8a6','#e0708f','#b9875a','#0ea5e9','#84cc16','#d4cc9e'].find(c => !usados.includes(c)) || '#8b5cf6';
      a.columnas.push({ id:nuevoId('c'), nombre:v, color:libre, visible:true, hecha:false });
      await this.guardar(); this.columnas(); pintarTodo(); toast('🗂️ Columna «'+v+'» creada');
    };
  },

  /* Personas (nombre, apellidos, email) */
  personas(){
    const cont = $('#ajPersonas');
    const l = App.personas.slice().sort((a,b) => nombreP(a).localeCompare(nombreP(b)));
    const tb = (typeof Nube !== 'undefined' && Nube.activa) ? Nube.tablero : null;
    const acceso = p => { if(!tb || !p.email) return ''; const em = p.email.toLowerCase();
      if(em === tb.duenoEmail || Nube.aceptados(tb).includes(em)) return ' · ✅ en el tablero';
      if((tb.miembros||[]).includes(em)) return ' · ⏳ invitada'; return ' · sin acceso'; };
    const puedeInvitar = p => tb && Nube.esDueno(tb) && p.email && !(tb.miembros||[]).includes(p.email.toLowerCase());
    cont.innerHTML = `<div class="aj-sec"><h4>Personas ${tb ? 'de «' + esc(Nube.nombreTablero(tb)) + '»' : 'para asignar tareas'}</h4><p class="aj-ayuda">${tb ? 'Se apuntan solas cuando compartes el tablero o alguien acepta tu invitación. También puedes añadir a alguien solo para asignarle tareas y enviarle emails.' : 'Al asignar una tarea a alguien con email, puedes enviársela por email.'}</p>
      ${l.map(p => { const n = App.tareas.filter(t => t.personaId === p.id).length;
        return `<div class="per-fila" data-id="${p.id}"><span class="avatar" style="background:${colorPersona(p)}">${esc(iniciales(p))}</span><div><b>${esc(nombreP(p))}</b><small>${esc(p.email||'sin email')} · ${n} tarea${n===1?'':'s'}${acceso(p)}</small></div>${puedeInvitar(p) ? '<button class="ico-b" data-a="inv" title="Invitar al tablero">📬</button>' : ''}<button class="ico-b" data-a="edit">✏️</button><button class="ico-b peligro" data-a="del">🗑</button></div>`; }).join('') || '<div class="vacio" style="margin-bottom:10px">Aún no hay nadie. Añade a las personas con las que repartes tareas.</div>'}
      <button class="btn-pri btn-ancho" id="ajNuevaP">＋ Añadir persona</button>
      ${tb && Nube.esDueno(tb) ? '<button class="btn-sec btn-ancho" id="ajCompartir">👥 Compartir un tablero con alguien</button>' : ''}</div>`;
    const bc = $('#ajCompartir'); if(bc) bc.onclick = () => Nube.compartir();
    $('#ajNuevaP').onclick = async () => { if(await formPersona()){ this.personas(); pintarTodo(); } };
    $$('.per-fila', cont).forEach(f => f.querySelectorAll('[data-a]').forEach(b => b.onclick = async () => {
      const p = persona(f.dataset.id);
      if(b.dataset.a === 'edit'){ if(await formPersona(p)){ this.personas(); pintarTodo(); } return; }
      if(b.dataset.a === 'inv'){ await Nube.compartir(Nube.tid, p); this.personas(); return; }
      if(!await popConfirmar('¿Quitar a '+p.nombre+'?', 'Sus tareas se quedarán sin asignar.', 'Quitar')) return;
      App.personas = App.personas.filter(x => x.id !== p.id); await DB.borrar('personas', p.id);
      for(const t of App.tareas.filter(t => t.personaId === p.id)){ t.personaId = ''; await guardarTarea(t); }
      if(App.filtro === 'p:'+p.id) App.filtro = 'todas';
      this.personas(); pintarTodo();
    }));
  },

  /* 🎉 Al acabar una tarea */
  fiesta(){
    const a = App.ajustes; a.fiesta = Fiesta.cfg(); const f = a.fiesta, cont = $('#ajFiesta');
    const seg = (id, ops, val) => `<div class="seg" id="${id}">${ops.map(([v,t]) => `<button data-v="${v}" class="${String(v)===String(val)?'on':''}">${t}</button>`).join('')}</div>`;
    const chk = (id, on, txt, sub) => `<label class="check" style="margin-top:0"><input type="checkbox" id="${id}" ${on?'checked':''}><span class="caja"></span><span>${txt}${sub ? '<small>' + sub + '</small>' : ''}</span></label>`;
    const auto = { 'es':'¡Muy bien!', 'ca':'Molt bé!', 'en':'Congratulations!' }[(a.idiomaVoz||'es').slice(0,2)];
    cont.innerHTML = `
      <div class="aj-sec"><h4>Fiesta al acabar una tarea</h4><div class="aj-fila">${chk('fsOn', f.activa, '🎉 Confeti y mensaje', 'Cuando una tarea pasa a «Acabada»')}</div></div>
      <div class="aj-sec"><h4>Cuánto dura el confeti</h4>${seg('fsSeg', [[3,'3 s'],[5,'5 s'],[8,'8 s'],[12,'12 s']], f.segundos)}</div>
      <div class="aj-sec"><h4>Mensaje</h4>
        <input id="fsMsg" class="nom" style="width:100%;height:46px;border-radius:13px;border:2px solid var(--line);background:var(--colbg);padding:0 12px;font-size:16px;font-weight:800" maxlength="30" placeholder="Automático: ${esc(auto)}" value="${esc(f.mensaje||'')}">
        <p class="aj-ayuda" style="margin-top:6px">Vacío = según el idioma (Configuración → Más): «¡Muy bien!», «Molt bé!» o «Congratulations!».</p></div>
      <div class="aj-sec"><div class="aj-fila">${chk('fsMus', f.musica, '🎺 Musiquita de enhorabuena', 'Suena con el confeti (si el móvil no está en silencio)')}</div></div>
      <div class="aj-sec"><h4>📧 Email de enhorabuena</h4>${seg('fsMail', [['preguntar','Preguntar'],['siempre','Siempre'],['nunca','Nunca']], f.email)}
        <p class="aj-ayuda" style="margin-top:6px">Se envía a las personas del tablero (menos a ti) diciendo que la tarea ya está acabada.</p></div>
      <button class="btn-pri btn-ancho" id="fsProbar">🎉 Probar ahora</button>`;
    const g = async () => { await this.guardar(); };
    $('#fsOn').onchange = e => { f.activa = e.target.checked; g(); };
    $('#fsMus').onchange = e => { f.musica = e.target.checked; g(); };
    $('#fsMsg').onchange = e => { f.mensaje = e.target.value.trim(); g(); };
    $$('#fsSeg button').forEach(b => b.onclick = () => { f.segundos = +b.dataset.v; g(); this.fiesta(); });
    $$('#fsMail button').forEach(b => b.onclick = () => { f.email = b.dataset.v; g(); this.fiesta(); });
    $('#fsProbar').onclick = () => { f.mensaje = $('#fsMsg').value.trim(); g(); cerrar('ajustes'); Fiesta.despertar(); if(f.activa) Fiesta.confeti(f.segundos); else Fiesta.soloMensaje(); if(f.musica) Fiesta.musica(); };
  }
};
