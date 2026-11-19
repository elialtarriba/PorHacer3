/* PorHacer · dictado por voz (micrófono)
   Pulsas el micro, hablas y se va escribiendo. Vuelves a pulsar para parar.
   Puedes decir «coma», «punto», «punto y aparte», «nueva línea»
   (en catalán: «coma», «punt», «punt i a part», «línia nova»). */

const Voz = {
  activo: null,
  soportado(){ return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },

  REGLAS: {
    es: [[/\s*punto y aparte\s*/gi, '.\n'], [/\s*nueva l[ií]nea\s*/gi, '\n'], [/\s*\bcoma\b/gi, ','], [/\s*\bpunto\b/gi, '.'], [/\s*interrogaci[oó]n\b/gi, '?']],
    ca: [[/\s*punt i a part\s*/gi, '.\n'], [/\s*l[ií]nia nova\s*/gi, '\n'], [/\s*coma\b/gi, ','], [/\s*\bpunt\b/gi, '.'], [/\s*interrogant\b/gi, '?']],
    en: [[/\s*new paragraph\s*/gi, '.\n'], [/\s*new line\s*/gi, '\n'], [/\s*\bcomma\b/gi, ','], [/\s*\b(full stop|period)\b/gi, '.'], [/\s*question mark\b/gi, '?']],
    fr: [[/\s*(nouveau paragraphe|point à la ligne)\s*/gi, '.\n'], [/\s*(à la ligne|nouvelle ligne)\s*/gi, '\n'], [/\s*\bvirgule\b/gi, ','], [/\s*point d'interrogation\b/gi, '?'], [/\s*\bpoint\b/gi, '.']]
  },
  NOMBRES: { es:'castellano', ca:'català', en:'English', fr:'français' },
  _limpiar(t, idioma){
    for(const [a,b] of (this.REGLAS[idioma.slice(0,2)] || this.REGLAS.es)) t = t.replace(a, b);
    return t.replace(/([.?!]\s+|\n)([a-záéíóúàèòïüçâêîôûëœ])/g, (m,p,l) => p + l.toUpperCase());
  },

  // Para el micro. La pantalla se actualiza YA, sin esperar al navegador
  // (en el iPhone, a veces el reconocimiento tarda o no avisa al terminar).
  parar(){
    // V19: si estaba a punto de volver a escuchar sola, se cancela
    if(this._sigueT){ clearTimeout(this._sigueT); this._sigueT = null; if(this._sigueBoton) this._sigueBoton.classList.remove('oyendo'); if(this._sigueEstado) this._sigueEstado.textContent = ''; }
    const ses = this.activo; if(!ses) return;
    this.activo = null;
    ses.parado = true;
    this._apagar(ses);
    try{ ses.rec.stop(); }catch(e){}
    // si en 1,5 s no ha terminado del todo, se corta
    ses.corte = setTimeout(() => { try{ ses.rec.abort(); }catch(e){} }, 1500);
  },
  _apagar(ses){
    if(ses.apagado) return; ses.apagado = true;
    if(!(this.activo && this.activo !== ses && this.activo.boton === ses.boton)) ses.boton.classList.remove('oyendo');
    if(ses.estado && ses.estado.dataset.de === ses.id) ses.estado.textContent = '';
    const c = ses.campo;
    if(ses.span){
      const t = document.createTextNode(ses.span.textContent);
      // el cursor se queda justo después de lo dictado
      let aqui = false; try{ const sl = getSelection(); aqui = !!(sl.rangeCount && (sl.getRangeAt(0).startContainer === ses.span.parentNode || ses.span.contains(sl.getRangeAt(0).startContainer))); }catch(e){}
      ses.span.replaceWith(t); ses.span = null; ses.nodo = t;
      if(aqui || (ses.op && ses.op.rango)){ try{ const sl = getSelection(), rr = document.createRange(); rr.setStartAfter(t); rr.collapse(true); sl.removeAllRanges(); sl.addRange(rr); }catch(e){} }
    }
    else if(!c.isContentEditable && typeof c.value === 'string') c.value = c.value.replace(/[ \t]+$/,'');
    c.dispatchEvent(new Event('input', { bubbles:true }));
  },

  // Avisos claros cuando el dictado no puede funcionar
  _aviso(err){
    const iosApp = /iP(hone|ad|od)/.test(navigator.userAgent) && (navigator.standalone || matchMedia('(display-mode: standalone)').matches);
    const truco = iosApp ? '<br><br>En el iPhone, cuando la app está en la pantalla de inicio, Apple a veces no deja dictar. Puedes: abrir la app en <b>Safari</b>, o tocar la hoja y usar el <b>micro 🎤 del teclado</b> del iPhone.' : '';
    const T = {
      'not-allowed':'Hay que dar permiso al micrófono. En el iPhone: Ajustes › Safari › Micrófono › Permitir. En el ordenador: el candado 🔒 al lado de la dirección › Micrófono › Permitir.',
      'service-not-allowed':'El sistema no deja usar el dictado. En el iPhone/Mac: Ajustes › General › Teclado › activa «Dictado».',
      'audio-capture':'No encuentro ningún micrófono. Mira que esté conectado y que ninguna otra app lo esté usando.',
      'network':'El dictado necesita internet (el navegador envía la voz a su servicio para escribirla). Mira la conexión.',
      'language-not-supported':'Este navegador no sabe dictar en ese idioma. Prueba con otro.',
      'nada':'El navegador no ha empezado a escuchar.'
    };
    popAviso('🎤 Dictar', (T[err] || ('No se ha podido dictar (' + err + ').')) + truco);
  },

  empezar(campo, boton, estado, op){
    if(!this.soportado()){
      popAviso('🎤 Dictar', /firefox/i.test(navigator.userAgent)
        ? 'Firefox no tiene dictado por voz. Abre la app en Chrome, Edge o Safari para dictar.'
        : 'Este navegador no permite dictar. En iPhone y Mac funciona en Safari; en ordenador, en Chrome o Edge; en Android, en Chrome.');
      return;
    }
    // Si ya está escuchando: se para (y si era otro campo, se empieza en el nuevo)
    if(this.activo){ const mismo = this.activo.campo === campo; this.parar(); if(mismo) return; }

    // en el iPhone, si el micro anterior aún no se ha soltado, el nuevo no oye nada:
    // se espera a que termine (como mucho 1,2 s)
    const prev = this._ultimo;
    if(prev && !prev.terminado && !(op && op._esperado)){
      boton.classList.add('oyendo');
      if(estado) estado.textContent = '🎙️ Un momento…';
      try{ prev.rec.abort(); }catch(e){}
      const sigue = () => { clearTimeout(prev.espera); prev.alTerminar = null; if(this.activo) return; this.empezar(campo, boton, estado, { ...(op || {}), _esperado:true }); };
      prev.alTerminar = sigue; prev.espera = setTimeout(sigue, 1200);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const idioma = (op && op.idioma) || (App.ajustes && App.ajustes.idiomaVoz) || 'es-ES';
    const r = new SR();
    r.lang = idioma; r.continuous = true; r.interimResults = true;
    let base = campo.isContentEditable ? (campo.textContent || '') : campo.value; if(base && !/\s$/.test(base)) base += ' ';
    const ses = { id: String(Date.now()), rec:r, campo, boton, estado, base, final:'', parado:false, inicio:Date.now(), oido:false, op };
    this._ultimo = ses;
    if(campo.isContentEditable && op && op.rango){   // Escribir: lo dictado entra donde está el cursor
      const r = op.rango; r.deleteContents();
      // todo el texto que hay antes del cursor (para saber si toca mayúscula y si hace falta un espacio)
      const antes = (() => { try{ const q = document.createRange(); q.selectNodeContents(campo); q.setEnd(r.startContainer, r.startOffset); return q.toString(); }catch(e){ return r.startContainer.nodeType === 3 ? r.startContainer.nodeValue.slice(0, r.startOffset) : ''; } })();
      ses.span = document.createElement('span');
      if(antes && !/\s$/.test(antes)) r.insertNode(document.createTextNode(' '));
      r.collapse(false); r.insertNode(ses.span);
      ses.base = (!antes.trim() || /[.?!¿¡:]\s*$|\n\s*$/.test(antes)) ? '' : 'x ';
      try{ const s = getSelection(), rr = document.createRange(); rr.setStartAfter(ses.span); rr.collapse(true); s.removeAllRanges(); s.addRange(rr); }catch(e){}
    } else if(campo.isContentEditable){       // notas con negrita: lo dictado va al final, sin tocar lo de antes
      if(campo.textContent && !/\s$/.test(campo.textContent)) campo.appendChild(document.createTextNode(' '));
      ses.span = document.createElement('span'); campo.appendChild(ses.span);
    }
    this.activo = ses;
    boton.classList.add('oyendo');
    if(estado){ estado.dataset.de = ses.id; estado.textContent = '🎙️ Te escucho' + (op && op.idioma ? ' (' + (this.NOMBRES[idioma.slice(0,2)] || idioma) + ')' : '') + '… pulsa otra vez el micro para parar'; }

    r.onresult = ev => {
      let interino = '';
      for(let i = ev.resultIndex; i < ev.results.length; i++){
        const t = ev.results[i][0].transcript;
        if(ev.results[i].isFinal) ses.final += t + ' ';
        else interino += t;
      }
      // al parar, solo se guarda lo que ya es definitivo
      let texto = this._limpiar(ses.final + (ses.parado ? '' : interino), idioma).replace(/ +([,.?])/g,'$1');
      if(!ses.base.trim() && texto) texto = texto.charAt(0).toUpperCase() + texto.slice(1);
      if(texto) ses.oido = true;
      if(ses.span) ses.span.textContent = texto; else if(ses.nodo) ses.nodo.nodeValue = texto; else if(!campo.isContentEditable) campo.value = ses.base + texto;
      campo.dispatchEvent(new Event('input', { bubbles:true }));
      if(campo.tagName === 'TEXTAREA') campo.scrollTop = campo.scrollHeight;
    };
    r.onstart = () => { ses.empezado = true; clearTimeout(ses.vigia); };
    // si en 4 s el navegador no ha empezado a escuchar, se avisa (antes no pasaba nada)
    ses.vigia = setTimeout(() => { if(!ses.empezado && !ses.terminado && this.activo === ses){ this.parar(); this._aviso('nada'); } }, 4000);
    r.onerror = ev => {
      ses.error = ev.error;
      if(ev.error === 'no-speech' || ev.error === 'aborted') return;
      if(!ses.avisado){ ses.avisado = true; this._aviso(ev.error); }
    };
    r.onend = () => {
      clearTimeout(ses.corte); ses.terminado = true;
      const solo = this.activo === ses;
      if(solo) this.activo = null;     // terminó solo (silencio largo)
      // el iPhone a veces corta enseguida sin oír nada: se vuelve a intentar una vez
      if(solo && !ses.oido && !ses.reintento && Date.now() - ses.inicio < 4000 && !/not-allowed/.test(ses.error || '')){
        if(ses.span){ ses.span.remove(); ses.span = null; }
        ses.apagado = true;
        const rango = (op && op.rango && ses.campo.isContentEditable) ? (() => { const s = getSelection(); return s.rangeCount && ses.campo.contains(s.getRangeAt(0).startContainer) ? s.getRangeAt(0) : null; })() : null;
        setTimeout(() => { if(this.activo) return; this.empezar(campo, boton, estado, { ...(op || {}), rango: rango || (op && op.rango), _esperado:true, _reintento:true }); }, 250);
        if(ses.alTerminar) ses.alTerminar();
        return;
      }
      this._apagar(ses);
      // V19 · el iPhone corta solo cada poco: si no se ha pulsado «Parar», se vuelve a escuchar donde estaba el cursor
      const mudos = ses.oido ? 0 : ((op && op._mudos) || 0) + 1;
      if(solo && !ses.parado && op && op.seguir && !/not-allowed|audio-capture|network|language/.test(ses.error || '') && mudos <= 3 && ((op._auto || 0) < 60)){
        boton.classList.add('oyendo');
        let rango = null;
        try{ const sl = getSelection(); if(sl.rangeCount && campo.contains(sl.getRangeAt(0).startContainer)) rango = sl.getRangeAt(0).cloneRange(); }catch(e){}
        if(!rango){ rango = document.createRange(); rango.selectNodeContents(campo); rango.collapse(false); }
        this._sigueBoton = boton; this._sigueEstado = estado;
        this._sigueT = setTimeout(() => { this._sigueT = null; if(this.activo) return; this.empezar(campo, boton, estado, { ...op, rango, _esperado:true, _reintento:true, _auto:(op._auto || 0) + 1, _mudos:mudos }); }, 250);
        if(ses.alTerminar) ses.alTerminar();
        return;
      }
      if(!ses.oido && !ses.parado && estado){ estado.dataset.de = ''; estado.textContent = '🎙️ No te he oído. Pulsa otra vez el micro'; }
      if(ses.alTerminar) ses.alTerminar();
    };
    if(op && op._reintento) ses.reintento = true;
    try{ r.start(); }catch(e){ this.activo = null; ses.terminado = true; clearTimeout(ses.vigia); this._apagar(ses); this._aviso(e && e.name === 'NotAllowedError' ? 'not-allowed' : (e && e.message) || 'nada'); }
  }
};
