/* PorHacer3 V17 · edición local de audio; los originales solo cambian al confirmar. */
const Estudio = {
  pistas: [], urls: [], ocupado:false, modificado:false, original:null,
  async leer(blob){
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    try{
      const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
      const off = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(Math.min(2,buf.numberOfChannels), Math.ceil(buf.duration*44100),44100);
      const s = off.createBufferSource(); s.buffer=buf; s.connect(off.destination); s.start();
      return await off.startRendering();
    }finally{ await ctx.close(); }
  },
  buffer(canales, longitud, sr=44100){ return new AudioBuffer({numberOfChannels:canales,length:longitud,sampleRate:sr}); },
  cortar(buf, a, b, conservar){
    const ini=Math.max(0,Math.round(a*buf.sampleRate)), fin=Math.min(buf.length,Math.round(b*buf.sampleRate));
    if(fin<=ini) throw Error('El final debe ser posterior al inicio.');
    const n=conservar ? fin-ini : buf.length-(fin-ini);
    if(n<1) throw Error('El corte dejaría el audio vacío.');
    const out=this.buffer(buf.numberOfChannels,n,buf.sampleRate);
    for(let c=0;c<buf.numberOfChannels;c++){
      const x=buf.getChannelData(c), y=out.getChannelData(c);
      if(conservar) y.set(x.subarray(ini,fin)); else {y.set(x.subarray(0,ini));y.set(x.subarray(fin),ini);}
      // Fundido de 3 ms en la unión para evitar clics al quitar un fragmento interior.
      if(!conservar && ini>0 && ini<n){ const m=Math.min(132,ini,n-ini);for(let j=0;j<m;j++){y[ini-m+j]*=1-j/m;y[ini+j]*=j/m;} }
    }
    return out;
  },
  juntar(){
    if(!this.pistas.length) throw Error('Añade al menos un audio.');
    const n=this.pistas.reduce((s,p)=>s+p.buf.length,0), canales=Math.max(...this.pistas.map(p=>p.buf.numberOfChannels));
    const out=this.buffer(canales,n);let pos=0;
    for(const p of this.pistas){for(let c=0;c<canales;c++) out.getChannelData(c).set(p.buf.getChannelData(Math.min(c,p.buf.numberOfChannels-1)),pos);pos+=p.buf.length;}
    return out;
  },
  wav(buf){
    const nc=buf.numberOfChannels, ab=new ArrayBuffer(44+buf.length*nc*2), v=new DataView(ab);
    const str=(p,s)=>{for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i));};
    str(0,'RIFF');v.setUint32(4,ab.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nc,true);v.setUint32(24,buf.sampleRate,true);v.setUint32(28,buf.sampleRate*nc*2,true);v.setUint16(32,nc*2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,ab.byteLength-44,true);
    const datos=Array.from({length:nc},(_,c)=>buf.getChannelData(c));let p=44;
    for(let i=0;i<buf.length;i++)for(let c=0;c<nc;c++){const x=Math.max(-1,Math.min(1,datos[c][i]));v.setInt16(p,x<0?x*32768:x*32767,true);p+=2;}
    return new Blob([ab],{type:'audio/wav'});
  },
  async mp3(buf){
    if(!await Audios.cargarLame()) throw Error('No se pudo cargar el conversor MP3.');
    const nc=Math.min(2,buf.numberOfChannels), enc=new lamejs.Mp3Encoder(nc,buf.sampleRate,128), partes=[];
    const datos=Array.from({length:nc},(_,c)=>buf.getChannelData(c));
    for(let i=0;i<buf.length;i+=1152){
      const pcm=datos.map(d=>{const out=new Int16Array(Math.min(1152,buf.length-i));for(let j=0;j<out.length;j++){const x=Math.max(-1,Math.min(1,d[i+j]));out[j]=x<0?x*32768:x*32767;}return out;});
      const b=enc.encodeBuffer(pcm[0],pcm[1]);if(b.length)partes.push(new Uint8Array(b));
      if(i%(1152*100)===0) await new Promise(r=>setTimeout(r,0));
    }
    const fin=enc.flush();if(fin.length)partes.push(new Uint8Array(fin));return new Blob(partes,{type:'audio/mpeg'});
  },
  async limpiar(buf){
    const off=new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(buf.numberOfChannels,buf.length,buf.sampleRate);
    const src=off.createBufferSource();src.buffer=buf;
    const hp=off.createBiquadFilter();hp.type='highpass';hp.frequency.value=80;
    const lp=off.createBiquadFilter();lp.type='lowpass';lp.frequency.value=10000;
    src.connect(hp);hp.connect(lp);lp.connect(off.destination);src.start();return await off.startRendering();
  },
  async trabajo(fn){
    if(this.ocupado)return;this.ocupado=true;this.estado('Procesando…');this.bloquear(true);
    try{await fn();}catch(e){this.estado(e.message || 'No se pudo procesar el audio.');toast(e.message || 'No se pudo procesar el audio');}
    finally{this.ocupado=false;this.bloquear(false);}
  },
  bloquear(v){if(this.el) $$('button,input,select',this.el).forEach(b=>b.disabled=v);},
  estado(s){if(this.el) $('#estEstado',this.el).textContent=s;},
  async abrir(id, convertir=false){
    if(Grabar.rec || Grabar._pasando || Grabar._pidiendo){toast('Para la grabación antes de abrir el estudio');return;}
    if(this.el)return; Grabar.parar();this.pistas=[];this.original=id?Grabar.lista.find(n=>n.id===id):null;this.modificado=false;
    this.el=document.createElement('section');this.el.className='estudio';this.el.setAttribute('role','dialog');this.el.setAttribute('aria-label','Estudio de audio');
    this.el.innerHTML=`<header><h2>${convertir?'Convertir a MP3':'Estudio de audio'}</h2><button type="button" class="btn-sec" data-est="cerrar">✕ Volver</button></header>
      <div class="est-contenido"><p>Añade audios y ordénalos con ↑ ↓. Se unirán uno detrás de otro. Selecciona un tramo en la onda o indica los segundos para recortarlo.</p>
      <div class="est-barra"><label class="btn-sec">＋ Archivos<input id="estArchivos" type="file" accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.opus,.flac,.aiff,.aif,.webm,.mp4" multiple hidden></label>
      <select id="estExistente" aria-label="Grabación de la app"><option value="">Grabaciones de la app…</option>${Grabar.lista.map(n=>`<option value="${esc(n.id)}">${esc(n.nombre || Grabar.cuando(n.fecha))}</option>`).join('')}</select><button class="btn-sec" data-est="agregar">Añadir grabación</button></div>
      <p class="aj-ayuda">WAV, MP3, M4A/AAC, FLAC, OGG, AIFF y WebM, según los formatos que pueda abrir este navegador. Los originales se conservan hasta que confirmes guardar.</p>
      <div id="estPistas"></div><label class="lbl">Nombre del resultado<input id="estNombre" maxlength="80" value="${esc(this.original?.nombre || 'Mi audio')}"></label>
      <label><input type="checkbox" id="estLimpiar"> Suavizar ruido grave y siseo (voz)</label><p class="aj-ayuda">Filtra graves y agudos extremos. Puede cambiar el timbre; no elimina voces, tráfico ni todos los ruidos. Escucha la vista previa antes de guardar.</p>
      <button class="btn-sec" data-est="escuchar">▶ Escuchar resultado</button><audio id="estPrev" controls hidden></audio><p id="estEstado" role="status"></p></div>
      <footer><button class="btn-pri" data-est="guardar">💾 Guardar MP3…</button></footer>`;
    document.body.appendChild(this.el);
    this.el.addEventListener('click',e=>{const b=e.target.closest('[data-est]');if(b)this.accion(b.dataset.est,b.closest('[data-pista]'));});
    $('#estArchivos',this.el).onchange=e=>{const fs=Array.from(e.target.files);e.target.value='';this.trabajo(()=>this.importar(fs));};
    $('#estLimpiar',this.el).onchange=()=>{this.modificado=true;};
    $('#estNombre',this.el).oninput=()=>{this.modificado=true;};
    this.escape=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(!$('#popup').classList.contains('abierto'))this.cerrar();}};
    window.addEventListener('keydown',this.escape,true);
    if(this.original) await this.trabajo(async()=>{await this.anadir(this.original.blob,this.original.nombre || 'Grabación');this.modificado=false;});
    else this.pintar();
  },
  async anadir(blob,nombre){
    let buf;try{buf=await this.leer(blob);}catch(e){throw Error('No se puede abrir «'+nombre+'». El formato puede no ser compatible con este navegador.');}
    this.pistas.push({nombre,buf,a:0,b:buf.duration,undo:[]});this.modificado=true;this.pintar();this.estado('Audio añadido.');
  },
  async importar(files){
    const fallos=[];
    for(const f of files){try{await this.anadir(f,f.name);}catch(e){fallos.push(e.message);}}
    this.estado(fallos.length?fallos.join(' '):'Archivos añadidos.');
  },
  liberar(){this.urls.forEach(u=>URL.revokeObjectURL(u));this.urls=[];},
  url(blob){const u=URL.createObjectURL(blob);this.urls.push(u);return u;},
  pintar(){
    $$('audio',this.el).forEach(a=>{a.pause();a.removeAttribute('src');});$('#estPrev',this.el).hidden=true;this.liberar();
    $('#estPistas',this.el).innerHTML=this.pistas.map((p,i)=>`<article data-pista="${i}"><h3>${i+1}. ${esc(p.nombre)} · ${p.buf.duration.toFixed(2)} s</h3><div class="est-barra"><button class="mini-btn" data-est="arriba" aria-label="Mover antes">↑</button><button class="mini-btn" data-est="abajo" aria-label="Mover después">↓</button><button class="mini-btn" data-est="quitar">Quitar del estudio</button></div>
      <canvas width="900" height="100" aria-label="Seleccionar tramo del audio"></canvas><audio controls src="${this.url(this.wav(p.buf))}"></audio>
      <div class="est-barra"><label>Desde (s)<input data-lim="a" type="number" min="0" max="${p.buf.duration}" step="0.01" value="${p.a}"></label><label>Hasta (s)<input data-lim="b" type="number" min="0" max="${p.buf.duration}" step="0.01" value="${p.b}"></label></div>
      <div class="est-barra"><button class="mini-btn" data-est="conservar">✂ Conservar tramo</button><button class="mini-btn" data-est="cortar">✂ Quitar tramo y unir</button><button class="mini-btn" data-est="deshacer">↶ Deshacer corte</button></div></article>`).join('');
    $$('[data-pista]',this.el).forEach(el=>{
      const p=this.pistas[+el.dataset.pista],cv=$('canvas',el);this.onda(cv,p);
      $$('[data-lim]',el).forEach(n=>n.oninput=()=>{p[n.dataset.lim]=Number(n.value);this.onda(cv,p);});
      let inicio=null;const t=e=>Math.max(0,Math.min(p.buf.duration,(e.clientX-cv.getBoundingClientRect().left)/cv.getBoundingClientRect().width*p.buf.duration));
      cv.onpointerdown=e=>{inicio=t(e);cv.setPointerCapture(e.pointerId);};
      cv.onpointermove=e=>{if(inicio===null)return;p.a=Math.min(inicio,t(e));p.b=Math.max(inicio,t(e));$('[data-lim=a]',el).value=p.a.toFixed(2);$('[data-lim=b]',el).value=p.b.toFixed(2);this.onda(cv,p);};
      cv.onpointerup=cv.onpointercancel=()=>inicio=null;
    });
    if(this.ocupado)this.bloquear(true);
  },
  onda(cv,p){
    const cx=cv.getContext('2d'),w=cv.width,h=cv.height,d=p.buf.getChannelData(0);cx.clearRect(0,0,w,h);cx.fillStyle='#dce8ee';cx.fillRect(0,0,w,h);cx.strokeStyle='#304c59';cx.beginPath();
    for(let x=0;x<w;x++){let max=0;const a=Math.floor(x*d.length/w),b=Math.floor((x+1)*d.length/w);for(let i=a;i<b;i++)max=Math.max(max,Math.abs(d[i]));cx.moveTo(x,h/2-max*h/2);cx.lineTo(x,h/2+max*h/2);}cx.stroke();cx.fillStyle='rgba(220,60,60,.3)';cx.fillRect(p.a/p.buf.duration*w,0,(p.b-p.a)/p.buf.duration*w,h);
  },
  async resultado(){let buf=this.juntar();if($('#estLimpiar',this.el).checked)buf=await this.limpiar(buf);return buf;},
  async accion(a,el){
    if(this.ocupado)return;
    if(a==='cerrar')return this.cerrar();
    if(a==='guardar')return this.guardar();
    if(a==='agregar'){const n=Grabar.lista.find(n=>n.id===$('#estExistente',this.el).value);if(n)return this.trabajo(()=>this.anadir(n.blob,n.nombre || 'Grabación'));return;}
    if(a==='escuchar')return this.trabajo(async()=>{const b=await this.resultado(),au=$('#estPrev',this.el);au.pause();au.hidden=false;au.src=this.url(this.wav(b));await au.play();this.estado('Vista previa del resultado completo.');});
    if(!el)return;const i=+el.dataset.pista,p=this.pistas[i];
    if(a==='arriba' && i>0)[this.pistas[i-1],this.pistas[i]]=[p,this.pistas[i-1]];
    else if(a==='abajo' && i<this.pistas.length-1)[this.pistas[i+1],this.pistas[i]]=[p,this.pistas[i+1]];
    else if(a==='quitar')this.pistas.splice(i,1);
    else if(a==='deshacer'){if(!p.undo.length)return;p.buf=p.undo.pop();p.a=0;p.b=p.buf.duration;}
    else if(a==='conservar' || a==='cortar'){
      if(!Number.isFinite(p.a)||!Number.isFinite(p.b)||p.a<0||p.b>p.buf.duration||p.b<=p.a){toast('Indica un inicio y un final válidos');return;}
      try{const buf=this.cortar(p.buf,p.a,p.b,a==='conservar');p.undo.push(p.buf);if(p.undo.length>5)p.undo.shift();p.buf=buf;p.a=0;p.b=buf.duration;}catch(e){toast(e.message);return;}
    }else return;
    this.modificado=true;this.pintar();this.estado('Cambio aplicado a la vista previa. Aún no se ha guardado.');
  },
  async guardar(){
    if(!this.pistas.length){toast('Añade al menos un audio');return false;}
    const modo=await popup({tit:'¿Guardar los cambios?',html:'<p>Se guardará el resultado completo como MP3. Después podrás guardarlo en Archivos, en el móvil o en la nube.</p>',botones:[{txt:'Cancelar',val:null},{txt:'Crear nuevo',val:'nuevo',cls:'btn-pri'},...(this.original?[{txt:'Sobrescribir grabación',val:'sobre'}]:[])]});
    if(!modo)return false;
    let guardado=false;
    await this.trabajo(async()=>{
      const buf=await this.resultado(),blob=await this.mp3(buf),nombre=$('#estNombre',this.el).value.trim() || 'Mi audio';
      const n={id:modo==='sobre'?this.original.id:nuevoId('g'),fecha:modo==='sobre'?this.original.fecha:Date.now(),nombre,blob,dur:buf.duration,size:blob.size,tipo:'audio/mpeg',ext:'mp3'};
      await Grabar.poner(n);this.original=n;this.modificado=false;guardado=true;Grabar.pintar();
      this.estado('MP3 guardado en la app. Pulsa «Guardar fuera de la app» para elegir destino.');
      const boton=document.createElement('button');boton.className='btn-sec';boton.textContent='⬇ Guardar fuera de la app';boton.onclick=()=>Grabar.guardarEnAparato(n.id);
      const pie=$('footer',this.el);pie.querySelector('[data-exportar]')?.remove();boton.dataset.exportar='';pie.appendChild(boton);
    });return guardado;
  },
  async cerrar(){
    if(this.ocupado)return;
    if(this.modificado){const r=await popup({tit:'Cambios del estudio',html:'<p>¿Quieres guardar los cambios antes de volver?</p>',botones:[{txt:'Seguir editando',val:null},{txt:'Salir sin guardar',val:'salir'},{txt:'Guardar…',val:'guardar',cls:'btn-pri'}]});if(!r)return;if(r==='guardar' && !await this.guardar())return;}
    $$('audio',this.el).forEach(a=>a.pause());this.liberar();this.el.remove();this.el=null;this.pistas=[];window.removeEventListener('keydown',this.escape,true);
  }
};
