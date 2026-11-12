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
  ALIAS: { SUM:'SUMA', SUMAR:'SUMA', RESTAR:'RESTA', PRODUCTO:'MULTIPLICAR', PRODUCT:'MULTIPLICAR', MULTIPLICA:'MULTIPLICAR', DIVIDE:'DIVIDIR', MEDIA:'PROMEDIO', AVERAGE:'PROMEDIO', IF:'SI', AND:'Y', OR:'O' },

  /* ---------- Datos ---------- */
  lista(){ try{ return JSON.parse(lsGet('ph3-hojas') || '[]') || []; }catch(e){ return []; } },
  ponerLista(l){ try{ localStorage.setItem('ph3-hojas', JSON.stringify(l)); }catch(e){ toast('⚠️ No cabe más en este aparato'); throw e; } if(typeof Guardar !== 'undefined' && Guardar.cambioHojas) Guardar.cambioHojas(); },
  actual(){ return this.lista().find(d => d.id === this.id) || null; },
  pestVacia(h){ return !h || (!Object.keys(h.c || {}).length && !(h.figs || []).length); },
  vacio(d){ if(!d) return true; if((d.titulo || '').trim()) return false; return d.hojas ? d.hojas.length <= 1 && d.hojas.every(h => this.pestVacia(h)) : this.pestVacia(d); },
  pestNueva(nombre, color){ return { id:nuevoId('p'), nombre:nombre || 'Hoja 1', color:color || '', c:{}, cols:8, filas:30 }; },
  // las hojas de antes (sin pestañas) pasan a tener una pestaña
  migrar(d){
    if(d.hojas && d.hojas.length) return d;
    const h = this.pestNueva('Hoja 1');
    ['c', 'cols', 'filas', 'anchos', 'altos', 'fondo', 'sinRejilla', 'verTodo', 'figs', 'reglas'].forEach(k => { if(d[k] != null) h[k] = d[k]; delete d[k]; });
    d.hojas = [h]; d.act = 0; return d;
  },
  nueva(){ const d = { id:nuevoId('h'), titulo:'', hojas:[this.pestNueva('Hoja 1')], act:0, creado:Date.now(), cambiado:Date.now() }; const l = this.lista(); l.push(d); this.ponerLista(l); this.id = d.id; this.L = d; this.D = d.hojas[0]; return d; },
  tituloDe(d){ return (d.titulo || '').trim() || 'Hoja sin nombre'; },
  guardar(){
    if(!this.L) return; this.L.cambiado = Date.now(); this._cache = null;
    const l = this.lista(), i = l.findIndex(x => x.id === this.L.id); if(i < 0) l.push(this.L); else l[i] = this.L; this.ponerLista(l);
    const e = $('#ceEstado'); if(e){ e.textContent = '✓ Guardado'; }
    this.contar();
  },
  CLAVES: ['c', 'cols', 'filas', 'anchos', 'altos', 'fondo', 'sinRejilla', 'verTodo', 'figs', 'orient', 'margen', 'reglas'],
  copia(){ const o = {}; this.CLAVES.forEach(k => { o[k] = this.D[k] ?? null; }); this.deshacer.push(JSON.stringify(o)); if(this.deshacer.length > 60) this.deshacer.shift(); },
  atras(){ const s = this.deshacer.pop(); if(!s){ toast('No hay nada que deshacer'); return; } const o = JSON.parse(s); this.CLAVES.forEach(k => { if(o[k] == null) delete this.D[k]; else this.D[k] = o[k]; }); CeFig.figs = this.D.figs || []; CeFig.sel = null; this.guardar(); this.pintar(); },
  // una celda sin nada (ni texto ni formato) se quita
  vaciaCel(c){ return !c || (!String(c.v ?? '').trim() && !Object.keys(c).some(k => k !== 'v')); },

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
      try{ const ctx = { eur:false }; const v = this.formula(raw.slice(1), [...pila, k], ctx); out = typeof v === 'number' ? (isFinite(v) ? { v, eur:ctx.eur } : { v:'#DIV/0', err:true }) : typeof v === 'boolean' ? { v:v ? 'VERDADERO' : 'FALSO' } : { v }; }
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
      if(ch === '"'){ const j = s.indexOf('"', i + 1); if(j < 0) throw this.error('#ERROR', 'Falta cerrar las comillas'); T.push({ t:'str', v:s.slice(i + 1, j) }); i = j + 1; continue; }
      if((m = /^[A-Za-z]+\d+:[A-Za-z]+\d+/.exec(s.slice(i)))){ T.push({ t:'rango', v:m[0].toUpperCase() }); i += m[0].length; continue; }
      if((m = /^[A-Za-z]+\d+(?![A-Za-z(])/.exec(s.slice(i)))){ T.push({ t:'ref', v:m[0].toUpperCase() }); i += m[0].length; continue; }
      if((m = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?=\s*\()/.exec(s.slice(i)))){ T.push({ t:'fun', v:m[0].toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '') }); i += m[0].length; continue; }
      if((m = /^\d+(?:[.,]\d+)?/.exec(s.slice(i)))){ T.push({ t:'num', v:Number(m[0].replace(',', '.')) }); i += m[0].length; continue; }
      if((m = /^(>=|<=|<>|=>|=<|!=|>|<|=)/.exec(s.slice(i)))){ T.push({ t:'cmp', v:{ '=>':'>=', '=<':'<=', '!=':'<>' }[m[0]] || m[0] }); i += m[0].length; continue; }
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
    const num = v => { if(v === null || v === '') return 0; if(typeof v === 'number') return v; if(typeof v === 'boolean') return v ? 1 : 0; throw this.error('#VALOR', 'Hay texto donde va un número'); };
    const si = v => typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0 : typeof v === 'string' ? /^(verdadero|true|si|sí)$/i.test(v.trim()) : false;
    // comparar: =, <>, >, <, >=, <= (números o textos, sin mirar mayúsculas)
    const cmp = () => { let v = expr(); while(ver() && ver().t === 'cmp'){ const o = T[p++].v, w = expr();
        let a = v ?? 0, b = w ?? 0; if(typeof a === 'string' || typeof b === 'string'){ a = String(v ?? '').trim().toLowerCase(); b = String(w ?? '').trim().toLowerCase(); const na = this.numero(a), nb = this.numero(b); if(na !== null && nb !== null){ a = na; b = nb; } }
        v = o === '=' ? a === b : o === '<>' ? a !== b : o === '>' ? a > b : o === '<' ? a < b : o === '>=' ? a >= b : a <= b; } return v; };
    const expr = () => { let v = term(); while(ver() && (ver().t === '+' || ver().t === '-')){ const o = T[p++].t, w = term(); v = o === '+' ? num(v) + num(w) : num(v) - num(w); } return v; };
    const term = () => { let v = fac(); while(ver() && (ver().t === '*' || ver().t === '/')){ const o = T[p++].t, w = num(fac()); if(o === '/' && w === 0) throw this.error('#DIV/0'); v = o === '*' ? num(v) * w : num(v) / w; } return v; };
    const fac = () => {
      const t = T[p++]; if(!t) throw this.error('#ERROR', 'Falta algo al final');
      if(t.t === '-') return -num(fac()); if(t.t === '+') return num(fac());
      if(t.t === 'num') return t.v;
      if(t.t === 'str') return t.v;
      if(t.t === 'ref'){ const v = deCelda(t.v); return v === null ? 0 : v; }
      if(t.t === '('){ const v = cmp(); toma(')'); return v; }
      if(t.t === 'fun'){
        const f = this.ALIAS[t.v] || t.v; if(!this.FUN[f] && !this.FUN_SI[f]) throw this.error('#NOMBRE', '«' + t.v + '» no es una de las fórmulas');
        toma('('); const args = [];
        const fin = () => !T[p + 1] || T[p + 1].t === ';' || T[p + 1].t === ')';
        if(ver() && ver().t !== ')') for(;;){
          if(ver() && ver().t === 'ref' && fin()) args.push({ ref:deCelda(T[p++].v) });   // una celda sola
          else if(ver() && ver().t === 'rango' && fin()){ const [a, b] = T[p++].v.split(':'); args.push({ rango:this.rango(a, b).map(k => deCelda(k)) }); }
          else args.push({ v:cmp() });
          if(ver() && ver().t === ';'){ p++; continue; } break;
        }
        toma(')');
        const val = a => a.rango ? a.rango[0] ?? null : 'ref' in a ? a.ref : a.v;
        if(f === 'SI'){ if(args.length < 2) throw this.error('#ERROR', 'SI necesita: condición; si se cumple; si no'); const r = si(val(args[0])) ? val(args[1]) : args[2] ? val(args[2]) : false; return r === null ? 0 : r; }
        if(f === 'Y') return args.length > 0 && args.every(a => a.rango ? a.rango.every(si) : si(val(a)));
        if(f === 'O') return args.some(a => a.rango ? a.rango.some(si) : si(val(a)));
        // las de números: en una celda o un rango, el texto no cuenta
        const ns = []; args.forEach(a => { if(a.rango) a.rango.forEach(v => { if(typeof v === 'number') ns.push(v); }); else if('ref' in a){ if(typeof a.ref === 'number') ns.push(a.ref); } else ns.push(num(a.v)); });
        if(f === 'SUMA') return ns.reduce((a, b) => a + b, 0);
        if(f === 'RESTA') return ns.length ? ns.slice(1).reduce((a, b) => a - b, ns[0]) : 0;
        if(f === 'MULTIPLICAR') return ns.length ? ns.reduce((a, b) => a * b, 1) : 0;
        if(f === 'DIVIDIR'){ if(!ns.length) return 0; return ns.slice(1).reduce((a, b) => { if(b === 0) throw this.error('#DIV/0'); return a / b; }, ns[0]); }
        if(f === 'PROMEDIO'){ if(!ns.length) throw this.error('#DIV/0', 'No hay números'); return ns.reduce((a, b) => a + b, 0) / ns.length; }
      }
      throw this.error('#ERROR');
    };
    const v = cmp(); if(p < T.length) throw this.error('#ERROR', 'Sobra algo'); return v;
  },
  // pasa a mayúsculas (o lo que sea) solo lo que no está entre comillas
  fueraComillas(f, fn){ return String(f).split(/("[^"]*")/).map(x => x[0] === '"' ? x : fn(x)).join(''); },
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
    this.L = this.actual(); if(!this.L) return; this.migrar(this.L);
    this.L.act = Math.max(0, Math.min(this.L.hojas.length - 1, this.L.act || 0));
    this.D = this.L.hojas[this.L.act]; this.D.c = this.D.c || {}; this.D.cols = this.D.cols || 8; this.D.filas = this.D.filas || 30;
    this._cache = null; this.ed = null; this.deshacer = []; this.sel = { c:0, r:0 }; this.fin = { c:0, r:0 };
    $('#ceTitulo').value = this.L.titulo || '';
    CeFig.figs = this.D.figs = this.D.figs || []; CeFig.sel = null; this._etq = null;
    this.pintar(); this.marcar(); this.contar(); this.pintarPest();
  },
  ANCHO: 92, ALTO: 40,
  ancho(c){ return (this.D.anchos || {})[c] || this.ANCHO; },
  alto(r){ return (this.D.altos || {})[r] || this.ALTO; },
  // el formato de una celda: relleno, ribetes, negrita, cursiva, tachado, varias líneas
  tdHtml(k){
    const x = this.texto(k), cel = this.celda(k) || {}, bd = cel.bd || {}, L = (x.s || '').includes('\n');
    const lado = (s, n) => bd[s] ? `border-${n}:${bd[s][0]}px solid ${bd[s][1]};` : '';
    const rib = bd.t || bd.r || bd.b || bd.l ? `<i class="bd" style="${lado('t', 'top')}${lado('r', 'right')}${lado('b', 'bottom')}${lado('l', 'left')}"></i>` : '';
    return { cls:(x.cls || '') + (cel.b ? ' neg-b' : '') + (cel.i ? ' cur' : '') + (cel.s ? ' tach' : '') + (L ? ' ml' : '') + (cel.al ? ' al-' + cel.al : ''),
      st:(cc => cc ? 'background:' + cc.bg : cel.bg ? 'background:' + cel.bg : '')(this.colorCond(k)), html:`<div class="cv">${esc(x.s)}</div>${rib}`, tit:x.tit };
  },
  pintar(){
    const D = this.D, t = $('#ceTabla'); if(!D || !t) return; this._cache = null;
    let h = '<colgroup><col style="width:40px">';
    for(let c = 0; c < D.cols; c++) h += `<col style="width:${this.ancho(c)}px">`;
    h += '</colgroup><thead><tr><th class="ce-esq" title="Un toque: la tabla · dos: toda la hoja">◢</th>';
    for(let c = 0; c < D.cols; c++) h += `<th data-col="${c}">${this.letra(c)}<i class="ce-tir-c"></i></th>`;
    h += '</tr></thead><tbody>';
    for(let r = 0; r < D.filas; r++){
      const a = this.alto(r);
      h += `<tr style="height:${a}px;--h:${a - 4}px"><th data-fila="${r}">${r + 1}<i class="ce-tir-f"></i></th>`;
      for(let c = 0; c < D.cols; c++){ const k = this.ref(c, r), x = this.tdHtml(k);
        h += `<td data-c="${c}" data-r="${r}" class="${x.cls}"${x.st ? ` style="${x.st}"` : ''}${x.tit ? ` title="${esc(x.tit)}"` : ''}>${x.html}</td>`; }
      h += '</tr>';
    }
    t.innerHTML = h + '</tbody>';
    t.style.width = (40 + Array.from({ length:D.cols }, (_, c) => this.ancho(c)).reduce((a, b) => a + b, 0)) + 'px';
    const v = $('#vCeldas'); v.classList.toggle('sin-rejilla', !!D.sinRejilla); v.classList.toggle('ver-todo', !!D.verTodo);
    $('#cePapel').style.setProperty('--ce-fondo', D.fondo || 'var(--card)');
    this.marcar(); CeFig.pintarFigs(); this.pintarPaginas();
  },
  // vuelve a calcular y cambia solo las celdas
  refrescar(){
    this._cache = null;
    $$('#ceTabla td').forEach(td => { const x = this.tdHtml(this.ref(+td.dataset.c, +td.dataset.r));
      td.innerHTML = x.html; td.className = x.cls; td.style.cssText = x.st; if(x.tit) td.title = x.tit; else td.removeAttribute('title'); });
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
    $('#ceRef').textContent = this._etq || (mono ? k : this.ref(b.c1, b.r1) + ':' + this.ref(b.c2, b.r2)); this._etq = null;
    if(!this.ed){ const c = this.celda(k); $('#ceIn').value = c ? String(c.v ?? '') : ''; }
    this.pintarBarra();
  },
  pintarBarra(){
    const c = this.celda(this.ref(this.sel.c, this.sel.r)) || {}, t = c.t || 'auto';
    $('#ceTipo').innerHTML = { auto:'✨ Auto', num:'🔢 Número', txt:'🔤 Texto', eur:'💶 Moneda' }[t] + ' ▾';
    $('#ceEur').classList.toggle('on', t === 'eur');
    $('#ceD1').classList.toggle('on', c.d === 1); $('#ceD2').classList.toggle('on', c.d === 2); $('#ceD0').classList.toggle('on', c.d === 0);
    $('#ceNeg').classList.toggle('on', !!c.b); $('#ceCur').classList.toggle('on', !!c.i); $('#ceTach').classList.toggle('on', !!c.s);
    $('#ceRegla').classList.toggle('on', this.reglaH() || this.reglaV());
    $('#ceRej').classList.toggle('on', !this.D.sinRejilla); $('#ceVer').classList.toggle('on', !!this.D.verTodo);
    $('#vCeldas').classList.toggle('editando', !!this.ed);
  },
  contar(){ const n = this.D ? Object.values(this.D.c).filter(x => String(x.v ?? '').trim()).length : 0, e = $('#ceCuenta'); if(!e) return;
    const pg = this.D ? this.paginasUsadas() : 0; e.textContent = (n === 1 ? '1 celda' : n + ' celdas') + (pg ? ' · 📄 ' + (pg === 1 ? '1 hoja' : pg + ' hojas') : ''); },
  verCelda(c, r){
    const x = this.td(c, r), z = $('#ceZona'); if(!x || !z || this.D.verTodo) return;
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
  vivo(){ if(!this.ed) return; const v = $('#ceIn').value, p = this.deRef(this.ed.k), x = this.td(p.c, p.r); if(x){ x.innerHTML = `<div class="cv">${esc(v)}</div>`; x.className = 'sel editando-c' + (v.includes('\n') ? ' ml' : ''); }
    const i = $('#ceIn'); i.style.height = ''; if(v.includes('\n')) i.style.height = Math.min(110, i.scrollHeight) + 'px';
    $('#vCeldas').classList.toggle('modo-ref', v.trim()[0] === '='); },
  aceptar(mover){
    if(!this.ed) return; let v = $('#ceIn').value; const k = this.ed.k;
    if(v.trim()[0] === '='){ v = this.fueraComillas(v.trim(), x => x.toUpperCase()); const ab = (v.match(/\(/g) || []).length - (v.match(/\)/g) || []).length; if(ab > 0) v += ')'.repeat(ab); }   // cierra los paréntesis que falten
    this.ed = null; this._refR = null; $('#vCeldas').classList.remove('modo-ref');
    const c = this.celda(k), antes = c ? String(c.v ?? '') : '';
    if(v !== antes){
      this.copia();
      if(!v.trim()){ if(c){ delete c.v; if(this.vaciaCel(c)) delete this.D.c[k]; } }
      else { const n = this.D.c[k] = this.D.c[k] || {}; n.v = v;
        if(v[0] !== '=' && /€/.test(v) && (!n.t || n.t === 'auto' || n.t === 'num')){ n.t = 'eur'; n.v = v.replace(/\s*€\s*/g, '').trim(); } }
      this.guardar();
    }
    $('#ceIn').blur(); $('#ceIn').style.height = ''; this.refrescar();
    if(mover === 'abajo') this.ir(this.sel.c, this.sel.r + 1); else if(mover === 'der') this.ir(this.sel.c + 1, this.sel.r);
  },
  cancelar(){ if(!this.ed) return; this.ed = null; this._refR = null; $('#vCeldas').classList.remove('modo-ref'); $('#ceIn').blur(); this.refrescar(); },
  // con una fórmula a medias: tocar una celda (o arrastrar) pone su nombre donde está el cursor
  ponerRef(texto, inicio){
    const i = $('#ceIn'); let v = i.value, a = inicio != null ? inicio.a : (i.selectionStart ?? v.length), b = inicio != null ? inicio.b : (i.selectionEnd ?? v.length);
    if(inicio == null){ const antes = v.slice(0, a).trimEnd(); if(antes && !/[=(;:+\-*/<>]$/.test(antes)){ v = v.slice(0, a) + ';' + v.slice(b); a = b = a + 1; } }
    i.value = v.slice(0, a) + texto + v.slice(b); const fin = a + texto.length; try{ i.setSelectionRange(fin, fin); }catch(e){}
    this.vivo(); return { a, b:fin };
  },

  /* ---------- Fórmulas ---------- */
  menuFormulas(){
    const multi = this.refsSel().length > 1 && !this.ed;
    const p = popMio(`<h3 class="mp-h">Σ Fórmulas</h3>
      <p class="mp-p">${multi ? 'Tienes celdas marcadas: el resultado irá en la celda de debajo.' : 'Elige una y luego <b>toca o arrastra</b> por las celdas que quieras usar. Después pulsa <b>✓</b>.'}</p>
      ${Object.entries(this.FUN).map(([k, f]) => `<button class="mp-op" data-f="${k}"><span class="mp-ic">${f.ic}</span><span><b>${f.t}</b><small>${f.d} · <code>${f.ej}</code></small></span></button>`).join('')}
      <button class="mp-op" data-f="SI"><span class="mp-ic">🔀</span><span><b>SI</b><small>Pone una cosa u otra · <code>=SI(B2>=5;"Aprobado";"Suspendido")</code></small></span></button>
      <button class="mp-op" data-sipaso><span class="mp-ic">🪄</span><span><b>SI paso a paso</b><small>Te lo escribe: tú solo eliges la condición y los textos</small></span></button>
      <details class="ce-chuleta"><summary>📘 Chuleta: cómo se escriben</summary>
        <p><code>=SUMA(A1:A5)</code> suma · <code>=RESTA(A1;B1)</code> · <code>=MULTIPLICAR(A1;B1)</code> · <code>=DIVIDIR(A1;B1)</code> · <code>=PROMEDIO(A1:A5)</code></p>
        <p><b>SI</b>: <code>=SI(condición; si se cumple; si no)</code></p>
        <p>Ej.: nota en B2 → <code>=SI(B2>=5;"Aprobado";"Suspendido")</code>. Si en B2 hay un 7, sale <b>Aprobado</b>; si hay un 3, <b>Suspendido</b>.</p>
        <p>Tres casos (un SI dentro de otro): <code>=SI(B2<5;"Suspendido";SI(B2<=7;"Aprobado";"Notable"))</code></p>
        <p>Comparar: <code>=</code> igual · <code>&lt;&gt;</code> distinto · <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> · los textos van entre comillas <code>"…"</code> · se separa con <code>;</code></p>
        <p>Varias condiciones: <code>Y(…;…)</code> todas · <code>O(…;…)</code> alguna. Cuentas: <code>=A1+B1</code>, <code>=(A1+A2)/2</code></p>
        <p>Para ponerlo en toda una columna: cópialo y pégalo en las celdas de abajo (las letras se cambian solas).</p>
      </details>
      <div class="mp-fila"><button class="mp-b" data-x>Cancelar</button></div>`);
    p.addEventListener('mousedown', e => { if(e.target.closest('button')) e.preventDefault(); });
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return; cerrarPopMio(); if('sipaso' in b.dataset){ if(this.ed) this.aceptar(); this.ayudaSi(); } else if(b.dataset.f) this.ponerFormula(b.dataset.f); };
  },
  ponerFormula(f){
    if(this.ed){ this.ponerRef(f + '('); return; }
    if(this.FUN_SI[f]){ this.fin = { ...this.sel }; this.editar('=' + f + '('); toast('🔀 ' + this.FUN_SI[f].ej + ' · la chuleta está en «Σ Fórmulas»', null, null, 4500); return; }
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
  cadaSel(fn){ this.copia(); this.refsSel().forEach(k => { const c = this.D.c[k] = this.D.c[k] || {}; fn(c, k); if(this.vaciaCel(c)) delete this.D.c[k]; }); this.guardar(); this.refrescar(); },
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
  estilo(p){ const todas = this.refsSel().every(k => (this.celda(k) || {})[p]); this.cadaSel(x => { if(todas) delete x[p]; else x[p] = true; }); },
  negrita(){ this.estilo('b'); },
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
      if(b.dataset.id){ cerrarPopMio(); this.cancelar(); const ant = this.L; this.id = b.dataset.id; if(ant && this.vacio(ant) && ant.id !== this.id) this.ponerLista(this.lista().filter(x => x.id !== ant.id)); this.cargar(); }
      else if('nueva' in b.dataset){ cerrarPopMio(); this.cancelar(); if(this.L && this.vacio(this.L)){ toast('📊 Ya tienes una hoja en blanco'); return; } this.nueva(); this.cargar(); $('#ceTitulo').focus(); }
      else cerrarPopMio(); };
  },

  /* ---------- Sacarla: .csv (Excel, Numbers) o imprimir ---------- */
  menuSacar(){
    const p = popMio(`<h3 class="mp-h">📤 Abrir · guardar · imprimir</h3>
      <button class="mp-op" data-s="imp1"><span class="mp-ic">🖨️</span><span><b>Imprimir con cuadrícula</b><small>Con las líneas de las celdas, los colores y las figuras</small></span></button>
      <button class="mp-op" data-s="imp0"><span class="mp-ic">🖨️</span><span><b>Imprimir sin cuadrícula</b><small>Solo tus colores, ribetes, figuras e imágenes</small></span></button>
      <button class="mp-op" data-s="xlsx"><span class="mp-ic">📗</span><span><b>Guardar en Excel (.xlsx)</b><small>Con sus fórmulas, euros y decimales. Se abre con Excel, Numbers o Google</small></span></button>
      <button class="mp-op" data-s="csv"><span class="mp-ic">📄</span><span><b>Guardar como .csv</b><small>Solo los valores, sin formato</small></span></button>
      <button class="mp-op" data-s="abrir"><span class="mp-ic">📂</span><span><b>Abrir un archivo</b><small>Excel (.xlsx) o .csv (se abre en una hoja nueva)</small></span></button>
      <div class="mp-fila"><button class="mp-b" data-x>Cancelar</button></div>`);
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return; cerrarPopMio(); const s = b.dataset.s;
      if(s === 'csv') this.csv(); else if(s === 'xlsx') this.xlsx(); else if(s === 'imp1') this.imprimir(true); else if(s === 'imp0') this.imprimir(false); else if(s === 'abrir') this.elegirArchivo(); };
  },
  usado(){ let C = 0, R = 0; Object.keys(this.D.c).forEach(k => { const c = this.D.c[k]; if(!String(c.v ?? '').trim()) return; const p = this.deRef(k); if(p){ C = Math.max(C, p.c + 1); R = Math.max(R, p.r + 1); } }); return { C, R }; },
  nombreArch(){ return this.tituloDe(this.L).replace(/[\\/:*?"<>|…]/g, '').trim().slice(0, 60) || 'Hoja'; },
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
  // hasta dónde llega lo que hay (celdas con algo y figuras), en píxeles de la hoja
  zonaUsada(){
    const { C, R } = this.usado(), t = $('#ceTabla'); let W = 40, H = 0;
    const th = $('#ceTabla thead tr'), cab = th ? th.offsetHeight : 30;
    if(C){ const td = this.td(Math.min(C, this.D.cols) - 1, Math.min(R, this.D.filas) - 1); if(td){ W = td.offsetLeft + td.offsetWidth; H = td.offsetTop + td.offsetHeight; } }
    (CeFig.figs || []).forEach(f => { const b = CeFig.caja(f); W = Math.max(W, b.x + b.w + 6); H = Math.max(H, b.y + b.h + 6); });
    return { x:40, y:cab, w:Math.max(0, Math.min(W, t.offsetWidth + 400) - 40), h:Math.max(0, H - cab) };
  },
  async hojasImagen(rejilla){
    if(!window.html2canvas) await cargarScript('html2canvas.min.js');
    if(this.ed) this.aceptar(); CeFig.sel = null; CeFig.pintarSel();
    const Z = this.zonaUsada(); if(Z.w < 4 || Z.h < 4) return null;
    const pg = this.paginas(), xs = pg.xs.filter(x => x < Z.w), ys = pg.ys.filter(y => y < Z.h);
    const W = Math.min(Z.w, pg.xs[xs.length] ?? Z.w), H = Math.min(Z.h, pg.ys[ys.length] ?? Z.h);
    const ancho = (pg.xs[xs.length] ?? W), alto = (pg.ys[ys.length] ?? H);
    const P = $('#cePapel'), copia = P.cloneNode(true); copia.removeAttribute('id');
    copia.querySelectorAll('.sel,.en-rango,.ref-r').forEach(x => x.classList.remove('sel', 'en-rango', 'ref-r'));
    copia.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
    const marco = document.createElement('div'); marco.className = 'ce-imprime' + (rejilla ? '' : ' sin-rejilla');
    marco.style.cssText = `position:fixed;left:-${P.offsetWidth + 8000}px;top:0;width:${P.offsetWidth}px;background:#fff`;
    marco.appendChild(copia); document.body.appendChild(marco);
    copia.querySelectorAll('.ce-tir-c,.ce-tir-f,.ce-medir,.es-sel,.es-mbar,.ce-pags').forEach(x => x.remove()); copia.querySelectorAll('th.on').forEach(x => x.classList.remove('on'));
    // html2canvas no entiende los colores «color-mix» del tema: se pasan a rgb
    const rgb = v => v.replace(/color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.e-]+))?\)/g, (m, r, g, b, a) => `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a ?? 1})`);
    [copia, ...copia.querySelectorAll('*')].forEach(el => { const cs = getComputedStyle(el);
      ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'boxShadow', 'textDecorationColor', 'fill', 'stroke'].forEach(k => { const v = cs[k]; if(v && /color\(|color-mix/.test(v)) el.style[k] = rgb(v); }); });
    try{
      const ESC = 1.5, cv = await html2canvas(copia, { scale:ESC, backgroundColor:'#ffffff', useCORS:true, logging:false, x:Z.x, y:Z.y, width:Math.min(ancho, P.offsetWidth - Z.x), height:Math.min(alto, P.offsetHeight - Z.y), windowWidth:P.offsetWidth + 200 });
      const hz = this.D.orient === 'h', PW = hz ? 1123 : 794, PH = hz ? 794 : 1123, M = this.margenPx() * this.K, K = 2, k = this.K;   // K: calidad; k: tamaño en el papel
      const hojas = [];
      for(let yi = 0; yi < ys.length; yi++) for(let xi = 0; xi < xs.length; xi++){
        const x0 = pg.xs[xi], x1 = Math.min(pg.xs[xi + 1] ?? W, cv.width / ESC), y0 = pg.ys[yi], y1 = Math.min(pg.ys[yi + 1] ?? H, cv.height / ESC);
        if(x1 <= x0 || y1 <= y0) continue;
        const c = document.createElement('canvas'); c.width = PW * K; c.height = PH * K; const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(cv, x0 * ESC, y0 * ESC, (x1 - x0) * ESC, (y1 - y0) * ESC, M * K, M * K, (x1 - x0) * k * K, (y1 - y0) * k * K);
        hojas.push(c.toDataURL('image/jpeg', 0.92));
      }
      return { hojas, hz };
    }finally{ marco.remove(); }
  },
  async imprimir(rejilla){
    if(!this.usado().C && !(CeFig.figs || []).length){ toast('La hoja está vacía'); return; }
    toast('🖨️ Preparando…', null, null, 20000);
    try{ const r = await this.hojasImagen(rejilla); $('#toast').classList.remove('ver'); if(r) imprimirHojas(r.hojas, this.nombreArch(), r.hz); }
    catch(e){ console.warn(e); toast('⚠️ No se ha podido preparar (¿sin internet la primera vez?)'); }
  },

  /* ---------- Tocar y arrastrar ---------- */
  enlazar(){
    const z = $('#ceZona'), tabla = $('#ceTabla'); let P = null;
    const tdEn = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest ? el.closest('#ceTabla td') : null; };
    const auto = (x, y) => { const r = z.getBoundingClientRect(); if(x > r.right - 16) z.scrollLeft += 12; else if(x < r.left + 50) z.scrollLeft -= 12; if(y > r.bottom - 16) z.scrollTop += 12; else if(y < r.top + 40) z.scrollTop -= 12; };
    z.addEventListener('pointerdown', e => {
      if(!this.D || (e.pointerType === 'mouse' && e.button) || e.isPrimary === false) return;
      if(this.desplazar && e.pointerType !== 'mouse') return;
      const th = e.target.closest('#ceTabla th');
      if(th && !this.ed && (e.target.closest('.ce-tir-c, .ce-tir-f'))){ this.tirar(e, th); return; }
      if(th && !this.ed && th.classList.contains('ce-esq')){ this.esquina(); return; }
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
      if(CeFig.sel) CeFig.seleccionar(null);
      const yaSel = this.sel.c === c && this.sel.r === r && this.fin.c === c && this.fin.r === r;
      P = { c, r, x:e.clientX, y:e.clientY, id:e.pointerId, yaSel, on:true, mov:false, raton:e.pointerType === 'mouse' };
      if(e.shiftKey){ this.fin = { c, r }; this.marcar(); P = null; return; }
      this.sel = { c, r }; this.fin = { c, r }; this.marcar();
      if(!P.raton){ e.preventDefault(); $('#vCeldas').classList.add('marcando'); try{z.setPointerCapture(e.pointerId);}catch(_){} }   // con el dedo: mantener pulsado y arrastrar para marcar varias
    });
    addEventListener('pointermove', e => {
      if(!P || e.pointerId !== P.id) return;
      if(P.ref){ e.preventDefault(); auto(e.clientX, e.clientY); const td = tdEn(e.clientX, e.clientY); if(!td) return; const k = this.ref(+td.dataset.c, +td.dataset.r);
        if(this._refR[1] !== k){ this._refR = [P.a, k]; P.ins = this.ponerRef(P.a === k ? k : P.a + ':' + k, P.ins); this.marcar(); } return; }
      if(!P.on){ if(Math.hypot(e.clientX - P.x, e.clientY - P.y) > 8){ P.mov = true; clearTimeout(P.t); P = null; } return; }   // con el dedo, sin mantener: se desplaza la hoja
      if(Math.hypot(e.clientX - P.x, e.clientY - P.y) > 4) P.mov = true;
      auto(e.clientX, e.clientY);
      const td = tdEn(e.clientX, e.clientY); if(td){ const c = +td.dataset.c, r = +td.dataset.r; if(c !== this.fin.c || r !== this.fin.r){ this.fin = { c, r }; this.marcar(); P.mov = true; } }
    }, { passive:false });
    const fin = e => { if(!P || (e && e.pointerId !== P.id)) return; const p = P; P = null; clearTimeout(p.t); $('#vCeldas').classList.remove('marcando');
      if(p.ref){ $('#ceIn').focus(); return; }
      if(e.type !== 'pointercancel' && p.yaSel && !p.mov) this.editar();   // tocar otra vez la celda: escribir en ella
    };
    addEventListener('pointerup', fin); addEventListener('pointercancel', fin);
    z.addEventListener('touchmove', e => { if(P && (P.ref || P.on) && e.cancelable) e.preventDefault(); }, { passive:false });
    z.addEventListener('touchstart', e => { if(this.ed && $('#ceIn').value.trim()[0] === '=' && e.target.closest('#ceTabla td') && e.cancelable) e.preventDefault(); }, { passive:false });   // que no se vaya el teclado
    let cabToque=null,ultimo=null;
    z.addEventListener('pointerdown',e=>{const th=e.target.closest('th[data-col],th[data-fila]');cabToque=th&&!e.target.closest('.ce-tir-c,.ce-tir-f')?{th,id:e.pointerId,x:e.clientX,y:e.clientY}:null;});
    z.addEventListener('pointerup',e=>{
      const t=cabToque;cabToque=null;if(!t||t.id!==e.pointerId||Math.hypot(e.clientX-t.x,e.clientY-t.y)>8)return;
      const col=t.th.dataset.col!=null,n=+(col?t.th.dataset.col:t.th.dataset.fila),key=(col?'c':'r')+n,ahora=Date.now();
      if(ultimo&&ultimo.key===key&&ahora-ultimo.t<350){
        ultimo=null;if(this.ed)this.aceptar();this.copia();
        this.ajustar(col?{c1:n,c2:n,r1:0,r2:this.D.filas-1}:{c1:0,c2:this.D.cols-1,r1:n,r2:n},col?'columna':'fila');
        this.guardar();this.pintar();toast(col?'Ancho ajustado al contenido':'Alto ajustado al contenido');
      }else ultimo={key,t:ahora};
    });
    z.addEventListener('pointercancel',()=>{cabToque=null;ultimo=null;});
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
      if(e.key === 'Enter' && (e.altKey || e.shiftKey)){ e.preventDefault(); this.salto(); }
      else if(e.key === 'Enter'){ e.preventDefault(); this.aceptar('abajo'); }
      else if(e.key === 'Tab'){ e.preventDefault(); this.aceptar('der'); }
      else if(e.key === 'Escape'){ e.preventDefault(); this.cancelar(); }
    });
    $('#ceOk').addEventListener('mousedown', e => e.preventDefault()); $('#ceOk').onclick = () => { if(this.ed) this.aceptar(); else this.editar(); };
    $('#ceNo').addEventListener('mousedown', e => e.preventDefault()); $('#ceNo').onclick = () => this.cancelar();
    $('#ceSalto').addEventListener('mousedown', e => e.preventDefault()); $('#ceSalto').onclick = () => this.salto();
    this.iniciarMas();
    $('#ceZona').addEventListener('scroll', () => this.moverRegla(), { passive:true });
    $('#cePest').onclick = e => { const b = e.target.closest('button'); if(!b) return; if('mas' in b.dataset) this.nuevaPest(); else { const i = +b.dataset.i; if(i === this.L.act) this.menuPest(i); else this.irPest(i); } };
    deslizarLado($('#cePest'));
    addEventListener('resize', () => { if(this.activa()){ clearTimeout(this._trs); this._trs = setTimeout(() => this.pintarPaginas(), 200); } });
    // el teclado del ordenador
    document.addEventListener('keydown', e => {
      if(!this.activa() || this.ed || $('#mioPop') || $('.mio-hoja')) return;
      const a = document.activeElement; if(a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable)) return;
      const k = e.key, m = { ArrowUp:[0, -1], ArrowDown:[0, 1], ArrowLeft:[-1, 0], ArrowRight:[1, 0] }[k];
      if(m){ e.preventDefault(); const b = e.shiftKey ? this.fin : this.sel; this.ir(b.c + m[0], b.r + m[1], e.shiftKey); }
      else if(k === 'Enter' || k === 'F2'){ e.preventDefault(); this.editar(); }
      else if(k === 'Delete' || k === 'Backspace'){ e.preventDefault(); this.borrarSel(); }
      else if((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'z'){ e.preventDefault(); this.atras(); }
      else if((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'c'){ if(CeFig.sel) return; e.preventDefault(); this.copiar(); }
      else if((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'x'){ e.preventDefault(); this.copiar(true); }
      else if((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'v'){ return; }   // lo hace «paste» (texto o imagen)
      else if((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'b'){ e.preventDefault(); this.estilo('b'); }
      else if((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'i'){ e.preventDefault(); this.estilo('i'); }
      else if(e.metaKey || e.ctrlKey || e.altKey) return;
      else if(k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey){ e.preventDefault(); this.editar(k); }
      else if(k === 'Tab'){ e.preventDefault(); this.ir(this.sel.c + (e.shiftKey ? -1 : 1), this.sel.r); }
    });
    const B = $('#ceBarra');
    B.addEventListener('mousedown', e => { if(e.target.closest('button')) e.preventDefault(); });
    B.onclick = e => { const b = e.target.closest('button'); if(!b) return;
      ({ ceFx:() => this.menuFormulas(), ceTipo:() => { if(this.ed) this.aceptar(); this.menuTipo(); }, ceEur:() => { if(this.ed) this.aceptar(); this.euro(); },
        ceD0:() => { if(this.ed) this.aceptar(); this.decimales(0); }, ceD1:() => { if(this.ed) this.aceptar(); this.decimales(1); }, ceD2:() => { if(this.ed) this.aceptar(); this.decimales(2); },
        ceNeg:() => { if(this.ed) this.aceptar(); this.estilo('b'); }, ceCur:() => { if(this.ed) this.aceptar(); this.estilo('i'); }, ceTach:() => { if(this.ed) this.aceptar(); this.estilo('s'); },
        ceColor:() => { if(this.ed) this.aceptar(); this.menuColor(); }, ceRib:() => { if(this.ed) this.aceptar(); this.menuRibete(); },
        ceRej:() => { if(this.ed) this.aceptar(); this.rejilla(); }, ceTam:() => { if(this.ed) this.aceptar(); this.menuTam(); }, ceVer:() => { if(this.ed) this.aceptar(); this.verTodo(); },
        ceCopiar:() => { if(this.ed) this.aceptar(); this.copiar(); }, cePegar:() => { if(this.ed) this.aceptar(); this.pegarBoton(); },
        ceCond:() => { if(this.ed) this.aceptar(); this.menuCond(); },
        ceHojas:() => { if(this.ed) this.aceptar(); this.menuHojas(); }, ceRegla:() => { if(this.ed) this.aceptar(); this.menuRegla(); },
        ceImg:() => { if(this.ed) this.aceptar(); this.menuImagen(); }, ceForma:() => { if(this.ed) this.aceptar(); this.forma(); }, ceTit:() => { if(this.ed) this.aceptar(); this.titulo(); }, ceBorrar:() => { if(this.ed){ $('#ceIn').value = ''; this.vivo(); } else this.borrarSel(); },
        ceFila:() => { if(this.ed) this.aceptar(); this.masFila(); }, ceCol:() => { if(this.ed) this.aceptar(); this.masCol(); },
        ceAtras:() => { this.atras(); } }[b.id] || (() => {}))(); };
    deslizarLado(B);
    $('#ceMis').onclick = () => { if(this.ed) this.aceptar(); this.misHojas(); };
    $('#ceTitulo').addEventListener('input', () => { if(!this.L) return; this.L.titulo = $('#ceTitulo').value; clearTimeout(this._tt); this._tt = setTimeout(() => this.guardar(), 500); });
    $('#ceSalir').onclick = () => { if(this.ed) this.aceptar(); irA('portada'); };
    $('#ceSacar').onclick = () => { if(this.ed) this.aceptar(); this.menuSacar(); };
  }
};

/* ---------- V16.2 · Colores, ribetes, tamaños, ver todo, copiar y pegar, imágenes, figuras y títulos ---------- */
// Las figuras de la hoja son las mismas que las de Escribir (formas, líneas, flechas), y además imágenes y títulos.
const CeFig = Object.assign(Object.create(Escribir), {
  FIGID: { papel:'#cePapel', atras:'#ceFondo', delante:'#ceDelante', boton:'#ceForma' },
  figs: [], sel: null,
  cambioFigs(){ if(!Celdas.D) return; Celdas.D.figs = JSON.parse(JSON.stringify(this.figs)); Celdas.guardar(); },
  cursorEn(){}, guardarCursor(){}, restaurarCursor(){},
  // una figura nueva sale en la celda elegida
  nuevaFig(F, [w, h]){
    const td = Celdas.td(Celdas.sel.c, Celdas.sel.r), x = td ? td.offsetLeft + 6 : 60, y = td ? td.offsetTop + 6 : 60;
    return { id:nuevoId('fg'), tipo:F.tipo, ribete:F.ribete, grosor:F.grosor, relleno:F.relleno, giro:F.giro, capa:F.capa, x:Math.round(x), y:Math.round(y), w:Math.round(w), h:Math.round(h) };
  },
  seleccionar(id){
    this.sel = id; this.pintarSel();
    if(id){ const n = +(lsGet('ph3-ce-pista') || 0); if(n < 3){ lsSet('ph3-ce-pista', String(n + 1)); toast('Arrástrala para moverla · esquinas: tamaño · ↻ azul: girarla', null, null, 3500); } }
  }
});

Object.assign(Celdas, {
  COLORES: ['#ffffff','#f2f2f4','#d9d9de','#9aa0a6','#3a3a3c','#ffd6d4','#ffb3ae','#e5201c','#ffe8c7','#ffc97a','#f08a1a','#fff6bf','#ffe45c','#f2c418','#d6f2dc','#a8e2b6','#3fae5a','#d4e6fb','#9cc6f5','#2f80ed','#e6dcfb','#c3adf3','#8b5adf','#fbd6e8','#f5a8cc','#e84898','#efe3d6','#d6b896','#8a5a3c'],
  muestras(attr, act){ return `<div class="ce-cols">${this.COLORES.map(c => `<button ${attr}="${c}" class="${act === c ? 'on' : ''}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>`; },

  /* --- Relleno de las celdas y color de toda la hoja --- */
  menuColor(){
    const c = this.celda(this.ref(this.sel.c, this.sel.r)) || {};
    const p = popMio(`<div class="ts-cab"><h3 class="mp-h">🎨 Colores</h3><button class="mp-b mp-pri ts-listo" data-x>✓ Listo</button></div>
      <div class="ab-tit">Rellenar ${this.refsSel().length > 1 ? 'las celdas marcadas' : 'la celda'}</div>
      ${this.muestras('data-bg', c.bg)}<button class="sh-op" data-bg="" style="margin-top:6px">✕ Sin relleno</button>
      <div class="ab-tit">Color de toda la hoja <small>(cada hoja puede tener el suyo)</small></div>
      ${this.muestras('data-fondo', this.D.fondo)}<button class="sh-op" data-fondo="" style="margin-top:6px">✕ Como el tema</button>`, 'ce-pop');
    p.addEventListener('mousedown', e => { if(e.target.closest('button')) e.preventDefault(); });
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return;
      if(b.dataset.bg != null){ const v = b.dataset.bg; this.cadaSel(x => { if(v) x.bg = v; else delete x.bg; }); $$('[data-bg]', p).forEach(y => y.classList.toggle('on', y === b && !!v)); }
      else if(b.dataset.fondo != null){ this.copia(); const v = b.dataset.fondo; if(v) this.D.fondo = v; else delete this.D.fondo; this.guardar(); this.pintar(); $$('[data-fondo]', p).forEach(y => y.classList.toggle('on', y === b && !!v)); }
      else cerrarPopMio(); };
  },

  /* --- Ribetes: alrededor, todas las celdas, solo abajo; grosor y color --- */
  menuRibete(){
    const R = this._rib = this._rib || { g:2, c:'#3a3a3c' };
    const p = popMio(`<div class="ts-cab"><h3 class="mp-h">▢ Ribete</h3><button class="mp-b mp-pri ts-listo" data-x>✓ Listo</button></div>
      <div class="ce-rib-dnd">${[['fuera','▢','Alrededor'],['todas','▦','Todas'],['abajo','▁','Abajo'],['quitar','✕','Quitar']].map(([k, ic, n]) => `<button data-donde="${k}"><b>${ic}</b><small>${n}</small></button>`).join('')}</div>
      <div class="ab-tit">Grosor</div>
      <div class="es-gros">${[1, 2, 3, 4, 6, 8].map(g => `<button data-g="${g}" class="${R.g === g ? 'on' : ''}"><i style="height:${g}px"></i><small>${g}</small></button>`).join('')}</div>
      <div class="ab-tit">Color del ribete</div>${this.muestras('data-c', R.c)}
      <p class="aj-ayuda">Primero elige el grosor y el color; después, dónde ponerlo. Para que no se vean las líneas grises de las celdas, usa «▦ Cuadrícula».</p>`, 'ce-pop');
    p.addEventListener('mousedown', e => { if(e.target.closest('button')) e.preventDefault(); });
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return; const d = b.dataset;
      if(d.g){ R.g = +d.g; $$('[data-g]', p).forEach(y => y.classList.toggle('on', y === b)); }
      else if(d.c){ R.c = d.c; $$('[data-c]', p).forEach(y => y.classList.toggle('on', y === b)); }
      else if(d.donde){ this.ponerRibete(d.donde, R.g, R.c); toast(d.donde === 'quitar' ? '✕ Ribete quitado' : '▢ Ribete puesto', null, null, 1000); }
      else cerrarPopMio(); };
  },
  ponerRibete(donde, g, col){
    const b = this.caja(), v = [g, col];
    this.cadaSel((x, k) => {
      const q = this.deRef(k), bd = x.bd = x.bd || {};
      if(donde === 'quitar'){ delete x.bd; return; }
      if(donde === 'abajo'){ if(q.r === b.r2) bd.b = v; }
      else if(donde === 'fuera'){ if(q.r === b.r1) bd.t = v; if(q.r === b.r2) bd.b = v; if(q.c === b.c1) bd.l = v; if(q.c === b.c2) bd.r = v; }
      else { bd.t = v; bd.l = v; if(q.r === b.r2) bd.b = v; if(q.c === b.c2) bd.r = v; }   // todas: sin líneas dobles
      if(!Object.keys(bd).length) delete x.bd;
    });
  },
  rejilla(){ this.copia(); this.D.sinRejilla = !this.D.sinRejilla; if(!this.D.sinRejilla) delete this.D.sinRejilla; this.guardar(); this.pintar(); toast(this.D.sinRejilla ? '▦ Sin las líneas de las celdas' : '▦ Con las líneas de las celdas', null, null, 1200); },

  /* --- Ancho de las columnas y alto de las filas --- */
  menuTam(){
    const b = this.caja(), w = this.ancho(b.c1), h = this.alto(b.r1);
    const cols = b.c1 === b.c2 ? 'la columna ' + this.letra(b.c1) : 'las columnas ' + this.letra(b.c1) + ' a ' + this.letra(b.c2);
    const fils = b.r1 === b.r2 ? 'la fila ' + (b.r1 + 1) : 'las filas ' + (b.r1 + 1) + ' a ' + (b.r2 + 1);
    const p = popMio(`<div class="ts-cab"><h3 class="mp-h">↔ Tamaño</h3><button class="mp-b mp-pri ts-listo" data-x>✓ Listo</button></div>
      <div class="ab-tit">Ancho de ${cols} · <b id="ceTw">${w}</b></div>
      <div class="es-grosor"><span>⟷</span><input type="range" min="36" max="1200" value="${w}" id="ceTwR"><span>⟷⟷</span></div>
      <label class="lbl">Ancho exacto (px)<input id="ceTwN" type="number" min="36" max="1200" value="${w}"></label>
      <div class="ab-tit">Alto de ${fils} · <b id="ceTh">${h}</b></div>
      <div class="es-grosor"><span>↕</span><input type="range" min="24" max="2000" value="${h}" id="ceThR"><span>↕↕</span></div>
      <label class="lbl">Alto exacto (px)<input id="ceThN" type="number" min="24" max="2000" value="${h}"></label>
      <div class="mp-fila"><button class="mp-b" data-ajustar>⤢ A lo que hay dentro</button><button class="mp-b" data-normal>↺ Normal</button></div>
      <p class="aj-ayuda">El ancho afecta a toda la columna; el alto, a toda la fila. Arrastra el borde derecho de una letra o el borde inferior de un número. Doble toque en la letra o el número: autoajustar.</p>`, 'ce-pop');
    let copiado = false; const cp = () => { if(!copiado){ this.copia(); copiado = true; } };
    const cambiar=(col,v)=>{if(!Number.isFinite(v))return;cp();v=Math.round(Math.max(col?36:24,Math.min(col?1200:2000,v)));const k=col?'ceTw':'ceTh';$('#'+k,p).textContent=v;$('#'+k+'R',p).value=v;$('#'+k+'N',p).value=v;if(col){for(let c=b.c1;c<=b.c2;c++)this.ponAncho(c,v);}else{for(let r=b.r1;r<=b.r2;r++)this.ponAlto(r,v);}};
    const fin=()=>{this.guardar();this.pintar();};
    ['ceTw','ceTh'].forEach((k,i)=>{const col=i===0;$('#'+k+'R',p).oninput=e=>cambiar(col,+e.target.value);$('#'+k+'R',p).onchange=fin;$('#'+k+'N',p).onchange=e=>{if(e.target.value!==''){cambiar(col,+e.target.value);fin();}};});
    p.onclick = e => { const x = e.target.closest('button'); if(!x) return;
      if('ajustar' in x.dataset){ cp(); this.ajustar(b); fin(); cerrarPopMio(); }
      else if('normal' in x.dataset){ cp(); for(let c = b.c1; c <= b.c2; c++) this.ponAncho(c, this.ANCHO); for(let r = b.r1; r <= b.r2; r++) this.ponAlto(r, this.ALTO); fin(); cerrarPopMio(); }
      else {const w=$('#ceTwN',p).value,h=$('#ceThN',p).value;if(w!=='')cambiar(true,+w);if(h!=='')cambiar(false,+h);fin();cerrarPopMio();} };
  },
  ponAncho(c, v){ delete this.D.verTodo;$('#vCeldas').classList.remove('ver-todo'); const A = this.D.anchos = this.D.anchos || {}; if(v === this.ANCHO) delete A[c]; else A[c] = Math.round(v); if(!Object.keys(A).length) delete this.D.anchos;
    const col = $$('#ceTabla col')[c + 1]; if(col) col.style.width = this.ancho(c) + 'px';
    const t = $('#ceTabla'); t.style.width = (40 + Array.from({ length:this.D.cols }, (_, i) => this.ancho(i)).reduce((a, b) => a + b, 0)) + 'px'; },
  ponAlto(r, v){ delete this.D.verTodo;$('#vCeldas').classList.remove('ver-todo'); const A = this.D.altos = this.D.altos || {}; if(v === this.ALTO) delete A[r]; else A[r] = Math.round(v); if(!Object.keys(A).length) delete this.D.altos;
    const tr = $$('#ceTabla tbody tr')[r]; if(tr){ tr.style.height = this.alto(r) + 'px'; tr.style.setProperty('--h', (this.alto(r) - 4) + 'px'); } },
  // mide lo que hay dentro de las celdas para que quepa
  medir(txt, cls, ancho){
    const m = this._m = this._m || Object.assign(document.createElement('div'), { className:'ce-medir' });
    if(!m.isConnected) $('#cePapel').appendChild(m);
    m.className = 'ce-medir ' + (cls || '');m.style.width=ancho?Math.max(1,ancho-16)+'px':'auto';m.style.whiteSpace=ancho?'pre-wrap':'pre';m.style.overflowWrap=ancho?'anywhere':'normal'; m.textContent = txt; return { w:m.offsetWidth, h:m.offsetHeight };
  },
  ajustar(b, eje){
    if(eje!=='fila')for(let c = b.c1; c <= b.c2; c++){ let w = 0; for(let r = 0; r < this.D.filas; r++){ const k = this.ref(c, r); if(!this.celda(k)) continue; const x = this.tdHtml(k), s = this.texto(k).s; if(s) w = Math.max(w, this.medir(s, x.cls).w + 18); } if(w) this.ponAncho(c, Math.max(this.ANCHO, Math.min(1200, w))); }
    if(eje!=='columna')for(let r = b.r1; r <= b.r2; r++){ let h = 0; for(let c = 0; c < this.D.cols; c++){ const k = this.ref(c, r); if(!this.celda(k)) continue; const x = this.tdHtml(k), s = this.texto(k).s; if(s) h = Math.max(h, this.medir(s, x.cls, this.ancho(c)).h + 12); } if(h) this.ponAlto(r, Math.max(this.ALTO, Math.min(2000, h))); }
  },
  // arrastrar la rayita del borde de una columna o de una fila
  tirar(e, th){
    e.preventDefault(); e.stopPropagation();
    const col = th.dataset.col != null, n = +(col ? th.dataset.col : th.dataset.fila), v0 = col ? this.ancho(n) : this.alto(n), p0 = col ? e.clientX : e.clientY;
    this.copia(); $('#vCeldas').classList.add('tirando');try{th.setPointerCapture(e.pointerId);}catch(_){}
    const mv = ev => { if(ev.pointerId!==e.pointerId)return;if(ev.cancelable) ev.preventDefault(); const v = Math.max(col ? 36 : 24, Math.min(col ? 1200 : 2000, v0 + (col ? ev.clientX : ev.clientY) - p0)); if(col) this.ponAncho(n, v); else this.ponAlto(n, v); this._etq = (col ? 'Ancho ' : 'Alto ') + Math.round(v); $('#ceRef').textContent = this._etq; };
    const fin = ev => { if(ev.pointerId!==e.pointerId)return;if(ev.type==='pointercancel'){if(col)this.ponAncho(n,v0);else this.ponAlto(n,v0);} removeEventListener('pointermove', mv); removeEventListener('pointerup', fin); removeEventListener('pointercancel', fin); $('#vCeldas').classList.remove('tirando'); this._etq = null; this.guardar(); this.pintar(); };
    addEventListener('pointermove', mv, { passive:false }); addEventListener('pointerup', fin); addEventListener('pointercancel', fin);
  },
  // «⤢ Ver todo»: las celdas se hacen grandes para que se vea todo; otra vez, como estaban
  verTodo(){ this.D.verTodo = !this.D.verTodo; if(!this.D.verTodo) delete this.D.verTodo; this.guardar(); this.pintar(); toast(this.D.verTodo ? '⤢ Se ve todo lo que hay en las celdas' : '⤡ Las celdas vuelven a su tamaño', null, null, 1500); },
  // un salto de línea dentro de la celda
  salto(){ const i = $('#ceIn'); if(!this.ed) this.editar(); const a = i.selectionStart ?? i.value.length, b = i.selectionEnd ?? a; i.value = i.value.slice(0, a) + '\n' + i.value.slice(b); try{ i.setSelectionRange(a + 1, a + 1); }catch(e){} i.focus(); this.vivo(); },

  /* --- La esquina: un toque, la tabla (lo que tiene datos); dos toques, toda la hoja --- */
  esquina(){
    const ahora = Date.now(), doble = ahora - (this._tEsq || 0) < 450; this._tEsq = doble ? 0 : ahora;
    if(doble){ this.sel = { c:0, r:0 }; this.fin = { c:this.D.cols - 1, r:this.D.filas - 1 }; this._etq = 'Todo'; this.marcar(); this.aviso('▦ Toda la hoja seleccionada'); return; }
    const pg = this.paginas(), c2 = Math.min(this.D.cols, pg.cols[1] ?? this.D.cols) - 1, r2 = Math.min(this.D.filas, pg.filas[1] ?? this.D.filas) - 1;
    this.sel = { c:0, r:0 }; this.fin = { c:c2, r:r2 }; this._etq = '1ª hoja'; this.marcar();
    this.aviso('📄 La 1ª hoja (DIN A4) seleccionada: A1:' + this.ref(c2, r2) + ' · toca dos veces para toda la hoja');
  },
  aviso(t){ const a = $('#ceAviso'); if(!a) return; a.textContent = t; a.classList.add('ver'); clearTimeout(this._tAv); this._tAv = setTimeout(() => a.classList.remove('ver'), 2600); },

  /* --- Copiar y pegar celdas --- */
  copiar(cortar){
    const b = this.caja(), celdas = {};
    for(let r = b.r1; r <= b.r2; r++) for(let c = b.c1; c <= b.c2; c++){ const k = this.ref(c, r), x = this.celda(k); if(x) celdas[(r - b.r1) + ',' + (c - b.c1)] = JSON.parse(JSON.stringify(x)); }
    const txt = []; for(let r = b.r1; r <= b.r2; r++){ const f = []; for(let c = b.c1; c <= b.c2; c++) f.push(this.texto(this.ref(c, r)).s); txt.push(f.join('\t')); }
    this.clip = { celdas, w:b.c2 - b.c1 + 1, h:b.r2 - b.r1 + 1, c0:b.c1, r0:b.r1, txt:txt.join('\n') };
    try{ navigator.clipboard && navigator.clipboard.writeText(this.clip.txt).catch(() => {}); }catch(e){}
    if(cortar){ this.copia(); this.refsSel().forEach(k => delete this.D.c[k]); this.guardar(); this.refrescar(); }
    const n = this.clip.w * this.clip.h; this.aviso((cortar ? '✂️ Cortado' : '📋 Copiado') + (n > 1 ? ' (' + n + ' celdas)' : ' ' + this.ref(b.c1, b.r1)) + ' · ve a otra celda y pulsa «Pegar»');
  },
  // mueve las celdas de una fórmula (=A1+B2 copiada una fila abajo → =A2+B3)
  moverRefs(f, dc, dr){ return this.fueraComillas(f, x => x.replace(/\b([A-Z]+)(\d+)\b/g, (m, L, n) => { const q = this.deRef(m); if(!q) return m; const c = Math.max(0, q.c + dc), r = Math.max(0, q.r + dr); return this.ref(c, r); })); },
  pegarDe(clip, conFormato){
    this.copia(); const dc = this.sel.c - clip.c0, dr = this.sel.r - clip.r0;
    for(let r = 0; r < clip.h; r++) for(let c = 0; c < clip.w; c++){
      const k = this.ref(this.sel.c + c, this.sel.r + r), o = clip.celdas[r + ',' + c];
      if(this.sel.r + r >= this.D.filas) this.D.filas = this.sel.r + r + 5; if(this.sel.c + c >= this.D.cols) this.D.cols = Math.min(52, this.sel.c + c + 1);
      if(!o){ if(conFormato) delete this.D.c[k]; else if(this.D.c[k]){ delete this.D.c[k].v; if(this.vaciaCel(this.D.c[k])) delete this.D.c[k]; } continue; }
      const v = typeof o.v === 'string' && o.v[0] === '=' ? this.moverRefs(o.v, dc, dr) : o.v;
      if(conFormato) this.D.c[k] = { ...JSON.parse(JSON.stringify(o)), v };
      else { const n = this.D.c[k] = this.D.c[k] || {}; if(v == null) delete n.v; else n.v = v; if(this.vaciaCel(n)) delete this.D.c[k]; }
    }
    this.fin = { c:this.sel.c + clip.w - 1, r:this.sel.r + clip.h - 1 };
    this.guardar(); this.pintar(); this.aviso('📋 Pegado' + (conFormato ? ' con su formato' : ' sin el formato'));
  },
  preguntarPegar(clip){
    const p = popMio(`<h3 class="mp-h">📋 ¿Cómo lo pego?</h3>
      <button class="mp-op" data-f="1"><span class="mp-ic">🎨</span><span><b>Con el mismo formato</b><small>Colores, ribetes, negrita, euros, decimales…</small></span></button>
      <button class="mp-op" data-f="0"><span class="mp-ic">📝</span><span><b>Solo lo que hay dentro</b><small>Se queda el formato de aquí</small></span></button>
      <div class="mp-fila"><button class="mp-b" data-x>Cancelar</button></div>`);
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return; cerrarPopMio(); if(b.dataset.f != null) this.pegarDe(clip, b.dataset.f === '1'); };
  },
  // texto de otro sitio (de Excel, de una web…): con tabuladores y líneas
  pegarTexto(t){
    const filas = t.replace(/\r/g, '').replace(/\n$/, '').split('\n'), celdas = {};
    filas.forEach((f, r) => f.split('\t').forEach((v, c) => { if(v.trim()) celdas[r + ',' + c] = { v:v.trim() }; }));
    this.pegarDe({ celdas, w:Math.max(...filas.map(f => f.split('\t').length)), h:filas.length, c0:this.sel.c, r0:this.sel.r }, true);
  },
  async pegarBoton(){
    // primero mira si en el portapapeles hay una imagen
    try{ if(navigator.clipboard && navigator.clipboard.read){ const its = await navigator.clipboard.read();
      for(const it of its){ const t = it.types.find(x => x.startsWith('image/')); if(t){ this.ponerImagen(await it.getType(t)); return; } } } }catch(e){}
    if(this.clip){ this.preguntarPegar(this.clip); return; }
    try{ const t = navigator.clipboard && navigator.clipboard.readText ? await navigator.clipboard.readText() : ''; if(t){ this.pegarTexto(t); return; } }catch(e){}
    toast('No hay nada copiado: marca unas celdas y pulsa «Copiar»');
  },
  alPegar(e){
    if(!this.activa() || $('#mioPop') || $('.mio-hoja')) return;
    const d = e.clipboardData; if(!d) return;
    const img = [...(d.items || [])].find(x => x.kind === 'file' && x.type.startsWith('image/'));
    if(img){ e.preventDefault(); if(this.ed) this.aceptar(); this.ponerImagen(img.getAsFile()); return; }
    const a = document.activeElement; if(this.ed || (a && /INPUT|TEXTAREA/.test(a.tagName))) return;   // escribiendo: pega el texto normal
    const t = d.getData('text/plain'); e.preventDefault();
    if(this.clip && t === this.clip.txt){ this.preguntarPegar(this.clip); return; }
    if(t) this.pegarTexto(t);
  },

  /* --- Imágenes (dentro de una celda; se mueven y se hacen grandes o pequeñas con los dedos) --- */
  menuImagen(){
    const p = popMio(`<h3 class="mp-h">🖼️ Poner una imagen</h3>
      <button class="mp-op" data-i="arch"><span class="mp-ic">📷</span><span><b>De las fotos o de un archivo</b><small>Sale en la celda elegida</small></span></button>
      <button class="mp-op" data-i="pegar"><span class="mp-ic">📋</span><span><b>Pegar la que he copiado</b><small>También con Ctrl+V (⌘V en el Mac)</small></span></button>
      <div class="mp-fila"><button class="mp-b" data-x>Cancelar</button></div>`);
    p.onclick = async e => { const b = e.target.closest('button'); if(!b) return; cerrarPopMio();
      if(b.dataset.i === 'arch'){ const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.style.display = 'none'; i.onchange = () => { const f = i.files[0]; i.remove(); if(f) this.ponerImagen(f); }; document.body.appendChild(i); i.click(); }
      else if(b.dataset.i === 'pegar'){ try{ const its = await navigator.clipboard.read(); for(const it of its){ const t = it.types.find(x => x.startsWith('image/')); if(t){ this.ponerImagen(await it.getType(t)); return; } } toast('No hay ninguna imagen copiada'); }catch(err){ toast('Copia una imagen y pulsa Ctrl+V (⌘V)'); } } };
  },
  async ponerImagen(blob){
    if(!blob) return;
    try{
      const src = await aligerarImg(blob, 1000, .8);
      const im = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
      const td = this.td(this.sel.c, this.sel.r), w = Math.max(80, Math.min(260, td ? td.offsetWidth - 4 : 160)), h = Math.round(w * im.height / im.width);
      const f = { id:nuevoId('fg'), tipo:'img', src, giro:0, capa:'delante', x:td ? td.offsetLeft + 2 : 60, y:td ? td.offsetTop + 2 : 60, w, h };
      CeFig.figs.push(f); CeFig.pintarFigs(); CeFig.seleccionar(f.id); CeFig.cambioFigs();
      toast('🖼️ Imagen puesta · arrástrala y tira de las esquinas para cambiar el tamaño', null, null, 3000);
    }catch(e){ console.warn(e); toast('⚠️ No se ha podido poner esa imagen'); }
  },

  /* --- Figuras y títulos (como en Escribir) --- */
  forma(){
    const f = CeFig.figSel();
    if(f && f.tipo === 'tit'){ this.titulo(f); return; }
    if(f && f.tipo === 'img'){ toast('La imagen se mueve arrastrándola y cambia de tamaño con las esquinas'); return; }
    CeFig.figura();
  },
  titulo(f){
    f = f || (CeFig.figSel() && CeFig.figSel().tipo === 'tit' ? CeFig.figSel() : null);
    const el = f ? { dataset:{ tit:JSON.stringify(f.t || {}) } } : null;
    Escribir.tituloBonito(el, t => {
      if(!t){ if(f){ CeFig.quitarFig(f); } return; }
      const px = t.tam === 'enorme' ? 52 : t.tam === 'mediano' ? 30 : 40, w = Math.max(80, Math.round(this.medir(t.texto, '').w * px / 16 * .62 + 24));
      if(f){ f.t = t; f.h = f.h || px; }
      else { const td = this.td(this.sel.c, this.sel.r); f = { id:nuevoId('fg'), tipo:'tit', t, giro:0, capa:'delante', x:td ? td.offsetLeft + 4 : 60, y:td ? td.offsetTop + 2 : 60, w, h:px }; CeFig.figs.push(f); }
      CeFig.pintarFigs();
      const el = $(`#ceDelante .es-fg[data-id="${f.id}"], #ceFondo .es-fg[data-id="${f.id}"]`), d = el && el.firstChild;   // el ancho justo para las letras
      if(d){ d.style.width = 'max-content'; f.w = Math.ceil(d.scrollWidth) + 16; d.style.width = ''; CeFig.estiloFig(el, f); }
      CeFig.seleccionar(f.id); CeFig.cambioFigs();
    });
  },

  iniciarMas(){
    document.addEventListener('paste', e => this.alPegar(e));
    const P = $('#cePapel');
    P.addEventListener('pointerdown', ev => { if(this.ed && !ev.target.closest('.es-fg, .es-sel, .es-mbar')) return; CeFig.figDown(ev); }, true);
    P.addEventListener('click', ev => { const b = ev.target.closest('.es-mbar button'); if(!b) return; const f = CeFig.figSel(); if(!f) return;
      if(b.dataset.capa){ f.capa = b.dataset.capa; CeFig.pintarFigs(); CeFig.cambioFigs(); toast(f.capa === 'detras' ? '⬇️ Detrás de las celdas (para cogerla, toca su borde)' : '⬆️ Delante de las celdas', null, null, 2200); }
      else if('quitar' in b.dataset) CeFig.quitarFig(f); });
    document.addEventListener('keydown', ev => { if(!this.activa() || !CeFig.sel) return; const a = document.activeElement;
      if(a && (a.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(a.tagName))) return;
      if(ev.key === 'Delete' || ev.key === 'Backspace'){ ev.preventDefault(); ev.stopImmediatePropagation(); CeFig.quitarFig(CeFig.figSel()); }
      else if(ev.key === 'Escape') CeFig.seleccionar(null); }, true);
  }
});

/* ---------- V16.3 · Hojas DIN A4, regla y pestañas ----------
   Al imprimir, la hoja va al 75 % (como Excel: una columna de 92 px ≈ 1,8 cm) en folios DIN A4 con márgenes.
   Las hojas se cortan siempre entre columnas y entre filas; en la pantalla se ven con una raya azul. */
Object.assign(Celdas, {
  K: 0.75, PXCM: 37.8 / 0.75,   // 1 cm del papel = 50,4 px de la hoja
  MARGENES: { estrecho:[1, 'Estrechos · 1 cm'], normal:[1.5, 'Normales · 1,5 cm'], ancho:[2.5, 'Anchos · 2,5 cm'] },
  margenCm(){ return (this.MARGENES[this.D.margen] || this.MARGENES.normal)[0]; },
  margenPx(){ return this.margenCm() * this.PXCM; },
  util(){ const hz = this.D.orient === 'h', m = this.margenCm(); return { w:((hz ? 29.7 : 21) - 2 * m) * this.PXCM, h:((hz ? 21 : 29.7) - 2 * m) * this.PXCM }; },
  // dónde empieza cada hoja: columnas (xs, en px desde la A) y filas (ys, en px desde la 1)
  paginas(){
    const U = this.util(), out = { xs:[0], ys:[0], cols:[0], filas:[0], U };
    const corta = (n, tam, lim, pos, idx) => { let acc = 0, ini = 0, x = 0; for(let i = 0; i < n; i++){ const t = tam(i); if(acc + t > lim + .5 && i > ini){ pos.push(x); idx.push(i); acc = 0; ini = i; } acc += t; x += t; } };
    corta(Math.max(this.D.cols, 60), c => this.ancho(c), U.w, out.xs, out.cols);
    corta(Math.max(this.D.filas, 200), r => this.alto(r), U.h, out.ys, out.filas);
    return out;
  },
  paginasUsadas(){
    if(!$('#ceTabla td')) return 0; const Z = this.zonaUsada(); if(Z.w < 2 || Z.h < 2) return 0;
    const pg = this.paginas(); return pg.xs.filter(x => x < Z.w - 1).length * pg.ys.filter(y => y < Z.h - 1).length;
  },
  verHojas(){ return lsGet('ph3-ce-verpag') !== '0'; },
  pintarPaginas(){
    const P = $('#cePapel'), t = $('#ceTabla'); if(!P || !t) return;
    let L = $('#cePags'); if(!L){ L = document.createElement('div'); L.id = 'cePags'; L.className = 'ce-pags'; P.insertBefore(L, $('#ceDelante')); }
    const cab = ($('#ceTabla thead tr') || {}).offsetHeight || 30, W = t.offsetWidth, H = t.offsetHeight;
    const pg = this.paginas(); let h = '';
    if(this.verHojas()){
      pg.xs.slice(1).forEach(x => { if(40 + x < W) h += `<i class="pv" style="left:${40 + x}px;top:${cab}px;height:${H - cab}px"></i>`; });
      pg.ys.slice(1).forEach(y => { if(cab + y < H) h += `<i class="ph" style="top:${cab + y}px;left:40px;width:${W - 40}px"></i>`; });
      let n = 0; pg.ys.forEach(y => { if(cab + y >= H) return; pg.xs.forEach(x => { if(40 + x >= W) return; n++; h += `<b class="pn" style="left:${40 + x + 3}px;top:${cab + y + 2}px">Hoja ${n}</b>`; }); });
    }
    L.innerHTML = h;
    this.pintarRegla(pg);
  },
  /* --- regla de arriba y de al lado: en cm del papel; vuelve a 0 en cada hoja; la raya roja es donde acaba el papel (margen) --- */
  reglaH(){ return lsGet('ph3-ce-regla-h') === '1'; }, reglaV(){ return lsGet('ph3-ce-regla-v') === '1'; },
  pintarRegla(pg){
    const M = $('#ceMarco'); if(!M) return; pg = pg || this.paginas();
    const t = $('#ceTabla'), cab = ($('#ceTabla thead tr') || {}).offsetHeight || 30, W = t.offsetWidth, H = t.offsetHeight, C = this.PXCM;
    M.classList.toggle('con-rh', this.reglaH()); M.classList.toggle('con-rv', this.reglaV());
    const marcas = (ini, fin, util, horiz) => { let s = '';
      for(let i = 0; ini + i * C / 2 <= fin + 1; i++){ const p = ini + i * C / 2, cm = i / 2, entero = i % 2 === 0;
        s += horiz ? `<line x1="${p.toFixed(1)}" x2="${p.toFixed(1)}" y1="${entero ? 9 : 13}" y2="18"/>` : `<line y1="${p.toFixed(1)}" y2="${p.toFixed(1)}" x1="${entero ? 9 : 13}" x2="18"/>`;
        if(entero && cm > 0) s += horiz ? `<text x="${p.toFixed(1)}" y="8">${cm}</text>` : `<text x="8" y="${(p + 3).toFixed(1)}" transform="rotate(-90 8 ${(p + 3).toFixed(1)})">${cm}</text>`; }
      const e = ini + util; if(e < fin + C) s += horiz ? `<rect class="fin" x="${e.toFixed(1)}" y="0" width="${Math.max(0, fin - e).toFixed(1)}" height="18"/><line class="lim" x1="${e.toFixed(1)}" x2="${e.toFixed(1)}" y1="0" y2="18"/>` : `<rect class="fin" y="${e.toFixed(1)}" x="0" height="${Math.max(0, fin - e).toFixed(1)}" width="18"/><line class="lim" y1="${e.toFixed(1)}" y2="${e.toFixed(1)}" x1="0" x2="18"/>`;
      return s; };
    if(this.reglaH()){ let s = ''; pg.xs.forEach((x, i) => { const a = 40 + x, b = 40 + (pg.xs[i + 1] ?? (W - 40)); if(a < W) s += marcas(a, Math.min(b, W), pg.U.w, true) + (i ? `<line class="pag" x1="${a}" x2="${a}" y1="0" y2="18"/>` : ''); });
      $('#ceRgH').innerHTML = `<svg width="${W}" height="18" viewBox="0 0 ${W} 18"><rect class="mar" x="0" y="0" width="40" height="18"/>${s}</svg>`; }
    if(this.reglaV()){ let s = ''; pg.ys.forEach((y, i) => { const a = cab + y, b = cab + (pg.ys[i + 1] ?? (H - cab)); if(a < H) s += marcas(a, Math.min(b, H), pg.U.h, false) + (i ? `<line class="pag" y1="${a}" y2="${a}" x1="0" x2="18"/>` : ''); });
      $('#ceRgV').innerHTML = `<svg width="18" height="${H}" viewBox="0 0 18 ${H}"><rect class="mar" x="0" y="0" width="18" height="${cab}"/>${s}</svg>`; }
    this.moverRegla();
  },
  moverRegla(){ const z = $('#ceZona'), h = $('#ceRgH svg'), v = $('#ceRgV svg'); if(h) h.style.transform = `translateX(${-z.scrollLeft}px)`; if(v) v.style.transform = `translateY(${-z.scrollTop}px)`; },
  menuRegla(){
    const p = popMio(`<h3 class="mp-h">📏 Regla</h3>
      <label class="check"><input type="checkbox" id="ceRgHc" ${this.reglaH() ? 'checked' : ''}><span class="caja"></span><span>Regla de arriba<small>En centímetros del papel; vuelve a 0 en cada hoja</small></span></label>
      <label class="check"><input type="checkbox" id="ceRgVc" ${this.reglaV() ? 'checked' : ''}><span class="caja"></span><span>Regla al lado<small>La zona roja es lo que ya no cabe en el folio</small></span></label>
      <div class="mp-fila"><button class="mp-b mp-pri" data-x>Listo</button></div>`);
    const ok = () => { lsSet('ph3-ce-regla-h', $('#ceRgHc', p).checked ? '1' : null); lsSet('ph3-ce-regla-v', $('#ceRgVc', p).checked ? '1' : null); this.pintarRegla(); this.pintarBarra(); };
    $('#ceRgHc', p).onchange = ok; $('#ceRgVc', p).onchange = ok; p.querySelector('[data-x]').onclick = () => cerrarPopMio();
  },
  menuHojas(){
    const D = this.D;
    const p = popMio(`<div class="ts-cab"><h3 class="mp-h">📄 Hojas (DIN A4)</h3><button class="mp-b mp-pri ts-listo" data-x>✓ Listo</button></div>
      <label class="check"><input type="checkbox" id="ceVerPag" ${this.verHojas() ? 'checked' : ''}><span class="caja"></span><span>Ver dónde se corta cada hoja<small>Una raya azul y «Hoja 1, 2…»: así sabes lo que cabe en cada folio</small></span></label>
      <div class="ab-tit">El folio</div>
      <div class="es-ori"><button data-or="v" class="${D.orient !== 'h' ? 'on' : ''}"><i class="v"></i>Vertical</button><button data-or="h" class="${D.orient === 'h' ? 'on' : ''}"><i class="h"></i>Horizontal</button></div>
      <div class="ab-tit">Márgenes</div>
      <div class="seg ce-mar">${Object.entries(this.MARGENES).map(([k, [, n]]) => `<button data-mar="${k}" class="${(D.margen || 'normal') === k ? 'on' : ''}">${n.replace(' · ', '<small>') + '</small>'}</button>`).join('')}</div>
      <p class="aj-ayuda" id="ceHojasInfo"></p>`, 'ce-pop');
    const info = () => { const U = this.util(), n = this.paginasUsadas(); $('#ceHojasInfo', p).innerHTML = `En cada folio caben unos <b>${(U.w / this.PXCM).toFixed(1).replace('.', ',')} × ${(U.h / this.PXCM).toFixed(1).replace('.', ',')} cm</b>. Lo que tienes ocupa <b>${n || 0} ${n === 1 ? 'hoja' : 'hojas'}</b>.`; };
    info();
    $('#ceVerPag', p).onchange = e => { lsSet('ph3-ce-verpag', e.target.checked ? null : '0'); this.pintarPaginas(); };
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return;
      if(b.dataset.or){ this.copia(); if(b.dataset.or === 'h') D.orient = 'h'; else delete D.orient; $$('[data-or]', p).forEach(x => x.classList.toggle('on', x === b)); this.guardar(); this.pintarPaginas(); info(); }
      else if(b.dataset.mar){ this.copia(); if(b.dataset.mar === 'normal') delete D.margen; else D.margen = b.dataset.mar; $$('[data-mar]', p).forEach(x => x.classList.toggle('on', x === b)); this.guardar(); this.pintarPaginas(); info(); }
      else if('x' in b.dataset) cerrarPopMio(); };
  },

  /* --- Pestañas (abajo): tocar = ir; tocar la que está abierta = nombre, color, mover, duplicar, quitar; «＋» = una nueva --- */
  claro(c){ if(!c || c[0] !== '#') return true; const n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (r * 299 + g * 587 + b * 114) / 1000 > 150; },
  pintarPest(){
    const B = $('#cePest'); if(!B || !this.L) return;
    B.innerHTML = this.L.hojas.map((h, i) => `<button class="ce-pt ${i === this.L.act ? 'on' : ''} ${h.color && !this.claro(h.color) ? 'osc' : ''}" data-i="${i}" style="${h.color ? '--pc:' + h.color : ''}">${esc(h.nombre || 'Hoja ' + (i + 1))}${i === this.L.act ? ' <small>▾</small>' : ''}</button>`).join('')
      + '<button class="ce-pt ce-pt-mas" data-mas aria-label="Pestaña nueva">＋</button>';
    const on = $('.ce-pt.on', B); if(on){ const r = on.offsetLeft - B.clientWidth / 2 + on.offsetWidth / 2; if(on.offsetLeft < B.scrollLeft || on.offsetLeft + on.offsetWidth > B.scrollLeft + B.clientWidth) B.scrollLeft = r; }
  },
  irPest(i){
    if(this.ed) this.aceptar(); CeFig.seleccionar(null);
    this.L.act = i; this.D = this.L.hojas[i]; this.D.c = this.D.c || {}; this.D.cols = this.D.cols || 8; this.D.filas = this.D.filas || 30;
    CeFig.figs = this.D.figs = this.D.figs || []; this.deshacer = []; this.sel = { c:0, r:0 }; this.fin = { c:0, r:0 }; this._cache = null;
    this.guardar(); this.pintar(); this.pintarPest(); $('#ceZona').scrollTo(0, 0);
  },
  pestanaPop(tit, h, extra){
    return `<div class="ts-cab"><h3 class="mp-h">${tit}</h3><button class="mp-b mp-pri ts-listo" data-ok>✓ ${extra ? 'Listo' : 'Poner'}</button></div>
      <div class="ab-tit">Nombre</div><input class="mp-input" id="cePtNom" value="${esc(h.nombre || '')}" maxlength="30" autocomplete="off" enterkeyhint="done">
      <div class="ab-tit">Color de la pestaña</div>${this.muestras('data-pc', h.color)}<button class="sh-op" data-pc="" style="margin-top:6px">✕ Sin color</button>${extra || ''}`;
  },
  nuevaPest(){
    if(this.ed) this.aceptar();
    const h = { nombre:'Hoja ' + (this.L.hojas.length + 1), color:'' };
    const p = popMio(this.pestanaPop('＋ ¿Pongo una pestaña nueva?', h), 'ce-pop');
    const nom = $('#cePtNom', p); setTimeout(() => { nom.focus(); nom.select(); }, 250);
    const poner = () => { cerrarPopMio(); const n = this.pestNueva(nom.value.trim() || h.nombre, h.color); this.L.hojas.push(n); this.irPest(this.L.hojas.length - 1); toast('＋ Pestaña «' + n.nombre + '»', null, null, 1500); };
    nom.onkeydown = e => { if(e.key === 'Enter') poner(); };
    p.onclick = e => { const b = e.target.closest('button'); if(!b) return;
      if(b.dataset.pc != null){ h.color = b.dataset.pc; $$('[data-pc]', p).forEach(x => x.classList.toggle('on', x === b && !!h.color)); }
      else if('ok' in b.dataset) poner(); };
  },
  menuPest(i){
    if(this.ed) this.aceptar();
    const h = this.L.hojas[i], n = this.L.hojas.length;
    const extra = `<div class="ab-tit">Más</div><div class="ce-pt-ops">
      <button data-mv="-1" ${i === 0 ? 'disabled' : ''}>◀ Mover</button><button data-mv="1" ${i === n - 1 ? 'disabled' : ''}>Mover ▶</button>
      <button data-dup>📑 Duplicar</button><button data-quitar class="peligro" ${n === 1 ? 'disabled' : ''}>🗑️ Quitar</button></div>`;
    const p = popMio(this.pestanaPop('📑 Pestaña', h, extra), 'ce-pop');
    const nom = $('#cePtNom', p);
    nom.oninput = () => { h.nombre = nom.value; this.pintarPest(); clearTimeout(this._tpn); this._tpn = setTimeout(() => this.guardar(), 400); };
    nom.onkeydown = e => { if(e.key === 'Enter'){ nom.blur(); cerrarPopMio(); } };
    p.onclick = e => { const b = e.target.closest('button'); if(!b || b.disabled) return; const d = b.dataset;
      if(d.pc != null){ if(d.pc) h.color = d.pc; else delete h.color; $$('[data-pc]', p).forEach(x => x.classList.toggle('on', x === b && !!d.pc)); this.guardar(); this.pintarPest(); }
      else if(d.mv){ const j = i + +d.mv; const L = this.L.hojas; [L[i], L[j]] = [L[j], L[i]]; this.L.act = j; cerrarPopMio(); this.guardar(); this.pintarPest(); }
      else if('dup' in d){ const c = JSON.parse(JSON.stringify(h)); c.id = nuevoId('p'); c.nombre = (h.nombre || 'Hoja') + ' (copia)'; (c.figs || []).forEach(f => { f.id = nuevoId('fg'); }); this.L.hojas.splice(i + 1, 0, c); cerrarPopMio(); this.irPest(i + 1); toast('📑 Pestaña duplicada', null, null, 1500); }
      else if('quitar' in d){ cerrarPopMio(); const q = this.L.hojas.splice(i, 1)[0]; this.irPest(Math.max(0, i - 1));
        toast('🗑️ Pestaña «' + (q.nombre || '') + '» quitada', 'Deshacer', () => { this.L.hojas.splice(i, 0, q); this.irPest(i); toast('↩️ La pestaña vuelve a estar'); }, this.segQuitar || 6000); }
      else if('ok' in d){ cerrarPopMio(); this.guardar(); } };
  }
});

