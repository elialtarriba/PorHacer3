/* PorHacer · almacenamiento
   Se guarda todo en el propio navegador (IndexedDB), repartido en tres
   «archivos» (bases de datos) separados para que nada se mezcle ni se llene:
     · PorHacer-datos  → tareas, personas y configuración
     · PorHacer-fotos  → fotos aligeradas
     · PorHacer-videos → vídeos aligerados
     · PorHacer-audios → notas de audio (.mp3)                                  */

const BASES = {
  datos:  { nombre:'PorHacer3-datos',  almacenes:['tareas','personas','ajustes'] },
  fotos:  { nombre:'PorHacer3-fotos',  almacenes:['fotos'] },
  videos: { nombre:'PorHacer3-videos', almacenes:['videos'] },
  audios: { nombre:'PorHacer3-audios', almacenes:['audios'] }
};
const _abiertas = {};

function abrirBase(clave){
  if(_abiertas[clave]) return _abiertas[clave];
  const b = BASES[clave];
  _abiertas[clave] = new Promise((ok, mal) => {
    const req = indexedDB.open(b.nombre, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      for(const a of b.almacenes){
        if(!db.objectStoreNames.contains(a)){
          const st = db.createObjectStore(a, { keyPath:'id' });
          if(a==='fotos' || a==='videos' || a==='audios') st.createIndex('tareaId','tareaId');
        }
      }
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => mal(req.error);
  });
  return _abiertas[clave];
}
function baseDe(almacen){ return ['fotos','videos','audios'].includes(almacen) ? almacen : 'datos'; }
function _tx(almacen, modo, fn){
  return abrirBase(baseDe(almacen)).then(db => new Promise((ok, mal) => {
    const tx = db.transaction(almacen, modo);
    const st = tx.objectStore(almacen);
    let res;
    const r = fn(st);
    if(r && 'onsuccess' in r) r.onsuccess = () => { res = r.result; };
    tx.oncomplete = () => ok(res);
    tx.onerror = () => mal(tx.error);
    tx.onabort = () => mal(tx.error || new Error('abortado'));
  }));
}

const DB = {
  todos:  (a)      => _tx(a,'readonly', st => st.getAll()),
  uno:    (a,id)   => _tx(a,'readonly', st => st.get(id)),
  poner:  (a,obj)  => _tx(a,'readwrite', st => st.put(obj)),
  borrar: (a,id)   => _tx(a,'readwrite', st => st.delete(id)),
  vaciar: (a)      => _tx(a,'readwrite', st => st.clear()),
  ponerVarios: (a,lista) => _tx(a,'readwrite', st => { lista.forEach(o => st.put(o)); }),
  deTarea: (a,tareaId) => _tx(a,'readonly', st => st.index('tareaId').getAll(tareaId)),
  async borrarDeTarea(a, tareaId){
    const l = await DB.deTarea(a, tareaId);
    if(l.length) await _tx(a,'readwrite', st => { l.forEach(o => st.delete(o.id)); });
    return l.length;
  },
  // solo id, tamaño y tareaId (sin cargar los archivos) para contar
  async resumen(a){
    return abrirBase(baseDe(a)).then(db => new Promise((ok, mal) => {
      const out = [];
      const tx = db.transaction(a,'readonly');
      const cur = tx.objectStore(a).openCursor();
      cur.onsuccess = () => { const c = cur.result; if(c){ const v=c.value; out.push({id:v.id, tareaId:v.tareaId, size:v.size||0}); c.continue(); } };
      tx.oncomplete = () => ok(out);
      tx.onerror = () => mal(tx.error);
    }));
  }
};

function nuevoId(pref){ return (pref||'') + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

// Pide al navegador que no borre los datos aunque falte espacio
async function pedirPersistencia(){
  try{ if(navigator.storage && navigator.storage.persist){ return await navigator.storage.persist(); } }catch(e){}
  return false;
}
async function espacioUsado(){
  try{ if(navigator.storage && navigator.storage.estimate) return await navigator.storage.estimate(); }catch(e){}
  return null;
}
function tamTxt(b){
  if(!b && b!==0) return '—';
  if(b < 1024) return b + ' B';
  if(b < 1024*1024) return (b/1024).toFixed(0) + ' KB';
  if(b < 1024*1024*1024) return (b/1024/1024).toFixed(1).replace('.',',') + ' MB';
  return (b/1024/1024/1024).toFixed(2).replace('.',',') + ' GB';
}

/* V19 · Seguridad: limpiar los datos que llegan de fuera (tableros compartidos de la nube
   y archivos de copia) antes de usarlos. Los identificadores, colores, fechas y números
   se pintan dentro del HTML: si alguien los manipula, aquí se quedan sin «trampas».
   El texto normal (títulos, notas, nombres) no se toca: ya se muestra de forma segura. */
const _CLAVE_ID = /^(id|tid|k|nk|uid|dueno)$|Id$/;
const _CLAVE_IDS = /^(ids|asig|comp|compartida|miembros|aceptados)$|Ids$/;
const _CLAVE_COLOR = /color|fondo|^bg$|borde|border|^tc$|^tb$/i;
const _CLAVE_FECHA = /^(inicio|fin|desde|hasta|dia|fecha|creada|cambiada|hecha_en|aviso)$/;
const _CLAVE_NUM = /^(prio|orden|size|dur|nf|nv|na|n|antes|despues|original|segundos|ancho|alto)$/;
const _COLOR_OK = /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%a-z]+\)|[a-z]{3,30}|var\(--[\w-]+\))$/i;
function _limpiaId(v){ return String(v).replace(/[^\w\-.:@+]/g, '').slice(0, 200); }
function limpiarDato(o, clave, prof){
  prof = prof || 0;
  if(o == null || prof > 40) return o;
  if(Array.isArray(o)){
    if(clave && _CLAVE_IDS.test(clave)) return o.map(v => typeof v === 'string' ? _limpiaId(v) : v);
    return o.map(v => limpiarDato(v, null, prof + 1));
  }
  if(typeof o === 'object'){
    if(o instanceof Blob || o instanceof ArrayBuffer || ArrayBuffer.isView(o) || o instanceof Date) return o;
    for(const k of Object.keys(o)){
      const v = o[k];
      if(typeof v === 'string'){
        if(_CLAVE_ID.test(k)) o[k] = _limpiaId(v);
        else if(_CLAVE_COLOR.test(k)) o[k] = _COLOR_OK.test(v.trim()) ? v.trim() : '';
        else if(_CLAVE_FECHA.test(k)) o[k] = v.replace(/[^\w\-:.+ ]/g, '');
        else if(_CLAVE_NUM.test(k)) o[k] = v.replace(/[^\d.\-]/g, '');
      } else if(v && typeof v === 'object') o[k] = limpiarDato(v, k, prof + 1);
    }
  }
  return o;
}
