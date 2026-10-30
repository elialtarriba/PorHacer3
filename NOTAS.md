# Notas de Elisabeth para la app PorHacer3 (hecha a partir de PorHacer)

Aquí se apunta lo que Elisabeth pide sobre la app, para no perder el hilo. Leer este archivo antes de cambiar nada.
















## 2026-10-30 · PorHacer3 · V10

- Pidió poner la versión **V10** (todo lo de las V9.x: portada con temas, botones que se mueven, Grabar, calculadora, temas por apartado, configuración ordenada…).

## 2026-10-30 · PorHacer3 · calculadora

- En la calculadora, al mirar el **historial**, los primeros números quedaban **escondidos detrás de la pantalla**.
- Arreglado: el historial empieza justo debajo de la pantalla (se calcula al abrirlo) y vuelve arriba del todo; el 💬 ya no tapa la operación.

## 2026-10-29 · PorHacer3 · V9.12

- En la **pantalla de inicio (portada)** echaba de menos cambiar el tema, y quería **temas diferentes, dispares unos de otros y bonitos**.
- Hecho: botón **🎨** en la portada (debajo de la versión). Solo cambia la portada. También en Configuración → General → «Colores de la portada» y en Tema y colores.
- 10 temas nuevos **✨ Especiales, con fondo de dos colores**: Atardecer, Mar Mediterráneo, Bosque encantado, Limón y menta, Uva y oro, Coral y turquesa, Algodón de azúcar, Café con leche, Cielo de verano y Lavanda y menta. Sirven para cualquier apartado o para toda la app.

## 2026-10-29 · PorHacer3 · V9.11

- En **Grabar** y en **Configuración** echaba de menos poder cambiar el tema (en Grabar el botón 🎨 ya estaba desde la V9.8, arriba a la derecha).
- Hecho: botón **🎨** en la cabecera de **Configuración** (al lado de ✕): Configuración puede tener su propio tema; al cerrarla vuelven los colores del sitio donde estabas. También en Tema y colores → «Apartados que pueden tener sus propios colores» → Configuración.

## 2026-10-29 · PorHacer3 · V9.10

- En **Mis sitios** echaba de menos la paleta de temas: quería escoger también el **color del fondo de Sitios** (además del color de cada casa).
- Hecho: botón **🎨** arriba a la derecha en Sitios (y en Configuración → Sitios → «Colores de Sitios (fondo y botones)»). Cambia el fondo de «Mis sitios», los botones y las ventanas. Dentro de cada casa sigue mandando el color de la casa.

## 2026-10-29 · PorHacer3 · V9.9

- Echaba de menos el botón de colores en **Calendario Tareas** y quería un **tema propio para la Agenda** (ya estaba en la V9.8: botón 🎨 arriba a la derecha en Calendario Tareas y en Agenda).
- Añadidos 5 temas nuevos, **🌸 Pasteles (como la agenda de HOME)**: salvia, azul, rosa, lavanda y miel. Se pueden elegir para cualquier apartado (Agenda, Calendario Tareas, Tareas, Grabar) o para toda la app.

## 2026-10-29 · PorHacer3 · V9.8

- Pidió encontrar **dentro de Tareas un botón para cambiar el tema de Tareas**.
- Hecho: botón **🎨 (paleta)** arriba en **Tareas**, **Calendario Tareas**, **Agenda** y **Grabar**. Abre «Colores de …» con «Como la app» y todos los temas (también los de HOME). Solo cambia ese apartado (también sus ventanas, como el editor de tareas); al salir vuelven los colores de toda la app. Se guarda en este aparato.
- También en Configuración: en la página de cada apartado («Colores de …») y en Tema y colores → «Apartados que pueden tener sus propios colores» (ahora con Tareas, Calendario Tareas, Agenda y Grabar).

## 2026-10-29 · PorHacer3 · V9.7

- Dijo que en la **agenda intentaba cambiar los colores y no lo hacía**.
- Causa encontrada: la protección contra el «zoom con doble toque» se comía el toque si se tocaba un color justo después de desplazar la ventana (o tocar otro botón) en menos de 0,3 s; además, la lista de «Color del día» era tan larga que había que desplazar para llegar a los colores.
- Arreglado: la protección solo actúa con dos toques seguidos en el mismo sitio y nunca en botones; los colores del día salen en una rejilla de 4, más juntos, y se ven todos sin desplazar.

## 2026-10-29 · PorHacer3 · V9.6

- Pidió cambiar los nombres de los botones: **PorHacer → Tareas** y **Calendario → Calendario Tareas** (en la portada, en Configuración y en «Al abrir la app, ver…»). La app sigue llamándose PorHacer3.

## 2026-10-29 · PorHacer3 · V9.5

