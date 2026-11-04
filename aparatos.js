/* PorHacer3 · «Tus aparatos»
   Cada aparato en el que entras con tu cuenta se apunta en la nube (usuarios/{uid}/aparatos/{id}) con su nombre,
   cuándo se usó por última vez y dónde guarda cada apartado (nube o aparato).
   Desde Configuración › Guardar puedes ver en cuántos aparatos tienes cada cosa y, desde otro aparato,
   pedirle que cierre la sesión o que cambie dónde guarda algo: lo hace en cuanto se abre o está conectado. */

const Aparatos = {
  lista: [], _sub: null, _uid: null,
  id(){ let i = lsGet('ph3-dev-id'); if(!i){ i = 'ap_' + nuevoId('d'); lsSet('ph3-dev-id', i); } return i; },
  tipo(){
    const u = navigator.userAgent || '', toque = navigator.maxTouchPoints > 1;
    if(/iPhone/.test(u)) return 'iphone';
    if(/iPad/.test(u) || (/Macintosh/.test(u) && toque)) return 'ipad';
    if(/Android/.test(u)) return /Mobile/.test(u) ? 'android' : 'tablet';
    if(/Macintosh|Mac OS X/.test(u)) return 'mac';
    if(/Windows/.test(u)) return 'pc';
    return 'otro';
  },
  ICO: { iphone:'📱', android:'📱', ipad:'📲', tablet:'📲', mac:'💻', pc:'🖥️', otro:'🔌' },
  NOM: { iphone:'iPhone', android:'Móvil Android', ipad:'iPad', tablet:'Tablet', mac:'Mac', pc:'Ordenador (Windows)', otro:'Otro aparato' },
  navegador(){ const u = navigator.userAgent || ''; return /Edg\//.test(u) ? 'Edge' : /Chrome|CriOS/.test(u) ? 'Chrome' : /Firefox|FxiOS/.test(u) ? 'Firefox' : /Safari/.test(u) ? 'Safari' : ''; },
  nombre(){ return lsGet('ph3-dev-nombre') || (this.NOM[this.tipo()] + (['mac', 'pc', 'otro'].includes(this.tipo()) && this.navegador() ? ' · ' + this.navegador() : '')); },
  uid(){ return typeof Guardar !== 'undefined' ? Guardar.uid() : null; },
  ref(){ return Nube.db.collection('usuarios').doc(this.uid()).collection('aparatos'); },
  dondeTodo(){ const o = {}; Ajustes.DONDE.forEach(([k]) => { try{ o[k] = Ajustes.dondeDe(k); }catch(e){} }); return o; },

  async publicar(){
    if(!this.uid()) return;
    try{ await this.ref().doc(this.id()).set({ id:this.id(), nombre:this.nombre(), tipo:this.tipo(), visto:Date.now(), version:typeof VERSION !== 'undefined' ? VERSION : '', donde:this.dondeTodo() }, { merge:true }); }
    catch(e){ console.warn('aparatos', e); }
  },
  vigilar(){
    const u = this.uid();
    if(u === this._uid) return;
    this._uid = u;
    if(this._sub){ try{ this._sub(); }catch(e){} this._sub = null; }
    this.lista = [];
    if(!u) return;
    this.publicar();
    this._sub = this.ref().onSnapshot(snap => {
      this.lista = snap.docs.map(d => d.data()).filter(Boolean).sort((a, b) => (b.visto || 0) - (a.visto || 0));
      const yo = this.lista.find(a => a.id === this.id());
      if(yo && yo.pedir) this.obedecer(yo.pedir);
      if(typeof Ajustes !== 'undefined' && Ajustes.pagina === 'donde' && $('#gdAparatos')) Ajustes.pintarAparatos();
    }, e => console.warn('aparatos', e));
  },
  // lo que ha pedido otro aparato
  async obedecer(p){
    if(this._obedeciendo) return; this._obedeciendo = true;
    try{
      await this.ref().doc(this.id()).update({ pedir:null });
      if(p.donde) for(const [sec, a] of Object.entries(p.donde)){
        if(a !== 'nube' && a !== 'aparato' || Ajustes.dondeDe(sec) === a) continue;
        try{ await Ajustes.aplicarDonde(sec, a, false); toast((a === 'nube' ? '☁️ ' : '📱 ') + 'Desde otro aparato: ' + Ajustes.nomDonde(sec) + ' ahora se guarda en ' + (a === 'nube' ? 'la nube' : 'este aparato'), null, null, 4000); }catch(e){ console.warn(e); }
      }
      await this.publicar();
      if(p.cerrar){ toast('🚪 Se ha cerrado la sesión desde otro aparato', null, null, 5000); lsSet('ph3-cache-tid', null); setTimeout(() => Nube.auth.signOut(), 600); }
    }catch(e){ console.warn('aparatos', e); }
    this._obedeciendo = false;
  },
  pedir(id, campos){ return this.ref().doc(id).update(campos); },
  hace(t){
    if(!t) return 'nunca'; const m = Math.round((Date.now() - t) / 60000);
    return m < 2 ? 'ahora mismo' : m < 60 ? 'hace ' + m + ' min' : m < 1440 ? 'hace ' + Math.round(m / 60) + ' h' : m < 2880 ? 'ayer' : 'hace ' + Math.round(m / 1440) + ' días';
  },
  iniciar(){
    setTimeout(() => this.vigilar(), 2500);
    setInterval(() => this.vigilar(), 3000);
    setInterval(() => this.publicar(), 5 * 60000);
    document.addEventListener('visibilitychange', () => { if(!document.hidden) this.publicar(); });
  }
};
