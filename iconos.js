/* PorHacer · iconos dibujados al estilo de las imágenes de la app
   (marco oscuro redondeado + detalles en rojo). Usan los colores del tema. */
const ICO = {
  // Grabar: marco con ondas de sonido y el punto rojo de grabar
  grabar: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="6" y="10" width="52" height="44" rx="12" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <g stroke="var(--dark)" stroke-width="4" stroke-linecap="round"><path d="M15 28v8M21 23v18M43 23v18M49 28v8"/></g>
    <circle cx="32" cy="32" r="8.5" fill="var(--accent)" stroke="var(--dark)" stroke-width="3"/>
  </svg>`,

  // Reunión de Teams: pantalla con dos personas y una cámara de vídeo roja
  teams: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="5" y="9" width="46" height="36" rx="10" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <g fill="var(--dark)"><circle cx="20" cy="22" r="5"/><circle cx="36" cy="22" r="5"/></g>
    <path d="M11.5 38c0-5.5 3.8-8.5 8.5-8.5s8.5 3 8.5 8.5M27.5 38c0-5.5 3.8-8.5 8.5-8.5s8.5 3 8.5 8.5" fill="var(--dark)" opacity=".55"/>
    <path d="M20 51h16" stroke="var(--dark)" stroke-width="4.5" stroke-linecap="round"/>
    <rect x="33" y="35" width="21" height="16" rx="5" fill="var(--accent)" stroke="#fff" stroke-width="2.6"/>
    <path d="M54 39.5l6-3.5v14l-6-3.5z" fill="var(--accent)" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="40" cy="43" r="2.6" fill="#fff"/>
  </svg>`,

  // Web personal: un globo terráqueo con una llave roja
  web: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="28" cy="29" r="21" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <path d="M7.5 29h41M28 8c-6.5 6-9.5 13-9.5 21s3 15 9.5 21M28 8c6.5 6 9.5 13 9.5 21s-3 15-9.5 21M11 18.5h34M11 39.5h34" fill="none" stroke="var(--dark)" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <circle cx="45" cy="45" r="8" fill="var(--accent)" stroke="#fff" stroke-width="2.6"/>
    <circle cx="45" cy="45" r="2.6" fill="#fff"/>
    <path d="M50.5 50.5l8 8M55 55l-3 3M58.5 58.5l-2.6 2.6" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
  </svg>`,

  // Manual: libro abierto con un marcapáginas rojo
  manual: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 16c-6-5-15-6-24-4v38c9-2 18-1 24 4 6-5 15-6 24-4V12c-9-2-18-1-24 4z" fill="#fff" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M32 16v38" stroke="var(--dark)" stroke-width="4"/>
    <g stroke="var(--dark)" stroke-width="3" stroke-linecap="round" opacity=".55"><path d="M14 22h11M14 29h11M14 36h9M39 22h11M39 29h11M39 36h8"/></g>
    <path d="M42 11v19l4.5-3.4 4.5 3.4V11" fill="var(--accent)" stroke="var(--dark)" stroke-width="2.6" stroke-linejoin="round"/>
  </svg>`,

  // Escribir: hoja con líneas, un lápiz y un micrófono rojo
  escribir: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M12 6h26l12 12v36a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5z" fill="#fff" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M38 6v12h12" fill="none" stroke="var(--dark)" stroke-width="4" stroke-linejoin="round"/>
    <g stroke="var(--dark)" stroke-width="3" stroke-linecap="round" opacity=".6"><path d="M15 26h20M15 34h16M15 42h12"/></g>
    <rect x="41" y="31" width="13" height="20" rx="6.5" fill="var(--accent)" stroke="#fff" stroke-width="2.6"/>
    <path d="M37 45a10.5 10.5 0 0 0 21 0M47.5 55.5v5M42 61h11" fill="none" stroke="var(--accent)" stroke-width="3.2" stroke-linecap="round"/>
  </svg>`,

  // Copia de seguridad: caja con flecha roja
  guardar: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 48h30a11 11 0 0 0 1-22 15 15 0 0 0-29-3 12 12 0 0 0-2 25z" fill="#fff" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/><path d="M32 27v16m-7-7 7 7 7-7" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  copia: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M10 30h44v20a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z" fill="#fff" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M10 30l7-12h30l7 12" fill="none" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M24 40h16" stroke="var(--dark)" stroke-width="4" stroke-linecap="round"/>
    <path d="M32 4v20M24 16l8 8 8-8" fill="none" stroke="var(--accent)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // Calculadora: marco oscuro, pantalla gris y teclas, la del «=» en rojo
  calculadora: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="12" y="5" width="40" height="54" rx="9" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <rect x="18" y="11" width="28" height="12" rx="3.5" fill="var(--dark)"/>
    <path d="M37 17h5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
    <g fill="var(--dark)"><rect x="18" y="28" width="7" height="6" rx="2"/><rect x="28.5" y="28" width="7" height="6" rx="2"/><rect x="18" y="38" width="7" height="6" rx="2"/><rect x="28.5" y="38" width="7" height="6" rx="2"/><rect x="18" y="48" width="17.5" height="6" rx="2"/></g>
    <rect x="39" y="28" width="7" height="26" rx="2.5" fill="var(--accent)"/>
    <path d="M40.8 39.5h3.4M40.8 42.5h3.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,

  // Cámara de fotos con objetivo rojo
  camara: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M8 22a6 6 0 0 1 6-6h7l4-6h14l4 6h7a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z" fill="#fff" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/>
    <circle cx="32" cy="33" r="11" fill="var(--accent)" stroke="var(--dark)" stroke-width="4"/>
    <circle cx="28.5" cy="29.5" r="3" fill="#fff" opacity=".85"/>
    <circle cx="48" cy="23" r="2.6" fill="var(--dark)"/>
  </svg>`,

  // Galería: foto con montaña y sol rojo
  galeria: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="7" y="11" width="50" height="42" rx="8" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <circle cx="43" cy="24" r="5" fill="var(--accent)"/>
    <path d="M10 46l13-14 10 10 6-6 15 13" fill="none" stroke="var(--dark)" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // Paleta de colores
  paleta: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 7C17 7 6 18 6 31c0 12 10 22 22 22 4 0 6-2 6-5 0-4-4-5-1-9 2-2 5-2 9-2h5c6 0 11-4 11-10C58 15 46 7 32 7z" fill="#fff" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/>
    <circle cx="20" cy="30" r="4.2" fill="var(--accent)"/><circle cx="25" cy="18" r="4.2" fill="var(--dark)"/><circle cx="38" cy="16" r="4.2" fill="#9a9aa0"/><circle cx="47" cy="25" r="4.2" fill="var(--accent)" opacity=".55"/>
  </svg>`,

  // Lápiz (editar)
  lapiz: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M42 9l13 13-30 30H12V39z" fill="#fff" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M36 15l13 13" stroke="var(--dark)" stroke-width="4"/>
    <path d="M42 9l13 13 3-3a4 4 0 0 0 0-6l-7-7a4 4 0 0 0-6 0z" fill="var(--accent)" stroke="var(--dark)" stroke-width="4" stroke-linejoin="round"/>
  </svg>`,

  // Chincheta (seleccionar)
  chincheta: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 58S14 39 14 26a18 18 0 0 1 36 0c0 13-18 32-18 32z" fill="var(--accent)" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/>
    <circle cx="32" cy="26" r="7" fill="#fff" stroke="var(--dark)" stroke-width="3.5"/>
  </svg>`,

  // Más (añadir)
  mas: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="8" y="8" width="48" height="48" rx="14" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <path d="M32 20v24M20 32h24" stroke="var(--accent)" stroke-width="6" stroke-linecap="round"/>
  </svg>`,

  // Portada: cuatro baldosas, una roja
  portada: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="7" y="7" width="22" height="22" rx="7" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <rect x="35" y="7" width="22" height="22" rx="7" fill="var(--accent)" stroke="var(--dark)" stroke-width="4.5"/>
    <rect x="7" y="35" width="22" height="22" rx="7" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <rect x="35" y="35" width="22" height="22" rx="7" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <circle cx="46" cy="18" r="3.4" fill="#fff"/>
  </svg>`,

  // Agenda: libreta con espiral, renglones y marcapáginas rojo
  agenda: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="11" y="8" width="44" height="50" rx="9" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <path d="M11 20h44" stroke="var(--dark)" stroke-width="4"/>
    <g fill="var(--dark)"><rect x="19" y="3" width="5" height="11" rx="2.5"/><rect x="30" y="3" width="5" height="11" rx="2.5"/><rect x="41" y="3" width="5" height="11" rx="2.5"/></g>
    <g stroke="var(--dark)" stroke-width="3" stroke-linecap="round" opacity=".6"><path d="M19 30h18M19 38h22M19 46h14"/></g>
    <path d="M43 20v20l4.5-3.6 4.5 3.6V20" fill="var(--accent)" stroke="var(--dark)" stroke-width="2.6" stroke-linejoin="round"/>
  </svg>`,

  // Tickets: tique con borde de sierra y una moneda roja
  tickets: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M14 6h36v48l-4.5-3.5-4.5 3.5-4.5-3.5-4.5 3.5-4.5-3.5-4.5 3.5-4.5-3.5L14 54z" fill="#fff" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/>
    <g stroke="var(--dark)" stroke-width="3" stroke-linecap="round"><path d="M21 16h22" /><path d="M21 24h14" opacity=".6"/><path d="M21 32h10" opacity=".6"/></g>
    <circle cx="42" cy="40" r="9" fill="var(--accent)" stroke="#fff" stroke-width="2.6"/>
    <path d="M45 36.6a4.6 4.6 0 1 0 0 6.8M37 39h6M37 41.6h6" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round"/>
  </svg>`,

  // Sitios: casita con puerta roja
  sitios: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M6 31L32 9l26 22" fill="none" stroke="var(--dark)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13 27v27a4 4 0 0 0 4 4h30a4 4 0 0 0 4-4V27" fill="#fff" stroke="var(--dark)" stroke-width="4.5" stroke-linejoin="round"/>
    <rect x="26" y="37" width="12" height="21" rx="3" fill="var(--accent)" stroke="var(--dark)" stroke-width="3"/>
    <circle cx="35" cy="48" r="1.6" fill="#fff"/>
    <rect x="42" y="12" width="7" height="12" rx="2" fill="var(--dark)"/>
  </svg>`,

  // Listas: hoja con casillas, una marcada en rojo
  listas: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="10" y="6" width="44" height="52" rx="9" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <g fill="none" stroke="var(--dark)" stroke-width="2.8" stroke-linejoin="round"><rect x="17.5" y="16.5" width="9" height="9" rx="2.5"/><rect x="17.5" y="30.5" width="9" height="9" rx="2.5"/><rect x="17.5" y="44.5" width="9" height="9" rx="2.5"/></g>
    <path d="M19.4 21l2.2 2.2 3.6-4.4" fill="none" stroke="var(--accent)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <g stroke="var(--dark)" stroke-width="3.4" stroke-linecap="round"><path d="M32 21h15" stroke="var(--accent)"/><path d="M32 35h15"/><path d="M32 49h10" opacity=".6"/></g>
  </svg>`,

  // Bloc de notas: libreta con anillas, líneas y un candado rojo
  bloc: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="12" y="7" width="38" height="50" rx="8" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <g stroke="var(--dark)" stroke-width="3.2" stroke-linecap="round"><path d="M8 17h8M8 27h8M8 37h8M8 47h8"/></g>
    <g stroke="var(--dark)" stroke-width="2.6" stroke-linecap="round" opacity=".55"><path d="M22 18h20M22 26h20M22 34h12"/></g>
    <rect x="35" y="36" width="20" height="17" rx="4.5" fill="var(--accent)" stroke="#fff" stroke-width="2.4"/>
    <path d="M39.5 36.5v-3.2a5.5 5.5 0 0 1 11 0v3.2" fill="none" stroke="var(--dark)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="45" cy="44.5" r="2.4" fill="#fff"/>
  </svg>`,

  // Calendario: marco oscuro, anillas, cuadrícula con dos «hechos» y un punto rojo
  calendario: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="8" y="12" width="48" height="45" rx="10" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <path d="M8 22a10 10 0 0 1 10-10h28a10 10 0 0 1 10 10v4H8z" fill="var(--dark)"/>
    <rect x="18" y="5" width="7" height="14" rx="3.5" fill="var(--dark)" stroke="#fff" stroke-width="2"/>
    <rect x="39" y="5" width="7" height="14" rx="3.5" fill="var(--dark)" stroke="#fff" stroke-width="2"/>
    <g fill="none" stroke="var(--dark)" stroke-width="2.6">
      <rect x="14.5" y="31.5" width="9" height="8" rx="2.5"/><rect x="27.5" y="31.5" width="9" height="8" rx="2.5"/><rect x="40.5" y="31.5" width="9" height="8" rx="2.5"/>
      <rect x="14.5" y="43.5" width="9" height="8" rx="2.5"/><rect x="27.5" y="43.5" width="9" height="8" rx="2.5"/><rect x="40.5" y="43.5" width="9" height="8" rx="2.5"/>
    </g>
    <path d="M16.6 35.6l2 2 3.4-4" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M29.6 35.6l2 2 3.4-4" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="32" cy="47.5" r="2.6" fill="var(--accent)"/>
  </svg>`,

  // Engranaje de configuración con centro rojo
  ajustes: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path fill="var(--dark)" d="M28 6h8l1.6 7.2a19 19 0 0 1 5.3 2.2l6.2-4 5.7 5.7-4 6.2a19 19 0 0 1 2.2 5.3L60 30v8l-7.2 1.6a19 19 0 0 1-2.2 5.3l4 6.2-5.7 5.7-6.2-4a19 19 0 0 1-5.3 2.2L36 62h-8l-1.6-7.2a19 19 0 0 1-5.3-2.2l-6.2 4-5.7-5.7 4-6.2a19 19 0 0 1-2.2-5.3L4 38v-8l7.2-1.6a19 19 0 0 1 2.2-5.3l-4-6.2 5.7-5.7 6.2 4a19 19 0 0 1 5.3-2.2z"/>
    <circle cx="32" cy="34" r="13" fill="#fff"/>
    <circle cx="32" cy="34" r="6.5" fill="var(--accent)"/>
  </svg>`,

  // Portapapeles (volver al tablero de tareas)
  tablero: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="10" y="10" width="44" height="49" rx="9" fill="#fff" stroke="var(--dark)" stroke-width="4.5"/>
    <path d="M22 8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8H22z" fill="var(--dark)"/>
    <circle cx="32" cy="9" r="2.4" fill="#fff"/>
    <g fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="16.5" y="22.5" width="9" height="9" rx="2.5" stroke="var(--dark)"/>
      <rect x="16.5" y="38.5" width="9" height="9" rx="2.5" stroke="var(--dark)"/>
      <path d="M18.5 27l2 2 3.4-4" stroke="var(--accent)"/>
    </g>
    <rect x="29" y="24" width="18" height="3.6" rx="1.8" fill="var(--dark)"/>
    <rect x="29" y="30" width="11" height="3.2" rx="1.6" fill="var(--accent)"/>
    <rect x="29" y="40" width="18" height="3.6" rx="1.8" fill="var(--dark)"/>
    <circle cx="21" cy="43" r="2.4" fill="var(--accent)"/>
  </svg>`,

  buscar: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="27" cy="27" r="16" fill="#fff" stroke="var(--dark)" stroke-width="6"/>
    <path d="M39 39l14 14" stroke="var(--accent)" stroke-width="8" stroke-linecap="round"/>
  </svg>`,

  mic: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="22" y="6" width="20" height="34" rx="10" fill="var(--accent)" stroke="var(--dark)" stroke-width="4"/>
    <path d="M14 30a18 18 0 0 0 36 0" fill="none" stroke="var(--dark)" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M32 48v9M23 58h18" stroke="var(--dark)" stroke-width="4.5" stroke-linecap="round"/>
  </svg>`
};
function icono(nombre){ return ICO[nombre] || ''; }
