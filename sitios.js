/* PorHacer3 · Sitios (igual que en HOME)
   Casas → sitios dentro de sitios (cocina › armario › cajón…) → cosas, con fotos.
   Buscador «¿Dónde está…?» que te dice el camino. Mover cosas y sitios. PDF de un sitio.
   Se guarda en «lo mío» (Mio, colección sitios): cada casa y cada sitio es un documento. */

const Sitios = {
  casa: null, camino: [], q: '', ED: null, pestIco: null,

  /* ---------- Datos ---------- */
  todos(){ return Mio.todos('sitios'); },
  casas(){ return this.todos().filter(x => x.tipo === 'casa').sort((a, b) => (a.orden || 0) - (b.orden || 0)); },
  s(id){ return Mio.uno('sitios', id); },
  hijos(casa, padre){ return this.todos().filter(x => x.tipo === 'sitio' && x.casa === casa && (x.padre || null) === (padre || null)).sort((a, b) => (a.orden || 0) - (b.orden || 0)); },
  ruta(id){ const out = []; let x = this.s(id); while(x && x.tipo === 'sitio'){ out.unshift(x.id); x = x.padre ? this.s(x.padre) : null; } return out; },
  cosas(x){ return Object.entries((x && x.cosas) || {}).sort((a, b) => (a[1].orden || 0) - (b[1].orden || 0)); },
  pal(c){ return PALETTES[c] || PALETTES.verde; },
  icoHtml(x, def){ return x && x.img ? `<img src="${x.img}" alt="">` : esc((x && x.emoji) || def || '📦'); },
  cuenta(casa){ const ss = this.todos().filter(x => x.tipo === 'sitio' && x.casa === casa); return { sitios:ss.length, cosas:ss.reduce((n, x) => n + Object.keys(x.cosas || {}).length, 0) }; },
  meta(id){ const x = this.s(id), h = this.hijos(x.casa, id).length, c = Object.keys(x.cosas || {}).length, p = [];
    if(h) p.push(h + (h === 1 ? ' sitio' : ' sitios')); if(c) p.push(c + (c === 1 ? ' cosa' : ' cosas')); return p.join(' · ') || 'Vacío'; },
  async guardar(x){ await Mio.poner('sitios', x.id, x); },
  pl(n, a, b){ return n + ' ' + (n === 1 ? a : b); },

  /* ---------- Pantalla ---------- */
  abrir(){ soloVista('vSitios'); if(this.casa && !this.s(this.casa)) this.casa = null; this.pintar(); },
  activa(){ return $('#vSitios').classList.contains('activa'); },
  pintar(){
    if(!this.activa()) return;
    if(this.casa && !this.s(this.casa)){ this.casa = null; this.camino = []; }
    const ult = this.camino[this.camino.length - 1];
    if(ult && !this.s(ult)) this.camino = ult ? this.ruta(this.camino.filter(i => this.s(i)).pop() || '') : [];
    this.casa ? this.pintarCasa() : this.pintarCasas();
  },
  pintarCasas(){
    const v = $('#vSitios'); v.style.removeProperty('--st-bg'); v.classList.remove('en-casa');
    $('#stTit').textContent = 'Mis sitios'; $('#stSub').textContent = '¿Dónde guardé…? Aquí lo sabrás';
    $('#stAtras').hidden = true;
    const cs = this.casas();
    $('#stCuerpo').innerHTML = `
      ${cs.length ? this.htmlBuscar('Buscar en todas tus casas… Ej.: llaves bici') : ''}
      <div class="st-res" id="stRes"></div>
      <div id="stContenido">${cs.map(h => { const p = this.pal(h.color), n = this.cuenta(h.id), f = h.fotoCasa && Mio.foto(h.fotoCasa);
        return `<div class="st-casa" data-casa="${h.id}" style="--hc:${p.shades[1]};--hs:${p.shades[0]};--hi:${p.text}">
          <div class="st-casa-pic">${f ? `<img src="${f}" alt="">` : this.icoHtml(h, '🏠')}</div>
          <div class="st-casa-tx"><b>${esc(h.nombre)}</b><small>${this.pl(n.sitios, 'sitio', 'sitios')} · ${this.pl(n.cosas, 'cosa', 'cosas')}</small></div>
          <button class="st-mas" data-menucasa="${h.id}" aria-label="Opciones de ${esc(h.nombre)}">⋯</button></div>`; }).join('')}
        <button class="st-casa-nueva" data-nuevacasa>＋ Nueva casa</button>
        ${cs.length ? '' : '<p class="st-ayuda">Empieza creando tu casa (o la del pueblo, el trastero, la oficina…). Dentro pondrás sus sitios: cocina, habitación… y dentro, las cosas que guardas.</p>'}
      </div>`;
    $('#stBarra').innerHTML = '';
    this.enlazarBuscar();
  },
  htmlBuscar(ph){ return `<div class="st-buscar"><span class="st-lupa">${icono('buscar')}</span><input id="stQ" type="search" autocomplete="off" enterkeyhint="search" placeholder="${ph}" value="${esc(this.q)}"><button id="stQx" aria-label="Borrar búsqueda" ${this.q ? '' : 'hidden'}>✕</button></div>`; },
  enlazarBuscar(){
    const i = $('#stQ'); if(!i) return;
    i.oninput = () => this.buscar(i.value);
    i.onkeydown = e => { if(e.key === 'Escape'){ i.value = ''; this.buscar(''); } if(e.key === 'Enter') i.blur(); };
    $('#stQx').onclick = () => { i.value = ''; this.buscar(''); i.focus(); };
    if(this.q) this.buscar(this.q);
  },
  pintarCasa(){
    const h = this.s(this.casa), p = this.pal(h.color), v = $('#vSitios');
    v.classList.add('en-casa');
    v.style.setProperty('--st-bg', p.bg); v.style.setProperty('--st-ac', p.ac); v.style.setProperty('--st-tx', p.text);
    v.style.setProperty('--st-s0', p.shades[0]); v.style.setProperty('--st-s1', p.shades[1]); v.style.setProperty('--st-s2', p.shades[2]);
    v.style.setProperty('--st-bsitio', h.bSitio || p.shades[2]); v.style.setProperty('--st-bcosa', h.bCosa || p.shades[3]);
    const cur = this.camino.length ? this.s(this.camino[this.camino.length - 1]) : null;
    $('#stTit').innerHTML = cur ? `${this.icoHtml(cur)} <span>${esc(cur.nombre)}</span>` : `${this.icoHtml(h, '🏠')} <span>${esc(h.nombre)}</span>`;
    $('#stSub').textContent = cur ? this.meta(cur.id) : this.pl(this.cuenta(h.id).sitios, 'sitio', 'sitios') + ' · ' + this.pl(this.cuenta(h.id).cosas, 'cosa', 'cosas');
    $('#stAtras').hidden = false;
    const hijos = this.hijos(h.id, cur ? cur.id : null), cosas = cur ? this.cosas(cur) : [];
    let html = this.htmlBuscar('¿Dónde está…? Ej.: llaves bici') + '<div class="st-res" id="stRes"></div><div id="stContenido">';
    html += `<div class="st-camino">${this.chipsCamino()}</div>`;
    if(cur){ const fs = (cur.fotos || []).map(f => ({ f, s:Mio.foto(f) })).filter(x => x.s);
      if(fs.length) html += `<div class="st-adj">${fs.map(x => `<div class="st-ph"><img src="${x.s}" alt="" data-grande><button data-quitaradj="${x.f}" aria-label="Quitar foto">✕</button></div>`).join('')}</div>`; }
    if(!hijos.length && !cosas.length) html += `<div class="st-vacio">${cur ? 'Aquí no hay nada todavía.<br>Añade una <b>cosa</b> que guardes aquí, o un <b>sitio</b> de dentro (un cajón, una caja…).' : 'Empieza creando los sitios de tu casa:<br>cocina, habitación, trastero…'}</div>`;
    if(hijos.length){ if(cosas.length) html += '<div class="st-sec">Sitios</div>';
      html += hijos.map(x => `<div class="st-fila sitio" data-abrir="${x.id}"><div class="st-ico">${this.icoHtml(x)}</div><div class="st-tx"><b>${esc(x.nombre)}</b><small>${this.meta(x.id)}</small></div><button class="st-mas" data-menusitio="${x.id}" aria-label="Opciones">⋯</button><span class="st-chev">›</span></div>`).join(''); }
    if(cosas.length){ html += '<div class="st-sec">Cosas</div>';
      html += cosas.map(([cid, c]) => { const f = (c.fotos || []).map(x => Mio.foto(x)).filter(Boolean);
        return `<div class="st-fila cosa" id="cosa-${cid}" data-cosa="${cid}"><div class="st-thumb">${f.length ? `<img src="${f[0]}" alt="" data-grande>` : '<span class="st-pto"></span>'}</div><div class="st-tx"><b>${c.texto ? esc(c.texto) : 'Foto'}</b>${f.length > 1 ? `<small>${f.length} fotos</small>` : ''}</div><button class="st-mas" data-cosa="${cid}" aria-label="Opciones">⋯</button></div>`; }).join(''); }
    html += '</div>';
    $('#stCuerpo').innerHTML = html;
    $('#stBarra').innerHTML = `<button class="st-add sitio" data-nuevositio>＋ Sitio</button>${cur ? '<button class="st-add cosa" data-nuevacosa>＋ Cosa</button>' : ''}`;
    this.enlazarBuscar();
  },
  chipsCamino(){
    const h = this.s(this.casa);
    return [`<button class="st-chip ${this.camino.length ? '' : 'cur'}" data-nivel="0">${this.icoHtml(h, '🏠')} ${esc(h.nombre)}</button>`,
      ...this.camino.map((id, i) => `<button class="st-chip ${i === this.camino.length - 1 ? 'cur' : ''}" data-nivel="${i + 1}">${this.icoHtml(this.s(id))} ${esc(this.s(id).nombre)}</button>`)].join('<span class="st-sep">›</span>');
  },
  chipsRuta(rid){ return this.ruta(rid).map((id, i, a) => `<span class="st-chip ${i === a.length - 1 ? 'cur' : ''}">${this.icoHtml(this.s(id))} ${esc(this.s(id).nombre)}</span>`).join('<span class="st-sep">›</span>'); },
  abrirCasa(id){ this.casa = id; this.camino = []; this.q = ''; this.pintar(); $('#stCuerpo').scrollTop = 0; },
  abrirSitio(id){ const x = this.s(id); if(!x) return; this.casa = x.casa; this.camino = this.ruta(id); this.pintar(); $('#stCuerpo').scrollTop = 0; },
  atras(){ if(this.camino.length){ this.camino.pop(); this.pintar(); } else { this.casa = null; this.pintar(); } },

  /* ---------- «¿Dónde está?» ---------- */
  buscar(q){
    this.q = q || '';
    const res = $('#stRes'), cont = $('#stContenido'); if(!res || !cont) return;
    const x = $('#stQx'); if(x) x.hidden = !this.q;
    const palabras = searchWordsH(this.q);
    if(!palabras.length){ res.innerHTML = ''; cont.style.display = ''; return; }
    cont.style.display = 'none';
    const out = [];
    this.todos().forEach(r => {
      if(r.tipo !== 'sitio' || (this.casa && r.casa !== this.casa)) return;
      const rt = norm(this.ruta(r.id).map(i => this.s(i).nombre).join(' ') + ' ' + ((this.s(r.casa) || {}).nombre || ''));
      if(palabras.every(w => norm(r.nombre).includes(w))) out.push({ tipo:'sitio', r, p:2 });
      Object.entries(r.cosas || {}).forEach(([cid, c]) => {
        const propio = norm(c.texto);
        if(!palabras.every(w => (propio + ' ' + rt).includes(w))) return;
        const en = palabras.filter(w => propio.includes(w)).length; if(!en) return;
        out.push({ tipo:'cosa', r, cid, c, p:en === palabras.length ? 0 : 1 });
      });
    });
    out.sort((a, b) => a.p - b.p);
    if(!out.length){ res.innerHTML = `<div class="st-vacio">No encuentro «${esc(this.q)}»${this.casa ? ' en esta casa' : ''}.<br>Prueba con una sola palabra, por ejemplo «${esc(palabras[0])}».</div>`; return; }
    const casaTx = r => this.casa ? '' : `<span class="st-chip">${this.icoHtml(this.s(r.casa), '🏠')} ${esc((this.s(r.casa) || {}).nombre || '')}</span><span class="st-sep">›</span>`;
    res.innerHTML = `<div class="st-sec">${this.pl(out.length, 'resultado', 'resultados')}</div>` + out.slice(0, 80).map(o => {
      if(o.tipo === 'sitio') return `<button class="st-hallado" data-ir="${o.r.id}"><div class="st-hn">${this.icoHtml(o.r)} ${esc(o.r.nombre)} <small>(sitio)</small></div><div class="st-camino">${casaTx(o.r)}${this.chipsRuta(o.r.id)}</div></button>`;
      const f = (o.c.fotos || []).map(x => Mio.foto(x)).filter(Boolean);
      return `<button class="st-hallado" data-ir="${o.r.id}" data-ircosa="${o.cid}"><div class="st-hn">${f.length ? `<img src="${f[0]}" alt="">` : ''}${o.c.texto ? esc(o.c.texto) : 'Foto'}</div><div class="st-donde">Está en:</div><div class="st-camino">${casaTx(o.r)}${this.chipsRuta(o.r.id)}</div></button>`;
    }).join('');
  },
  irHallado(rid, cid){
    this.q = ''; this.abrirSitio(rid);
    if(cid) setTimeout(() => { const el = $('#cosa-' + cid); if(el){ el.scrollIntoView({ block:'center', behavior:'smooth' }); el.classList.add('hallada'); } }, 80);
  },

  /* ---------- Menús ---------- */
  menuCasa(id){
    const h = this.s(id), cs = this.casas(), i = cs.findIndex(x => x.id === id);
    const hj = hojaMio(`${this.icoHtml(h, '🏠')} ${esc(h.nombre)}`, `
      <button class="sh-op" data-a="editar">${icIn('lapiz')}Nombre, color e icono</button>
      <button class="sh-op" data-a="foto">${icIn('camara')}${h.fotoCasa ? 'Cambiar' : 'Poner'} foto de la casa</button>
      ${h.fotoCasa ? '<button class="sh-op" data-a="quitarfoto">🖼️ Quitar la foto (volver al icono)</button>' : ''}
      ${i > 0 ? '<button class="sh-op" data-a="subir">⬆️ Subir</button>' : ''}${i < cs.length - 1 ? '<button class="sh-op" data-a="bajar">⬇️ Bajar</button>' : ''}
      <button class="sh-op" data-a="pdf">📄 Guardar la lista en PDF</button>
      <button class="sh-op peligro" data-a="borrar">🗑️ Borrar casa</button>
      <button class="sh-btn" data-a="x">Cancelar</button>`);
    hj.onclick = async e => { const b = e.target.closest('[data-a]'); if(!b) return; const a = b.dataset.a; cerrarHojaMio();
      if(a === 'editar') this.editor('casa', id);
      else if(a === 'foto'){ const [f] = await elegirFotos(false, false); if(!f) return; const fid = await Mio.ponerFoto(await aligerarImg(f, 900, .78), null, 'sitios'); if(h.fotoCasa) await Mio.quitarFotos([h.fotoCasa]); await this.guardar({ ...h, fotoCasa:fid }); toast('📷 Foto puesta'); }
      else if(a === 'quitarfoto'){ await Mio.quitarFotos([h.fotoCasa]); const n = { ...h }; delete n.fotoCasa; await this.guardar(n); }
      else if(a === 'subir' || a === 'bajar'){ const j = a === 'subir' ? i - 1 : i + 1; const o = cs[j]; const oi = o.orden || j, hi = h.orden || i;
        await this.guardar({ ...h, orden:oi === hi ? (a === 'subir' ? oi - 1 : oi + 1) : oi }); await this.guardar({ ...o, orden:hi }); }
      else if(a === 'pdf') this.pdf(null, id);
      else if(a === 'borrar') this.borrarCasa(id); };
  },
  menuSitio(id){
    const x = this.s(id);
    const hj = hojaMio(`${this.icoHtml(x)} ${esc(x.nombre)}`, `
      <button class="sh-op" data-a="editar">${icIn('lapiz')}Cambiar nombre o icono</button>
      <button class="sh-op" data-a="mover">↔️ Mover a otro sitio</button>
      <button class="sh-op" data-a="foto">${icIn('camara')}Añadir foto del sitio</button>
      <button class="sh-op" data-a="pdf">📄 Guardar lista en PDF</button>
      <button class="sh-op peligro" data-a="borrar">🗑️ Borrar sitio</button>
      <button class="sh-btn" data-a="x">Cancelar</button>`);
    hj.onclick = async e => { const b = e.target.closest('[data-a]'); if(!b) return; const a = b.dataset.a;
      if(a === 'mover') return this.moverSheet('sitio', id);
      cerrarHojaMio();
      if(a === 'editar') this.editor('sitio', id);
      else if(a === 'foto') this.fotoSitio(id);
      else if(a === 'pdf') this.pdf(id, x.casa);
      else if(a === 'borrar') this.borrarSitio(id); };
  },
  menuCosa(cid){
    const rid = this.camino[this.camino.length - 1], r = this.s(rid), c = r && r.cosas && r.cosas[cid]; if(!c) return;
    const fs = (c.fotos || []).map(f => ({ f, s:Mio.foto(f) })).filter(x => x.s);
    const hj = hojaMio(esc(c.texto || 'Foto'), `
      <div class="st-donde">Está en:</div><div class="st-camino">${this.chipsRuta(rid)}</div>
      ${fs.length ? `<div class="st-adj">${fs.map(x => `<div class="st-ph"><img src="${x.s}" alt="" data-grande><button data-quitarfoto="${x.f}" aria-label="Quitar foto">✕</button></div>`).join('')}</div>` : ''}
      <button class="sh-op" data-a="nombre">${icIn('lapiz')}Cambiar nombre</button>
      <button class="sh-op" data-a="foto">${icIn('camara')}Añadir foto</button>
      <button class="sh-op" data-a="mover">↔️ Mover a otro sitio</button>
      <button class="sh-op peligro" data-a="borrar">🗑️ Borrar</button>
      <button class="sh-btn" data-a="x">Cancelar</button>`);
    hj.onclick = async e => {
      const img = e.target.closest('img[data-grande]'); if(img){ verFotoGrande(img.src); return; }
      const q = e.target.closest('[data-quitarfoto]');
      if(q){ const n = this.copia(rid); n.cosas[cid].fotos = (n.cosas[cid].fotos || []).filter(f => f !== q.dataset.quitarfoto); await this.guardar(n); await Mio.quitarFotos([q.dataset.quitarfoto]); this.menuCosa(cid); return; }
      const b = e.target.closest('[data-a]'); if(!b) return; const a = b.dataset.a;
      if(a === 'mover') return this.moverSheet('cosa', rid, cid);
      if(a === 'nombre') return this.renombrarCosa(rid, cid);
      cerrarHojaMio();
      if(a === 'foto') this.fotoCosa(rid, cid);
      else if(a === 'borrar'){ if(await confirmarMio('Borrar', `¿Borrar «${esc(c.texto || 'esta foto')}»?`)){ const n = this.copia(rid); delete n.cosas[cid]; await this.guardar(n);
        toast('🗑 Borrado', 'Deshacer', async () => { const m = this.copia(rid); m.cosas[cid] = c; await this.guardar(m); });
        setTimeout(() => { const m = this.s(rid); if(!m || !m.cosas || !m.cosas[cid]) Mio.quitarFotos(c.fotos || []); }, 9000); } }
    };
  },
  copia(id){ const x = JSON.parse(JSON.stringify(this.s(id))); x.cosas = x.cosas || {}; return x; },

  /* ---------- Añadir cosas ---------- */
  nuevaCosa(){
    const rid = this.camino[this.camino.length - 1]; if(!rid) return;
    const hj = hojaMio(`Añadir a ${esc(this.s(rid).nombre)}`, `
      <input class="mp-input" id="stCosaIn" placeholder="Ej.: Llaves de la bici" enterkeyhint="done" autocomplete="off">
      <div class="st-hint">Escribe y pulsa «Añadir». Puedes añadir varias seguidas.</div>
      <div class="mp-fila"><button class="mp-b" data-a="foto">📷 Con foto</button><button class="mp-b mp-pri" data-a="add">Añadir</button></div>
      <button class="sh-btn" data-a="x">Listo</button>`);
    const i = $('#stCosaIn');
    const add = async (fotos) => { const t = i.value.trim(); if(!t && !(fotos || []).length) return; const n = this.copia(rid), cid = nuevoId('c');
      const ord = Object.values(n.cosas).map(c => c.orden || 0); n.cosas[cid] = { texto:t, fotos:fotos || [], orden:ord.length ? Math.min(...ord) - 1 : 0, creada:Date.now() };
      await this.guardar(n); i.value = ''; i.focus(); toast('✅ Guardado: ' + (t || 'foto')); };
    i.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); add(); } };
    hj.onclick = async e => { const b = e.target.closest('[data-a]'); if(!b) return;
      if(b.dataset.a === 'add') add();
      else if(b.dataset.a === 'foto'){ const fs = await elegirFotos(false, true); if(!fs.length) return; toast('📷 Guardando…'); const ids = []; for(const f of fs) ids.push(await Mio.ponerFoto(await aligerarImg(f, 1280, .72), null, 'sitios')); await add(ids); }
      else cerrarHojaMio(); };
    setTimeout(() => i.focus(), 120);
  },
  async fotoCosa(rid, cid){ const fs = await elegirFotos(false, true); if(!fs.length) return; toast('📷 Guardando…'); const ids = []; for(const f of fs) ids.push(await Mio.ponerFoto(await aligerarImg(f, 1280, .72), null, 'sitios'));
    const n = this.copia(rid); if(!n.cosas[cid]) return; n.cosas[cid].fotos = [...(n.cosas[cid].fotos || []), ...ids]; await this.guardar(n); toast('📷 Foto añadida'); },
  async fotoSitio(id){ const fs = await elegirFotos(false, true); if(!fs.length) return; toast('📷 Guardando…'); const ids = []; for(const f of fs) ids.push(await Mio.ponerFoto(await aligerarImg(f, 1280, .72), null, 'sitios'));
    const n = this.copia(id); n.fotos = [...(n.fotos || []), ...ids]; await this.guardar(n); this.abrirSitio(id); toast('📷 Foto del sitio añadida'); },
  renombrarCosa(rid, cid){
    const c = this.s(rid).cosas[cid];
    const hj = hojaMio('Cambiar nombre', `<input class="mp-input" id="stRen" value="${esc(c.texto)}" enterkeyhint="done"><div class="mp-fila"><button class="mp-b" data-a="x">Cancelar</button><button class="mp-b mp-pri" data-a="ok">Guardar</button></div>`);
    const i = $('#stRen'), ok = async () => { const v = i.value.trim(); if(!v) return; const n = this.copia(rid); n.cosas[cid].texto = v; await this.guardar(n); cerrarHojaMio(); };
    i.onkeydown = e => { if(e.key === 'Enter') ok(); };
    hj.onclick = e => { const b = e.target.closest('[data-a]'); if(!b) return; if(b.dataset.a === 'ok') ok(); else cerrarHojaMio(); };
    setTimeout(() => { i.focus(); i.select(); }, 100);
  },

  /* ---------- Mover ---------- */
  destinos(casa, sinRama){
    const fuera = new Set(); if(sinRama){ const walk = id => { fuera.add(id); this.todos().forEach(x => { if(x.padre === id) walk(x.id); }); }; walk(sinRama); }
    return this.todos().filter(x => x.tipo === 'sitio' && x.casa === casa && !fuera.has(x.id))
      .map(x => ({ id:x.id, n:x.nombre, x, ruta:this.ruta(x.id).slice(0, -1).map(i => this.s(i).nombre).join(' › ') }))
      .sort((a, b) => (a.ruta + ' ' + a.n).localeCompare(b.ruta + ' ' + b.n, 'es'));
  },
  moverSheet(tipo, a, b){
    const esSitio = tipo === 'sitio', x = this.s(a), tit = esSitio ? x.nombre : (x.cosas[b].texto || 'Foto');
    const padre = esSitio ? (x.padre || null) : a, h = this.s(x.casa);
    const ls = this.destinos(x.casa, esSitio ? a : null).filter(d => d.id !== padre);
    let ops = esSitio && padre ? `<button class="st-dest" data-to=""><b>${this.icoHtml(h, '🏠')} ${esc(h.nombre)}</b><span>Directamente en la casa</span></button>` : '';
    ops += ls.map(d => `<button class="st-dest" data-to="${d.id}"><b>${this.icoHtml(d.x)} ${esc(d.n)}</b>${d.ruta ? `<span>${esc(d.ruta)}</span>` : ''}</button>`).join('');
    const hj = hojaMio(`Mover «${esc(tit)}» a…`, `<div class="st-dests">${ops || '<div class="st-hint">No hay otros sitios todavía.</div>'}</div><button class="sh-btn" data-x>Cancelar</button>`);
    hj.onclick = async e => { const t = e.target.closest('[data-to]'); if(!t){ if(e.target.closest('[data-x]')) cerrarHojaMio(); return; }
      const to = t.dataset.to || null; cerrarHojaMio();
      if(esSitio){ await this.guardar({ ...this.s(a), padre:to, orden:this.hijos(x.casa, to).length }); toast('↔️ Movido a ' + (to ? this.s(to).nombre : 'la casa')); }
      else { const de = this.copia(a), aa = this.copia(to), c = de.cosas[b]; delete de.cosas[b];
        const ord = Object.values(aa.cosas).map(z => z.orden || 0); c.orden = ord.length ? Math.min(...ord) - 1 : 0; aa.cosas[b] = c;
        await this.guardar(de); await this.guardar(aa); toast('↔️ Movido a ' + aa.nombre); } };
  },

  /* ---------- Borrar ---------- */
  rama(id){ const out = [id]; this.todos().forEach(x => { if(x.padre === id) out.push(...this.rama(x.id)); }); return out; },
  fotosDe(ids){ const f = []; ids.forEach(i => { const x = this.s(i); if(!x) return; f.push(...(x.fotos || [])); if(x.fotoCasa) f.push(x.fotoCasa); Object.values(x.cosas || {}).forEach(c => f.push(...(c.fotos || []))); }); return f; },
  async borrarSitio(id){
    const ids = this.rama(id), n = ids.reduce((s, i) => s + Object.keys(this.s(i).cosas || {}).length, 0);
    if(!await confirmarMio('Borrar sitio', `¿Borrar «${esc(this.s(id).nombre)}»${ids.length > 1 ? ` y los ${ids.length - 1} sitios de dentro` : ''}${n ? ` con ${this.pl(n, 'cosa', 'cosas')}` : ''}?`)) return;
    const fotos = this.fotosDe(ids);
    for(const i of ids) await Mio.quitar('sitios', i);
    await Mio.quitarFotos(fotos);
    if(this.camino.includes(id)) this.camino = this.camino.slice(0, this.camino.indexOf(id));
    this.pintar(); toast('🗑 Sitio borrado');
  },
  async borrarCasa(id){
    const h = this.s(id), ids = this.todos().filter(x => x.casa === id).map(x => x.id), n = this.cuenta(id);
    if(!await confirmarMio('Borrar casa', `¿Borrar «${esc(h.nombre)}» con ${this.pl(n.sitios, 'sitio', 'sitios')} y ${this.pl(n.cosas, 'cosa', 'cosas')}? No se puede deshacer.`)) return;
    const fotos = this.fotosDe([id, ...ids]);
    for(const i of ids) await Mio.quitar('sitios', i);
    await Mio.quitar('sitios', id); await Mio.quitarFotos(fotos);
    if(this.casa === id){ this.casa = null; this.camino = []; }
    this.pintar(); toast('🗑 Casa borrada');
  },

  /* ---------- Editor de casa o sitio (nombre, icono, color) ---------- */
  editor(tipo, id){
    const x = id ? this.s(id) : null;
    this.ED = { tipo, id:id || null, nombre:x ? x.nombre : '', emoji:x ? x.emoji : (tipo === 'casa' ? '🏠' : '📦'), img:x ? x.img || null : (tipo === 'casa' ? HOUSE_SVG_ICONS[0].src : null),
      color:x ? x.color || 'grafito' : ['grafito','amapola','perla','cereza','noche','sandia'][this.casas().length % 6], manual:!!x };
    this.pintarEditor(true);
  },
  icoEd(){ const E = this.ED; return E.img ? `<img src="${E.img}" alt="">` : esc(E.emoji || '📦'); },
  pintarEditor(foco){
    const E = this.ED, esCasa = E.tipo === 'casa', p = esCasa ? this.pal(E.color) : null;
    const tit = E.id ? (esCasa ? 'Editar casa' : 'Editar sitio') : (esCasa ? 'Nueva casa' : 'Nuevo sitio');
    const ph = esCasa ? 'Ej.: Mi casa, Apartamento playa…' : (this.camino.length ? 'Ej.: Armario, Cajón de arriba, Caja azul…' : 'Ej.: Cocina, Habitación, Trastero…');
    const hj = hojaMio(tit, `
      <div class="ed-prev" style="${esCasa ? `background:${p.shades[1]}` : ''}"><div class="ed-tile" style="${esCasa ? `background:${p.shades[0]}` : ''}">${this.icoEd()}</div>
        <div class="ed-pn" id="edPn" style="${esCasa ? `color:${p.text}` : ''}">${E.nombre ? esc(E.nombre) : '<span>Sin nombre</span>'}</div></div>
      <input class="mp-input" id="edNom" value="${esc(E.nombre)}" placeholder="${ph}" enterkeyhint="done" autocomplete="off">
      <button class="st-linea" data-a="icono"><i class="st-chipi">${this.icoEd()}</i><span><b>Icono</b><small>${E.manual ? 'Elegido por ti · toca para cambiar' : 'Se pone solo según el nombre · toca para elegir'}</small></span><em>›</em></button>
      ${esCasa ? `<div class="st-et">Color de la casa</div><div class="st-pals">${PAL_KEYS.map(k => `<button data-pal="${k}" class="${k === E.color ? 'on' : ''}" title="${esc(PALETTES[k].name)}" style="background:${PALETTES[k].shades[1]};border-color:${PALETTES[k].ac}"></button>`).join('')}</div>` : ''}
      <div class="mp-fila"><button class="mp-b" data-a="x">Cancelar</button><button class="mp-b mp-pri" data-a="ok">${E.id ? 'Guardar' : 'Crear'}</button></div>`, 'st-ed');
    const n = $('#edNom');
    n.oninput = () => { E.nombre = n.value; $('#edPn').innerHTML = n.value ? esc(n.value) : '<span>Sin nombre</span>';
      if(!E.manual){ const a = this.autoIcono(n.value, E.tipo); if(a){ E.img = a.img || null; if(a.emoji) E.emoji = a.emoji; } $$('.ed-tile,.st-chipi').forEach(el => el.innerHTML = this.icoEd()); } };
    n.onkeydown = e => { if(e.key === 'Enter') this.guardarEditor(); };
    hj.onclick = e => { const b = e.target.closest('[data-a],[data-pal]'); if(!b) return;
      if(b.dataset.pal){ E.nombre = n.value; E.color = b.dataset.pal; this.pintarEditor(false); return; }
      const a = b.dataset.a; if(a === 'icono'){ E.nombre = n.value; this.elegirIcono(); } else if(a === 'ok') this.guardarEditor(); else { this.ED = null; cerrarHojaMio(); } };
    if(foco && !E.id) setTimeout(() => n.focus(), 150);
  },
  autoIcono(nombre, tipo){
    const q = norm(nombre).trim(); if(q.length < 2) return null;
    if(tipo === 'casa'){ let best = null, bl = 0; HOUSE_SVG_ICONS.forEach(f => f.k.forEach(k => { const nk = norm(k); if(q.includes(nk) && nk.length > bl){ best = f; bl = nk.length; } })); return best ? { img:best.src } : null; }
    let best = null, bl = 0; FURNITURE_ICONS.forEach(f => f.k.forEach(k => { const nk = norm(k); if(nk && q.includes(nk) && nk.length > bl){ best = f; bl = nk.length; } }));
    if(best) return { img:best.src };
    const low = nombre.toLowerCase().trim();
    for(const { k, e } of EMOJI_MAP) if(k.some(w => low.includes(w))) return { img:null, emoji:e };
    const f = ALL_EMOJIS.find(({ l }) => norm(l).includes(q)); return f ? { img:null, emoji:f.e } : null;
  },
  pestanas(){ return this.ED.tipo === 'casa' ? ['Casas', 'Casa', 'Objetos', 'Exterior', 'Mi imagen'] : ['Muebles', 'Casa', 'Objetos', 'Exterior', 'Comida', 'Mi imagen']; },
  iconosDe(t){
    if(t === 'Casas') return [...HOUSE_SVG_ICONS.map(f => ({ img:f.src, l:f.l, k:f.k })), ...HOUSE_EMOJI_ICONS.map(x => ({ emoji:x.e, l:x.l }))];
    if(t === 'Muebles') return FURNITURE_ICONS.map(f => ({ img:f.src, l:f.l, k:f.k }));
    return (EMOJI_TABS[t] || []).map(x => ({ emoji:x.e, l:x.l }));
  },
  elegirIcono(pest){
    const ps = this.pestanas(); this.pestIco = pest || (ps.includes(this.pestIco) ? this.pestIco : ps[0]);
    const cuerpo = this.pestIco === 'Mi imagen'
      ? `<button class="sh-op" data-a="img">${icIn('galeria')}Elegir una foto o imagen</button><div class="st-hint">O escribe o pega aquí un emoji:</div><input class="mp-input" id="icEmo" placeholder="Ej.: 🧸" autocomplete="off">`
      : `<div class="st-buscar"><span class="st-lupa">${icono('buscar')}</span><input id="icQ" type="search" placeholder="Buscar icono…" autocomplete="off"></div><div class="ic-rej" id="icRej"></div>`;
    const hj = hojaMio('Elige un icono', `<div class="st-pest">${ps.map(t => `<button data-p="${t}" class="${t === this.pestIco ? 'on' : ''}">${t}</button>`).join('')}</div>${cuerpo}<button class="sh-btn" data-a="volver">‹ Volver</button>`, 'st-ic');
    const rej = q => {
      const nq = norm(q || '');
      this._ics = (nq ? [...(this.ED.tipo === 'casa' ? this.iconosDe('Casas') : []), ...this.iconosDe('Muebles'), ...['Casa', 'Objetos', 'Exterior', 'Comida'].flatMap(t => this.iconosDe(t))]
        .filter(x => norm(x.l).includes(nq) || (x.k || []).some(k => norm(k).includes(nq))) : this.iconosDe(this.pestIco)).slice(0, 150);
      const E = this.ED;
      $('#icRej').innerHTML = this._ics.length ? this._ics.map((x, i) => `<button class="ic-op ${(x.img ? E.img === x.img : (!E.img && E.emoji === x.emoji)) ? 'on' : ''}" data-i="${i}"><span>${x.img ? `<img src="${x.img}" alt="">` : x.emoji}</span><small>${esc(x.l)}</small></button>`).join('') : '<div class="st-hint">No hay iconos con ese nombre. Prueba otra palabra.</div>';
    };
    if($('#icRej')){ rej(''); $('#icQ').oninput = e => rej(e.target.value); }
    const emo = $('#icEmo'); if(emo) emo.oninput = () => { const t = emo.value.trim(); if(!t) return; this.ED.manual = true; this.ED.img = null; this.ED.emoji = Array.from(t).slice(0, 2).join(''); this.pintarEditor(false); };
    hj.onclick = async e => {
      const b = e.target.closest('[data-p],[data-i],[data-a]'); if(!b) return;
      if(b.dataset.p) return this.elegirIcono(b.dataset.p);
      if(b.dataset.i != null){ const x = this._ics[+b.dataset.i]; this.ED.manual = true; if(x.img) this.ED.img = x.img; else { this.ED.img = null; this.ED.emoji = x.emoji; } this.pintarEditor(false); return; }
      if(b.dataset.a === 'img'){ const [f] = await elegirFotos(false, false); if(!f) return; this.ED.img = await aligerarImg(f, this.ED.tipo === 'casa' ? 160 : 120, .8); this.ED.manual = true; this.pintarEditor(false); return; }
      this.pintarEditor(false);
    };
  },
  async guardarEditor(){
    const E = this.ED; if(!E) return;
    const nombre = ($('#edNom') ? $('#edNom').value : E.nombre).trim();
    if(!nombre){ $('#edNom') && $('#edNom').focus(); toast('Escribe un nombre'); return; }
    this.ED = null; cerrarHojaMio();
    if(E.tipo === 'casa'){
      const viejo = E.id ? this.s(E.id) : null;
      const h = { ...(viejo || { id:nuevoId('casa'), tipo:'casa', orden:this.casas().length, creada:Date.now() }), nombre:nombre.toUpperCase(), emoji:E.emoji || '🏠', img:E.img || null, color:E.color };
      await this.guardar(h); toast(viejo ? '🏠 Casa guardada' : '🏠 Casa creada: ' + h.nombre);
      if(!viejo) this.abrirCasa(h.id);
    } else {
      const viejo = E.id ? this.s(E.id) : null, padre = this.camino[this.camino.length - 1] || null;
      const x = { ...(viejo || { id:nuevoId('s'), tipo:'sitio', casa:this.casa, padre, orden:this.hijos(this.casa, padre).length, cosas:{}, fotos:[], creado:Date.now() }), nombre, emoji:E.emoji || '📦', img:E.img || null };
      await this.guardar(x); toast(viejo ? '✅ Sitio guardado' : '✅ Sitio creado: ' + nombre);
    }
  },

  /* ---------- PDF de un sitio (o de toda la casa) ---------- */
  async pdf(rid, casa){
    const h = this.s(casa), p = this.pal(h.color);
    const bloque = (id, nivel) => { const x = this.s(id), cs = this.cosas(x), hs = this.hijos(casa, id);
      return `<div style="margin:${nivel ? 10 : 16}px 0 0 ${nivel * 18}px;padding:12px 14px;border-radius:14px;background:${nivel ? '#fff' : p.shades[0]};border:2px solid ${p.shades[1]}">
        <div style="font-size:${nivel ? 15 : 18}px;font-weight:900;color:${p.text}">${x.img ? `<img src="${x.img}" style="width:22px;height:22px;vertical-align:middle;margin-right:6px">` : esc(x.emoji || '📦') + ' '}${esc(x.nombre)}</div>
        ${cs.length ? `<ul style="margin:8px 0 0 18px;padding:0;font-size:14px;font-weight:700;line-height:1.7">${cs.map(([, c]) => `<li>${esc(c.texto || 'Foto')}${(c.fotos || []).length ? ' 📷' : ''}</li>`).join('')}</ul>` : ''}
        ${hs.map(y => bloque(y.id, nivel + 1)).join('')}</div>`; };
    const raices = rid ? [rid] : this.hijos(casa, null).map(x => x.id);
    const tit = rid ? this.s(rid).nombre : h.nombre;
    const html = `<div style="color:#2c2c2e"><div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:16px;border-bottom:4px solid ${p.ac}">
      <div><div style="font-size:28px;font-weight:900;color:${p.text}">${esc(tit)}</div><div style="font-size:14px;font-weight:700;opacity:.7;margin-top:4px">${rid ? esc([h.nombre, ...this.ruta(rid).slice(0, -1).map(i => this.s(i).nombre)].join(' › ')) : 'Todos los sitios y cosas'}</div></div>
      <img src="logo.png" style="width:54px;height:54px;border-radius:13px"></div>
      ${raices.map(id => bloque(id, 0)).join('') || '<p>Aún no hay sitios.</p>'}
      <div style="margin-top:24px;text-align:center;font-size:11px;font-weight:700;opacity:.5">PorHacer3 · ${new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</div></div>`;
    await pdfDeHtml(html, 'sitios-' + tit, '#ffffff');
  },

  /* ---------- Arranque ---------- */
  iniciar(){
    $('#stAtras').onclick = () => this.atras();
    $('#stCuerpo').addEventListener('click', e => {
      const img = e.target.closest('img[data-grande]'); if(img){ verFotoGrande(img.src); return; }
      const b = e.target.closest('[data-casa],[data-menucasa],[data-nuevacasa],[data-abrir],[data-menusitio],[data-cosa],[data-nivel],[data-ir],[data-quitaradj]'); if(!b) return;
      const d = b.dataset;
      if(d.menucasa) this.menuCasa(d.menucasa);
      else if('nuevacasa' in d) this.editor('casa', null);
      else if(d.casa) this.abrirCasa(d.casa);
      else if(d.menusitio) this.menuSitio(d.menusitio);
      else if(d.abrir) this.abrirSitio(d.abrir);
      else if(d.cosa) this.menuCosa(d.cosa);
      else if(d.nivel != null){ this.camino = this.camino.slice(0, +d.nivel); this.pintar(); }
      else if(d.ir) this.irHallado(d.ir, d.ircosa);
      else if(d.quitaradj){ (async () => { if(!await confirmarMio('Quitar foto', '¿Quitar esta foto del sitio?', 'Quitar')) return; const id = this.camino[this.camino.length - 1], n = this.copia(id); n.fotos = (n.fotos || []).filter(f => f !== d.quitaradj); await this.guardar(n); await Mio.quitarFotos([d.quitaradj]); })(); }
    });
    $('#stBarra').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; if('nuevositio' in b.dataset) this.editor('sitio', null); else if('nuevacosa' in b.dataset) this.nuevaCosa(); });
    Mio.al('sitios', () => { if(this.activa() && !(document.activeElement && document.activeElement.id === 'stQ')) this.pintar(); else if(this.activa() && this.q) this.buscar(this.q); });
  }
};
// palabras para buscar (como en HOME: sin «de, la, el…» y sin plurales)
function searchWordsH(q){
  const STOP = new Set(['de','del','la','las','el','los','en','mi','mis','y','a','al','un','una','unos','unas','les','els','i','d','l','per','para','con','amb']);
  return norm(q).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w)).map(w => w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w);
}
