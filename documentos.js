/* V18 · Guardar, Guardar como, cerrar sin hoja e historial de documentos. */
const Documentos = {
  sesiones:new Map(),
  tipo(c){return c===Celdas?'ce':'es';},
  copia(v){return v == null ? v : JSON.parse(JSON.stringify(v));},
  clave(c){return this.tipo(c)+':'+c.id;},
  estado(c){
    if(!c.id)return null;
    if(c===Celdas)return this.copia(c.L);
    const d=c.actual();if(!d)return null;
    return {...d,titulo:$('#esTitulo').value.trim(),html:c.htmlLimpio(),figs:this.copia(c.figs||[]),hf:this.copia(c.hf||null),orient:c.orient||'v',tabs:(c.tabs||[]).slice()};
  },
  firma(d){if(!d)return '';const o={...d};delete o.cambiado;delete o.act;return JSON.stringify(o);},
  sesion(c){return this.sesiones.get(this.clave(c));},
  preparar(c,nuevo=false){
    const d=this.estado(c);if(!d)return;
    let s=this.sesion(c);
    if(!s){s={base:nuevo?null:this.copia(d),pasos:[this.copia(d)],indice:0,destino:'app',handle:null};this.sesiones.set(this.clave(c),s);}
    this.mostrar(c,true);this.rotulo(c);
  },
  registrar(c){
    if(!c.id || c._restaurando)return;
    let s=this.sesion(c);if(!s){this.preparar(c);return;}
    const d=this.estado(c);if(!d)return;
    if(this.firma(d)!==this.firma(s.pasos[s.indice])){
      s.pasos.splice(s.indice+1);s.pasos.push(this.copia(d));if(s.pasos.length>100)s.pasos.shift();s.indice=s.pasos.length-1;
    }
    this.rotulo(c);
  },
  cambiado(c){const s=this.sesion(c);return s && this.firma(this.estado(c))!==this.firma(s.base);},
  rotulo(c){
    const p=this.tipo(c),el=$('#'+p+'Estado');if(el)el.textContent=!c.id?'Sin documento':this.cambiado(c)?'✎ Cambios · borrador automático':'✓ Guardado';
    const s=this.sesion(c),b=p==='ce'?$('#ceAtras'):$('#esBarra [data-c=undo]');if(b)b.disabled=!s || s.indice===0;
    if(p==='es')$('#esBarra [data-c=redo]').disabled=!s || s.indice>=s.pasos.length-1;
  },
  restaurar(c,d){
    c._restaurando=true;
    try{
      if(c===Celdas){c.L=this.copia(d);c.id=d.id;c.D=c.L.hojas[c.L.act||0];c.sel={c:0,r:0};c.fin={c:0,r:0};c.ed=null;c._cache=null;CeFig.figs=c.D.figs||[];CeFig.sel=null;$('#ceTitulo').value=c.L.titulo||'';c.guardar();c.pintar();c.pintarPest();}
      else{c.id=d.id;$('#esTexto').innerHTML=d.html||'';$('#esTitulo').value=d.titulo||'';c.figs=this.copia(d.figs||[]);c.hf=this.copia(d.hf||null);c.orient=d.orient||'v';c.tabs=(d.tabs||[]).slice();c.sel=null;c._rango=null;c.pintarFigs();c.guardarYa();c.paginar();c.contar();}
    }finally{c._restaurando=false;}this.rotulo(c);
  },
  atras(c,rehacer=false){
    if(!c.id)return;
    if(c===Celdas && c.ed)c.aceptar();
    this.registrar(c);const s=this.sesion(c),i=s.indice+(rehacer?1:-1);
    if(i<0||i>=s.pasos.length){toast('No hay más pasos que '+(rehacer?'rehacer':'deshacer'));return;}
    s.indice=i;this.restaurar(c,s.pasos[i]);
  },
  mostrar(c,abierto){
    const p=this.tipo(c),v=$('#'+(p==='ce'?'vCeldas':'vEscribir'));v.classList.toggle('sin-documento',!abierto);
    $('#'+p+'Titulo').disabled=!abierto;
    ['Guardar','Salir'].forEach(k=>$('#'+p+k).disabled=!abierto);
    const exportar=$('#'+p+(p==='ce'?'Sacar':'Docx'));exportar.disabled=!abierto;
    if(p==='es')$('#esMic').disabled=!abierto;
  },
  async cerrar(c){
    if(!c.id)return;
    if(c===Celdas && c.ed)c.aceptar();
    if(c===Escribir && Voz.activo)Voz.parar();
    clearTimeout(c._t);clearTimeout(c._tt);clearTimeout(c._tp);clearTimeout(c._tpn);
    this.registrar(c);const s=this.sesion(c);
    if(this.cambiado(c)){
      const r=await popup({tit:'¿Guardar antes de cerrar?',html:'<p>Guardar conserva los cambios. Descartar vuelve a la última versión guardada.</p>',botones:[{txt:'Cancelar',val:null},{txt:'Descartar cambios',val:'descartar'},{txt:'Guardar',val:'guardar',cls:'btn-pri'}]});
      if(!r)return;
      if(r==='guardar' && !await this.guardar(c))return;
      if(r==='descartar'){
        const l=c.lista().filter(d=>d.id!==c.id);if(s.base)l.push(this.copia(s.base));try{c.ponerLista(l);}catch(e){popAviso('No se pudo cerrar', 'No se pudieron descartar los cambios. El documento sigue abierto.');return;}this.sesiones.delete(this.clave(c));
      }
    }
    c._cerrado=true;c.id=null;
    if(c===Celdas){c.L=null;c.D=null;c.ed=null;CeFig.figs=[];CeFig.sel=null;$('#ceTabla').innerHTML='';$('#cePest').innerHTML='';}
    else{c.figs=[];c.sel=null;c._rango=null;$('#esTexto').innerHTML='';}
    $('#'+this.tipo(c)+'Titulo').value='';this.mostrar(c,false);this.rotulo(c);
  },
  menu(c){
    if(!c.id)return;const p=popMio(`<h3 class="mp-h">💾 Documento</h3><button class="mp-op" data-g="normal"><span><b>Guardar</b><small>Actualizar el documento abierto</small></span></button><button class="mp-op" data-g="como"><span><b>Guardar como…</b><small>Otro nombre, una copia o un destino diferente</small></span></button><div class="mp-fila"><button class="mp-b" data-x>Cancelar</button></div>`);
    p.onclick=e=>{const b=e.target.closest('button');if(!b)return;cerrarPopMio();if(b.dataset.g)this.guardar(c,b.dataset.g==='como');};
  },
  async guardar(c,como=false,forzarArchivo=false){
    if(!c.id || c._guardandoDoc)return false;c._guardandoDoc=true;
    try{
      if(c===Celdas && c.ed)c.aceptar();if(c===Escribir && Voz.activo)Voz.parar();
      this.registrar(c);let s=this.sesion(c),d=this.estado(c);const ext=c===Celdas?'xlsx':'docx';
      let nom=d.titulo|| (c===Celdas?'Mi hoja':'Mi escrito'),destino=forzarArchivo?'archivo':s.destino;
      if(como || !s.base || forzarArchivo){
        const r=await popup({tit:como?'Guardar como…':'Guardar documento',html:`<label class="lbl">Nombre<input id="docNombre" maxlength="80" value="${esc(nom)}"></label><label class="lbl">Dónde<select id="docDestino"><option value="app" ${destino==='app'?'selected':''}>En la app (Mis ${c===Celdas?'hojas':'escritos'})</option><option value="archivo" ${destino==='archivo'?'selected':''}>Archivo .${ext} · elegir ubicación</option></select></label><p class="aj-ayuda">En iPhone, «Guardar en Archivos» permite elegir iCloud Drive o En mi iPhone. Para sustituir un archivo, elige el mismo nombre y confirma en Archivos.</p>`,botones:[{txt:'Cancelar',val:null},{txt:'Guardar',cls:'btn-pri',val:()=>({nom:$('#docNombre').value.trim(),destino:$('#docDestino').value})}]});
        if(!r)return false;nom=r.nom||nom;destino=r.destino;
      }
      nom=nom.replace(/[\\/:*?"<>|]/g,'').replace(/\.(docx|xlsx)$/i,'').trim()||'Documento';
      let handle=(!como && !forzarArchivo)?s.handle:null;
      if(destino==='archivo' && window.showSaveFilePicker && !handle){handle=await showSaveFilePicker({suggestedName:nom+'.'+ext,types:[{description:ext==='xlsx'?'Hoja de Excel':'Documento Word',accept:{[ext==='xlsx'?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:['.'+ext]}}]});}
      if(destino==='archivo'){
        const blob=c===Celdas?await c.xlsx(true):new Blob([DocxSimple.crear(nom,$('#esTexto'),c.figs,$('#esPapel'),c.hf,c.orient,c.tabs)],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
        if(handle){const w=await handle.createWritable();await w.write(blob);await w.close();}
        else{
          const file=new File([blob],nom+'.'+ext,{type:blob.type});
          if(navigator.canShare?.({files:[file]}) && matchMedia('(pointer:coarse)').matches)await navigator.share({files:[file]});
          else descargar(blob,file.name);
        }
      }
      // Guardar como conserva la versión anterior de la app y abre una copia independiente.
      if(como){
        const viejo=c.id,original=s.base,lista=c.lista().filter(x=>x.id!==viejo);
        if(original)lista.push(this.copia(original));else lista.push(this.copia(d));
        d=this.copia(d);d.id=nuevoId(c===Celdas?'h':'es');d.creado=Date.now();d.titulo=nom;lista.push(d);c.ponerLista(lista);c.id=d.id;
        if(c===Celdas){c.L=d;c.D=d.hojas[d.act||0];}
        this.preparar(c);s=this.sesion(c);
      }
      $('#'+this.tipo(c)+'Titulo').value=nom;if(c===Celdas){c.L.titulo=nom;c.guardar();}else c.guardarYa();
      s.base=this.copia(this.estado(c));s.destino=destino;s.handle=handle;this.registrar(c);this.rotulo(c);toast('💾 «'+nom+'» guardado');return true;
    }catch(e){if(e.name!=='AbortError')popAviso('No se pudo guardar',e.message||'Vuelve a intentarlo. El documento sigue abierto.');return false;}
    finally{c._guardandoDoc=false;}
  },
  iniciar(c){
    const p=this.tipo(c),v=$('#'+(p==='ce'?'vCeldas':'vEscribir'));
    const caja=document.createElement('div');caja.className='doc-vacio';caja.innerHTML=`<b>No hay ningún documento abierto</b><p>Crea uno nuevo o abre uno guardado.</p><button class="btn-pri" data-nuevo>＋ Nuevo documento</button><button class="btn-sec" data-mis>📂 Mis ${p==='ce'?'hojas':'escritos'}</button><button class="btn-sec" data-archivo>📂 Abrir archivo</button>`;v.appendChild(caja);
    $('[data-nuevo]',caja).onclick=()=>{if(p==='ce'){c.nueva();c.cargar();}else c.nuevo();};
    $('[data-mis]',caja).onclick=()=>p==='ce'?c.misHojas():c.misEscritos();$('[data-archivo]',caja).onclick=()=>c.elegirArchivo();
    $('#'+p+'Salir').onclick=()=>this.cerrar(c);$('#'+p+'Guardar').onclick=()=>this.menu(c);
    if(p==='es'){$('#esDocx').innerHTML='📤 Exportar ▾';$('#esDocx').setAttribute('aria-label','Exportar o imprimir');}
    else $('#ceSacar').innerHTML='📤 Archivos ▾';
    document.addEventListener('keydown',e=>{if(!c.activa() || !c.id)return;if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z' && !$('#popup.abierto') && !$('#mioPop')){e.preventDefault();e.stopImmediatePropagation();this.atras(c,e.shiftKey);}},true);
    if(p==='es')$('#esTexto').addEventListener('beforeinput',e=>{if(e.inputType==='historyUndo'||e.inputType==='historyRedo'){e.preventDefault();this.atras(c,e.inputType==='historyRedo');}});
  }
};
for(const c of [Celdas,Escribir]){
  const load=c.cargar,open=c.abrir,start=c.iniciar,save=c===Celdas?c.guardar:c.guardarYa,create=c===Celdas?c.nueva:c.nuevo,active=c.activa;
  c.cargar=function(){this._cerrado=false;const r=load.apply(this,arguments);Documentos.preparar(this);return r;};
  c.abrir=function(){if(this._cerrado){soloVista(this===Celdas?'vCeldas':'vEscribir');Documentos.mostrar(this,false);return;}return open.apply(this,arguments);};
  c.activa=function(){return !this._cerrado && active.apply(this,arguments);};
  c[c===Celdas?'guardar':'guardarYa']=function(){const r=save.apply(this,arguments);Documentos.registrar(this);return r;};
  c[c===Celdas?'nueva':'nuevo']=function(){this._cerrado=false;const r=create.apply(this,arguments);Documentos.preparar(this,true);const s=Documentos.sesion(this);if(s)s.base=null;Documentos.rotulo(this);return r;};
  c.iniciar=function(){start.apply(this,arguments);Documentos.iniciar(this);};
}
Celdas.copia=function(){}; // el historial captura cada cambio guardado, incluyendo todas las pestañas y figuras
Celdas.atras=function(){Documentos.atras(this);};
const cambioEscrito=Escribir.cambio;
Escribir.cambio=function(){cambioEscrito.call(this);Documentos.registrar(this);};
Escribir.docx=function(){return Documentos.guardar(this,false,true);};
