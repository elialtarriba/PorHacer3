/* V18 · objetos editables, gestos y barras ordenables. */
const Edicion = {
  ordenarBarra(B,clave){
    const botones=()=>Array.from(B.children).filter(b=>b.tagName==='BUTTON'),id=b=>b.id||'c:'+b.dataset.c;
    let orden=[];try{orden=JSON.parse(lsGet(clave)||'[]');}catch(e){}
    const mapa=new Map(botones().map(b=>[id(b),b]));orden.forEach(k=>{if(mapa.has(k))B.appendChild(mapa.get(k));});
    let d=null,frame=null,timer=null;
    const mover=()=>{
      if(!d?.ordenar)return;const r=B.getBoundingClientRect();
      if(d.x<r.left+30)B.scrollLeft-=8;else if(d.x>r.right-30)B.scrollLeft+=8;
      d.antes=botones().filter(b=>b!==d.b).find(b=>{const q=b.getBoundingClientRect();return d.x<q.left+q.width/2;})||null;
      botones().forEach(b=>b.classList.toggle('destino-herramienta',b===d.antes));
      frame=requestAnimationFrame(mover);
    };
    const inicio=(target,x,y,pid)=>{
      if(d)return;const b=target.closest('button');if(!b||b.parentElement!==B)return;
      d={b,x,x0:x,y0:y,lx:x,id:pid,pan:false,ordenar:false};
      // El desplazamiento lo controla este gesto; no compite con deslizarLado.
      B.classList.add('arrastrando');
      timer=setTimeout(()=>{if(!d||d.pan)return;d.ordenar=true;d.b.classList.add('moviendo');toast('Ahora arrastra el botón para cambiarlo de sitio');mover();},450);
    };
    const movimiento=(x,y,pid,e)=>{
      if(!d||d.id!==pid)return;d.x=x;
      if(!d.ordenar && Math.hypot(x-d.x0,y-d.y0)>6){d.pan=true;clearTimeout(timer);}
      if(d.pan)B.scrollLeft-=x-d.lx;d.lx=x;
      if((d.pan||d.ordenar)&&e.cancelable)e.preventDefault();
    };
    const fin=(pid,cancelar=false)=>{
      if(!d||d.id!==pid)return;clearTimeout(timer);cancelAnimationFrame(frame);const a=d;d=null;
      if(a.ordenar&&!cancelar){if(a.antes)B.insertBefore(a.b,a.antes);else B.appendChild(a.b);lsSet(clave,JSON.stringify(botones().map(id)));}
      if(a.pan||a.ordenar)B._evitarClick=Date.now()+700;
      a.b.classList.remove('moviendo');botones().forEach(b=>b.classList.remove('destino-herramienta'));B.classList.remove('arrastrando');
    };
    B.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button>0)return;inicio(e.target,e.clientX,e.clientY,e.pointerId);});
    addEventListener('pointermove',e=>{if(e.pointerType!=='touch')movimiento(e.clientX,e.clientY,e.pointerId,e);},{passive:false});
    addEventListener('pointerup',e=>{if(e.pointerType!=='touch')fin(e.pointerId);});
    addEventListener('pointercancel',e=>{if(e.pointerType!=='touch')fin(e.pointerId,true);});
    B.addEventListener('touchstart',e=>{if(e.touches.length!==1){if(d)fin(d.id,true);return;}const t=e.touches[0];inicio(e.target,t.clientX,t.clientY,'t'+t.identifier);},{passive:true});
    addEventListener('touchmove',e=>{if(!d)return;const t=Array.from(e.touches).find(t=>'t'+t.identifier===d.id);if(t)movimiento(t.clientX,t.clientY,d.id,e);},{passive:false});
    const finTouch=e=>{if(!d)return;const t=Array.from(e.changedTouches).find(t=>'t'+t.identifier===d.id);if(t){if((d.pan||d.ordenar)&&e.cancelable)e.preventDefault();fin(d.id,e.type==='touchcancel');}};
    addEventListener('touchend',finTouch,{passive:false});addEventListener('touchcancel',finTouch,{passive:false});
    addEventListener('blur',()=>{if(d)fin(d.id,true);});
    B.addEventListener('contextmenu',e=>e.preventDefault());
    B.addEventListener('click',e=>{if(Date.now()<(B._evitarClick||0)){e.preventDefault();e.stopImmediatePropagation();}},true);
  },
  pinza(c){
    const P=$(c.FIGID.papel);let gesto=null;
    const par=ts=>{const a=ts[0],b=ts[1],r=P.getBoundingClientRect();return {x:(a.clientX+b.clientX)/2-r.left,y:(a.clientY+b.clientY)/2-r.top,dist:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),ang:Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX)};};
    P.addEventListener('touchstart',e=>{const f=c.figSel();if(e.touches.length!==2||!f)return;if(e.cancelable)e.preventDefault();c._figFin?.();c._pellizco=true;gesto={f,ini:{...f},p:par(e.touches)};},{passive:false});
    P.addEventListener('touchmove',e=>{if(!gesto||e.touches.length!==2)return;e.preventDefault();const p=par(e.touches),{f,ini,p:p0}=gesto,k=Math.max(.1,Math.min(10,p.dist/Math.max(1,p0.dist)));
      f.w=Math.max(18,ini.w*k);f.h=Math.max(18,ini.h*k);f.x=ini.x+(ini.w-f.w)/2+p.x-p0.x;f.y=Math.max(0,ini.y+(ini.h-f.h)/2+p.y-p0.y);f.giro=(ini.giro||0)+(p.ang-p0.ang)*180/Math.PI;
      c.estiloFig($(`.es-fg[data-id="${f.id}"]`,P),f);c.ponerCaja($('.es-sel',P),f);c.ponerBarra($('.es-mbar',P),f);
    },{passive:false});
    const fin=e=>{if(!gesto||e.touches.length>=2)return;gesto=null;c._pellizco=false;c.cambioFigs();};P.addEventListener('touchend',fin);P.addEventListener('touchcancel',fin);
  }
};
// Una misma barra: pulsar y arrastrar; el orden es propio de cada apartado.
Escribir.ordenBarra=function(){const B=$('#esBarra');this._ordenBase=[...B.children].filter(b=>b.tagName==='BUTTON').map(b=>this.claveBoton(b));Edicion.ordenarBarra(B,'ph3-es-barra');};
Object.assign(Escribir,{
  tituloMovil(f,antiguo){
    f=f||(this.figSel()?.tipo==='tit'?this.figSel():null);
    const el=f?{dataset:{tit:JSON.stringify(f.t)}}:antiguo||null;
    this.tituloBonito(el,t=>{
      if(!t){if(f)this.quitarFig(f);else if(antiguo){antiguo.remove();this.cambio();}return;}
      if(f)f.t=JSON.parse(JSON.stringify(t));
      else{
        const P=$('#esPapel'),pr=P.getBoundingClientRect(),r=antiguo?.getBoundingClientRect(),h=t.tam==='enorme'?60:t.tam==='mediano'?36:46;
        const y=r?r.top-pr.top:Math.max(40,$('#esHoja').scrollTop+60);
        f={id:nuevoId('fg'),tipo:'tit',t:JSON.parse(JSON.stringify(t)),x:28,y,w:Math.max(80,Math.min(P.clientWidth-56,t.texto.length*h*.5)),h,giro:0,capa:'delante',grosor:0,ribete:'transparente',relleno:'transparente'};
        this.figs.push(f);if(antiguo)antiguo.remove();
      }
      this.pintarFigs();this.seleccionar(f.id);this.cambioFigs();toast('Título: arrastra para mover · dos dedos para tamaño y giro');
    });
  },
  copiarObjeto(){const f=this.figSel();if(!f){toast('Selecciona primero un título o una figura');return;}this._objetoCopiado=JSON.parse(JSON.stringify(f));toast('⧉ Objeto copiado. Pulsa Pegar objeto.');},
  pegarObjeto(){
    if(!this._objetoCopiado){toast('Primero copia un título o una figura');return;}
    const f=JSON.parse(JSON.stringify(this._objetoCopiado));f.id=nuevoId('fg');f.x+=24;f.y+=24;
    this.figs.push(f);this.pintarFigs();this.seleccionar(f.id);this.cambioFigs();
  },
  ordenarObjeto(f,delante){const i=this.figs.indexOf(f);if(i<0)return;this.figs.splice(i,1);this.figs.splice(delante?this.figs.length:0,0,f);this.pintarFigs();this.cambioFigs();}
});
const estiloObjeto=Escribir.estiloFig;
Escribir.estiloFig=function(el,f){
  estiloObjeto.call(this,el,f);
  if(f.tipo==='tit' && el?.firstChild){const d=el.firstChild;d.style.width='max-content';d.style.maxWidth='none';d.style.transformOrigin='left center';const medida=document.createElement('canvas').getContext('2d'),t=f.t||{},st=this.TIT_ESTILOS.find(x=>x[0]===t.estilo)||this.TIT_ESTILOS[0];
    medida.font=(st[0]==='mano'?'400':'900')+' '+Math.max(8,f.h*.78)+'px '+st[2];const w=medida.measureText(t.texto||'').width||1;
    d.style.transform=`scaleX(${f.w/w})`;d.style.textAlign='left';
  }
};
const pintarSeleccion=Escribir.pintarSel;
Escribir.pintarSel=function(){
  pintarSeleccion.call(this);if(this!==Escribir)return;const f=this.figSel(),b=$('.es-mbar',$(this.FIGID.papel));if(!f||!b)return;
  b.insertAdjacentHTML('beforeend',`${f.tipo==='tit'?'<button data-edittit>✏️ Letras</button>':''}<button data-copiarobj>⧉ Copiar</button><button data-pegarobj>📋 Pegar</button><button data-ordenobj="frente">Al frente</button><button data-ordenobj="fondo">Al fondo</button>`);
  this.ponerBarra(b,f);
};
const dibujarObjeto=Escribir.dibujarForma;
Escribir.dibujarForma=function(f,k=2){
  if(f.tipo!=='tit')return dibujarObjeto.call(this,f,k);
  const cv=document.createElement('canvas');cv.width=Math.max(2,Math.round(f.w*k));cv.height=Math.max(2,Math.round(f.h*k));const cx=cv.getContext('2d'),t=f.t||{},st=this.TIT_ESTILOS.find(x=>x[0]===t.estilo)||this.TIT_ESTILOS[0];
  const px=f.h*.78*k;cx.font=(st[0]==='mano'?'400':'900')+' '+px+'px '+st[2];cx.textBaseline='middle';const chars=[...(t.texto||'')],ancho=cx.measureText(t.texto||'').width||1;cx.scale(cv.width/ancho,1);
  if(t.estilo==='sombra'){cx.shadowColor='#0006';cx.shadowBlur=3*k;cx.shadowOffsetX=2*k;cx.shadowOffsetY=2*k;}
  let x=0;chars.forEach((ch,i)=>{cx.fillStyle=(t.colores||[])[i]||t.color||'#e5201c';if(t.estilo==='borde'){cx.strokeStyle=cx.fillStyle;cx.lineWidth=k;cx.strokeText(ch,x,cv.height/2);}else cx.fillText(ch,x,cv.height/2);x+=cx.measureText(ch).width;});return cv.toDataURL('image/png');
};
const iniciarEscribirV18=Escribir.iniciar;
Escribir.iniciar=function(){
  iniciarEscribirV18.call(this);
  $('#esTitBonito').onclick=()=>this.tituloMovil();$('#esCopiarObjeto').onclick=()=>this.copiarObjeto();$('#esPegarObjeto').onclick=()=>this.pegarObjeto();
  $('#esTexto').addEventListener('click',e=>{const t=e.target.closest('.es-tit');if(t){e.preventDefault();e.stopImmediatePropagation();this.tituloMovil(null,t);}},true);
  $('#esPapel').addEventListener('click',e=>{const b=e.target.closest('.es-mbar button'),f=this.figSel();if(!b||!f)return;
    if(b.hasAttribute('data-edittit'))this.tituloMovil(f);else if(b.hasAttribute('data-copiarobj'))this.copiarObjeto();else if(b.hasAttribute('data-pegarobj'))this.pegarObjeto();else if(b.dataset.ordenobj)this.ordenarObjeto(f,b.dataset.ordenobj==='frente');
  });
  document.addEventListener('keydown',e=>{if(!this.activa()||!this.id||!(e.ctrlKey||e.metaKey)||$('#mioPop')||$('.mio-hoja'))return;
    const a=document.activeElement;if(a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName)||a.isContentEditable))return;
    if(e.key.toLowerCase()==='c'&&this.sel){e.preventDefault();this.copiarObjeto();}else if(e.key.toLowerCase()==='v'&&this._objetoCopiado){e.preventDefault();this.pegarObjeto();}
  });
  Edicion.pinza(this);
  // Mantiene el cursor al tocar Tab en el móvil; si aún no hay cursor, comienza al final.
  $('#esTabB').onclick=()=>{this.restaurarCursor();const e=$('#esTexto'),s=getSelection();if(!s.rangeCount||!e.contains(s.anchorNode)){e.focus();const r=document.createRange();r.selectNodeContents(e);r.collapse(false);s.removeAllRanges();s.addRange(r);}this.ponerTab();};
};
const iniciarCeldasV18=Celdas.iniciar;
Celdas.iniciar=function(){
  iniciarCeldasV18.call(this);Edicion.ordenarBarra($('#ceBarra'),'ph3-ce-barra');Edicion.pinza(CeFig);
  $('#ceSeleccion').onclick=()=>{this.desplazar=!this.desplazar;$('#vCeldas').classList.toggle('desplazar-celdas',this.desplazar);$('#ceSeleccion').textContent=this.desplazar?'✋ Desplazar':'☝ Seleccionar';$('#ceSeleccion').setAttribute('aria-pressed',!this.desplazar);toast(this.desplazar?'Desliza para mover la hoja':'Desliza por las celdas para seleccionar varias');};
  $('#ceGuias').onclick=()=>{lsSet('ph3-ce-verpag',this.verHojas()?'0':null);this.pintarPaginas();toast(this.verHojas()?'Guías A4 visibles: indican los folios al imprimir':'Guías azules ocultas; las celdas no cambian');};
};
