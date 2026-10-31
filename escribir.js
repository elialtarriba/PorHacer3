/* PorHacer3 · Escribir: un editor de texto con dictado por voz
   Pulsas el micro y lo que dices se escribe donde está el cursor; vuelves a pulsar y para.
   Negrita, cursiva, subrayado, tamaño, listas, alinear, marcador, fotos (pegar o 📷) y deshacer.
   Se guarda solo en este aparato y se puede guardar como .docx (lo abren Word y Pages). */

const Escribir = {
  TAM: { peq:'15px', normal:'18px', grande:'24px', titulo:'32px' },
  lista(){ try{ return JSON.parse(lsGet('ph3-escritos') || '[]') || []; }catch(e){ return []; } },
  ponerLista(l){ try{ localStorage.setItem('ph3-escritos', JSON.stringify(l)); }catch(e){ toast('⚠️ No cabe más en este aparato: guarda alguno en .docx y bórralo'); } if(typeof Guardar !== 'undefined') Guardar.cambioEscribir(); },
  nombre(){ return ((App.ajustes && App.ajustes.nombreEscribir) || '').trim() || 'Escribir'; },
  actual(){ return this.lista().find(d => d.id === this.id) || null; },

  abrir(){
    soloVista('vEscribir');
    if(!this.id || !this.actual()){ const l = this.lista(); if(l.length){ l.sort((a, b) => b.cambiado - a.cambiado); this.id = l[0].id; } else this.nuevo(true); }
    this.cargar();
  },
  activa(){ return $('#vEscribir').classList.contains('activa'); },
  cargar(){
    const d = this.actual(); if(!d) return;
    $('#esTitulo').value = d.titulo || '';
    $('#esTexto').innerHTML = d.html || '';
    this.figs = JSON.parse(JSON.stringify(d.figs || [])); this.sel = null;
    this.pintarFigs(); this.contar();
    requestAnimationFrame(() => this.migrar());
  },
  // ¿está vacío? (sin título, sin texto, sin fotos ni figuras)
  vacio(d){ return !d || (!(d.titulo || '').trim() && !(d.figs || []).length && !/<img/i.test(d.html || '') && !(new DOMParser().parseFromString(d.html || '', 'text/html').body.textContent || '').replace(/[\s\u200b]/g, '')); },
  nuevo(silencio){
    this.guardarYa();
    const d = { id:nuevoId('es'), titulo:'', html:'', creado:Date.now(), cambiado:Date.now() };
    const l = this.lista(); l.push(d); this.ponerLista(l); this.id = d.id;
    if(!silencio){ this.cargar(); setTimeout(() => $('#esTexto').focus(), 100); toast('📝 Escrito nuevo'); }
  },
  // se guarda solo mientras escribes
  cambio(){ clearTimeout(this._t); if(!Voz.activo) $('#esEstado').textContent = '✏️ Escribiendo…'; this._t = setTimeout(() => this.guardarYa(), 700); this.contar(); },
  guardarYa(){
    clearTimeout(this._t);
    const l = this.lista(), d = l.find(x => x.id === this.id); if(!d || !$('#esTexto')) return;
    const html = $('#esTexto').innerHTML, tit = $('#esTitulo').value.trim(), figs = JSON.stringify(this.figs || []);
    if(d.html === html && (d.titulo || '') === tit && JSON.stringify(d.figs || []) === figs) { if(!Voz.activo) $('#esEstado').textContent = '✓ Guardado'; return; }
    d.html = html; d.titulo = tit; d.figs = JSON.parse(figs); d.cambiado = Date.now(); this.ponerLista(l);
    if(!Voz.activo) $('#esEstado').textContent = '✓ Guardado';
  },
  contar(){ const t = ($('#esTexto').innerText || '').trim(); const n = t ? t.split(/\s+/).length : 0; $('#esCuenta').textContent = n + (n === 1 ? ' palabra' : ' palabras'); },
  tituloDe(d){ if(d.titulo) return d.titulo; const t = (new DOMParser().parseFromString(d.html || '', 'text/html').body.textContent || '').replace(/\u200b/g, '').trim(); return t ? t.slice(0, 40) + (t.length > 40 ? '…' : '') : 'Sin título'; },

  /* ---------- Formato: cada botón se enciende (verde) y se apaga ---------- */
  MARCA: '#fff3a3',
  esMarca(c){ return /255,\s*243,\s*163/.test(c || '') || /#fff3a3/i.test(c || ''); },
  // sube desde el cursor buscando un estilo (marcador o tamaño)
  subir(prueba){
    const s = getSelection(), e = $('#esTexto'); if(!s.rangeCount) return null;
    let n = s.getRangeAt(0).startContainer; if(!e.contains(n)) return null;
    for(; n && n !== e; n = n.parentNode) if(n.nodeType === 1 && prueba(n)) return n;
    return null;
  },
  marcaAqui(){ return this.subir(n => this.esMarca(n.style && n.style.backgroundColor)); },
  tamAqui(){ const n = this.subir(n => n.style && n.style.fontSize); if(!n) return 'normal'; const px = n.style.fontSize; return Object.keys(this.TAM).find(k => this.TAM[k] === px) || 'normal'; },
  // con el cursor quieto (nada seleccionado), lo que escribas a partir de aquí lleva el estilo
  estiloAqui(estilo){
    const s = getSelection(), r = s.getRangeAt(0);
    const sp = document.createElement('span'); Object.assign(sp.style, estilo);
    const t = document.createTextNode('​'); sp.appendChild(t); r.insertNode(sp);
    const rr = document.createRange(); rr.setStart(t, 1); rr.collapse(true); s.removeAllRanges(); s.addRange(rr);
  },
  // …y para dejar de usarlo: se sale del trozo con ese estilo
  salirDe(nodo){
    const s = getSelection(), r = s.getRangeAt(0), resto = document.createRange();
    resto.setStart(r.startContainer, r.startOffset); resto.setEndAfter(nodo.lastChild || nodo);
    const frag = resto.extractContents(), t = document.createTextNode('​');
    nodo.after(t);
    if((frag.textContent || '').replace(/​/g, '')){ const cl = nodo.cloneNode(false); cl.appendChild(frag); t.after(cl); }
    if(!(nodo.textContent || '').replace(/​/g, '')) nodo.remove();
    const rr = document.createRange(); rr.setStart(t, 1); rr.collapse(true); s.removeAllRanges(); s.addRange(rr);
  },
  cmd(c, v){
    const e = $('#esTexto'); e.focus();
    const s = getSelection(); if(!s.rangeCount || !e.contains(s.getRangeAt(0).startContainer)){ const r = document.createRange(); r.selectNodeContents(e); r.collapse(false); s.removeAllRanges(); s.addRange(r); }
    const quieto = s.isCollapsed;
    if(c === 'tam'){
      if(quieto) this.estiloAqui(v === 'titulo' ? { fontSize:this.TAM[v], fontWeight:'900' } : { fontSize:this.TAM[v] });
      else {
        document.execCommand('styleWithCSS', false, false);
        document.execCommand('fontSize', false, '7');                      // marca lo seleccionado…
        $$('font[size="7"]', e).forEach(f => { const sp = document.createElement('span'); sp.style.fontSize = this.TAM[v]; if(v === 'titulo') sp.style.fontWeight = '900'; while(f.firstChild) sp.appendChild(f.firstChild); f.replaceWith(sp); });   // …y le pone el tamaño
      }
    } else if(c === 'marcar'){
      const ya = this.marcaAqui();
      if(quieto){ if(ya) this.salirDe(ya); else this.estiloAqui({ backgroundColor:this.MARCA }); }
      else {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('hiliteColor', false, ya ? 'transparent' : this.MARCA);
        document.execCommand('styleWithCSS', false, false);
        if(ya) $$('span', e).forEach(x => { if(/transparent|rgba\(0, 0, 0, 0\)/.test(x.style.backgroundColor)){ x.style.backgroundColor = ''; if(!x.getAttribute('style')){ x.replaceWith(...x.childNodes); } } });
      }
    } else if(c === 'limpiar'){
      if(quieto){ try{ s.modify('move', 'backward', 'paragraphboundary'); s.modify('extend', 'forward', 'paragraphboundary'); }catch(err){} }
      document.execCommand('removeFormat');
      const r = s.rangeCount ? s.getRangeAt(0) : null;
      if(r) $$('span[style], font', e).forEach(x => { if(r.intersectsNode(x)) x.replaceWith(...x.childNodes); });
      if(s.rangeCount) s.collapseToEnd();
      const fuera = this.subir(n => n.style && (n.style.fontSize || n.style.backgroundColor)); if(fuera) this.salirDe(fuera);
      $$('b,strong,i,em,u', e).forEach(x => { if(!(x.textContent || '').replace(/​/g, '')) x.remove(); });
      toast('🧹 Formato quitado' + (quieto ? ' de este párrafo' : ''), null, null, 1500);
    } else document.execCommand(c, false, v || null);
    this.pintarBarra(); this.cambio();
  },
  pintarBarra(){
    const e = $('#esTexto'), s = getSelection(), dentro = s.rangeCount && e.contains(s.getRangeAt(0).startContainer);
    $$('#esBarra [data-c]').forEach(b => { const c = b.dataset.c; let on = false;
      if(dentro){ if(c === 'marcar') on = !!this.marcaAqui();
        else if(['bold','italic','underline','insertUnorderedList','insertOrderedList','justifyCenter'].includes(c)){ try{ on = document.queryCommandState(c); }catch(err){} }
        else if(c === 'justifyLeft'){ try{ on = !document.queryCommandState('justifyCenter') && !document.queryCommandState('justifyRight'); }catch(err){} } }
      b.classList.toggle('on', on); });
    const t = dentro ? this.tamAqui() : 'normal', sel = $('#esTam');
    sel.options[0].textContent = t === 'normal' ? 'Aa ▾' : 'Aa ' + { peq:'Pequeña', grande:'Grande', titulo:'Título' }[t] + ' ▾';
    sel.classList.toggle('on', t !== 'normal');
  },

  /* ---------- Fotos (pegar, arrastrar o con el botón 📷) ---------- */
  async ponerFotos(fs){
    const e = $('#esTexto'); e.focus();
    toast('📷 Poniendo la foto…', null, null, 3000);
    for(const f of fs){
      try{ const src = await aligerarImg(f, 1100, .72);
        document.execCommand('insertHTML', false, `<img src="${src}" data-w="100" alt="">&#8203;`); }
      catch(err){ toast('⚠️ No se ha podido poner esta imagen'); }
    }
    this.cambio();
  },
  async fotoBoton(){ const fs = await elegirFotos(false, true); if(fs.length){ this.restaurarCursor(); this.ponerFotos(fs); } },
  guardarCursor(){ const s = getSelection(); if(s.rangeCount && $('#esTexto').contains(s.getRangeAt(0).startContainer)) this._rango = s.getRangeAt(0).cloneRange(); },
  restaurarCursor(){ const e = $('#esTexto'); e.focus(); if(this._rango){ const s = getSelection(); s.removeAllRanges(); s.addRange(this._rango); } },
  menuFoto(im){
    if(im.dataset.forma) return;     // las figuras ya no van dentro del texto
    const hj = hojaMio('📷 Foto', `
      <div class="es-tams">${[['30','Pequeña'],['50','Mediana'],['100','Grande']].map(([w, t]) => `<button class="sh-op ${im.dataset.w === w ? 'on' : ''}" data-w="${w}">${t}</button>`).join('')}</div>
      <button class="sh-op peligro" data-a="quitar">🗑️ Quitar la foto</button>
      <button class="sh-btn" data-a="x">Cerrar</button>`);
    hj.onclick = ev => { const b = ev.target.closest('[data-w],[data-a]'); if(!b) return;
      if(b.dataset.w){ im.dataset.w = b.dataset.w; this.cambio(); }
      else if(b.dataset.a === 'quitar'){ im.remove(); this.cambio(); }
      cerrarHojaMio(); };
  },

  /* ---------- Iconos para poner en la hoja ---------- */
  ICONOS: '✅ 🎀 ❗️ ❓ ❌ 🧡 💛 💚 🩵 🩷 ❤️ 🟡 🟠 🟢 🔴 🔵 💡 🎁 🎈 ☕️ 🧶 🧵 🪡 🎄 🌿 ☘️ 🪴 🌟 ⭐️ ✨ 🔥 🍻 🥂 🎤 🎼 🚗 🛵 📷 🎞️ 📞 📀 📺 ⌛️ 🕰️ 💶 🪎 🛠️ ⚙️ 📧 ✉️ 🗑️ 📒 📙 📗 📘 📚 📖 📋 📎 ✏️'.split(' '),
  iconos(){
    this.guardarCursor();
    const hj = hojaMio('✅ Poner un icono', `<div class="es-iconos">${this.ICONOS.map(i => `<button data-i="${i}">${i}</button>`).join('')}</div>
      <button class="sh-btn" data-a="x">Cerrar</button>`, 'es-ico');
    hj.onclick = ev => { const b = ev.target.closest('[data-i],[data-a]'); if(!b) return;
      if(b.dataset.i){ this.restaurarCursor(); document.execCommand('insertText', false, b.dataset.i); this.guardarCursor(); this.cambio(); toast(b.dataset.i + ' puesto', null, null, 1200); }
      else cerrarHojaMio(); };
  },

  /* ---------- Figuras: van encima (o detrás) del texto, se mueven arrastrándolas
     y se hacen más grandes o más pequeñas tirando de las esquinas ---------- */
  COLORES: ['transparente','#e5201c','#f08a1a','#f2c418','#3fae5a','#2f80ed','#8b5adf','#e84898','#8a5a3c','#3a3a3c','#9aa0a6','#ffffff','#ffd6d4','#ffe8c7','#fff6bf','#d6f2dc','#d4e6fb','#e6dcfb','#fbd6e8','#efe3d6'],
  FORMAS: { cuadrado:'Cuadrado', redondeado:'Redondeado', ovalo:'Óvalo', redonda:'Redonda' },
  figs: [], sel: null,
  figSel(){ return this.figs.find(f => f.id === this.sel) || null; },
  estiloFig(el, f){
    if(!el) return;
    const sin = f.ribete === 'transparente', br = f.tipo === 'redonda' || f.tipo === 'ovalo' ? '50%' : f.tipo === 'redondeado' ? Math.round(Math.min(f.w, f.h) * .2) + 'px' : '0';
    Object.assign(el.style, { left:f.x + 'px', top:f.y + 'px', width:f.w + 'px', height:f.h + 'px', transform:f.giro ? `rotate(${f.giro}deg)` : '',
      border:sin ? '0' : `${f.grosor}px solid ${f.ribete}`, background:f.relleno === 'transparente' ? 'transparent' : f.relleno, borderRadius:br });
  },
  ponerCaja(el, f){ if(el) Object.assign(el.style, { left:f.x + 'px', top:f.y + 'px', width:f.w + 'px', height:f.h + 'px', transform:f.giro ? `rotate(${f.giro}deg)` : '' }); },
  caja(f){ const a = (f.giro || 0) * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)), W = f.w * c + f.h * s, H = f.w * s + f.h * c; return { x:f.x + f.w / 2 - W / 2, y:f.y + f.h / 2 - H / 2, w:W, h:H }; },
  pintarFigs(){
    const at = $('#esAtras'), de = $('#esDelante'); if(!at) return;
    at.innerHTML = ''; de.innerHTML = '';
    for(const f of this.figs){ const el = document.createElement('div'); el.className = 'es-fg'; el.dataset.id = f.id; this.estiloFig(el, f); (f.capa === 'detras' ? at : de).appendChild(el); }
    this.pintarSel();
  },
  pintarSel(){
    // (además de las esquinas, la bolita de arriba con ↻ gira la figura con el dedo)
    $$('#esDelante .es-sel, #esDelante .es-mbar').forEach(x => x.remove());
    const f = this.figSel(); $('#esForma').classList.toggle('on', !!f);
    if(!f){ this.sel = null; return; }
    const s = document.createElement('div'); s.className = 'es-sel'; this.ponerCaja(s, f);
    s.innerHTML = ['nw', 'ne', 'sw', 'se'].map(k => `<i class="es-h es-h-${k}" data-h="${k}"></i>`).join('') + '<i class="es-rot" data-rot aria-label="Girar"><b>↻</b></i><span class="es-gv"></span>';
    const b = document.createElement('div'); b.className = 'es-mbar';
    b.innerHTML = `<button data-capa="delante" class="${f.capa !== 'detras' ? 'on' : ''}">⬆️ Delante</button><button data-capa="detras" class="${f.capa === 'detras' ? 'on' : ''}">⬇️ Detrás</button><button data-quitar aria-label="Quitar la figura">🗑️</button>`;
    if(this.caja(f).y < 50) s.classList.add('rot-abajo');      // arriba del todo: la bolita de girar va abajo
    $('#esDelante').append(s, b); this.ponerBarra(b, f);
  },
  ponerBarra(b, f){
    if(!b) return; const r = this.caja(f), W = $('#esPapel').clientWidth, bw = b.offsetWidth || 220;
    const H = $('#esPapel').clientHeight; let top = r.y + r.h + 14; if(top > H - 50 && r.y > 110) top = r.y - 100;
    b.style.left = Math.max(4, Math.min(W - bw - 4, r.x + r.w / 2 - bw / 2)) + 'px'; b.style.top = top + 'px';
  },
  seleccionar(id){
    this.sel = id; this.pintarSel();
    if(id){ const a = document.activeElement; if(a && a.id === 'esTexto') a.blur();
      const n = +(lsGet('ph3-es-pista2') || 0); if(n < 3){ try{ localStorage.setItem('ph3-es-pista2', n + 1); }catch(e){}
        toast('Arrástrala para moverla · esquinas: tamaño · ↻ azul: girarla · «◻︎ Figura»: colores', null, null, 4500); } }
  },
  punto(ev){ const r = $('#esPapel').getBoundingClientRect(); return { x:ev.clientX - r.left, y:ev.clientY - r.top }; },
  // las figuras de detrás quedan debajo del texto: se cogen tocando su borde
  figEnBorde(p){
    for(const f of [...this.figs].reverse()){
      if(f.capa !== 'detras') continue;
      const g = (f.giro || 0) * Math.PI / 180, dx = p.x - (f.x + f.w / 2), dy = p.y - (f.y + f.h / 2);
      const lx = dx * Math.cos(g) + dy * Math.sin(g), ly = -dx * Math.sin(g) + dy * Math.cos(g);
      const tol = Math.max(9, (f.ribete === 'transparente' ? 0 : f.grosor) / 2 + 7), hw = f.w / 2, hh = f.h / 2;
      if(Math.abs(lx) > hw + tol || Math.abs(ly) > hh + tol) continue;
      let d;
      if(f.tipo === 'redonda' || f.tipo === 'ovalo') d = Math.abs(Math.hypot(lx / hw, ly / hh) - 1) * Math.min(hw, hh);
      else d = (Math.abs(lx) <= hw && Math.abs(ly) <= hh) ? Math.min(hw - Math.abs(lx), hh - Math.abs(ly)) : Math.max(Math.abs(lx) - hw, Math.abs(ly) - hh);
      if(d <= tol) return f;
    }
    return null;
  },
  cursorEn(x, y){
    const P = $('#esPapel'), e = $('#esTexto'); P.classList.add('es-sinp');
    let r = null; try{ r = document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null; if(!r && document.caretPositionFromPoint){ const c = document.caretPositionFromPoint(x, y); if(c){ r = document.createRange(); r.setStart(c.offsetNode, c.offset); } } }catch(err){}
    P.classList.remove('es-sinp');
    e.focus(); if(r && e.contains(r.startContainer)){ const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  },
  figDown(ev){
    if(ev.button > 0) return;
    const t = ev.target, P = $('#esPapel');
    if(t.closest('.es-mbar')) return;
    const p0 = this.punto(ev), hh = t.closest('.es-h'), rot = t.closest('.es-rot');
    let f = null, modo = 'mover';
    if(rot){ f = this.figSel(); modo = 'girar'; }
    else if(hh){ f = this.figSel(); modo = 'tam'; }
    else if(t.closest('.es-fg')) f = this.figs.find(x => x.id === t.closest('.es-fg').dataset.id);
    else if(t.closest('.es-sel')) f = this.figSel();
    else f = this.figEnBorde(p0);
    if(!f){ if(this.sel) this.seleccionar(null); return; }
    ev.preventDefault(); ev.stopPropagation();
    const ya = this.sel === f.id, sobreSel = !!t.closest('.es-sel') && !hh && !rot;
    if(!ya) this.seleccionar(f.id);
    const ini = { ...f }, h = hh ? hh.dataset.h : ''; let movido = false;
    const el = () => $(`.es-fg[data-id="${f.id}"]`, P);
    const mover = e => {
      const p = this.punto(e), dx = p.x - p0.x, dy = p.y - p0.y;
      if(!movido && Math.hypot(dx, dy) < 5) return;
      movido = true; if(e.cancelable) e.preventDefault();
      if(modo === 'girar'){
        // el ángulo entre el centro de la figura y el dedo; se «engancha» a 0°, 45°, 90°… si estás muy cerca
        const cx = ini.x + ini.w / 2, cy = ini.y + ini.h / 2, a0 = Math.atan2(p0.y - cy, p0.x - cx), a1 = Math.atan2(p.y - cy, p.x - cx);
        let g = ini.giro + (a1 - a0) * 180 / Math.PI; g = ((g + 180) % 360 + 360) % 360 - 180;
        const im = Math.round(g / 45) * 45; if(Math.abs(g - im) < 4) g = im;
        f.giro = Math.round(g); const gv = $('.es-gv', P); if(gv){ gv.textContent = f.giro + '°'; gv.style.opacity = 1; gv.style.transform = `translate(-50%,-50%) rotate(${-f.giro}deg)`; }
      }
      else if(modo === 'mover'){ f.x = Math.round(Math.max(-f.w / 2, Math.min($('#esPapel').clientWidth - f.w / 2, ini.x + dx))); f.y = Math.round(Math.max(0, ini.y + dy)); }
      else {
        const g = (f.giro || 0) * Math.PI / 180, cs = Math.cos(g), sn = Math.sin(g);
        const lx = dx * cs + dy * sn, ly = -dx * sn + dy * cs, sx = h.includes('e') ? 1 : -1, sy = h.includes('s') ? 1 : -1;
        const w = Math.max(18, ini.w + sx * lx), hgt = Math.max(18, ini.h + sy * ly);
        const ox = sx * (w - ini.w) / 2, oy = sy * (hgt - ini.h) / 2;          // la esquina contraria se queda quieta
        const cx = ini.x + ini.w / 2 + ox * cs - oy * sn, cy = ini.y + ini.h / 2 + ox * sn + oy * cs;
        f.w = Math.round(w); f.h = Math.round(hgt); f.x = Math.round(cx - f.w / 2); f.y = Math.round(cy - f.h / 2);
      }
      this.estiloFig(el(), f); this.ponerCaja($('.es-sel', P), f); this.ponerBarra($('.es-mbar', P), f);
    };
    const noScroll = e => { if(e.cancelable) e.preventDefault(); };
    const fin = e => {
      removeEventListener('pointermove', mover); removeEventListener('pointerup', fin); removeEventListener('pointercancel', fin); document.removeEventListener('touchmove', noScroll);
      const gv = $('.es-gv', P); if(gv) gv.style.opacity = 0;
      if(movido) this.cambioFigs();
      else if(ya && sobreSel && e.type === 'pointerup'){ this.seleccionar(null); this.cursorEn(e.clientX, e.clientY); }   // tocarla otra vez: el cursor va ahí
    };
    addEventListener('pointermove', mover, { passive:false }); addEventListener('pointerup', fin); addEventListener('pointercancel', fin);
    document.addEventListener('touchmove', noScroll, { passive:false });
  },
  cambioFigs(){ this.cambio(); },
  quitarFig(f){
    const i = this.figs.indexOf(f); if(i < 0) return; const copia = { ...f };
    this.figs.splice(i, 1); this.sel = null; this.pintarFigs(); this.cambioFigs();
    toast('🗑️ Figura quitada', 'Deshacer', () => { this.figs.splice(i, 0, copia); this.pintarFigs(); this.cambioFigs(); }, 6000);
  },
  // las figuras de antes (dentro del texto) pasan a ser figuras que se mueven
  migrar(){
    const P = $('#esPapel'), imgs = $$('#esTexto img[data-forma]'); if(!imgs.length || !P.clientWidth) return;
    const pr = P.getBoundingClientRect();
    for(const im of imgs){
      let o = {}; try{ o = JSON.parse(im.dataset.forma); }catch(e){}
      const r = im.getBoundingClientRect(); if(!r.width) continue;
      const a0 = o.tipo === 'ovalo' ? 600 : 400, b0 = o.tipo === 'ovalo' ? 380 : 400, g = (+o.giro || 0) * Math.PI / 180;
      const k = r.width / (a0 * Math.abs(Math.cos(g)) + b0 * Math.abs(Math.sin(g)));
      const w = Math.round(a0 * k), h = Math.round(b0 * k);
      this.figs.push({ id:nuevoId('fg'), tipo:o.tipo || 'redondeado', ribete:o.ribete || '#e5201c', grosor:Math.max(1, Math.round((+o.grosor || 4) * 2 * k)), relleno:o.relleno || 'transparente', giro:+o.giro || 0, capa:'delante',
        x:Math.round(r.left - pr.left + r.width / 2 - w / 2), y:Math.round(r.top - pr.top + r.height / 2 - h / 2), w, h });
      const sig = im.nextSibling; if(sig && sig.nodeType === 3 && sig.nodeValue === '​') sig.remove(); im.remove();
    }
    this.pintarFigs(); this.cambio();
  },
  // dibujo de la figura (para el .docx)
  dibujarForma(f, k){
    k = k || 2; const W = Math.max(2, Math.round(f.w * k)), H = Math.max(2, Math.round(f.h * k));
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const g = f.ribete === 'transparente' ? 0 : f.grosor * k, m = g / 2;
    x.beginPath();
    if(f.tipo === 'redonda' || f.tipo === 'ovalo') x.ellipse(W / 2, H / 2, Math.max(1, W / 2 - m), Math.max(1, H / 2 - m), 0, 0, Math.PI * 2);
    else if(f.tipo === 'redondeado'){ const rr = Math.max(0, Math.min(W, H) * .2 - m); if(x.roundRect) x.roundRect(m, m, W - 2 * m, H - 2 * m, rr); else x.rect(m, m, W - 2 * m, H - 2 * m); }
    else x.rect(m, m, W - 2 * m, H - 2 * m);
    if(f.relleno !== 'transparente'){ x.fillStyle = f.relleno; x.fill(); }
    if(g){ x.lineWidth = g; x.strokeStyle = f.ribete; x.lineJoin = 'round'; x.stroke(); }
    return c.toDataURL('image/png');
  },
  // el botón «◻︎ Figura»: pone una nueva o, si hay una tocada, cambia sus colores
  figura(){
    const sel = this.figSel();
    if(!sel) this.guardarCursor();
    const F = Object.assign({ tipo:'redondeado', ribete:'#e5201c', grosor:4, relleno:'transparente', giro:0, capa:'delante' }, sel || {});
    const muestra = c => c === 'transparente' ? '<i class="es-transp"></i>' : `<i style="background:${c}"></i>`;
    const medidas = t => t === 'redonda' ? [110, 110] : t === 'ovalo' ? [220, 96] : t === 'cuadrado' ? [130, 130] : [230, 80];
    const prevHtml = () => { const [w0, h0] = sel ? [sel.w, sel.h] : medidas(F.tipo), k = Math.min(1, 150 / w0, 90 / h0);
      return `<div class="es-fprev"><i style="width:${Math.round(w0 * k)}px;height:${Math.round(h0 * k)}px;${this.cssForma(F, w0 * k, h0 * k)}"></i></div>`; };
    const pintar = () => {
      const hj = hojaMio(sel ? '✏️ Cambiar la figura' : '◻︎ Poner una figura', `
        ${prevHtml()}
        <div class="st-et">Forma</div>
        <div class="es-formas">${Object.entries(this.FORMAS).map(([k, t]) => `<button data-tipo="${k}" class="${F.tipo === k ? 'on' : ''}"><i style="${this.cssForma({ tipo:k, ribete:'#3a3a3c', grosor:2, relleno:'transparente' }, k === 'ovalo' ? 34 : k === 'redondeado' ? 34 : 24, k === 'ovalo' ? 20 : k === 'redondeado' ? 20 : 24)};width:${k === 'ovalo' || k === 'redondeado' ? 34 : 24}px;height:${k === 'ovalo' || k === 'redondeado' ? 20 : 24}px"></i>${t}</button>`).join('')}</div>
        <div class="st-et">¿Delante o detrás del texto?</div>
        <div class="es-tams es-capas"><button class="sh-op ${F.capa !== 'detras' ? 'on' : ''}" data-capa="delante">⬆️ Delante</button><button class="sh-op ${F.capa === 'detras' ? 'on' : ''}" data-capa="detras">⬇️ Detrás</button></div>
        <div class="st-et">Ribete (borde)</div>
        <div class="es-cols">${this.COLORES.map(c => `<button data-rib="${c}" class="${F.ribete === c ? 'on' : ''}" aria-label="${c}">${muestra(c)}</button>`).join('')}</div>
        <div class="es-grosor"><span>Fino</span><input type="range" min="1" max="20" value="${F.grosor}" id="esGrosor"><span>Grueso</span></div>
        <div class="st-et">Relleno (dentro)</div>
        <div class="es-cols">${this.COLORES.map(c => `<button data-rel="${c}" class="${F.relleno === c ? 'on' : ''}" aria-label="${c}">${muestra(c)}</button>`).join('')}</div>
        <div class="st-et">Girar · <b id="esGiroV">${F.giro}°</b></div>
        <div class="es-giro"><button data-g="-15" aria-label="Girar a la izquierda">↺ 15°</button><input type="range" min="-180" max="180" value="${F.giro}" id="esGiro"><button data-g="15" aria-label="Girar a la derecha">↻ 15°</button><button data-g0 aria-label="Sin girar">0°</button></div>
        <p class="es-nota">${sel ? 'El tamaño se cambia en la hoja, tirando de las esquinas.' : 'Después, arrástrala donde quieras y tira de las esquinas para hacerla más grande o más pequeña.'}</p>
        <div class="mp-fila">${sel ? '<button class="mp-b mp-borrar" data-a="quitar" aria-label="Quitar">🗑️</button>' : ''}<button class="mp-b" data-a="x">Cancelar</button><button class="mp-b mp-pri" data-a="ok">${sel ? 'Guardar' : 'Poner'}</button></div>`, 'es-fig');
      $$('.es-cols', hj).forEach(deslizarLado);
      const prev = () => { $('.es-fprev', hj).outerHTML = prevHtml(); $('#esGiroV', hj).textContent = F.giro + '°'; $('#esGiro', hj).value = F.giro; };
      const gr = $('#esGrosor', hj); gr.oninput = () => { F.grosor = +gr.value; prev(); };
      const gi = $('#esGiro', hj); gi.oninput = () => { F.giro = +gi.value; prev(); };
      hj.onclick = ev => { const b = ev.target.closest('button'); if(!b) return; const d = b.dataset;
        if(d.g){ F.giro = Math.max(-180, Math.min(180, F.giro + +d.g)); prev(); }
        else if('g0' in d){ F.giro = 0; prev(); }
        else if(d.tipo){ F.tipo = d.tipo; pintar(); }
        else if(d.capa){ F.capa = d.capa; $$('[data-capa]', hj).forEach(x => x.classList.toggle('on', x === b)); }
        else if(d.rib){ F.ribete = d.rib; pintar(); }
        else if(d.rel){ F.relleno = d.rel; pintar(); }
        else if(d.a === 'ok'){
          if(F.ribete === 'transparente' && F.relleno === 'transparente'){ toast('Pon color al ribete o al relleno; si no, no se ve'); return; }
          cerrarHojaMio();
          if(sel){ const t0 = sel.tipo; Object.assign(sel, F); if(F.tipo !== t0 && (F.tipo === 'redonda' || F.tipo === 'cuadrado')) sel.h = sel.w = Math.round(Math.min(sel.w, sel.h)); }
          else { const n = this.nuevaFig(F, medidas(F.tipo)); this.figs.push(n); this.sel = n.id; }
          this.pintarFigs(); if(!sel) this.seleccionar(this.sel); this.cambioFigs(); }
        else if(d.a === 'quitar'){ cerrarHojaMio(); this.quitarFig(sel); }
        else cerrarHojaMio(); };
    };
    pintar();
  },
  cssForma(f, w, h){
    const sin = f.ribete === 'transparente', br = f.tipo === 'redonda' || f.tipo === 'ovalo' ? '50%' : f.tipo === 'redondeado' ? Math.round(Math.min(w, h) * .2) + 'px' : '0';
    return `display:block;box-sizing:border-box;border:${sin ? '0' : Math.max(1, Math.round(f.grosor * Math.min(1, w / 120 + .4))) + 'px solid ' + f.ribete};background:${f.relleno === 'transparente' ? 'transparent' : f.relleno};border-radius:${br}${f.giro ? ';transform:rotate(' + f.giro + 'deg)' : ''}`;
  },
  // una figura nueva sale donde está el cursor (o en el centro de lo que se ve)
  nuevaFig(F, [w, h]){
    const P = $('#esPapel'), pr = P.getBoundingClientRect(), W = P.clientWidth; w = Math.min(w, W - 24);
    let x = (W - w) / 2, y = null;
    if(this._rango){ try{ const rr = this._rango.getClientRects()[0] || this._rango.startContainer.getBoundingClientRect && this._rango.startContainer.getBoundingClientRect(); if(rr && rr.height){ y = rr.top - pr.top + rr.height / 2 - h / 2; x = Math.min(Math.max(8, rr.left - pr.left - 16), W - w - 8); } }catch(e){} }
    if(y === null){ const hj = $('#esHoja'); y = hj.scrollTop + hj.clientHeight / 2 - h / 2 - P.offsetTop; }
    return { id:nuevoId('fg'), tipo:F.tipo, ribete:F.ribete, grosor:F.grosor, relleno:F.relleno, giro:F.giro, capa:F.capa, x:Math.round(x), y:Math.round(Math.max(4, y)), w:Math.round(w), h:Math.round(h) };
  },

  /* ---------- Dictar ---------- */
  dictar(){
    const b = $('#esMic'), e = $('#esTexto');
    if(Voz.activo){ Voz.parar(); setTimeout(() => this.cambio(), 300); return; }
    // el texto dictado entra donde está el cursor (si no, al final)
    e.focus();
    const sel = getSelection(); let r = sel.rangeCount ? sel.getRangeAt(0) : null;
    if(!r || !e.contains(r.startContainer)){ r = document.createRange(); r.selectNodeContents(e); r.collapse(false); }
    Voz.empezar(e, b, $('#esEstado'), { rango:r, idioma:this.idioma() });
  },
  idioma(){ return (App.ajustes && (App.ajustes.idiomaEscribir || App.ajustes.idiomaVoz)) || 'es-ES';
  },

  /* ---------- Mis escritos ---------- */
  misEscritos(){
    this.guardarYa();
    // los escritos vacíos no cuentan (ni salen en la lista)
    const todos = this.lista(), l = todos.filter(d => !this.vacio(d)).sort((a, b) => b.cambiado - a.cambiado);
    if(todos.some(d => this.vacio(d) && d.id !== this.id)) this.ponerLista(todos.filter(d => !this.vacio(d) || d.id === this.id));
    const p = popMio(`<h3 class="mp-h">📄 Mis escritos</h3>
      ${l.length ? `<div class="mp-notas">${l.map(d => `<button class="mp-nota es-it ${d.id === this.id ? 'on' : ''}" data-id="${d.id}"><span><b>${esc(this.tituloDe(d))}</b><small>${d.id === this.id ? '✏️ Abierto · ' : ''}${new Date(d.cambiado).toLocaleString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</small></span><em data-borrar="${d.id}" aria-label="Borrar">🗑️</em></button>`).join('')}</div>`
        : `<p class="es-vacio">📭 No tienes ningún escrito guardado.<br>No hay nada que borrar.</p>`}
      <button class="mp-op" data-abrir><span class="mp-ic">📂</span><span><b>Abrir un archivo</b><small>Un .docx (Word o Pages) o un PDF</small></span></button>
      <div class="mp-fila"><button class="mp-b" data-x>Cerrar</button><button class="mp-b mp-pri" data-nuevo>＋ Nuevo escrito</button></div>`);
    p.onclick = async e => {
      const br = e.target.closest('[data-borrar]');
      if(br){ e.stopPropagation(); const d = this.lista().find(x => x.id === br.dataset.borrar); if(!d){ this.misEscritos(); return; }
        if(!await confirmarMio('Borrar escrito', `¿Borrar «${esc(this.tituloDe(d))}»? No se puede deshacer.`, 'Borrar')){ this.misEscritos(); return; }
        this.ponerLista(this.lista().filter(x => x.id !== d.id));
        if(this.id === d.id){ this.id = null; this.nuevo(true); this.cargar(); }
        toast('🗑️ Borrado'); this.misEscritos(); return; }
      const b = e.target.closest('[data-id],[data-nuevo],[data-x],[data-abrir]'); if(!b) return;
      if('abrir' in b.dataset){ cerrarPopMio(); this.elegirArchivo(); return; }
      cerrarPopMio();
      if(b.dataset.id){ this.guardarYa(); const ant = this.actual(); this.id = b.dataset.id; if(ant && this.vacio(ant) && ant.id !== this.id) this.ponerLista(this.lista().filter(x => x.id !== ant.id)); this.cargar(); }
      else if('nuevo' in b.dataset){ const ant = this.actual(); if(ant && this.vacio(ant)){ $('#esTexto').focus(); toast('📝 Ya tienes una hoja en blanco'); } else this.nuevo(); }
    };
  },

  /* ---------- Abrir un .docx o un PDF (entra como un escrito nuevo, para leerlo y cambiarlo) ---------- */
  // si ya hay un escrito abierto, primero se pregunta qué hacer con él
  elegirArchivo(){
    this.guardarYa();
    const d = this.actual();
    if(!d || this.vacio(d)){ this.pedirArchivo(null); return; }
    const p = popMio(`<h3 class="mp-h">📂 Abrir otro archivo</h3>
      <p class="es-preg">Tienes abierto <b>«${esc(this.tituloDe(d))}»</b>. ¿Qué hago con él?</p>
      <button class="mp-op" data-a="docx"><span class="mp-ic">📄</span><span><b>Guardarlo en .docx y quitarlo</b><small>Lo guardas en Archivos / Word y luego eliges el otro</small></span></button>
      <button class="mp-op" data-a="quitar"><span class="mp-ic">🗑️</span><span><b>Quitarlo sin guardar</b><small>Se borra de la app</small></span></button>
      <button class="mp-op" data-a="dejar"><span class="mp-ic">📄</span><span><b>Dejarlo en «Mis escritos»</b><small>Sigue guardado aquí para después</small></span></button>
      <div class="mp-fila"><button class="mp-b" data-a="x">Cancelar</button></div>`);
    p.onclick = async e => { const b = e.target.closest('[data-a]'); if(!b) return; const a = b.dataset.a; cerrarPopMio();
      if(a === 'quitar' || a === 'dejar') this.pedirArchivo(a === 'quitar' ? d.id : null);   // se abre ya el selector (y se quita cuando eliges)
      else if(a === 'docx'){ const ok = await this.docx(); if(ok){ const p2 = popMio(`<h3 class="mp-h">✓ Guardado</h3><p class="es-preg">Ahora elige el archivo que quieres abrir.</p>
          <div class="mp-fila"><button class="mp-b" data-x>Ahora no</button><button class="mp-b mp-pri" data-elegir>📂 Elegir archivo</button></div>`);
          p2.onclick = ev => { if(ev.target.closest('[data-elegir]')){ cerrarPopMio(); this.pedirArchivo(null); } else if(ev.target.closest('[data-x]')) cerrarPopMio(); }; } } };
  },
  pedirArchivo(quitarId){
    const i = document.createElement('input'); i.type = 'file';
    i.accept = '.docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    i.onchange = () => { const f = i.files[0]; i.remove(); if(f) this.abrirArchivo(f, quitarId); };
    i.style.display = 'none'; document.body.appendChild(i); i.click();
  },
  async abrirArchivo(f, quitarId){
    const nom = f.name.replace(/\.(docx|pdf)$/i, '');
    toast('📂 Abriendo «' + f.name + '»…', null, null, 15000);
    let html = '';
    try{
      if(/\.pdf$/i.test(f.name) || f.type === 'application/pdf') html = await LeerArchivo.pdf(f);
      else if(/\.docx$/i.test(f.name)) html = await LeerArchivo.docx(f);
      else { popAviso('Abrir', 'Solo se pueden abrir archivos .docx y PDF. (Un .pages: en Pages, «Exportar a → Word».)'); return; }
    }catch(err){ console.warn(err); popAviso('Abrir', 'No se ha podido abrir este archivo. ¿Es un .docx o un PDF normal?'); return; }
    this.guardarYa();
    const figs = LeerArchivo.figs || []; LeerArchivo.figs = [];
    let quitado = null;
    const l = this.lista().filter(x => { if(x.id === quitarId || (x.id === this.id && this.vacio(x))){ if(x.id === quitarId) quitado = x; return false; } return true; });
    const d = { id:nuevoId('es'), titulo:nom, html, figs:[], creado:Date.now(), cambiado:Date.now() };
    l.push(d); this.ponerLista(l); this.id = d.id;
    if(!this.activa()) soloVista('vEscribir');
    this.cargar(); $('#esHoja').scrollTop = 0;
    if(figs.length) requestAnimationFrame(() => this.colocarAnclas(figs));
    if(quitado) toast('📂 «' + f.name + '» abierto · «' + this.tituloDe(quitado) + '» quitado', 'Deshacer', () => { const l2 = this.lista(); l2.push(quitado); this.ponerLista(l2); toast('↩️ «' + this.tituloDe(quitado) + '» vuelve a estar en «Mis escritos»'); }, 8000);
    else toast('📂 «' + f.name + '» abierto. Ya puedes cambiarlo.');
  },
  // figuras que vienen de un .docx hecho aquí: se ponen junto a su párrafo
  colocarAnclas(figs){
    const P = $('#esPapel'), pr = P.getBoundingClientRect(), e = $('#esTexto'), pad = parseFloat(getComputedStyle(e).paddingLeft) || 18, er = e.getBoundingClientRect();
    for(const f of figs){
      const m = $(`#esTexto [data-ancla="${f.ancla}"]`); let top = er.top - pr.top + (parseFloat(getComputedStyle(e).paddingTop) || 18);
      if(m){ const bl = m.closest('div,li,p') ; if(bl && e.contains(bl) && bl !== e) top = bl.getBoundingClientRect().top - pr.top; m.remove(); }
      const { ancla, dx, dy, ...F } = f; this.figs.push({ ...F, id:nuevoId('fg'), x:Math.round(er.left - pr.left + pad + dx), y:Math.round(Math.max(0, top + dy)) });
    }
    $$('#esTexto [data-ancla]').forEach(x => x.remove());
    this.pintarFigs(); this.cambio();
  },

  salir(){ if(Voz.activo) Voz.parar(); this.guardarYa(); irA('portada'); },

  /* ---------- Guardar como .docx (Word y Pages lo abren) ---------- */
  async docx(){
    if(Voz.activo){ Voz.parar(); await new Promise(r => setTimeout(r, 400)); }
    this.guardarYa();
    const d = this.actual(); if(!d) return false;
    if(this.vacio(d)){ toast('La hoja está vacía: no hay nada que guardar'); return false; }
    this.sel = null; this.pintarSel();
    const nom = (this.tituloDe(d) || 'Escrito').replace(/[\\/:*?"<>|…]/g, '').trim().slice(0, 50) || 'Escrito';
    const blob = new Blob([DocxSimple.crear(nom, $('#esTexto'), this.figs, $('#esPapel'))], { type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const archivo = nom + '.docx';
    try{
      const f = new File([blob], archivo, { type:blob.type });
      if(navigator.canShare && navigator.canShare({ files:[f] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)){
        await navigator.share({ files:[f], title:nom }); this.quitarGuardado(d, archivo); return true; }
    }catch(e){ if(e && e.name === 'AbortError'){ toast('No se ha guardado: el escrito sigue aquí'); return false; } }
    descargar(blob, archivo); this.quitarGuardado(d, archivo); return true;
  },
  // Ya está guardado fuera: se quita de la app para que no ocupe espacio (con «Deshacer» unos segundos)
  quitarGuardado(d, archivo){
    const copia = JSON.parse(JSON.stringify(d));
    this.ponerLista(this.lista().filter(x => x.id !== d.id));
    this.id = null;
    const l = this.lista();
    this.nuevo(true);   // queda una hoja en blanco
    this.cargar();
    toast('📄 «' + archivo + '» guardado y quitado de la app', 'Deshacer', () => {
      const l2 = this.lista().filter(x => !(x.id === this.id && this.vacio(x))); l2.push(copia); this.ponerLista(l2); this.id = copia.id; this.cargar(); toast('↩️ El escrito vuelve a estar aquí'); }, 8000);
  },

  iniciar(){
    const e = $('#esTexto');
    e.addEventListener('input', () => this.cambio());
    e.addEventListener('keyup', () => this.pintarBarra()); e.addEventListener('mouseup', () => this.pintarBarra());
    document.addEventListener('selectionchange', () => { if(this.activa()) this.pintarBarra(); });
    // al pegar, solo el texto (sin formatos raros)
    e.addEventListener('paste', ev => {
      ev.preventDefault();
      const cd = ev.clipboardData || window.clipboardData;
      const fotos = [...(cd.items || [])].filter(i => i.kind === 'file' && /^image\//.test(i.type)).map(i => i.getAsFile()).filter(Boolean);
      if(fotos.length){ this.ponerFotos(fotos); return; }
      document.execCommand('insertText', false, cd.getData('text/plain'));
    });
    // arrastrar una imagen desde el ordenador
    e.addEventListener('drop', ev => { const fs = [...(ev.dataTransfer.files || [])].filter(f => /^image\//.test(f.type)); if(fs.length){ ev.preventDefault(); this.ponerFotos(fs); } });
    // tocar una foto: cambiar su tamaño o quitarla
    e.addEventListener('click', ev => { const im = ev.target.closest('img'); if(im) this.menuFoto(im); });
    // figuras: tocar, arrastrar y tirar de las esquinas
    const P = $('#esPapel');
    P.addEventListener('pointerdown', ev => this.figDown(ev), true);
    P.addEventListener('click', ev => { const b = ev.target.closest('.es-mbar button'); if(!b) return; const f = this.figSel(); if(!f) return;
      if(b.dataset.capa){ f.capa = b.dataset.capa; this.pintarFigs(); this.cambioFigs(); toast(f.capa === 'detras' ? '⬇️ Detrás del texto (para cogerla, toca su borde)' : '⬆️ Delante del texto', null, null, 2200); }
      else if('quitar' in b.dataset) this.quitarFig(f); });
    document.addEventListener('keydown', ev => { if(!this.activa() || !this.sel) return; const a = document.activeElement;
      if(a && (a.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(a.tagName))) return;
      if(ev.key === 'Delete' || ev.key === 'Backspace'){ ev.preventDefault(); this.quitarFig(this.figSel()); }
      else if(ev.key === 'Escape') this.seleccionar(null); });
    e.addEventListener('focus', () => { if(this.sel) this.seleccionar(null); });
    $('#esTitulo').addEventListener('input', () => this.cambio());
    $('#esBarra').addEventListener('mousedown', ev => { if(ev.target.closest('button')) ev.preventDefault(); });   // que no se pierda lo seleccionado
    $('#esBarra').addEventListener('click', ev => { const b = ev.target.closest('button'); if(!b) return;
      if(b.id === 'esFoto'){ this.guardarCursor(); this.fotoBoton(); } else if(b.id === 'esForma') this.figura(); else if(b.id === 'esEmoji') this.iconos(); else if(b.dataset.c) this.cmd(b.dataset.c, b.dataset.v); });
    $('#esTam').addEventListener('pointerdown', () => this.guardarCursor());
    $('#esTam').onchange = ev => { if(ev.target.value){ this.restaurarCursor(); this.cmd('tam', ev.target.value); } ev.target.value = ''; };
    $('#esMis').onclick = () => this.misEscritos();
    $('#esAbrir').onclick = () => this.elegirArchivo();
    $('#esSalir').onclick = () => this.salir();
    $('#esDocx').onclick = () => this.docx();
    $('#esMic').addEventListener('mousedown', ev => ev.preventDefault());   // que no se pierda el cursor
    $('#esMic').onclick = () => this.dictar();
    $('#esMic').innerHTML = icIn('mic') + '<b>Dictar</b>';
    deslizarLado($('#esBarra'));
    document.addEventListener('visibilitychange', () => { if(document.hidden) this.guardarYa(); });
  }
};

/* ---------- Un .docx sencillo hecho aquí mismo (sin internet) ---------- */
const DocxSimple = {
  x(s){ return String(s).replace(/\u200b/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
  // recorre el texto del editor y lo convierte en párrafos con su formato
  parrafos(raiz){
    const P = [];
    let cur = null;
    const nuevo = (extra, el) => { cur = { runs:[], jc:extra.jc || null, pre:extra.pre || '', el:el || null, anclas:[] }; P.push(cur); };
    const andar = (n, f, extra) => {
      if(n.nodeType === 3){
        const partes = n.nodeValue.replace(/\u200b/g, '').split('\n');
        if(partes.length === 1 && !partes[0]) return;
        partes.forEach((t, i) => { if(i > 0) nuevo(extra); if(!cur) nuevo(extra); if(!cur.el) cur.el = n; if(t) cur.runs.push({ t, ...f }); });
        return;
      }
      if(n.nodeType !== 1) return;
      const tag = n.tagName, st = n.style || {}, g = { ...f };
      if(tag === 'B' || tag === 'STRONG' || /bold|[6-9]00/.test(st.fontWeight || '')) g.b = true;
      if(tag === 'I' || tag === 'EM' || st.fontStyle === 'italic') g.i = true;
      if(tag === 'U' || /underline/.test(st.textDecoration || st.textDecorationLine || '')) g.u = true;
      if(st.fontSize){ const px = parseFloat(st.fontSize); if(px) g.sz = Math.round(px * 4 / 3); }   // 18 px = 12 pt (igual que las figuras)
      const bg = st.backgroundColor; if(bg && !/transparent|rgba\(0, 0, 0, 0\)/.test(bg)) g.hl = true;
      if(tag === 'BR'){ nuevo(extra); return; }
      if(tag === 'IMG'){ const m = /^data:image\/(jpeg|jpg|png);base64,(.+)$/.exec(n.getAttribute('src') || ''); if(m){ nuevo({ ...extra, jc:'center', pre:'' }, n);   // cada foto en su propio párrafo, centrada
        cur.runs.push({ img:{ b64:m[2], ext:m[1] === 'png' ? 'png' : 'jpeg', w:n.naturalWidth || 800, h:n.naturalHeight || 600, pc:+(n.dataset.w || 100) } }); cur = null; } return; }
      const bloque = /^(DIV|P|LI|H1|H2|H3|BLOCKQUOTE)$/.test(tag);
      let ex = extra;
      if(bloque){
        ex = { ...extra, jc:(st.textAlign === 'center' ? 'center' : st.textAlign === 'right' ? 'right' : extra.jc) };
        if(tag === 'LI'){ const ol = n.parentElement && n.parentElement.tagName === 'OL'; ex.pre = ol ? ([...n.parentElement.children].indexOf(n) + 1) + '. ' : '•  '; }
        if(/^H/.test(tag)){ g.b = true; g.sz = tag === 'H1' ? 48 : 36; }
        const pri = n.firstElementChild; if(!(pri && pri === n.firstChild && /^(UL|OL|DIV|P)$/.test(pri.tagName))) nuevo(ex, n);   // un bloque que solo envuelve otro no hace párrafo vacío
      }
      [...n.childNodes].forEach(c => andar(c, g, ex));
      if(bloque) cur = null;
    };
    [...raiz.childNodes].forEach(c => andar(c, {}, {}));
    return P.filter((p, i) => p.runs.length || p.pre || i < P.length - 1);
  },
  K: 8467,   // 1 px de la pantalla ≈ 2/3 de punto (18 px en pantalla = 12 pt en Word), en EMU
  // cada figura se engancha al párrafo que tiene al lado, a la misma distancia
  anclas(ps, figs, raiz, papel){
    if(!figs || !figs.length || !papel || !papel.clientWidth) return;
    const pr = papel.getBoundingClientRect(), rr = raiz.getBoundingClientRect(), cs = getComputedStyle(raiz);
    const izq = rr.left - pr.left + (parseFloat(cs.paddingLeft) || 0); let ult = rr.top - pr.top + (parseFloat(cs.paddingTop) || 0);
    const tops = ps.map(p => { const n = p.el; let r = null;
      try{ if(n && n.nodeType === 3){ const g = document.createRange(); g.selectNodeContents(n); r = g.getClientRects()[0] || null; } else if(n) r = n.getBoundingClientRect(); }catch(e){}
      return r && (r.height || r.top) ? (ult = r.top - pr.top) : ult; });
    for(const f of figs){ let k = 0; tops.forEach((t, i) => { if(t <= f.y + 2) k = i; }); ps[k].anclas.push({ f, dx:f.x - izq, dy:f.y - tops[k] }); }
  },
  dibujoAncla(a, n0){
    const f = a.f, m = /^data:image\/png;base64,(.+)$/.exec(Escribir.dibujarForma(f, 2)); if(!m) return '';
    this.fotos.push({ b64:m[1], ext:'png' }); const n = this.fotos.length, id = 'rIdImg' + n, K = this.K;
    const cx = Math.round(f.w * K), cy = Math.round(f.h * K), rot = (((Math.round(f.giro || 0)) % 360) + 360) % 360 * 60000;
    const info = this.x('PorHacer3:' + JSON.stringify({ tipo:f.tipo, ribete:f.ribete, grosor:f.grosor, relleno:f.relleno, giro:f.giro || 0, capa:f.capa, w:f.w, h:f.h })).replace(/"/g, '&quot;');
    return `<w:r><w:drawing><wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="${251658240 + n}" behindDoc="${f.capa === 'detras' ? 1 : 0}" locked="0" layoutInCell="1" allowOverlap="1">`
      + `<wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="column"><wp:posOffset>${Math.round(a.dx * K)}</wp:posOffset></wp:positionH><wp:positionV relativeFrom="paragraph"><wp:posOffset>${Math.round(a.dy * K)}</wp:posOffset></wp:positionV>`
      + `<wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/><wp:docPr id="${n}" name="Figura ${n}" descr="${info}"/><wp:cNvGraphicFramePr/>`
      + `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">`
      + `<pic:nvPicPr><pic:cNvPr id="${n}" name="figura${n}.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`
      + `<pic:spPr><a:xfrm${rot ? ` rot="${rot}"` : ''}><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r>`;
  },
  dibujo(im){
    this.fotos = this.fotos || []; this.fotos.push(im); const n = this.fotos.length, id = 'rIdImg' + n;
    const ancho = Math.round(5760000 * im.pc / 100), alto = Math.round(ancho * im.h / im.w);   // 16 cm de ancho = 100 %
    return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${ancho}" cy="${alto}"/><wp:docPr id="${n}" name="Foto ${n}"/>`
      + `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">`
      + `<pic:nvPicPr><pic:cNvPr id="${n}" name="foto${n}.${im.ext}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`
      + `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${ancho}" cy="${alto}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  },
  documento(tit, raiz, figs, papel){
    const run = r => r.img ? this.dibujo(r.img) : `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>${r.b ? '<w:b/>' : ''}${r.i ? '<w:i/>' : ''}${r.u ? '<w:u w:val="single"/>' : ''}${r.hl ? '<w:highlight w:val="yellow"/>' : ''}<w:sz w:val="${r.sz || 24}"/></w:rPr><w:t xml:space="preserve">${this.x(r.t)}</w:t></w:r>`;
    const par = p => `<w:p><w:pPr><w:spacing w:after="0" w:line="372" w:lineRule="atLeast"/>${p.pre ? '<w:ind w:left="360" w:hanging="360"/>' : ''}${p.jc ? `<w:jc w:val="${p.jc}"/>` : ''}</w:pPr>${(p.anclas || []).map(a => this.dibujoAncla(a)).join('')}${p.pre ? run({ t:p.pre, sz:p.runs[0] && p.runs[0].sz }) : ''}${p.runs.map(run).join('')}</w:p>`;
    const ps = this.parrafos(raiz); if(!ps.length) ps.push({ runs:[], anclas:[] });
    this.anclas(ps, figs, raiz, papel);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>${ps.map(par).join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  },
  crear(tit, raiz, figs, papel){
    const ahora = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    this.fotos = [];
    const doc = this.documento(tit, raiz, figs, papel), fotos = this.fotos;
    const F = {
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>',
      'docProps/core.xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${this.x(tit)}</dc:title><dc:creator>PorHacer3</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${ahora}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${ahora}</dcterms:modified></cp:coreProperties>`,
      'word/document.xml':doc,
      'word/_rels/document.xml.rels':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${fotos.map((f, i) => `<Relationship Id="rIdImg${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/foto${i + 1}.${f.ext}"/>`).join('')}</Relationships>`
    };
    fotos.forEach((f, i) => { F['word/media/foto' + (i + 1) + '.' + f.ext] = Uint8Array.from(atob(f.b64), c => c.charCodeAt(0)); });
    return this.zip(F);
  },
  // ZIP sin comprimir (suficiente para un .docx de texto)
  crc(b){ let t = this._t; if(!t){ t = this._t = new Uint32Array(256); for(let n = 0; n < 256; n++){ let c = n; for(let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } }
    let c = 0xFFFFFFFF; for(let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; },
  zip(F){
    const enc = new TextEncoder(), partes = [], central = []; let off = 0;
    const u16 = n => [n & 255, (n >> 8) & 255], u32 = n => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
    for(const [nom, txt] of Object.entries(F)){
      const n = enc.encode(nom), d = typeof txt === 'string' ? enc.encode(txt) : txt, c = this.crc(d);
      const loc = new Uint8Array([0x50,0x4b,3,4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0)]);
      partes.push(loc, n, d);
      central.push(new Uint8Array([0x50,0x4b,1,2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), n);
      off += loc.length + n.length + d.length;
    }
    const tc = central.reduce((s, a) => s + a.length, 0), nF = Object.keys(F).length;
    const fin = new Uint8Array([0x50,0x4b,5,6, ...u16(0), ...u16(0), ...u16(nF), ...u16(nF), ...u32(tc), ...u32(off), ...u16(0)]);
    return new Blob([...partes, ...central, fin]);
  }
};

/* ---------- Leer .docx y PDF ---------- */
const LeerArchivo = {
  // abre el ZIP del .docx (sin librerías: el navegador sabe descomprimir)
  async unzip(buf){
    const v = new DataView(buf), u8 = new Uint8Array(buf), dec = new TextDecoder();
    let fin = buf.byteLength - 22; while(fin >= 0 && v.getUint32(fin, true) !== 0x06054b50) fin--;
    if(fin < 0) throw new Error('zip');
    const n = v.getUint16(fin + 10, true); let p = v.getUint32(fin + 16, true); const out = {};
    for(let k = 0; k < n; k++){
      const met = v.getUint16(p + 10, true), tam = v.getUint32(p + 20, true), ln = v.getUint16(p + 28, true), le = v.getUint16(p + 30, true), lc = v.getUint16(p + 32, true), off = v.getUint32(p + 42, true);
      const nom = dec.decode(u8.subarray(p + 46, p + 46 + ln));
      out[nom] = { met, tam, off };
      p += 46 + ln + le + lc;
    }
    const leer = async nom => { const x = out[nom]; if(!x) return null;
      const ini = x.off + 30 + v.getUint16(x.off + 26, true) + v.getUint16(x.off + 28, true), datos = u8.subarray(ini, ini + x.tam);
      if(x.met === 0) return datos;
      const s = new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return new Uint8Array(await new Response(s).arrayBuffer()); };
    return { nombres:Object.keys(out), leer };
  },
  figs: [],
  async docx(f){
    this.figs = [];
    const z = await this.unzip(await f.arrayBuffer()), dec = new TextDecoder();
    const xml = dec.decode(await z.leer('word/document.xml'));
    const relsTxt = await z.leer('word/_rels/document.xml.rels'), rels = {};
    if(relsTxt){ const rd = new DOMParser().parseFromString(dec.decode(relsTxt), 'application/xml'); [...rd.getElementsByTagName('Relationship')].forEach(r => rels[r.getAttribute('Id')] = r.getAttribute('Target')); }
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    const hijos = (n, ln) => [...n.childNodes].filter(c => c.localName === ln);
    const uno = (n, ln) => n.getElementsByTagNameNS(W, ln)[0];
    const val = n => n && (n.getAttributeNS(W, 'val') || n.getAttribute('w:val'));
    const esc2 = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fotos = {};
    const foto = async id => { if(fotos[id] !== undefined) return fotos[id]; const t = rels[id]; let src = '';
      if(t){ const bytes = await z.leer('word/' + t.replace(/^\/?word\//, '')); if(bytes){ const ext = (t.split('.').pop() || 'png').toLowerCase();
        const tipo = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'gif' ? 'image/gif' : 'image/png';
        try{ src = await aligerarImg(new Blob([bytes], { type:tipo }), 1100, .72); }catch(e){} } }
      return fotos[id] = src; };
    let html = '', lista = null;
    const cuerpo = uno(doc, 'body') || doc.documentElement;
    for(const p of [...cuerpo.getElementsByTagNameNS(W, 'p')]){
      if(p.parentNode && p.parentNode.localName !== 'body' && p.parentNode.localName !== 'tc' && p.parentNode.localName !== 'sdtContent') { /* dentro de cuadros: igual se lee */ }
      const pPr = hijos(p, 'pPr')[0], jc = pPr && val(uno(pPr, 'jc')), numPr = pPr && uno(pPr, 'numPr'), estilo = pPr && val(uno(pPr, 'pStyle')) || '';
      let ph = '';
      for(const r of p.getElementsByTagNameNS(W, 'r')){
        const rPr = hijos(r, 'rPr')[0];
        const b = rPr && uno(rPr, 'b') && val(uno(rPr, 'b')) !== '0' && val(uno(rPr, 'b')) !== 'false';
        const i = rPr && uno(rPr, 'i') && val(uno(rPr, 'i')) !== '0';
        const u = rPr && uno(rPr, 'u') && val(uno(rPr, 'u')) !== 'none';
        const hl = rPr && (uno(rPr, 'highlight') || uno(rPr, 'shd'));
        const sz = rPr && +val(uno(rPr, 'sz'));
        for(const c of r.childNodes){
          if(c.localName === 't'){ let t = esc2(c.textContent); if(!t) continue;
            const st = []; if(sz && Math.abs(sz / 2 - 12) > 1.5) st.push('font-size:' + Math.round(sz * .75) + 'px'); if(hl) st.push('background-color:#fff3a3');
            if(st.length) t = `<span style="${st.join(';')}">${t}</span>`; if(u) t = `<u>${t}</u>`; if(i) t = `<i>${t}</i>`; if(b) t = `<b>${t}</b>`; ph += t; }
          else if(c.localName === 'tab') ph += '&emsp;';
          else if(c.localName === 'br') ph += '<br>';
          else if(c.localName === 'drawing' && [...c.getElementsByTagName('*')].some(x => x.localName === 'docPr' && /^PorHacer3:/.test(x.getAttribute('descr') || ''))){
            // una figura hecha aquí: vuelve a ser una figura que se mueve
            const todos = [...c.getElementsByTagName('*')], dp = todos.find(x => x.localName === 'docPr'), off = nom => { const p = todos.find(x => x.localName === nom); const o = p && [...p.getElementsByTagName('*')].find(x => x.localName === 'posOffset'); return o ? +o.textContent || 0 : 0; };
            try{ const F = JSON.parse(dp.getAttribute('descr').slice(10)), k = this.figs.length;
              this.figs.push({ ...F, ancla:k, dx:off('positionH') / DocxSimple.K, dy:off('positionV') / DocxSimple.K }); ph += `<span data-ancla="${k}"></span>`; }catch(e){}
          }
          else if(c.localName === 'drawing' || c.localName === 'pict'){
            const bl = c.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'blip')[0] || c.getElementsByTagName('v:imagedata')[0];
            const id = bl && (bl.getAttribute('r:embed') || bl.getAttribute('r:id'));
            const src = id ? await foto(id) : ''; if(src) ph += `<img src="${src}" data-w="100" alt="">`;
          }
        }
      }
      if(/^(Heading1|Ttulo1|Titulo1|Title|Ttulo)$/i.test(estilo)) ph = `<b><span style="font-size:32px">${ph}</span></b>`;
      else if(/^Heading[23]|^Ttulo[23]|^Titulo[23]/i.test(estilo)) ph = `<b><span style="font-size:24px">${ph}</span></b>`;
      if(numPr || /^(ListBullet|ListNumber|ListParagraph|Prrafodelista|Listaconvietas|Listanumerada)/i.test(estilo)){ if(!lista){ html += '<ul>'; lista = true; } html += `<li>${ph || '<br>'}</li>`; continue; }
      if(lista){ html += '</ul>'; lista = null; }
      const soloAncla = !ph.replace(/<span data-ancla="\d+"><\/span>/g, '');
      html += `<div${jc === 'center' ? ' style="text-align:center"' : jc === 'right' || jc === 'end' ? ' style="text-align:right"' : ''}>${ph}${soloAncla ? '<br>' : ''}</div>`;
    }
    if(lista) html += '</ul>';
    return html;
  },
  // PDF: se saca el texto, página por página (las imágenes y el diseño del PDF no se pueden cambiar)
  async pdf(f){
    const L = await Manual.lib();
    const pdf = await L.getDocument({ data:new Uint8Array(await f.arrayBuffer()) }).promise;
    const esc2 = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let html = '';
    for(let n = 1; n <= pdf.numPages; n++){
      const pg = await pdf.getPage(n), tc = await pg.getTextContent();
      const lineas = []; let y = null, act = '', tamMax = 0;
      for(const it of tc.items){
        if(!('str' in it)) continue;
        const yy = Math.round(it.transform[5]), h = Math.abs(it.transform[3]);
        if(y !== null && Math.abs(yy - y) > 3){ lineas.push({ t:act, h:tamMax }); act = ''; tamMax = 0; }
        act += it.str.replace(/[\uE000-\uF8FF\u25AA\u25CF\u2022\u00B7]/g, '•');   // las viñetas de los PDF salen como cuadraditos
        tamMax = Math.max(tamMax, h); y = yy;
        if(it.hasEOL){ lineas.push({ t:act, h:tamMax }); act = ''; tamMax = 0; y = null; }
      }
      if(act) lineas.push({ t:act, h:tamMax });
      if(n > 1) html += '<div><br></div>';
      // se juntan las líneas en párrafos: solo si la línea llega casi al final (el texto sigue en la siguiente)
      const largo = Math.max(1, ...lineas.map(l => l.t.trim().length));
      let par = '', hPar = 0, sigue = false;
      const cerrar = () => { if(par.trim()){ const t = esc2(par.trim()); html += hPar > 15 ? `<div><b><span style="font-size:24px">${t}</span></b></div>` : `<div>${t}</div>`; } par = ''; hPar = 0; };
      for(const l of lineas){
        const t = l.t.trim();
        if(!t){ cerrar(); sigue = false; continue; }
        if(!sigue || /^•/.test(t) || (par && Math.abs(l.h - hPar) > 2)) cerrar();
        par += (par && !/-$/.test(par) ? ' ' : '') + t; hPar = Math.max(hPar, l.h);
        sigue = t.length >= largo * 0.75 && !/[.:!?]$/.test(t);
      }
      cerrar();
    }
    try{ pdf.destroy(); }catch(e){}
    if(!html.replace(/<[^>]+>/g, '').trim()) html = '<div>Este PDF no tiene texto que se pueda leer (puede que sea una foto escaneada).</div>';
    return html;
  }
};
