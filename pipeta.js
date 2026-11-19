/* PorHacer3 V19 · Pipeta (🧪 Buscar color)
   · En Chrome/Edge de ordenador: la pipeta del propio navegador (coge un color de CUALQUIER sitio de la pantalla).
   · En iPhone, iPad, Safari y Firefox (no tienen pipeta): se toca la pantalla de la app, o una foto, y se coge el color. */
const Pipeta = {
  // Cualquier color CSS → '#rrggbb'
  aHex(c){
    const x = document.createElement('canvas').getContext('2d'); x.fillStyle = '#000'; x.fillStyle = String(c || '');
    const v = x.fillStyle; if(/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
    const m = v.match(/[\d.]+/g); if(!m) return null;
    return '#' + m.slice(0, 3).map(n => Math.round(+n).toString(16).padStart(2, '0')).join('');
  },
  async buscar(){
    if(window.EyeDropper){
      try{ const r = await new EyeDropper().open(); return this.aHex(r.sRGBHex); }catch(e){ return null; }   // Esc = cancelar
    }
    const donde = await popup({ tit:'🧪 Buscar color', html:`<p>¿Dónde quieres buscar el color?</p>
        <button class="opcion opc2" data-v="pantalla">📱 En la pantalla de la app<small>Se esconde la tarea y tocas el color que quieras</small></button>
        <button class="opcion opc2" data-v="foto">📷 En una foto<small>Haz una foto o elige una, y toca el color</small></button>`,
      botones:[{ txt:'Cancelar', val:null }], alAbrir:(c, fin) => $$('[data-v]', c).forEach(b => b.onclick = () => fin(b.dataset.v)) });
    if(donde === 'pantalla') return this.capa(null);
    if(donde === 'foto'){ const img = await this.elegirFoto(); return img ? this.capa(img) : null; }
    return null;
  },
  elegirFoto(){
    return new Promise(ok => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.hidden = true; document.body.appendChild(i);
      i.onchange = () => { const f = i.files[0]; i.remove(); if(!f) return ok(null);
        const img = new Image(); img.onload = () => ok(img); img.onerror = () => { toast('No se ha podido abrir esa foto'); ok(null); }; img.src = URL.createObjectURL(f); };
      i.click();
    });
  },
  // Color de lo que hay en la pantalla de la app en el punto (x, y)
  colorPantalla(x, y, capa){
    capa.style.pointerEvents = 'none'; let el = document.elementFromPoint(x, y); capa.style.pointerEvents = '';
    if(!el) return null;
    if(/^(IMG|CANVAS|VIDEO)$/.test(el.tagName)){
      try{
        const r = el.getBoundingClientRect(), w = el.naturalWidth || el.videoWidth || el.width, h = el.naturalHeight || el.videoHeight || el.height;
        const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d');
        cx.drawImage(el, (x - r.left) / r.width * w, (y - r.top) / r.height * h, 1, 1, 0, 0, 1, 1);
        const d = cx.getImageData(0, 0, 1, 1).data; if(d[3]) return this.aHex(`rgb(${d[0]},${d[1]},${d[2]})`);
      }catch(e){}
    }
    // Se van juntando las capas de fondo desde el elemento tocado hacia atrás (degradados y transparencias incluidos)
    const capas = [];
    const rgba = c => { const m = String(c).match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2], m.length > 3 ? +m[3] : 1] : null; };
    for(let e = el; e; e = e.parentElement){
      const st = getComputedStyle(e);
      if(e.closest('svg') && st.fill && st.fill !== 'none' && !/url/.test(st.fill) && e.tagName !== 'svg'){ const f = rgba(this.aHex(st.fill)); if(f){ capas.push(f); break; } }
      const bi = st.backgroundImage;
      if(bi && /gradient/.test(bi)){
        const cols = (bi.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}\b/gi) || []).map(rgba).filter(Boolean);
        if(cols.length){
          const r = e.getBoundingClientRect(), t = Math.min(1, Math.max(0, r.height ? (y - r.top) / r.height : 0.5)), n = cols.length - 1;
          const i = Math.min(n - 1, Math.floor(t * n)), a = cols[Math.max(0, i)], b = cols[Math.min(n, i + 1)], f = n ? t * n - i : 0;
          const c = a.map((v, k) => v + (b[k] - v) * f); capas.push(c); if(c[3] >= 0.98) break;
        }
      }
      const c = rgba(st.backgroundColor);
      if(c && c[3] > 0.02){ capas.push(c); if(c[3] >= 0.98) break; }
      if(e === document.documentElement) break;
    }
    let res = [255, 255, 255];
    for(let i = capas.length - 1; i >= 0; i--){ const [r, g, b, a] = capas[i]; res = [r * a + res[0] * (1 - a), g * a + res[1] * (1 - a), b * a + res[2] * (1 - a)]; }
    return this.aHex(`rgb(${res.map(Math.round).join(',')})`);
  },
  // Pantalla para tocar: sobre la app (img = null) o sobre una foto
  capa(img){
    return new Promise(ok => {
      const capa = document.createElement('div'); capa.className = 'pipeta-capa' + (img ? ' con-foto' : '');
      capa.innerHTML = `<div class="pipeta-barra"><span>🧪 ${img ? 'Toca el color en la foto' : 'Toca el color que quieras'}</span><button type="button">✕ Cancelar</button></div><div class="pipeta-lupa" hidden><i></i><b></b></div>`;
      let cv = null, cx = null;
      if(img){
        cv = document.createElement('canvas'); const dpr = Math.min(2, devicePixelRatio || 1);
        const W = innerWidth, H = innerHeight - 56, k = Math.min(W / img.naturalWidth, H / img.naturalHeight, 1 * 4);
        const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
        cx = cv.getContext('2d', { willReadFrequently:true }); cx.drawImage(img, 0, 0, cv.width, cv.height);
        capa.appendChild(cv); URL.revokeObjectURL(img.src);
      }
      document.body.classList.add('pipeta-on'); document.body.appendChild(capa);
      const lupa = $('.pipeta-lupa', capa);
      const leer = (x, y) => {
        if(!cv) return this.colorPantalla(x, y, capa);
        const r = cv.getBoundingClientRect(); if(x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
        const d = cx.getImageData(Math.floor((x - r.left) * cv.width / r.width), Math.floor((y - r.top) * cv.height / r.height), 1, 1).data;
        return this.aHex(`rgb(${d[0]},${d[1]},${d[2]})`);
      };
      let actual = null;
      const mover = e => {
        if(e.target.closest('.pipeta-barra')) return;
        e.preventDefault(); actual = leer(e.clientX, e.clientY); if(!actual){ lupa.hidden = true; return; }
        lupa.hidden = false; lupa.style.left = e.clientX + 'px'; lupa.style.top = e.clientY + 'px';
        $('i', lupa).style.background = actual; $('b', lupa).textContent = actual;
      };
      const fin = v => { capa.remove(); document.body.classList.remove('pipeta-on'); ok(v); };
      capa.addEventListener('pointerdown', mover); capa.addEventListener('pointermove', e => { if(e.buttons || e.pointerType !== 'mouse') mover(e); else if(!e.target.closest('.pipeta-barra')) mover(e); });
      capa.addEventListener('pointerup', e => { if(e.target.closest('.pipeta-barra')) return; mover(e); if(actual) fin(actual); });
      $('.pipeta-barra button', capa).onclick = () => fin(null);
    });
  }
};
