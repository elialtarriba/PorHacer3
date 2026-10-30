/* PorHacer3 · Portada: la pantalla con todos los apartados.
   Cada apartado tiene un solo botón (arriba a la izquierda) para volver aquí. */

const VISTAS = { grabar:'vGrabar', calc:'vCalc', portada:'vPortada', tareas:'vTablero', listas:'vListas', cal:'vCal', agenda:'vAgenda', tickets:'vTickets', sitios:'vSitios' };
function soloVista(id){
  $$('.vista').forEach(v => v.classList.toggle('activa', v.id === id));
  TemaSec.aplicar(TemaSec.DE_VISTA[id] || null);
  const f = $('#fab'); if(f) f.style.display = id === 'vTablero' ? '' : 'none';
  document.body.dataset.vista = id;
}
function irA(sec){
  if(!VISTAS[sec]) sec = 'portada';
  cerrarHojaMio();
  if(typeof Voz !== 'undefined' && Voz.activo) Voz.parar();
  if(sec !== 'grabar' && typeof Grabar !== 'undefined'){ if(Grabar.rec){ Grabar.pulsar(); toast('⏹ Grabación parada y guardada'); } Grabar.parar(); }
  ({
    portada: () => { soloVista('vPortada'); Portada.pintar(true); },
    tareas:  () => { soloVista('vTablero'); pintarTodo(); },
    listas:  () => Listas.abrir(),
    cal:     () => Cal.abrir(),
    agenda:  () => Agenda.abrir(),
    tickets: () => Tickets.abrir(),
    sitios:  () => Sitios.abrir(),
    calc:    () => Calc.abrir(),
    grabar:  () => Grabar.abrir()
  })[sec]();
  Portada.actual = sec;
}