- Pidió que **Notas secretas tenga un botón como los demás**: ahora es una baldosa más de la portada (se puede mover como las otras). Su icono es una ruedecita de caja fuerte con candado; al tocarla, la rueda gira, el candado se abre, suena el clic-clic y se abre el bloc. Ya no está la caja fuerte grande de abajo.

## 2026-10-29 · PorHacer3 · V9.4

Lo que pidió:
- Poder **cambiar de posición los botones de la portada** con solo pulsar y arrastrar (p. ej. la calculadora arriba).
- Un botón nuevo **Grabar** (con un icono del estilo de los demás). Dentro, un botón rectangular «Grabar»: pulsar = empieza a grabar una nota de voz; volver a pulsar = para. Las notas van **una debajo de otra**, con la **fecha y la hora** encima y la opción de ponerles **el nombre que quieras**.
  - Deslizar a la **izquierda** → sale **rojo** con «Eliminar» → eliminar **con confirmación**.
  - Deslizar a la **derecha** → sale **naranja** → **guardar la nota en el aparato**.
- Pregunta: ¿se pueden grabar conversaciones telefónicas? (respuesta: no desde la app; el iPhone no deja usar el micrófono a una web durante una llamada; el propio iPhone tiene grabación de llamadas en la app Teléfono).

Hecho:
- Portada: **mantener pulsado** un botón un momento (tiembla) y **arrastrarlo**; el orden se guarda en el aparato. En Configuración → General: «↺ Volver al orden de siempre».
- `grabar.js`: apartado **Grabar** con su baldosa y su icono (marco con ondas y punto rojo). Notas en mp3 ligero, **solo en este aparato** (IndexedDB «PorHacer3-grabaciones»). Escuchar con ▶︎ y barra (tocar la barra para saltar). Si sales del apartado mientras grabas, se para y se guarda.
- Se puede elegir que la app se abra en «Grabar». Configuración → Grabar dice cuántas notas hay y cuánto ocupan.

## 2026-10-29 · PorHacer3 · V9.3

Lo que pidió:
- La **configuración** era liosa: rehacerla desde cero. **Cada apartado con su pestaña** y sus configuraciones dentro; lo que es **para todos los apartados, en otra**. Sobre todo que quede **muy claro a qué pertenecen los temas y los colores**. Las **copias de seguridad, en una pestaña aparte**. Si algo merece su pestaña, adelante. «Tener las configuraciones en un sitio pero ordenado y que no te pierdas con tantos datos».
- En la portada, el **reloj más grande, centrado y con números**.

Hecho:
- Configuración nueva: un **menú** con dos grupos. En el móvil, al tocar se abre su página (con ‹ para volver); en pantalla ancha (Mac), el menú a la izquierda y la página a la derecha.
  - **Para toda la app**: 🏠 General (al abrir, micrófono) · 🎨 Tema y colores (tema de toda la app, cambiar cada color, y la lista de los apartados que tienen colores propios) · ☁️ Cuenta y nube (cuenta, tableros y dónde se guarda cada cosa) · 💾 Copias de seguridad (tareas · Agenda/Tickets/Sitios/Listas · notas secretas).
  - **Cada apartado**: PorHacer (columnas, personas, al acabar, fotos y vídeos, emails) · Calendario (vista al abrir) · Listas (color de cada lista, sonidos, aviso) · Agenda (vista al abrir) · Tickets (colores) · Sitios (color de cada casa) · Calculadora (temas) · Notas secretas.
  - Dentro de cada página, las partes largas se despliegan de una en una, para no ver tantos datos a la vez.
- Reloj de la portada: grande, centrado, con los números del 1 al 12 (12, 3, 6 y 9 en rojo), rayitas de minutos y la hora en números abajo.
- (Después) El reloj era demasiado grande: vuelve el **rectángulo** de antes (día en rojo, fecha y botones) y el reloj con números va **dentro, a la derecha, ocupando el sitio que sobraba**. Le gusta poder cambiar los colores en cada apartado y la configuración nueva.
- Calculadora: quitado el texto «v61 · PorHacer3» de abajo a la derecha.

## 2026-10-29 · PorHacer3 · V9.2

Lo que pidió:
- Poder escoger en **Configuración** si la **Agenda, los Tickets, los Sitios y las Listas** se guardan en **Firebase (nube)** o **en local (este aparato)**, «así cada uno hace lo que le convenga».

Hecho:
- Configuración → 🏠 General → **«¿Dónde se guarda?»**: para cada apartado, ☁️ Nube o 📱 Este aparato. Por defecto, nube.
- Al pasar algo al aparato pregunta qué hacer con lo de la nube: **dejar también una copia** o **quitarlo de la nube**. Al volver a la nube, lo del aparato se sube a tu cuenta.
- Es una elección **de cada aparato** (el móvil de cada uno puede tenerlo distinto). Lo de «este aparato» no se borra al cerrar sesión.
- Las fotos van con su apartado (si los Tickets están en el aparato, sus fotos también).

