/* PorHacer · copias de seguridad (exportar / importar) y espacio usado */

function blobADatos(b){ return new Promise((ok, mal) => { if(!b) return ok(null); const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => mal(r.error); r.readAsDataURL(b); }); }
// Cada operación tiene límite; una descarga lenta no bloquea indefinidamente la copia.
function esperaCopia(promesa, etapa, ms=30000){
  let tm; return Promise.race([promesa,new Promise((_,mal)=>{tm=setTimeout(()=>mal(new Error('No responde: '+etapa+'. Comprueba la conexión y vuelve a intentarlo.')),ms);})]).finally(()=>clearTimeout(tm));
}
function datosABlob(d){
  if(!d) return null;
  const [cab, b64] = d.split(','); const tipo = (cab.match(/data:([^;]+)/)||[])[1] || 'application/octet-stream';
  const bin = atob(b64), u = new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type:tipo });
}

const Copias = {
  async pintar(){
    const cont = $('#ajCopias'); if(!cont) return;
    const [rf, rv] = await Promise.all([DB.resumen('fotos'), DB.resumen('videos')]);
    const tf = rf.reduce((s,x)=>s+x.size,0), tv = rv.reduce((s,x)=>s+x.size,0);
    const est = await espacioUsado();
    let persist = false; try{ persist = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : false; }catch(e){}
    const pct = est && est.quota ? Math.min(100, est.usage/est.quota*100) : 0;
    cont.innerHTML = `
      <div class="aj-sec"><h4>Espacio</h4><div class="espacio">
        <div style="font-size:14.5px;font-weight:800">📋 ${App.tareas.length} tareas · 👥 ${App.personas.length} persona${App.personas.length===1?'':'s'}</div>
        <div style="font-size:14.5px;font-weight:800;margin-top:4px">📷 ${rf.length} fotos (${tamTxt(tf)}) · 🎬 ${rv.length} vídeos (${tamTxt(tv)})</div>
        ${est && est.quota ? `<div class="barra-prog"><i style="width:${Math.max(2,pct)}%"></i></div><p>Usado ${tamTxt(est.usage)} de ${tamTxt(est.quota)} disponibles en este navegador</p>` : ''}
        <p>${persist ? '🔒 Datos protegidos: el navegador no los borrará para hacer sitio.' : '⚠️ El navegador podría borrar datos si se queda sin espacio: haz copias de vez en cuando.'}</p>
      </div></div>
      <div class="aj-sec"><h4>Exportar copia</h4>
        <label class="check" style="margin-top:0"><input type="checkbox" id="cpFotos" checked><span class="caja"></span><span>Incluir fotos <small>${tamTxt(tf)}</small></span></label>
        <label class="check"><input type="checkbox" id="cpVideos" ${tv < 80*1024*1024 ? 'checked' : ''}><span class="caja"></span><span>Incluir vídeos <small>${tamTxt(tv)}</small></span></label>
        <button class="btn-pri btn-ancho" id="cpExportar" style="margin-top:12px">⬇️ Exportar copia</button>
        <p class="aj-ayuda" style="margin-top:8px">Se descarga un archivo <b>PorHacer_Tareas_fecha.json</b>. Guárdalo en iCloud Drive o donde quieras.${Nube.activa ? ' Con la nube activa, solo incluye las fotos y vídeos guardados en este dispositivo.' : ''}</p></div>
      <div class="aj-sec"><h4>Importar copia</h4>
        <label class="btn-sec btn-ancho" style="display:grid;place-items:center;cursor:pointer">⬆️ Elegir archivo de copia<input type="file" id="cpImportar" accept=".json,application/json" hidden></label>
        <p class="aj-ayuda" style="margin-top:8px">Podrás elegir entre <b>sustituir</b> todo lo que hay o <b>añadirlo</b> a lo que ya tienes.</p></div>
      <div class="aj-sec"><h4>Aviso importante (iPhone)</h4><p class="aj-ayuda">Si borras el icono de PorHacer de la pantalla de inicio, el iPhone puede borrar también sus datos. Antes, haz <b>Exportar</b>; después de volver a añadirla, <b>Importar</b>.</p></div>`;
    $('#cpExportar').onclick = () => this.exportar($('#cpFotos').checked, $('#cpVideos').checked);
    $('#cpImportar').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if(f) this.importar(f); };
  },

  async exportar(conFotos, conVideos){
    const b = $('#cpExportar'); b.disabled = true; b.textContent = 'Preparando copia…';
    try{
      const copia = await this.datos(conFotos, conVideos);
      const blob = new Blob([JSON.stringify(copia)], { type:'application/json' });
      descargar(blob, 'PorHacer_Tareas_' + hoyIso() + '.json');
      toast('💾 Copia exportada (' + tamTxt(blob.size) + ')');
    }catch(e){ console.error(e); popAviso('No se pudo exportar', 'Prueba sin los vídeos, que son lo que más ocupa.'); }
    b.disabled = false; b.textContent = '⬇️ Exportar copia';
  },

  // las tareas, personas, fotos, vídeos y audios, en un objeto (también lo usa la copia completa)
  async datos(conFotos, conVideos){
    const copia = { app:'PorHacer', version:VERSION, fecha:new Date().toISOString(),
      ajustes:App.ajustes, tareas:App.tareas.map(limpiaTarea), personas:App.personas, fotos:[], videos:[], audios:[] };
    if(conFotos) for(const f of await DB.todos('fotos')) copia.fotos.push({ ...f, blob:await blobADatos(f.blob), mini:await blobADatos(f.mini) });
    for(const x of await DB.todos('audios')) if(x.blob) copia.audios.push({ ...x, blob:await blobADatos(x.blob) });
    if(conVideos) for(const v of await DB.todos('videos')) copia.videos.push({ ...v, blob:await blobADatos(v.blob), poster:await blobADatos(v.poster) });
    return copia;
  },
  async meter(c, modo, usarAjustes){
    if(modo === 'sustituir'){ for(const a of ['tareas','personas','fotos','videos','audios']) await DB.vaciar(a); }
    await DB.ponerVarios('tareas', c.tareas || []);
    await DB.ponerVarios('personas', c.personas || []);
    for(const f of c.fotos || []) await DB.poner('fotos', { ...f, blob:datosABlob(f.blob), mini:datosABlob(f.mini) });
    for(const v of c.videos || []) await DB.poner('videos', { ...v, blob:datosABlob(v.blob), poster:datosABlob(v.poster) });
    for(const x of c.audios || []) await DB.poner('audios', { ...x, blob:datosABlob(x.blob) });
    if(c.ajustes && usarAjustes) App.ajustes = Object.assign(ajustesInicio(), c.ajustes, { id:'ajustes' });
    else if(c.ajustes){ for(const col of c.ajustes.columnas || []) if(!App.ajustes.columnas.some(x => x.id === col.id)) App.ajustes.columnas.push(col); }
    await guardarAjustes();
  },

  async importar(file){
    let c;
    try{ c = limpiarDato(JSON.parse(await file.text())); }catch(e){ popAviso('Archivo no válido', 'Ese archivo no es una copia de PorHacer.'); return; }
    if(!c || c.app !== 'PorHacer' || !Array.isArray(c.tareas)){ popAviso('Archivo no válido', 'Ese archivo no es una copia de PorHacer.'); return; }
    const modo = await popup({ tit:'Importar copia',
      html:`<p>La copia del <b>${new Date(c.fecha).toLocaleDateString('es-ES',{dateStyle:'long'})}</b> tiene ${c.tareas.length} tareas, ${(c.personas||[]).length} personas, ${(c.fotos||[]).length} fotos y ${(c.videos||[]).length} vídeos.</p>
        ${Nube.activa ? '<p class="aj-ayuda" style="margin-top:8px">Estás en el tablero compartido: la copia se <b>añadirá</b> (no se borra nada de lo compartido).</p>' : '<button class="opcion" data-v="sustituir">🔁 Sustituir todo lo que hay por la copia</button>'}
        <button class="opcion" data-v="anadir">➕ Añadirla a lo que ya tengo</button>`,
      botones:[{txt:'Cancelar', val:null}],
      alAbrir:(cx, fin) => $$('.opcion', cx).forEach(o => o.onclick = () => fin(o.dataset.v)) });
    if(!modo) return;
    try{
      if(modo === 'sustituir'){ for(const a of ['tareas','personas','fotos','videos','audios']) await DB.vaciar(a); }
      await DB.ponerVarios('tareas', c.tareas);
      await DB.ponerVarios('personas', c.personas || []);
      for(const f of c.fotos || []) await DB.poner('fotos', { ...f, blob:datosABlob(f.blob), mini:datosABlob(f.mini) });
      for(const v of c.videos || []) await DB.poner('videos', { ...v, blob:datosABlob(v.blob), poster:datosABlob(v.poster) });
      for(const x of c.audios || []) await DB.poner('audios', { ...x, blob:datosABlob(x.blob) });
      if(c.ajustes && (modo === 'sustituir' || await popConfirmar('Configuración', '¿Quieres usar también los colores y columnas de la copia?', 'Sí, usarlos'))){
        App.ajustes = Object.assign(ajustesInicio(), c.ajustes, { id:'ajustes' });
      } else if(c.ajustes){
        // añadir columnas que falten para que ninguna tarea quede perdida
        for(const col of c.ajustes.columnas || []) if(!App.ajustes.columnas.some(x => x.id === col.id)) App.ajustes.columnas.push(col);
      }
      await guardarAjustes(); aplicarTema(App.ajustes.colores);
      [App.tareas, App.personas] = await Promise.all([DB.todos('tareas'), DB.todos('personas')]);
      await contarMedia(); pintarTodo(); this.pintar();
      toast('✅ Copia importada');
    }catch(e){ console.error(e); popAviso('Error al importar', 'No se pudo importar del todo: ' + e.message); }
  }
};