const Portada = {
  actual: 'portada',
  SECC: [
    { k:'tareas',  t:'Tareas',   ico:'tablero',    c:'var(--accent)' },
    { k:'cal',     t:'Calendario Tareas', ico:'calendario', c:'var(--dark)' },
    { k:'listas',  t:'Listas',     ico:'listas',     c:'var(--dark)' },
    { k:'agenda',  t:'Agenda',     ico:'agenda',     c:'var(--accent)' },
    { k:'tickets', t:'Tickets',    ico:'tickets',    c:'var(--accent)' },
    { k:'sitios',  t:'Sitios',     ico:'sitios',     c:'var(--dark)' },
    { k:'calc',    t:'Calculadora', ico:'calculadora', c:'var(--dark)' },
    { k:'grabar',  t:'Grabar',      ico:'grabar',      c:'var(--accent)' }
  ],
  saludo(){
    const h = new Date().getHours(), n = (typeof Nube !== 'undefined' && Nube.perfil && Nube.perfil.nombre) || '';
    const s = h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
    return s + (n ? ', ' + n : '') + ' ' + (h < 6 ? '🌙' : h < 13 ? '☀️' : h < 20 ? '🌤️' : '🌙');
  },
  // lo que se ve en pequeño en cada baldosa
  info(k){
    const hoy = hoyIso(), pl = (n, a, b) => n + ' ' + (n === 1 ? a : b);
    try{
      if(k === 'tareas'){
        const pend = App.tareas.filter(t => !colDe(t.colId).hecha);
        const deHoy = pend.filter(t => { const r = rango(t); return r && r[0] <= hoy && hoy <= r[1]; }).length;
        return pend.length ? pl(pend.length, 'pendiente', 'pendientes') + (deHoy ? ' · ' + deHoy + ' hoy' : '') : 'Todo hecho ✨';
      }
      if(k === 'cal'){ const m = hoyIso().slice(0, 7), n = App.tareas.filter(t => { const r = rango(t); return r && r[0].slice(0, 7) <= m && m <= r[1].slice(0, 7); }).length; return n ? pl(n, 'tarea', 'tareas') + ' este mes' : 'Tus tareas por días'; }
      if(k === 'listas'){ const n = Listas.datos.length, p = Listas.datos.reduce((s, l) => s + (l.items || []).filter(i => !i.ok).length, 0); return pl(n, 'lista', 'listas') + (p ? ' · ' + pl(p, 'punto', 'puntos') : ''); }
      if(k === 'agenda'){ const d = Mio.uno('agenda', hoy), n = d ? (d.items || []).filter(i => !i.hecha).length : 0; return n ? pl(n, 'nota', 'notas') + ' hoy' : 'Nada para hoy'; }
      if(k === 'tickets'){ const m = hoy.slice(0, 7), ts = Mio.todos('tickets').filter(t => (t.fecha || '').startsWith(m)), tot = ts.reduce((s, t) => s + (t.importe || 0), 0);
        return ts.length ? pl(ts.length, 'ticket', 'tickets') + (tot ? ' · ' + dinero(tot) : '') : 'Ninguno este mes'; }
      if(k === 'calc') return 'Cuentas, % e IVA';
      if(k === 'grabar'){ const n = Grabar.lista.length; return n ? pl(n, 'nota de voz', 'notas de voz') : 'Notas de voz'; }
      if(k === 'sitios'){ const s = Mio.todos('sitios'), casas = s.filter(x => x.tipo === 'casa').length, cosas = s.reduce((n, x) => n + Object.keys(x.cosas || {}).length, 0);
        return casas ? pl(casas, 'casa', 'casas') + ' · ' + pl(cosas, 'cosa', 'cosas') : 'Empieza por tu casa'; }
    }catch(e){}
    return '';
  },
  pintar(entrar){
    if(!$('#vPortada').classList.contains('activa') || this._moviendo) return;
    const d = new Date();
    $('#poSaludo').textContent = this.saludo();
    const agHoy = Mio.uno('agenda', hoyIso()), nNotas = agHoy ? (agHoy.items || []).filter(i => !i.hecha).length : 0;
    const tHoy = App.tareas.filter(t => { if(colDe(t.colId).hecha) return false; const r = rango(t); return r && r[0] <= hoyIso() && hoyIso() <= r[1]; }).length;
    const marcas = Array.from({ length:60 }, (_, k) => `<line x1="100" y1="${k % 5 ? 12 : 10}" x2="100" y2="${k % 5 ? 17 : 22}" transform="rotate(${k * 6} 100 100)" class="${k % 5 ? 'rm' : 'rM'}"/>`).join('');
    const nums = Array.from({ length:12 }, (_, k) => { const n = k + 1, ang = n * 30 * Math.PI / 180; return `<text x="${(100 + 67 * Math.sin(ang)).toFixed(1)}" y="${(100 - 67 * Math.cos(ang) + 7).toFixed(1)}" class="${n % 3 ? 'rn' : 'rn rn3'}">${n}</text>`; }).join('');
    $('#poHoy').innerHTML = `
      <span class="po-dia"><b>${d.getDate()}</b><span>${MESES_C[d.getMonth()].slice(0, 3)}</span></span>
      <div class="po-hoy-tx"><b>${capital(DIAS[d.getDay()])}</b><small>${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}</small>
        <div class="po-hoy-chips">
          <button data-ir="tareas">✅ ${tHoy ? tHoy + (tHoy === 1 ? ' tarea' : ' tareas') + ' hoy' : 'Sin tareas hoy'}</button>
          <button data-ir="agenda">📒 ${nNotas ? nNotas + (nNotas === 1 ? ' nota' : ' notas') : 'Agenda libre'}</button>
        </div></div>
      <div class="po-reloj" aria-label="Reloj">
        <svg viewBox="0 0 200 200" id="poReloj" aria-hidden="true">
          <circle cx="100" cy="100" r="96" class="r-aro"/><circle cx="100" cy="100" r="88" class="r-cara"/>
          ${marcas}${nums}
          <rect x="76" y="128" width="48" height="20" rx="10" class="r-digf"/><text x="100" y="143" class="r-dig" id="poDig"></text>
          <line x1="100" y1="112" x2="100" y2="54" class="r-h" id="poH"/>
          <line x1="100" y1="116" x2="100" y2="34" class="r-m" id="poM"/>
          <g id="poS"><line x1="100" y1="124" x2="100" y2="26" class="r-s"/><circle cx="100" cy="26" r="4" class="r-sp"/></g>
          <circle cx="100" cy="100" r="7" class="r-c"/><circle cx="100" cy="100" r="2.6" fill="#fff"/>
        </svg>
      </div>`;
    this.reloj();
    const g = $('#poRejilla');
    const dial = `<svg viewBox="0 0 100 100" aria-hidden="true" class="po-dialito">
          <circle cx="50" cy="50" r="46" class="d-aro"/>
          <g class="d-giro"><circle cx="50" cy="50" r="36" class="d-cara"/>
            ${Array.from({ length:24 }, (_, j) => `<line x1="50" y1="${j % 6 ? 17 : 15}" x2="50" y2="22" transform="rotate(${j * 15} 50 50)" class="d-marca"/>`).join('')}
            <circle cx="50" cy="50" r="13" class="d-pomo"/><rect x="47.5" y="26" width="5" height="16" rx="2.5" class="d-aguja"/></g></svg>
        <svg viewBox="0 0 40 48" aria-hidden="true" class="po-candadito"><path class="c-arco" d="M11 22v-7a9 9 0 0 1 18 0v7" fill="none" stroke-width="5" stroke-linecap="round"/><rect x="5" y="21" width="30" height="24" rx="7" class="c-cuerpo"/><circle cx="20" cy="31" r="3.4" class="c-ojo"/></svg>`;
    const baldosa = (k, i) => k === 'bloc' ? `
      <button class="po-b po-bloc" data-k="bloc" data-bloc style="--c:var(--dark);--i:${i}" aria-label="Notas secretas">
        <span class="po-ico">${dial}</span>
        <b>Notas secretas</b><small>${(typeof Bloc !== 'undefined' && Bloc.existe && Bloc.existe()) ? 'Cifradas, con contraseña' : 'Escribe en secreto'}</small>
        <span class="po-flecha">›</span>
      </button>` : k === 'conf' ? `
      <button class="po-b po-conf" data-k="conf" data-conf style="--c:var(--accent);--i:${i}">
        <span class="po-ico po-engranaje">${icono('ajustes')}</span>
        <b>Configuración</b><small>Al abrir · temas · copias</small>
        <span class="po-flecha">›</span>
      </button>` : (S => `
      <button class="po-b" data-k="${S.k}" data-ir="${S.k}" style="--c:${S.c};--i:${i}">
        <span class="po-ico">${icono(S.ico)}</span>
        <b>${S.t}</b><small>${esc(this.info(S.k))}</small>
        <span class="po-flecha">›</span>
      </button>`)(this.SECC.find(x => x.k === k));
    g.innerHTML = this.orden().map(baldosa).join('');
    $('#poCajaSitio').innerHTML = '';
    $$('#vPortada [data-ir]').forEach(b => b.onclick = e => { if(Date.now() - (this._soltado || 0) < 600) return; this.entrarEn(b.dataset.ir, b); });
    $('#vPortada [data-conf]').onclick = e => { if(Date.now() - (this._soltado || 0) < 600) return; const b = e.currentTarget; b.classList.add('girando'); setTimeout(() => { b.classList.remove('girando'); Ajustes.abrir(); }, 420); };
    const bc = $('#vPortada [data-bloc]'); if(bc) bc.onclick = () => { if(Date.now() - (this._soltado || 0) < 600) return; this.abrirCaja(bc); };
    if(entrar){ const v = $('#vPortada'); v.classList.remove('entra'); void v.offsetWidth; v.classList.add('entra'); }
  },
  /* ---------- Orden de las baldosas (mantener pulsado y arrastrar) ---------- */
  orden(){
    const def = [...this.SECC.map(s => s.k), 'bloc', 'conf'];
    let o = []; try{ o = JSON.parse(lsGet('ph3-po-orden') || '[]'); }catch(e){}
    o = o.filter(k => def.includes(k)); def.forEach(k => { if(!o.includes(k)) o.splice(k === 'conf' ? o.length : k === 'bloc' ? (o.includes('conf') ? o.indexOf('conf') : o.length) : Math.min(o.length, def.indexOf(k)), 0, k); });
    return o;
  },
  ordenDeSiempre(){ lsSet('ph3-po-orden', null); this.pintar(); },
  iniciarMover(){
    const g = $('#poRejilla'), sc = $('.po-scroll'); let D = null, raf = null;
    const levantar = () => {
      if(!D) return; D.on = true; this._moviendo = true;
      try{ navigator.vibrate && navigator.vibrate(18); }catch(e){}
      const r = D.el.getBoundingClientRect(); D.dx = D.x - r.left; D.dy = D.y - r.top;
      const f = D.el.cloneNode(true); f.classList.add('po-fantasma'); f.removeAttribute('data-ir'); f.removeAttribute('data-k');
      Object.assign(f.style, { width:r.width + 'px', height:r.height + 'px' }); document.body.appendChild(f); D.f = f;
      D.el.classList.add('po-hueco'); g.classList.add('ordenando'); colocar(D.x, D.y);
    };
    const colocar = (x, y) => { D.f.style.transform = `translate(${x - D.dx}px,${y - D.dy}px) scale(1.06) rotate(-2deg)`; };
    const auto = () => { if(!D || !D.on) return; const r = sc.getBoundingClientRect(); if(D.cy < r.top + 70) sc.scrollTop -= 9; else if(D.cy > r.bottom - 70) sc.scrollTop += 9; raf = requestAnimationFrame(auto); };
    const empezar = (x, y, t) => { const el = t.closest && t.closest('#poRejilla .po-b'); if(!el) return; D = { x, y, cx:x, cy:y, el, on:false, t:setTimeout(levantar, 380) }; this._moviendo = true; };
    const mover = (x, y) => {
      if(!D) return false;
      if(!D.on){ if(Math.hypot(x - D.x, y - D.y) > 10){ clearTimeout(D.t); D = null; this._moviendo = false; } return false; }
      D.cx = x; D.cy = y; colocar(x, y); if(!raf) raf = requestAnimationFrame(auto);
      const sobre = document.elementFromPoint(x, y), b = sobre && sobre.closest && sobre.closest('#poRejilla .po-b');
      if(b && b !== D.el){ const hs = [...g.children], i = hs.indexOf(D.el), j = hs.indexOf(b); if(i < j) b.after(D.el); else b.before(D.el); }
      return true;
    };
    const acabar = () => {
      if(!D) return; clearTimeout(D.t); cancelAnimationFrame(raf); raf = null;
      if(D.on){ D.f.remove(); D.el.classList.remove('po-hueco'); g.classList.remove('ordenando'); this._soltado = Date.now(); this._moviendo = false;
        lsSet('ph3-po-orden', JSON.stringify([...new Set([...g.children].map(b => b.dataset.k).filter(Boolean))])); toast('↕️ Orden guardado'); }
      D = null; this._moviendo = false;
    };
    g.addEventListener('touchstart', e => { if(e.touches.length === 1) empezar(e.touches[0].clientX, e.touches[0].clientY, e.target); }, { passive:true });
    g.addEventListener('touchmove', e => { if(D && mover(e.touches[0].clientX, e.touches[0].clientY) && e.cancelable) e.preventDefault(); }, { passive:false });
    g.addEventListener('touchend', acabar); g.addEventListener('touchcancel', acabar);
    g.addEventListener('pointerdown', e => { if(e.pointerType === 'mouse' && e.button === 0) empezar(e.clientX, e.clientY, e.target); });
    addEventListener('pointermove', e => { if(e.pointerType === 'mouse' && D) mover(e.clientX, e.clientY); });
    addEventListener('pointerup', e => { if(e.pointerType === 'mouse') acabar(); });
    g.addEventListener('contextmenu', e => { if(e.target.closest('.po-b')) e.preventDefault(); });
  },
  // Reloj de agujas pequeñito
  reloj(){
    clearInterval(this._r);
    const pon = () => { const r = $('#poReloj'); if(!r || !$('#vPortada').classList.contains('activa')){ clearInterval(this._r); return; }
      const d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
      $('#poH').setAttribute('transform', `rotate(${h * 30} 100 100)`); $('#poM').setAttribute('transform', `rotate(${m * 6} 100 100)`); $('#poS').setAttribute('transform', `rotate(${s * 6} 100 100)`);
      $('#poDig').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
    pon(); this._r = setInterval(pon, 1000);
  },
  // Al tocar una baldosa: se hunde y un círculo de su color llena la pantalla
  entrarEn(sec, boton){
    if(this._yendo) return; this._yendo = true;
    const r = boton.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const c = getComputedStyle(boton).getPropertyValue('--c').trim() || 'var(--accent)';
    const o = document.createElement('div'); o.className = 'po-onda';
    o.style.setProperty('--x', x + 'px'); o.style.setProperty('--y', y + 'px'); o.style.setProperty('--c', c);
    document.body.appendChild(o);
    boton.classList.add('pulsado');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){ o.remove(); this._yendo = false; irA(sec); return; }
    requestAnimationFrame(() => o.classList.add('crece'));
    setTimeout(() => { irA(sec); o.classList.add('fuera'); }, 330);
    setTimeout(() => { o.remove(); boton.classList.remove('pulsado'); this._yendo = false; }, 800);
  },
  // La caja fuerte: gira la rueda, se abre el candado y aparece el bloc
  abrirCaja(b){
    b = b || $('#vPortada [data-bloc]'); if(!b || b.classList.contains('abriendo')) return;
    b.classList.add('abriendo');
    try{ Fiesta.despertar(); const ac = Fiesta._ac; if(ac){ const t0 = ac.currentTime + .02;
      [0, .11, .22, .33, .5].forEach((dt, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.value = i === 4 ? 880 : 1900 - i * 140;
        g.gain.setValueAtTime(0.0001, t0 + dt); g.gain.exponentialRampToValueAtTime(i === 4 ? 0.08 : 0.04, t0 + dt + .005); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + (i === 4 ? .25 : .04));
        o.connect(g).connect(ac.destination); o.start(t0 + dt); o.stop(t0 + dt + .3); }); } }catch(e){}
    try{ navigator.vibrate && navigator.vibrate([12, 60, 12, 60, 12, 120, 30]); }catch(e){}
    setTimeout(() => Bloc.abrir(), 950);
    setTimeout(() => b.classList.remove('abriendo'), 1700);
  },
  iniciar(){
    $$('[data-portada]').forEach(b => { b.innerHTML = icono('portada'); b.onclick = () => irA('portada'); });
    $$('[data-temasec]').forEach(b => { b.innerHTML = icono('paleta'); b.onclick = () => TemaSec.elegir(b.dataset.temasec); });
    this.iniciarMover();
    Mio.al('grabar', () => this.pintar());
    $('#lsVolver').innerHTML = icono('portada');
    $('#verTxt2').textContent = VERSION;
    Mio.al('agenda', () => this.pintar()); Mio.al('tickets', () => this.pintar()); Mio.al('sitios', () => this.pintar());
    document.addEventListener('visibilitychange', () => { if(!document.hidden) this.pintar(); });
    setInterval(() => { if(Listas.datos.length !== this._nl){ this._nl = Listas.datos.length; this.pintar(); } }, 3000);
  }
};
function dinero(n){ return (n || 0).toLocaleString('es-ES', { style:'currency', currency:'EUR' }); }

