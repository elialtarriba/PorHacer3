/* PorHacer3 · Idioma de la app (V19.5)
   Castellano (es) · Català (ca) · English (en).
   La app está escrita en castellano. Este archivo traduce lo que se ve en pantalla
   (textos, botones, títulos, ayudas) en cuanto aparece, sin tocar lo que escribes tú
   (tareas, listas, notas…). Se va completando por partes:
   1ª parte: portada, menús, Tareas, filtros, editor de tareas y Configuración (menú y General). */

const I18N = {
  lang: (() => { try{ return localStorage.getItem('ph3-idioma') || 'es'; }catch(e){ return 'es'; } })(),
  NOMBRES: { es:'Castellano', ca:'Català', en:'English' },

  // castellano → [català, english]
  D: {
    // ---------- General / portada ----------
    'Tus tareas, tu agenda, tus tickets y tus sitios': ['Les teves tasques, la teva agenda, els teus tiquets i els teus llocs', 'Your tasks, your diary, your receipts and your places'],
    'Portada': ['Portada', 'Home'],
    'Ir a la portada': ['Anar a la portada', 'Go to the home screen'],
    'Nube': ['Núvol', 'Cloud'],
    'Conexión': ['Connexió', 'Connection'],
    'Colores de la portada': ['Colors de la portada', 'Home screen colours'],
    '↕️ Mantén pulsado un botón y arrástralo para cambiarlo de sitio': ['↕️ Mantén premut un botó i arrossega’l per canviar-lo de lloc', '↕️ Press and hold a button and drag it to move it'],
    'Tareas': ['Tasques', 'Tasks'],
    'Calendario Tareas': ['Calendari Tasques', 'Task calendar'],
    'Listas': ['Llistes', 'Lists'],
    'Agenda': ['Agenda', 'Diary'],
    'Tickets': ['Tiquets', 'Receipts'],
    'Sitios': ['Llocs', 'Places'],
    'Mis sitios': ['Els meus llocs', 'My places'],
    'Calculadora': ['Calculadora', 'Calculator'],
    'Grabar': ['Gravar', 'Record'],
    'Escribir': ['Escriure', 'Write'],
    'Reunión de Teams': ['Reunió de Teams', 'Teams meeting'],
    'Personal': ['Personal', 'Personal'],
    'Personal 2': ['Personal 2', 'Personal 2'],
    'Manual': ['Manual', 'Manual'],
    'Hoja de cálculo': ['Full de càlcul', 'Spreadsheet'],
    'Notas secretas': ['Notes secretes', 'Secret notes'],
    'Configuración': ['Configuració', 'Settings'],
    'Bloc de notas': ['Bloc de notes', 'Notepad'],
    'Buenos días': ['Bon dia', 'Good morning'],
    'Buenas tardes': ['Bona tarda', 'Good afternoon'],
    'Buenas noches': ['Bona nit', 'Good evening'],

    // ---------- Botones comunes ----------
    'Cerrar': ['Tancar', 'Close'],
    '✕ Cerrar': ['✕ Tancar', '✕ Close'],
    'Cancelar': ['Cancel·lar', 'Cancel'],
    'Aceptar': ['Acceptar', 'OK'],
    'Vale': ['D’acord', 'OK'],
    'Guardar': ['Desar', 'Save'],
    '💾 Guardar': ['💾 Desar', '💾 Save'],
    'Guardar los cambios': ['Desar els canvis', 'Save changes'],
    '✓ Guardado': ['✓ Desat', '✓ Saved'],
    'Borrar': ['Esborrar', 'Delete'],
    '🗑 Borrar': ['🗑 Esborrar', '🗑 Delete'],
    '🧹 Borrar': ['🧹 Esborrar', '🧹 Clear'],
    'Deshacer': ['Desfer', 'Undo'],
    '↶ Deshacer': ['↶ Desfer', '↶ Undo'],
    'Rehacer': ['Refer', 'Redo'],
    'Añadir': ['Afegir', 'Add'],
    'Atrás': ['Enrere', 'Back'],
    'Anterior': ['Anterior', 'Previous'],
    'Siguiente': ['Següent', 'Next'],
    'Opciones': ['Opcions', 'Options'],
    'Dictar': ['Dictar', 'Dictate'],
    'Hoy': ['Avui', 'Today'],
    'Día': ['Dia', 'Day'],
    'Mes': ['Mes', 'Month'],
    'Año': ['Any', 'Year'],
    'Columna': ['Columna', 'Column'],
    'Buscar y crear PDF': ['Cercar i crear PDF', 'Search and create PDF'],

    // ---------- Tareas: tablero ----------
    'Colores de Tareas': ['Colors de Tasques', 'Task colours'],
    'Buscar tareas, personas, notas…': ['Cercar tasques, persones, notes…', 'Search tasks, people, notes…'],
    'Borrar búsqueda': ['Esborrar la cerca', 'Clear search'],
    'Filtrar': ['Filtrar', 'Filter'],
    'Todas': ['Totes', 'All'],
    'Columnas visibles': ['Columnes visibles', 'Visible columns'],
    'Nueva tarea': ['Tasca nova', 'New task'],
    'En curso': ['En curs', 'In progress'],
    'En pausa': ['En pausa', 'On hold'],
    'Acabada': ['Acabada', 'Done'],
    'Archivada': ['Arxivada', 'Archived'],
    'Sin tareas.': ['Sense tasques.', 'No tasks.'],
    'Arrastra aquí o pulsa ＋': ['Arrossega aquí o prem ＋', 'Drag here or tap ＋'],
    'Nada con este filtro': ['Res amb aquest filtre', 'Nothing with this filter'],
    'Sin título': ['Sense títol', 'Untitled'],
    'Arrastra para mover la columna': ['Arrossega per moure la columna', 'Drag to move the column'],
    'Mover columna': ['Moure la columna', 'Move column'],
    'Marcar como acabada': ['Marcar com a acabada', 'Mark as done'],
    'Aviso con sonido': ['Avís amb so', 'Alarm with sound'],
    'Se le ha enviado por email': ['Se li ha enviat per correu', 'Sent by email'],
    'Con quién se comparte': ['Amb qui es comparteix', 'Shared with'],
    '☀️ Hoy': ['☀️ Avui', '☀️ Today'],
    'Baja': ['Baixa', 'Low'],
    'Media': ['Mitjana', 'Medium'],
    'Alta': ['Alta', 'High'],
    'Ver tareas': ['Veure tasques', 'Show tasks'],
    '📋 Todas': ['📋 Totes', '📋 All'],
    '☀️ Para hoy': ['☀️ Per avui', '☀️ Due today'],
    '🗓️ Esta semana': ['🗓️ Aquesta setmana', '🗓️ This week'],
    '⏰ Vencidas': ['⏰ Vençudes', '⏰ Overdue'],
    '🔥 Prioridad alta': ['🔥 Prioritat alta', '🔥 High priority'],
    '➖ Sin fecha': ['➖ Sense data', '➖ No date'],
    'Asignadas a': ['Assignades a', 'Assigned to'],

    // ---------- Editor de tareas ----------
    '¿Qué hay que hacer?': ['Què s’ha de fer?', 'What needs doing?'],
    'Dictar título': ['Dictar el títol', 'Dictate title'],
    '📝 Tarea': ['📝 Tasca', '📝 Task'],
    '📷 Fotos': ['📷 Fotos', '📷 Photos'],
    '🎬 Vídeos': ['🎬 Vídeos', '🎬 Videos'],
    '🎙️ Audio': ['🎙️ Àudio', '🎙️ Audio'],
    '🖼️ Insertar imagen en la nota': ['🖼️ Inserir una imatge a la nota', '🖼️ Insert image in the note'],
    'Dictar nota': ['Dictar la nota', 'Dictate note'],
    'Color de la tarea': ['Color de la tasca', 'Task colour'],
    'Prioridad': ['Prioritat', 'Priority'],
    'Ninguna': ['Cap', 'None'],
    'Fecha inicio': ['Data d’inici', 'Start date'],
    'Fecha fin': ['Data final', 'End date'],
    'Sin fecha': ['Sense data', 'No date'],
    'Quitar fecha': ['Treure la data', 'Remove date'],
    'Poner la fecha de hoy': ['Posar la data d’avui', 'Set today’s date'],
    '🔔 Avisos con sonido': ['🔔 Avisos amb so', '🔔 Alarms with sound'],
    '(solo te suenan a ti)': ['(només et sonen a tu)', '(only you hear them)'],
    '⏰ Aviso 1': ['⏰ Avís 1', '⏰ Alarm 1'],
    '⏰ Aviso 2': ['⏰ Avís 2', '⏰ Alarm 2'],
    'Quitar aviso': ['Treure l’avís', 'Remove alarm'],
    'Asignada a': ['Assignada a', 'Assigned to'],
    '＋ Persona': ['＋ Persona', '＋ Person'],
    'Enviar la tarea por email al guardar': ['Enviar la tasca per correu en desar', 'Email the task when saving'],
    '🔔 Enviar un recordatorio por email': ['🔔 Enviar un recordatori per correu', '🔔 Send an email reminder'],
    'Pasos': ['Passos', 'Steps'],
    'Añadir un paso…': ['Afegir un pas…', 'Add a step…'],
    '📅 Al calendario del móvil': ['📅 Al calendari del mòbil', '📅 To the phone calendar'],
    '📹 Reunión de Teams': ['📹 Reunió de Teams', '📹 Teams meeting'],
    '⧉ Duplicar': ['⧉ Duplicar', '⧉ Duplicate'],
    '📝 Pasar a una lista': ['📝 Passar a una llista', '📝 Move to a list'],
    '✓ Lo marcado se hará al pulsar': ['✓ El que està marcat es farà en prémer', '✓ What is ticked happens when you tap'],
    '📋 Tablero de esta tarea': ['📋 Tauler d’aquesta tasca', '📋 Board for this task'],
    'Elige otro tablero para moverla allí, con sus fotos, vídeos y audios.': ['Tria un altre tauler per moure-la allà, amb les fotos, els vídeos i els àudios.', 'Choose another board to move it there, with its photos, videos and audio.'],
    '🗑 Borrar esta tarea': ['🗑 Esborrar aquesta tasca', '🗑 Delete this task'],
    '📸 Hacer foto': ['📸 Fer una foto', '📸 Take photo'],
    '🖼️ Elegir fotos': ['🖼️ Triar fotos', '🖼️ Choose photos'],
    'Las fotos se aligeran solas antes de guardarse.': ['Les fotos s’alleugereixen soles abans de desar-se.', 'Photos are made lighter automatically before saving.'],
    '🎥 Grabar vídeo': ['🎥 Gravar vídeo', '🎥 Record video'],
    '🎞️ Elegir vídeo': ['🎞️ Triar vídeo', '🎞️ Choose video'],
    'Los vídeos se aligeran (tamaño y calidad) antes de guardarse.': ['Els vídeos s’alleugereixen (mida i qualitat) abans de desar-se.', 'Videos are made lighter (size and quality) before saving.'],
    'Aligerando vídeo…': ['Alleugerint el vídeo…', 'Making the video lighter…'],
    '🎙️ Grabar nota de audio': ['🎙️ Gravar una nota d’àudio', '🎙️ Record audio note'],
    'Graba una nota de voz: la escuchas y decides si la guardas.': ['Grava una nota de veu: l’escoltes i decideixes si la deses.', 'Record a voice note: listen to it and decide whether to keep it.'],

    // ---------- Listas (cabecera) ----------
    'Opciones de lista': ['Opcions de la llista', 'List options'],
    'Agregar un punto a la lista': ['Afegir un punt a la llista', 'Add an item to the list'],
    'Completado': ['Completat', 'Completed'],
    '✓ Completado': ['✓ Completat', '✓ Completed'],
    '↶ Pendiente': ['↶ Pendent', '↶ To do'],
    '📋 Al PorHacer': ['📋 Al PorHacer', '📋 To PorHacer'],

    // ---------- Portada (baldosas y fecha) ----------
    'Sin tareas hoy': ['Sense tasques avui', 'No tasks today'],
    'Agenda libre': ['Agenda lliure', 'Diary free'],
    'Todo hecho ✨': ['Tot fet ✨', 'All done ✨'],
    'Tus tareas por días': ['Les teves tasques per dies', 'Your tasks by day'],
    'Nada para hoy': ['Res per avui', 'Nothing for today'],
    'Ninguno este mes': ['Cap aquest mes', 'None this month'],
    'Empieza por tu casa': ['Comença per casa teva', 'Start with your home'],
    'Cuentas, % e IVA': ['Comptes, % i IVA', 'Sums, % and VAT'],
    'Notas de voz': ['Notes de veu', 'Voice notes'],
    'Escribe o dicta': ['Escriu o dicta', 'Type or dictate'],
    'Crea una reunión': ['Crea una reunió', 'Create a meeting'],
    'Toca para configurarla': ['Toca per configurar-la', 'Tap to set it up'],
    'Cómo funciona todo': ['Com funciona tot', 'How everything works'],
    'Números y sumas': ['Números i sumes', 'Numbers and sums'],
    'Escribe en secreto': ['Escriu en secret', 'Write in secret'],
    'Al abrir · temas · copias': ['En obrir · temes · còpies', 'On opening · themes · backups'],
    'Conectada a internet': ['Connectada a internet', 'Connected to the internet'],
    'Ver el año de la agenda': ['Veure l’any de l’agenda', 'See the diary year'],
    'Toca para elegir el país': ['Toca per triar el país', 'Tap to choose the country'],
    'Reloj del mundo': ['Rellotge del món', 'World clock'],
    'Reloj': ['Rellotge', 'Clock'],
    'Toca para grabar una nota de voz': ['Toca per gravar una nota de veu', 'Tap to record a voice note'],
    'Lunes': ['Dilluns', 'Monday'], 'Martes': ['Dimarts', 'Tuesday'], 'Miércoles': ['Dimecres', 'Wednesday'], 'Jueves': ['Dijous', 'Thursday'],
    'Viernes': ['Divendres', 'Friday'], 'Sábado': ['Dissabte', 'Saturday'], 'Domingo': ['Diumenge', 'Sunday'],
    'Ene': ['Gen', 'Jan'], 'Abr': ['Abr', 'Apr'], 'May': ['Mai', 'May'], 'Ago': ['Ago', 'Aug'], 'Sep': ['Set', 'Sep'], 'Dic': ['Des', 'Dec'],

    // ---------- Tareas (más) ----------
    'Sin conectar (toca para entrar)': ['Sense connexió (toca per entrar)', 'Not connected (tap to sign in)'],
    'Ocultar columna': ['Amagar la columna', 'Hide column'],
    'Mostrar columna': ['Mostrar la columna', 'Show column'],
    'Sin color': ['Sense color', 'No colour'],
    '＋ A mi paleta': ['＋ A la meva paleta', '＋ To my palette'],
    '✎ Editar paleta': ['✎ Editar la paleta', '✎ Edit palette'],
    'Guardar este color, con un nombre, en mi paleta': ['Desar aquest color, amb un nom, a la meva paleta', 'Save this colour, with a name, in my palette'],
    'Ver y quitar colores de mi paleta': ['Veure i treure colors de la meva paleta', 'See and remove colours from my palette'],
    'Elige antes a quién se asigna': ['Tria abans a qui s’assigna', 'First choose who it is assigned to'],
    '(opcional) divide la tarea en pasos': ['(opcional) divideix la tasca en passos', '(optional) split the task into steps'],
    'Negrita': ['Negreta', 'Bold'],
    'Cursiva': ['Cursiva', 'Italic'],
    'Tachado': ['Ratllat', 'Strikethrough'],
    'Subrayado': ['Subratllat', 'Underline'],

    // fragmentos de ayuda de General (van partidos por las negritas)
    'Quita la marca de los que no uses y desaparecerán de la portada. Vuelve a marcarlos para que salgan otra vez. Lo que tengas guardado no se borra.': ['Treu la marca dels que no facis servir i desapareixeran de la portada. Torna-hi a posar la marca perquè surtin un altre cop. El que tinguis desat no s’esborra.', 'Untick the ones you don’t use and they will disappear from the home screen. Tick them again to bring them back. Nothing you have saved is deleted.'],
    'siempre se ve.': ['sempre es veu.', 'is always shown.'],
    'Para cambiar de sitio un botón de la portada,': ['Per canviar de lloc un botó de la portada,', 'To move a home screen button,'],
    'mantenlo pulsado': ['mantén-lo premut', 'press and hold it'],
    'un momento y': ['un moment i', 'for a moment and'],
    'arrástralo': ['arrossega’l', 'drag it'],
    'donde quieras.': ['on vulguis.', 'wherever you want.'],
    'Los': ['Els', 'The'],
    'colores': ['colors', 'colours'],
    'de toda la app están en': ['de tota l’app són a', 'for the whole app are in'],
    '🎨 Tema y colores ›': ['🎨 Tema i colors ›', '🎨 Theme and colours ›'],
    'cuenta': ['compte', 'account'],
    'dónde se guarda': ['on es desa', 'where'],
    'cada cosa, en': ['cada cosa, a', 'each thing is saved, in'],
    '☁️ Cuenta y nube ›': ['☁️ Compte i núvol ›', '☁️ Account and cloud ›'],
    // nombres de los temas de colores
    'Como la app': ['Com l’app', 'Like the app'],
    '⚪ Con fondo blanco': ['⚪ Amb fons blanc', '⚪ White background'],
    'Blanco y rojo': ['Blanc i vermell', 'White and red'], 'Blanco y azul': ['Blanc i blau', 'White and blue'], 'Blanco y azul celeste': ['Blanc i blau cel', 'White and sky blue'],
    'Blanco y verde': ['Blanc i verd', 'White and green'], 'Blanco y verde lima': ['Blanc i verd llima', 'White and lime'], 'Blanco y rosa': ['Blanc i rosa', 'White and pink'],
    'Blanco y lila': ['Blanc i lila', 'White and lilac'], 'Blanco y naranja': ['Blanc i taronja', 'White and orange'], 'Blanco y amarillo': ['Blanc i groc', 'White and yellow'],
    'Blanco y marrón': ['Blanc i marró', 'White and brown'], 'Blanco y negro': ['Blanc i negre', 'Black and white'],
    '🏠 Como en HOME': ['🏠 Com a HOME', '🏠 Like HOME'], 'HOME · Lavanda (original)': ['HOME · Lavanda (original)', 'HOME · Lavender (original)'],
    'HOME · Tonos del logo': ['HOME · Tons del logo', 'HOME · Logo tones'], 'HOME · Marrón pastel': ['HOME · Marró pastel', 'HOME · Pastel brown'], 'HOME · Miel y naranja': ['HOME · Mel i taronja', 'HOME · Honey and orange'],
    '✨ Especiales, con fondo de dos colores': ['✨ Especials, amb fons de dos colors', '✨ Specials, two-colour background'],
    'Atardecer': ['Posta de sol', 'Sunset'], 'Mar Mediterráneo': ['Mar Mediterrània', 'Mediterranean Sea'], 'Bosque encantado': ['Bosc encantat', 'Enchanted forest'],
    'Limón y menta': ['Llimona i menta', 'Lemon and mint'], 'Uva y oro': ['Raïm i or', 'Grape and gold'], 'Coral y turquesa': ['Corall i turquesa', 'Coral and turquoise'],
    'Algodón de azúcar': ['Cotó de sucre', 'Candy floss'], 'Café con leche': ['Cafè amb llet', 'Café au lait'], 'Cielo de verano': ['Cel d’estiu', 'Summer sky'], 'Lavanda y menta': ['Lavanda i menta', 'Lavender and mint'],
    '🌸 Pasteles (como la agenda de HOME)': ['🌸 Pastels (com l’agenda de HOME)', '🌸 Pastels (like the HOME diary)'],
    'Pastel salvia': ['Pastel sàlvia', 'Sage pastel'], 'Pastel azul': ['Pastel blau', 'Blue pastel'], 'Pastel rosa': ['Pastel rosa', 'Pink pastel'], 'Pastel lavanda': ['Pastel lavanda', 'Lavender pastel'], 'Pastel miel': ['Pastel mel', 'Honey pastel'],
    '🎨 Con fondo de color': ['🎨 Amb fons de color', '🎨 Coloured background'],
    'Grises y rojo (como los iconos)': ['Grisos i vermell (com les icones)', 'Greys and red (like the icons)'], 'Marrones claros': ['Marrons clars', 'Light browns'],
    'Rosa': ['Rosa', 'Pink'], 'Verde lima': ['Verd llima', 'Lime green'], 'Verde': ['Verd', 'Green'], 'Azul celeste': ['Blau cel', 'Sky blue'], 'Naranja': ['Taronja', 'Orange'], 'Amarillo': ['Groc', 'Yellow'],
    'Naranja · amarillo · marrón': ['Taronja · groc · marró', 'Orange · yellow · brown'], 'Lima · verde · marrón': ['Llima · verd · marró', 'Lime · green · brown'], 'Rosa · marrón · amarillo': ['Rosa · marró · groc', 'Pink · brown · yellow'],

    // ---------- Configuración: menú ----------
    'Volver al menú de configuración': ['Tornar al menú de configuració', 'Back to the settings menu'],
    'Colores de Configuración': ['Colors de Configuració', 'Settings colours'],
    'Apartados de la configuración': ['Apartats de la configuració', 'Settings sections'],
    'Para toda la app': ['Per a tota l’app', 'For the whole app'],
    'Cada apartado': ['Cada apartat', 'Each section'],
    'General': ['General', 'General'],
    'Qué se ve al abrir · micrófono': ['Què es veu en obrir · micròfon', 'What opens first · microphone'],
    'Qué se ve al abrir · idioma · micrófono': ['Què es veu en obrir · idioma · micròfon', 'What opens first · language · microphone'],
    'Tema y colores': ['Tema i colors', 'Theme and colours'],
    'Los colores de toda la app': ['Els colors de tota l’app', 'Colours for the whole app'],
    'Cuenta y nube': ['Compte i núvol', 'Account and cloud'],
    'Tu cuenta, tus tableros y dónde se guarda cada cosa': ['El teu compte, els teus taulers i on es desa cada cosa', 'Your account, your boards and where each thing is saved'],
    'Guardar: nube o aparato': ['Desar: núvol o aparell', 'Save: cloud or device'],
    'Dónde se guarda cada apartado': ['On es desa cada apartat', 'Where each section is saved'],
    'Copias de seguridad': ['Còpies de seguretat', 'Backups'],
    'Exportar e importar tus datos': ['Exportar i importar les teves dades', 'Export and import your data'],
    'Colores, columnas, personas, al acabar, fotos y emails': ['Colors, columnes, persones, en acabar, fotos i correus', 'Colours, columns, people, when done, photos and emails'],
    'Cómo se ve al abrirlo · colores': ['Com es veu en obrir-lo · colors', 'How it looks when opened · colours'],
    'El color de cada lista · sonidos': ['El color de cada llista · sons', 'Each list’s colour · sounds'],
    'Cómo se ve al abrirla · colores': ['Com es veu en obrir-la · colors', 'How it looks when opened · colours'],
    'Colores de los tickets': ['Colors dels tiquets', 'Receipt colours'],
    'Colores · el color de cada casa': ['Colors · el color de cada casa', 'Colours · each home’s colour'],
    'Temas de la calculadora': ['Temes de la calculadora', 'Calculator themes'],
    'Contraseña y copia': ['Contrasenya i còpia', 'Password and backup'],
    'Dónde se guardan las notas · colores': ['On es desen les notes · colors', 'Where notes are saved · colours'],
    'El nombre del botón · cómo funciona': ['El nom del botó · com funciona', 'The button name · how it works'],
    'Webs personales': ['Webs personals', 'Personal websites'],
    'Los botones «Personal» · web, usuario y contraseña': ['Els botons «Personal» · web, usuari i contrasenya', 'The “Personal” buttons · website, user and password'],

    // ---------- Configuración › General ----------
    '🌐 Idioma de la app': ['🌐 Idioma de l’app', '🌐 App language'],
    '🚪 Al abrir la app, ver…': ['🚪 En obrir l’app, veure…', '🚪 When the app opens, show…'],
    'Lo primero que se ve al entrar en la app, en este aparato.': ['El primer que es veu en entrar a l’app, en aquest aparell.', 'The first thing you see when opening the app, on this device.'],
    'Colores de la portada': ['Colors de la portada', 'Home screen colours'],
    'Solo cambia la pantalla de inicio (también con el botón 🎨 de la portada).': ['Només canvia la pantalla d’inici (també amb el botó 🎨 de la portada).', 'Only changes the home screen (also with the 🎨 button on the home screen).'],
    '👁 Botones de la portada': ['👁 Botons de la portada', '👁 Home screen buttons'],
    '↕️ Orden de la portada': ['↕️ Ordre de la portada', '↕️ Home screen order'],
    '↺ Volver al orden de siempre': ['↺ Tornar a l’ordre de sempre', '↺ Back to the usual order'],
    '🎤 Idioma del micrófono': ['🎤 Idioma del micròfon', '🎤 Microphone language'],
    '👤 Mis datos': ['👤 Les meves dades', '👤 My details'],
    '👤 Ver mis datos · cambiar la contraseña': ['👤 Veure les meves dades · canviar la contrasenya', '👤 See my details · change password'],
    'Tu usuario de entrada y tu contraseña (no se ve). Desde aquí puedes cambiarla o pedir un correo si la has olvidado.': ['El teu usuari d’entrada i la contrasenya (no es veu). Des d’aquí la pots canviar o demanar un correu si l’has oblidat.', 'Your login and password (hidden). From here you can change it or request an email if you have forgotten it.'],
    'Para dictar en las tareas, la agenda y las notas. Puedes decir «coma», «punto», «punto y aparte», «nueva línea».': ['Per dictar a les tasques, l’agenda i les notes. Pots dir «coma», «punt», «punt i a part», «línia nova».', 'For dictating in tasks, the diary and notes. You can say “comma”, “full stop”, “new paragraph”, “new line”.'],
  },

  // textos que cambian (con nombres, números o fechas dentro)
  P: [
    [/^Movida a «(.+)»$/, m => ['Moguda a «' + I18N.t(m[1]) + '»', 'Moved to “' + I18N.t(m[1]) + '”']],
    [/^🗑 «(.+)» borrado$/, m => ['🗑 «' + m[1] + '» esborrat', '🗑 “' + m[1] + '” deleted']],
    [/^(Buenos días|Buenas tardes|Buenas noches)(, .+?)? (\S+)$/u, m => { const s = I18N.D[m[1]]; return [s[0] + (m[2] || '') + ' ' + m[3], s[1] + (m[2] || '') + ' ' + m[3]]; }],
    [/^Añadir tarea en (.+)$/, m => ['Afegir una tasca a ' + I18N.t(m[1]), 'Add task to ' + I18N.t(m[1])]],
    [/^(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de (\d{4})$/,
      m => { const me = I18N.MESES_ES.indexOf(m[2]); return [m[1] + (/^[ao]/.test(I18N.MESES_CA[me]) ? ' d’' : ' de ') + I18N.MESES_CA[me] + ' de ' + m[3], m[1] + ' ' + I18N.MESES_EN[me] + ' ' + m[3]]; }],
    [/^Ahora: (.+)$/, m => ['Ara: ' + I18N.t(m[1]), 'Now: ' + I18N.t(m[1])]],
    [/^PorHacer3? (V[\d.]+)$/, m => [m[0], m[0]]],
    [/^(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo), (\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(.*)$/,
      m => { const d = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].indexOf(m[1]), me = I18N.MESES_ES.indexOf(m[3]);
        const ca = ['Diumenge','Dilluns','Dimarts','Dimecres','Dijous','Divendres','Dissabte'][d] + ', ' + m[2] + (/^[ao]/.test(I18N.MESES_CA[me]) ? ' d’' : ' de ') + I18N.MESES_CA[me];
        const en = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d] + ', ' + m[2] + ' ' + I18N.MESES_EN[me];
        const resto = (m[4] || '').replace(' · en este aparato', '');
        const extra = (m[4] || '').includes('en este aparato');
        return [ca + resto + (extra ? ' · en aquest aparell' : ''), en + resto + (extra ? ' · on this device' : '')]; }],
  ],
  MESES_ES: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
  MESES_CA: ['gener','febrer','març','abril','maig','juny','juliol','agost','setembre','octubre','novembre','desembre'],
  MESES_EN: ['January','February','March','April','May','June','July','August','September','October','November','December'],

  // lo que escribes tú no se traduce nunca
  NO: '.t-tit, .t-nota, .ls-txt, .ls-titulo b, [contenteditable], textarea, input, script, style, .no-i18n, #esHoja, .pv-pagina, .celda, .bloc-texto',

  t(s){
    if(this.lang === 'es' || s == null) return s;
    const i = this.lang === 'ca' ? 0 : 1, k = String(s).replace(/\s+/g, ' ').trim();
    if(!k) return s;
    const d = this.D[k]; if(d) return d[i];
    for(const [re, fn] of this.P){ const m = k.match(re); if(m){ try{ return fn(m)[i]; }catch(e){ return s; } } }
    const c = this.contar(k, i); if(c) return c;
    // con un emoji o signo delante: «✅ Sin tareas hoy»
    const e = k.match(/^([^\p{L}\d«“(]+)(\p{L}.*)$/u);
    if(e){ const r = this.t(e[2]); if(r !== e[2]) return e[1] + r; }
    return s;
  },
  // «3 tareas este mes», «1 lista · 4 puntos», «2 notas hoy»…
  PAL: { pendiente:['pendent','to do'], pendientes:['pendents','to do'], tarea:['tasca','task'], tareas:['tasques','tasks'], lista:['llista','list'], listas:['llistes','lists'],
    punto:['punt','item'], puntos:['punts','items'], nota:['nota','note'], notas:['notes','notes'], ticket:['tiquet','receipt'], tickets:['tiquets','receipts'],
    hoja:['full','sheet'], hojas:['fulls','sheets'], escrito:['escrit','document'], escritos:['escrits','documents'], 'nota de voz':['nota de veu','voice note'], 'notas de voz':['notes de veu','voice notes'],
    casa:['casa','home'], casas:['cases','homes'], cosa:['cosa','thing'], cosas:['coses','things'] },
  contar(k, i){
    const partes = k.split(' · '); let alguna = false;
    const tr = partes.map(p => {
      const m = p.match(/^(\d+) (.+?)( hoy| este mes)?$/);
      if(m && this.PAL[m[2]]){ alguna = true; return m[1] + ' ' + this.PAL[m[2]][i] + (m[3] === ' hoy' ? [' avui', ' today'][i] : m[3] ? [' aquest mes', ' this month'][i] : ''); }
      return /[a-záéíóúñ]{3}/i.test(p) && !/€/.test(p) ? null : p;
    });
    return alguna && !tr.includes(null) ? tr.join(' · ') : null;
  },
  nodo(n){
    if(n.nodeType === 3){
      const v = n.nodeValue; if(!v || !/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(v)) return;
      const p = n.parentElement; if(!p || p.closest(this.NO)) return;
      const tr = this.t(v); if(tr !== v){ const a = v.match(/^\s*/)[0], b = v.match(/\s*$/)[0]; const nv = a + tr + b; if(nv !== v) n.nodeValue = nv; }
      return;
    }
    if(n.nodeType !== 1) return;
    if(n.matches && n.matches('script,style,textarea')) return;
    const fuera = n.closest && n.closest(this.NO);
    if(!fuera) for(const at of ['title', 'placeholder', 'aria-label']){
      const v = n.getAttribute && n.getAttribute(at); if(v){ const tr = this.t(v); if(tr !== v) n.setAttribute(at, tr); }
    }
    if(fuera && !(n.matches && n.matches('input,textarea'))) return;
    if(n.matches && n.matches('input,textarea') && !n.closest('.no-i18n')){ const v = n.getAttribute('placeholder'); if(v){ const tr = this.t(v); if(tr !== v) n.setAttribute('placeholder', tr); } return; }
    for(const c of n.childNodes) this.nodo(c);
  },
  todo(){ if(this.lang !== 'es') this.nodo(document.body); },
  iniciar(){
    document.documentElement.lang = this.lang;
    if(this.lang === 'es') return;
    this.todo();
    this.obs = new MutationObserver(ms => {
      for(const m of ms){
        if(m.type === 'characterData') this.nodo(m.target);
        else if(m.type === 'attributes') this.nodo(m.target);
        else m.addedNodes.forEach(x => this.nodo(x));
      }
    });
    this.obs.observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['title', 'placeholder', 'aria-label'] });
  },
  // cambiar de idioma: se guarda en este aparato y en los ajustes, y la app se vuelve a abrir
  async poner(l){
    if(!this.NOMBRES[l]) return;
    try{ localStorage.setItem('ph3-idioma', l); }catch(e){}
    try{ if(typeof App !== 'undefined' && App.ajustes){ App.ajustes.idioma = l; await guardarAjustes(); } }catch(e){}
    setTimeout(() => location.reload(), 350);
  }
};
document.addEventListener('DOMContentLoaded', () => I18N.iniciar());