/* ---------- Copia completa: TODO lo de la app en un solo archivo ----------
   Tareas (con fotos, vídeos y audios), Agenda, Tickets, Sitios, Listas, Grabaciones,
   Escritos, Notas secretas (siguen cifradas), webs personales y la configuración. */
const Completa = {
  // en el aparato, cosas que no son datos sino «por dónde iba» (no se copian)
  NO: /^ph3-(mio-subido-|listas-subidas-|cache-tid|tablero$|tab-nombre|avisos-sonados|donde-|es-pista)/,
  async grabaciones(){ return (await Grabar.tx('readonly', st => st.getAll())) || []; },
  // Prepara la copia completa (sin descargarla) y devuelve el archivo listo
  async construir(conVideos, avance){
      avance=avance||(()=>{});
      Escribir.guardarYa();
      if(typeof Celdas!=='undefined' && Celdas.D) Celdas.guardar();
      const c={app:'PorHacer3',tipo:'copia-completa',version:VERSION,fecha:new Date().toISOString()};
      avance('Tareas de este aparato…');
      c.tareas=await esperaCopia(Copias.datos(true,conVideos),'tareas del aparato',120000);
      if(Nube.user){
        if(Nube.listos<2) throw new Error('La cuenta todavía está conectando. Espera a que termine y vuelve a hacer la copia.');
        c.tableros=await Nube.copiaTableros(conVideos,avance); c.cuenta=Nube.email();
      }
      avance('Agenda, tickets, gastos, sitios y listas…');
      c.mio=await esperaCopia(Mio.exportar({agenda:true,tickets:true,gastos:true,sitios:true,listas:true}),'datos personales');
      avance('Grabaciones…'); c.grabaciones=[];
      for(const g of await esperaCopia(this.grabaciones(),'grabaciones')) c.grabaciones.push({...g,blob:await esperaCopia(blobADatos(g.blob),'audio')});
      avance('Notas secretas…'); c.bloc=await esperaCopia(Bloc.leerPaq(true),'notas secretas');
      c.ls={};
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i); if(!/^ph3/.test(k) || this.NO.test(k)) continue;
        let v=localStorage.getItem(k);
        if(/^ph3-web[12]$/.test(k)){const w=JSON.parse(v||'{}');delete w.clave;v=JSON.stringify(w);}
        c.ls[k]=v;
      }
      avance('Preparando archivo…'); await new Promise(r=>setTimeout(r,0));
      const partes=['{'];
      for(const [k,v] of Object.entries(c)){if(v===undefined)continue;if(partes.length>1)partes.push(',');partes.push(JSON.stringify(k)+':',JSON.stringify(v));await new Promise(r=>setTimeout(r,0));}
      partes.push('}');
      return new Blob(partes,{type:'application/json'});
  },
  // Cifra una copia completa con una contraseña (AES-GCM, como las Notas secretas)
  async cifrarBlob(blob){
    const ok=(a,b)=>!a?'Escribe una contraseña':a.length<8?'Pon al menos 8 caracteres':a!==b?'Las dos contraseñas no son iguales':'';
    const v=await Bloc.pedir('🔒 Copia con contraseña','La copia irá <b>cifrada</b>: sin esta contraseña nadie la puede abrir (tampoco tú: no la olvides).',[['ccP1','Contraseña (8 o más)'],['ccP2','Repítela']],async([a,b])=>ok(a,b));
    if(!v) return null;
    toast('🔒 Cifrando la copia…',null,null,30000);
    const sal=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12)), clave=await Bloc.derivar(v[0],sal);
    const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},clave,await blob.arrayBuffer());
    return new Blob([JSON.stringify({app:'PorHacer3',tipo:'copia-completa-cifrada',v:1,fecha:new Date().toISOString(),sal:Bloc.b64(sal),iv:Bloc.b64(iv),ct:Bloc.b64(ct)})],{type:'application/json'});
  },
  async descifrarTexto(paq){
    let txt=null;
    const v=await Bloc.pedir('🔒 Copia cifrada','Esta copia está cifrada. Escribe la contraseña <b>con la que se hizo</b>.',[['ccP','Contraseña de la copia']],async([p])=>{
      if(!p) return 'Escribe la contraseña';
      try{ const clave=await Bloc.derivar(p,Bloc.deb64(paq.sal)); const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:Bloc.deb64(paq.iv)},clave,Bloc.deb64(paq.ct)); txt=new TextDecoder().decode(pt); return ''; }catch(e){ return 'Contraseña incorrecta'; } });
    return v ? txt : null;
  },
  async exportar(conVideos, boton){
    if(this.ocupada) return; this.ocupada=true;
    const txt0=boton && boton.textContent;
    const avance=t=>{if(boton) boton.textContent='⏳ '+t;};
    if(boton) boton.disabled=true;
    try{
      let blob=await this.construir(conVideos,avance), nombre='PorHacer_Todo_'+hoyIso()+'.json';
      const r=await popup({tit:'📦 Copia preparada',html:'<p>'+esc(tamTxt(blob.size))+' · Pulsa Guardar copia para descargarla o guardarla en Archivos.</p><p class="aj-ayuda">Las contraseñas de las webs personales no se incluyen. Las notas secretas conservan su cifrado. Con «🔒 Con contraseña» toda la copia va cifrada.</p>',botones:[{txt:'Cerrar',val:false},{txt:'🔒 Con contraseña',val:'cifrar'},{txt:'💾 Guardar copia',cls:'btn-pri',val:()=>{descargar(blob,nombre);return true;}}]});
      if(r==='cifrar'){
        const cif=await this.cifrarBlob(blob); blob=null;
        if(cif) await popup({tit:'🔒 Copia cifrada preparada',html:'<p>'+esc(tamTxt(cif.size))+' · Pulsa Guardar copia. Para recuperarla te pedirá la contraseña.</p>',botones:[{txt:'Cerrar',val:false},{txt:'💾 Guardar copia',cls:'btn-pri',val:()=>{descargar(cif,'PorHacer_Todo_cifrada_'+hoyIso()+'.json');return true;}}]});
      }
    }catch(e){console.error(e);await popAviso('No se pudo completar la copia',e.message||String(e));}
    finally{this.ocupada=false;if(boton){boton.disabled=false;boton.textContent=txt0;}}
  },
  resumen(c){
    const t = c.tareas || {}, m = c.mio || {}, ls = c.ls || {};
    let nEsc = 0; try{ nEsc = JSON.parse(ls['ph3-escritos'] || '[]').filter(d => !Escribir.vacio(d)).length; }catch(e){}
    const webs = ['ph3-web1', 'ph3-web2'].filter(k => { try{ return !!JSON.parse(ls[k] || '{}').url; }catch(e){ return false; } }).length;
    const notas = (m.agenda || []).reduce((n, d) => n + (d.items || []).length, 0);
    const tb = c.tableros || [], tbFotos = tb.reduce((n, b) => n + (b.media || []).filter(x => x.tipo === 'fotos').length, 0), tbVid = tb.reduce((n, b) => n + (b.media || []).filter(x => x.tipo === 'videos').length, 0);
    return [['📋 Tableros', tb.length ? tb.length + ' (' + tb.map(b => esc(b.nombre)).join(', ') + ')' : 0], ['✅ Tareas', tb.length ? tb.reduce((n, b) => n + (b.tareas || []).length, 0) : (t.tareas || []).length],
      ['📷 Fotos', (tb.length ? tbFotos : (t.fotos || []).length) + Object.keys(m.fotos || {}).length], ['🎬 Vídeos', tb.length ? tbVid : (t.videos || []).length],
      ['📒 Notas de la agenda', notas], ['🧾 Tickets', (m.tickets || []).filter(t => !t.tipo).length], ['💶 Notas de Gastos', (m.gastos || []).concat(m.tickets || []).filter(t => t.tipo === 'gasto').length], ['🏡 Sitios', (m.sitios || []).length], ['📝 Listas', (m.listas || []).length],
      ['🎙️ Grabaciones', (c.grabaciones || []).length], ['📄 Escritos', nEsc], ['🌐 Webs personales', webs], ['🔒 Notas secretas', c.bloc ? 'sí' : 0]].filter(([, n]) => n);
  },
  async importar(f){
    let c; try{ c = JSON.parse(await f.text()); }catch(e){ popAviso('Importar', 'Este archivo no es una copia válida.'); return; }
    if(c && c.tipo === 'copia-completa-cifrada'){
      const txt = await this.descifrarTexto(c); if(!txt) return;
      try{ c = JSON.parse(txt); }catch(e){ popAviso('Importar', 'La copia cifrada está dañada.'); return; }
    }
    c = limpiarDato(c);
    if(!c || c.tipo !== 'copia-completa'){ popAviso('Importar', 'Este archivo no es una copia completa de PorHacer3 (PorHacer_Todo_….json). Las otras copias se importan en su apartado, más abajo.'); return; }
    const lista = this.resumen(c).map(([t, n]) => `<li>${t}${n === 'sí' ? '' : ' · <b>' + n + '</b>'}</li>`).join('');
    const modo = await popup({ tit:'📦 Restaurar copia completa', html:`<p>Copia del <b>${new Date(c.fecha).toLocaleString('es-ES', { dateStyle:'long', timeStyle:'short' })}</b>:</p><ul class="cc-lista">${lista || '<li>(vacía)</li>'}</ul>
        <button class="opcion opc2" data-v="cambiar">♻️ Dejarlo todo como en la copia<small>Lo que tienes ahora se cambia por lo de la copia</small></button>
        <button class="opcion opc2" data-v="juntar">➕ Juntarla con lo que ya tengo<small>No se borra nada; se añade lo que falta</small></button>`,
      botones:[{ txt:'Cancelar', val:null }], alAbrir:(cx, fin) => $$('[data-v]', cx).forEach(b => b.onclick = () => fin(b.dataset.v)) });
    if(!modo) return;
    if(modo === 'cambiar' && !await popConfirmar('¿Dejarlo todo como en la copia?', 'Las tareas de tus tableros, la agenda, los tickets, los sitios, las grabaciones y los escritos que tienes ahora se cambiarán por los de la copia. (En los tableros que te han compartido solo se añade, no se borra nada.) Antes se prepara una copia de cómo está todo ahora, para poder volver atrás.', 'Sí, restaurar')) return;
    // V19 · «todo o nada»: antes de cambiar nada, copia de cómo está todo ahora (sin vídeos: los vídeos nunca se borran al restaurar)
    let antes = null;
    if(modo === 'cambiar') try{ toast('⏳ Preparando una copia de cómo está todo ahora…', null, null, 60000); antes = await this.construir(false); }
    catch(e){ console.error(e); popAviso('No se ha restaurado nada', 'No se pudo preparar la copia de seguridad previa (' + (e.message || String(e)) + '). Por seguridad no se ha cambiado nada.'); return; }
    const nomAntes = 'PorHacer_AntesDeRestaurar_' + hoyIso() + '.json';
    if(modo === 'cambiar'){
      const sigue = await popup({ tit:'🛟 Copia de ahora preparada', html:'<p>Guarda esta copia (' + esc(tamTxt(antes.size)) + ') antes de restaurar. Si algo sale mal, impórtala para volver a como estaba todo.</p>',
        botones:[{ txt:'Cancelar', val:false }, { txt:'💾 Guardar y restaurar', cls:'btn-pri', val:() => { descargar(antes, nomAntes); return true; } }] });
      if(!sigue) return;
    }
    // lo que se guarda en el aparato se puede deshacer al momento si algo falla
    const lsAntes = {}; for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(/^ph3[-_]/.test(k)) lsAntes[k] = localStorage.getItem(k); }
    toast('⏳ Restaurando la copia… no cierres la app', null, null, 60000);
    const fallos = [];
    // 1. Tableros y tareas
    if(c.tableros && c.tableros.length && Nube.user){
      for(const b of c.tableros){ try{ toast('⏳ Restaurando el tablero «' + b.nombre + '»…', null, null, 30000); await Nube.restaurarTablero(b, modo); }catch(e){ console.warn(e); fallos.push('tablero «' + b.nombre + '»'); } }
      if(modo === 'cambiar' && c.tareas && c.tareas.ajustes){ try{ const col = App.ajustes.columnas; App.ajustes = Object.assign(ajustesInicio(), c.tareas.ajustes, { id:'ajustes', columnas:col }); await guardarAjustes(); }catch(e){} }
    } else {
      if(c.tableros && c.tableros.length && !Nube.user) fallos.push('los tableros (entra antes con tu cuenta y vuelve a importar)');
      try{ if(c.tareas) await Copias.meter(c.tareas, modo === 'cambiar' && !Nube.activa ? 'sustituir' : 'anadir', modo === 'cambiar'); }catch(e){ console.warn(e); fallos.push('tareas'); }
    }
    // 2. Agenda, tickets, sitios y listas
    try{ if(c.mio) await Mio.importar(c.mio, modo); }catch(e){ console.warn(e); fallos.push('agenda, tickets, sitios o listas'); }
    // 3. Grabaciones
    try{
      if(modo === 'cambiar') for(const g of await this.grabaciones()) await Grabar.tx('readwrite', st => st.delete(g.id));
      for(const g of c.grabaciones || []) await Grabar.tx('readwrite', st => st.put({ ...g, blob:datosABlob(g.blob) }));
    }catch(e){ console.warn(e); fallos.push('grabaciones'); }
    // 4. Notas secretas (siguen cifradas con su contraseña)
    try{ if(c.bloc){ const ya = await Bloc.leerPaq(); if(!ya || modo === 'cambiar') await Bloc.ponerPaq(c.bloc); } }catch(e){ console.warn(e); fallos.push('notas secretas'); }
    // 5. Escritos, webs y lo demás que se guarda en el aparato
    try{
      for(const [k, v] of Object.entries(c.ls || {})){
        if(!/^ph3[-_]/.test(k) || this.NO.test(k) || typeof v !== 'string') continue;
        if(k === 'ph3-escritos' && modo === 'juntar'){
          const mios = JSON.parse(localStorage.getItem(k) || '[]'), ids = new Set(mios.map(d => d.id));
          for(const d of JSON.parse(v)) if(!ids.has(d.id) && !Escribir.vacio(d)) mios.push(d);
          localStorage.setItem(k, JSON.stringify(mios)); continue;
        }
        if(modo === 'juntar' && localStorage.getItem(k) != null && !/^ph3-web[12]$/.test(k)) continue;
        if(modo === 'juntar' && /^ph3-web[12]$/.test(k)){ let ya = {}; try{ ya = JSON.parse(localStorage.getItem(k) || '{}'); }catch(e){} if(ya.url) continue; }
        localStorage.setItem(k, v);
      }
    }catch(e){ console.warn(e); fallos.push('escritos y webs');
      try{ for(const k of Object.keys(localStorage)) if(/^ph3[-_]/.test(k) && !(k in lsAntes)) localStorage.removeItem(k); for(const [k, v] of Object.entries(lsAntes)) localStorage.setItem(k, v); }catch(e2){} }
    if(fallos.length){
      const r = await popup({ tit:'Copia restaurada… casi', html:'<p>No se ha podido restaurar: ' + esc(fallos.join(', ')) + '. Lo demás sí.</p>' + (modo === 'cambiar' ? '<p>Para volver a como estaba todo antes, importa la copia <b>' + nomAntes + '</b> que has guardado.</p>' : '<p>No se ha borrado nada de lo que tenías.</p>'),
        botones:[{ txt:'Cerrar', val:false }] });
    }
    else { toast('✅ Copia restaurada. La app se vuelve a abrir…', null, null, 4000); setTimeout(() => location.reload(), 1600); }
  }
};