/* ---------- Calculadora (la de la carpeta CALCULADORA, dentro de PorHacer3) ---------- */
const Calc = {
  _carga: null, actual: null,
  win(){ const f = $('#calcFrame'); return f && f.contentWindow; },
  cargar(){
    if(this._carga) return this._carga;
    this._carga = new Promise(ok => {
      const f = $('#calcFrame');
      f.addEventListener('load', () => setTimeout(() => ok(this.win()), 60), { once:true });
      f.src = 'calculadora.html?v=110';
    });
    return this._carga;
  },
  abrir(){ soloVista('vCalc'); this.cargar(); },
  alCambiar(t){ this.actual = t && t.name; },
  temaApp(){ const w = this.win(); try{ if(w && w.alCambiarTemaApp) w.alCambiarTemaApp(); }catch(e){} },
  // Configuración → 🧮 Calculadora: los temas de la calculadora
  async pintarAjustes(cont){
    cont.innerHTML = '<p class="aj-ayuda">Cargando la calculadora…</p>';
    const w = await this.cargar();
    let guardado = null; try{ guardado = JSON.parse(w.lsGet('ph3_calc_theme') || 'null'); }catch(e){}
    const temas = w.CALCULATOR_THEMES.map((t, i) => ({ t, de:'f', i })), propios = (w.getCustomThemes ? w.getCustomThemes() : []).map((t, i) => ({ t, de:'p', i }));
    const nom = guardado ? guardado.name : w.CALCULATOR_THEMES[0].name;
    const caja = ({ t, de, i }) => { const v = t.app ? Object.assign({}, t, w.temaDeLaApp() || {}) : t;
      return `<button class="calc-tema ${t.name === nom ? 'on' : ''}" data-de="${de}" data-i="${i}">
        <span class="calc-mini" style="background:linear-gradient(180deg,${v.shellTop},${v.shellBottom})"><i style="background:${v.display}"></i><em style="background:${v.numTop};border-color:${v.numShadow}"></em><em style="background:${v.opBottom};border-color:${v.opShadow}"></em><em style="background:${v.clearBottom};border-color:${v.clearShadow}"></em><em style="background:${v.accent}"></em></span>
        <b>${esc(t.name)}</b></button>`; };
    cont.innerHTML = `<div class="aj-sec"><h4>🧮 Temas de la calculadora</h4><p class="aj-ayuda">«Como la app» toma los colores del tema que tengas puesto (gris, blanco y rojo, HOME…). En la calculadora, el botón 🎨 tiene además el Modo Diseño para crear los tuyos.</p>
      <div class="calc-temas">${temas.map(caja).join('')}</div>
      ${propios.length ? `<h4 style="margin-top:14px">Mis diseños</h4><div class="calc-temas">${propios.map(caja).join('')}</div>` : ''}</div>
      <button class="btn-pri btn-ancho" id="calcIr">${icIn('calculadora')}Abrir la calculadora</button>`;
    $$('.calc-tema', cont).forEach(b => b.onclick = () => {
      const t = b.dataset.de === 'f' ? w.CALCULATOR_THEMES[+b.dataset.i] : w.getCustomThemes()[+b.dataset.i];
      w.setCalculatorTheme(t); this.pintarAjustes(cont); toast('🧮 Calculadora: ' + t.name);
    });
    $('#calcIr').onclick = () => { cerrar('ajustes'); irA('calc'); };
  },
  iniciar(){
    window.App = App;            // para que la calculadora (en su marco) lea los colores de la app
    const orig = aplicarTema;
    aplicarTema = function(c){ orig(c); Calc.temaApp(); };
  }
};

