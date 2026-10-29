/* PorHacer3 · Portada: la pantalla con todos los apartados.
   Cada apartado tiene un solo botón (arriba a la izquierda) para volver aquí. */

const VISTAS = { calc:'vCalc', portada:'vPortada', tareas:'vTablero', listas:'vListas', cal:'vCal', agenda:'vAgenda', tickets:'vTickets', sitios:'vSitios' };
function soloVista(id){
  $$('.vista').forEach(v => v.classList.toggle('activa', v.id === id));
  const f = $('#fab'); if(f) f.style.display = id === 'vTablero' ? '' : 'none';
  document.body.dataset.vista = id;
}
function irA(sec){
  if(!VISTAS[sec]) sec = 'portada';
  cerrarHojaMio();
  if(typeof Voz !== 'undefined' && Voz.activo) Voz.parar();
  ({
    portada: () => { soloVista('vPortada'); Portada.pintar(true); },
    tareas:  () => { soloVista('vTablero'); pintarTodo(); },
    listas:  () => Listas.abrir(),
    cal:     () => Cal.abrir(),
    agenda:  () => Agenda.abrir(),
    tickets: () => Tickets.abrir(),
    sitios:  () => Sitios.abrir(),
    calc:    () => Calc.abrir()
  })[sec]();
  Portada.actual = sec;
}

const Portada = {
  actual: 'portada',
  SECC: [
    { k:'tareas',  t:'PorHacer',   ico:'tablero',    c:'var(--accent)' },
    { k:'cal',     t:'Calendario', ico:'calendario', c:'var(--dark)' },
    { k:'listas',  t:'Listas',     ico:'listas',     c:'var(--dark)' },
    { k:'agenda',  t:'Agenda',     ico:'agenda',     c:'var(--accent)' },
    { k:'tickets', t:'Tickets',    ico:'tickets',    c:'var(--accent)' },
    { k:'sitios',  t:'Sitios',     ico:'sitios',     c:'var(--dark)' },
    { k:'calc',    t:'Calculadora', ico:'calculadora', c:'var(--dark)' }
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
      if(k === 'sitios'){ const s = Mio.todos('sitios'), casas = s.filter(x => x.tipo === 'casa').length, cosas = s.reduce((n, x) => n + Object.keys(x.cosas || {}).length, 0);
        return casas ? pl(casas, 'casa', 'casas') + ' · ' + pl(cosas, 'cosa', 'cosas') : 'Empieza por tu casa'; }
    }catch(e){}
    return '';
  },
  pintar(entrar){
    if(!$('#vPortada').classList.contains('activa')) return;
    const d = new Date();
    $('#poSaludo').textContent = this.saludo();
    const agHoy = Mio.uno('agenda', hoyIso()), nNotas = agHoy ? (agHoy.items || []).filter(i => !i.hecha).length : 0;
    const tHoy = App.tareas.filter(t => { if(colDe(t.colId).hecha) return false; const r = rango(t); return r && r[0] <= hoyIso() && hoyIso() <= r[1]; }).length;
    $('#poHoy').innerHTML = `
      <div class="po-dia"><b>${d.getDate()}</b><span>${MESES_C[d.getMonth()].slice(0, 3)}</span></div>
      <div class="po-hoy-tx"><b>${capital(DIAS[d.getDay()])}</b><small>${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}</small>
        <div class="po-hoy-chips">
          <button data-ir="tareas">✅ ${tHoy ? tHoy + (tHoy === 1 ? ' tarea' : ' tareas') + ' hoy' : 'Sin tareas hoy'}</button>
          <button data-ir="agenda">📒 ${nNotas ? nNotas + (nNotas === 1 ? ' nota' : ' notas') : 'Agenda libre'}</button>
        </div></div>
      <div class="po-reloj" id="poReloj" aria-hidden="true"><i class="h"></i><i class="m"></i><i class="s"></i><em></em></div>`;
    this.reloj();
    const g = $('#poRejilla');
    g.innerHTML = this.SECC.map((s, i) => `
      <button class="po-b" data-ir="${s.k}" style="--c:${s.c};--i:${i}">
        <span class="po-ico">${icono(s.ico)}</span>
        <b>${s.t}</b><small>${esc(this.info(s.k))}</small>
        <span class="po-flecha">›</span>
      </button>`).join('') + `
      <button class="po-b po-conf" data-conf style="--c:var(--accent);--i:7">
        <span class="po-ico po-engranaje">${icono('ajustes')}</span>
        <b>Configuración</b><small>Al abrir · temas · copias</small>
        <span class="po-flecha">›</span>
      </button>`;
    $('#poCajaSitio').innerHTML = `
      <button class="po-caja" id="poCaja" style="--i:8" aria-label="Notas secretas">
        <span class="po-brillo"></span>
        <span class="po-dial"><svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" class="d-aro"/>
          <g class="d-giro">
            <circle cx="50" cy="50" r="36" class="d-cara"/>
            ${Array.from({ length:24 }, (_, j) => `<line x1="50" y1="${j % 6 ? 17 : 15}" x2="50" y2="22" transform="rotate(${j * 15} 50 50)" class="d-marca"/>`).join('')}
            <circle cx="50" cy="50" r="13" class="d-pomo"/>
            <rect x="47.5" y="26" width="5" height="16" rx="2.5" class="d-aguja"/>
          </g>
        </svg></span>
        <span class="po-caja-tx"><b>Notas secretas</b><small>${(typeof Bloc !== 'undefined' && Bloc.existe && Bloc.existe()) ? 'Cifradas · solo se abren con tu contraseña' : 'Pon una contraseña y escribe en secreto'}</small></span>
        <span class="po-candado"><svg viewBox="0 0 40 48" aria-hidden="true"><path class="c-arco" d="M11 22v-7a9 9 0 0 1 18 0v7" fill="none" stroke-width="5" stroke-linecap="round"/><rect x="5" y="21" width="30" height="24" rx="7" class="c-cuerpo"/><circle cx="20" cy="31" r="3.4" class="c-ojo"/><rect x="18.4" y="32" width="3.2" height="7" rx="1.6" class="c-ojo"/></svg></span>
      </button>`;
    $$('#vPortada [data-ir]').forEach(b => b.onclick = e => this.entrarEn(b.dataset.ir, b));
    $('#vPortada [data-conf]').onclick = e => { const b = e.currentTarget; b.classList.add('girando'); setTimeout(() => { b.classList.remove('girando'); Ajustes.abrir('general'); }, 420); };
    $('#poCaja').onclick = () => this.abrirCaja();
    if(entrar){ const v = $('#vPortada'); v.classList.remove('entra'); void v.offsetWidth; v.classList.add('entra'); }
  },
  // Reloj de agujas pequeñito
  reloj(){
    clearInterval(this._r);
    const pon = () => { const r = $('#poReloj'); if(!r || !$('#vPortada').classList.contains('activa')){ clearInterval(this._r); return; }
      const d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
      r.querySelector('.h').style.transform = `rotate(${h * 30}deg)`; r.querySelector('.m').style.transform = `rotate(${m * 6}deg)`; r.querySelector('.s').style.transform = `rotate(${s * 6}deg)`; };
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
  abrirCaja(){
    const b = $('#poCaja'); if(!b || b.classList.contains('abriendo')) return;
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
      f.src = 'calculadora.html?v=91';
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
