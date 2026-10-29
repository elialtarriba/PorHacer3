/* PorHacer3 · Grabar notas de voz
   Un botón grande «Grabar»: pulsas, hablas, vuelves a pulsar y se para.
   Las notas se ponen una debajo de otra, con la fecha y la hora encima y un nombre que puedes poner.
   Deslizar a la izquierda (rojo) → Eliminar, con confirmación.
   Deslizar a la derecha (naranja) → Guardar la nota en el aparato (Archivos / Descargas).
   Se guardan solo en este aparato (IndexedDB «PorHacer3-grabaciones»), en .mp3 ligero. */

const Grabar = {
  lista: [], rec: null, stream: null, t0: 0, _reloj: null, sonando: null,

  /* ---------- Almacén ---------- */
  _db: null,
  idb(){
    if(this._db) return this._db;
    this._db = new Promise((ok, mal) => { const r = indexedDB.open('PorHacer3-grabaciones', 1); r.onupgradeneeded = () => r.result.createObjectStore('g', { keyPath:'id' }); r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error); });
    return this._db;
  },
  async tx(modo, fn){ const db = await this.idb(); return new Promise((ok, mal) => { const t = db.transaction('g', modo), st = t.objectStore('g'); let out; const r = fn(st); if(r) r.onsuccess = () => { out = r.result; }; t.oncomplete = () => ok(out); t.onerror = () => mal(t.error); }); },
  async cargar(){ try{ this.lista = ((await this.tx('readonly', st => st.getAll())) || []).sort((a, b) => a.fecha - b.fecha); }catch(e){ this.lista = []; } Mio.avisar('grabar'); },
  async poner(n){ await this.tx('readwrite', st => st.put(n)); const i = this.lista.findIndex(x => x.id === n.id); if(i >= 0) this.lista[i] = n; else this.lista.push(n); Mio.avisar('grabar'); },
  async quitar(id){ await this.tx('readwrite', st => st.delete(id)); this.lista = this.lista.filter(x => x.id !== id); Mio.avisar('grabar'); },

  /* ---------- Pantalla ---------- */
  abrir(){ soloVista('vGrabar'); this.pintar(); },
  activa(){ return $('#vGrabar').classList.contains('activa'); },
  cuando(f){ const d = new Date(f); return capital(d.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' })) + ' · ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); },
  pintar(){
    if(!this.activa()) return;
    const g = !!this.rec;
    $('#grbBoton').classList.toggle('grabando', g);
    $('#grbBoton').innerHTML = g ? `<span class="grb-cuadro"></span><b>Parar</b><em id="grbTiempo">${durTxt((Date.now() - this.t0) / 1000) || '0:00'}</em><span class="grb-ondas"><i></i><i></i><i></i><i></i><i></i></span>`
      : this._pasando ? '<b>Preparando la nota…</b>' : '<span class="grb-punto"></span><b>Grabar</b>';
    $('#grbSub').textContent = this.lista.length ? this.lista.length + (this.lista.length === 1 ? ' nota de voz' : ' notas de voz') : 'Pulsa «Grabar» para empezar';
    const c = $('#grbLista');
    if(!this.lista.length){ c.innerHTML = '<div class="grb-vacio">Aquí aparecerán tus notas de voz, una debajo de otra.<br><br>Desliza una nota a la <b>izquierda</b> para eliminarla, o a la <b>derecha</b> para guardarla en el aparato.</div>'; return; }
    c.innerHTML = this.lista.map(n => `
      <div class="grb-nota" data-id="${n.id}">
        <div class="grb-fondo grb-guardar"><span>⬇️ Guardar en el aparato</span></div>
        <div class="grb-fondo grb-borrar"><span>🗑 Eliminar</span></div>
        <div class="grb-cara">
          <div class="grb-fecha">📅 ${this.cuando(n.fecha)}</div>
          <input class="grb-nombre" data-nom="${n.id}" value="${esc(n.nombre || '')}" placeholder="Ponle un nombre…" maxlength="80" enterkeyhint="done">
          <div class="grb-repro">
            <button class="grb-play ${this.sonando && this.sonando.id === n.id && !this.sonando.a.paused ? 'on' : ''}" data-play="${n.id}" aria-label="Escuchar"></button>
            <div class="grb-barra" data-barra="${n.id}"><i style="width:${this.sonando && this.sonando.id === n.id ? (this.sonando.a.currentTime / (n.dur || 1) * 100).toFixed(1) : 0}%"></i></div>
            <span class="grb-dur">${durTxt(n.dur) || '0:01'}</span>
          </div>
        </div>
      </div>`).join('');
  },

  /* ---------- Grabar ---------- */
  async pulsar(){
    if(this._pasando) return;
    if(this.rec){ try{ this.rec.stop(); }catch(e){} return; }
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined'){
      popAviso('Grabar', 'Este navegador no permite grabar. En el iPhone, usa Safari actualizado.'); return; }
    try{ this.stream = await navigator.mediaDevices.getUserMedia({ audio:true }); }
    catch(e){ popAviso('Micrófono', 'Hay que dar permiso al micrófono para grabar notas de voz.'); return; }
    const tipos = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
    const mime = tipos.find(t => { try{ return MediaRecorder.isTypeSupported(t); }catch(e){ return false; } }) || '';
    const trozos = [];
    try{ this.rec = mime ? new MediaRecorder(this.stream, { mimeType:mime }) : new MediaRecorder(this.stream); }catch(e){ this.rec = new MediaRecorder(this.stream); }
    this.rec.ondataavailable = e => { if(e.data && e.data.size) trozos.push(e.data); };
    this.rec.onstop = async () => {
      clearInterval(this._reloj);
      const rec = this.rec, dur = (Date.now() - this.t0) / 1000; this.rec = null;
      try{ this.stream.getTracks().forEach(t => t.stop()); }catch(e){}
      this._pasando = true; this.pintar();
      const crudo = new Blob(trozos, { type:rec.mimeType || mime || 'audio/mp4' });
      let r = null; try{ r = await Audios.aMp3(crudo); }catch(e){ console.warn('mp3', e); }
      const n = r ? { blob:r.blob, dur:r.dur || dur, tipo:'audio/mpeg', ext:'mp3' } : { blob:crudo, dur, tipo:crudo.type, ext:crudo.type.includes('webm') ? 'webm' : 'm4a' };
      this._pasando = false;
      if(!n.blob.size){ this.pintar(); toast('No se ha grabado nada'); return; }
      await this.poner({ id:nuevoId('g'), fecha:this.t0, nombre:'', dur:n.dur, size:n.blob.size, tipo:n.tipo, ext:n.ext, blob:n.blob });
      this.pintar(); toast('🎙️ Nota de voz guardada (' + durTxt(n.dur) + ')');
      setTimeout(() => { const c = $('#grbLista'), u = c && c.lastElementChild; if(u) u.scrollIntoView({ block:'center', behavior:'smooth' }); }, 80);
    };
    this.rec.start(500); this.t0 = Date.now(); this.pintar();
    this._reloj = setInterval(() => { const t = $('#grbTiempo'); if(t) t.textContent = durTxt((Date.now() - this.t0) / 1000) || '0:00'; }, 250);
  },

  /* ---------- Escuchar ---------- */
  tocar(id){
    const n = this.lista.find(x => x.id === id); if(!n) return;
    if(this.sonando && this.sonando.id === id){ const a = this.sonando.a; if(a.paused) a.play(); else a.pause(); this.pintar(); return; }
    this.parar();
    const url = URL.createObjectURL(n.blob), a = new Audio(url);
    this.sonando = { id, a, url };
    a.ontimeupdate = () => { const b = $(`[data-barra="${id}"] i`); if(b) b.style.width = Math.min(100, a.currentTime / (n.dur || a.duration || 1) * 100) + '%'; };
    a.onended = () => { this.parar(); this.pintar(); };
    a.play().catch(() => toast('No se ha podido reproducir'));
    this.pintar();
  },
  parar(){ if(!this.sonando) return; try{ this.sonando.a.pause(); }catch(e){} URL.revokeObjectURL(this.sonando.url); this.sonando = null; },
  saltar(id, x, barra){ if(!this.sonando || this.sonando.id !== id) return; const r = barra.getBoundingClientRect(), a = this.sonando.a, n = this.lista.find(z => z.id === id);
    a.currentTime = Math.max(0, Math.min(1, (x - r.left) / r.width)) * (n.dur || a.duration || 0); },

  /* ---------- Eliminar y guardar en el aparato ---------- */
  async eliminar(id){
    const n = this.lista.find(x => x.id === id); if(!n) return;
    if(!await confirmarMio('Eliminar nota de voz', `¿Seguro que quieres eliminar «${esc(n.nombre || this.cuando(n.fecha))}»? No se puede deshacer.`, 'Eliminar')) return;
    if(this.sonando && this.sonando.id === id) this.parar();
    await this.quitar(id); this.pintar(); toast('🗑 Nota de voz eliminada');
  },
  async guardarEnAparato(id){
    const n = this.lista.find(x => x.id === id); if(!n) return;
    const d = new Date(n.fecha), base = (n.nombre || 'nota-de-voz').replace(/[^\w\- áéíóúñçÁÉÍÓÚÑÇ]/g, '').trim().slice(0, 50) || 'nota-de-voz';
    const nombre = base + ' ' + iso(d) + ' ' + String(d.getHours()).padStart(2, '0') + 'h' + String(d.getMinutes()).padStart(2, '0') + '.' + (n.ext || 'mp3');
    const file = new File([n.blob], nombre, { type:n.tipo || 'audio/mpeg' });
    if(matchMedia('(pointer:coarse)').matches && navigator.canShare && navigator.canShare({ files:[file] })){
      try{ await navigator.share({ files:[file], title:nombre }); return; }catch(e){ if(e.name === 'AbortError') return; }
    }
    descargar(n.blob, nombre); toast('⬇️ «' + nombre + '» guardada');
  },

  /* ---------- Deslizar las notas ---------- */
  iniciarDeslizar(){
    const c = $('#grbLista'); let D = null;
    const LIM = 90;
    const empezar = (x, y, t) => { const nota = t.closest && t.closest('.grb-nota'); if(!nota || t.closest('input,.grb-play,.grb-barra')) return; D = { x, y, nota, cara:nota.querySelector('.grb-cara'), dx:0, no:false, si:false }; };
    const mover = (x, y) => {
      if(!D || D.no) return false;
      const dx = x - D.x, dy = y - D.y;
      if(!D.si){ if(Math.abs(dx) < 8 && Math.abs(dy) < 8) return false; if(Math.abs(dy) > Math.abs(dx)){ D.no = true; return false; } D.si = true; D.cara.style.transition = 'none'; }
      D.dx = Math.max(-170, Math.min(170, dx));
      D.cara.style.transform = `translateX(${D.dx}px)`;
      D.nota.classList.toggle('a-borrar', D.dx < 0); D.nota.classList.toggle('a-guardar', D.dx > 0);
      D.nota.classList.toggle('listo', Math.abs(D.dx) > LIM);
      return true;
    };
    const acabar = () => {
      if(!D) return; const d = D; D = null; if(!d.si) return;
      d.cara.style.transition = ''; d.cara.style.transform = '';
      setTimeout(() => d.nota.classList.remove('a-borrar', 'a-guardar', 'listo'), 250);
      this._desliz = Date.now();
      if(d.dx < -LIM) this.eliminar(d.nota.dataset.id);
      else if(d.dx > LIM) this.guardarEnAparato(d.nota.dataset.id);
    };
    c.addEventListener('touchstart', e => { if(e.touches.length === 1) empezar(e.touches[0].clientX, e.touches[0].clientY, e.target); }, { passive:true });
    c.addEventListener('touchmove', e => { if(D && mover(e.touches[0].clientX, e.touches[0].clientY) && e.cancelable) e.preventDefault(); }, { passive:false });
    c.addEventListener('touchend', acabar); c.addEventListener('touchcancel', acabar);
    c.addEventListener('pointerdown', e => { if(e.pointerType === 'mouse' && e.button === 0) empezar(e.clientX, e.clientY, e.target); });
    addEventListener('pointermove', e => { if(e.pointerType === 'mouse' && D) mover(e.clientX, e.clientY); });
    addEventListener('pointerup', e => { if(e.pointerType === 'mouse') acabar(); });
  },

  iniciar(){
    $('#grbBoton').onclick = () => this.pulsar();
    const c = $('#grbLista');
    c.addEventListener('click', e => {
      if(Date.now() - (this._desliz || 0) < 400) return;
      const p = e.target.closest('[data-play]'); if(p){ this.tocar(p.dataset.play); return; }
      const b = e.target.closest('[data-barra]'); if(b) this.saltar(b.dataset.barra, e.clientX, b);
    });
    c.addEventListener('change', async e => { const i = e.target.closest('[data-nom]'); if(!i) return; const n = this.lista.find(x => x.id === i.dataset.nom); if(!n) return;
      n.nombre = i.value.trim(); await this.poner(n); toast('✏️ Nombre guardado'); });
    c.addEventListener('keydown', e => { if(e.key === 'Enter' && e.target.matches('[data-nom]')) e.target.blur(); });
    this.iniciarDeslizar();
    this.cargar();
  }
};