/* ---------- Copia de la lista «Gastos» (de Tickets), cifrada con una contraseña como las Notas secretas ---------- */
const CopiaGastos = {
  async exportar(){
    if(!await Gastos.desbloquear()) return;
    const notas = Gastos._items(); if(!notas.filter(x => x.tipo === 'gasto').length){ popAviso('Copia de Gastos', 'Todavía no hay notas en Gastos.'); return; }
    const ok = (a, b) => !a ? 'Escribe una contraseña' : a.length < 8 ? 'Pon al menos 8 caracteres' : a !== b ? 'Las dos contraseñas no son iguales' : '';
    const v = await Bloc.pedir('🔒 Contraseña de la copia', 'La copia de <b>' + esc(Gastos.nombre()) + '</b> irá <b>cifrada</b>: sin esta contraseña nadie la puede abrir. Escríbela dos veces y no la olvides.',
      [['cgP1', 'Contraseña'], ['cgP2', 'Repítela']], async ([a, b]) => ok(a, b));
    if(!v) return;
    toast('🔒 Cifrando la copia…', null, null, 15000);
    try{
      const fotos = {}; notas.forEach(x => (x.fotos || []).forEach(f => { const fo = Mio.uno('fotos', f), img = Gastos.fotoSrc(f); if(fo && img) fotos[f] = { img, t:fo.t, de:'gastos' }; }));
      const sal = crypto.getRandomValues(new Uint8Array(16)), clave = await Bloc.derivar(v[0], sal);
      const paq = await Bloc.cifrar({ gastos:notas, fotos, nombre:Gastos.nombre(), fecha:new Date().toISOString(), version:VERSION }, clave, sal);
      paq.app = 'PorHacer3-gastos';
      const blob = new Blob([JSON.stringify(paq)], { type:'application/json' });
      descargar(blob, 'PorHacer_Gastos_' + hoyIso() + '.json');
      toast('💾 Copia de ' + Gastos.nombre() + ' guardada (cifrada, ' + tamTxt(blob.size) + ')', null, null, 4000);
    }catch(e){ console.warn(e); popAviso('Copia de Gastos', 'No se ha podido hacer la copia.'); }
  },
  async importar(f){
    let paq; try{ paq = JSON.parse(await f.text()); }catch(e){ popAviso('Importar', 'Este archivo no es una copia válida.'); return; }
    if(!paq || paq.app !== 'PorHacer3-gastos'){ popAviso('Importar', 'Este archivo no es una copia cifrada de Gastos (PorHacer_Gastos_….json).'); return; }
    let r = null;
    const v = await Bloc.pedir('🔒 Abrir la copia', 'Escribe la contraseña <b>con la que se hizo</b> esta copia.', [['cgP', 'Contraseña de la copia']], async ([p]) => {
      if(!p) return 'Escribe la contraseña';
      try{ r = await Bloc.descifrar(paq, p); return ''; }catch(e){ return 'Contraseña incorrecta'; } });
    if(!v || !r) return;
    const o = r.obj, n = (o.gastos || []).filter(x => x.tipo === 'gasto').length;
    const modo = await popup({ tit:'💶 Importar ' + n + (n === 1 ? ' nota' : ' notas'), html:`<p>Copia de «${esc(o.nombre || 'Gastos')}» del ${new Date(o.fecha).toLocaleDateString('es-ES', { dateStyle:'long' })}.</p>
        <button class="opcion opc2" data-v="cambiar">♻️ Dejarlo como en la copia<small>Las notas de Gastos que tienes ahora se cambian por las de la copia</small></button>
        <button class="opcion opc2" data-v="juntar">➕ Juntarla con lo que tengo<small>No se borra nada; se añade lo que falta</small></button>`,
      botones:[{ txt:'Cancelar', val:null }], alAbrir:(c, fin) => $$('[data-v]', c).forEach(b => b.onclick = () => fin(b.dataset.v)) });
    if(!modo) return;
    if(!await Gastos.desbloquear()) return;
    try{
      if(modo === 'cambiar') for(const x of Gastos._items()) await Gastos._quitar(x.id);
      for(const [id, fo] of Object.entries(o.fotos || {})) if(!Mio.uno('fotos', id) && fo && fo.img) await Gastos.ponerFotoCon(id, fo.img, fo.t);
      for(const x of o.gastos || []){ if(!x || !x.id || (x.tipo !== 'gasto' && x.tipo !== 'gastos-meta')) continue; const ya = Gastos._uno(x.id);
        if(x.tipo === 'gastos-meta' && ya && modo === 'juntar'){ const t = [...(ya.tabs || [])]; (x.tabs || []).forEach(tb => { if(!t.some(y => y.id === tb.id)) t.push(tb); }); await Gastos._poner(x.id, { ...ya, tabs:t }); continue; }
        if(!ya || modo === 'cambiar' || (x.cambiado || 0) > (ya.cambiado || 0)) await Gastos._poner(x.id, x); }
      Gastos.pintarBoton(); if(Gastos.abierto()) Gastos.pintar();
      toast('✅ ' + n + (n === 1 ? ' nota' : ' notas') + ' de Gastos importada' + (n === 1 ? '' : 's'));
    }catch(e){ console.warn(e); popAviso('Importar', 'No se ha podido importar: ' + e.message); }
  }
};
