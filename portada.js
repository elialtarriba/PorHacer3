/* PorHacer3 · Portada: la pantalla con todos los apartados.
   Cada apartado tiene un solo botón (arriba a la izquierda) para volver aquí. */

const VISTAS = { grabar:'vGrabar', calc:'vCalc', portada:'vPortada', tareas:'vTablero', listas:'vListas', cal:'vCal', agenda:'vAgenda', tickets:'vTickets', sitios:'vSitios', escribir:'vEscribir' };
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
  if(sec !== 'escribir' && typeof Escribir !== 'undefined' && Escribir.id) Escribir.guardarYa();
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
    grabar:  () => Grabar.abrir(),
    escribir:() => Escribir.abrir()
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
    { k:'grabar',  t:'Grabar',      ico:'grabar',      c:'var(--accent)' },
    { k:'escribir',t:'Escribir',    ico:'escribir',    c:'var(--dark)' },
    { k:'teams',   t:'Reunión de Teams', ico:'teams',    c:'var(--dark)' },
    { k:'web1',    t:'Personal',   ico:'web',        c:'var(--accent)' },
    { k:'web2',    t:'Personal 2', ico:'web',        c:'var(--dark)' },
    { k:'manual',  t:'Manual',     ico:'manual',     c:'var(--accent)' },
    { k:'guardar', t:'Guardar',    ico:'guardar',    c:'var(--dark)' }
  ],
  saludo(){
    const h = new Date().getHours(), n = (typeof Nube !== 'undefined' && Nube.perfil && Nube.perfil.nombre) || '';
    const s = h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
    return s + (n ? ', ' + n : '') + ' ' + (h < 6 ? '🌙' : h < 13 ? '☀️' : h < 20 ? '🌤️' : '🌙');
  },
  // lo que se ve en pequeño en cada baldosa
  // Si no pones http:// o https://, mira si la web funciona con https (segura); si no, usa http
  async arreglar(u){
    u = String(u || '').trim(); if(!u || /^[a-z]+:\/\//i.test(u)) return u;
    const prueba = url => Promise.race([fetch(url, { mode:'no-cors', cache:'no-store' }).then(() => true, () => false), new Promise(r => setTimeout(() => r(false), 4000))]);
    if(await prueba('https://' + u)) return 'https://' + u;
    return 'http://' + u;          // no responde con https: es una web sin conexión segura
  },
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
      if(k === 'tickets'){ const m = hoy.slice(0, 7), ts = Mio.todos('tickets').filter(t => !t.tipo && (t.fecha || '').startsWith(m)), tot = ts.reduce((s, t) => s + (t.importe || 0), 0);
        return ts.length ? pl(ts.length, 'ticket', 'tickets') + (tot ? ' · ' + dinero(tot) : '') : 'Ninguno este mes'; }
      if(k === 'calc') return 'Cuentas, % e IVA';
      if(k === 'teams') return Teams.proxima();
      if(k === 'web1' || k === 'web2') return Webs.info(k);
      if(k === 'manual') return 'Cómo funciona todo';
      if(k === 'guardar'){ const n = ['agenda','tickets','gastos','sitios'].filter(s => Mio.donde(s) === 'nube').length + (Listas.donde() === 'nube' ? 1 : 0) + Object.keys(Guardar.NUEVOS).filter(s => Guardar.donde(s) === 'nube').length; return '☁️ ' + n + ' en la nube · 📱 ' + (8 - n) + ' aquí'; }
      if(k === 'escribir'){ const n = Escribir.lista().length; return n ? pl(n, 'escrito', 'escritos') : 'Escribe o dicta'; }
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
    $('#poHoy').innerHTML = `
      <button class="po-nube po-nube2" data-nube aria-label="Conexión"></button>
      <div class="po-hoy-izq"><span class="po-dia"><b>${d.getDate()}</b><span>${MESES_C[d.getMonth()].slice(0, 3)}</span></span>
      <div class="po-hoy-tx"><b>${capital(DIAS[d.getDay()])}</b><small>${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}</small>
        <div class="po-hoy-chips">
          <button data-ir="tareas">✅ ${tHoy ? tHoy + (tHoy === 1 ? ' tarea' : ' tareas') + ' hoy' : 'Sin tareas hoy'}</button>
          <button data-ir="agenda">📒 ${nNotas ? nNotas + (nNotas === 1 ? ' nota' : ' notas') : 'Agenda libre'}</button>
        </div></div></div>
      <div class="po-reloj" aria-label="Reloj">${this.svgReloj('po')}<span class="po-rel-n">Aquí</span></div>
      <div class="po-reloj po-reloj2" aria-label="Reloj del mundo" role="button" title="Toca para elegir el país">${this.svgReloj('pw')}<span class="po-rel-n" id="pwNom"></span></div>`;
    this.pintarNube();
    const r2 = $('#poHoy .po-reloj2'); if(r2) r2.onclick = () => this.elegirZona();
    this.reloj();
    const pd = $('#poHoy .po-dia'); if(pd){ pd.setAttribute('role', 'button'); pd.title = 'Ver el año de la agenda'; pd.onclick = () => AnioPO.abrir(); }
    const rl = $('#poHoy .po-reloj'); if(rl){ rl.setAttribute('role', 'button'); rl.title = 'Toca para grabar una nota de voz'; rl.onclick = () => this.grabarYa(); }
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
        <b>${esc(S.k.startsWith('web') ? Webs.nombre(S.k) : S.k === 'escribir' ? Escribir.nombre() : S.t)}</b><small>${esc(this.info(S.k))}</small>
        <span class="po-flecha">›</span>
      </button>`)(this.SECC.find(x => x.k === k));
    g.innerHTML = this.orden().map(baldosa).join('');
    $('#poCajaSitio').innerHTML = '';
    $$('#vPortada [data-ir]').forEach(b => b.onclick = e => { if(Date.now() - (this._soltado || 0) < 600) return; if(b.dataset.ir === 'teams') Teams.nueva(); else if(b.dataset.ir.startsWith('web')) Webs.abrir(b.dataset.ir); else if(b.dataset.ir === 'manual') abrirManual(); else if(b.dataset.ir === 'guardar') Ajustes.abrir('donde'); else this.entrarEn(b.dataset.ir, b); });
    $('#vPortada [data-conf]').onclick = e => { if(Date.now() - (this._soltado || 0) < 600) return; const b = e.currentTarget; b.classList.add('girando'); setTimeout(() => { b.classList.remove('girando'); Ajustes.abrir(); }, 420); };
    const bc = $('#vPortada [data-bloc]'); if(bc) bc.onclick = () => { if(Date.now() - (this._soltado || 0) < 600) return; this.abrirCaja(bc); };
    if(entrar){ const v = $('#vPortada'); v.classList.remove('entra'); void v.offsetWidth; v.classList.add('entra'); }
  },
  /* ---------- Orden de las baldosas (mantener pulsado y arrastrar) ---------- */
  orden(){
    const def = [...this.SECC.map(s => s.k), 'bloc', 'conf'];
    let o = []; try{ o = JSON.parse(lsGet('ph3-po-orden') || '[]'); }catch(e){}
    o = o.filter(k => def.includes(k)); def.forEach(k => { if(!o.includes(k)) o.splice(k === 'conf' ? o.length : k === 'bloc' ? (o.includes('conf') ? o.indexOf('conf') : o.length) : Math.min(o.length, def.indexOf(k)), 0, k); });
    const ocultos = this.ocultos();
    return o.filter(k => k === 'conf' || !ocultos.includes(k));
  },
  ocultos(){ return (App.ajustes && Array.isArray(App.ajustes.poOcultos)) ? App.ajustes.poOcultos : []; },
  ordenDeSiempre(){ lsSet('ph3-po-orden', null); this.pintar(); },
  // Tocar el reloj: va a Grabar y empieza a grabar enseguida
  grabarYa(){
    if(typeof Grabar === 'undefined') return;
    irA('grabar');
    if(!Grabar.rec){ Grabar.pulsar(); toast('🎙 Grabando… pulsa «Parar» cuando acabes'); }
  },
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
        let antes = []; try{ antes = JSON.parse(lsGet('ph3-po-orden') || '[]'); }catch(e){}
        const vis = [...g.children].map(b => b.dataset.k).filter(Boolean);
        lsSet('ph3-po-orden', JSON.stringify([...new Set([...vis, ...antes.filter(k => !vis.includes(k))])])); toast('↕️ Orden guardado'); }
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
  svgReloj(p){
    const marcas = Array.from({ length:60 }, (_, k) => `<line x1="100" y1="${k % 5 ? 12 : 10}" x2="100" y2="${k % 5 ? 17 : 22}" transform="rotate(${k * 6} 100 100)" class="${k % 5 ? 'rm' : 'rM'}"/>`).join('');
    const nums = Array.from({ length:12 }, (_, k) => { const n = k + 1, ang = n * 30 * Math.PI / 180; return `<text x="${(100 + 67 * Math.sin(ang)).toFixed(1)}" y="${(100 - 67 * Math.cos(ang) + 7).toFixed(1)}" class="${n % 3 ? 'rn' : 'rn rn3'}">${n}</text>`; }).join('');
    return `<svg viewBox="0 0 200 200" id="${p}Reloj" aria-hidden="true">
          <circle cx="100" cy="100" r="96" class="r-aro"/><circle cx="100" cy="100" r="88" class="r-cara"/>
          ${marcas}${nums}
          <rect x="70" y="128" width="60" height="20" rx="10" class="r-digf"/><text x="100" y="143" class="r-dig" id="${p}Dig"></text>
          <line x1="100" y1="112" x2="100" y2="54" class="r-h" id="${p}H"/>
          <line x1="100" y1="116" x2="100" y2="34" class="r-m" id="${p}M"/>
          <g id="${p}S"><line x1="100" y1="124" x2="100" y2="26" class="r-s"/><circle cx="100" cy="26" r="4" class="r-sp"/></g>
          <circle cx="100" cy="100" r="7" class="r-c"/><circle cx="100" cy="100" r="2.6" fill="#fff"/>
        </svg>`;
  },
  // la hora de una zona (o la de aquí)
  horaEn(tz){
    const d = new Date();
    if(!tz) return { h:d.getHours(), m:d.getMinutes(), s:d.getSeconds(), dia:0 };
    try{
      const f = new Intl.DateTimeFormat('en-GB', { timeZone:tz, hour:'2-digit', minute:'2-digit', second:'2-digit', year:'numeric', month:'2-digit', day:'2-digit', hourCycle:'h23' });
      const o = {}; f.formatToParts(d).forEach(x => o[x.type] = x.value);
      const alli = Date.UTC(+o.year, +o.month - 1, +o.day), aqui = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
      return { h:+o.hour % 24, m:+o.minute, s:+o.second, dia:Math.round((alli - aqui) / 864e5) };
    }catch(e){ return { h:d.getHours(), m:d.getMinutes(), s:d.getSeconds(), dia:0 }; }
  },
  moverAgujas(p, t, extra){
    const H = $('#' + p + 'H'); if(!H) return;
    const m = t.m + t.s / 60, h = (t.h % 12) + m / 60;
    H.setAttribute('transform', `rotate(${h * 30} 100 100)`); $('#' + p + 'M').setAttribute('transform', `rotate(${m * 6} 100 100)`); $('#' + p + 'S').setAttribute('transform', `rotate(${t.s * 6} 100 100)`);
    $('#' + p + 'Dig').textContent = String(t.h).padStart(2, '0') + ':' + String(t.m).padStart(2, '0') + (extra || '');
  },
  // Reloj de agujas (y el del mundo, que se ve con el móvil en horizontal)
  reloj(){
    clearInterval(this._r);
    const pon = () => { const r = $('#poReloj'); if(!r || !$('#vPortada').classList.contains('activa')){ clearInterval(this._r); return; }
      this.moverAgujas('po', this.horaEn(null));
      const z = this.zona(), t = this.horaEn(z.tz);
      this.moverAgujas('pw', t, t.dia > 0 ? ' +1' : t.dia < 0 ? ' −1' : '');
      const n = $('#pwNom'); if(n && n.textContent !== z.nombre) n.textContent = z.nombre; };
    pon(); this._r = setInterval(pon, 1000);
  },
  ZONAS: [['Europe/London','Londres'],['Europe/Lisbon','Lisboa'],['Europe/Paris','París'],['Europe/Berlin','Berlín'],['Europe/Rome','Roma'],['Europe/Athens','Atenas'],['Europe/Moscow','Moscú'],['Atlantic/Canary','Canarias'],
    ['America/New_York','Nueva York'],['America/Chicago','Chicago'],['America/Denver','Denver'],['America/Los_Angeles','Los Ángeles'],['America/Mexico_City','Ciudad de México'],['America/Bogota','Bogotá'],['America/Lima','Lima'],['America/Caracas','Caracas'],['America/Santiago','Santiago de Chile'],['America/Argentina/Buenos_Aires','Buenos Aires'],['America/Sao_Paulo','São Paulo'],['America/Havana','La Habana'],['America/Toronto','Toronto'],['America/Anchorage','Alaska'],['Pacific/Honolulu','Hawái'],
    ['Africa/Casablanca','Casablanca'],['Africa/Cairo','El Cairo'],['Africa/Johannesburg','Johannesburgo'],['Africa/Lagos','Lagos'],['Africa/Nairobi','Nairobi'],
    ['Asia/Dubai','Dubái'],['Asia/Jerusalem','Jerusalén'],['Asia/Istanbul','Estambul'],['Asia/Kolkata','India'],['Asia/Bangkok','Bangkok'],['Asia/Shanghai','China'],['Asia/Hong_Kong','Hong Kong'],['Asia/Singapore','Singapur'],['Asia/Manila','Manila'],['Asia/Seoul','Seúl'],['Asia/Tokyo','Tokio'],
    ['Australia/Perth','Perth'],['Australia/Sydney','Sídney'],['Pacific/Auckland','Nueva Zelanda']],
  zona(){ try{ const z = JSON.parse(lsGet('ph3-reloj2') || 'null'); if(z && z.tz) return z; }catch(e){} return { tz:'America/New_York', nombre:'Nueva York' }; },
  elegirZona(){
    const act = this.zona().tz, todas = (() => { try{ return Intl.supportedValuesOf('timeZone'); }catch(e){ return []; } })();
    const hora = tz => { const t = this.horaEn(tz); return String(t.h).padStart(2, '0') + ':' + String(t.m).padStart(2, '0') + (t.dia > 0 ? ' (+1)' : t.dia < 0 ? ' (−1)' : ''); };
    const fila = (tz, n) => `<button class="opcion opc2 pz-f ${tz === act ? 'on' : ''}" data-tz="${esc(tz)}" data-nom="${esc(n)}"><span>${esc(n)}</span><small>${hora(tz)}</small></button>`;
    popup({ tit:'🌍 Reloj del mundo', html:`<p class="aj-ayuda" style="margin:0 0 8px">Elige la ciudad o el país. Se ve con el móvil en horizontal.</p>
        <input id="pzQ" type="search" placeholder="Buscar ciudad o país…" autocomplete="off" style="margin-bottom:8px">
        <div class="pz-lista" id="pzLista">${this.ZONAS.map(([tz, n]) => fila(tz, n)).join('')}</div>`,
      botones:[{ txt:'Cerrar', val:null }],
      alAbrir:(c, fin) => {
        const lista = $('#pzLista', c), q = $('#pzQ', c);
        const pintar = () => { const t = norm(q.value.trim());
          if(!t){ lista.innerHTML = this.ZONAS.map(([tz, n]) => fila(tz, n)).join(''); return; }
          const nuestras = this.ZONAS.filter(([tz, n]) => norm(n + ' ' + tz).includes(t));
          const otras = todas.filter(tz => norm(tz.replace(/_/g, ' ')).includes(t) && !nuestras.some(z => z[0] === tz)).slice(0, 40).map(tz => [tz, tz.split('/').pop().replace(/_/g, ' ')]);
          lista.innerHTML = [...nuestras, ...otras].map(([tz, n]) => fila(tz, n)).join('') || '<p class="aj-ayuda">No encuentro esa ciudad. Prueba en inglés (por ejemplo «New York»).</p>'; };
        q.oninput = pintar;
        lista.onclick = e => { const b = e.target.closest('[data-tz]'); if(!b) return; lsSet('ph3-reloj2', JSON.stringify({ tz:b.dataset.tz, nombre:b.dataset.nom })); fin(true); this.reloj(); toast('🌍 ' + b.dataset.nom + ': ' + hora(b.dataset.tz), null, null, 1600); };
      } });
  },
  /* La nubecita: verde con internet, roja sin internet */
  enLinea(){ return navigator.onLine !== false; },
  pintarNube(){
    const on = this.enLinea(), svg = `<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M8.5 22h16a6.5 6.5 0 0 0 .9-12.94A9 9 0 0 0 8.1 7.6 7.2 7.2 0 0 0 8.5 22z"/>${on ? '<path d="M11 14.5l3.4 3.2L21 11" class="pn-ok"/>' : '<path d="M12.5 11l7 7M19.5 11l-7 7" class="pn-ok"/>'}</svg>`;
    $$('[data-nube]').forEach(b => { b.classList.toggle('off', !on); b.innerHTML = svg; b.title = on ? 'Conectada a internet' : 'Sin conexión'; b.setAttribute('aria-label', b.title);
      b.onclick = e => { e.stopPropagation(); toast(on ? '☁️ Conectada a internet: lo que guardas en la nube se sube al momento' : '⚠️ Sin conexión: se guarda en el aparato y se sube solo cuando vuelva internet', null, null, 3500); }; });
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
    addEventListener('online', () => { this.pintarNube(); toast('☁️ Vuelve a haber conexión', null, null, 1600); }); addEventListener('offline', () => { this.pintarNube(); toast('⚠️ Sin conexión a internet', null, null, 2000); });
    this.pintarNube();
    matchMedia('(orientation: landscape)').addEventListener && matchMedia('(orientation: landscape)').addEventListener('change', () => this.reloj());
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
      f.src = 'calculadora.html?v=162';
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
  NOMBRES: { escribir:'Escribir', tareas:'Tareas', cal:'Calendario Tareas', agenda:'Agenda', grabar:'Grabar', sitios:'Sitios', conf:'Configuración', portada:'Portada' },
  DE_VISTA: { vPortada:'portada', vTablero:'tareas', vCal:'cal', vAgenda:'agenda', vGrabar:'grabar', vSitios:'sitios', vEscribir:'escribir' },
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

/* ---------- El año de la agenda a pantalla completa (tocando la fecha de la portada) ----------
   Toca un día para abrirlo en la Agenda. Dos toques seguidos (o la ✕) lo cierran.
   Deslizando de lado se pasa de año con la hoja que se dobla, como en la Agenda. */
const AnioPO = {
  y: new Date().getFullYear(),
  abierto(){ return !!$('#poAnio'); },
  abrir(){
    if(this.abierto()) return;
    this.y = new Date().getFullYear();
    const v = document.createElement('div'); v.id = 'poAnio'; v.className = 'po-anio';
    v.innerHTML = `<div class="pa-top"><span class="pa-marca">${icono('agenda')}Agenda</span><button class="pa-x" data-x aria-label="Cerrar">✕</button></div>
      <div class="pa-cuerpo" id="paCuerpo"></div><div class="pa-ayuda">Toca un día para abrirlo · desliza para cambiar de año · dos toques para cerrar</div>`;
    document.body.appendChild(v);
    this.pintar();
    requestAnimationFrame(() => v.classList.add('pa-ver'));
    let ult = 0, tm = null, tu = 0, tx = 0, ty = 0, sx = 0, sy = 0;
    // dos toques con el dedo (en el iPhone el 2.º toque fuera de un botón no llega como «click»)
    v.addEventListener('touchstart', e => { const t = e.touches[0]; if(t){ sx = t.clientX; sy = t.clientY; } }, { passive:true });
    v.addEventListener('touchend', e => { const t = e.changedTouches[0], n = Date.now(); if(!t || e.target.closest('.pa-top, .pa-cab')) return;
      if(Math.hypot(t.clientX - sx, t.clientY - sy) > 10){ tu = 0; return; }
      if(n - tu < 360 && Math.hypot(t.clientX - tx, t.clientY - ty) < 40){ clearTimeout(tm); tu = 0; ult = 0; if(e.cancelable) e.preventDefault(); this.cerrar(); return; }
      tu = n; tx = t.clientX; ty = t.clientY; }, { passive:false });
    v.addEventListener('dblclick', e => { if(!e.target.closest('.pa-top, .pa-cab')){ clearTimeout(tm); this.cerrar(); } });
    v.addEventListener('click', e => {
      const b = e.target.closest('button');
      if(b && 'x' in b.dataset){ this.cerrar(); return; }
      if(b && b.dataset.mv){ this.pasar(+b.dataset.mv); return; }
      if(Date.now() - (this._desliz || 0) < 400) return;
      const ahora = Date.now();
      if(ahora - ult < 360){ clearTimeout(tm); ult = 0; this.cerrar(); return; }
      ult = ahora;
      const d = e.target.closest('[data-k]'), m = e.target.closest('[data-mes]');
      clearTimeout(tm);
      if(d || m) tm = setTimeout(() => { this.cerrar(); irA('agenda');
        if(d){ Agenda.ponerModo('dia'); Agenda.irDia(d.dataset.k); }
        else { Agenda.mes = new Date(this.y, +m.dataset.mes, 1); Agenda.ponerModo('mes'); } }, 380);
    });
    deslizarPaginas($('#paCuerpo'), { puede: () => true, cont: () => $('#paCuerpo .pa-hoja'),
      fondo: () => { const k = $('#paCuerpo .pa-hoja'); return k ? getComputedStyle(k).backgroundColor : '#fff'; },
      cambio: dir => { this._desliz = Date.now(); this.y += dir; this.pintar(); } });
    this._tecla = e => { if(e.key === 'Escape') this.cerrar(); else if(e.key === 'ArrowRight') this.pasar(1); else if(e.key === 'ArrowLeft') this.pasar(-1); };
    addEventListener('keydown', this._tecla);
  },
  pintar(){
    const c = $('#paCuerpo'); if(!c) return;
    const hoy = new Date();
    // el año va dentro de la hoja: así el título también se dobla al pasar la página
    const tit = `Año ${this.y}${this.y === hoy.getFullYear() ? '<small>Hoy, ' + hoy.getDate() + ' de ' + MESES[hoy.getMonth()] + '</small>' : '<small>&nbsp;</small>'}`;
    c.innerHTML = `<div class="pa-hoja"><div class="pa-cab"><button class="flecha" data-mv="-1" aria-label="Año anterior">‹</button><div class="pa-tit">${tit}</div><button class="flecha" data-mv="1" aria-label="Año siguiente">›</button></div><div class="ag-anio pa-meses">${MESES_C.map((n, m) => `<div class="ag-mini ${this.y === hoy.getFullYear() && m === hoy.getMonth() ? 'ahora' : ''}"><button class="ag-mini-t" data-mes="${m}">${n}</button>${Agenda.rejilla(this.y, m, true)}</div>`).join('')}</div></div>`;
  },
  pasar(dir){
    const h = $('#paCuerpo .pa-hoja');
    if(!h || matchMedia('(prefers-reduced-motion: reduce)').matches){ this.y += dir; this.pintar(); return; }
    const ctx = paginaEmpieza(h, dir, d => { this.y += d; this.pintar(); }, getComputedStyle(h).backgroundColor);
    if(ctx) paginaA(ctx, 1, 760);
  },
  cerrar(){
    const v = $('#poAnio'); if(!v) return;
    removeEventListener('keydown', this._tecla);
    v.classList.remove('pa-ver'); setTimeout(() => v.remove(), 220);
  }
};

/* ---------- Reunión de Teams ----------
   Se escribe aquí la reunión: se apunta en Tareas y/o en la Agenda ese día (con aviso)
   y se abre Teams con la reunión nueva ya rellenada, para enviarla. */
const Teams = {
  lista(){ try{ return JSON.parse(lsGet('ph3-teams') || '[]'); }catch(e){ return []; } },
  proxima(){
    const ahora = Date.now(), l = this.lista().filter(r => new Date(r.k + 'T' + r.h).getTime() > ahora - 3600000).sort((a, b) => (a.k + a.h) < (b.k + b.h) ? -1 : 1)[0];
    return l ? 'Próxima: ' + (l.k === hoyIso() ? 'hoy' : fechaCortaB(l.k)) + ' ' + l.h : 'Crea una reunión';
  },
  horaSig(){ const d = new Date(Date.now() + 30 * 60000); d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); },
  nueva(dia){
    let donde = { tarea:true, agenda:true }; try{ donde = Object.assign(donde, JSON.parse(lsGet('ph3-tm-donde') || '{}')); }catch(e){}
    this.R = { titulo:'', k:dia || hoyIso(), h:this.horaSig(), dur:+(lsGet('ph3-tm-dur') || 30), quien:'', notas:'', aviso:lsGet('ph3-tm-aviso') ?? '10', ...donde };
    this.pintar(true);
  },
  // Desde una tarea (botón «📹 Reunión de Teams» al lado de «Al calendario del móvil»)
  desdeTarea(t0){
    const yaGuardada = !!(t0 && t0.id);
    const t = yaGuardada ? t0 : leerEditor();
    const tit = String(t.titulo || '').replace(/^📹\s*/, '').replace(/\s*·\s*\d{1,2}:\d{2}$/, '').trim();
    if(!tit){ if(!yaGuardada) $('#edTitulo').focus(); toast('Escribe antes el título de la tarea'); return; }
    const av = (t.avisos || []).map(a => a.f).filter(Boolean).sort()[0];
    const p = persona(t.personaId);
    const notas = (!yaGuardada && $('#edNotas')) ? $('#edNotas').innerText.trim() : String(t.notas || '').trim();
    this.R = { titulo:tit, k:(t.teams && t.ini) || t.ini || (av ? av.slice(0, 10) : hoyIso()), h:(t.teams && t.teams.h) || (av ? av.slice(11, 16) : this.horaSig()),
      dur:(t.teams && t.teams.dur) || +(lsGet('ph3-tm-dur') || 30), quien:p && p.email ? p.email : '', notas:notas.replace(/^📹 Reunión de Teams.*\n?/, ''),
      aviso:'', tarea:false, agenda:false, deTarea:t.id };
    this.pintar(false);
  },
  leer(){ const R = this.R; if(!R) return; const v = id => { const e = $('#' + id); return e ? e.value : null; };
    if(v('tmTit') != null) R.titulo = v('tmTit'); if(v('tmHora')) R.h = v('tmHora'); if(v('tmQuien') != null) R.quien = v('tmQuien'); if(v('tmNotas') != null) R.notas = v('tmNotas'); },
  pintar(foco){
    const R = this.R; if(!R) return; this.leer();
    const man = sumaDias(hoyIso(), 1), chip = (on, attr, t) => `<button class="tm-chip ${on ? 'on' : ''}" ${attr}>${t}</button>`;
    const pers = (App.personas || []).filter(x => x.email);
    const p = popMio(`<div class="tm-cab"><span class="tm-ic">${icono('teams')}</span><div><h3 class="mp-h">Reunión de Teams</h3><small>Se apunta aquí y se abre Teams para enviarla</small></div></div>
      <input class="mp-input" id="tmTit" placeholder="¿De qué es la reunión? Ej.: Claustro, tutoría…" value="${esc(R.titulo)}" autocomplete="off">
      <div class="tm-et">📅 Día</div>
      <div class="tm-fila">${chip(R.k === hoyIso(), 'data-dia="' + hoyIso() + '"', 'Hoy')}${chip(R.k === man, 'data-dia="' + man + '"', 'Mañana')}<label class="tm-chip tm-fecha ${R.k !== hoyIso() && R.k !== man ? 'on' : ''}">📅 ${fechaCortaB(R.k)}<input type="date" id="tmDia" value="${R.k}"></label></div>
      <div class="tm-et">🕐 Hora y duración</div>
      <div class="tm-fila"><input type="time" class="tm-hora" id="tmHora" value="${R.h}">${[15, 30, 45, 60, 90].map(m => chip(R.dur === m, 'data-dur="' + m + '"', m < 60 ? m + ' min' : m === 60 ? '1 h' : '1 h 30')).join('')}</div>
      <div class="tm-et">👥 Invitar (opcional)</div>
      <input class="mp-input" id="tmQuien" type="email" inputmode="email" multiple placeholder="Emails, separados por comas" value="${esc(R.quien)}" autocomplete="off">
      ${pers.length ? `<div class="tm-fila tm-pers">${pers.map(x => { const on = (R.quien || '').split(/[,;\s]+/).includes(x.email); return chip(on, 'data-mail="' + esc(x.email) + '"', (on ? '✓ ' : '＋ ') + esc(x.nombre)); }).join('')}</div>
      <div class="tm-nota">${App.personas.some(x => x.email && (R.quien || '').split(/[,;\s]+/).includes(x.email)) ? '👤 En Tareas, la tarea quedará <b>asignada</b> a ' + esc(App.personas.find(x => x.email && (R.quien || '').split(/[,;\s]+/).includes(x.email)).nombre) + '.' : 'Toca una persona para invitarla (y asignarle la tarea).'}</div>` : ''}
      <textarea class="mp-input tm-notas" id="tmNotas" placeholder="Notas o temas a tratar (opcional)">${esc(R.notas)}</textarea>
      <div class="tm-et">📝 Apuntarla en PorHacer3</div>
      <div class="tm-fila">${R.deTarea ? '<span class="tm-chip on" style="cursor:default">✓ Es esta tarea</span>' : chip(R.tarea, 'data-en="tarea"', (R.tarea ? '✓ ' : '') + '✅ Tareas')}${chip(R.agenda, 'data-en="agenda"', (R.agenda ? '✓ ' : '') + '📒 Agenda')}</div>
      <div class="tm-et">⏰ Aviso</div>
      <div class="tm-fila">${[['', 'Sin aviso'], ['0', 'A la hora'], ['10', '10 min antes'], ['30', '30 min antes']].map(([v, t]) => chip(R.aviso === v, 'data-av="' + v + '"', t)).join('')}</div>
      <div class="mp-fila"><button class="mp-b" data-x>Cancelar</button><button class="mp-b mp-pri tm-crear" data-crear>📹 Crear en Teams</button></div>`, 'tm-pop');
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return; const d = b.dataset;
      if(d.dia){ this.leer(); R.k = d.dia; this.pintar(); }
      else if(d.dur){ this.leer(); R.dur = +d.dur; lsSet('ph3-tm-dur', d.dur); this.pintar(); }
      else if(d.en){ this.leer(); R[d.en] = !R[d.en]; if(!R.deTarea) lsSet('ph3-tm-donde', JSON.stringify({ tarea:R.tarea, agenda:R.agenda })); this.pintar(); }
      else if(d.av != null && 'av' in d){ this.leer(); R.aviso = d.av; lsSet('ph3-tm-aviso', d.av); this.pintar(); }
      else if(d.mail){ this.leer(); const l = R.quien.split(/[,;\s]+/).filter(Boolean); R.quien = (l.includes(d.mail) ? l.filter(x => x !== d.mail) : [...l, d.mail]).join(', ');
        $('#tmQuien').value = R.quien; this.pintar(); }   // (antes se volvía a leer el recuadro vacío y no hacía nada)
      else if('crear' in d) this.crear();
      else if('x' in d){ this.R = null; cerrarPopMio(); } };
    const di = $('#tmDia'); if(di) di.onchange = () => { if(di.value){ this.leer(); R.k = di.value; this.pintar(); } };
    if(foco) setTimeout(() => { const t = $('#tmTit'); t && t.focus(); }, 150);
  },
  url(R, ini, fin){
    const off = -ini.getTimezoneOffset(), z = (off >= 0 ? '+' : '-') + String(Math.floor(Math.abs(off) / 60)).padStart(2, '0') + ':' + String(Math.abs(off) % 60).padStart(2, '0');
    const f = d => iso(d) + 'T' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':00' + z;
    const q = [['subject', R.titulo], ['startTime', f(ini)], ['endTime', f(fin)]];
    const quien = R.quien.split(/[,;\s]+/).filter(x => x.includes('@')); if(quien.length) q.push(['attendees', quien.join(',')]);
    if(R.notas.trim()) q.push(['content', R.notas.trim()]);
    return 'https://teams.microsoft.com/l/meeting/new?' + q.map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
  },
  async crear(){
    const R = this.R; if(!R) return; this.leer();
    R.titulo = R.titulo.trim(); if(!R.titulo){ $('#tmTit') && $('#tmTit').focus(); toast('Escribe de qué es la reunión'); return; }
    if(!/^\d{2}:\d{2}$/.test(R.h)){ toast('Pon la hora'); return; }
    const ini = new Date(R.k + 'T' + R.h), fin = new Date(ini.getTime() + R.dur * 60000);
    const hh = d => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    // 1) Teams, enseguida (tiene que ser con el mismo toque, si no el navegador lo bloquea)
    const url = this.url(R, ini, fin);
    let w = null; try{ w = window.open(url, '_blank'); }catch(e){}
    // 2) Apuntarla en PorHacer3
    let aviso = '';
    if(R.aviso !== ''){ const a = new Date(ini.getTime() - (+R.aviso) * 60000); aviso = iso(a) + 'T' + hh(a); }
    const quien = R.quien.split(/[,;\s]+/).filter(x => x.includes('@'));
    const det = `📹 Reunión de Teams · ${R.h}–${hh(fin)}` + (quien.length ? '\n👥 ' + quien.join(', ') : '') + (R.notas.trim() ? '\n' + R.notas.trim() : '');
    const hecho = [];
    try{
      if(R.tarea){
        const t = { id:nuevoId('t'), titulo:'📹 ' + R.titulo + ' · ' + R.h, notas:det, colId:'nueva', color:'#c4e6f8', prio:0, ini:R.k, fin:R.k, personaId:'', subs:[], creada:Date.now(), orden:-Date.now(), teams:{ h:R.h, dur:R.dur, url } };
        if(!columnas().some(c => c.id === 'nueva')) t.colId = (columnas().find(c => c.visible && !c.hecha) || columnas()[0]).id;
        const asig = (App.personas || []).find(x => x.email && quien.includes(x.email)); if(asig) t.personaId = asig.id;   // asignada a la primera persona invitada
        if(aviso) t.avisos = [{ id:nuevoId('av'), f:aviso, de:(typeof Nube !== 'undefined' && Nube.user && Nube.user.email) || '' }];
        anotar(t, '📹 Reunión de Teams el ' + fechaCortaB(R.k) + ' a las ' + R.h);
        await guardarTarea(t); App.tareas.push(t); pintarTodo(); hecho.push('Tareas');
      }
      if(R.agenda){
        const n = { id:nuevoId('n'), creada:Date.now(), texto:'📹 ' + R.h + ' ' + R.titulo + ' (Teams, ' + (R.dur < 60 ? R.dur + ' min' : R.dur / 60 + ' h').replace('.5 h', ' h 30') + ')', color:'azul', hecha:false, fotos:[] };
        if(aviso){ n.aviso = aviso; n.avisoVisto = false; }
        await Agenda.guardarDia(R.k, [...Agenda.notas(R.k), n]); hecho.push('Agenda');
      }
    }catch(e){ console.warn(e); popAviso('Reunión de Teams', 'No se ha podido apuntar en PorHacer3: ' + e.message); }
    if(R.deTarea && !App.ed){
      // ya guardada: se actualiza la tarea directamente
      const g = App.tareas.find(x => x.id === R.deTarea);
      if(g){ if(!g.ini) g.ini = R.k; if(!g.fin) g.fin = R.k; g.teams = { h:R.h, dur:R.dur, url };
        anotar(g, '📹 Reunión de Teams el ' + fechaCortaB(R.k) + ' a las ' + R.h + (quien.length ? ' con ' + quien.join(', ') : ''));
        await guardarTarea(g); pintarTodo(); hecho.push('la tarea'); }
    }
    if(R.deTarea && App.ed){
      // la tarea abierta: se le ponen el día y el aviso, y queda apuntado en su historial (se guarda al pulsar «Guardar»)
      if(!$('#edIni').value){ $('#edIni').value = R.k; } if(!$('#edFin').value){ $('#edFin').value = R.k; } if(typeof pintarDur === 'function') pintarDur();
      App.ed.t.teams = { h:R.h, dur:R.dur, url };
      if(typeof apuntar === 'function') apuntar('📹 Reunión de Teams el ' + fechaCortaB(R.k) + ' a las ' + R.h + (quien.length ? ' con ' + quien.join(', ') : ''));
      hecho.push('la tarea (pulsa Guardar)');
    }
    const l = this.lista().filter(r => new Date(r.k + 'T' + r.h).getTime() > Date.now() - 86400000); l.push({ k:R.k, h:R.h, t:R.titulo }); lsSet('ph3-teams', JSON.stringify(l.slice(-30)));
    this.R = null; cerrarPopMio(); Portada.pintar();
    popup({ tit:'📹 Reunión apuntada', html:`<p><b>${esc(R.titulo)}</b><br>${esc(fechaBonita(R.k, true))} · ${R.h}–${hh(fin)}</p>
      <p class="aj-ayuda">${hecho.length ? 'Está en ' + hecho.join(' y ') + (aviso ? ', con aviso' : '') + '.' : 'No la has apuntado en PorHacer3.'}</p>
      <p class="aj-ayuda">${w ? 'Se ha abierto <b>Teams</b> con la reunión rellenada: revisa y pulsa <b>Enviar</b> (o Guardar).' : 'Pulsa el botón para abrir <b>Teams</b> con la reunión rellenada, y allí pulsa <b>Enviar</b>.'}</p>
      <a class="btn-pri btn-ancho tm-abrir" href="${url}" target="_blank" rel="noopener">📹 Abrir Teams</a>`, botones:[{ txt:'Hecho', cls:'btn-sec', val:true }] });
  }
};

