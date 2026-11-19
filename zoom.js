/* V19 · Zoom: ahora se puede ampliar con dos dedos (antes estaba bloqueado).
   En iPhone/iPad se mantiene maximum-scale=1 solo para que no se amplíe sola la pantalla
   al tocar una casilla de texto; Safari deja igualmente ampliar con dos dedos. */
(function(){
  try{
    var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if(ios){ var m = document.getElementById('vp'); if(m) m.setAttribute('content', m.getAttribute('content') + ', maximum-scale=1.0'); }
  }catch(e){}
})();
