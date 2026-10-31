/* PorHacer3 · «Gastos»: una lista dentro de Tickets (como los Recordatorios del iPhone)
   Cada nota: varias líneas, fotos, una banderita de color (se pulsa y va cambiando: amarillo,
   naranja, verde, azul, rosa y sin color) y fechas que se ponen donde está el cursor.
   La redonda la marca como hecha: se va al final, tachada. Deslizar a la izquierda la borra.
   Se guarda con los Tickets (misma colección, tipo «gasto»), así va a la nube y a las copias. */

const Gastos = {
  COLORES: [['', 'Sin color', 'transparent'], ['amarillo', 'Amarillo', '#f2c418'], ['naranja', 'Naranja', '#f08a1a'], ['verde', 'Verde', '#3fae5a'], ['azul', 'Azul', '#2f80ed'], ['rosa', 'Rosa', '#e84898']],
  q: '', filtro: '', editando: null,

  /* ---------- Datos ---------- */
  meta(){ return this._uno('gx__meta') || { id:'gx__meta', tipo:'gastos-meta', nombre:'Gastos' }; },
  nombre(){ if(this.cerrado()) return lsGet('ph3-gx-nombre') || 'Gastos'; const m = this._uno('gx__meta'), n = ((m && m.nombre) || '').trim() || 'Gastos'; if(m && lsGet('ph3-gx-nombre') !== n) lsSet('ph3-gx-nombre', n); return n; },
  todos(){ return this._items().filter(x => x.tipo === 'gasto'); },
  /* Pestañas (por ejemplo, los 12 meses): cada nota es de una pestaña; las de antes, de la primera */
  tabs(){ return this.meta().tabs || []; },
  tabDe(x){ const ts = this.tabs(); return x.tab && ts.some(t => t.id === x.tab) ? x.tab : (ts[0] ? ts[0].id : ''); },
  tabActiva(){ const ts = this.tabs(), a = lsGet('ph3-gx-tab'); return ts.some(t => t.id === a) ? a : (ts[0] ? ts[0].id : ''); },
  deTab(){ const a = this.tabActiva(); return this.todos().filter(x => !a || this.tabDe(x) === a); },
  uno(id){ const x = this._uno(id); return x && x.tipo === 'gasto' ? x : null; },
  async poner(x){ x.cambiado = Date.now(); await this._poner(x.id, x); },
  color(c){ return (this.COLORES.find(x => x[0] === (c || '')) || this.COLORES[0]); },

  /* ---------- Cifrado (opcional, se activa en Configuración › Tickets) ----------
     Con el cifrado puesto, cada nota (y cada foto) se guarda cifrada con AES-GCM y una clave sacada de tu contraseña
     (PBKDF2, como las Notas secretas). En el aparato y en la nube solo hay letras sin sentido; la contraseña no se guarda
     en ningún sitio. Abierta la lista, las notas descifradas viven solo en la memoria (this._cache). */
  HDR: 'gx__cifra', VERIF: 'PorHacer3-gastos-ok',
  _cache: new Map(), _ct: new Map(), _fotos: new Map(), _fct: new Map(), clave: null, _sal: null,
  cifrado(){ return !!Mio.uno('gastos', this.HDR); },
  cerrado(){ return this.cifrado() && !this.clave; },
  _items(){ return this.cifrado() ? [...this._cache.values()] : Mio.todos('gastos').filter(x => x.tipo !== 'gx-c' && x.tipo !== 'gastos-cifra'); },
  _uno(id){ return this.cifrado() ? (this._cache.get(id) || null) : Mio.uno('gastos', id); },
  async _enc(obj, clave){ const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, clave || this.clave, new TextEncoder().encode(JSON.stringify(obj))); return { iv:Bloc.b64(iv), ct:Bloc.b64(ct) }; },
  async _dec(d, clave){ const pt = await crypto.subtle.decrypt({ name:'AES-GCM', iv:Bloc.deb64(d.iv) }, clave || this.clave, Bloc.deb64(d.ct)); return JSON.parse(new TextDecoder().decode(pt)); },
  async _poner(id, obj){
    if(!this.cifrado()){ await Mio.poner('gastos', id, obj); return; }
    if(!this.clave) throw new Error('Gastos está cerrado con contraseña');
    this._cache.set(id, obj);
    const e = await this._enc(obj); this._ct.set(id, e.ct);
    await Mio.poner('gastos', id, { id, tipo:'gx-c', iv:e.iv, ct:e.ct, cambiado:obj.cambiado || Date.now() });
  },
  async _quitar(id){ this._cache.delete(id); this._ct.delete(id); await Mio.quitar('gastos', id); },
  fotoSrc(f){ return this.cifrado() ? (this._fotos.get(f) || '') : Mio.foto(f); },
  async ponerFoto(img){
    if(!this.cifrado()) return Mio.ponerFoto(img, null, 'gastos');
    const id = nuevoId('f'), e = await this._enc(img); this._fotos.set(id, img); this._fct.set(id, e.ct);
    await Mio.poner('fotos', id, { img:'', iv:e.iv, ct:e.ct, t:Date.now(), de:'gastos' }); return id;
  },
  async ponerFotoCon(id, img, t){
    if(!this.cifrado()){ await Mio.poner('fotos', id, { img, t:t || Date.now(), de:'gastos' }); return; }
    const e = await this._enc(img); this._fotos.set(id, img); this._fct.set(id, e.ct); await Mio.poner('fotos', id, { img:'', iv:e.iv, ct:e.ct, t:t || Date.now(), de:'gastos' });
  },
  _olvidar(){ this.clave = null; this._sal = null; this._cache.clear(); this._ct.clear(); this._fotos.clear(); this._fct.clear(); },
  // pone al día lo descifrado con lo que hay guardado (y cifra lo que llegue sin cifrar)
  sync(){ this._cola = (this._cola || Promise.resolve()).then(() => this._sync()).catch(e => console.warn('gastos cifrado', e)); return this._cola; },
  async _sync(){
    const h = Mio.uno('gastos', this.HDR);
    if(!h){ if(this.clave) this._olvidar(); return; }
    if(!this.clave) return;
    if(h.sal !== this._sal){        // se cambió la contraseña en otro aparato
      this._olvidar(); if(this.abierto()){ const v = $('#gx'); v && v.classList.remove('abierto'); }
      toast('🔒 La contraseña de ' + (lsGet('ph3-gx-nombre') || 'Gastos') + ' ha cambiado en otro aparato. Vuelve a abrirla con la nueva.', null, null, 6000); this.pintarBoton(); return;
    }
    const vistos = new Set();
    for(const r of Mio.todos('gastos')){
      if(r.id === this.HDR) continue; vistos.add(r.id);
      if(r.tipo === 'gx-c'){ if(this._ct.get(r.id) === r.ct) continue; try{ this._cache.set(r.id, await this._dec(r)); this._ct.set(r.id, r.ct); }catch(e){ /* de otra clave: se deja */ } }
      else if(r.tipo === 'gasto' || r.tipo === 'gastos-meta'){ const ya = this._cache.get(r.id); if(!ya || (r.cambiado || 0) >= (ya.cambiado || 0)) await this._poner(r.id, { ...r }); else await this._poner(r.id, ya); }
    }
    for(const id of [...this._cache.keys()]) if(!vistos.has(id)){ this._cache.delete(id); this._ct.delete(id); }
    for(const [id, f] of Object.entries(Mio.datos.fotos || {})){
      if(!f || f.de !== 'gastos') continue;
      if(f.ct){ if(this._fct.get(id) === f.ct) continue; try{ this._fotos.set(id, await this._dec(f)); this._fct.set(id, f.ct); }catch(e){} }
      else if(f.img){ const e = await this._enc(f.img); this._fotos.set(id, f.img); this._fct.set(id, e.ct); await Mio.poner('fotos', id, { img:'', iv:e.iv, ct:e.ct, t:f.t || Date.now(), de:'gastos' }); }
    }
  },
  async probar(pass, h){ h = h || Mio.uno('gastos', this.HDR); const sal = Bloc.deb64(h.sal), clave = await Bloc.derivar(pass, sal); try{ if(await this._dec(h.ver, clave) === this.VERIF) return clave; }catch(e){} return null; },
  campoPass(id, ph){ return `<span class="md-pass"><input id="${id}" type="password" placeholder="${ph}" autocomplete="off"><button type="button" class="md-ojo" data-ojo="${id}">👁</button></span>`; },
  // pide la contraseña para abrir; devuelve true si ya está abierto
  async desbloquear(){
    if(!this.cerrado()) return true;
    if(!window.crypto || !crypto.subtle){ popAviso('Gastos', 'Este navegador no permite descifrar. Abre la app desde su dirección https.'); return false; }
    const h = Mio.uno('gastos', this.HDR);
    const clave = await popup({ tit:'🔒 ' + (lsGet('ph3-gx-nombre') || 'Gastos'), html:`<p class="aj-ayuda" style="margin:0 0 6px">Esta lista está <b>cifrada</b>. Escribe su contraseña para abrirla.</p>${this.campoPass('gxPass', 'Contraseña')}<div class="nube-error" id="gxPErr"></div>`,
      botones:[{ txt:'Cancelar', val:null }],
      alAbrir:(c, fin) => {
        MisDatos.enlazarOjos(c);
        const bx = document.createElement('button'); bx.className = 'btn-pri btn-ancho'; bx.textContent = '🔓 Abrir'; bx.style.marginTop = '10px'; $('#gxPErr', c).after(bx);
        const ir = async () => { const p = $('#gxPass', c).value; if(!p){ $('#gxPErr', c).textContent = 'Escribe la contraseña.'; return; }
          bx.disabled = true; $('#gxPErr', c).textContent = ''; const k = await this.probar(p, h); bx.disabled = false;
          if(k) fin(k); else { $('#gxPErr', c).textContent = 'Contraseña incorrecta.'; $('#gxPass', c).select(); } };
        bx.onclick = ir; $('#gxPass', c).onkeydown = e => { if(e.key === 'Enter') ir(); };
        setTimeout(() => $('#gxPass', c).focus(), 200);
      } });
    if(!clave) return false;
    this.clave = clave; this._sal = h.sal; await this.sync(); this.pintarBoton(); return true;
  },
  pideSiempre(){ return lsGet('ph3-gx-pedir') !== 'sesion'; },
  async activarCifrado(pass){
    const datos = Mio.todos('gastos').filter(x => x.tipo === 'gasto' || x.tipo === 'gastos-meta').map(x => ({ ...x }));
    const sal = crypto.getRandomValues(new Uint8Array(16)), clave = await Bloc.derivar(pass, sal);
    this._olvidar(); this.clave = clave; this._sal = Bloc.b64(sal); datos.forEach(x => this._cache.set(x.id, x));
    await Mio.poner('gastos', this.HDR, { id:this.HDR, tipo:'gastos-cifra', sal:this._sal, ver:await this._enc(this.VERIF), cambiado:Date.now() });
    await this.sync();
  },
  async cambiarClave(pass){
    await this.sync();
    const sal = crypto.getRandomValues(new Uint8Array(16)), clave = await Bloc.derivar(pass, sal);
    const notas = [...this._cache.entries()], fotos = [...this._fotos.entries()];
    this.clave = clave; this._sal = Bloc.b64(sal); this._ct.clear(); this._fct.clear();
    await Mio.poner('gastos', this.HDR, { id:this.HDR, tipo:'gastos-cifra', sal:this._sal, ver:await this._enc(this.VERIF), cambiado:Date.now() });
    for(const [id, x] of notas) await this._poner(id, x);
    for(const [id, img] of fotos){ const e = await this._enc(img); this._fct.set(id, e.ct); const f = Mio.uno('fotos', id); await Mio.poner('fotos', id, { img:'', iv:e.iv, ct:e.ct, t:(f && f.t) || Date.now(), de:'gastos' }); }
  },
  async quitarCifrado(){
    await this.sync();
    const notas = [...this._cache.entries()], fotos = [...this._fotos.entries()];
    await Mio.quitar('gastos', this.HDR); this._olvidar();
    for(const [id, x] of notas) await Mio.poner('gastos', id, x);
    for(const [id, img] of fotos){ const f = Mio.uno('fotos', id); await Mio.poner('fotos', id, { img, t:(f && f.t) || Date.now(), de:'gastos' }); }
  },
  async borrarTodo(){
    const ids = Mio.todos('gastos').map(x => x.id), fs = Object.keys(Mio.datos.fotos || {}).filter(k => (Mio.datos.fotos[k] || {}).de === 'gastos');
    this._olvidar(); for(const id of ids) await Mio.quitar('gastos', id); await Mio.quitarFotos(fs); lsSet('ph3-gx-nombre', null);
  },
  ordenados(){
    const t = this.deTab(), q = norm(this.q.trim());
    const ok = x => (!this.filtro || x.color === this.filtro) && (!q || norm((x.texto || '') + ' ' + this.importes(x).map(i => dinero(i.imp)).join(' ')).includes(q));
    const pend = t.filter(x => !x.ok && ok(x)).sort((a, b) => (b.orden || b.creado || 0) - (a.orden || a.creado || 0));
    const hechos = t.filter(x => x.ok && ok(x)).sort((a, b) => (b.hecho || 0) - (a.hecho || 0));
    return { pend, hechos };
  },

  /* ---------- Pantalla ---------- */
  async abrir(){
    if(this.cerrado() && !await this.desbloquear()) return;
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
        <div class="gx-total" id="gxTotal" hidden></div>
        <div class="gx-cuerpo" id="gxCuerpo"></div>`;
      document.body.appendChild(v);
      this.enlazar(v); this.arrastrarTabs($('#gxTabs', v));
    }
    this.q = ''; this.filtro = ''; this.editando = null;
    $('#gxQ').value = ''; $('#gxTit').value = this.nombre();
    v.classList.add('abierto'); this.pintar();
    if(Mio.todos('tickets').some(x => x.tipo === 'gasto' || x.tipo === 'gastos-meta')) this.migrar();   // por si quedaba alguna de antes
  },
  abierto(){ const v = $('#gx'); return !!(v && v.classList.contains('abierto')); },
  async cerrar(){ await this.guardarEdicion(); const v = $('#gx'); if(v) v.classList.remove('abierto'); if(this.cifrado() && this.pideSiempre()){ this._olvidar(); this.pintarBoton(); } Tickets.pintar && Tickets.pintar(); },
  pintarTabs(){
    const ts = this.tabs(), a = this.tabActiva(), n = id => this.todos().filter(x => !x.ok && this.tabDe(x) === id).length;
    $('#gxTabs').innerHTML = ts.map(t => `<button class="gx-tab ${t.id === a ? 'on' : ''}" data-tab="${t.id}">${esc(t.nombre)}${n(t.id) ? `<small>${n(t.id)}</small>` : ''}${t.id === a ? '<em>▾</em>' : ''}</button>`).join('')
      + `<button class="gx-tab gx-tab-mas" data-tabnueva>＋ ${ts.length ? 'Pestaña' : 'Crear pestañas'}</button>`;
    const on = $('#gxTabs .gx-tab.on'); if(on && !this._tabVisto){ on.scrollIntoView({ inline:'center', block:'nearest' }); this._tabVisto = true; }
  },
  /* Mover pestañas: mantener pulsada un momento, arrastrar y soltar donde quieras (se guarda el orden) */
  arrastrarTabs(box){
    let tm = null, drag = null, sx = 0, sy = 0, scr = null;
    const parar = () => { clearTimeout(tm); tm = null; };
    const empezar = (t, x, y) => { sx = x; sy = y; parar();
      tm = setTimeout(() => { tm = null; drag = { el:t }; this._noClick = true; t.classList.add('arr'); box.classList.add('arrastrando');
        try{ navigator.vibrate && navigator.vibrate(15); }catch(e){} toast('↔️ Arrastra la pestaña y suéltala donde quieras', null, null, 1400); }, 380); };
    const mover = x => {
      const otras = $$('.gx-tab[data-tab]', box).filter(o => o !== drag.el);
      const antes = otras.find(o => { const r = o.getBoundingClientRect(); return x < r.left + r.width / 2; });
      box.insertBefore(drag.el, antes || $('.gx-tab-mas', box));
      const R = box.getBoundingClientRect(); clearInterval(scr); scr = null;
      if(x < R.left + 36 || x > R.right - 36){ const d = x < R.left + 36 ? -10 : 10; scr = setInterval(() => { box.scrollLeft += d; }, 30); }
    };
    const soltar = async () => {
      parar(); clearInterval(scr); scr = null;
      if(!drag){ return; }
      const el = drag.el; drag = null; el.classList.remove('arr'); box.classList.remove('arrastrando');
      setTimeout(() => { this._noClick = false; }, 80);
      const ts = this.tabs(), nuevo = $$('.gx-tab[data-tab]', box).map(o => ts.find(t => t.id === o.dataset.tab)).filter(Boolean);
      if(nuevo.length === ts.length && nuevo.some((t, i) => t.id !== ts[i].id)){
        const m = this.meta(); m.tabs = nuevo; await this._poner(m.id, m); toast('↔️ Pestaña movida. El orden queda guardado', null, null, 1300);
      }
      this.pintarTabs();
    };
    // dedo
    box.addEventListener('touchstart', e => { const t = e.target.closest('.gx-tab[data-tab]'); if(t && e.touches.length === 1) empezar(t, e.touches[0].clientX, e.touches[0].clientY); }, { passive:true });
    box.addEventListener('touchmove', e => { const p = e.touches[0];
      if(drag){ e.preventDefault(); mover(p.clientX); }
      else if(tm && (Math.abs(p.clientX - sx) > 8 || Math.abs(p.clientY - sy) > 8)) parar(); }, { passive:false });
    box.addEventListener('touchend', soltar); box.addEventListener('touchcancel', soltar);
    // ratón
    box.addEventListener('mousedown', e => { const t = e.target.closest('.gx-tab[data-tab]'); if(t && e.button === 0) empezar(t, e.clientX, e.clientY); });
    box.addEventListener('mousemove', e => { if(drag){ e.preventDefault(); mover(e.clientX); } else if(tm && (Math.abs(e.clientX - sx) > 6 || Math.abs(e.clientY - sy) > 6)) parar(); });
    document.addEventListener('mouseup', () => { if(drag || tm) soltar(); });
    box.addEventListener('contextmenu', e => { if(e.target.closest('.gx-tab')) e.preventDefault(); });
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
      m.tabs = ts; await this._poner(m.id, m);
      const hoy = ts.find(t => norm(t.nombre) === norm(MESES_C[new Date().getMonth()])); if(hoy) lsSet('ph3-gx-tab', hoy.id);
      this.pintar(); toast('📅 Pestañas de los 12 meses creadas'); return; }
    if(ts.some(t => norm(t.nombre) === norm(n))){ toast('Ya hay una pestaña «' + n + '»'); return; }
    const t = { id:'tb_' + nuevoId('t'), nombre:n }; ts.push(t); m.tabs = ts; await this._poner(m.id, m);
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
      if(a === 'nom'){ const v = await this.pedirNombreTab('✏️ Nombre de la pestaña', t.nombre); if(v && v !== '__12'){ ts[i] = { ...ts[i], nombre:v }; m.tabs = ts; await this._poner(m.id, m); this.pintar(); } }
      else if(a === 'izq' || a === 'der'){ const j = a === 'izq' ? i - 1 : i + 1; if(j < 0 || j >= ts.length) return; [ts[i], ts[j]] = [ts[j], ts[i]]; m.tabs = ts; await this._poner(m.id, m); this.pintar(); }
      else if(a === 'borrar'){
        if(!await confirmarMio('Borrar pestaña', n ? `¿Borrar la pestaña «${esc(t.nombre)}» y sus ${n} ${n === 1 ? 'nota' : 'notas'}?` : `¿Borrar la pestaña «${esc(t.nombre)}»?`, 'Borrar')) return;
        const notas = this.todos().filter(x => this.tabDe(x) === id), copiaTabs = [...ts];
        for(const x of notas) await this._quitar(x.id);
        m.tabs = ts.filter(x => x.id !== id); await this._poner(m.id, m); this.pintar();
        toast('🗑 Pestaña borrada', 'Deshacer', async () => { const m2 = this.meta(); m2.tabs = copiaTabs; await this._poner(m2.id, m2); for(const x of notas) await this._poner(x.id, x); lsSet('ph3-gx-tab', id); this.pintar(); toast('↩️ La pestaña vuelve a estar'); }, 6000);
        setTimeout(() => { notas.forEach(x => { if(!this.uno(x.id)) Mio.quitarFotos(x.fotos || []); }); }, 8000);
      } };
  },
  pintarCols(){
    const n = c => this.deTab().filter(x => !x.ok && (x.color || '') === c).length;
    $('#gxCols').innerHTML = `<button data-f="" class="${!this.filtro ? 'on' : ''}">Todas</button>` + this.COLORES.slice(1).map(([c, t, h]) =>
      `<button data-f="${c}" class="${this.filtro === c ? 'on' : ''}" aria-label="${t}"><i style="background:${h}"></i>${n(c) || ''}</button>`).join('');
  },
  /* ---------- Cada nota: «¿Qué es?» (con su importe) y debajo sus líneas; cada importe con su casilla para tacharlo ---------- */
  RE_IMP: /^(.*?)\s*(\d+(?:[.,]\d{1,2})?)\s*€\s*$/,
  titulo(x){ return ((x.texto || '').split('\n')[0] || ''); },
  lineasDe(x){
    if(Array.isArray(x.lineas)) return x.lineas;
    return (x.texto || '').split('\n').slice(1).map(t => { const m = t.match(this.RE_IMP); return m ? { t:m[1], imp:this.numero(m[2]), ok:false } : { t, imp:null, ok:false }; });   // las notas de antes
  },
  importes(x){ const out = []; if(x.importe != null) out.push({ imp:x.importe, ok:!!x.okTit }); this.lineasDe(x).forEach(l => { if(l.imp != null) out.push({ imp:l.imp, ok:!!l.ok }); }); return out; },
  sumas(x){ const l = this.importes(x); return { n:l.length, todo:l.reduce((a, i) => a + i.imp, 0), pend:l.filter(i => !i.ok).reduce((a, i) => a + i.imp, 0) }; },
  casilla(k, imp, ok, ed){ return `<span class="gx-imp">${dinero(imp)}</span><button class="gx-tick ${ok ? 'on' : ''}" ${ed ? 'data-etick' : `data-tachar="${k}"`} aria-label="${ok ? 'Quitar la marca' : 'Marcar (tachar)'}">${ok ? '✓' : ''}</button>`; },
  filaEd(l){
    return `<div class="gx-lrow ${l.ok ? 'tach' : ''}"><textarea class="gx-lt" rows="1" placeholder="Otra línea…" enterkeyhint="next">${esc(l.t || '')}</textarea>
      <label class="gx-impw"><input class="gx-limp" inputmode="decimal" enterkeyhint="next" placeholder="0,00" value="${l.imp != null ? l.imp.toFixed(2).replace('.', ',') : ''}" autocomplete="off"><span>€</span></label>
      <button class="gx-tick ${l.ok ? 'on' : ''}" data-etick aria-label="Marcar (tachar)" ${l.imp == null ? 'hidden' : ''}>${l.ok ? '✓' : ''}</button></div>`;
  },
  fila(x){
    const tit = this.titulo(x), ls = this.lineasDe(x), c = this.color(x.color), fotos = (x.fotos || []).map(f => ({ f, s:this.fotoSrc(f) })).filter(o => o.s);
    const ed = this.editando === x.id, S = this.sumas(x);
    const tots = S.n >= 2 ? `<div class="gx-tots"><small>Total ${dinero(S.todo)}</small><b>${dinero(S.pend)}</b></div>` : '';
    const fondo = x.fondo && x.color ? ` gx-fondo" style="--gxf:${c[2]}` : '';
    return `<div class="desl-fila gx-fila ${x.ok ? 'ok' : ''} ${ed ? 'ed' : ''}${fondo}" data-id="${x.id}"><div class="desl-del"><span>🗑 Eliminar</span></div>
      <div class="desl-cara gx-cara">
        <button class="gx-check" data-check aria-label="${x.ok ? 'Desmarcar' : 'Marcar como hecha'}"></button>
        <div class="gx-cont">
          ${tots}
          ${ed ? `<div class="gx-erow ${x.okTit ? 'tach' : ''}"><textarea class="gx-t1" id="gxT1" rows="1" placeholder="¿Qué es?" enterkeyhint="next">${esc(tit)}</textarea>
                 <label class="gx-impw"><input class="gx-imp-in" id="gxImp" inputmode="decimal" enterkeyhint="next" placeholder="0,00" value="${x.importe != null ? x.importe.toFixed(2).replace('.', ',') : ''}" autocomplete="off"><span>€</span></label>
                 <button class="gx-tick ${x.okTit ? 'on' : ''}" data-etick id="gxTickT" aria-label="Marcar (tachar)" ${x.importe == null ? 'hidden' : ''}>${x.okTit ? '✓' : ''}</button></div>
                 <div class="gx-lineas" id="gxLineas">${[...ls, { t:'', imp:null, ok:false }].map(l => this.filaEd(l)).join('')}</div>`
               : `<div class="gx-ver" data-editar>
                   <div class="gx-l1 ${x.okTit && x.importe != null ? 'tach' : ''}">${tit ? `<b>${esc(tit)}</b>` : '<b class="gx-vacia">Nota vacía</b>'}${x.importe != null ? this.casilla('t', x.importe, x.okTit) : ''}</div>
                   ${ls.map((l, i) => `<div class="gx-li ${l.ok && l.imp != null ? 'tach' : ''}"><span class="gx-ltx">${esc(l.t) || '&nbsp;'}</span>${l.imp != null ? this.casilla(i, l.imp, l.ok) : ''}</div>`).join('')}</div>`}
          ${fotos.length ? `<div class="gx-fotos">${fotos.map(o => `<span class="gx-foto"><img src="${o.s}" alt="" data-ver="${o.f}">${ed ? `<button data-quitarfoto="${o.f}" aria-label="Quitar foto">✕</button>` : ''}</span>`).join('')}</div>` : ''}
          ${ed ? `<div class="gx-herr">
              <button class="gx-hb" data-hoy aria-label="Poner la fecha de hoy">📅</button>
              <button class="gx-hb gx-band" data-bandera aria-label="Color de la banderita" style="--bc:${c[2]}">${this.svgBandera(c[2])}</button>
              <button class="gx-hb" data-iconos aria-label="Poner un icono">✅</button>
              <button class="gx-hb gx-hbt" data-ins="€" aria-label="Poner €">€</button>
              <button class="gx-hb gx-hbt" data-ins="." aria-label="Poner un punto">.</button>
              <button class="gx-hb gx-hbt" data-lista aria-label="Lista con números o puntos">1≡</button>
              <button class="gx-hb" data-foto aria-label="Añadir foto">📷</button>
              <button class="gx-hb gx-intro" data-intro aria-label="Siguiente (como la tecla Intro)">↵ Siguiente</button>
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
    $$('#gxCuerpo textarea').forEach(t => this.auto(t));
    // arriba: la suma de todo lo que se ve y lo que falta (lo no tachado de las notas sin hacer)
    const vis = [...pend, ...hechos], todo = vis.reduce((a, x) => a + this.sumas(x).todo, 0), falta = pend.reduce((a, x) => a + this.sumas(x).pend, 0), hay = vis.some(x => this.sumas(x).n);
    const tt = $('#gxTotal'); if(tt){ tt.hidden = !hay; tt.innerHTML = hay ? `Total: <b>${dinero(todo)}</b>${falta !== todo ? ` · sin tachar: <b>${dinero(falta)}</b>` : ''}` : ''; }
  },
  auto(t){ t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; },

  /* ---------- Editar ---------- */
  async nueva(){
    await this.guardarEdicion();
    const x = { id:'gx_' + nuevoId('g'), tipo:'gasto', texto:'', lineas:[], ok:false, color:'', fotos:[], creado:Date.now(), orden:Date.now() };
    const tb = this.tabActiva(); if(tb) x.tab = tb;
    await this.poner(x);
    this.q = ''; $('#gxQ').value = ''; this.filtro = '';
    this.editar(x.id); $('#gxCuerpo').scrollTop = 0;
  },
  editar(id, foco){
    if(this.editando === id) return;
    this.editando = id; this.pintar();
    const t1 = $('#gxT1'), lts = $$('#gxLineas .gx-lt'), conTexto = lts.filter(t => t.value.trim());
    const f = foco || (t1 && !t1.value.trim() ? t1 : conTexto.length ? conTexto[conTexto.length - 1] : t1);
    if(f){ f.focus(); try{ f.setSelectionRange(f.value.length, f.value.length); }catch(e){} this._focoEl = f; }
  },
  async guardarEdicion(){
    const id = this.editando; if(!id) return;
    const x = this.uno(id); if(!x) { this.editando = null; return; }
    const v = this.leerCampos(x); this.editando = null;
    if(!v.texto.trim() && v.importe == null && !v.lineas.some(l => l.imp != null) && !(x.fotos || []).length){ await this._quitar(x.id); return; }     // nota vacía: fuera
    if(this.aplicar(x, v)) await this.poner(x);
  },
  aplicar(x, v){
    const antes = JSON.stringify([x.texto, x.importe != null ? x.importe : null, !!x.okTit, x.lineas || null]);
    x.texto = v.texto; if(v.importe == null){ delete x.importe; delete x.okTit; } else { x.importe = v.importe; x.okTit = v.okTit; } x.lineas = v.lineas;
    return antes !== JSON.stringify([x.texto, x.importe != null ? x.importe : null, !!x.okTit, x.lineas]);
  },
  // lo que hay escrito en la nota que se edita
  leerCampos(x){
    const t1 = $('#gxT1');
    if(!t1) return { texto:x.texto || '', importe:x.importe != null ? x.importe : null, okTit:!!x.okTit, lineas:this.lineasDe(x) };
    const tit = t1.value.replace(/\n/g, ' ').trim(), imp = this.numero($('#gxImp').value);
    const lineas = $$('#gxLineas .gx-lrow').map(r => ({ t:$('.gx-lt', r).value.replace(/\n/g, ' ').replace(/\s+$/, ''), imp:this.numero($('.gx-limp', r).value), ok:$('.gx-tick', r).classList.contains('on') }))
      .filter(l => l.t.trim() || l.imp != null).map(l => ({ ...l, ok:l.imp != null && l.ok }));
    const texto = [tit, ...lineas.map(l => l.t + (l.imp != null ? ' ' + l.imp.toFixed(2).replace('.', ',') + ' €' : ''))].join('\n').replace(/\s+$/, '');
    return { texto, importe:imp, okTit:imp != null && $('#gxTickT').classList.contains('on'), lineas };
  },
  numero(v){ v = String(v || '').replace(/[€\s]/g, ''); if(!v) return null; if(/,/.test(v)) v = v.replace(/\./g, '').replace(',', '.'); const n = parseFloat(v); return isNaN(n) ? null : Math.round(n * 100) / 100; },
  formatoImp(im){ const n = this.numero(im.value); im.value = n == null ? '' : n.toFixed(2).replace('.', ',');
    const tk = im.closest('.gx-lrow, .gx-erow').querySelector('.gx-tick'); if(tk){ tk.hidden = n == null; if(n == null){ tk.classList.remove('on'); tk.textContent = ''; } } },
  // Intro: del texto salta a su importe; del importe (con o sin número) baja a la línea siguiente
  teclas(e){
    const t = e.target, fila = t.closest && t.closest('.gx-lrow');
    if(e.key === 'Backspace' && t.classList.contains('gx-lt') && !t.value && fila && $$('#gxLineas .gx-lrow').length > 1 && !$('.gx-limp', fila).value){
      e.preventDefault(); const prev = fila.previousElementSibling; fila.remove(); const f = prev ? $('.gx-lt', prev) : $('#gxT1'); f.focus(); f.setSelectionRange(f.value.length, f.value.length); this._focoEl = f; return; }
    if(e.key !== 'Enter' || e.isComposing) return;
    e.preventDefault();
    if(t.id === 'gxT1'){ const im = $('#gxImp'); if(t.value.trim()){ im.focus(); im.select(); } else this.irA($('#gxLineas .gx-lt')); }
    else if(t.id === 'gxImp'){ this.formatoImp(t); this.irA($('#gxLineas .gx-lt')); }
    else if(t.classList.contains('gx-lt')){ const im = $('.gx-limp', fila); im.focus(); im.select(); }
    else if(t.classList.contains('gx-limp')){
      this.formatoImp(t);
      let sig = fila.nextElementSibling;
      if(!sig || $('.gx-lt', sig).value.trim()){
        const m = $('.gx-lt', fila).value.match(this.RE_NUM), pre = m ? (+m[1] + 1) + '. ' : this.RE_PTO.test($('.gx-lt', fila).value) ? '• ' : '';   // la lista sigue
        fila.insertAdjacentHTML('afterend', this.filaEd({ t:pre, imp:null, ok:false })); sig = fila.nextElementSibling;
      }
      this.irA($('.gx-lt', sig));
    }
  },
  irA(t){ if(!t) return; t.focus(); t.setSelectionRange(t.value.length, t.value.length); this._focoEl = t; this.auto(t); },
  async tachar(id, k){
    const x = this.uno(id); if(!x) return;
    if(k === 't') x.okTit = !x.okTit;
    else { const ls = this.lineasDe(x).map(l => ({ ...l })), l = ls[+k]; if(!l) return; l.ok = !l.ok; x.lineas = ls; }
    await this.poner(x); this.pintar();
  },
  async marcar(id){
    await this.guardarEdicion();
    const x = this.uno(id); if(!x) return;
    x.ok = !x.ok; x.hecho = x.ok ? Date.now() : null; if(!x.ok) x.orden = Date.now();
    await this.poner(x); this.pintar();
  },
  /* La banderita: dos toques seguidos = cambia de color · mantener pulsada = toda la nota de ese color (otra vez = blanca) */
  banderaTap(id){
    if(this._bLong) return;
    const ahora = Date.now();
    clearTimeout(this._bHint);
    if(this._bTap && this._bTap.id === id && ahora - this._bTap.t < 450){ this._bTap = null; this.bandera(id, 'color'); return; }
    this._bTap = { id, t:ahora };
    this._bHint = setTimeout(() => { this._bTap = null; toast('🚩 Dos toques: cambiar el color · Mantener pulsada: toda la nota de color', null, null, 2400); }, 470);
  },
  async bandera(id, que){
    const x = this.uno(id); if(!x) return;
    this.aplicar(x, this.leerCampos(x));
    let msg;
    if(que === 'fondo'){
      if(!x.color){ x.fondo = false; msg = 'Primero elige un color (dos toques en la banderita)'; }
      else { x.fondo = !x.fondo; msg = x.fondo ? '🎨 Toda la nota en ' + this.color(x.color)[1].toLowerCase() : 'La nota vuelve a ser blanca'; }
    } else {
      const i = this.COLORES.findIndex(c => c[0] === (x.color || '')); x.color = this.COLORES[(i + 1) % this.COLORES.length][0];
      if(!x.color) x.fondo = false;
      msg = x.color ? '🚩 ' + this.color(x.color)[1] : 'Sin color';
    }
    await this.poner(x);
    const c = this.color(x.color), b = $('#gxCuerpo .gx-band'); if(b){ b.innerHTML = this.svgBandera(c[2]); b.style.setProperty('--bc', c[2]); }
    const f = $(`#gxCuerpo .gx-fila[data-id="${id}"]`); if(f){ f.classList.toggle('gx-fondo', !!(x.fondo && x.color)); f.style.setProperty('--gxf', c[2]); }
    this.pintarCols();
    toast(msg, null, null, que === 'fondo' ? 1600 : 1000);
  },
  // poner un texto donde está el cursor
  foco(){ const f = this._focoEl; return f && document.body.contains(f) ? f : ($('#gxLineas .gx-lt') || $('#gxT1')); },
  insertar(txt){
    const t = this.foco(); if(!t) return;
    const a = t.selectionStart != null ? t.selectionStart : t.value.length, b = t.selectionEnd != null ? t.selectionEnd : a;
    t.value = t.value.slice(0, a) + txt + t.value.slice(b); t.focus(); t.setSelectionRange(a + txt.length, a + txt.length); if(t.tagName === 'TEXTAREA') this.auto(t);
  },
  ponerHoy(){ const d = new Date(); this.insertar(String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getFullYear()).slice(2)); },
  iconos(){
    const t = this.foco(); const sel = t ? [t.selectionStart, t.selectionEnd] : null;
    const hj = hojaMio('✅ Poner un icono', `<div class="es-iconos">${Escribir.ICONOS.map(i => `<button data-i="${i}">${i}</button>`).join('')}</div><button class="sh-btn" data-a="x">Cerrar</button>`, 'es-ico');
    hj.onclick = ev => { const b = ev.target.closest('[data-i],[data-a]'); if(!b) return;
      if(b.dataset.i){ const t2 = this.foco(); if(t2 && sel) t2.setSelectionRange(sel[0], sel[1]); this.insertar(b.dataset.i); const t3 = this.foco(); if(t3){ sel[0] = sel[1] = t3.selectionStart; t3.blur(); } toast(b.dataset.i + ' puesto', null, null, 900); }
      else { cerrarHojaMio(); const t4 = this.foco(); if(t4) t4.focus(); } };
  },
  // Lista en las líneas de debajo: 1.ª vez números (1. 2. 3.), 2.ª vez puntos (•), 3.ª vez nada
  RE_NUM: /^(\d+)\.\s/, RE_PTO: /^•\s/,
  lista(){
    const ts = $$('#gxLineas .gx-lt').filter(t => t.value.replace(this.RE_NUM, '').replace(this.RE_PTO, '').trim());
    if(!ts.length){ toast('Escribe primero alguna línea debajo'); return; }
    const modo = ts.every(t => this.RE_NUM.test(t.value)) ? 'pto' : ts.every(t => this.RE_PTO.test(t.value)) ? 'nada' : 'num';
    ts.forEach((t, i) => { const l = t.value.replace(this.RE_NUM, '').replace(this.RE_PTO, ''); t.value = modo === 'num' ? (i + 1) + '. ' + l : modo === 'pto' ? '• ' + l : l; this.auto(t); });
    const f = this.foco(); if(f) f.focus();
    toast(modo === 'num' ? '1. 2. 3. Lista con números' : modo === 'pto' ? '• Lista con puntos' : 'Sin lista', null, null, 1100);
  },
  async foto(id){
    const x = this.uno(id); if(!x) return; this.aplicar(x, this.leerCampos(x));
    const fs = await elegirFotos(false, true); if(!fs.length) return;
    toast('📷 Guardando foto…');
    for(const f of fs){ try{ const fid = await this.ponerFoto(await aligerarImg(f, 1400, .75)); x.fotos = [...(x.fotos || []), fid]; }catch(e){ toast('⚠️ No se ha podido añadir esa imagen'); } }
    await this.poner(x); this.pintar();
  },
  async quitarFoto(id, f){
    const x = this.uno(id); if(!x) return; this.aplicar(x, this.leerCampos(x));
    if(!await confirmarMio('Borrar foto', '¿Seguro que quieres borrar esta foto de la nota?', 'Borrar')){ return; }
    x.fotos = (x.fotos || []).filter(o => o !== f); await this.poner(x); await Mio.quitarFotos([f]); this.pintar();
  },
  async borrar(id){
    if(this.editando === id) this.editando = null;
    const x = this.uno(id); if(!x) return;
    await this._quitar(id); this.pintarCols();
    toast('🗑 Nota eliminada', 'Deshacer', async () => { await this._poner(x.id, x); this.pintar(); toast('↩️ La nota vuelve a estar'); }, 5000);
    setTimeout(() => { if(!this.uno(id)) Mio.quitarFotos(x.fotos || []); }, 7000);
    setTimeout(() => this.pintar(), 260);
  },
  async renombrar(){
    const i = $('#gxTit'), n = i.value.trim() || 'Gastos'; i.value = n;
    if(n === this.nombre()) return;
    const m = this.meta(); m.nombre = n; await this._poner(m.id, m);
    this.pintarBoton(); toast('✏️ La lista se llama «' + n + '»', null, null, 1500);
  },
  pintarBoton(){ const b = $('#tkGastos'); if(b) b.innerHTML = `${this.cifrado() ? '🔒' : '💶'} <span>${esc(this.nombre())}</span>`; },

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
      else if(d.tachar !== undefined) this.tachar(id, d.tachar);
      else if('etick' in d){ b.classList.toggle('on'); b.textContent = b.classList.contains('on') ? '✓' : ''; b.closest('.gx-lrow, .gx-erow').classList.toggle('tach', b.classList.contains('on')); }
      else if('editar' in d){ await this.guardarEdicion(); this.editar(id); }
      else if('bandera' in d) this.banderaTap(id);
      else if('intro' in d){ const f = this.foco(); if(f) this.teclas({ key:'Enter', target:f, preventDefault(){} }); }
      else if('foto' in d) this.foto(id);
      else if('hoy' in d) this.ponerHoy();
      else if(d.ins) this.insertar(d.ins);
      else if('iconos' in d) this.iconos();
      else if('lista' in d) this.lista();
      else if(d.tab){ if(this._noClick) return; await this.guardarEdicion(); if(d.tab === this.tabActiva()) this.opcionesTab(d.tab); else { lsSet('ph3-gx-tab', d.tab); this.pintar(); } }
      else if('tabnueva' in d) this.nuevaTab();
      else if(d.quitarfoto) this.quitarFoto(id, d.quitarfoto);
      else if('listo' in d){ await this.guardarEdicion(); this.pintar(); }
    });
    // tocar fuera de la nota que se edita: se guarda
    v.addEventListener('pointerdown', async e => { if(this.editando && !e.target.closest('.gx-fila.ed, .gx-mas, [data-gxcerrar]') && !$('#mioVelo')){ await this.guardarEdicion(); if(!e.target.closest('.gx-fila, #gxCols, #gxQ, #gxTabs')) this.pintar(); } });
    c.addEventListener('input', e => { const t = e.target; if(t.tagName === 'TEXTAREA'){ if(/\n/.test(t.value)) t.value = t.value.replace(/\n/g, ' '); this.auto(t); }
      if(t.id === 'gxImp' || t.classList.contains('gx-limp')){ const tk = t.closest('.gx-lrow, .gx-erow').querySelector('.gx-tick'); if(tk) tk.hidden = this.numero(t.value) == null; } });
    c.addEventListener('focusin', e => { if(e.target.closest('.gx-fila.ed') && /TEXTAREA|INPUT/.test(e.target.tagName)) this._focoEl = e.target; });
    c.addEventListener('focusout', e => { if(e.target.id === 'gxImp' || e.target.classList.contains('gx-limp')) this.formatoImp(e.target); });
    c.addEventListener('keydown', e => this.teclas(e));
    // mantener pulsada la banderita: toda la nota de color
    const finLargo = () => { clearTimeout(this._bLT); if(this._bLong) setTimeout(() => { this._bLong = false; }, 450); };
    c.addEventListener('pointerdown', e => { const b = e.target.closest('.gx-band'); if(!b) return; const id = b.closest('.gx-fila').dataset.id; clearTimeout(this._bLT);
      this._bLT = setTimeout(() => { this._bLong = true; this._bTap = null; clearTimeout(this._bHint); try{ navigator.vibrate && navigator.vibrate(15); }catch(x){} this.bandera(id, 'fondo'); }, 520); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => c.addEventListener(ev, e => { if(e.target.closest && e.target.closest('.gx-band')) finLargo(); }));
    c.addEventListener('contextmenu', e => { if(e.target.closest('.gx-band')) e.preventDefault(); });
    // los botones de debajo de la nota no quitan el cursor del texto (así el teclado no se esconde)
    c.addEventListener('pointerdown', e => { const b = e.target.closest('.gx-herr button'); if(b && !b.matches('[data-listo],[data-foto]')) e.preventDefault(); });
    c.addEventListener('mousedown', e => { if(e.target.closest('.gx-herr button')) e.preventDefault(); });
    deslizarBorrar(c, id => this.borrar(id));
    const q = $('#gxQ', v); q.oninput = () => { this.q = q.value; this.pintar(); };
    const t = $('#gxTit', v); t.onchange = () => this.renombrar(); t.onkeydown = e => { if(e.key === 'Enter') t.blur(); };
    document.addEventListener('keydown', e => { if(e.key === 'Escape' && this.abierto() && !$('#mioPop') && !$('.vfg')) this.cerrar(); });
    Mio.al('gastos', async () => { if(this.clave || this.cifrado()) await this.sync(); this.pintarBoton(); if(this.abierto() && !this.editando) this.pintar(); });
    Mio.al('tickets', () => this.migrar());
    Mio.al('fotos', async () => { if(this.clave) await this.sync(); if(this.abierto() && !this.editando) this.pintar(); });
  },
  // antes, las notas de Gastos se guardaban con los Tickets: se pasan a su propio apartado (con sus fotos)
  async migrar(){
    if(this._migrando || this.cerrado()) return;
    const viejas = Mio.todos('tickets').filter(x => x.tipo === 'gasto' || x.tipo === 'gastos-meta'); if(!viejas.length) return;
    this._migrando = true;
    try{
      for(const x of viejas){
        const ya = this._uno(x.id);
        if(x.tipo === 'gastos-meta' && ya){ /* ya hay una lista: se queda la nueva */ }
        else if(!ya || (x.cambiado || 0) > (ya.cambiado || 0)) await this._poner(x.id, x);
        for(const f of x.fotos || []){ const fo = Mio.uno('fotos', f); if(fo && fo.de !== 'gastos') await Mio.poner('fotos', f, { ...fo, de:'gastos' }); }
        await Mio.quitar('tickets', x.id);
      }
    }catch(e){ console.warn('gastos migrar', e); }
    this._migrando = false; this.pintarBoton(); if(this.abierto() && !this.editando) this.pintar();
  },
  iniciar(){
    setTimeout(() => this.migrar(), 2500);
    const caja = $('#vTickets .tk-buscar'); if(!caja || $('#tkGastos')) return;
    const b = document.createElement('button'); b.id = 'tkGastos'; b.className = 'tk-gastos-b'; b.title = 'Lista de gastos';
    caja.insertBefore(b, $('#tkTema')); b.onclick = () => this.abrir();
    this.pintarBoton();
    if(!$('#gx')) Mio.al('gastos', () => { if(!$('#gx')) this.pintarBoton(); });   // al llegar los datos (cifrada o no)
  }
};