/* ---------- V16.4 · Formato condicional y la fórmula SI ----------
   Reglas de cada pestaña (D.reglas): [{ rango:'B2:B30', op:'entre', a:5, b:7, bg:'#ffc97a' }]. La primera que se cumple pinta la celda. */
Object.assign(Celdas, {
  FUN_SI: {
    SI:{ t:'SI (si se cumple… si no…)', ic:'🔀', d:'Pone una cosa u otra según una condición', ej:'=SI(B2>=5;"Aprobado";"Suspendido")' },
    Y:{ t:'Y', ic:'∧', d:'Se cumplen todas', ej:'=SI(Y(B2>=5;C2>=5);"Bien";"Mal")' },
    O:{ t:'O', ic:'∨', d:'Se cumple alguna', ej:'=SI(O(B2>9;C2>9);"Matrícula";"")' }
  },
  OPS: { entre:'está entre', menor:'es menor que', menorIgual:'es menor o igual que', mayor:'es mayor que', mayorIgual:'es mayor o igual que', igual:'es igual a', distinto:'no es igual a', contiene:'contiene el texto' },
  // ¿se cumple la regla en este valor?
  cumple(R, v){
    if(v === null || v === undefined || v === '') return false;
    if(R.op === 'contiene') return String(v).toLowerCase().includes(String(R.a ?? '').toLowerCase());
    if(R.op === 'igual' || R.op === 'distinto'){ const n = this.numero(String(R.a ?? '')), ig = typeof v === 'number' && n !== null ? Math.abs(v - n) < 1e-9 : String(v).trim().toLowerCase() === String(R.a ?? '').trim().toLowerCase(); return R.op === 'igual' ? ig : !ig; }
    if(typeof v !== 'number') return false;
    const a = +R.a, b = +R.b;
    return R.op === 'entre' ? v >= Math.min(a, b) && v <= Math.max(a, b) : R.op === 'menor' ? v < a : R.op === 'menorIgual' ? v <= a : R.op === 'mayor' ? v > a : R.op === 'mayorIgual' ? v >= a : false;
  },
  enRango(rg, k){ const [x, y] = String(rg || '').split(':'), A = this.deRef(x), B = this.deRef(y || x), q = this.deRef(k); if(!A || !B || !q) return false;
    return q.c >= Math.min(A.c, B.c) && q.c <= Math.max(A.c, B.c) && q.r >= Math.min(A.r, B.r) && q.r <= Math.max(A.r, B.r); },
  colorCond(k){
    const rs = this.D.reglas; if(!rs || !rs.length) return null;
    const cel = this.celda(k); if(!cel || !String(cel.v ?? '').trim()) return null;
    let v = null;
    for(const R of rs){ if(!this.enRango(R.rango, k)) continue; if(v === null){ const r = this.valor(k); if(r.err) return null; v = r.v; } if(this.cumple(R, v)) return R; }
    return null;
  },
  frase(R){ const n = x => String(x ?? '').replace('.', ','); return this.OPS[R.op] + ' ' + (R.op === 'entre' ? n(R.a) + ' y ' + n(R.b) : R.op === 'contiene' || isNaN(+R.a) ? '«' + (R.a ?? '') + '»' : n(R.a)); },

  menuCond(){
    const D = this.D, rs = D.reglas || [], b = this.caja(), rgSel = this.ref(b.c1, b.r1) + (b.c1 !== b.c2 || b.r1 !== b.r2 ? ':' + this.ref(b.c2, b.r2) : '');
    const p = popMio(`<div class="ts-cab"><h3 class="mp-h">🚦 Colores según lo que hay</h3><button class="mp-b mp-pri ts-listo" data-x>✓ Listo</button></div>
      <p class="mp-p">Pinta las celdas solas según su número o su texto. Primero marca las celdas.</p>
      ${rs.length ? `<div class="ce-reglas">${rs.map((R, i) => `<div class="ce-regla"><i style="background:${R.bg}"></i><span><b>${esc(R.rango)}</b> · si ${esc(this.frase(R))}</span><button data-edit="${i}" aria-label="Cambiar">✏️</button><button data-quita="${i}" aria-label="Quitar">🗑️</button></div>`).join('')}</div>` : '<p class="aj-ayuda">Todavía no hay ninguna regla en esta pestaña.</p>'}
      <button class="mp-op" data-nueva><span class="mp-ic">＋</span><span><b>Nueva regla</b><small>Para ${esc(rgSel)}</small></span></button>
      <button class="mp-op" data-notas><span class="mp-ic">🎓</span><span><b>Notas: rojo, naranja y verde</b><small>${esc(rgSel)}: menos de 5 rojo · de 5 a 7 naranja · más de 7 verde</small></span></button>`, 'ce-pop');
    p.onclick = e => { const x = e.target.closest('button'); if(!x) return; const d = x.dataset;
      if('nueva' in d) this.editarRegla(null, rgSel);
      else if(d.edit != null) this.editarRegla(+d.edit);
      else if(d.quita != null){ this.copia(); rs.splice(+d.quita, 1); if(!rs.length) delete D.reglas; this.guardar(); this.refrescar(); this.menuCond(); }
      else if('notas' in d){ this.copia(); D.reglas = [...rs, { rango:rgSel, op:'menor', a:5, bg:'#ffb3ae' }, { rango:rgSel, op:'entre', a:5, b:7, bg:'#ffc97a' }, { rango:rgSel, op:'mayor', a:7, bg:'#a8e2b6' }];
        this.guardar(); this.refrescar(); this.menuCond(); toast('🎓 Colores de las notas puestos en ' + rgSel, null, null, 2200); }
      else cerrarPopMio(); };
  },
  editarRegla(i, rgSel){
    const D = this.D, R = i != null ? { ...D.reglas[i] } : { rango:rgSel, op:'entre', a:'', b:'', bg:'#ffb3ae' };
    const p = popMio(`<div class="ts-cab"><h3 class="mp-h">🚦 ${i != null ? 'Cambiar la regla' : 'Nueva regla'}</h3><button class="mp-b mp-pri ts-listo" data-ok>✓ Guardar</button></div>
      <div class="ab-tit">Celdas</div><input class="mp-input" id="crRg" value="${esc(R.rango)}" autocomplete="off" autocapitalize="characters" placeholder="B2:B30">
      <div class="ab-tit">Si el valor…</div>
      <select class="mp-input" id="crOp">${Object.entries(this.OPS).map(([k, t]) => `<option value="${k}" ${R.op === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
      <div class="ce-cr-vals"><input class="mp-input" id="crA" value="${esc(String(R.a ?? '').replace('.', ','))}" autocomplete="off" placeholder="5"><span id="crY">y</span><input class="mp-input" id="crB" value="${esc(String(R.b ?? '').replace('.', ','))}" autocomplete="off" placeholder="7"></div>
      <div class="ab-tit">…se pinta de este color</div>${this.muestras('data-bg', R.bg)}
      <div class="ce-cr-prev" id="crPrev"></div>`, 'ce-pop');
    const op = $('#crOp', p), A = $('#crA', p), B = $('#crB', p);
    const ver = () => { const entre = op.value === 'entre', txt = op.value === 'contiene' || op.value === 'igual' || op.value === 'distinto';
      B.style.display = $('#crY', p).style.display = entre ? '' : 'none'; A.setAttribute('inputmode', txt ? 'text' : 'decimal'); A.placeholder = txt ? 'Aprobado' : '5';
      $('#crPrev', p).innerHTML = `<i style="background:${R.bg}"></i> Si ${esc(this.frase({ op:op.value, a:A.value, b:B.value }))} → este color`; };
    op.onchange = ver; A.oninput = ver; B.oninput = ver; ver();
    p.onclick = e => { const x = e.target.closest('button'); if(!x) return;
      if(x.dataset.bg){ R.bg = x.dataset.bg; $$('[data-bg]', p).forEach(y => y.classList.toggle('on', y === x)); ver(); return; }
      if(!('ok' in x.dataset)) return;
      const rg = $('#crRg', p).value.trim().toUpperCase().replace(/\s/g, '');
      if(!/^[A-Z]+\d+(:[A-Z]+\d+)?$/.test(rg)){ toast('Escribe las celdas así: B2 o B2:B30'); return; }
      const o = op.value, num = v => { const n = this.numero(v); return n === null ? null : n; };
      const r = { rango:rg, op:o, bg:R.bg };
      if(o === 'contiene' || o === 'igual' || o === 'distinto'){ if(!A.value.trim()){ toast('Escribe con qué comparar'); return; } r.a = num(A.value) ?? A.value.trim(); }
      else { const a = num(A.value), b = num(B.value); if(a === null || (o === 'entre' && b === null)){ toast('Escribe ' + (o === 'entre' ? 'los dos números' : 'el número')); return; } r.a = a; if(o === 'entre') r.b = b; }
      this.copia(); D.reglas = D.reglas || []; if(i != null) D.reglas[i] = r; else D.reglas.push(r);
      this.guardar(); this.refrescar(); this.menuCond(); };
  },

  /* --- Ayuda para escribir un SI sin acordarse de cómo va --- */
  ayudaSi(){
    const b = this.caja(), dest = this.ref(this.sel.c, this.sel.r), mira = (() => { for(let c = this.sel.c - 1; c >= 0; c--){ const k = this.ref(c, this.sel.r), v = this.valor(k).v; if(typeof v === 'number') return k; } return this.sel.c > 0 ? this.ref(this.sel.c - 1, this.sel.r) : 'A' + (this.sel.r + 1); })();   // la celda con número más cercana a la izquierda
    const p = popMio(`<div class="ts-cab"><h3 class="mp-h">🔀 Un SI paso a paso</h3><button class="mp-b mp-pri ts-listo" data-ok>✓ Poner</button></div>
      <p class="mp-p">En la celda <b>${dest}</b>:</p>
      <div class="ce-si"><span>Si la celda</span><input class="mp-input" id="siC" value="${mira}" autocapitalize="characters"></div>
      <div class="ce-si ce-si2"><select class="mp-input" id="siO">${[['>=','es mayor o igual que'],['>','es mayor que'],['<','es menor que'],['<=','es menor o igual que'],['=','es igual a'],['<>','no es igual a']].map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select>
        <input class="mp-input" id="siV" value="5" inputmode="decimal"></div>
      <div class="ce-si"><span>pon</span><input class="mp-input" id="siS" value="Aprobado"></div>
      <div class="ce-si"><span>si no, pon</span><input class="mp-input" id="siN" value="Suspendido"></div>
      <p class="aj-ayuda" id="siPrev"></p>`, 'ce-pop');
    const f = () => { const v = $('#siV', p).value.trim(), n = this.numero(v), val = n !== null ? String(n).replace('.', ',') : '"' + v.replace(/"/g, '') + '"', q = s => /^=/.test(s) ? s.slice(1) : this.numero(s) !== null ? String(this.numero(s)).replace('.', ',') : '"' + s.replace(/"/g, '') + '"';
      return `=SI(${$('#siC', p).value.trim().toUpperCase()}${$('#siO', p).value}${val};${q($('#siS', p).value)};${q($('#siN', p).value)})`; };
    const ver = () => { $('#siPrev', p).innerHTML = 'Quedará así: <code>' + esc(f()) + '</code>'; };
    p.addEventListener('input', ver); p.addEventListener('change', ver); ver();
    p.onclick = e => { const x = e.target.closest('button'); if(!x || !('ok' in x.dataset)) return; cerrarPopMio(); this.fin = { ...this.sel }; this.editar(f()); this.aceptar(); toast('🔀 SI puesto en ' + dest + ' · cópialo y pégalo en las de abajo', null, null, 3000); };
  }
});

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
          else out += ({ SI:'IF', Y:'AND', O:'OR' }[F] || t.v) + '(' + args.join(',') + ')';
          continue; }
        if(t.t === '('){ p++; out += '(' + uno() + ')'; p++; continue; }
        out += t.t === 'num' ? String(t.v) : t.t === 'ref' || t.t === 'rango' || t.t === 'cmp' ? t.v : t.t === 'str' ? '"' + t.v.replace(/"/g, '""') + '"' : t.t; p++;
      }
      return out;
    };
    return uno();
  },
  // la de Excel → la nuestra (si se puede; si no, null y se queda el resultado)
  deExcel(f){
    f = String(f).replace(/\$/g, '').trim();
    const fuera = this.fueraComillas(f, x => x);
    if(/[!\['#&^%{]/.test(f.replace(/"[^"]*"/g, '')) || /\b[A-Z]+:[A-Z]+\b/i.test(fuera) || /\b\d+:\d+\b/.test(fuera)) return null;
    const M = { SUM:'SUMA', PRODUCT:'MULTIPLICAR', AVERAGE:'PROMEDIO', IF:'SI', AND:'Y', OR:'O' };
    let ok = true;
    const g = this.fueraComillas(f, x => x.replace(/([A-Z][A-Z0-9.]*)\s*\(/gi, (m, n) => { const N = n.toUpperCase(); if(M[N]) return M[N] + '('; if(this.FUN[N] || this.FUN_SI[N]) return N + '('; ok = false; return m; }).replace(/,/g, ';').toUpperCase());
    if(!ok) return null;
    const r = '=' + g;
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
  // todas las pestañas, cada una en su hoja de Excel (con su nombre y su color)
  async xlsx(soloBlob=false){
    const L = this.L, guard = this.D; if(!soloBlob && L.hojas.every(h => this.pestVacia(h))){ toast('La hoja está vacía'); return; }
    if(this.ed) this.aceptar();
    // formatos, letras (negrita, cursiva, tachado), rellenos y ribetes: cada combinación, un estilo
    const fmts = [], fonts = ['000'], fills = [], bords = ['{}'], xfs = [{ id:0, f:0, fi:0, bo:0, w:0 }], xfIdx = { '0|0|0|0|0':0 };
    const idx = (arr, v, base) => { let i = arr.indexOf(v); if(i < 0){ arr.push(v); i = arr.length - 1; } return i + (base || 0); };
    const xf = (fm, cel) => { let id = fm.id; if(fm.code) id = 164 + idx(fmts, fm.code);
      const f = idx(fonts, (cel.b ? 1 : 0) + '' + (cel.i ? 1 : 0) + (cel.s ? 1 : 0)), fi = cel.bg ? idx(fills, cel.bg, 2) : 0, bo = cel.bd ? idx(bords, JSON.stringify(cel.bd)) : 0, w = String(cel.v ?? '').includes('\n') ? 1 : 0;
      const k = [id, f, fi, bo, w].join('|'); if(!(k in xfIdx)){ xfs.push({ id, f, fi, bo, w }); xfIdx[k] = xfs.length - 1; } return xfIdx[k]; };
    const N = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"', hojas = [], usados = new Set(), dxfs = [];
    const OPX = { entre:'between', menor:'lessThan', menorIgual:'lessThanOrEqual', mayor:'greaterThan', mayorIgual:'greaterThanOrEqual', igual:'equal', distinto:'notEqual' };
    const fv = v => typeof v === 'number' ? String(v) : '"' + String(v ?? '').replace(/"/g, '""') + '"';
    let prio = 1;
    const condXml = H => (H.reglas || []).map(R => { const d = idx(dxfs, R.bg), rg = R.rango, ini = rg.split(':')[0];
      if(R.op === 'contiene') return `<conditionalFormatting sqref="${rg}"><cfRule type="containsText" dxfId="${d}" priority="${prio++}" operator="containsText" text="${this.X(R.a)}"><formula>${this.X(`NOT(ISERROR(SEARCH(${fv(String(R.a))},${ini})))`)}</formula></cfRule></conditionalFormatting>`;
      return `<conditionalFormatting sqref="${rg}"><cfRule type="cellIs" dxfId="${d}" priority="${prio++}" operator="${OPX[R.op]}"><formula>${this.X(fv(R.a))}</formula>${R.op === 'entre' ? `<formula>${this.X(fv(R.b))}</formula>` : ''}</cfRule></conditionalFormatting>`; }).join('');
    try{
      L.hojas.forEach((H, n) => {
        this.D = H; this._cache = null; H.c = H.c || {};
        let C = 0, R = 0; Object.keys(H.c).forEach(k => { const q = this.deRef(k); if(q){ C = Math.max(C, q.c + 1); R = Math.max(R, q.r + 1); } });
        let filas = '';
        for(let r = 0; r < R; r++){
          let cs = '';
          for(let c = 0; c < C; c++){
            const k = this.ref(c, r), cel = this.celda(k); if(!cel) continue;
            if(!String(cel.v ?? '').trim()){ const s0 = xf(this.formatoXlsx(cel.t, cel.d), cel); if(s0) cs += `<c r="${k}" s="${s0}"/>`; continue; }   // celda solo con color o ribete
            const v = this.valor(k), raw = String(cel.v), eur = cel.t === 'eur' || (cel.t !== 'num' && cel.t !== 'txt' && v.eur);
            const s = xf(this.formatoXlsx(eur ? 'eur' : cel.t, cel.d), cel), sa = s ? ` s="${s}"` : '';
            if(raw[0] === '='){ let fx = null; try{ fx = this.aExcel(raw); }catch(e){}
              if(typeof v.v === 'number') cs += `<c r="${k}"${sa}>${fx ? `<f>${this.X(fx)}</f>` : ''}<v>${v.v}</v></c>`;
              else cs += `<c r="${k}"${sa} t="str">${fx ? `<f>${this.X(fx)}</f>` : ''}<v>${this.X(v.v ?? '')}</v></c>`; }
            else if(typeof v.v === 'number') cs += `<c r="${k}"${sa}><v>${v.v}</v></c>`;
            else cs += `<c r="${k}"${sa} t="inlineStr"><is><t xml:space="preserve">${this.X(v.v ?? raw)}</t></is></c>`;
          }
          const alto = (H.altos || {})[r];
          if(cs || alto) filas += `<row r="${r + 1}"${alto ? ` ht="${(alto * 0.75).toFixed(1)}" customHeight="1"` : ''}>${cs}</row>`;
        }
        const nc = Math.max(C, 1), cols = Array.from({ length:nc }, (_, c) => `<col min="${c + 1}" max="${c + 1}" width="${(this.ancho(c) / 7).toFixed(2)}" customWidth="1"/>`).join('');
        let nom = String(H.nombre || 'Hoja ' + (n + 1)).replace(/[\[\]*?/\\:]/g, '').slice(0, 31).trim() || 'Hoja ' + (n + 1), b = nom, i = 2;
        while(usados.has(nom.toLowerCase())) nom = b.slice(0, 28) + ' ' + i++; usados.add(nom.toLowerCase());
        const tab = H.color ? `<sheetPr><tabColor rgb="FF${H.color.slice(1).toUpperCase()}"/></sheetPr>` : '';
        const ori = H.orient === 'h' ? '<pageSetup paperSize="9" orientation="landscape"/>' : '<pageSetup paperSize="9" orientation="portrait"/>';
        hojas.push({ nom, xml:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet ${N} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${tab}<sheetViews><sheetView workbookViewId="0"${n === L.act ? ' tabSelected="1"' : ''}${H.sinRejilla ? ' showGridLines="0"' : ''}/></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${cols}</cols><sheetData>${filas}</sheetData>${condXml(H)}${ori}</worksheet>` });
      });
    }finally{ this.D = guard; this._cache = null; }
    const F = {
      '[Content_Types].xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${hojas.map((h, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook ${N} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="${L.act || 0}"/></bookViews><sheets>${hojas.map((h, i) => `<sheet name="${this.X(h.nom)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`,
      'xl/_rels/workbook.xml.rels':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${hojas.map((h, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
      'xl/styles.xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet ${N}>${fmts.length ? `<numFmts count="${fmts.length}">${fmts.map((c, i) => `<numFmt numFmtId="${164 + i}" formatCode="${this.X(c)}"/>`).join('')}</numFmts>` : ''}<fonts count="${fonts.length}">${fonts.map(f => `<font>${f[0] === '1' ? '<b/>' : ''}${f[1] === '1' ? '<i/>' : ''}${f[2] === '1' ? '<strike/>' : ''}<sz val="11"/><name val="Calibri"/></font>`).join('')}</fonts><fills count="${fills.length + 2}"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>${fills.map(c => `<fill><patternFill patternType="solid"><fgColor rgb="FF${c.slice(1).toUpperCase()}"/><bgColor indexed="64"/></patternFill></fill>`).join('')}</fills><borders count="${bords.length}">${bords.map(j => { const b = JSON.parse(j), l = (t, k) => b[k] ? `<${t} style="${b[k][0] >= 4 ? 'thick' : b[k][0] >= 2 ? 'medium' : 'thin'}"><color rgb="FF${String(b[k][1]).slice(1).toUpperCase()}"/></${t}>` : `<${t}/>`; return `<border>${l('left', 'l')}${l('right', 'r')}${l('top', 't')}${l('bottom', 'b')}<diagonal/></border>`; }).join('')}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.map(x => `<xf numFmtId="${x.id}" fontId="${x.f}" fillId="${x.fi}" borderId="${x.bo}" xfId="0"${x.id ? ' applyNumberFormat="1"' : ''}${x.f ? ' applyFont="1"' : ''}${x.fi ? ' applyFill="1"' : ''}${x.bo ? ' applyBorder="1"' : ''}${x.w ? ' applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>' : '/>'}`).join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>${dxfs.length ? `<dxfs count="${dxfs.length}">${dxfs.map(c => `<dxf><fill><patternFill patternType="solid"><fgColor rgb="FF${c.slice(1).toUpperCase()}"/><bgColor rgb="FF${c.slice(1).toUpperCase()}"/></patternFill></fill></dxf>`).join('')}</dxfs>` : ''}</styleSheet>`
    };
    hojas.forEach((h, i) => { F['xl/worksheets/sheet' + (i + 1) + '.xml'] = h.xml; });
    const blob = new Blob([DocxSimple.zip(F)], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    if(soloBlob) return blob;
    await this.entregar(blob, this.nombreArch() + '.xlsx');
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
      if(/\.(csv|txt)$/.test(n)) this.ponerLibro(f.name.replace(/\.[^.]+$/, ''), [{ nombre:'Hoja 1', c:this.leerCsv(await f.text()) }]);
      else await this.leerXlsx(f);
    }catch(e){ console.warn(e); popAviso('No se ha podido abrir', 'Este archivo no parece un Excel (.xlsx) o un .csv que se pueda leer.'); }
  },
  // lo leído va a una hoja nueva (con una pestaña por cada hoja del Excel)
  ponerLibro(nombre, pests, avisos){
    if(this.ed) this.aceptar();
    pests = pests.filter(h => Object.keys(h.c || {}).length);
    if(!pests.length){ toast('El archivo está vacío'); return; }
    let corta = false;
    const hojas = pests.map((h, i) => {
      let C = 0, R = 0; Object.keys(h.c).forEach(k => { const p = this.deRef(k); C = Math.max(C, p.c + 1); R = Math.max(R, p.r + 1); });
      if(C > 52){ Object.keys(h.c).forEach(k => { if(this.deRef(k).c >= 52) delete h.c[k]; }); C = 52; corta = true; }
      const o = { ...this.pestNueva(h.nombre || 'Hoja ' + (i + 1), h.color || ''), c:h.c, cols:Math.max(8, C), filas:Math.max(30, R + 10) };
      if(h.anchos && Object.keys(h.anchos).length) o.anchos = h.anchos; if(h.altos && Object.keys(h.altos).length) o.altos = h.altos;
      if(h.orient) o.orient = h.orient; if(h.sinRejilla) o.sinRejilla = true; if(h.reglas && h.reglas.length) o.reglas = h.reglas;
      return o;
    });
    if(corta) avisos = (avisos ? avisos + ' · ' : '') + 'solo caben 52 columnas';
    const ant = this.L; if(ant && this.vacio(ant)) this.ponerLista(this.lista().filter(x => x.id !== ant.id));
    const d = { id:nuevoId('h'), titulo:nombre, hojas, act:0, creado:Date.now(), cambiado:Date.now() };
    const l = this.lista(); l.push(d); this.ponerLista(l); this.id = d.id; this.cargar();
    toast('📂 «' + nombre + '» abierto' + (hojas.length > 1 ? ' · ' + hojas.length + ' pestañas' : '') + (avisos ? ' · ' + avisos : ''), null, null, avisos ? 6000 : 2500);
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
    const hojas = tags(wb, 'sheet').map(s => { let t = rels[s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || s.getAttribute('r:id')] || ''; t = t.replace(/^\//, ''); if(!t.startsWith('xl/')) t = 'xl/' + t; return { nom:s.getAttribute('name'), path:t, oculta:s.getAttribute('state') === 'hidden' || s.getAttribute('state') === 'veryHidden' }; }).filter(h => !h.oculta);
    if(!hojas.length) throw new Error('sin hojas');
    // textos compartidos
    const ss = tags(await xml('xl/sharedStrings.xml'), 'si').map(si => tags(si, 't').map(t => t.textContent).join(''));
    // estilos: formato del número, letra, relleno y ribete
    const st = await xml('xl/styles.xml'), codes = {}; tags(st, 'numFmt').forEach(n => { codes[n.getAttribute('numFmtId')] = n.getAttribute('formatCode') || ''; });
    const si = (fn, t) => { const b = hijos(fn, t)[0]; return !!b && b.getAttribute('val') !== '0' && b.getAttribute('val') !== 'false'; };
    const fonts = hijos(tags(st, 'fonts')[0], 'font').map(fn => ({ b:si(fn, 'b'), i:si(fn, 'i'), s:si(fn, 'strike') }));
    const col = el => { const r = el && el.getAttribute('rgb'); return r && /^[0-9A-F]{8}$/i.test(r) ? '#' + r.slice(2).toLowerCase() : null; };
    const fills = hijos(tags(st, 'fills')[0], 'fill').map(fl => { const pf = hijos(fl, 'patternFill')[0]; if(!pf || pf.getAttribute('patternType') !== 'solid') return null; return col(hijos(pf, 'fgColor')[0]); });
    const bords = hijos(tags(st, 'borders')[0], 'border').map(bo => { const o = {}; [['left', 'l'], ['right', 'r'], ['top', 't'], ['bottom', 'b']].forEach(([t, k]) => { const e = hijos(bo, t)[0], sty = e && e.getAttribute('style'); if(sty && sty !== 'none') o[k] = [/thick/.test(sty) ? 4 : /medium|double/.test(sty) ? 2 : 1, col(hijos(e, 'color')[0]) || '#3a3a3c']; }); return Object.keys(o).length ? o : null; });
    const xfs = hijos(tags(st, 'cellXfs')[0], 'xf').map(x => { const id = +x.getAttribute('numFmtId') || 0, code = codes[id] || ({ 1:'0', 2:'0.00', 3:'#,##0', 4:'#,##0.00', 9:'0%', 10:'0.00%', 49:'@' })[id] || '';
      const sin = code.split(';')[0].replace(/"[^"]*"|\[[^\]]*\]|\\./g, '');
      const fecha = (id >= 14 && id <= 22) || (id >= 164 && /[dmyh]/i.test(sin) && !/0|#/.test(sin));
      const m = /\.(0+)/.exec(sin);
      return { eur:/€|EUR/.test(code), d:m ? Math.min(2, m[1].length) : /0/.test(sin) ? 0 : null, txt:id === 49 || code === '@', fecha, pct:/%/.test(sin), ft:fonts[+x.getAttribute('fontId') || 0] || {}, bg:fills[+x.getAttribute('fillId') || 0] || null, bd:bords[+x.getAttribute('borderId') || 0] || null }; });
    const dxfs = hijos(tags(st, 'dxfs')[0], 'dxf').map(dx => { const pf = tags(dx, 'patternFill')[0]; return pf ? col(hijos(pf, 'bgColor')[0]) || col(hijos(pf, 'fgColor')[0]) : null; });
    const DEX = { between:'entre', lessThan:'menor', lessThanOrEqual:'menorIgual', greaterThan:'mayor', greaterThanOrEqual:'mayorIgual', equal:'igual', notEqual:'distinto' };
    const leerV = t => { t = String(t || '').trim(); if(/^".*"$/.test(t)) return t.slice(1, -1).replace(/""/g, '"'); const n = Number(t); return isFinite(n) && t !== '' ? n : null; };
    const comoTexto = n => { let s = String(+n.toFixed(10)); if(/e/i.test(s)) s = n.toFixed(10).replace(/\.?0+$/, ''); return s.replace('.', ','); };
    let sinFx = 0; const pests = [];
    for(const h of hojas){
      const hoja = await xml(h.path); if(!hoja) continue;
      const out = {};
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
        if(x.ft && x.ft.b) cel.b = true; if(x.ft && x.ft.i) cel.i = true; if(x.ft && x.ft.s) cel.s = true;
        if(x.bg && x.bg !== '#ffffff') cel.bg = x.bg; if(x.bd) cel.bd = JSON.parse(JSON.stringify(x.bd));
        if(cel.v != null && String(cel.v) !== '') out[k] = cel; else if(cel.bg || cel.bd){ delete cel.v; out[k] = cel; }
      }
      // color de la pestaña, ancho de las columnas, alto de las filas
      const tc = tags(hoja, 'tabColor')[0], anchos = {}, altos = {};
      tags(hoja, 'col').forEach(cl => { const w = +cl.getAttribute('width'); if(!w || cl.getAttribute('hidden') === '1') return; const px = Math.max(36, Math.min(420, Math.round(w * 7 + 5)));
        for(let c = (+cl.getAttribute('min') || 1) - 1; c < Math.min(52, +cl.getAttribute('max') || 1); c++) if(Math.abs(px - this.ANCHO) > 6) anchos[c] = px; });
      tags(hoja, 'row').forEach(rw => { const ht = +rw.getAttribute('ht'); if(ht && rw.getAttribute('customHeight') === '1'){ const px = Math.max(24, Math.min(240, Math.round(ht / 0.75))); if(px > this.ALTO) altos[+rw.getAttribute('r') - 1] = px; } });
      const sv = tags(hoja, 'sheetView')[0], ps = tags(hoja, 'pageSetup')[0], reglas = [];
      tags(hoja, 'conditionalFormatting').forEach(cf => { const rg = String(cf.getAttribute('sqref') || '').split(' ')[0]; if(!/^[A-Z]+\d+(:[A-Z]+\d+)?$/.test(rg)) return;
        hijos(cf, 'cfRule').forEach(ru => { const bg = dxfs[+ru.getAttribute('dxfId')]; if(!bg) return; const fs = hijos(ru, 'formula').map(x => leerV(x.textContent));
          if(ru.getAttribute('type') === 'cellIs' && DEX[ru.getAttribute('operator')] && fs[0] != null){ const r = { rango:rg, op:DEX[ru.getAttribute('operator')], a:fs[0], bg }; if(r.op === 'entre'){ if(fs[1] == null) return; r.b = fs[1]; } reglas.push(r); }
          else if(ru.getAttribute('type') === 'containsText' && ru.getAttribute('text')) reglas.push({ rango:rg, op:'contiene', a:ru.getAttribute('text'), bg }); }); });
      pests.push({ nombre:h.nom, color:col(tc) || '', c:out, anchos, altos, orient:ps && ps.getAttribute('orientation') === 'landscape' ? 'h' : '', sinRejilla:!!(sv && sv.getAttribute('showGridLines') === '0'), reglas });
    }
    this.ponerLibro(f.name.replace(/\.[^.]+$/, ''), pests, sinFx ? sinFx + (sinFx === 1 ? ' fórmula que no conozco: queda su resultado' : ' fórmulas que no conozco: queda su resultado') : '');
  }
});
