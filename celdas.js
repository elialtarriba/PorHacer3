/* PorHacer3 · «Hoja de cálculo»: lo más sencillo de una hoja de cálculo.
   Celdas con números, texto o euros (con 0, 1 o 2 decimales) y 5 fórmulas: SUMA, RESTA, MULTIPLICAR, DIVIDIR y PROMEDIO.
   Para una fórmula: toca la celda, «Σ Fórmulas», elige una y toca o arrastra por las celdas; después ✓.
   También vale escribir a mano: =A1+B1*2, =SUMA(A1:A5), =RESTA(B1;B2)…
   Se guarda solo (en este aparato o en la nube, como Escribir). */

const Celdas = {
  id: null, sel:{ c:0, r:0 }, fin:{ c:0, r:0 }, ed:null, deshacer:[], _cache:null,
  FUN: {
    SUMA:{ t:'Suma', ic:'➕', d:'Suma todos los números', ej:'=SUMA(A1:A5)' },
    RESTA:{ t:'Resta', ic:'➖', d:'El primero menos los demás', ej:'=RESTA(A1;B1)' },
    MULTIPLICAR:{ t:'Multiplicar', ic:'✖️', d:'Multiplica todos los números', ej:'=MULTIPLICAR(A1;B1)' },
    DIVIDIR:{ t:'Dividir', ic:'➗', d:'El primero dividido entre los demás', ej:'=DIVIDIR(A1;B1)' },
    PROMEDIO:{ t:'Promedio', ic:'⚖️', d:'La media de los números', ej:'=PROMEDIO(A1:A5)' }
  },
  ALIAS: { SUM:'SUMA', SUMAR:'SUMA', RESTAR:'RESTA', PRODUCTO:'MULTIPLICAR', PRODUCT:'MULTIPLICAR', MULTIPLICA:'MULTIPLICAR', DIVIDE:'DIVIDIR', MEDIA:'PROMEDIO', AVERAGE:'PROMEDIO' },

  /* ---------- Datos ---------- */
  lista(){ try{ return JSON.parse(lsGet('ph3-hojas') || '[]') || []; }catch(e){ return []; } },
  ponerLista(l){ try{ localStorage.setItem('ph3-hojas', JSON.stringify(l)); }catch(e){ toast('⚠️ No cabe más en este aparato'); } if(typeof Guardar !== 'undefined' && Guardar.cambioHojas) Guardar.cambioHojas(); },
  actual(){ return this.lista().find(d => d.id === this.id) || null; },
  vacio(d){ return !d || (!Object.keys(d.c || {}).length && !(d.titulo || '').trim()); },
  nueva(){ const d = { id:nuevoId('h'), titulo:'', c:{}, cols:8, filas:30, creado:Date.now(), cambiado:Date.now() }; const l = this.lista(); l.push(d); this.ponerLista(l); this.id = d.id; this.D = d; return d; },
  tituloDe(d){ return (d.titulo || '').trim() || 'Hoja sin nombre'; },
  guardar(){
    if(!this.D) return; this.D.cambiado = Date.now(); this._cache = null;
    const l = this.lista(), i = l.findIndex(x => x.id === this.D.id); if(i < 0) l.push(this.D); else l[i] = this.D; this.ponerLista(l);
    const e = $('#ceEstado'); if(e){ e.textContent = '✓ Guardado'; }
    this.contar();
  },
  copia(){ this.deshacer.push(JSON.stringify({ c:this.D.c, cols:this.D.cols, filas:this.D.filas })); if(this.deshacer.length > 60) this.deshacer.shift(); },
  atras(){ const s = this.deshacer.pop(); if(!s){ toast('No hay nada que deshacer'); return; } Object.assign(this.D, JSON.parse(s)); this.guardar(); this.pintar(); },

  /* ---------- Nombres de las celdas: A1, B7, AA3… ---------- */
  letra(c){ let s = ''; c++; while(c > 0){ const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; },
  ref(c, r){ return this.letra(c) + (r + 1); },
  deRef(s){ const m = /^([A-Z]+)(\d+)$/.exec(String(s).toUpperCase()); if(!m) return null; let c = 0; for(const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return { c:c - 1, r:+m[2] - 1 }; },
  rango(a, b){ const A = this.deRef(a), B = this.deRef(b); if(!A || !B) return []; const out = [];
    for(let r = Math.min(A.r, B.r); r <= Math.max(A.r, B.r); r++) for(let c = Math.min(A.c, B.c); c <= Math.max(A.c, B.c); c++) out.push(this.ref(c, r)); return out; },
  celda(k){ return (this.D && this.D.c[k]) || null; },

  /* ---------- Números: «12,5», «1.234,50», «12.5», «7 €» ---------- */
  numero(s){
    s = String(s).replace(/€|\s/g, ''); if(!/^[-+]?[\d.,]+$/.test(s) || !/\d/.test(s)) return null;
    if(s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if(/^[-+]?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    const n = Number(s); return isFinite(n) ? n : null;
  },

  /* ---------- Calcular ---------- */
  valor(k, pila){
    this._cache = this._cache || {};
    if(k in this._cache) return this._cache[k];
    const c = this.celda(k), raw = c ? String(c.v ?? '') : '';
    let out;
    if(!raw.trim()) out = { v:null };
    else if(raw[0] === '='){
      pila = pila || []; if(pila.includes(k)) return { v:'#CICLO', err:true };
      try{ const ctx = { eur:false }; const v = this.formula(raw.slice(1), [...pila, k], ctx); out = typeof v === 'number' ? (isFinite(v) ? { v, eur:ctx.eur } : { v:'#DIV/0', err:true }) : { v }; }
      catch(e){ out = { v:e && e.cod ? e.cod : '#ERROR', err:true, msg:e && e.msg }; }
    }
    else if(c.t === 'txt') out = { v:raw };
    else { const n = this.numero(raw); out = n === null ? { v:raw } : { v:n, eur:c.t === 'eur' || /€/.test(raw) }; }
    if(c && c.t === 'eur' && typeof out.v === 'number') out.eur = true;
    this._cache[k] = out; return out;
  },
  error(cod, msg){ const e = new Error(msg || cod); e.cod = cod; e.msg = msg; return e; },
  // trocea la fórmula
  trozos(s){
    const T = []; let i = 0;
    while(i < s.length){
      const ch = s[i];
      if(/\s/.test(ch)){ i++; continue; }
      let m;
      if((m = /^[A-Za-z]+\d+:[A-Za-z]+\d+/.exec(s.slice(i)))){ T.push({ t:'rango', v:m[0].toUpperCase() }); i += m[0].length; continue; }
      if((m = /^[A-Za-z]+\d+(?![A-Za-z(])/.exec(s.slice(i)))){ T.push({ t:'ref', v:m[0].toUpperCase() }); i += m[0].length; continue; }
      if((m = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?=\s*\()/.exec(s.slice(i)))){ T.push({ t:'fun', v:m[0].toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '') }); i += m[0].length; continue; }
      if((m = /^\d+(?:[.,]\d+)?/.exec(s.slice(i)))){ T.push({ t:'num', v:Number(m[0].replace(',', '.')) }); i += m[0].length; continue; }
      if('+-*/()'.includes(ch)){ T.push({ t:ch }); i++; continue; }
      if(ch === ';' || ch === ','){ T.push({ t:';' }); i++; continue; }
      throw this.error('#ERROR', 'No entiendo «' + ch + '»');
    }
    return T;
  },
  formula(s, pila, ctx){
    const T = this.trozos(s); let p = 0;
    const ver = () => T[p], toma = t => { if(!T[p] || T[p].t !== t) throw this.error('#ERROR', 'Falta «' + t + '»'); return T[p++]; };
    const deCelda = k => { const r = this.valor(k, pila); if(r.err) throw this.error(r.v); if(r.eur) ctx.eur = true; return r.v; };
    const expr = () => { let v = term(); while(ver() && (ver().t === '+' || ver().t === '-')){ const o = T[p++].t, w = term(); v = o === '+' ? v + w : v - w; } return v; };
    const term = () => { let v = fac(); while(ver() && (ver().t === '*' || ver().t === '/')){ const o = T[p++].t, w = fac(); if(o === '/' && w === 0) throw this.error('#DIV/0'); v = o === '*' ? v * w : v / w; } return v; };
    const num = v => { if(v === null || v === '') return 0; if(typeof v === 'number') return v; throw this.error('#VALOR', 'Hay texto donde va un número'); };
    const fac = () => {
      const t = T[p++]; if(!t) throw this.error('#ERROR', 'Falta algo al final');
      if(t.t === '-') return -fac(); if(t.t === '+') return fac();
      if(t.t === 'num') return t.v;
      if(t.t === 'ref') return num(deCelda(t.v));
      if(t.t === '('){ const v = expr(); toma(')'); return v; }
      if(t.t === 'fun'){
        const f = this.ALIAS[t.v] || t.v; if(!this.FUN[f]) throw this.error('#NOMBRE', '«' + t.v + '» no es una de las fórmulas');
        toma('('); const ns = [];
        if(ver() && ver().t !== ')') for(;;){
          if(ver() && ver().t === 'ref' && (!T[p + 1] || T[p + 1].t === ';' || T[p + 1].t === ')')){ const v = deCelda(T[p++].v); if(typeof v === 'number') ns.push(v); }   // una celda con texto no cuenta
          else if(ver() && ver().t === 'rango' && (!T[p + 1] || T[p + 1].t === ';' || T[p + 1].t === ')')){ const [a, b] = T[p++].v.split(':'); this.rango(a, b).forEach(k => { const v = deCelda(k); if(typeof v === 'number') ns.push(v); }); }
          else ns.push(expr());
          if(ver() && ver().t === ';'){ p++; continue; } break;
        }
        toma(')');
        if(f === 'SUMA') return ns.reduce((a, b) => a + b, 0);
        if(f === 'RESTA') return ns.length ? ns.slice(1).reduce((a, b) => a - b, ns[0]) : 0;
        if(f === 'MULTIPLICAR') return ns.length ? ns.reduce((a, b) => a * b, 1) : 0;
        if(f === 'DIVIDIR'){ if(!ns.length) return 0; return ns.slice(1).reduce((a, b) => { if(b === 0) throw this.error('#DIV/0'); return a / b; }, ns[0]); }
        if(f === 'PROMEDIO'){ if(!ns.length) throw this.error('#DIV/0', 'No hay números'); return ns.reduce((a, b) => a + b, 0) / ns.length; }
      }
      throw this.error('#ERROR');
    };
    const v = expr(); if(p < T.length) throw this.error('#ERROR', 'Sobra algo'); return v;
  },
  // 1234,5 → «1.234,5» (con el punto de los miles también en números de 4 cifras)
  fmt(n, d){
    let t = d == null ? String(+n.toFixed(10)) : n.toFixed(d); if(/e/.test(t)) return String(n);
    const neg = t[0] === '-'; if(neg) t = t.slice(1);
    const [e, dec] = t.split('.'); const ent = e.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '-' : '') + ent + (dec ? ',' + dec : '');
  },
  // lo que se ve en la celda
  tipoDe(k){ const c = this.celda(k); return (c && c.t) || 'auto'; },
  texto(k){
    const c = this.celda(k); if(!c || !String(c.v ?? '').trim()) return { s:'', cls:'' };
    const r = this.valor(k);
    if(r.err) return { s:r.v, cls:'err', tit:r.msg || 'La fórmula tiene un error' };
    if(typeof r.v !== 'number') return { s:String(r.v), cls:'txt' };
    const eur = c.t === 'eur' || (c.t !== 'num' && c.t !== 'txt' && r.eur);
    if(c.t === 'txt') return { s:String(c.v), cls:'txt' };
    const d = c.d != null ? c.d : eur ? 2 : null;
    const s = this.fmt(r.v, d);
    return { s:s + (eur ? ' €' : ''), cls:'num' + (r.v < 0 ? ' neg' : '') + (String(c.v)[0] === '=' ? ' fx' : '') };
  },

  /* ---------- Pantalla ---------- */
  abrir(){
    soloVista('vCeldas');
    if(!this.id || !this.actual()){ const l = this.lista().sort((a, b) => b.cambiado - a.cambiado); if(l.length) this.id = l[0].id; else this.nueva(); }
    this.cargar();
  },
  activa(){ const v = $('#vCeldas'); return !!v && v.classList.contains('activa'); },
  cargar(){
    this.D = this.actual(); if(!this.D) return; this.D.c = this.D.c || {}; this.D.cols = this.D.cols || 8; this.D.filas = this.D.filas || 30;
    this._cache = null; this.ed = null; this.deshacer = []; this.sel = { c:0, r:0 }; this.fin = { c:0, r:0 };
    $('#ceTitulo').value = this.D.titulo || '';
    this.pintar(); this.marcar(); this.contar();
  },
  pintar(){
    const D = this.D, t = $('#ceTabla'); if(!D || !t) return; this._cache = null;
    let h = '<thead><tr><th class="ce-esq"></th>';
    for(let c = 0; c < D.cols; c++) h += `<th data-col="${c}">${this.letra(c)}</th>`;
    h += '</tr></thead><tbody>';
    for(let r = 0; r < D.filas; r++){
      h += `<tr><th data-fila="${r}">${r + 1}</th>`;
      for(let c = 0; c < D.cols; c++){ const k = this.ref(c, r), x = this.texto(k), cel = this.celda(k);
        h += `<td data-c="${c}" data-r="${r}" class="${x.cls}${cel && cel.b ? ' neg-b' : ''}"${x.tit ? ` title="${esc(x.tit)}"` : ''}>${esc(x.s)}</td>`; }
      h += '</tr>';
    }
    t.innerHTML = h + '</tbody>';
    this.marcar();
  },
  // vuelve a calcular y cambia solo los textos
  refrescar(){
    this._cache = null;
    $$('#ceTabla td').forEach(td => { const k = this.ref(+td.dataset.c, +td.dataset.r), x = this.texto(k), cel = this.celda(k);
      td.textContent = x.s; td.className = x.cls + (cel && cel.b ? ' neg-b' : ''); if(x.tit) td.title = x.tit; else td.removeAttribute('title'); });
    this.marcar();
  },
  td(c, r){ return $(`#ceTabla td[data-c="${c}"][data-r="${r}"]`); },
  caja(){ return { c1:Math.min(this.sel.c, this.fin.c), c2:Math.max(this.sel.c, this.fin.c), r1:Math.min(this.sel.r, this.fin.r), r2:Math.max(this.sel.r, this.fin.r) }; },
  refsSel(){ const b = this.caja(), o = []; for(let r = b.r1; r <= b.r2; r++) for(let c = b.c1; c <= b.c2; c++) o.push(this.ref(c, r)); return o; },
  marcar(){
    $$('#ceTabla .sel, #ceTabla .en-rango, #ceTabla .ref-r, #ceTabla th.on').forEach(x => x.classList.remove('sel', 'en-rango', 'ref-r', 'on'));
    const b = this.caja();
    for(let r = b.r1; r <= b.r2; r++) for(let c = b.c1; c <= b.c2; c++){ const x = this.td(c, r); if(x) x.classList.add('en-rango'); }
    const a = this.td(this.sel.c, this.sel.r); if(a) a.classList.add('sel');
    for(let c = b.c1; c <= b.c2; c++){ const h = $(`#ceTabla th[data-col="${c}"]`); if(h) h.classList.add('on'); }
    for(let r = b.r1; r <= b.r2; r++){ const h = $(`#ceTabla th[data-fila="${r}"]`); if(h) h.classList.add('on'); }
    if(this._refR){ const [a1, b1] = this._refR; this.rango(a1, b1).forEach(k => { const p = this.deRef(k), x = this.td(p.c, p.r); if(x) x.classList.add('ref-r'); }); }
    const k = this.ref(this.sel.c, this.sel.r), mono = b.c1 === b.c2 && b.r1 === b.r2;
    $('#ceRef').textContent = mono ? k : this.ref(b.c1, b.r1) + ':' + this.ref(b.c2, b.r2);
    if(!this.ed){ const c = this.celda(k); $('#ceIn').value = c ? String(c.v ?? '') : ''; }
    this.pintarBarra();
  },
  pintarBarra(){
    const c = this.celda(this.ref(this.sel.c, this.sel.r)) || {}, t = c.t || 'auto';
    $('#ceTipo').innerHTML = { auto:'✨ Auto', num:'🔢 Número', txt:'🔤 Texto', eur:'💶 Moneda' }[t] + ' ▾';
    $('#ceEur').classList.toggle('on', t === 'eur');
    $('#ceD1').classList.toggle('on', c.d === 1); $('#ceD2').classList.toggle('on', c.d === 2); $('#ceD0').classList.toggle('on', c.d === 0);
    $('#ceNeg').classList.toggle('on', !!c.b);
    $('#vCeldas').classList.toggle('editando', !!this.ed);
  },
  contar(){ const n = this.D ? Object.values(this.D.c).filter(x => String(x.v ?? '').trim()).length : 0; const e = $('#ceCuenta'); if(e) e.textContent = n === 1 ? '1 celda con datos' : n + ' celdas con datos'; },
  verCelda(c, r){
    const x = this.td(c, r), z = $('#ceZona'); if(!x || !z) return;
    const L = x.offsetLeft - 44, R = x.offsetLeft + x.offsetWidth, T = x.offsetTop - 34, B = x.offsetTop + x.offsetHeight;
    if(L < z.scrollLeft) z.scrollLeft = L; else if(R > z.scrollLeft + z.clientWidth) z.scrollLeft = R - z.clientWidth;
    if(T < z.scrollTop) z.scrollTop = T; else if(B > z.scrollTop + z.clientHeight) z.scrollTop = B - z.clientHeight;
  },
  ir(c, r, ampliar){
    c = Math.max(0, c); r = Math.max(0, r);
    if(r >= this.D.filas){ this.D.filas = r + 10; this.pintar(); }
    if(c >= this.D.cols){ this.D.cols = Math.min(52, c + 2); this.pintar(); }
    c = Math.min(c, this.D.cols - 1);
    if(ampliar) this.fin = { c, r }; else { this.sel = { c, r }; this.fin = { c, r }; }
    this.marcar(); this.verCelda(c, r);
  },

  /* ---------- Escribir en una celda (arriba, en la barra) ---------- */
  editar(txt){
    const k = this.ref(this.sel.c, this.sel.r), c = this.celda(k), i = $('#ceIn');
    this.fin = { ...this.sel }; this.ed = { k, antes:c ? String(c.v ?? '') : '' };
    if(txt != null) i.value = txt;
    const tp = this.tipoDe(k); i.setAttribute('inputmode', (tp === 'num' || tp === 'eur') && !(i.value[0] === '=') ? 'decimal' : 'text');
    this.marcar(); i.focus(); try{ i.setSelectionRange(i.value.length, i.value.length); }catch(e){}
    this.vivo();
  },
  // mientras escribes se ve en la celda
  vivo(){ if(!this.ed) return; const v = $('#ceIn').value, p = this.deRef(this.ed.k), x = this.td(p.c, p.r); if(x){ x.textContent = v; x.className = 'sel editando-c'; }
    $('#vCeldas').classList.toggle('modo-ref', v.trim()[0] === '='); },
  aceptar(mover){
    if(!this.ed) return; let v = $('#ceIn').value; const k = this.ed.k;
    if(v.trim()[0] === '='){ v = v.trim().toUpperCase(); const ab = (v.match(/\(/g) || []).length - (v.match(/\)/g) || []).length; if(ab > 0) v += ')'.repeat(ab); }   // cierra los paréntesis que falten
    this.ed = null; this._refR = null; $('#vCeldas').classList.remove('modo-ref');
    const c = this.celda(k), antes = c ? String(c.v ?? '') : '';
    if(v !== antes){
      this.copia();
      if(!v.trim()){ if(c){ delete c.v; if(!c.t && !c.b && c.d == null) delete this.D.c[k]; } }
      else { const n = this.D.c[k] = this.D.c[k] || {}; n.v = v;
        if(v[0] !== '=' && /€/.test(v) && (!n.t || n.t === 'auto' || n.t === 'num')){ n.t = 'eur'; n.v = v.replace(/\s*€\s*/g, '').trim(); } }
      this.guardar();
    }
    $('#ceIn').blur(); this.refrescar();
    if(mover === 'abajo') this.ir(this.sel.c, this.sel.r + 1); else if(mover === 'der') this.ir(this.sel.c + 1, this.sel.r);
  },
  cancelar(){ if(!this.ed) return; this.ed = null; this._refR = null; $('#vCeldas').classList.remove('modo-ref'); $('#ceIn').blur(); this.refrescar(); },
  // con una fórmula a medias: tocar una celda (o arrastrar) pone su nombre donde está el cursor
  ponerRef(texto, inicio){
    const i = $('#ceIn'); let v = i.value, a = inicio != null ? inicio.a : (i.selectionStart ?? v.length), b = inicio != null ? inicio.b : (i.selectionEnd ?? v.length);
    if(inicio == null){ const antes = v.slice(0, a).trimEnd(); if(antes && !/[=(;:+\-*/]$/.test(antes)){ v = v.slice(0, a) + ';' + v.slice(b); a = b = a + 1; } }
    i.value = v.slice(0, a) + texto + v.slice(b); const fin = a + texto.length; try{ i.setSelectionRange(fin, fin); }catch(e){}
    this.vivo(); return { a, b:fin };
  },

  /* ---------- Fórmulas ---------- */
  menuFormulas(){
    const multi = this.refsSel().length > 1 && !this.ed;
    const p = popMio(`<h3 class="mp-h">Σ Fórmulas</h3>
      <p class="mp-p">${multi ? 'Tienes celdas marcadas: el resultado irá en la celda de debajo.' : 'Elige una y luego <b>toca o arrastra</b> por las celdas que quieras usar. Después pulsa <b>✓</b>.'}</p>
      ${Object.entries(this.FUN).map(([k, f]) => `<button class="mp-op" data-f="${k}"><span class="mp-ic">${f.ic}</span><span><b>${f.t}</b><small>${f.d} · <code>${f.ej}</code></small></span></button>`).join('')}
      <p class="aj-ayuda" style="margin-top:8px">También puedes escribir cuentas: <code>=A1+B1</code>, <code>=A2*3</code>, <code>=(A1+A2)/2</code></p>
      <div class="mp-fila"><button class="mp-b" data-x>Cancelar</button></div>`);
    p.addEventListener('mousedown', e => { if(e.target.closest('button')) e.preventDefault(); });
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return; cerrarPopMio(); if(b.dataset.f) this.ponerFormula(b.dataset.f); };
  },
  ponerFormula(f){
    if(this.ed){ this.ponerRef(f + '('); return; }
    const bx = this.caja(), multi = bx.c1 !== bx.c2 || bx.r1 !== bx.r2;
    if(multi){
      const r = bx.r2 + 1, c = bx.c1, rg = this.ref(bx.c1, bx.r1) + ':' + this.ref(bx.c2, bx.r2);
      this.ir(c, r); this.editar('=' + f + '(' + rg + ')'); this.aceptar();
      toast('Σ ' + this.FUN[f].t + ' de ' + rg + ' en ' + this.ref(c, r), null, null, 2500); return;
    }
    this.editar('=' + f + '(');
    if(!lsGet('ph3-ce-aviso')){ lsSet('ph3-ce-aviso', '1'); toast('👆 Ahora toca o arrastra por las celdas y pulsa ✓', null, null, 4000); }
  },

  /* ---------- Tipo, euros, decimales, negrita ---------- */
  cadaSel(fn){ this.copia(); this.refsSel().forEach(k => { const c = this.D.c[k] = this.D.c[k] || {}; fn(c, k); if(!String(c.v ?? '').trim() && (c.t || 'auto') === 'auto' && c.d == null && !c.b) delete this.D.c[k]; }); this.guardar(); this.refrescar(); },
  menuTipo(){
    const c = this.celda(this.ref(this.sel.c, this.sel.r)) || {}, t = c.t || 'auto';
    const p = popMio(`<h3 class="mp-h">¿Qué hay en ${this.refsSel().length > 1 ? 'estas celdas' : 'la celda'}?</h3>
      ${[['auto','✨','Automático','Si escribes un número, es número; si no, texto'],['num','🔢','Número','Para cuentas: 12 · 3,5 · 1.250'],['txt','🔤','Texto','Se queda tal cual, aunque sean números (un teléfono, un código…)'],['eur','💶','Moneda (€)','Con el símbolo € al final']].map(([k, ic, n, d]) => `<button class="mp-op ${t === k ? 'on' : ''}" data-t="${k}"><span class="mp-ic">${ic}</span><span><b>${n}</b><small>${d}</small></span></button>`).join('')}
      <div class="ab-tit">Decimales (después de la coma)</div>
      <div class="seg ce-dec">${[['', 'Como esté'], ['0', 'Ninguno'], ['1', '0,0'], ['2', '0,00']].map(([v, n]) => `<button data-d="${v}" class="${String(c.d ?? '') === v ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="mp-fila"><button class="mp-b mp-pri" data-x>Listo</button></div>`);
    p.addEventListener('mousedown', e => { if(e.target.closest('button')) e.preventDefault(); });
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return;
      if(b.dataset.t){ const v = b.dataset.t; this.cadaSel(x => { if(v === 'auto') delete x.t; else x.t = v; if(v === 'eur' && x.d == null) x.d = 2; }); $$('[data-t]', p).forEach(y => y.classList.toggle('on', y === b)); }
      else if(b.dataset.d != null){ const v = b.dataset.d; this.cadaSel(x => { if(v === '') delete x.d; else x.d = +v; }); $$('[data-d]', p).forEach(y => y.classList.toggle('on', y === b)); }
      else cerrarPopMio(); };
  },
  euro(){ const todas = this.refsSel().every(k => this.tipoDe(k) === 'eur'); this.cadaSel(x => { if(todas){ delete x.t; } else { x.t = 'eur'; if(x.d == null) x.d = 2; } }); toast(todas ? 'Sin €' : '💶 En euros', null, null, 1000); },
  decimales(d){ const todas = this.refsSel().every(k => (this.celda(k) || {}).d === d); this.cadaSel(x => { if(todas) delete x.d; else x.d = d; }); },
  negrita(){ const todas = this.refsSel().every(k => (this.celda(k) || {}).b); this.cadaSel(x => { if(todas) delete x.b; else x.b = true; }); },
  borrarSel(){ if(!this.refsSel().some(k => this.celda(k))) return; this.copia(); this.refsSel().forEach(k => delete this.D.c[k]); this.guardar(); this.refrescar(); toast('🧹 Borrado', 'Deshacer', () => this.atras(), 4000); },
  masFila(){ this.copia(); this.D.filas += 5; this.guardar(); this.pintar(); const z = $('#ceZona'); z.scrollTop = z.scrollHeight; toast('＋ 5 filas', null, null, 900); },
  masCol(){ if(this.D.cols >= 52){ toast('Ya hay muchas columnas'); return; } this.copia(); this.D.cols += 1; this.guardar(); this.pintar(); const z = $('#ceZona'); z.scrollLeft = z.scrollWidth; toast('＋ Columna ' + this.letra(this.D.cols - 1), null, null, 900); },

  /* ---------- Mis hojas ---------- */
  misHojas(){
    const todos = this.lista(), l = todos.filter(d => !this.vacio(d) || d.id === this.id).sort((a, b) => b.cambiado - a.cambiado);
    const p = popMio(`<h3 class="mp-h">📊 Mis hojas</h3>
      <div class="mp-notas">${l.map(d => `<div class="desl-fila" data-id="${d.id}"><div class="desl-del"><span>🗑 Eliminar</span></div><button class="mp-nota desl-cara ${d.id === this.id ? 'on' : ''}" data-id="${d.id}"><span><b>${esc(this.tituloDe(d))}</b><small>${d.id === this.id ? '✏️ Abierta · ' : ''}${new Date(d.cambiado).toLocaleString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</small></span><b>›</b></button></div>`).join('')}</div>
      <p class="desl-pista">👈 Desliza una hoja a la izquierda para eliminarla</p>
      <button class="mp-op" data-abrir><span class="mp-ic">📂</span><span><b>Abrir un archivo</b><small>Excel (.xlsx) o .csv · de Numbers: expórtalo antes a Excel</small></span></button>
      <div class="mp-fila"><button class="mp-b" data-x>Cerrar</button><button class="mp-b mp-pri" data-nueva>＋ Nueva hoja</button></div>`);
    deslizarBorrar($('.mp-notas', p), id => {
      const d = this.lista().find(x => x.id === id); if(!d) return;
      this.ponerLista(this.lista().filter(x => x.id !== id));
      if(this.id === id){ this.id = null; const r = this.lista().sort((a, b) => b.cambiado - a.cambiado); if(r.length) this.id = r[0].id; else this.nueva(); this.cargar(); }
      toast('🗑 «' + this.tituloDe(d) + '» eliminada', 'Deshacer', () => { const l2 = this.lista(); l2.push(d); this.ponerLista(l2); this.id = d.id; this.cargar(); toast('↩️ La hoja vuelve a estar'); }, 6000);
    });
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return;
      if('abrir' in b.dataset){ cerrarPopMio(); this.elegirArchivo(); return; }
      if(b.dataset.id){ cerrarPopMio(); this.cancelar(); const ant = this.D; this.id = b.dataset.id; if(ant && this.vacio(ant) && ant.id !== this.id) this.ponerLista(this.lista().filter(x => x.id !== ant.id)); this.cargar(); }
      else if('nueva' in b.dataset){ cerrarPopMio(); this.cancelar(); if(this.vacio(this.D)){ toast('📊 Ya tienes una hoja en blanco'); return; } this.nueva(); this.cargar(); $('#ceTitulo').focus(); }
      else cerrarPopMio(); };
  },

  /* ---------- Sacarla: .csv (Excel, Numbers) o imprimir ---------- */
  menuSacar(){
    const p = popMio(`<h3 class="mp-h">📤 Abrir · guardar · imprimir</h3>
      <button class="mp-op" data-s="imp"><span class="mp-ic">🖨️</span><span><b>Imprimir</b><small>Las celdas con datos, en una hoja</small></span></button>
      <button class="mp-op" data-s="xlsx"><span class="mp-ic">📗</span><span><b>Guardar en Excel (.xlsx)</b><small>Con sus fórmulas, euros y decimales. Se abre con Excel, Numbers o Google</small></span></button>
      <button class="mp-op" data-s="csv"><span class="mp-ic">📄</span><span><b>Guardar como .csv</b><small>Solo los valores, sin formato</small></span></button>
      <button class="mp-op" data-s="abrir"><span class="mp-ic">📂</span><span><b>Abrir un archivo</b><small>Excel (.xlsx) o .csv (se abre en una hoja nueva)</small></span></button>
      <div class="mp-fila"><button class="mp-b" data-x>Cancelar</button></div>`);
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return; cerrarPopMio(); const s = b.dataset.s;
      if(s === 'csv') this.csv(); else if(s === 'xlsx') this.xlsx(); else if(s === 'imp') this.imprimir(); else if(s === 'abrir') this.elegirArchivo(); };
  },
  usado(){ let C = 0, R = 0; Object.keys(this.D.c).forEach(k => { const c = this.D.c[k]; if(!String(c.v ?? '').trim()) return; const p = this.deRef(k); if(p){ C = Math.max(C, p.c + 1); R = Math.max(R, p.r + 1); } }); return { C, R }; },
  nombreArch(){ return this.tituloDe(this.D).replace(/[\\/:*?"<>|…]/g, '').trim().slice(0, 60) || 'Hoja'; },
  async csv(){
    const { C, R } = this.usado(); if(!C){ toast('La hoja está vacía'); return; }
    this._cache = null; const filas = [];
    for(let r = 0; r < R; r++){ const f = []; for(let c = 0; c < C; c++){ const k = this.ref(c, r), v = this.valor(k), cel = this.celda(k);
      let s = v.v == null ? '' : typeof v.v === 'number' ? (cel && cel.d != null ? v.v.toFixed(cel.d) : String(v.v)).replace('.', ',') : String(v.v);
      if(/[;"\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'; f.push(s); } filas.push(f.join(';')); }
    await this.entregar(new Blob(['\ufeff' + filas.join('\r\n')], { type:'text/csv' }), this.nombreArch() + '.csv');
  },
  async entregar(blob, nom){
    try{ const f = new File([blob], nom, { type:blob.type });
      if(navigator.canShare && navigator.canShare({ files:[f] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)){ await navigator.share({ files:[f] }); return; } }catch(e){ if(e && e.name === 'AbortError') return; }
    descargar(blob, nom);
  },
  imprimir(){
    const { C, R } = this.usado(); if(!C){ toast('La hoja está vacía'); return; }
    this._cache = null;
    let h = '<table><tr><th></th>' + Array.from({ length:C }, (_, c) => `<th>${this.letra(c)}</th>`).join('') + '</tr>';
    for(let r = 0; r < R; r++){ h += `<tr><th>${r + 1}</th>`; for(let c = 0; c < C; c++){ const k = this.ref(c, r), x = this.texto(k), cel = this.celda(k); h += `<td class="${x.cls}${cel && cel.b ? ' b' : ''}">${esc(x.s)}</td>`; } h += '</tr>'; }
    h += '</table>';
    const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'; document.body.appendChild(f);
    const d = f.contentDocument; d.open();
    d.write(`<!doctype html><html><head><title>${esc(this.nombreArch())}</title><style>@page{size:A4 ${C > 7 ? 'landscape' : 'portrait'};margin:14mm}body{font:12pt -apple-system,system-ui,Arial,sans-serif;color:#111}h1{font-size:16pt;margin:0 0 10px}table{border-collapse:collapse}th,td{border:1px solid #bbb;padding:4px 8px;min-width:50px}th{background:#f1f1f3;font-size:9pt;color:#666}td.num{text-align:right;font-variant-numeric:tabular-nums}td.neg{color:#c00}td.b{font-weight:700}td.err{color:#c00}</style></head><body>${(this.D.titulo || '').trim() ? `<h1>${esc(this.D.titulo)}</h1>` : ''}${h}</body></html>`); d.close();
    setTimeout(() => { try{ f.contentWindow.focus(); f.contentWindow.print(); }catch(e){ toast('⚠️ No se ha podido imprimir'); } setTimeout(() => f.remove(), 60000); }, 300);
  },

  /* ---------- Tocar y arrastrar ---------- */
  enlazar(){
    const z = $('#ceZona'), tabla = $('#ceTabla'); let P = null;
    const tdEn = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest ? el.closest('#ceTabla td') : null; };
    const auto = (x, y) => { const r = z.getBoundingClientRect(); if(x > r.right - 16) z.scrollLeft += 12; else if(x < r.left + 50) z.scrollLeft -= 12; if(y > r.bottom - 16) z.scrollTop += 12; else if(y < r.top + 40) z.scrollTop -= 12; };
    z.addEventListener('pointerdown', e => {
      if(e.pointerType === 'mouse' && e.button) return;
      const th = e.target.closest('#ceTabla th');
      if(th && !this.ed){   // tocar la letra o el número: toda la columna o la fila
        if(th.dataset.col != null){ const c = +th.dataset.col; this.sel = { c, r:0 }; this.fin = { c, r:this.D.filas - 1 }; this.marcar(); }
        else if(th.dataset.fila != null){ const r = +th.dataset.fila; this.sel = { c:0, r }; this.fin = { c:this.D.cols - 1, r }; this.marcar(); }
        return;
      }
      const td = e.target.closest('#ceTabla td'); if(!td) return;
      const c = +td.dataset.c, r = +td.dataset.r;
      // fórmula a medias: tocar o arrastrar pone el nombre de las celdas en la fórmula
      if(this.ed && $('#ceIn').value.trim()[0] === '='){
        e.preventDefault(); const k = this.ref(c, r);
        P = { ref:true, a:k, ins:this.ponerRef(k), id:e.pointerId, on:true }; this._refR = [k, k]; this.marcar();
        try{ z.setPointerCapture(e.pointerId); }catch(_){}
        return;
      }
      if(this.ed) this.aceptar();
      const yaSel = this.sel.c === c && this.sel.r === r && this.fin.c === c && this.fin.r === r;
      P = { c, r, x:e.clientX, y:e.clientY, id:e.pointerId, yaSel, on:e.pointerType === 'mouse', mov:false, raton:e.pointerType === 'mouse' };
      if(e.shiftKey){ this.fin = { c, r }; this.marcar(); P = null; return; }
      this.sel = { c, r }; this.fin = { c, r }; this.marcar();
      if(!P.raton) P.t = setTimeout(() => { if(P && !P.mov){ P.on = true; try{ navigator.vibrate && navigator.vibrate(12); }catch(_){} $('#vCeldas').classList.add('marcando'); } }, 380);   // con el dedo: mantener pulsado y arrastrar para marcar varias
    });
    addEventListener('pointermove', e => {
      if(!P || e.pointerId !== P.id) return;
      if(P.ref){ e.preventDefault(); auto(e.clientX, e.clientY); const td = tdEn(e.clientX, e.clientY); if(!td) return; const k = this.ref(+td.dataset.c, +td.dataset.r);
        if(this._refR[1] !== k){ this._refR = [P.a, k]; P.ins = this.ponerRef(P.a === k ? k : P.a + ':' + k, P.ins); this.marcar(); } return; }
      if(!P.on){ if(Math.hypot(e.clientX - P.x, e.clientY - P.y) > 8){ P.mov = true; clearTimeout(P.t); P = null; } return; }   // con el dedo, sin mantener: se desplaza la hoja
      if(P.raton && Math.hypot(e.clientX - P.x, e.clientY - P.y) > 4) P.mov = true;
      auto(e.clientX, e.clientY);
      const td = tdEn(e.clientX, e.clientY); if(td){ const c = +td.dataset.c, r = +td.dataset.r; if(c !== this.fin.c || r !== this.fin.r){ this.fin = { c, r }; this.marcar(); P.mov = true; } }
    }, { passive:false });
    const fin = e => { if(!P || (e && e.pointerId !== P.id)) return; const p = P; P = null; clearTimeout(p.t); $('#vCeldas').classList.remove('marcando');
      if(p.ref){ $('#ceIn').focus(); return; }
      if(p.yaSel && !p.mov) this.editar();   // tocar otra vez la celda: escribir en ella
    };
    addEventListener('pointerup', fin); addEventListener('pointercancel', fin);
    z.addEventListener('touchmove', e => { if(P && (P.ref || P.on) && e.cancelable) e.preventDefault(); }, { passive:false });
    z.addEventListener('touchstart', e => { if(this.ed && $('#ceIn').value.trim()[0] === '=' && e.target.closest('#ceTabla td') && e.cancelable) e.preventDefault(); }, { passive:false });   // que no se vaya el teclado
    z.addEventListener('dblclick', e => { const td = e.target.closest('#ceTabla td'); if(td && !this.ed) this.editar(); });
    z.addEventListener('contextmenu', e => { if(P) e.preventDefault(); });
  },

  /* ---------- Arranque ---------- */
  iniciar(){
    const v = $('#vCeldas'); if(!v) return;
    this.enlazar();
    const i = $('#ceIn');
    i.addEventListener('focus', () => { if(!this.ed) this.editar(); });
    i.addEventListener('input', () => this.vivo());
    i.addEventListener('keydown', e => {
      if(e.key === 'Enter'){ e.preventDefault(); this.aceptar('abajo'); }
      else if(e.key === 'Tab'){ e.preventDefault(); this.aceptar('der'); }
      else if(e.key === 'Escape'){ e.preventDefault(); this.cancelar(); }
    });
    $('#ceOk').addEventListener('mousedown', e => e.preventDefault()); $('#ceOk').onclick = () => { if(this.ed) this.aceptar(); else this.editar(); };
    $('#ceNo').addEventListener('mousedown', e => e.preventDefault()); $('#ceNo').onclick = () => this.cancelar();
    // el teclado del ordenador
    document.addEventListener('keydown', e => {
      if(!this.activa() || this.ed || $('#mioPop') || $('.mio-hoja')) return;
      const a = document.activeElement; if(a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable)) return;
      const k = e.key, m = { ArrowUp:[0, -1], ArrowDown:[0, 1], ArrowLeft:[-1, 0], ArrowRight:[1, 0] }[k];
      if(m){ e.preventDefault(); const b = e.shiftKey ? this.fin : this.sel; this.ir(b.c + m[0], b.r + m[1], e.shiftKey); }
      else if(k === 'Enter' || k === 'F2'){ e.preventDefault(); this.editar(); }
      else if(k === 'Delete' || k === 'Backspace'){ e.preventDefault(); this.borrarSel(); }
      else if((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'z'){ e.preventDefault(); this.atras(); }
      else if(k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey){ e.preventDefault(); this.editar(k); }
      else if(k === 'Tab'){ e.preventDefault(); this.ir(this.sel.c + (e.shiftKey ? -1 : 1), this.sel.r); }
    });
    const B = $('#ceBarra');
    B.addEventListener('mousedown', e => { if(e.target.closest('button')) e.preventDefault(); });
    B.onclick = e => { const b = e.target.closest('button'); if(!b) return;
      ({ ceFx:() => this.menuFormulas(), ceTipo:() => { if(this.ed) this.aceptar(); this.menuTipo(); }, ceEur:() => { if(this.ed) this.aceptar(); this.euro(); },
        ceD0:() => { if(this.ed) this.aceptar(); this.decimales(0); }, ceD1:() => { if(this.ed) this.aceptar(); this.decimales(1); }, ceD2:() => { if(this.ed) this.aceptar(); this.decimales(2); },
        ceNeg:() => { if(this.ed) this.aceptar(); this.negrita(); }, ceBorrar:() => { if(this.ed){ $('#ceIn').value = ''; this.vivo(); } else this.borrarSel(); },
        ceFila:() => { if(this.ed) this.aceptar(); this.masFila(); }, ceCol:() => { if(this.ed) this.aceptar(); this.masCol(); },
        ceAtras:() => { if(this.ed) this.cancelar(); this.atras(); } }[b.id] || (() => {}))(); };
    deslizarLado(B);
    $('#ceMis').onclick = () => { if(this.ed) this.aceptar(); this.misHojas(); };
    $('#ceTitulo').addEventListener('input', () => { if(!this.D) return; this.D.titulo = $('#ceTitulo').value; clearTimeout(this._tt); this._tt = setTimeout(() => this.guardar(), 500); });
    $('#ceSalir').onclick = () => { if(this.ed) this.aceptar(); irA('portada'); };
    $('#ceSacar').onclick = () => { if(this.ed) this.aceptar(); this.menuSacar(); };
  }
};

/* ---------- Excel (.xlsx) y .csv: guardar y abrir ----------
   Un .xlsx es un ZIP con archivos XML dentro (como el .docx): se hace y se lee sin librerías. */
Object.assign(Celdas, {
  X(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); },
  // nuestra fórmula → la de Excel (SUMA → SUM, «;» → «,», RESTA y DIVIDIR como cuentas)
  aExcel(f){
    const T = this.trozos(String(f).replace(/^=/, '')); let p = 0;
    const uno = () => {   // una expresión hasta «;» o «)» del mismo nivel
      let out = '';
      while(p < T.length){ const t = T[p];
        if(t.t === ';' || t.t === ')') break;
        if(t.t === 'fun'){ p += 2; const args = []; if(T[p] && T[p].t !== ')') for(;;){ args.push(uno()); if(T[p] && T[p].t === ';'){ p++; continue; } break; } p++;
          const F = this.ALIAS[t.v] || t.v, ini = a => /^[A-Z]+\d+:[A-Z]+\d+$/.test(a) ? 'SUM(' + a + ')' : '(' + a + ')';
          if(F === 'SUMA') out += 'SUM(' + args.join(',') + ')';
          else if(F === 'MULTIPLICAR') out += 'PRODUCT(' + args.join(',') + ')';
          else if(F === 'PROMEDIO') out += 'AVERAGE(' + args.join(',') + ')';
          else if(F === 'RESTA') out += args.length > 1 ? '(' + ini(args[0]) + '-SUM(' + args.slice(1).join(',') + '))' : ini(args[0] || '0');
          else if(F === 'DIVIDIR') out += args.length > 1 ? '(' + ini(args[0]) + '/PRODUCT(' + args.slice(1).join(',') + '))' : ini(args[0] || '0');
          else out += t.v + '(' + args.join(',') + ')';
          continue; }
        if(t.t === '('){ p++; out += '(' + uno() + ')'; p++; continue; }
        out += t.t === 'num' ? String(t.v) : t.t === 'ref' || t.t === 'rango' ? t.v : t.t; p++;
      }
      return out;
    };
    return uno();
  },
  // la de Excel → la nuestra (si se puede; si no, null y se queda el resultado)
  deExcel(f){
    f = String(f).replace(/\$/g, '').trim();
    if(/[!\["'#&<>=^%{]/.test(f) || /\b[A-Z]+:[A-Z]+\b/i.test(f) || /\b\d+:\d+\b/.test(f)) return null;
    const M = { SUM:'SUMA', PRODUCT:'MULTIPLICAR', AVERAGE:'PROMEDIO' };
    let ok = true; const g = f.replace(/([A-Z][A-Z0-9.]*)\s*\(/gi, (m, n) => { const N = n.toUpperCase(); if(M[N]) return M[N] + '('; if(this.FUN[N]) return N + '('; ok = false; return m; });
    if(!ok) return null;
    const r = '=' + g.replace(/,/g, ';').toUpperCase();
    try{ this.trozos(r.slice(1)); }catch(e){ return null; }
    return r;
  },
  formatoXlsx(t, d){
    const dd = d == null ? (t === 'eur' ? 2 : null) : d, dec = dd ? '.' + '0'.repeat(dd) : '';
    if(t === 'txt') return { id:49 };
    if(t === 'eur') return { code:'#,##0' + dec + '\\ "€"' };
    if(dd == null) return { id:0 };
    return { code:'#,##0' + dec };
  },
  async xlsx(){
    const { C, R } = this.usado(); if(!C){ toast('La hoja está vacía'); return; }
    this._cache = null;
    const fmts = [], xfs = [{ id:0, b:false }], xfIdx = { '0|0':0 };
    const xf = (fm, b) => { let id = fm.id; if(fm.code){ let i = fmts.indexOf(fm.code); if(i < 0){ fmts.push(fm.code); i = fmts.length - 1; } id = 164 + i; }
      const k = id + '|' + (b ? 1 : 0); if(!(k in xfIdx)){ xfs.push({ id, b }); xfIdx[k] = xfs.length - 1; } return xfIdx[k]; };
    let filas = '';
    for(let r = 0; r < R; r++){
      let cs = '';
      for(let c = 0; c < C; c++){
        const k = this.ref(c, r), cel = this.celda(k); if(!cel || !String(cel.v ?? '').trim()) continue;
        const v = this.valor(k), raw = String(cel.v), eur = cel.t === 'eur' || (cel.t !== 'num' && cel.t !== 'txt' && v.eur);
        const s = xf(this.formatoXlsx(eur ? 'eur' : cel.t, cel.d), cel.b), sa = s ? ` s="${s}"` : '';
        if(raw[0] === '='){ let fx = null; try{ fx = this.aExcel(raw); }catch(e){}
          if(typeof v.v === 'number') cs += `<c r="${k}"${sa}>${fx ? `<f>${this.X(fx)}</f>` : ''}<v>${v.v}</v></c>`;
          else cs += `<c r="${k}"${sa} t="str">${fx ? `<f>${this.X(fx)}</f>` : ''}<v>${this.X(v.v ?? '')}</v></c>`; }
        else if(typeof v.v === 'number') cs += `<c r="${k}"${sa}><v>${v.v}</v></c>`;
        else cs += `<c r="${k}"${sa} t="inlineStr"><is><t xml:space="preserve">${this.X(v.v ?? raw)}</t></is></c>`;
      }
      if(cs) filas += `<row r="${r + 1}">${cs}</row>`;
    }
    const N = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"', tit = this.X(this.nombreArch().replace(/[\[\]*?/\\:]/g, '').slice(0, 31) || 'Hoja1');
    const F = {
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook ${N} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${tit}" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`,
      'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/worksheets/sheet1.xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet ${N}><sheetFormatPr defaultRowHeight="15"/><cols><col min="1" max="${C}" width="14" customWidth="1"/></cols><sheetData>${filas}</sheetData></worksheet>`,
      'xl/styles.xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet ${N}>${fmts.length ? `<numFmts count="${fmts.length}">${fmts.map((c, i) => `<numFmt numFmtId="${164 + i}" formatCode="${this.X(c)}"/>`).join('')}</numFmts>` : ''}<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.map(x => `<xf numFmtId="${x.id}" fontId="${x.b ? 1 : 0}" fillId="0" borderId="0" xfId="0"${x.id ? ' applyNumberFormat="1"' : ''}${x.b ? ' applyFont="1"' : ''}/>`).join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`
    };
    await this.entregar(new Blob([DocxSimple.zip(F)], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), this.nombreArch() + '.xlsx');
  },

  /* ---------- Abrir ---------- */
  elegirArchivo(){
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.xlsx,.csv,.txt,.numbers,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv';
    i.style.display = 'none'; i.onchange = () => { const f = i.files[0]; i.remove(); if(f) this.abrirArchivo(f); };
    document.body.appendChild(i); i.click();
  },
  async abrirArchivo(f){
    const n = f.name.toLowerCase();
    if(/\.numbers$/.test(n)){ popAviso('Archivo de Numbers', 'Los archivos de Numbers no se pueden abrir directamente. En Numbers: «Archivo › Exportar a › Excel» (o CSV) y abre aquí ese archivo.'); return; }
    if(/\.xls$/.test(n)){ popAviso('Excel antiguo (.xls)', 'Es el formato antiguo de Excel. Ábrelo en Excel o Numbers y guárdalo (o expórtalo) como .xlsx.'); return; }
    try{
      if(/\.(csv|txt)$/.test(n)) this.ponerHoja(f.name.replace(/\.[^.]+$/, ''), this.leerCsv(await f.text()));
      else await this.leerXlsx(f);
    }catch(e){ console.warn(e); popAviso('No se ha podido abrir', 'Este archivo no parece un Excel (.xlsx) o un .csv que se pueda leer.'); }
  },
  // lo leído va a una hoja nueva
  ponerHoja(nombre, celdas, avisos){
    if(this.ed) this.aceptar();
    let ks = Object.keys(celdas); if(!ks.length){ toast('El archivo está vacío'); return; }
    let C = 0, R = 0; ks.forEach(k => { const p = this.deRef(k); C = Math.max(C, p.c + 1); R = Math.max(R, p.r + 1); });
    if(C > 52){ ks.forEach(k => { if(this.deRef(k).c >= 52) delete celdas[k]; }); C = 52; avisos = (avisos ? avisos + ' · ' : '') + 'solo caben 52 columnas'; }
    const ant = this.D; if(ant && this.vacio(ant)) this.ponerLista(this.lista().filter(x => x.id !== ant.id));
    const d = { id:nuevoId('h'), titulo:nombre, c:celdas, cols:Math.max(8, C), filas:Math.max(30, R + 10), creado:Date.now(), cambiado:Date.now() };
    const l = this.lista(); l.push(d); this.ponerLista(l); this.id = d.id; this.cargar();
    toast('📂 «' + nombre + '» abierto' + (avisos ? ' · ' + avisos : ''), null, null, avisos ? 6000 : 2500);
  },
  leerCsv(txt){
    txt = txt.replace(/^﻿/, ''); const pri = txt.split(/\r?\n/)[0] || '';
    const sep = ['\t', ';', ','].map(s => [s, pri.split(s).length]).sort((a, b) => b[1] - a[1])[0][0];
    const out = {}; let r = 0, c = 0, campo = '', q = false;
    const poner = () => { const v = campo.trim(); if(v){ const cel = { v }; if(/€/.test(v) && this.numero(v) !== null){ cel.t = 'eur'; cel.v = v.replace(/\s*€\s*/g, ''); cel.d = 2; } out[this.ref(c, r)] = cel; } campo = ''; };
    for(let i = 0; i < txt.length; i++){
      const ch = txt[i];
      if(q){ if(ch === '"'){ if(txt[i + 1] === '"'){ campo += '"'; i++; } else q = false; } else campo += ch; continue; }
      if(ch === '"') q = true;
      else if(ch === sep){ poner(); c++; }
      else if(ch === '\n' || ch === '\r'){ if(ch === '\r' && txt[i + 1] === '\n') i++; poner(); r++; c = 0; }
      else campo += ch;
    }
    if(campo) poner();
    return out;
  },
  async leerXlsx(f){
    const z = await LeerArchivo.unzip(await f.arrayBuffer()), dec = new TextDecoder(), P = new DOMParser();
    const xml = async n => { const b = await z.leer(n); return b ? P.parseFromString(dec.decode(b), 'application/xml') : null; };
    const tags = (d, t) => d ? [...d.getElementsByTagNameNS('*', t)] : [];
    const hijos = (d, t) => d ? [...d.children].filter(x => x.localName === t) : [];
    const wb = await xml('xl/workbook.xml'); if(!wb) throw new Error('no es xlsx');
    const rels = {}; tags(await xml('xl/_rels/workbook.xml.rels'), 'Relationship').forEach(r => { rels[r.getAttribute('Id')] = r.getAttribute('Target'); });
    const hojas = tags(wb, 'sheet').map(s => { let t = rels[s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || s.getAttribute('r:id')] || ''; t = t.replace(/^\//, ''); if(!t.startsWith('xl/')) t = 'xl/' + t; return { nom:s.getAttribute('name'), path:t }; });
    if(!hojas.length) throw new Error('sin hojas');
    let h = hojas[0];
    if(hojas.length > 1){
      h = await new Promise(res => { const p = popMio(`<h3 class="mp-h">📗 ¿Qué hoja abro?</h3><p class="mp-p">Este Excel tiene ${hojas.length} hojas.</p>${hojas.map((x, i) => `<button class="mp-op" data-i="${i}"><span class="mp-ic">📄</span><span><b>${esc(x.nom)}</b></span></button>`).join('')}<div class="mp-fila"><button class="mp-b" data-x>Cancelar</button></div>`);
        p.onclick = e => { const b = e.target.closest('button'); if(!b) return; cerrarPopMio(); res(b.dataset.i != null ? hojas[+b.dataset.i] : null); }; });
      if(!h) return;
    }
    // textos compartidos
    const ss = tags(await xml('xl/sharedStrings.xml'), 'si').map(si => tags(si, 't').map(t => t.textContent).join(''));
    // estilos: formato del número y negrita
    const st = await xml('xl/styles.xml'), codes = {}; tags(st, 'numFmt').forEach(n => { codes[n.getAttribute('numFmtId')] = n.getAttribute('formatCode') || ''; });
    const fonts = hijos(tags(st, 'fonts')[0], 'font').map(fn => { const b = hijos(fn, 'b')[0]; return !!b && b.getAttribute('val') !== '0' && b.getAttribute('val') !== 'false'; });
    const xfs = hijos(tags(st, 'cellXfs')[0], 'xf').map(x => { const id = +x.getAttribute('numFmtId') || 0, code = codes[id] || ({ 1:'0', 2:'0.00', 3:'#,##0', 4:'#,##0.00', 9:'0%', 10:'0.00%', 49:'@' })[id] || '';
      const sin = code.split(';')[0].replace(/"[^"]*"|\[[^\]]*\]|\\./g, '');
      const fecha = (id >= 14 && id <= 22) || (id >= 164 && /[dmyh]/i.test(sin) && !/0|#/.test(sin));
      const m = /\.(0+)/.exec(sin);
      return { eur:/€|EUR/.test(code), d:m ? Math.min(2, m[1].length) : /0/.test(sin) ? 0 : null, txt:id === 49 || code === '@', fecha, pct:/%/.test(sin), b:!!fonts[+x.getAttribute('fontId') || 0] }; });
    const hoja = await xml(h.path); if(!hoja) throw new Error('sin hoja');
    const out = {}; let sinFx = 0;
    const comoTexto = n => { let s = String(+n.toFixed(10)); if(/e/i.test(s)) s = n.toFixed(10).replace(/\.?0+$/, ''); return s.replace('.', ','); };
    for(const c of tags(hoja, 'c')){
      const k = c.getAttribute('r'); if(!k || !this.deRef(k)) continue;
      const t = c.getAttribute('t'), x = xfs[+c.getAttribute('s') || 0] || {}, vEl = hijos(c, 'v')[0], fEl = hijos(c, 'f')[0], v = vEl ? vEl.textContent : null;
      const cel = {};
      if(t === 's') cel.v = ss[+v] ?? '';
      else if(t === 'inlineStr') cel.v = tags(c, 't').map(z => z.textContent).join('');
      else if(t === 'b') cel.v = v === '1' ? 'VERDADERO' : 'FALSO';
      else if(t === 'str' || t === 'e') cel.v = v ?? '';
      else if(v != null && v !== ''){ const n = +v;
        if(x.fecha){ const d = new Date(Math.round((n - 25569) * 864e5)); cel.v = d.getUTCDate() + '/' + (d.getUTCMonth() + 1) + '/' + d.getUTCFullYear(); cel.t = 'txt'; }
        else if(x.pct){ cel.v = comoTexto(+(n * 100).toFixed(8)) + ' %'; cel.t = 'txt'; }
        else cel.v = comoTexto(n); }
      if(fEl && fEl.textContent.trim()){ const g = this.deExcel(fEl.textContent); if(g) cel.v = g; else sinFx++; }
      if(x.txt && !cel.t) cel.t = 'txt';
      if(x.eur && cel.t !== 'txt') cel.t = 'eur';
      if(x.d != null && !x.txt && !x.fecha && !x.pct) cel.d = x.d;
      if(x.b) cel.b = true;
      if(cel.v != null && String(cel.v) !== '') out[k] = cel;
    }
    const nombre = f.name.replace(/\.[^.]+$/, '') + (hojas.length > 1 ? ' · ' + h.nom : '');
    this.ponerHoja(nombre, out, sinFx ? sinFx + (sinFx === 1 ? ' fórmula que no conozco: queda su resultado' : ' fórmulas que no conozco: queda su resultado') : '');
  }
});
