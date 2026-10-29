/* PorHacer · temas de color, paleta de colores y columnas de inicio */

// Nombres de cada color configurable (lo que se ve en Configuración → Colores)
const PARTES_COLOR = [
  ['bg',     'Fondo de la app'],
  ['bg2',    'Fondo (degradado abajo)'],
  ['card',   'Ventanas y tarjetas'],
  ['colbg',  'Fondo de las columnas'],
  ['ink',    'Letra'],
  ['ink2',   'Letra suave'],
  ['line',   'Bordes finos'],
  ['dark',   'Marcos e iconos'],
  ['accent', 'Botones principales'],
  ['accent2','Brillo de los botones'],
  ['accentInk','Letra de los botones'],
  ['tile1',  'Botones-icono (arriba)'],
  ['tile2',  'Botones-icono (abajo)']
];

const TEMAS = {
  // ---- Con fondo blanco ----
  bRojo: { nombre:'Blanco y rojo', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#3a3a3c', accent:'#e5201c', accent2:'#ff5a4e', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#eeeff2' }},
  bAzul: { nombre:'Blanco y azul', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#1e3a5f', accent:'#2f80ed', accent2:'#5aa2f5', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#eeeff2' }},
  bCeleste: { nombre:'Blanco y azul celeste', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#2f6690', accent:'#4aa3dc', accent2:'#75bdea', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#eeeff2' }},
  bVerde: { nombre:'Blanco y verde', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#1f5a36', accent:'#2e9e5b', accent2:'#56c07f', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#eeeff2' }},
  bLima: { nombre:'Blanco y verde lima', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#4f6a10', accent:'#8bb51f', accent2:'#b2d64a', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#eeeff2' }},
  bRosa: { nombre:'Blanco y rosa', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#8e3d5e', accent:'#e0608a', accent2:'#f08eab', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#eeeff2' }},
  bLila: { nombre:'Blanco y lila', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#4c3a7a', accent:'#8b5cf6', accent2:'#a98bfa', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#eeeff2' }},
  bNaranja: { nombre:'Blanco y naranja', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#8a4614', accent:'#f07a1a', accent2:'#f8a050', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#eeeff2' }},
  bAmarillo: { nombre:'Blanco y amarillo', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#6f5a08', accent:'#e8b400', accent2:'#f5d340', accentInk:'#3b3000', tile1:'#ffffff', tile2:'#eeeff2' }},
  bMarron: { nombre:'Blanco y marrón', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#6b4a2e', accent:'#b07a4a', accent2:'#cc9b6c', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#eeeff2' }},
  bNegro: { nombre:'Blanco y negro', grupo:'blanco', c:{
    bg:'#ffffff', bg2:'#f8f8fa', card:'#ffffff', colbg:'#f4f5f7', ink:'#2c2c2e', ink2:'#7c7c84', line:'#e3e4e8',
    dark:'#1c1c1e', accent:'#2c2c2e', accent2:'#55555a', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#eeeff2' }},
  // ---- Tema de HOME ----
  homeLavanda: { nombre:'HOME · Lavanda (original)', grupo:'home', c:{
    bg:'#fbf7f3', bg2:'#f1ebf7', card:'#fffdfb', colbg:'#f6f2fb', ink:'#4a3f57', ink2:'#8e839c', line:'#e7e0f0',
    dark:'#5a4a68', accent:'#8b74c9', accent2:'#b3a2e6', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#ebe5f7' }},
  homeLogo: { nombre:'HOME · Tonos del logo', grupo:'home', c:{
    bg:'#fcf3cf', bg2:'#f5e6b4', card:'#fffdf6', colbg:'#fbf3dc', ink:'#5a3e2b', ink2:'#9a7f62', line:'#ecdcb4',
    dark:'#5a3e2b', accent:'#c4935f', accent2:'#ddb27f', accentInk:'#ffffff', tile1:'#fffdf6', tile2:'#f3e3b4' }},
  homeMarron: { nombre:'HOME · Marrón pastel', grupo:'home', c:{
    bg:'#f2e6d8', bg2:'#e8d6c1', card:'#fffaf4', colbg:'#f8efe5', ink:'#4a3426', ink2:'#8f7560', line:'#e2cfbb',
    dark:'#4a3426', accent:'#b08a6a', accent2:'#cfab89', accentInk:'#ffffff', tile1:'#fffaf4', tile2:'#ead9c6' }},
  homeMiel: { nombre:'HOME · Miel y naranja', grupo:'home', c:{
    bg:'#fdf8e4', bg2:'#f8ecc2', card:'#fffdf5', colbg:'#fdf6e0', ink:'#5a3e2b', ink2:'#9a8060', line:'#f0e2b0',
    dark:'#5a3e2b', accent:'#d9814f', accent2:'#f4b48a', accentInk:'#ffffff', tile1:'#fffdf5', tile2:'#f9e8a8' }},
  // ---- Especiales: fondos de dos colores, muy distintos entre sí ----
  eAtardecer: { nombre:'Atardecer', grupo:'especial', c:{
    bg:'#ffd9c2', bg2:'#f6a6c1', card:'#fffaf7', colbg:'#fff1ec', ink:'#4a2238', ink2:'#9a6479', line:'#f6d2d6',
    dark:'#6b2d5c', accent:'#e8505b', accent2:'#ff8a7a', accentInk:'#ffffff', tile1:'#fffaf7', tile2:'#fde3e6' }},
  eMar: { nombre:'Mar Mediterráneo', grupo:'especial', c:{
    bg:'#d3f1fb', bg2:'#86cfe8', card:'#f7fdff', colbg:'#ecf8fd', ink:'#0b2e4a', ink2:'#4e7790', line:'#c8e7f3',
    dark:'#023e8a', accent:'#0077b6', accent2:'#2ea8e0', accentInk:'#ffffff', tile1:'#f7fdff', tile2:'#d9eef8' }},
  eBosque: { nombre:'Bosque encantado', grupo:'especial', c:{
    bg:'#e1f2e3', bg2:'#a6d4b3', card:'#f8fdf9', colbg:'#eef8f0', ink:'#14352a', ink2:'#55806b', line:'#cfe6d5',
    dark:'#1b4332', accent:'#2d6a4f', accent2:'#52a37a', accentInk:'#ffffff', tile1:'#f8fdf9', tile2:'#dbeedf' }},
  eLimon: { nombre:'Limón y menta', grupo:'especial', c:{
    bg:'#fbf8cc', bg2:'#b9f0df', card:'#fffff6', colbg:'#f7fbe8', ink:'#23413d', ink2:'#5f857c', line:'#e2efcf',
    dark:'#2a6f68', accent:'#e9a21b', accent2:'#f6c445', accentInk:'#ffffff', tile1:'#fffff6', tile2:'#e8f5dc' }},
  eUva: { nombre:'Uva y oro', grupo:'especial', c:{
    bg:'#efe3ff', bg2:'#ffe6ad', card:'#fffcff', colbg:'#f8f2ff', ink:'#2e1048', ink2:'#7b5f92', line:'#e8dcf4',
    dark:'#3c096c', accent:'#7b2cbf', accent2:'#a463e0', accentInk:'#ffffff', tile1:'#fffcff', tile2:'#efe4fb' }},
  eCoral: { nombre:'Coral y turquesa', grupo:'especial', c:{
    bg:'#ffe3dd', bg2:'#bff0ea', card:'#fffdfc', colbg:'#fff3f0', ink:'#173f3c', ink2:'#5e8582', line:'#f2dad5',
    dark:'#1f7a74', accent:'#ff6f61', accent2:'#ff9a8f', accentInk:'#ffffff', tile1:'#fffdfc', tile2:'#e3f5f2' }},
  eArcoiris: { nombre:'Algodón de azúcar', grupo:'especial', c:{
    bg:'#ffdcec', bg2:'#d3edff', card:'#fffcfe', colbg:'#fdf3f9', ink:'#3a3350', ink2:'#7d7896', line:'#efdcea',
    dark:'#4a4e69', accent:'#ff5d8f', accent2:'#ff8fb1', accentInk:'#ffffff', tile1:'#fffcfe', tile2:'#ecebf8' }},
  eCafe: { nombre:'Café con leche', grupo:'especial', c:{
    bg:'#f2e5d5', bg2:'#d4b393', card:'#fffaf4', colbg:'#f8efe4', ink:'#3b2416', ink2:'#86664f', line:'#e8d6c1',
    dark:'#4b2e1e', accent:'#8c5a3c', accent2:'#b07d58', accentInk:'#ffffff', tile1:'#fffaf4', tile2:'#efe0cd' }},
  eVerano: { nombre:'Cielo de verano', grupo:'especial', c:{
    bg:'#dff1ff', bg2:'#fff0bd', card:'#fffffb', colbg:'#f2f8ff', ink:'#14263f', ink2:'#5c7290', line:'#dbe7f2',
    dark:'#1d3557', accent:'#ff9f1c', accent2:'#ffbf5a', accentInk:'#ffffff', tile1:'#fffffb', tile2:'#e8f0fa' }},
  eLavMenta: { nombre:'Lavanda y menta', grupo:'especial', c:{
    bg:'#e9e1ff', bg2:'#c8f5e3', card:'#fdfcff', colbg:'#f5f2ff', ink:'#2f2a4d', ink2:'#726c93', line:'#e2dcf5',
    dark:'#4b3f8f', accent:'#7d5fd3', accent2:'#a48df0', accentInk:'#ffffff', tile1:'#fdfcff', tile2:'#e7f6f0' }},
  // ---- Pasteles (como la agenda y los tickets de HOME) ----
  pSalvia: { nombre:'Pastel salvia', grupo:'pastel', c:{
    bg:'#eef4e8', bg2:'#dfead6', card:'#fbfdf8', colbg:'#f3f8ee', ink:'#2f4a3d', ink2:'#6f8a78', line:'#d6e5cd',
    dark:'#3d5e4c', accent:'#6f8f62', accent2:'#93b386', accentInk:'#ffffff', tile1:'#fbfdf8', tile2:'#dcebd3' }},
  pAzul: { nombre:'Pastel azul', grupo:'pastel', c:{
    bg:'#eaf2f9', bg2:'#d9e7f3', card:'#fbfdff', colbg:'#f1f6fb', ink:'#2f3a4a', ink2:'#6b7f96', line:'#d2e2ef',
    dark:'#3c5470', accent:'#4f7fa8', accent2:'#79a3c8', accentInk:'#ffffff', tile1:'#fbfdff', tile2:'#d6e6f3' }},
  pRosa: { nombre:'Pastel rosa', grupo:'pastel', c:{
    bg:'#fbeff3', bg2:'#f5dfe7', card:'#fffbfc', colbg:'#fdf4f7', ink:'#6b2f45', ink2:'#a3707f', line:'#f1d6df',
    dark:'#8a4560', accent:'#b0577a', accent2:'#d07f9e', accentInk:'#ffffff', tile1:'#fffbfc', tile2:'#f6dbe5' }},
  pLavanda: { nombre:'Pastel lavanda', grupo:'pastel', c:{
    bg:'#f4f1fb', bg2:'#e7e1f5', card:'#fdfcff', colbg:'#f7f5fc', ink:'#4a3f57', ink2:'#857b96', line:'#e2dcf0',
    dark:'#5a4a7a', accent:'#6f5cb5', accent2:'#998ad6', accentInk:'#ffffff', tile1:'#fdfcff', tile2:'#e5def5' }},
  pMiel: { nombre:'Pastel miel', grupo:'pastel', c:{
    bg:'#fdf6e0', bg2:'#f6e9bf', card:'#fffdf5', colbg:'#fdf8e8', ink:'#5a4a1e', ink2:'#968356', line:'#efe2b6',
    dark:'#6b5520', accent:'#c9962e', accent2:'#e2b95a', accentInk:'#ffffff', tile1:'#fffdf5', tile2:'#f5e6b4' }},
  // ---- Con fondo de color ----
  grises: { nombre:'Grises y rojo (como los iconos)', c:{
    bg:'#eeeff1', bg2:'#e2e3e7', card:'#ffffff', colbg:'#f7f7f9', ink:'#2c2c2e', ink2:'#7c7c84', line:'#dcdde1',
    dark:'#3a3a3c', accent:'#e5201c', accent2:'#ff5a4e', accentInk:'#ffffff', tile1:'#ffffff', tile2:'#e6e6ea' }},
  marron: { nombre:'Marrones claros', c:{
    bg:'#f4ebdf', bg2:'#eadbc7', card:'#fffaf3', colbg:'#faf2e7', ink:'#4a3422', ink2:'#9a7d62', line:'#e7d6c0',
    dark:'#7a5a3e', accent:'#b9875a', accent2:'#d4a77a', accentInk:'#ffffff', tile1:'#fffaf3', tile2:'#f0e1cd' }},
  rosa: { nombre:'Rosa', c:{
    bg:'#fcecf1', bg2:'#f6dbe4', card:'#fffafc', colbg:'#fdf2f6', ink:'#5a2a3a', ink2:'#a8738a', line:'#f2d3de',
    dark:'#9c4c6a', accent:'#e0708f', accent2:'#f096ad', accentInk:'#ffffff', tile1:'#fffafc', tile2:'#f8e0e8' }},
  lima: { nombre:'Verde lima', c:{
    bg:'#f3f8df', bg2:'#e6f0c4', card:'#fdfff5', colbg:'#f7fbe8', ink:'#384712', ink2:'#7f8f52', line:'#dfe9bd',
    dark:'#5f7a12', accent:'#9cc22e', accent2:'#bddb5a', accentInk:'#ffffff', tile1:'#fdfff5', tile2:'#ebf3cf' }},
  verde: { nombre:'Verde', c:{
    bg:'#e6f2e8', bg2:'#d3e8d7', card:'#f9fdf9', colbg:'#eff8f0', ink:'#1f4a2c', ink2:'#5f8a6a', line:'#cfe3d3',
    dark:'#2f6b42', accent:'#47a066', accent2:'#6cc08a', accentInk:'#ffffff', tile1:'#f9fdf9', tile2:'#dcecdf' }},
  celeste: { nombre:'Azul celeste', c:{
    bg:'#e6f3fc', bg2:'#d2e8f7', card:'#f9fcff', colbg:'#eff7fd', ink:'#1d3f5a', ink2:'#5d86a6', line:'#cde2f2',
    dark:'#2f6690', accent:'#4aa3dc', accent2:'#75bdea', accentInk:'#ffffff', tile1:'#f9fcff', tile2:'#dcebf7' }},
  naranja: { nombre:'Naranja', c:{
    bg:'#fdeedf', bg2:'#f9dcc2', card:'#fffaf5', colbg:'#fef3e8', ink:'#5a3010', ink2:'#a8774f', line:'#f4d8bd',
    dark:'#a85618', accent:'#f0852e', accent2:'#f7a660', accentInk:'#ffffff', tile1:'#fffaf5', tile2:'#f8e2cc' }},
  amarillo: { nombre:'Amarillo', c:{
    bg:'#fdf7da', bg2:'#f8ecb6', card:'#fffdf3', colbg:'#fefae6', ink:'#4f420c', ink2:'#9a8a48', line:'#f0e2a8',
    dark:'#8a7210', accent:'#e2b81c', accent2:'#f0d052', accentInk:'#ffffff', tile1:'#fffdf3', tile2:'#f6ebbd' }},
  otono: { nombre:'Naranja · amarillo · marrón', c:{
    bg:'#fbf1df', bg2:'#f3dfc0', card:'#fffaf2', colbg:'#fdf4e3', ink:'#4e3418', ink2:'#a07e57', line:'#efdbb8',
    dark:'#8c6440', accent:'#ec8a2c', accent2:'#f2c23c', accentInk:'#ffffff', tile1:'#fffaf2', tile2:'#f4e2c4' }},
  campo: { nombre:'Lima · verde · marrón', c:{
    bg:'#f2f2e2', bg2:'#e4e3c8', card:'#fdfdf6', colbg:'#f6f6ea', ink:'#33401c', ink2:'#7c7a58', line:'#e1dfc4',
    dark:'#7a5f42', accent:'#4f9e5a', accent2:'#a6c93a', accentInk:'#ffffff', tile1:'#fdfdf6', tile2:'#e9e7cf' }},
  dulce: { nombre:'Rosa · marrón · amarillo', c:{
    bg:'#fbefe9', bg2:'#f4dfd3', card:'#fffaf7', colbg:'#fdf4ef', ink:'#4e2f2a', ink2:'#a37f72', line:'#f0dacf',
    dark:'#8e6650', accent:'#e0708f', accent2:'#efc44c', accentInk:'#ffffff', tile1:'#fffaf7', tile2:'#f6e3d8' }}
};

// Colores para tareas, columnas y ajustes (desplegable como en HOME)
const PALETA = [
  ['', 'Sin color (blanco)', '#ffffff'],
  ['celeste','Azul celeste','#c4e6f8'], ['azul','Azul','#a9c8f2'], ['azulosc','Azul oscuro','#3b82f6'],
  ['verdecl','Verde claro','#cdeec0'], ['lima','Verde lima','#e2f3a3'], ['verdeosc','Verde oscuro','#22a55a'], ['menta','Menta','#bfeadb'],
  ['amarillo','Amarillo','#fbe9a3'], ['naranjacl','Naranja claro','#fdd2ad'], ['naranja','Naranja','#f59e0b'],
  ['rosa','Rosa','#f9cad9'], ['rosafuerte','Rosa fuerte','#e0708f'], ['rojocl','Rojo claro','#f7b0ab'], ['rojo','Rojo','#e5484d'],
  ['lila','Lila','#dccdf3'], ['morado','Morado','#8b5cf6'],
  ['marroncl','Marrón claro','#e6d2b7'], ['marron','Marrón','#b9875a'], ['marronosc','Marrón oscuro','#7a5a3e'], ['caqui','Caqui','#d4cc9e'],
  ['grisclaro','Gris claro','#e4e4e8'], ['gris','Gris','#8e8e93'], ['grisosc','Gris oscuro','#3a3a3c'], ['negro','Negro','#1c1c1e']
];
const PALETA_TAREA = PALETA.filter(p => !['azulosc','verdeosc','naranja','rosafuerte','rojo','morado','marronosc','gris','grisosc','negro'].includes(p[0]));

function nombreColor(hex){
  if(!hex) return 'Sin color';
  const p = PALETA.find(x => x[2].toLowerCase() === String(hex).toLowerCase());
  return p ? p[1] : 'Personalizado';
}

// Columnas de inicio (el borde de cada tarea toma este color)
const COLUMNAS_INICIO = [
  { id:'nueva',     nombre:'Nueva tarea', color:'#e5484d', visible:true,  hecha:false, fija:true },
  { id:'curso',     nombre:'En curso',    color:'#3b82f6', visible:true,  hecha:false, fija:true },
  { id:'pausa',     nombre:'En pausa',    color:'#f59e0b', visible:true,  hecha:false, fija:true },
  { id:'acabada',   nombre:'Acabada',     color:'#22a55a', visible:true,  hecha:true,  fija:true },
  { id:'archivada', nombre:'Archivada',   color:'#8e8e93', visible:false, hecha:true,  fija:true }
];

// Utilidades de color
function hexRgb(h){ h=String(h||'#ffffff').replace('#',''); if(h.length===3) h=h.split('').map(x=>x+x).join(''); const n=parseInt(h,16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function rgbHex(r,g,b){ return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join(''); }
function mezcla(a,b,t){ const x=hexRgb(a), y=hexRgb(b); return rgbHex(x[0]+(y[0]-x[0])*t, x[1]+(y[1]-x[1])*t, x[2]+(y[2]-x[2])*t); }
function luz(h){ const [r,g,b]=hexRgb(h); return (0.299*r+0.587*g+0.114*b)/255; }
// Para tareas con colores fuertes: aclararlos para que la letra se lea
function fondoTarea(hex){ if(!hex) return null; return luz(hex) < .62 ? mezcla(hex,'#ffffff',.62) : hex; }

function aplicarTema(colores){
  const r = document.documentElement.style;
  for(const [k] of PARTES_COLOR) if(colores[k]) r.setProperty('--'+k, colores[k]);
  r.setProperty('--sombra', 'rgba(' + hexRgb(colores.dark||'#333').join(',') + ',.16)');
  const m = document.querySelector('meta[name=theme-color]'); if(m) m.content = colores.bg;
}
