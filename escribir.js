/* PorHacer3 · Escribir: un editor de texto con dictado por voz
   Pulsas el micro y lo que dices se escribe donde está el cursor; vuelves a pulsar y para.
   Negrita, cursiva, subrayado, tamaño, listas, alinear, marcador, fotos (pegar o 📷) y deshacer.
   Se guarda solo en este aparato y se puede guardar como .docx (lo abren Word y Pages). */

const Escribir = {
  TAM: { peq:'15px', normal:'18px', grande:'24px', titulo:'32px' },
  lista(){ try{ return JSON.parse(lsGet('ph3-escritos') || '[]') || []; }catch(e){ return []; } },
  ponerLista(l){ try{ localStorage.setItem('ph3-escritos', JSON.stringify(l)); }catch(e){ toast('⚠️ No cabe más en este aparato: guarda alguno en .docx y bórralo'); } },
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
    this.contar();
  },
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
    const html = $('#esTexto').innerHTML, tit = $('#esTitulo').value.trim();
    if(d.html === html && (d.titulo || '') === tit) { if(!Voz.activo) $('#esEstado').textContent = '✓ Guardado'; return; }
    d.html = html; d.titulo = tit; d.cambiado = Date.now(); this.ponerLista(l);
    if(!Voz.activo) $('#esEstado').textContent = '✓ Guardado';
  },
  contar(){ const t = ($('#esTexto').innerText || '').trim(); const n = t ? t.split(/\s+/).length : 0; $('#esCuenta').textContent = n + (n === 1 ? ' palabra' : ' palabras'); },
  tituloDe(d){ if(d.titulo) return d.titulo; const t = (new DOMParser().parseFromString(d.html || '', 'text/html').body.textContent || '').trim(); return t ? t.slice(0, 40) + (t.length > 40 ? '…' : '') : 'Sin título'; },

  /* ---------- Formato ---------- */
  cmd(c, v){
    const e = $('#esTexto'); e.focus();
    if(c === 'tam'){
      document.execCommand('styleWithCSS', false, false);
      document.execCommand('fontSize', false, '7');                      // marca lo seleccionado…
      $$('font[size="7"]', e).forEach(f => { f.removeAttribute('size'); f.style.fontSize = this.TAM[v]; if(v === 'titulo') f.style.fontWeight = '900'; });   // …y le pone el tamaño
    } else if(c === 'marcar'){
      document.execCommand('styleWithCSS', false, true);
      const ya = document.queryCommandValue('backColor'); document.execCommand('hiliteColor', false, /255, 2(3|4)\d, 1/.test(ya) ? 'transparent' : '#fff3a3');
      document.execCommand('styleWithCSS', false, false);
    } else document.execCommand(c, false, v || null);
    this.pintarBarra(); this.cambio();
  },
  pintarBarra(){
    $$('#esBarra [data-c]').forEach(b => { const c = b.dataset.c; if(['bold','italic','underline','insertUnorderedList','insertOrderedList','justifyLeft','justifyCenter'].includes(c)){
      let on = false; try{ on = document.queryCommandState(c); }catch(e){} b.classList.toggle('on', on); } });
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
    if(im.dataset.forma){ this.figura(im); return; }
    const hj = hojaMio('📷 Foto', `
      <div class="es-tams">${[['30','Pequeña'],['50','Mediana'],['100','Grande']].map(([w, t]) => `<button class="sh-op ${im.dataset.w === w ? 'on' : ''}" data-w="${w}">${t}</button>`).join('')}</div>
      <button class="sh-op peligro" data-a="quitar">🗑️ Quitar la foto</button>
      <button class="sh-btn" data-a="x">Cerrar</button>`);
    hj.onclick = ev => { const b = ev.target.closest('[data-w],[data-a]'); if(!b) return;
      if(b.dataset.w){ im.dataset.w = b.dataset.w; this.cambio(); }
      else if(b.dataset.a === 'quitar'){ im.remove(); this.cambio(); }
      cerrarHojaMio(); };
  },

  /* ---------- Figuras: cuadrado, cuadrado redondeado, óvalo y redonda ---------- */
  COLORES: ['transparente','#e5201c','#f08a1a','#f2c418','#3fae5a','#2f80ed','#8b5adf','#e84898','#8a5a3c','#3a3a3c','#9aa0a6','#ffffff','#ffd6d4','#ffe8c7','#fff6bf','#d6f2dc','#d4e6fb','#e6dcfb','#fbd6e8','#efe3d6'],
  FORMAS: { cuadrado:'Cuadrado', redondeado:'Redondeado', ovalo:'Óvalo', redonda:'Redonda' },
  dibujarForma(f, escala){
    const k = escala || 1, ancho = (f.tipo === 'ovalo' ? 600 : 400) * k, alto = (f.tipo === 'ovalo' ? 380 : 400) * k;
    const c = document.createElement('canvas'); c.width = ancho; c.height = alto; const x = c.getContext('2d');
    const g = f.ribete === 'transparente' ? 0 : f.grosor * 2 * k, m = g / 2 + 2 * k;
    x.beginPath();
    if(f.tipo === 'redonda' || f.tipo === 'ovalo') x.ellipse(ancho / 2, alto / 2, ancho / 2 - m, alto / 2 - m, 0, 0, Math.PI * 2);
    else if(f.tipo === 'redondeado' && x.roundRect) x.roundRect(m, m, ancho - 2 * m, alto - 2 * m, 70 * k);
    else x.rect(m, m, ancho - 2 * m, alto - 2 * m);
    if(f.relleno !== 'transparente'){ x.fillStyle = f.relleno; x.fill(); }
    if(g){ x.lineWidth = g; x.strokeStyle = f.ribete; x.lineJoin = 'round'; x.stroke(); }
    const giro = ((+f.giro || 0) % 360) * Math.PI / 180;
    if(!giro) return c.toDataURL('image/png');
    // girada: se dibuja dentro de un lienzo más grande para que no se corte
    const cs = Math.abs(Math.cos(giro)), sn = Math.abs(Math.sin(giro)), W2 = Math.ceil(ancho * cs + alto * sn), H2 = Math.ceil(ancho * sn + alto * cs);
    const c2 = document.createElement('canvas'); c2.width = W2; c2.height = H2; const y = c2.getContext('2d');
    y.translate(W2 / 2, H2 / 2); y.rotate(giro); y.drawImage(c, -ancho / 2, -alto / 2);
    return c2.toDataURL('image/png');
  },
  figura(im){
    const viejo = im && im.dataset.forma ? JSON.parse(im.dataset.forma) : null;
    if(!im) this.guardarCursor();
    const F = Object.assign({ tipo:'redondeado', ribete:'#e5201c', grosor:4, relleno:'#fff6bf', w:30, giro:0 }, viejo || {});
    F.w = +F.w || 30; F.giro = +F.giro || 0;
    const muestra = c => c === 'transparente' ? '<i class="es-transp"></i>' : `<i style="background:${c}"></i>`;
    const pintar = () => {
      const hj = hojaMio(viejo ? '✏️ Cambiar la figura' : '◻︎ Poner una figura', `
        <div class="es-fprev"><img src="${this.dibujarForma(F, .5)}" alt=""></div>
        <div class="st-et">Tamaño · <b id="esTamV">${F.w}%</b></div>
        <div class="es-grosor"><span>🔹</span><input type="range" min="5" max="100" value="${F.w}" id="esTamF"><span>🔷</span></div>
        <div class="st-et">Girar · <b id="esGiroV">${F.giro}°</b></div>
        <div class="es-giro"><button data-g="-15" aria-label="Girar a la izquierda">↺ 15°</button><input type="range" min="-180" max="180" value="${F.giro}" id="esGiro"><button data-g="15" aria-label="Girar a la derecha">↻ 15°</button><button data-g0 aria-label="Sin girar">0°</button></div>
        <div class="st-et">Forma</div>
        <div class="es-formas">${Object.entries(this.FORMAS).map(([k, t]) => `<button data-tipo="${k}" class="${F.tipo === k ? 'on' : ''}"><img src="${this.dibujarForma({ tipo:k, ribete:'#3a3a3c', grosor:6, relleno:'transparente' }, .2)}" alt="">${t}</button>`).join('')}</div>
        <div class="st-et">Ribete (borde)</div>
        <div class="es-cols">${this.COLORES.map(c => `<button data-rib="${c}" class="${F.ribete === c ? 'on' : ''}" aria-label="${c}">${muestra(c)}</button>`).join('')}</div>
        <div class="es-grosor"><span>Fino</span><input type="range" min="1" max="20" value="${F.grosor}" id="esGrosor"><span>Grueso</span></div>
        <div class="st-et">Relleno (dentro)</div>
        <div class="es-cols">${this.COLORES.map(c => `<button data-rel="${c}" class="${F.relleno === c ? 'on' : ''}" aria-label="${c}">${muestra(c)}</button>`).join('')}</div>
        <div class="mp-fila">${viejo ? '<button class="mp-b mp-borrar" data-a="quitar" aria-label="Quitar">🗑️</button>' : ''}<button class="mp-b" data-a="x">Cancelar</button><button class="mp-b mp-pri" data-a="ok">${viejo ? 'Guardar' : 'Poner'}</button></div>`, 'es-fig');
      $$('.es-cols', hj).forEach(deslizarLado);
      const prev = () => { $('.es-fprev img', hj).src = this.dibujarForma(F, .5); $('#esTamV', hj).textContent = F.w + '%'; $('#esGiroV', hj).textContent = F.giro + '°'; $('#esGiro', hj).value = F.giro; };
      const gr = $('#esGrosor', hj); gr.oninput = () => { F.grosor = +gr.value; prev(); };
      const tm = $('#esTamF', hj); tm.oninput = () => { F.w = +tm.value; prev(); if(viejo) im.style.width = F.w + '%'; };
      const gi = $('#esGiro', hj); gi.oninput = () => { F.giro = +gi.value; prev(); };
      hj.onclick = ev => { const b = ev.target.closest('button'); if(!b) return; const d = b.dataset;
        if(d.g){ F.giro = Math.max(-180, Math.min(180, F.giro + +d.g)); prev(); }
        else if('g0' in d){ F.giro = 0; prev(); }
        else if(d.tipo){ F.tipo = d.tipo; pintar(); }
        else if(d.rib){ F.ribete = d.rib; pintar(); }
        else if(d.rel){ F.relleno = d.rel; pintar(); }
        else if(d.a === 'ok'){
          if(F.ribete === 'transparente' && F.relleno === 'transparente'){ toast('Pon color al ribete o al relleno, si no, no se ve'); return; }
          cerrarHojaMio(); const src = this.dibujarForma(F, 1), js = JSON.stringify(F).replace(/"/g, '&quot;');
          if(viejo){ im.src = src; im.dataset.forma = JSON.stringify(F); im.dataset.w = F.w; im.style.width = F.w + '%'; }
          else { this.restaurarCursor(); document.execCommand('insertHTML', false, `<img src="${src}" data-w="${F.w}" data-forma="${js}" style="width:${F.w}%" alt="Figura">&#8203;`); }
          this.cambio(); }
        else if(d.a === 'quitar'){ im.remove(); cerrarHojaMio(); this.cambio(); }
        else { if(viejo){ im.style.width = viejo.w ? viejo.w + '%' : ''; } cerrarHojaMio(); } };
    };
    pintar();
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
    const l = this.lista().sort((a, b) => b.cambiado - a.cambiado);
    const p = popMio(`<h3 class="mp-h">📄 Mis escritos</h3>
      <div class="mp-notas">${l.map(d => `<button class="mp-nota es-it ${d.id === this.id ? 'on' : ''}" data-id="${d.id}"><span><b>${esc(this.tituloDe(d))}</b><small>${new Date(d.cambiado).toLocaleString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</small></span><em data-borrar="${d.id}" aria-label="Borrar">🗑️</em></button>`).join('')}</div>
      <button class="mp-op" data-abrir><span class="mp-ic">📂</span><span><b>Abrir un archivo</b><small>Un .docx (Word o Pages) o un PDF</small></span></button>
      <div class="mp-fila"><button class="mp-b" data-x>Cerrar</button><button class="mp-b mp-pri" data-nuevo>＋ Nuevo escrito</button></div>`);
    p.onclick = async e => {
      const br = e.target.closest('[data-borrar]');
      if(br){ e.stopPropagation(); const d = this.lista().find(x => x.id === br.dataset.borrar);
        if(!await confirmarMio('Borrar escrito', `¿Borrar «${esc(this.tituloDe(d))}»? No se puede deshacer.`, 'Borrar')){ this.misEscritos(); return; }
        this.ponerLista(this.lista().filter(x => x.id !== d.id)); if(this.id === d.id){ this.id = null; this.abrir(); } this.misEscritos(); return; }
      const b = e.target.closest('[data-id],[data-nuevo],[data-x],[data-abrir]'); if(!b) return;
      cerrarPopMio();
      if('abrir' in b.dataset){ this.elegirArchivo(); return; }
      if(b.dataset.id){ this.id = b.dataset.id; this.cargar(); }
      else if('nuevo' in b.dataset) this.nuevo();
    };
  },

  /* ---------- Abrir un .docx o un PDF (entra como un escrito nuevo, para leerlo y cambiarlo) ---------- */
  elegirArchivo(){
    const i = document.createElement('input'); i.type = 'file';
    i.accept = '.docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    i.onchange = () => { const f = i.files[0]; i.remove(); if(f) this.abrirArchivo(f); };
    i.style.display = 'none'; document.body.appendChild(i); i.click();
  },
  async abrirArchivo(f){
    const nom = f.name.replace(/\.(docx|pdf)$/i, '');
    toast('📂 Abriendo «' + f.name + '»…', null, null, 15000);
    let html = '';
    try{
      if(/\.pdf$/i.test(f.name) || f.type === 'application/pdf') html = await LeerArchivo.pdf(f);
      else if(/\.docx$/i.test(f.name)) html = await LeerArchivo.docx(f);
      else { popAviso('Abrir', 'Solo se pueden abrir archivos .docx y PDF. (Un .pages: en Pages, «Exportar a → Word».)'); return; }
    }catch(err){ console.warn(err); popAviso('Abrir', 'No se ha podido abrir este archivo. ¿Es un .docx o un PDF normal?'); return; }
    this.guardarYa();
    const d = { id:nuevoId('es'), titulo:nom, html, creado:Date.now(), cambiado:Date.now() };
    const l = this.lista(); l.push(d); this.ponerLista(l); this.id = d.id;
    if(!this.activa()) soloVista('vEscribir');
    this.cargar(); $('#esTexto').scrollTop = 0; $('.es-hoja').scrollTop = 0;
    toast('📂 «' + f.name + '» abierto. Ya puedes cambiarlo.');
  },

  salir(){ if(Voz.activo) Voz.parar(); this.guardarYa(); irA('portada'); },

  /* ---------- Guardar como .docx (Word y Pages lo abren) ---------- */
  async docx(){
    if(Voz.activo){ Voz.parar(); await new Promise(r => setTimeout(r, 400)); }
    this.guardarYa();
    const d = this.actual(); if(!d) return;
    const nom = (this.tituloDe(d) || 'Escrito').replace(/[\\/:*?"<>|…]/g, '').trim().slice(0, 50) || 'Escrito';
    const blob = new Blob([DocxSimple.crear(nom, $('#esTexto'))], { type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const archivo = nom + '.docx';
    try{
      const f = new File([blob], archivo, { type:blob.type });
      if(navigator.canShare && navigator.canShare({ files:[f] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)){
        await navigator.share({ files:[f], title:nom }); this.quitarGuardado(d, archivo); return; }
    }catch(e){ if(e && e.name === 'AbortError'){ toast('No se ha guardado: el escrito sigue aquí'); return; } }
    descargar(blob, archivo); this.quitarGuardado(d, archivo);
  },
  // Ya está guardado fuera: se quita de la app para que no ocupe espacio (con «Deshacer» unos segundos)
  quitarGuardado(d, archivo){
    const copia = JSON.parse(JSON.stringify(d));
    this.ponerLista(this.lista().filter(x => x.id !== d.id));
    this.id = null;
    const l = this.lista();
    if(l.length){ l.sort((a, b) => b.cambiado - a.cambiado); this.id = l[0].id; } else this.nuevo(true);
    this.cargar();
    toast('📄 «' + archivo + '» guardado y quitado de la app', 'Deshacer', () => {
      const l2 = this.lista(); l2.push(copia); this.ponerLista(l2); this.id = copia.id; this.cargar(); toast('↩️ El escrito vuelve a estar aquí'); }, 8000);
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
    $('#esTitulo').addEventListener('input', () => this.cambio());
    $('#esBarra').addEventListener('mousedown', ev => { if(ev.target.closest('button')) ev.preventDefault(); });   // que no se pierda lo seleccionado
    $('#esBarra').addEventListener('click', ev => { const b = ev.target.closest('button'); if(!b) return;
      if(b.id === 'esFoto'){ this.guardarCursor(); this.fotoBoton(); } else if(b.id === 'esForma') this.figura(null); else if(b.dataset.c) this.cmd(b.dataset.c, b.dataset.v); });
    $('#esTam').onchange = ev => { if(ev.target.value) this.cmd('tam', ev.target.value); ev.target.value = ''; };
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
    const nuevo = (extra) => { cur = { runs:[], jc:extra.jc || null, pre:extra.pre || '' }; P.push(cur); };
    const andar = (n, f, extra) => {
      if(n.nodeType === 3){
        const partes = n.nodeValue.replace(/\u200b/g, '').split('\n');
        if(partes.length === 1 && !partes[0]) return;
        partes.forEach((t, i) => { if(i > 0) nuevo(extra); if(!cur) nuevo(extra); if(t) cur.runs.push({ t, ...f }); });
        return;
      }
      if(n.nodeType !== 1) return;
      const tag = n.tagName, st = n.style || {}, g = { ...f };
      if(tag === 'B' || tag === 'STRONG' || /bold|[6-9]00/.test(st.fontWeight || '')) g.b = true;
      if(tag === 'I' || tag === 'EM' || st.fontStyle === 'italic') g.i = true;
      if(tag === 'U' || /underline/.test(st.textDecoration || st.textDecorationLine || '')) g.u = true;
      if(st.fontSize){ const px = parseFloat(st.fontSize); if(px) g.sz = Math.round(px * 0.75 * 2); }
      const bg = st.backgroundColor; if(bg && !/transparent|rgba\(0, 0, 0, 0\)/.test(bg)) g.hl = true;
      if(tag === 'BR'){ nuevo(extra); return; }
      if(tag === 'IMG'){ const m = /^data:image\/(jpeg|jpg|png);base64,(.+)$/.exec(n.getAttribute('src') || ''); if(m){ nuevo({ ...extra, jc:'center', pre:'' });   // cada foto en su propio párrafo, centrada
        cur.runs.push({ img:{ b64:m[2], ext:m[1] === 'png' ? 'png' : 'jpeg', w:n.naturalWidth || 800, h:n.naturalHeight || 600, pc:+(n.dataset.w || 100) } }); cur = null; } return; }
      const bloque = /^(DIV|P|LI|H1|H2|H3|BLOCKQUOTE)$/.test(tag);
      let ex = extra;
      if(bloque){
        ex = { ...extra, jc:(st.textAlign === 'center' ? 'center' : st.textAlign === 'right' ? 'right' : extra.jc) };
        if(tag === 'LI'){ const ol = n.parentElement && n.parentElement.tagName === 'OL'; ex.pre = ol ? ([...n.parentElement.children].indexOf(n) + 1) + '. ' : '•  '; }
        if(/^H/.test(tag)){ g.b = true; g.sz = tag === 'H1' ? 48 : 36; }
        const pri = n.firstElementChild; if(!(pri && pri === n.firstChild && /^(UL|OL|DIV|P)$/.test(pri.tagName))) nuevo(ex);   // un bloque que solo envuelve otro no hace párrafo vacío
      }
      [...n.childNodes].forEach(c => andar(c, g, ex));
      if(bloque) cur = null;
    };
    [...raiz.childNodes].forEach(c => andar(c, {}, {}));
    return P.filter((p, i) => p.runs.length || p.pre || i < P.length - 1);
  },
  dibujo(im){
    this.fotos = this.fotos || []; this.fotos.push(im); const n = this.fotos.length, id = 'rIdImg' + n;
    const ancho = Math.round(5760000 * im.pc / 100), alto = Math.round(ancho * im.h / im.w);   // 16 cm de ancho = 100 %
    return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${ancho}" cy="${alto}"/><wp:docPr id="${n}" name="Foto ${n}"/>`
      + `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">`
      + `<pic:nvPicPr><pic:cNvPr id="${n}" name="foto${n}.${im.ext}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`
      + `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${ancho}" cy="${alto}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  },
  documento(tit, raiz){
    const run = r => r.img ? this.dibujo(r.img) : `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>${r.b ? '<w:b/>' : ''}${r.i ? '<w:i/>' : ''}${r.u ? '<w:u w:val="single"/>' : ''}${r.hl ? '<w:highlight w:val="yellow"/>' : ''}<w:sz w:val="${r.sz || 24}"/></w:rPr><w:t xml:space="preserve">${this.x(r.t)}</w:t></w:r>`;
    const par = p => `<w:p><w:pPr><w:spacing w:after="120"/>${p.pre ? '<w:ind w:left="360" w:hanging="360"/>' : ''}${p.jc ? `<w:jc w:val="${p.jc}"/>` : ''}</w:pPr>${p.pre ? run({ t:p.pre, sz:p.runs[0] && p.runs[0].sz }) : ''}${p.runs.map(run).join('')}</w:p>`;
    const ps = this.parrafos(raiz);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>${(ps.length ? ps : [{ runs:[] }]).map(par).join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1418" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  },
  crear(tit, raiz){
    const ahora = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    this.fotos = [];
    const doc = this.documento(tit, raiz), fotos = this.fotos;
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
  async docx(f){
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
            const st = []; if(sz && Math.abs(sz / 2 - 12) > 1.5) st.push('font-size:' + Math.round(sz / 2 / .75) + 'px'); if(hl) st.push('background-color:#fff3a3');
            if(st.length) t = `<span style="${st.join(';')}">${t}</span>`; if(u) t = `<u>${t}</u>`; if(i) t = `<i>${t}</i>`; if(b) t = `<b>${t}</b>`; ph += t; }
          else if(c.localName === 'tab') ph += '&emsp;';
          else if(c.localName === 'br') ph += '<br>';
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
      html += `<div${jc === 'center' ? ' style="text-align:center"' : jc === 'right' || jc === 'end' ? ' style="text-align:right"' : ''}>${ph || '<br>'}</div>`;
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
        act += it.str.replace(/[\uE000-\uF8FF\u25AA\u25CF\u2022\u00B7]/g, '•');   // las viñetas de los PDF salen como cuadraditos tamMax = Math.max(tamMax, h); y = yy;
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