/* ---------- Colores propios de cada apartado (Tareas, Calendario, Agenda, Grabar) ----------
   Cada uno puede tener su tema o «Como la app». Al entrar en el apartado se ponen sus colores
   (también en sus ventanas) y al salir vuelven los de toda la app. Se guarda en este aparato. */
const TemaSec = {
  NOMBRES: { tareas:'Tareas', cal:'Calendario Tareas', agenda:'Agenda', grabar:'Grabar', sitios:'Sitios', conf:'Configuración', portada:'Portada' },
  DE_VISTA: { vPortada:'portada', vTablero:'tareas', vCal:'cal', vAgenda:'agenda', vGrabar:'grabar', vSitios:'sitios' },
  actual: null,
  de(sec){ const k = ((App.ajustes && App.ajustes.temaSec) || {})[sec]; return k && TEMAS[k] ? k : null; },
  colores(sec){ const k = sec && this.de(sec); return k ? TEMAS[k].c : App.ajustes.colores; },
  aplicar(sec){ if(!App.ajustes) return; this.actual = sec; aplicarTema(this.colores(sec)); },
  nombre(sec){ const k = this.de(sec); return k ? TEMAS[k].nombre : 'Como la app'; },
  rejilla(sec){
    const act = this.de(sec) || '', titulo = g => `<h4 class="temas-grupo">${g === 'blanco' ? '⚪ Con fondo blanco' : g === 'home' ? '🏠 Como en HOME' : g === 'pastel' ? '🌸 Pasteles (como la agenda de HOME)' : g === 'especial' ? '✨ Especiales, con fondo de dos colores' : '🎨 Con fondo de color'}</h4>`;
    const prev = c => `<div class="prev" style="background:linear-gradient(180deg,${c.bg},${c.bg2})"><i style="background:${c.card};border-color:#e5484d"></i><i style="background:${c.card};border-color:#3b82f6"></i><i style="background:${c.card};border-color:#22a55a"></i><em style="background:linear-gradient(180deg,${c.accent2},${c.accent});box-shadow:0 0 0 3px ${c.dark}"></em></div>`;
    let g0 = null;
    return `<div class="temas ts-temas"><button class="tema ${act ? '' : 'on'}" data-ts="">${prev(App.ajustes.colores)}<b>Como la app</b></button>`
      + Object.entries(TEMAS).map(([k, t]) => { const g = t.grupo || 'color', cab = g !== g0 ? titulo(g) : ''; g0 = g;
        return cab + `<button class="tema ${act === k ? 'on' : ''}" data-ts="${k}">${prev(t.c)}<b>${esc(t.nombre)}</b></button>`; }).join('') + '</div>';
  },
  async poner(sec, k){
    App.ajustes.temaSec = { ...(App.ajustes.temaSec || {}) }; if(k) App.ajustes.temaSec[sec] = k; else delete App.ajustes.temaSec[sec];
    await guardarAjustes();
    if(this.actual === sec) this.aplicar(sec);
    if(sec === 'tareas' || sec === 'cal') pintarTodo();
    toast('🎨 ' + this.NOMBRES[sec] + ': ' + this.nombre(sec));
  },
  enlazar(cont, sec, alCambiar){ $$('[data-ts]', cont).forEach(b => b.onclick = async () => { await this.poner(sec, b.dataset.ts); $$('[data-ts]', cont).forEach(x => x.classList.toggle('on', x === b)); alCambiar && alCambiar(); }); },
  // ventana desde el propio apartado (botón 🎨 de arriba)
  elegir(sec){
    const p = popMio(`<h3 class="mp-h">🎨 Colores de ${this.NOMBRES[sec]}</h3>
      <p class="mp-p">Solo cambian <b>${this.NOMBRES[sec]}</b>. «Como la app» = el tema de toda la app.</p>
      ${this.rejilla(sec)}
      <div class="mp-fila"><button class="mp-b" data-toda>🎨 Tema de toda la app</button><button class="mp-b mp-pri" data-x>Listo</button></div>`, 'ts-pop');
    this.enlazar(p, sec);
    p.querySelector('[data-x]').onclick = () => cerrarPopMio();
    p.querySelector('[data-toda]').onclick = () => { cerrarPopMio(); Ajustes.abrir('temas'); };
  }
};
