/* PorHacer3 · «📕 PDF»: leer un PDF, escribir encima (dedo o Apple Pencil), subrayar con marcador
   (amarillo, verde, rosa, azul), borrar, deshacer, guardarlo con las marcas y traducir una palabra tocándola.
   Las marcas se guardan en este aparato (por nombre y tamaño del PDF): si vuelves a abrir el mismo PDF, siguen ahí.
   Las marcas se guardan como trazos (no como foto), con las medidas de 0 a 1 de cada hoja: así se ven bien con cualquier zoom. */

const VisorPdf = {
  doc:null, nombre:'', clave:'', paginas:[], trazos:{}, deshacer:[], zoom:1,
  herr:'mano', color:'#1c1c1e', soloLapiz:false, idioma:'es',
  BOLIS:[['#1c1c1e','Negro'],['#e5201c','Rojo'],['#2f80ed','Azul'],['#3fae5a','Verde']],
  MARCAS:[['#ffe14d','Amarillo'],['#7fe07f','Verde'],['#ff8fc7','Rosa'],['#7cc7ff','Azul']],
  IDIOMAS:[['es','Español'],['ca','Català'],['en','English'],['fr','Français'],['de','Deutsch'],['it','Italiano'],['pt','Português']],

  abrir(){
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.pdf,application/pdf'; i.style.display = 'none';
    i.onchange = () => { const f = i.files[0]; i.remove(); if(f) this.cargar(f); };
    document.body.appendChild(i); i.click();
  },
  async cargar(f){
    toast('📕 Abriendo el PDF…', null, null, 15000);
    try{
      const L = await Manual.lib();
      const datos = new Uint8Array(await f.arrayBuffer());
      this.doc = await L.getDocument({ data:datos }).promise;
      this.nombre = (f.name || 'documento.pdf').replace(/\.pdf$/i, ''); this.clave = 'pdfm:' + f.name + ':' + f.size;
      this.trazos = this.leerMarcas(); this.deshacer = []; this.zoom = 1;
      this.soloLapiz = lsGet('ph3-pdf-lapiz') === '1'; this.idioma = lsGet('ph3-pdf-idioma') || 'es';
      $('#toast').classList.remove('ver');
      this.pantalla();
    }catch(e){ console.warn(e); toast('⚠️ No se ha podido abrir este PDF'); }
  },
  leerMarcas(){ try{ return (JSON.parse(lsGet('ph3-pdf-marcas') || '{}')[this.clave]) || {}; }catch(e){ return {}; } },
  guardarMarcas(){
    clearTimeout(this._tg); this._tg = setTimeout(() => {
      try{ const todo = JSON.parse(lsGet('ph3-pdf-marcas') || '{}'), hay = Object.values(this.trazos).some(l => l && l.length);
        if(hay){ todo[this.clave] = this.trazos; todo[this.clave]._t = Date.now(); } else delete todo[this.clave];
        // como mucho, las marcas de los 12 últimos PDF
        const ks = Object.keys(todo).sort((a, b) => ((todo[b] || {})._t || 0) - ((todo[a] || {})._t || 0)); ks.slice(12).forEach(k => delete todo[k]);
        localStorage.setItem('ph3-pdf-marcas', JSON.stringify(todo));
      }catch(e){ toast('⚠️ No caben más marcas en este aparato'); }
    }, 500);
  },

  /* ---------- Pantalla ---------- */
  pantalla(){
    this.cerrar(true);
    const v = document.createElement('div'); v.id = 'vpdf'; v.className = 'vpdf';
    v.innerHTML = `<div class="vpdf-top">
        <button class="vpdf-b" data-a="cerrar" aria-label="Cerrar">✕</button>
        <b class="vpdf-nom">${esc(this.nombre)}</b>
        <button class="vpdf-b" data-a="abrir" aria-label="Abrir otro PDF">📂</button>
        <button class="vpdf-b vpdf-g" data-a="guardar">💾 Guardar con mis marcas</button>
      </div>
      <div class="vpdf-herr" id="vpdfHerr">
        <button data-h="mano" title="Leer y mover">✋</button>
        <button data-h="boli" title="Escribir">✏️</button>
        <button data-h="marca" title="Marcador">🖍️</button>
        <button data-h="goma" title="Borrar">🧽</button>
        <button data-h="traducir" title="Traducir una palabra">🔤</button>
        <span class="vpdf-sep"></span>
        <button data-a="atras" title="Deshacer">↶</button>
        <button data-a="menos" title="Más pequeño">－</button>
        <button data-a="mas" title="Más grande">＋</button>
        <button data-a="z100" class="vpdf-100" title="Volver al tamaño normal">↺ 100%</button>
      </div>
      <div class="vpdf-cols" id="vpdfCols"></div>
      <div class="vpdf-zona" id="vpdfZona"><div class="vpdf-hojas" id="vpdfHojas"></div></div>
      <div class="vpdf-pie" id="vpdfPie"></div>`;
    document.body.appendChild(v);
    v.addEventListener('click', e => this.click(e));
    this.zona = $('#vpdfZona', v); this.hojas = $('#vpdfHojas', v);
    this.zona.addEventListener('scroll', () => { this.pintarPie(); this.programarRender(); }, { passive:true });
    this.enlazarPellizco();
    this._tecla = e => { if(e.key === 'Escape') this.cerrar(); if((e.metaKey || e.ctrlKey) && e.key === 'z'){ e.preventDefault(); this.atras(); } };
    addEventListener('keydown', this._tecla);
    this._res = () => { clearTimeout(this._tr); this._tr = setTimeout(() => this.montar(), 250); }; addEventListener('resize', this._res);
    this.ponerHerr(this.herr === 'traducir' ? 'mano' : this.herr);
    this.montar();
  },
  cerrar(silencio){
    const v = $('#vpdf'); if(!v) return;
    if(this._tecla) removeEventListener('keydown', this._tecla); if(this._res) removeEventListener('resize', this._res);
    this.quitarBurbuja(); v.remove(); this.paginas = [];
    if(!silencio && Object.values(this.trazos).some(l => l && l.length)) toast('🖍️ Tus marcas quedan guardadas: si vuelves a abrir este PDF, siguen ahí', null, null, 3500);
  },
  ponerHerr(h){
    this.herr = h; const v = $('#vpdf'); if(!v) return;
    $$('#vpdfHerr [data-h]', v).forEach(b => b.classList.toggle('on', b.dataset.h === h));
    v.dataset.herr = h;
    if(h === 'boli' && !this.BOLIS.some(c => c[0] === this.color)) this.color = this.BOLIS[0][0];
    if(h === 'marca' && !this.MARCAS.some(c => c[0] === this.color)) this.color = this.MARCAS[0][0];
    const cols = $('#vpdfCols', v);
    cols.innerHTML = h === 'boli' || h === 'marca' ? (h === 'boli' ? this.BOLIS : this.MARCAS).map(([c, n]) => `<button data-col="${c}" class="${c === this.color ? 'on' : ''} ${h === 'marca' ? 'es-marc' : ''}" style="--c:${c}" title="${n}"><i></i><span>${n}</span></button>`).join('')
        + `<label class="vpdf-lapiz"><input type="checkbox" id="vpdfLapiz" ${this.soloLapiz ? 'checked' : ''}> ✍️ Solo el lápiz escribe <small>(con el dedo se mueve)</small></label>`
      : h === 'traducir' ? `<span class="vpdf-ayu">🔤 Toca una palabra para traducirla al</span><select id="vpdfIdi">${this.IDIOMAS.map(([k, n]) => `<option value="${k}" ${k === this.idioma ? 'selected' : ''}>${n}</option>`).join('')}</select>`
      : h === 'goma' ? '<span class="vpdf-ayu">🧽 Pasa el dedo (o el lápiz) por encima de lo que quieras borrar</span>'
      : '<span class="vpdf-ayu">✋ Mueve y lee. Elige ✏️ para escribir, 🖍️ para subrayar o 🔤 para traducir</span>';
    const lp = $('#vpdfLapiz', v); if(lp) lp.onchange = () => { this.soloLapiz = lp.checked; lsSet('ph3-pdf-lapiz', lp.checked ? '1' : null); };
    const idi = $('#vpdfIdi', v); if(idi) idi.onchange = () => { this.idioma = idi.value; lsSet('ph3-pdf-idioma', idi.value); };
    if(h !== 'traducir') this.quitarBurbuja();
  },
  click(e){
    const b = e.target.closest('button'); if(!b) return; const d = b.dataset;
    if(d.h) this.ponerHerr(d.h);
    else if(d.col){ this.color = d.col; $$('#vpdfCols [data-col]').forEach(x => x.classList.toggle('on', x === b)); }
    else if(d.a === 'cerrar') this.cerrar();
    else if(d.a === 'abrir') this.abrir();
    else if(d.a === 'guardar') this.exportar();
    else if(d.a === 'atras') this.atras();
    else if(d.a === 'mas' || d.a === 'menos') this.ponerZoom(this.zoom + (d.a === 'mas' ? 0.25 : -0.25));
    else if(d.a === 'z100') this.ponerZoom(1, null, null, true);
  },
  /* ---------- Zoom: con ＋/－, con dos dedos (iPad y móvil) o con Ctrl + rueda; «↺ 100%» vuelve al tamaño normal ---------- */
  ZMIN:0.5, ZMAX:4,
  // fx, fy: el punto de la pantalla que se queda quieto (si no, el centro)
  async ponerZoom(z, fx, fy, aviso){
    z = Math.max(this.ZMIN, Math.min(this.ZMAX, +(+z).toFixed(2)));
    const zr = this.zona.getBoundingClientRect(); if(fx == null){ fx = zr.left + zr.width / 2; fy = zr.top + zr.height / 2; }
    const r0 = this.hojas.getBoundingClientRect(), px = (fx - r0.left) / (r0.width || 1), py = (fy - r0.top) / (r0.height || 1);
    this.hojas.style.transform = ''; this.hojas.style.transformOrigin = '';
    if(z === this.zoom){ return; }
    this.zoom = z; await this.montar();
    const r1 = this.hojas.getBoundingClientRect();
    this.zona.scrollLeft += r1.left + px * r1.width - fx; this.zona.scrollTop += r1.top + py * r1.height - fy;
    this.pintarPie(); this.programarRender(true);
    $$('#vpdf .vpdf-100').forEach(b => b.classList.toggle('on', this.zoom !== 1));
    toast(aviso ? '↺ Tamaño normal' : '🔍 ' + Math.round(this.zoom * 100) + ' %', null, null, 800);
  },
  enlazarPellizco(){
    const Z = this.zona; let P = null;
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY), mid = t => [(t[0].clientX + t[1].clientX) / 2, (t[0].clientY + t[1].clientY) / 2];
    Z.addEventListener('touchstart', e => {
      if(e.touches.length !== 2) return;
      const r = this.hojas.getBoundingClientRect(), [mx, my] = mid(e.touches);
      P = { d0:dist(e.touches), m0:[mx, my], s:1, ox:mx - r.left, oy:my - r.top, mx, my };
      this._pellizco = true; this.quitarBurbuja && this.quitarBurbuja();
      this.hojas.style.transformOrigin = P.ox + 'px ' + P.oy + 'px';
    }, { passive:true });
    Z.addEventListener('touchmove', e => {
      if(!P || e.touches.length < 2) return; e.preventDefault();
      const [mx, my] = mid(e.touches); P.mx = mx; P.my = my;
      P.s = Math.max(this.ZMIN / this.zoom, Math.min(this.ZMAX / this.zoom, dist(e.touches) / P.d0));
      this.hojas.style.transform = `translate(${mx - P.m0[0]}px, ${my - P.m0[1]}px) scale(${P.s})`;
    }, { passive:false });
    const fin = e => {
      if(!P || e.touches.length >= 2) return; const p = P; P = null;
      setTimeout(() => { this._pellizco = false; }, 250);
      if(Math.abs(p.s - 1) < 0.04){ this.hojas.style.transform = ''; return; }
      // el punto que estaba entre los dedos se queda entre los dedos
      const r = this.hojas.getBoundingClientRect(), fx = p.mx, fy = p.my;
      const px = (fx - r.left) / r.width, py = (fy - r.top) / r.height, z = Math.max(this.ZMIN, Math.min(this.ZMAX, +(this.zoom * p.s).toFixed(2)));
      this.hojas.style.transform = ''; this.hojas.style.transformOrigin = '';
      this.zoom = z; this.montar().then(() => {
        const r1 = this.hojas.getBoundingClientRect(); this.zona.scrollLeft += r1.left + px * r1.width - fx; this.zona.scrollTop += r1.top + py * r1.height - fy;
        this.pintarPie(); this.programarRender(true); $$('#vpdf .vpdf-100').forEach(b => b.classList.toggle('on', this.zoom !== 1)); });
    };
    Z.addEventListener('touchend', fin); Z.addEventListener('touchcancel', fin);
    ['gesturestart', 'gesturechange'].forEach(t => Z.addEventListener(t, e => e.preventDefault()));   // que el iPad no amplíe toda la pantalla
    // Ctrl + rueda (o pellizcar en el trackpad del ordenador)
    Z.addEventListener('wheel', e => { if(!e.ctrlKey && !e.metaKey) return; e.preventDefault();
      this._wz = (this._wz || this.zoom) * Math.exp(-e.deltaY * 0.01); this._wz = Math.max(this.ZMIN, Math.min(this.ZMAX, this._wz));
      const r = this.hojas.getBoundingClientRect(); this.hojas.style.transformOrigin = (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px'; this.hojas.style.transform = `scale(${this._wz / this.zoom})`;
      clearTimeout(this._wt); const fx = e.clientX, fy = e.clientY;
      this._wt = setTimeout(() => { const z = this._wz; this._wz = null;
        const r2 = this.hojas.getBoundingClientRect(), px = (fx - r2.left) / r2.width, py = (fy - r2.top) / r2.height;
        this.hojas.style.transform = ''; this.hojas.style.transformOrigin = ''; this.zoom = +z.toFixed(2);
        this.montar().then(() => { const r1 = this.hojas.getBoundingClientRect(); this.zona.scrollLeft += r1.left + px * r1.width - fx; this.zona.scrollTop += r1.top + py * r1.height - fy; this.pintarPie(); this.programarRender(true); $$('#vpdf .vpdf-100').forEach(b => b.classList.toggle('on', this.zoom !== 1)); });
      }, 180); }, { passive:false });
  },

  /* ---------- Hojas (se dibujan solo las que se ven, para no gastar memoria) ---------- */
  async montar(){
    if(!this.doc || !$('#vpdf')) return;
    const n = this.doc.numPages, anchoZona = this.zona.clientWidth - 16, W = Math.round(Math.min(anchoZona, 900) * this.zoom);
    if(!this._tam){ const p1 = await this.doc.getPage(1), vp = p1.getViewport({ scale:1 }); this._tam = vp.height / vp.width; }
    this.hojas.style.width = W + 'px';
    this.hojas.innerHTML = Array.from({ length:n }, (_, i) => `<div class="vpdf-hoja" data-p="${i + 1}" style="width:${W}px;height:${Math.round(W * this._tam)}px"><canvas class="vpdf-pdf"></canvas><div class="vpdf-txt"></div><canvas class="vpdf-dib"></canvas><span class="vpdf-num">${i + 1}</span></div>`).join('');
    this.paginas = $$('.vpdf-hoja', this.hojas).map(h => ({ h, n:+h.dataset.p, hecho:false }));
    this.paginas.forEach(pg => this.enlazarDibujo(pg));
    this.pintarPie(); this.programarRender(true);
  },
  programarRender(ya){ clearTimeout(this._trr); this._trr = setTimeout(() => this.renderVisibles(), ya ? 0 : 120); },
  async renderVisibles(){
    const z = this.zona.getBoundingClientRect(), margen = z.height * 1.2;
    for(const pg of this.paginas){
      const r = pg.h.getBoundingClientRect(), cerca = r.bottom > z.top - margen && r.top < z.bottom + margen;
      if(cerca && !pg.hecho){ pg.hecho = true; this.renderPagina(pg); }
      else if(!cerca && pg.hecho && Math.abs(r.top - z.top) > margen * 3){ pg.hecho = false; const c = $('.vpdf-pdf', pg.h); c.width = c.height = 0; $('.vpdf-txt', pg.h).innerHTML = ''; }
    }
  },
  async renderPagina(pg){
    try{
      const page = await this.doc.getPage(pg.n), W = pg.h.clientWidth, base = page.getViewport({ scale:1 }), sc = W / base.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5), vp = page.getViewport({ scale:sc * dpr });
      const c = $('.vpdf-pdf', pg.h); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      await page.render({ canvasContext:c.getContext('2d'), viewport:vp }).promise;
      this.pintarTrazos(pg);
      // capa de texto (invisible) para poder tocar una palabra y traducirla
      const tc = await page.getTextContent(), vp1 = page.getViewport({ scale:sc }), capa = $('.vpdf-txt', pg.h);
      const L = window.pdfjsLib, frag = [];
      for(const it of tc.items){
        if(!it.str || !it.str.trim()) continue;
        const t = L.Util.transform(vp1.transform, it.transform), alto = Math.hypot(t[2], t[3]), ancho = (it.width || 0) * sc;
        frag.push(`<span style="left:${t[4].toFixed(1)}px;top:${(t[5] - alto).toFixed(1)}px;font-size:${alto.toFixed(1)}px;--w:${ancho.toFixed(1)}px">${esc(it.str)}</span>`);
      }
      capa.innerHTML = frag.join('');
      // cada trozo de texto, del mismo ancho que en el PDF (para que el dedo caiga en la palabra buena)
      $$('span', capa).forEach(s => { const w = parseFloat(s.style.getPropertyValue('--w')), real = s.getBoundingClientRect().width; if(w && real) s.style.transform = `scaleX(${(w / real).toFixed(3)})`; });
    }catch(e){ console.warn('pdf página', e); }
  },
  pintarPie(){
    const pie = $('#vpdfPie'); if(!pie || !this.paginas.length) return;
    const z = this.zona.getBoundingClientRect(), mitad = z.top + z.height / 2;
    let act = 1; this.paginas.forEach(pg => { if(pg.h.getBoundingClientRect().top <= mitad) act = pg.n; });
    pie.textContent = `Hoja ${act} de ${this.paginas.length} · ${Math.round(this.zoom * 100)} %`;
  },

  /* ---------- Dibujar: boli, marcador y goma ---------- */
  lienzo(pg){
    const c = $('.vpdf-dib', pg.h), W = pg.h.clientWidth, H = pg.h.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    if(c.width !== Math.round(W * dpr)){ c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return { x, W, H };
  },
  trazar(x, t, W, H){
    if(!t.p || !t.p.length) return;
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
    if(t.h === 'marca'){ x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.45; x.strokeStyle = t.c; x.lineWidth = t.g * W; x.lineCap = 'butt'; }
    else { x.strokeStyle = t.c; x.lineWidth = t.g * W; }
    x.beginPath(); x.moveTo(t.p[0][0] * W, t.p[0][1] * H);
    if(t.p.length === 1) x.lineTo(t.p[0][0] * W + 0.1, t.p[0][1] * H);
    for(let i = 1; i < t.p.length - 1; i++){ const a = t.p[i], b = t.p[i + 1]; x.quadraticCurveTo(a[0] * W, a[1] * H, (a[0] + b[0]) / 2 * W, (a[1] + b[1]) / 2 * H); }
    if(t.p.length > 1){ const u = t.p[t.p.length - 1]; x.lineTo(u[0] * W, u[1] * H); }
    x.stroke(); x.restore();
  },
  pintarTrazos(pg, extra){
    const { x, W, H } = this.lienzo(pg); x.clearRect(0, 0, W, H);
    (this.trazos[pg.n] || []).forEach(t => this.trazar(x, t, W, H)); if(extra) this.trazar(x, extra, W, H);
  },
  enlazarDibujo(pg){
    const c = $('.vpdf-dib', pg.h); let T = null, pan = null;
    const punto = e => { const r = c.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]; };
    c.addEventListener('pointerdown', e => {
      const h = this.herr; if(!['boli', 'marca', 'goma'].includes(h) || this._pellizco) return;
      if(this.soloLapiz && e.pointerType === 'touch'){ pan = { y:e.clientY, x:e.clientX, st:this.zona.scrollTop, sl:this.zona.scrollLeft, id:e.pointerId }; return; }   // con el dedo se mueve
      e.preventDefault(); try{ c.setPointerCapture(e.pointerId); }catch(_){}
      if(h === 'goma'){ T = { goma:true }; this.borrarEn(pg, punto(e)); return; }
      const W = pg.h.clientWidth, grosor = h === 'marca' ? 16 * this.zoom : (e.pointerType === 'pen' ? 2.2 : 2.6) * this.zoom;
      T = { h, c:this.color, g:grosor / W, p:[punto(e)] };
    });
    c.addEventListener('pointermove', e => {
      if(this._pellizco){ pan = null; if(T){ T = null; this.pintarTrazos(pg); } return; }
      if(pan && e.pointerId === pan.id){ this.zona.scrollTop = pan.st - (e.clientY - pan.y); this.zona.scrollLeft = pan.sl - (e.clientX - pan.x); return; }
      if(!T) return; e.preventDefault();
      if(T.goma){ this.borrarEn(pg, punto(e)); return; }
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for(const ev of evs){ const q = punto(ev), u = T.p[T.p.length - 1]; if(Math.hypot(q[0] - u[0], q[1] - u[1]) > 0.0015) T.p.push(q); }
      if(T.h === 'marca' && T.p.length > 2 && Math.abs(T.p[T.p.length - 1][1] - T.p[0][1]) < 0.012) T.p = T.p.map(q => [q[0], T.p[0][1]]);   // el marcador va recto si subrayas en línea
      this.pintarTrazos(pg, T);
    });
    const fin = () => {
      pan = null; if(!T) return; const t = T; T = null; if(t.goma) return;
      t.p = t.p.map(q => [+q[0].toFixed(4), +q[1].toFixed(4)]);
      (this.trazos[pg.n] = this.trazos[pg.n] || []).push(t); this.deshacer.push({ tipo:'add', n:pg.n, t });
      this.pintarTrazos(pg); this.guardarMarcas();
    };
    c.addEventListener('pointerup', fin); c.addEventListener('pointercancel', fin);
  },
  borrarEn(pg, q){
    const ls = this.trazos[pg.n] || [], W = pg.h.clientWidth, H = pg.h.clientHeight, radio = 14;
    const quita = ls.filter(t => t.p.some(p => Math.hypot((p[0] - q[0]) * W, (p[1] - q[1]) * H) < radio + (t.g * W) / 2));
    if(!quita.length) return;
    this.trazos[pg.n] = ls.filter(t => !quita.includes(t)); quita.forEach(t => this.deshacer.push({ tipo:'del', n:pg.n, t }));
    this.pintarTrazos(pg); this.guardarMarcas();
  },
  atras(){
    const u = this.deshacer.pop(); if(!u){ toast('No hay nada que deshacer', null, null, 1000); return; }
    const ls = this.trazos[u.n] = this.trazos[u.n] || [];
    if(u.tipo === 'add'){ const i = ls.indexOf(u.t); if(i >= 0) ls.splice(i, 1); } else ls.push(u.t);
    const pg = this.paginas.find(p => p.n === u.n); if(pg) this.pintarTrazos(pg); this.guardarMarcas();
  },

  /* ---------- Traducir una palabra ---------- */
  palabraEn(x, y){
    let nodo = null, off = 0;
    if(document.caretRangeFromPoint){ const r = document.caretRangeFromPoint(x, y); if(r){ nodo = r.startContainer; off = r.startOffset; } }
    else if(document.caretPositionFromPoint){ const p = document.caretPositionFromPoint(x, y); if(p){ nodo = p.offsetNode; off = p.offset; } }
    if(!nodo || nodo.nodeType !== 3 || !nodo.parentElement.closest('.vpdf-txt')) return null;
    const t = nodo.nodeValue, L = /[\p{L}\p{M}'’-]/u; let a = off, b = off;
    while(a > 0 && L.test(t[a - 1])) a--; while(b < t.length && L.test(t[b])) b++;
    const w = t.slice(a, b).replace(/^['’-]+|['’-]+$/g, ''); if(!w) return null;
    const r = document.createRange(); r.setStart(nodo, a); r.setEnd(nodo, b);
    return { w, rect:r.getBoundingClientRect(), frase:t };
  },
  async traducirTexto(txt, a){
    try{   // traductor de Google (sin clave)
      const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + a + '&dt=t&q=' + encodeURIComponent(txt));
      if(r.ok){ const j = await r.json(); const t = (j[0] || []).map(x => x[0]).join(''); if(t) return { t, de:j[2] || '' }; }
    }catch(e){}
    try{   // si no, MyMemory
      const r = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(txt) + '&langpair=' + (a === 'en' ? 'es' : 'en') + '|' + a);
      if(r.ok){ const j = await r.json(); const t = j && j.responseData && j.responseData.translatedText; if(t) return { t, de:'' }; }
    }catch(e){}
    return null;
  },
  async tocarPalabra(e){
    const p = this.palabraEn(e.clientX, e.clientY);
    if(!p){ this.quitarBurbuja(); toast('Toca encima de una palabra. (Si el PDF es una foto escaneada, no tiene letras que se puedan leer.)', null, null, 2600); return; }
    const b = this.burbuja(p.rect, `<b class="vpb-w">${esc(p.w)}</b><span class="vpb-t">⏳ Traduciendo…</span>`);
    const res = await this.traducirTexto(p.w, this.idioma);
    if(!b.isConnected) return;
    const nomIdi = c => ({ en:'inglés', es:'español', ca:'catalán', fr:'francés', de:'alemán', it:'italiano', pt:'portugués' })[c] || c;
    b.innerHTML = res ? `<b class="vpb-w">${esc(p.w)}</b><span class="vpb-t">${esc(res.t)}</span>${res.de && res.de !== this.idioma ? `<small>del ${nomIdi(res.de)}</small>` : ''}<div class="vpb-b"><button data-oir="${esc(p.w)}" data-lang="${esc(res.de || 'en')}">🔊 Oír</button><button data-frase>Toda la frase</button></div>`
      : `<b class="vpb-w">${esc(p.w)}</b><span class="vpb-t">No se ha podido traducir. ¿Hay internet?</span>`;
    b.onclick = async ev => {
      const o = ev.target.closest('[data-oir]'); if(o){ try{ const u = new SpeechSynthesisUtterance(o.dataset.oir); u.lang = o.dataset.lang; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(er){} return; }
      if(ev.target.closest('[data-frase]')){ const t = $('.vpb-t', b); t.textContent = '⏳'; const r2 = await this.traducirTexto(p.frase, this.idioma); t.textContent = r2 ? r2.t : 'No se ha podido traducir.'; $('[data-frase]', b).remove(); }
    };
  },
  burbuja(rect, html){
    this.quitarBurbuja();
    const b = document.createElement('div'); b.className = 'vpdf-burbuja'; b.innerHTML = html; document.body.appendChild(b);
    const marca = document.createElement('div'); marca.className = 'vpdf-pal'; Object.assign(marca.style, { left:rect.left + 'px', top:rect.top + 'px', width:rect.width + 'px', height:rect.height + 'px' }); document.body.appendChild(marca);
    const bw = b.offsetWidth, bh = b.offsetHeight; let x = rect.left + rect.width / 2 - bw / 2, y = rect.top - bh - 10;
    x = Math.max(8, Math.min(innerWidth - bw - 8, x)); if(y < 60){ y = rect.bottom + 10; b.classList.add('abajo'); }
    b.style.left = x + 'px'; b.style.top = y + 'px'; this._burbuja = [b, marca];
    return b;
  },
  quitarBurbuja(){ (this._burbuja || []).forEach(x => x.remove()); this._burbuja = null; },

  /* ---------- Guardar el PDF con las marcas ---------- */
  async exportar(){
    if(!this.doc) return;
    toast('💾 Preparando el PDF con tus marcas…', null, null, 60000);
    try{
      if(!window.jspdf) await cargarScript('jspdf.min.js');
      const { jsPDF } = window.jspdf; let pdf = null; const hojas = [];
      for(let n = 1; n <= this.doc.numPages; n++){
        const page = await this.doc.getPage(n), b = page.getViewport({ scale:1 }), sc = Math.min(2, 1400 / b.width), vp = page.getViewport({ scale:sc });
        const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
        await page.render({ canvasContext:x, viewport:vp }).promise;
        (this.trazos[n] || []).forEach(t => this.trazar(x, t, c.width, c.height));
        const jpg = c.toDataURL('image/jpeg', 0.85), wmm = b.width * 25.4 / 72, hmm = b.height * 25.4 / 72, o = wmm > hmm ? 'l' : 'p';
        if(!pdf) pdf = new jsPDF({ unit:'mm', format:[wmm, hmm], orientation:o, compress:true }); else pdf.addPage([wmm, hmm], o);
        pdf.addImage(jpg, 'JPEG', 0, 0, wmm, hmm); if(n <= 40) hojas.push(jpg);
        c.width = c.height = 0;
      }
      $('#toast').classList.remove('ver');
      verPdf(hojas, pdf.output('blob'), this.nombre + ' (con marcas).pdf');
    }catch(e){ console.warn(e); toast('⚠️ No se ha podido preparar el PDF'); }
  },

  iniciar(){
    // tocar una palabra en modo «Traducir» (en la capa de texto)
    document.addEventListener('click', e => { if(this.herr !== 'traducir' || !$('#vpdf')) return; if(e.target.closest('.vpdf-burbuja')) return; if(e.target.closest('.vpdf-hoja')) this.tocarPalabra(e); else if(!e.target.closest('.vpdf-herr,.vpdf-cols,.vpdf-top')) this.quitarBurbuja(); });
    $('#vpdf') && this.cerrar(true);
  }
};