## 2026-10-29 · PorHacer3 · V9.1

Lo que pidió:
- **Iconos nuevos en gris, blanco y rojo** (el tema de esta app).
- Poner **su calculadora** (la de la carpeta CALCULADORA) dentro de PorHacer3, con su **icono del tema** (gris, blanco y rojo), que **sus colores sigan el tema** de la app y que los **temas de la calculadora estén en Configuración**. La carpeta CALCULADORA no se ha tocado (solo se ha leído).

Hecho:
- Icono nuevo de la app PorHacer3 (4 baldosas: tareas, «3» en rojo, calendario y casita) → `logo.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.
- Iconos dibujados nuevos: calculadora, cámara, galería, paleta, lápiz, chincheta, más (en `iconos.js`, usan los colores del tema). Los iconos de muebles y casas de Sitios (traídos de HOME) ahora son grises, blancos y rojos. Las baldosas de la portada, en rojo y gris según el tema.
- **Calculadora**: `calculadora.html` (+ `logo_elibi.jpg`), se abre desde la portada; arriba a la izquierda el botón de la portada en vez de «Salir». Tema nuevo «Como la app (PorHacer3)», que va cambiando con el tema de la app (si pones el de HOME, la calculadora también), y «PorHacer · gris, blanco y rojo». Están todos los temas de antes y el Modo Diseño. Sus temas y diseños se guardan aparte (`ph3_calc_…`) para no mezclarse con la calculadora suelta.
- **Configuración → 🧮 Calculadora**: todos los temas de la calculadora (y tus diseños), para elegir con un toque. También se puede elegir que la app se abra en la calculadora.
- Casas nuevas en Sitios: empiezan en gris (Grafito), luego rojo (Amapola)…

## 2026-10-29 · PorHacer3 · V9 (carpeta nueva `Antigravity/PorHacer3`)

Lo que pidió:
- Una **carpeta nueva PorHacer3**, a partir de PorHacer, con los tres apartados de HOME: **Agenda, Tickets y Sitios**, «igual que en HOME», pero al estilo **gris, blanco y rojo**. **No tocar la carpeta HOME** (solo se ha leído para copiar cómo funciona).
- Una **portada** con todos los apartados: PorHacer (tareas), Calendario, Listas, Agenda, Tickets, Sitios, Notas secretas y Configuración general. En **cada apartado un solo botón** (arriba a la izquierda, las 4 baldosas) para volver a la portada, en vez de muchos botones por todas partes.
- Las **notas secretas** con un botón bonito, con estilo y sorprendente: una **caja fuerte** (la rueda gira, se abre el candado, suena un clic-clic y se abre el bloc).
- Temas: además de los de antes, **temas como HOME** (Lavanda original, Tonos del logo, Marrón pastel, Miel y naranja).
- En **Configuración general → 🏠 General**: elegir **en qué apartado se abre la app** (portada o cualquier apartado), un botón para cada parte de la configuración, y **exportar / importar** la copia de Agenda, Tickets, Sitios y Listas.
- Agenda, Tickets y Sitios **empiezan de cero**, son **suyos** (como las listas sencillas: en la nube en su cuenta `usuarios/{uid}/agenda|tickets|sitios|fotos`, y si no hay sesión, en el aparato).

Cómo está hecho:
- `portada.js` (portada, navegación `irA()`), `mio.js` (guardar lo suyo en la nube + copia en el aparato, fotos aparte y aligeradas, exportar/importar), `agenda.js`, `tickets.js`, `sitios.js`, `iconos-home.js` (iconos, colores y lector de fechas por voz traídos de HOME), `estilos3.css`.
- Agenda: día · mes · año, pasar hoja con el dedo, varias notas por día (color, fotos, aviso, hecha, cambiar de día), color del día, buscar por colores, fotos del mes, avisos con sonido («En 10 min», «Ver el día»), añadir al calendario del móvil, nota por voz diciendo la fecha.
- Tickets: calendario con miniaturas, guardar con foto del ticket y de «lo que es», título e importe, ver/editar/borrar, buscar, colores de los tickets, **buscar por fechas / nombre / las dos y crear PDF con totales**.
- Sitios: casas → sitios dentro de sitios → cosas con fotos, «¿Dónde está…?» con el camino, mover, iconos (muebles dibujados de HOME, emojis, foto propia), color de cada casa, PDF de la lista.
- Para que no se mezcle con PorHacer en el mismo navegador: datos del aparato en `PorHacer3-datos/fotos/videos/audios` y claves `ph3-…`. El **bloc de notas secretas es el mismo** que en PorHacer si se abren en el mismo navegador.
- Los tableros y tareas son los mismos de la nube (mismo Firebase): PorHacer y PorHacer3 ven los mismos tableros y listas.

## 2026-10-27 · V1

- App de **tareas** al estilo de la app HOME, en `iCloud Drive/Antigravity/PorHacer`. Se llama **PorHacer**.
- Colores de las imágenes que adjuntó (gris, negro y rojo). Icono de la app: el **portapapeles 3D** (la 3.ª imagen).
- Tareas agrupadas en **columnas una al lado de otra**: Nueva tarea, En curso, En pausa, Acabada, Archivada.
  - Las columnas se **muestran/ocultan** desde las etiquetas de arriba (👁).
  - **Columnas nuevas** solo desde Configuración → Columnas (no en pantalla).
- Cada tarea con su **color**. El **borde** de la tarea toma el **color de su columna** (configurable): Nueva = rojo, En curso = azul, En pausa = naranja, Acabada = verde, Archivada = gris.
- **Temas** en Configuración: grises (como los botones), marrones claros, rosa, verde lima, verde, azul celeste, naranja, amarillo, naranja·amarillo·marrón, lima·verde·marrón, rosa·marrón·amarillo. Además, cada color se puede cambiar uno a uno.
- **Fecha inicio y fecha fin** opcionales. **Botón de calendario** (al estilo de los iconos) con vista **día, mes y año**; la tarea se ve con su color ocupando todos sus días.
- Al editar, pestañas **Fotos** y **Vídeos**; se **aligeran** antes de guardarse. Fotos y vídeos se guardan en **bases de datos separadas** (PorHacer-datos, PorHacer-fotos, PorHacer-videos).
- **Exportar e importar** (Configuración → Copias).
- **Personas** (nombre, apellidos, email). Al asignar una tarea, casilla «Enviar por email»: se **abre el correo ya rellenado** y solo hay que pulsar Enviar (elegido por ella).
- **Micrófono** en el título y en la nota para dictar (castellano, català o inglés).
- Extras añadidos: buscador, filtros (hoy, semana, vencidas, prioridad alta, sin fecha, por persona), prioridad, pasos con barra de progreso, aviso de vencidas, cuadradito para marcar acabada, duplicar, borrar con «Deshacer», añadir al calendario del móvil (.ics), funciona sin internet.

### Ideas propuestas (pendientes de que diga sí o no)
- Tareas que se **repiten** (cada semana, cada mes…).
- **Avisos** a una hora (como en la agenda de HOME).
- **Etiquetas** (cole, casa, labores…) para filtrar.
- **Código PIN** para abrir la app.

## Archivos
- **Todos los archivos sueltos en la misma carpeta, sin subcarpetas** (como HOME), porque así se suben a GitHub.
- `index.html` · `estilos.css` · `.js` (app, calendario, ajustes, copias, fotos, videos, voz, temas, iconos, db, nube, firebase-config) · `firestore.rules` y `storage.rules` (reglas para pegar en Firebase) · `GUIA-FIREBASE.md` · iconos `.png` · `manifest.json` · `sw.js`

## 2026-10-27 · V2 · Nube compartida
- Pensaba que todo se quedaba en el móvil, pero necesita que se vea **en todos los sitios**: si asigna una tarea a su marido, él tiene que ver la tarea **con sus fotos y vídeos**.
- Eligió **Firebase (Google)**. Pueden entrar **las personas de su lista de Personas** (nombre, apellidos, email).
- Hecho:
  - Entrar con **email y contraseña** (hay que confirmar el email la primera vez).
  - Ella crea el **tablero compartido**; se suben sus tareas, personas, fotos y vídeos.
  - Pueden entrar las personas de **Personas con email** (si se le quita el email o se borra, pierde el acceso).
  - Tareas, personas y columnas se sincronizan al momento; fotos y vídeos se guardan en Firebase Storage.
  - Copia en el dispositivo: funciona sin internet y se sincroniza al volver.
  - El **tema de colores** es de cada uno.
  - Indicador ☁︎ debajo de la versión (verde = sincronizado). Pestaña **☁️ Nube** en Configuración.
  - El email de la tarea lleva el enlace de la app.
- Falta: que ella cree el proyecto de Firebase siguiendo **GUIA-FIREBASE.md** y me envíe los datos para ponerlos en `firebase-config.js`.


### 2026-10-27 · V2 · archivos sin carpetas
- Subió todo a GitHub (repo `elialtarriba/PorHacer`, GitHub Pages activado) pero los archivos quedaron sueltos, sin las carpetas. → Pasada la app a **archivos sueltos** (sin css/, js/, img/). Hay que volver a subir `index.html`, `sw.js`, `manifest.json` y `nube.js`.
- Ya tiene cuenta de Firebase de antes.
- Proyecto Firebase creado: **porhacer-36f11** (plan Spark de momento). Datos puestos en `firebase-config.js`.
- **No quiere poner tarjeta** → nada de plan Blaze ni Storage. Fotos y vídeos se guardan **dentro de Firestore** (plan gratis Spark), partidos en trozos de 900 KB. Límite: **1 GB** en total; se ve lo gastado en Configuración → Nube y avisa si se llena.
- Firebase hecho: proyecto, Authentication (email/contraseña + dominio `elialtarriba.github.io`), Firestore (eur3) con reglas publicadas.

## 2026-10-27 · V3
- En el calendario quiere **pasar con el dedo de mes en mes** y que se vea **la hoja que pasa**, como en el calendario de HOME; también **día a día** y **año a año**. → Hecho: la misma hoja curvada de HOME (sigue el dedo, si se para se para, si sueltas a medias vuelve atrás). También con los botones ‹ ›.
- Preguntó si hay un solo tablero: sí, uno, el suyo, compartido con las personas de su lista.
- Se le hizo `PorHacer-Guia.pdf` (guía de uso con capturas). No hace falta subirla a GitHub.
- En la vista **Año**, al lado de cada mes sale el **año** (etiqueta roja) para no perderse.
- El **micro no paraba** al volver a pulsarlo (en el iPhone el dictado a veces no avisa de que ha terminado). → Arreglado: al pulsar, se para al momento y, si el navegador no acaba en 1,5 s, se corta.
- El micro tiene que estar **verde mientras graba** y con el **color del tema** cuando no. → Hecho.
- La **fecha de inicio y fin** no tiene que salir puesta por defecto. → Ahora una fecha vacía se ve como **«Sin fecha»** (el navegador enseñaba la de hoy en gris) y cada fecha tiene una **✕** para quitarla.
- Una **tarea nueva** tiene que ir por defecto a **En curso**. → Hecho (con el ＋ de una columna sigue yendo a esa columna).

## 2026-10-27 · V4
Probó la V3 con su marido (rbielsa@gmail.com). Ella le había puesto en Personas otro email (familiabielsa@gmail.com) y a él le salió «Todavía nadie ha compartido un tablero contigo… Crear mi tablero compartido», cosa que no quiere.
1. **Versión** visible pero discreta también en la pantalla de entrar. → Hecho («PorHacer V4» en gris abajo).
2. **Tableros**, como ella lo plantea. → Hecho:
   - Al crear la cuenta se pide **nombre y apellidos**; al entrar por primera vez se crea **su tablero** solo, sin preguntar.
   - Configuración → **📋 Tableros**: tu cuenta, invitaciones, *Mis tableros* y *Compartidos conmigo*. Cada uno puede **crear tantos tableros** como quiera.
   - **Compartir**: eliges el tablero, pones nombre, apellidos y email → se apunta solo en Personas de ese tablero y **se le envía una invitación por email** (con enlace que abre la app).
   - Al entrar, el invitado ve **«Te han invitado» → Aceptar / Rechazar / Ahora no**. Al aceptar, se apunta solo en Personas del tablero (con su nombre).
   - Quien comparte ve quién está dentro (✅) y a quién se ha invitado (⏳, con 📧 para reenviar) y **puede sacar** a quien quiera (✕). Solo el dueño. Los demás pueden **salir**.
   - En la cabecera, debajo de la fecha, el **tablero abierto** (📋 nombre ▾) para cambiar de tablero rápido.
   - Ya no existe «usar solo en este dispositivo»: hay que entrar.
   - **Reglas nuevas de Firestore** (archivo `firestore.rules`): hay que pegarlas y publicarlas en Firebase.
3. **Fechas vacías al crear una tarea**: revisado, una tarea nueva sale «Sin fecha». Solo «＋ Nueva tarea este día» del calendario pone la fecha de ese día (quizá así salió la de 2024, con el calendario en 2024).
4. **Email más bonito**: con diseño, colores del tema, botón para abrir la app y el enlace en una caja para copiarlo. Para que se envíe solo con diseño hace falta EmailJS (gratis, sin tarjeta): ver `GUIA-EMAILJS.md`. Sin EmailJS se abre el correo con el texto ordenado y con saltos de línea. Un botón «copiar» dentro de un email no es posible (los correos no lo permiten): se mantiene el dedo sobre el enlace.
5. Le encantan los detalles (pasos, historial al final de la tarea…). ¡Gracias!
6. Iconos de la tarjeta: 📧 = se le ha enviado por email (🔔 si también recordatorio); el círculo con letras = iniciales de la persona asignada.
7. Botón **🔔 Enviar un recordatorio por email**, amable y bonito. → Hecho.
8. Botón **☀️ Hoy** en la línea de las fechas (pone hoy en inicio y fin). → Hecho.
9. Pestaña **🎙️ Audio** en cada tarea: grabar nota de voz, escucharla y **Guardar / Repetir / Cancelar**. Se guarda como **.mp3** ligero (≈360 KB/min) en su propio almacén (PorHacer-audios). → Hecho (librería `lame.min.js`).
10. (Pedido a mitad) **Fiesta al acabar una tarea**: confeti por toda la pantalla durante 5 s (configurable), mensaje grande y de colores «¡Muy bien!» / «Molt bé!» / «Congratulations!» según el idioma (o el que se escriba), musiquita, y **email de enhorabuena** a las personas del tablero (Preguntar / Siempre / Nunca). Todo en Configuración → **🎉 Al acabar**, con botón «Probar ahora». → Hecho.
- **Redondas con iniciales**: si la tarea se comparte con más gente, sale la redonda de la persona asignada y un «+N». Al pulsarla sale una ventana con las redondas y la lista de personas del tablero; al pulsar una persona se despliega: email, tareas pendientes, «📌 Asignarle esta tarea», «👀 Ver sus tareas» y «🔔 Recordatorio». → Hecho.
- **Emails**: le va bien como hasta ahora (se abre el correo ya escrito y ella pulsa Enviar). EmailJS no hace falta; queda opcional.
- Su usuario de Firebase sirve: no hay que crearlo de nuevo (la V4 solo le pide nombre y apellidos una vez).

## 2026-10-27 · V4.1
- **V4.1** · Al final de cada tarea, después de «Al calendario del móvil / Duplicar / Borrar» y antes del historial, un **desplegable con los tableros** para mover la tarea a otro tablero (con sus fotos, vídeos y audios; la persona asignada se apunta sola en el otro tablero; si la columna no existe allí, va a su primera columna). Hecho en la V4 (carpeta PorHacer) y en la V5 (PorHacer2).
- Le encantan las notas de voz («¡eres un máquina!»).

## V4.2 · Recuperar contraseña
- Raimon no recibía el email de «He olvidado la contraseña». Ahora el email sale en español, vuelve a la app y el aviso explica: mirar Spam/Promociones, remitente noreply@porhacer-36f11.firebaseapp.com y que debe ser el mismo email de la cuenta (Firebase no avisa si el email no existe).

## V4.3 · Borrar, historial y nube
- Botón grande «🗑 Borrar esta tarea» al final de la tarea, con ventanita bonita: muestra la tarea, sus fotos/vídeos/audios/pasos y el espacio que se libera. Se puede deshacer unos segundos.
- Historial completo de cada tarea: creada, cambios de columna, fechas, título, notas, prioridad, color, persona, pasos, fotos/vídeos/audios añadidos o borrados, emails, recordatorios, cambio de tablero, duplicada… con fecha, hora y quién. En la tarea se ven los 3 últimos y «📜 Ver todo el historial» abre una ventana agrupada por días.
- El indicador verde de la nube ahora tiene icono (nube con ✓, nube tachada sin conexión, flecha al subir) y al tocarlo explica el estado.
- Cabecera: la versión y la nube pasan debajo de los botones de calendario y ajustes, para que la fecha y el nombre del tablero se vean enteros.

## V4.4 · Calendario con varios tableros
- En el calendario, botón «📋 Este tablero ▾» para elegir qué tableros ver: uno, varios o todos (se recuerda en el móvil).
- Con más de un tablero, cada tarea lleva una redonda de color con la inicial de su tablero; al tocarla sale el nombre completo.
- Al tocar una tarea de otro tablero, pregunta si quieres ir a ese tablero y la abre.

## V4.5 · Subir a la nube lo pendiente
- Al tocar la nube: si hay fotos, vídeos o audios en el móvil que no están en la nube, lo dice y hay un botón «⬆️ Subir a la nube» (también comprueba las tareas).
- Además lo pendiente se sube solo al abrir la app y al volver internet.

## V4.6 · Ratón y temas blancos
- Las barras de pestañas (Configuración, columnas…) se pueden arrastrar con el ratón y mover con la rueda.
- 11 temas nuevos con fondo blanco (Blanco y rojo, azul, celeste, verde, lima, rosa, lila, naranja, amarillo, marrón, negro). En Temas salen en dos grupos: «Con fondo blanco» y «Con fondo de color».

## V4.7 · Avisos con sonido
- Cada tarea puede tener 2 avisos (día y hora), con atajos «Dentro de 1 hora» y «Mañana a las 9». Son de quien los pone: a los demás del tablero no les suenan.
- A la hora suena una campanita y sale una ventana bonita: Cerrar, 😴 10 min (posponer) o Ir a la tarea. Si el navegador está en otra pestaña, también sale una notificación (si se da permiso).
- Suena mientras la app esté abierta; si se abre más tarde (hasta 12 h), avisa igualmente indicando «Era para…».
- La tarjeta muestra 🔔 con el próximo aviso; el historial apunta avisos puestos, quitados y pospuestos.
- V4.8: las tareas nuevas van por defecto a «Nueva tarea» (antes «En curso»).
- V4.9: «Al calendario del móvil» lleva los avisos con sonido como alarmas del calendario (suenan aunque la app esté cerrada). Si la tarea no tiene fechas pero sí aviso, el evento se pone ese día.

## V4.10 · Bloc de notas secreto
- Botón 📒 en el calendario. Contraseña en Configuración → 🔒 Bloc (solo puntos, sin copiar ni pegar).
- Notas solo en este aparato, cifradas (AES-GCM) con la contraseña. Exportar/importar copia cifrada. Si se olvida la contraseña no se recupera.
- Hojas con pestañas: añadir, borrar, nombre, color de hoja y color de pestaña. Negrita/normal, listas ☑ (se marcan), • y 1., subrayado en 7 colores pastel.
- V4.11: fotos en el bloc (📷, arrastrar o pegar). Se aligeran (máx. 1000 px, JPEG) y entran pequeñas (140 px); al tocarlas sale un tirador para hacerlas grandes o pequeñas y una 🗑. El bloc pasa a guardarse en IndexedDB (cabe mucho más); lo de antes se traspasa solo.
- V4.12: imprimir una hoja del bloc (menú ⋯ → 🖨): elegir hoja, con el color del papel o en blanco, y con o sin el nombre arriba.
- V4.13: PDF de una hoja del bloc (⋯ → Imprimir o PDF; con o sin color). Barra de 10 iconos (✅ ❤️ ❌ ❗️ ❓ 🔴 🟢 🔵 🟡 🟠) en el bloc y en las notas de la tarea; las notas de la tarea admiten negrita (se ve en la tarjeta). Librerías html2canvas.min.js y jspdf.min.js (MIT) incluidas.

## V4.14 · Listas fáciles (tipo Microsoft To Do)
- Botón nuevo (icono del portapapeles con puntos) junto al calendario; también en el calendario. Pantalla con botones para volver a mis tareas, calendario y opciones ⋯.
- Listas propias de cada usuaria (no son de ningún tablero), en la nube: usuarios/{uid}/listas y fondos. Sin reglas nuevas o sin sesión, se guardan en el aparato.
- Añadir arriba (el teclado solo sale al tocar el recuadro), ⭐ importante, marcar hecho (grupo Completado), tocar para editar.
- Deslizar a la izquierda = borrar (con Deshacer); a la derecha = pasar al PorHacer eligiendo tablero (columna Nueva tarea; ⭐ = prioridad alta). En ordenador: arrastrar con el ratón o botones 📋 🗑 al pasar por encima; Supr borra.
- Opciones: nombre, ordenar, reordenar, tema (11 colores o como la app) e imagen de fondo, imprimir, enviar copia, borrar completados, nueva lista, borrar lista.
- Configuración → Más → «Al abrir la app, ver…»: PorHacer, Listas o Calendario.
- firestore.rules: nueva regla usuarios/{uid}.
- V4.15: las listas empiezan con los colores de la app (grises y rojo, como el icono); los otros temas solo si se eligen.

## V7
- Listas: temas nuevos Amarillo, Beige y Negro (degradado más claro abajo). Los puntos con ⭐ van siempre arriba y suenan (otro sonido). Configuración → Más: sonidos de las listas sí/no y cuánto dura la ventanita «¡Pasado al PorHacer!» (4/8/15 s o hasta cerrarla).
- Botón de opciones de las listas = rueda dentada; botones con más relieve al pulsar.
- Tarea: botón «📝 Pasar a una lista» (solo el título; si venía de una lista, «Devolver a…»), con opción de quitarla del tablero. El historial dice «Viene de la lista sencilla…».
- Barra de negrita e iconos de las notas en una sola fila deslizable.
- Avisos: sin atajos, los dos avisos en una fila, en gris y centrados.
- Recordatorio por email siempre activo: eliges a quién (o otro email) y un mensaje propio.
- Nube: botón «⬇️ Bajar de la nube».

## V7.1
- Bloc: las pestañas solo se deslizan de lado (ya no se mueven arriba/abajo). Botón «Aa ▾» con el tamaño de la letra (Pequeña…Enorme) y «Quitar el formato»; se escribe con el tamaño elegido (también los iconos). Botón «💾 Guardar». Deslizar el dedo sobre la hoja pasa a la hoja siguiente/anterior con efecto de página.
- Listas: deslizar fuera de los puntos pasa a la lista siguiente/anterior con efecto de página. Puntos de hasta 600 caracteres (antes 200).
- V7.2: pasar página más fácil en listas y bloc (eventos táctiles, basta con ~1/4 de recorrido o un golpe rápido; en listas también desde la cabecera y el recuadro de añadir). Puntitos bajo «Agregar» que indican la lista y se pueden tocar.

## Manual de PorHacer3 (V10) — 30/10/2026
- Petición: «¿Podrías hacer un Manual de PorHacer3 con un índice para no perderte con tanto dato? Al estilo del manual PorHacer».
- Hecho: carpeta Manual/ con PorHacer3-Manual.pdf (65 páginas) y PorHacer3-Manual.docx. Portada, índice con páginas, bienvenida y 18 capítulos con capturas y números rojos: Empezar, Portada, Tareas, Ventana de la tarea, Fotos y avisos, Tableros, Calendario Tareas, Listas, Agenda, Tickets, Sitios, Calculadora, Grabar, Notas secretas, Colores y temas, Configuración, Nube y copias, Preguntas.
- La carpeta Manual/ NO hace falta subirla a GitHub (es solo para ti).

## V10.1 — Tickets de HOME a PorHacer3 — 30/10/2026
- Petición: pasar los tickets (con sus fotos) a los Tickets de mi usuario de PorHacer3. (Los tickets están en la app HOME; PorHacer no tiene tickets.)
- Hecho: Configuración → Copias de seguridad → «Agenda, Tickets, Sitios y Listas» → Importar copia ahora acepta también la copia de HOME (hogar-copia-….json). Pasa sus tickets con fecha, nombre, importe, foto del ticket y foto de lo que es. Si se importa dos veces, no se repiten.
- Archivos para GitHub: mio.js, ajustes.js, app.js, index.html, portada.js, sw.js (caché porhacer3-v111).

## V10.2 — Fotos con Chrome — 30/10/2026
- Petición: «Mi marido dice que para hacer fotos no se puede con Chrome, solo con Safari. ¿Tiene arreglo?»
- Hecho: en Agenda, Tickets y Sitios la foto de la cámara se perdía en Chrome del iPhone (la app creía que se había cancelado al volver de la cámara). Ahora espera a que llegue la foto. Si aun así no abre la cámara: Ajustes del iPhone → Chrome → Cámara (y Fotos) → permitir.
- Archivos para GitHub: mio.js, app.js, index.html, portada.js, sw.js (caché porhacer3-v112).

## V10.3 — Año a pantalla completa y reloj que graba — 30/10/2026
- Petición: tocar la fecha (30 OCT) de la portada abre la agenda con el año actual a pantalla completa; dos toques la esconden y arriba hay un botón de cerrar; deslizar pasa de año con el pliegue de la hoja. Tocar el reloj redondo empieza a grabar una nota de voz (apartado Grabar).
- Hecho: el año ocupa toda la pantalla (3 columnas en el móvil, 6 en el ordenador), con ‹ › y ✕. Tocar un día abre ese día en la Agenda; tocar el nombre de un mes, ese mes. El reloj va a Grabar y empieza a grabar; «Parar» la guarda.
- Archivos para GitHub: portada.js, estilos3.css, app.js, index.html, sw.js (caché porhacer3-v113). Si aún no subiste la V10.1/V10.2, sube también mio.js y ajustes.js.

## V10.4 — 30/10/2026
- Petición: al pasar de año (tocando la fecha) no se veía la hoja que se dobla. → Arreglado: la hoja se dobla por encima del año a pantalla completa (antes quedaba escondida detrás).
- Petición: «En el ordenador he puesto que se abra con las tareas y se abre con la portada». → «Al abrir la app» se guarda también aparte en el aparato y se lee al empezar. Ojo: en el Mac, la app del Dock y la pestaña del navegador guardan sus ajustes por separado (hay que elegirlo en la que uses). Después de cambiarlo, hay que cerrar la app/pestaña y volver a abrirla.
- Petición: un botón Guardar en Configuración. → Botón rojo «💾 Guardar» arriba; se pone verde «Guardado» al guardar (también cuando se guarda solo al cambiar algo).
- Archivos para GitHub: app.js, ajustes.js, index.html, estilos3.css, portada.js, sw.js (caché porhacer3-v114).

## V10.5 — Reunión de Teams y esconder botones — 30/10/2026
- Petición: botón para poner una reunión en Teams y que se apunte una tarea el día de la reunión; icono de la línea de la app. Y en Configuración → General poder esconder botones de la portada y volver a verlos.
- Hecho: botón «Reunión de Teams» en la portada (icono gris/blanco/rojo: pantalla con dos personas y cámara roja). Formulario: título, día (Hoy/Mañana/fecha), hora, duración, invitados (emails o personas), notas, apuntar en Tareas y/o Agenda, aviso (sin aviso, a la hora, 10 o 30 min antes). Al pulsar «Crear en Teams» se apunta en PorHacer3 y se abre Teams con la reunión rellenada; allí hay que pulsar Enviar. El botón de la portada dice cuál es la próxima reunión.
- Configuración → General → «Botones de la portada»: marcar/desmarcar cada botón (Configuración siempre se ve).
- Archivos para GitHub: iconos.js, portada.js, ajustes.js, estilos3.css, app.js, index.html, sw.js (caché porhacer3-v115).