/* ---------- Botones «Personal» (dos webs a tu gusto) ----------
   Nombre, dirección, usuario y contraseña se guardan SOLO en este aparato (no van a la nube ni a las copias). */
const Webs = {
  de(k){ try{ return JSON.parse(lsGet('ph3-' + k) || '{}') || {}; }catch(e){ return {}; } },
  poner(k, w){ lsSet('ph3-' + k, JSON.stringify(w)); },
  nombre(k){ return (this.de(k).nombre || '').trim() || (k === 'web1' ? 'Personal' : 'Personal 2'); },
  url(k){ let u = (this.de(k).url || '').trim(); if(u && !/^[a-z]+:\/\//i.test(u)) u = 'https://' + u; return u; },
  // Si no pones http:// o https://, mira si la web funciona con https (segura); si no, usa http
  async arreglar(u){
    u = String(u || '').trim(); if(!u || /^[a-z]+:\/\//i.test(u)) return u;
    const prueba = url => Promise.race([fetch(url, { mode:'no-cors', cache:'no-store' }).then(() => true, () => false), new Promise(r => setTimeout(() => r(false), 4000))]);
    if(await prueba('https://' + u)) return 'https://' + u;
    return 'http://' + u;          // no responde con https: es una web sin conexión segura
  },
  info(k){ const u = this.url(k); if(!u) return 'Toca para configurarla'; try{ return new URL(u).hostname.replace(/^www\./, ''); }catch(e){ return u; } },
  copiar(t){
    try{ if(navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(t).catch(() => {}); return; } }catch(e){}
    const x = document.createElement('textarea'); x.value = t; x.setAttribute('readonly', ''); x.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(x); x.select(); try{ document.execCommand('copy'); }catch(e){} x.remove();
  },
  abrir(k){
    const w = this.de(k), u = this.url(k);
    if(!u){ toast('🌐 Pon primero la dirección de la web'); Ajustes.abrir('webs'); return; }
    // la contraseña se copia (para pegarla al entrar) y se abre la web, todo con el mismo toque
    if(w.clave) this.copiar(w.clave);
    // iPhone/iPad con la app instalada: una web sin «https» se queda en blanco dentro de la app → se abre en Safari
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const pwa = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    if(ios && pwa && /^http:\/\//i.test(u)){
      if(w.clave || w.usuario) toast((w.usuario ? '👤 ' + w.usuario + ' · ' : '') + (w.clave ? '🔑 Contraseña copiada: pégala al entrar' : ''), null, null, 6000);
      location.href = 'x-safari-' + u;
      setTimeout(() => { if(document.hidden) return;   // si Safari no se ha abierto, se ofrece abrirla aquí
        const p = popMio(`<h3 class="mp-h">🌐 ${esc(this.nombre(k))}</h3><p style="margin:0 2px 12px;line-height:1.4">No se ha podido abrir en Safari. ¿La abro aquí?</p><div class="mp-fila"><button class="mp-b" data-x>Cancelar</button><button class="mp-b mp-pri" data-si>Abrir</button></div>`);
        p.onclick = ev => { if(ev.target.closest('[data-si]')){ cerrarPopMio(); const v2 = window.open(u, '_blank'); if(!v2) location.href = u; } else if(ev.target.closest('[data-x]')) cerrarPopMio(); }; }, 1800);
      return;
    }
    const v = window.open(u, '_blank'); try{ if(v) v.opener = null; }catch(e){}
    if(w.clave || w.usuario) toast((w.usuario ? '👤 ' + w.usuario + ' · ' : '') + (w.clave ? '🔑 Contraseña copiada: pégala al entrar' : ''), null, null, 6000);
    if(!v) location.href = u;
  }
};

/* ---------- Manual: se ve DENTRO de la app (pdf.js), con ✕ para salir, índice y doble toque para volver ---------- */
const Manual = {
  async lib(){
    if(window.pdfjsLib) return window.pdfjsLib;
    await new Promise((ok, mal) => { const s = document.createElement('script'); s.src = 'pdf.min.js'; s.onload = ok; s.onerror = mal; document.head.appendChild(s); });
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
    return pdfjsLib;
  },
  async abrir(){
    if($('#manualV')) return;
    const v = document.createElement('div'); v.id = 'manualV'; v.className = 'man-v';
    v.innerHTML = `<div class="man-top"><button class="man-b" data-ind>☰ Índice</button><span class="man-pg" id="manPg">Cargando…</span><button class="man-x" data-x aria-label="Salir del manual">✕</button></div>
      <div class="man-cuerpo" id="manCuerpo"><div class="man-cargando">📖 Abriendo el manual…</div></div>
      <div class="man-indice" id="manIndice" hidden></div>
      <div class="man-ayuda">✕ o <b>doble toque</b> para volver a la app</div>`;
    document.body.appendChild(v); requestAnimationFrame(() => v.classList.add('man-ver'));
    this._tecla = e => { if(e.key === 'Escape') this.cerrar(); }; addEventListener('keydown', this._tecla);
    history.pushState({ manual:1 }, ''); this._pop = () => this.cerrar(true); addEventListener('popstate', this._pop);
    v.addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return;
      if('x' in b.dataset) this.cerrar(); else if('ind' in b.dataset) this.indice(); else if(b.dataset.p) this.ir(+b.dataset.p); });
    // doble toque / doble clic → volver a la app
    let ult = 0, ux = 0, uy = 0;
    $('#manCuerpo').addEventListener('touchend', e => { const t = e.changedTouches[0]; if(!t || e.touches.length) return; const n = Date.now();
      if(n - ult < 320 && Math.hypot(t.clientX - ux, t.clientY - uy) < 40){ e.preventDefault(); this.cerrar(); } ult = n; ux = t.clientX; uy = t.clientY; }, { passive:false });
    $('#manCuerpo').addEventListener('dblclick', () => this.cerrar());
    try{
      const L = await this.lib();
      this.pdf = await L.getDocument({ url:'manual.pdf?v=' + encodeURIComponent(VERSION) + '-' + new Date().toISOString().slice(0, 10) }).promise;
      const c = $('#manCuerpo'); if(!c) return; c.innerHTML = '';
      const W = Math.min(c.clientWidth - 16, 900), n = this.pdf.numPages;
      const p1 = await this.pdf.getPage(1), vp = p1.getViewport({ scale:1 }), alto = Math.round(W * vp.height / vp.width);
      for(let i = 1; i <= n; i++){ const d = document.createElement('div'); d.className = 'man-hoja'; d.dataset.n = i; d.style.height = alto + 'px'; d.style.width = W + 'px'; c.appendChild(d); }
      const pintar = async d => { if(d._ok) return; d._ok = true; const pg = await this.pdf.getPage(+d.dataset.n);
        const r = Math.min(2.5, (window.devicePixelRatio || 1) * 1.15), esc = W / pg.getViewport({ scale:1 }).width, vw = pg.getViewport({ scale:esc * r });
        const cv = document.createElement('canvas'); cv.width = vw.width; cv.height = vw.height; cv.style.width = W + 'px'; cv.style.height = alto + 'px';
        await pg.render({ canvasContext:cv.getContext('2d', { willReadFrequently:true }), viewport:vw }).promise; d.appendChild(cv); };
      this._pintar = pintar;
      const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ pintar(e.target); const s = e.target.nextElementSibling; s && pintar(s); } }), { root:c, rootMargin:'600px 0px' });
      $$('.man-hoja', c).forEach(d => io.observe(d));
      const cuenta = () => { const hs = $$('.man-hoja', c), y = c.scrollTop + c.clientHeight / 3; let k = 1; hs.forEach(h => { if(h.offsetTop <= y) k = +h.dataset.n; }); $('#manPg').textContent = 'Página ' + k + ' de ' + n; };
      c.addEventListener('scroll', cuenta, { passive:true }); cuenta();
      this.marcas = await this.pdf.getOutline().catch(() => null);
    }catch(e){ console.warn(e); const c = $('#manCuerpo'); if(c) c.innerHTML = '<div class="man-cargando">No se ha podido abrir el manual. ¿Hay internet?</div>'; }
  },
  async pagDe(dest){ try{ if(typeof dest === 'string') dest = await this.pdf.getDestination(dest); return (await this.pdf.getPageIndex(dest[0])) + 1; }catch(e){ return null; } },
  async indice(){
    const x = $('#manIndice'); if(!x) return;
    if(!x.hidden){ x.hidden = true; return; }
    if(!this.marcas){ this.ir(2); return; }
    if(!x._hecho){
      const fila = async (m, sub) => { const p = await this.pagDe(m.dest); return p ? `<button class="man-it ${sub ? 'sub' : ''}" data-p="${p}"><span>${esc(m.title)}</span><em>${p}</em></button>` : ''; };
      let h = ''; for(const m of this.marcas){ h += await fila(m, false); for(const s of (m.items || [])) h += await fila(s, true); }
      x.innerHTML = h; x._hecho = true;
    }
    x.hidden = false;
  },
  ir(p){ const c = $('#manCuerpo'), d = c && $(`.man-hoja[data-n="${p}"]`, c); const x = $('#manIndice'); if(x) x.hidden = true; if(d){ if(this._pintar){ this._pintar(d); d.nextElementSibling && this._pintar(d.nextElementSibling); } c.scrollTop = d.offsetTop - 8; } },
  cerrar(desdeAtras){
    const v = $('#manualV'); if(!v) return;
    removeEventListener('keydown', this._tecla); removeEventListener('popstate', this._pop);
    if(!desdeAtras && history.state && history.state.manual) history.back();
    v.classList.remove('man-ver'); setTimeout(() => v.remove(), 200);
    if(this.pdf){ try{ this.pdf.destroy(); }catch(e){} this.pdf = null; }
  }
};
function abrirManual(){ Manual.abrir(); }
