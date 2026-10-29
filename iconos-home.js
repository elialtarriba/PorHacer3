/* PorHacer3 · iconos, colores y paletas traídos de HOME (Agenda, Tickets, Sitios) */
var PALETTES={
  verde:{name:'Verde 🌿',ac:'#52c46e',shades:['#edf8f0','#d4f0da','#b8e8c4','#90d8a8','#68c888','#48b868','#2a9848'],text:'#1a5a2a',bg:'#e4f4e8'},
  azul:{name:'Azul 💙',ac:'#4898e4',shades:['#eaf2fc','#cce4f8','#aed4f4','#88c0ee','#60a8e8','#3888d8','#1868b8'],text:'#0a3878',bg:'#daeaf8'},
  rosa:{name:'Rosa 🌸',ac:'#e84898',shades:['#fce8f2','#f8d0e8','#f4b0d8','#ee88c4','#e860ae','#d83898','#b81878'],text:'#780848',bg:'#fce4f0'},
  lila:{name:'Lila 💜',ac:'#9460d8',shades:['#f0eafc','#e0d4f8','#c8b8f4','#b098ee','#9478e8','#7858d8','#5838b8'],text:'#380898',bg:'#ede4f8'},
  melocoton:{name:'Melocotón 🍑',ac:'#f07848',shades:['#fef0e8','#fcddc8','#f8c8a8','#f4ae84','#f09068','#e87048','#d04828'],text:'#882818',bg:'#fde8d8'},
  amarillo:{name:'Amarillo ☀️',ac:'#d4a820',shades:['#fdf8e4','#faefc4','#f6e4a0','#f0d878','#e8c850','#d4a820','#b08010'],text:'#705808',bg:'#fdf4dc'},
  turquesa:{name:'Turquesa 🩵',ac:'#30b4c0',shades:['#e4f8f8','#c4f0f0','#a0e4e4','#78d4d4','#50c0c0','#30a8a8','#108888'],text:'#085858',bg:'#daf4f4'},
  salmon:{name:'Salmón 🐟',ac:'#e07878',shades:['#fef0f0','#fcdcdc','#f8c4c4','#f4a8a8','#ee8888','#e46868','#cc4848'],text:'#781828',bg:'#fce8e8'},
  menta:{name:'Menta 🌱',ac:'#48c8a8',shades:['#e8f8f4','#c8f0e8','#a4e8d8','#78d8c4','#50c8b0','#30b898','#108878'],text:'#085848',bg:'#dcf4ee'},
  lavanda:{name:'Lavanda 🪻',ac:'#9888d8',shades:['#f4f0fc','#e8e0f8','#d8ccf4','#c4b4ee','#ae98e8','#9478dc','#7858c8'],text:'#382878',bg:'#ede8f8'},
  coral:{name:'Coral 🪸',ac:'#f06050',shades:['#fef2f0','#fde0dc','#fac8c4','#f8a8a0','#f48078','#f06050','#d84038'],text:'#801808',bg:'#fdecea'},
  cielo:{name:'Cielo ☁️',ac:'#60a8f8',shades:['#eaf4ff','#d0e8ff','#b4d8ff','#90c4ff','#68acff','#4090f0','#2070d0'],text:'#083878',bg:'#daeeff'},
  naranja:{name:'Naranja 🍊',ac:'#f09030',shades:['#fff4e8','#ffe4c0','#ffd090','#ffb860','#f09830','#e07820','#c05810'],text:'#803808',bg:'#feecd8'},
  lima:{name:'Lima 🍋',ac:'#90c030',shades:['#f4fce8','#e4f8c8','#d0f0a0','#b8e478','#98d050','#78b830','#589018'],text:'#385008',bg:'#eef8dc'},
  ciruelo:{name:'Ciruela 🍇',ac:'#9040a8',shades:['#f4e8fc','#e8d0f8','#d8b4f4','#c490ee','#a868e0','#9040a8','#702888'],text:'#400858',bg:'#ede0f8'},
  chocolate:{name:'Chocolate 🍫',ac:'#a06840',shades:['#f8f0e8','#f0ddc8','#e4c8a0','#d4b078','#c09050','#a06840','#805030'],text:'#402010',bg:'#f4e8d8'},
  oceano:{name:'Océano 🌊',ac:'#2878c0',shades:['#e8f4fc','#c8e4f8','#a0d0f4','#70b8ee','#4098e0','#2878c0','#0858a0'],text:'#043060',bg:'#d8eef8'},
  frambuesa:{name:'Frambuesa 🫐',ac:'#d83870',shades:['#fce8f0','#f8d0e4','#f4b0d4','#ec88c0','#e060a8','#d83870','#b81858'],text:'#680838',bg:'#fce0ee'},
  jade:{name:'Jade 🍀',ac:'#38a880',shades:['#e8f8f4','#c8f0e4','#a0e4d4','#70d0bc','#48b898','#38a880','#208860'],text:'#084830',bg:'#d8f4ec'},
  perla:{name:'Perla 🤍',ac:'#b0a090',shades:['#faf8f6','#f4f0ec','#ece4dc','#e0d4c8','#d0c0b0','#b8a898','#a09080'],text:'#504030',bg:'#f8f4f0'},
  amapola:{name:'Amapola ❤️',ac:'#e03038',shades:['#fff0f0','#ffd8d8','#ffb8b8','#f89090','#f06868','#e03038','#b81820'],text:'#741018',bg:'#fee8e8'},
  buganvilla:{name:'Buganvilla 🌺',ac:'#c018a8',shades:['#fce8fa','#f8ccf2','#f0a8e8','#e480dc','#d050c8','#b820a8','#8c087c'],text:'#600850',bg:'#f8dff4'},
  violeta:{name:'Violeta 🔮',ac:'#6838d8',shades:['#eee8ff','#dccfff','#c4b0ff','#a88cff','#8868f0','#6840d8','#4820a8'],text:'#2a1268',bg:'#e8e0ff'},
  indigo:{name:'Índigo 🌀',ac:'#3048c8',shades:['#e8ecff','#ccd6ff','#acbaff','#8498f0','#6078e0','#3048c8','#183098'],text:'#101f68',bg:'#dfe6ff'},
  petrol:{name:'Petróleo 🧿',ac:'#087880',shades:['#e4f6f6','#c4eeee','#98e0e0','#68cccc','#38b0b0','#087880','#04545c'],text:'#043c40',bg:'#d8f0f0'},
  bosque:{name:'Bosque 🌲',ac:'#287838',shades:['#e8f4e8','#cce8d0','#acd8b4','#84c090','#60a870','#388848','#206830'],text:'#123c20',bg:'#dceee0'},
  pistacho:{name:'Pistacho 🟢',ac:'#78b850',shades:['#f0f8e8','#def0d0','#c8e8b4','#acd890','#90c870','#70a850','#508830'],text:'#304818',bg:'#e8f4dc'},
  mostaza:{name:'Mostaza 🌼',ac:'#c89018',shades:['#fff8e0','#faecc0','#f2dc90','#e8c860','#d8b038','#c89018','#987008'],text:'#604008',bg:'#fbf0d0'},
  mango:{name:'Mango 🥭',ac:'#f0a020',shades:['#fff4dc','#ffe4a8','#ffd080','#f8b850','#f0a020','#d87810','#a85008'],text:'#743808',bg:'#fff0d8'},
  calabaza:{name:'Calabaza 🎃',ac:'#e85820',shades:['#fff0e4','#ffd8c0','#ffb894','#f89060','#e87038','#d85018','#a83808'],text:'#702008',bg:'#fde4d8'},
  terracota:{name:'Terracota 🧱',ac:'#b85838',shades:['#f8ece8','#f0d4c8','#e4b8a8','#d89880','#c87858','#b85838','#883818'],text:'#582010',bg:'#f2ded6'},
  arcilla:{name:'Arcilla 🏺',ac:'#c07850',shades:['#faf0e8','#f0d8c8','#e8c0a8','#d8a080','#c88860','#b86840','#884828'],text:'#503020',bg:'#f4e4d8'},
  arena:{name:'Arena 🐚',ac:'#d0a858',shades:['#fff8ec','#f6ecd4','#eadcbc','#dcc89c','#c8ac78','#b89050','#887038'],text:'#604818',bg:'#f8ecd8'},
  oliva:{name:'Oliva 🫒',ac:'#808838',shades:['#f2f4e4','#e4e8c8','#d4d8a8','#c0c480','#a8ac60','#808838','#606820'],text:'#383c10',bg:'#eceed8'},
  granada:{name:'Granada 🍷',ac:'#a81848',shades:['#fce8ee','#f4c8d8','#e8a0bc','#d87898','#c85078','#a81848','#780828'],text:'#500820',bg:'#f6dce6'},
  cereza:{name:'Cereza 🍒',ac:'#d82050',shades:['#fde8ee','#f8ccd8','#f4a8bc','#ec8098','#e85878','#d82050','#a80830'],text:'#680818',bg:'#fce0e8'},
  orquidea:{name:'Orquídea 🪷',ac:'#b850d8',shades:['#f8e8fc','#ecccf8','#dca8f0','#cc80e8','#b858d8','#9840b8','#743090'],text:'#481058',bg:'#f3def8'},
  hielo:{name:'Hielo ❄️',ac:'#70c8e8',shades:['#eefcff','#d8f6ff','#b8ecfb','#94dff4','#70c8e8','#48a8c8','#207890'],text:'#084050',bg:'#e4f8fc'},
  grafito:{name:'Grafito 🖤',ac:'#606870',shades:['#f0f2f4','#dce0e4','#c4ccd4','#a8b0b8','#889098','#687078','#404850'],text:'#202830',bg:'#eceff2'},
  noche:{name:'Noche 🌙',ac:'#384878',shades:['#eceef8','#d6dcf0','#b8c0e0','#98a4d0','#7484b8','#506098','#303860'],text:'#182040',bg:'#e2e6f4'},
  sandia:{name:'Sandía 🍉',ac:'#e84068',shades:['#fff0f2','#ffd4dc','#ffb0c0','#f888a0','#f06080','#d83860','#a82040'],text:'#681020',bg:'#fde4e8'},
  pastelRosa:{name:'Rosa pastel',ac:'#e8a8c3',shades:['#fff8fb','#fbe7f0','#f6d3e2','#efbdd2','#e8a8c3','#d98eae','#c57499'],text:'#704052',bg:'#fcecf3'},
  pastelVerde:{name:'Verde pastel',ac:'#9fc9a9',shades:['#f8fcf9','#e8f5eb','#d4ead9','#b9dbbf','#9fc9a9','#82b28f','#659976'],text:'#355b40',bg:'#eaf5ed'},
  pastelAzul:{name:'Azul pastel',ac:'#9dbfdf',shades:['#f8fbfe','#e8f2fa','#d3e6f4','#b8d2e9','#9dbfdf','#7fa6cb','#618bb5'],text:'#35526d',bg:'#eaf3fa'},
  pastelAmarillo:{name:'Amarillo pastel',ac:'#e6cf7e',shades:['#fffdf5','#faf4d9','#f3e9b9','#ecdc98','#e6cf7e','#ceb563','#b39a49'],text:'#665724',bg:'#faf3d6'},
  pastelNaranja:{name:'Naranja pastel',ac:'#edb17f',shades:['#fffaf6','#faebdf','#f6dac7','#f1c6a5','#edb17f','#d99762','#bf7c48'],text:'#70472b',bg:'#f9e8da'},
  pastelLila:{name:'Lila pastel',ac:'#bea8df',shades:['#fcfaff','#f0eafa','#e3d8f4','#d1c1e9','#bea8df','#a38bc9','#8870b2'],text:'#55436d',bg:'#eee8f8'},
  pastelMenta:{name:'Menta pastel',ac:'#98d1c1',shades:['#f7fdfa','#e4f5ef','#cfebe2','#b4ddd1','#98d1c1','#79b8a7','#5b9d8c'],text:'#315f54',bg:'#e5f5f0'},
  pastelCoral:{name:'Coral pastel',ac:'#e9a39c',shades:['#fff9f8','#fae8e6','#f5d4d0','#efbdb8','#e9a39c','#d88780','#c36d66'],text:'#70413d',bg:'#f9e9e7'},
  pastelMelocoton:{name:'Melocotón pastel',ac:'#edbd9f',shades:['#fffaf7','#f9ebe2','#f5dccd','#f0ccb7','#edbd9f','#d9a283','#bf8769'],text:'#704a36',bg:'#f8eae1'},
  blanco:{name:'Blanco',ac:'#e2ded8',shades:['#ffffff','#fafafa','#f2f0ed','#e8e4df','#ddd8d1','#c8c0b7','#aaa097'],text:'#514b45',bg:'#ffffff'},
};
var PAL_KEYS=Object.keys(PALETTES);
var ALL_EMOJIS=[
  // Muebles y habitaciones
  {e:'🛏️',l:'Cama'},{e:'🛋️',l:'Sofá'},{e:'🪑',l:'Silla'},{e:'🚪',l:'Puerta'},{e:'🪞',l:'Espejo'},
  {e:'🪟',l:'Ventana'},{e:'🖼️',l:'Cuadro'},{e:'🪆',l:'Decoración'},{e:'🕯️',l:'Vela'},{e:'💡',l:'Luz'},
  {e:'🔆',l:'Lámpara'},{e:'🪔',l:'Farolillo'},{e:'🧸',l:'Peluche'},{e:'🎀',l:'Lazo'},{e:'🏺',l:'Jarrón'},
  {e:'🪬',l:'Amuleto'},{e:'🧿',l:'Ojo turco'},{e:'🎋',l:'Bambú'},{e:'🪴',l:'Maceta'},{e:'🌺',l:'Flor'},
  {e:'🌻',l:'Girasol'},{e:'🌹',l:'Rosa'},{e:'💐',l:'Ramo'},{e:'🌿',l:'Planta'},{e:'🌱',l:'Brote'},
  // Baño
  {e:'🛁',l:'Bañera'},{e:'🚿',l:'Ducha'},{e:'🚽',l:'WC'},{e:'🪥',l:'Cepillo dientes'},{e:'🧴',l:'Crema'},
  {e:'🧼',l:'Jabón'},{e:'🪒',l:'Afeitado'},{e:'🧻',l:'Papel'},{e:'🪣',l:'Cubo'},{e:'🧽',l:'Esponja'},
  {e:'🪮',l:'Cepillo pelo'},{e:'💈',l:'Barbería'},{e:'🧖',l:'Spa'},{e:'🪠',l:'Desatascador'},{e:'🚰',l:'Grifo'},
  // Salud
  {e:'💊',l:'Medicinas'},{e:'🩹',l:'Botiquín'},{e:'🩺',l:'Médico'},{e:'🧪',l:'Botes'},{e:'🌡️',l:'Termómetro'},
  {e:'🩻',l:'Radiografía'},{e:'💉',l:'Jeringa'},{e:'🩸',l:'Sangre'},{e:'🫀',l:'Corazón'},{e:'🧬',l:'ADN'},
  // Cocina
  {e:'🍳',l:'Cocinar'},{e:'🍽️',l:'Platos'},{e:'🥄',l:'Cuchara'},{e:'🍴',l:'Cubiertos'},{e:'🔪',l:'Cuchillo'},
  {e:'🫙',l:'Tarros'},{e:'🧃',l:'Bebidas'},{e:'🧊',l:'Hielo'},{e:'🫕',l:'Olla'},{e:'☕',l:'Café'},
  {e:'🍞',l:'Pan'},{e:'🥗',l:'Ensalada'},{e:'🥤',l:'Vaso'},{e:'🫖',l:'Tetera'},{e:'🍷',l:'Vino'},
  {e:'🥘',l:'Cazuela'},{e:'🧂',l:'Sal'},{e:'🫙',l:'Conservas'},{e:'🍰',l:'Tarta'},{e:'🧁',l:'Cupcake'},
  {e:'🍫',l:'Chocolate'},{e:'🍭',l:'Chuche'},{e:'🧇',l:'Gofre'},{e:'🥞',l:'Tortitas'},{e:'🥚',l:'Huevo'},
  {e:'🧈',l:'Mantequilla'},{e:'🫓',l:'Pan pita'},{e:'🥐',l:'Croissant'},{e:'🍕',l:'Pizza'},{e:'🍣',l:'Sushi'},
  // Tecnología
  {e:'📺',l:'TV'},{e:'🎮',l:'Videojuegos'},{e:'🎵',l:'Música'},{e:'🎸',l:'Guitarra'},{e:'🎹',l:'Piano'},
  {e:'📷',l:'Fotos'},{e:'📚',l:'Libros'},{e:'📖',l:'Lectura'},{e:'🖥️',l:'PC'},{e:'💻',l:'Portátil'},
  {e:'⌨️',l:'Teclado'},{e:'🖱️',l:'Ratón'},{e:'📱',l:'Móvil'},{e:'🎧',l:'Auriculares'},{e:'📡',l:'Antena'},
  {e:'🖨️',l:'Impresora'},{e:'💾',l:'Disco'},{e:'📀',l:'DVD'},{e:'📻',l:'Radio'},{e:'📷',l:'Cámara'},
  {e:'🎬',l:'Películas'},{e:'📹',l:'Vídeo'},{e:'🔭',l:'Telescopio'},{e:'🔬',l:'Microscopio'},{e:'🧭',l:'Brújula'},
  // Trabajo y oficina
  {e:'💼',l:'Trabajo'},{e:'🗂️',l:'Archivos'},{e:'📁',l:'Carpeta'},{e:'✏️',l:'Lápiz'},{e:'📌',l:'Pin'},
  {e:'📎',l:'Clip'},{e:'📏',l:'Regla'},{e:'📐',l:'Escuadra'},{e:'🗒️',l:'Bloc'},{e:'📓',l:'Cuaderno'},
  {e:'📋',l:'Portapapeles'},{e:'📊',l:'Gráfico'},{e:'📈',l:'Subida'},{e:'📉',l:'Bajada'},{e:'🗃️',l:'Archivador'},
  {e:'📬',l:'Buzón'},{e:'📮',l:'Correos'},{e:'🖊️',l:'Bolígrafo'},{e:'✒️',l:'Pluma'},{e:'🗓️',l:'Agenda'},
  // Ropa
  {e:'👕',l:'Camiseta'},{e:'👗',l:'Vestido'},{e:'👟',l:'Zapatillas'},{e:'👠',l:'Tacones'},{e:'👜',l:'Bolso'},
  {e:'🧣',l:'Bufanda'},{e:'🧥',l:'Abrigo'},{e:'🩱',l:'Ropa interior'},{e:'🧤',l:'Guantes'},{e:'👒',l:'Sombrero'},
  {e:'🧳',l:'Maleta'},{e:'🎒',l:'Mochila'},{e:'👓',l:'Gafas'},{e:'🕶️',l:'Gafas de sol'},{e:'💍',l:'Anillo'},
  {e:'👔',l:'Camisa'},{e:'👖',l:'Pantalón'},{e:'🩲',l:'Bañador'},{e:'🩳',l:'Shorts'},{e:'🧢',l:'Gorra'},
  {e:'👑',l:'Corona'},{e:'👛',l:'Monedero'},{e:'🎩',l:'Chistera'},{e:'🪖',l:'Casco'},{e:'👒',l:'Pamela'},
  // Almacenamiento
  {e:'📦',l:'Caja'},{e:'🗃️',l:'Archivador'},{e:'🧺',l:'Canasta'},{e:'🔑',l:'Llaves'},{e:'🗝️',l:'Llave antigua'},
  {e:'🔒',l:'Candado'},{e:'🪝',l:'Gancho'},{e:'🧲',l:'Imán'},{e:'🔋',l:'Pilas'},{e:'🪜',l:'Escalera'},
  // Herramientas
  {e:'🔧',l:'Llave inglesa'},{e:'🪛',l:'Destornillador'},{e:'🪚',l:'Sierra'},{e:'🔨',l:'Martillo'},{e:'⚙️',l:'Engranaje'},
  {e:'🪝',l:'Gancho'},{e:'🧱',l:'Ladrillo'},{e:'🪤',l:'Trampa'},{e:'🪣',l:'Cubo'},{e:'⛏️',l:'Pico'},
  {e:'🔩',l:'Tornillo'},{e:'🪜',l:'Escalera'},{e:'🧰',l:'Caja herram.'},{e:'🗜️',l:'Sargento'},{e:'⚒️',l:'Herramientas'},
  // Limpieza
  {e:'🧹',l:'Escoba'},{e:'🧽',l:'Esponja'},{e:'🫧',l:'Burbujas'},{e:'🧴',l:'Limpiador'},{e:'🪣',l:'Cubo limpieza'},
  // Jardín y exterior
  {e:'🌿',l:'Plantas'},{e:'🌸',l:'Flores'},{e:'🌳',l:'Árbol'},{e:'🌱',l:'Semilla'},{e:'☀️',l:'Sol'},
  {e:'🌦️',l:'Lluvia'},{e:'🌊',l:'Agua'},{e:'🏊',l:'Piscina'},{e:'⛲',l:'Fuente'},{e:'🌵',l:'Cactus'},
  {e:'🍀',l:'Trébol'},{e:'🌾',l:'Trigo'},{e:'🍁',l:'Otoño'},{e:'🌲',l:'Pino'},{e:'🌴',l:'Palmera'},
  // Mascotas
  {e:'🐶',l:'Perro'},{e:'🐱',l:'Gato'},{e:'🐠',l:'Pez'},{e:'🐇',l:'Conejo'},{e:'🐾',l:'Huellas'},
  {e:'🐦',l:'Pájaro'},{e:'🦜',l:'Loro'},{e:'🐢',l:'Tortuga'},{e:'🦎',l:'Lagarto'},{e:'🐹',l:'Hámster'},
  {e:'🐈',l:'Gatito'},{e:'🐕',l:'Perrito'},{e:'🐟',l:'Pececito'},{e:'🦊',l:'Zorro'},{e:'🐰',l:'Conejito'},
  // Vehículos y garaje
  {e:'🚗',l:'Coche'},{e:'🚲',l:'Bici'},{e:'🏍️',l:'Moto'},{e:'🛴',l:'Patinete'},{e:'🚘',l:'Coche 2'},
  {e:'🛵',l:'Vespa'},{e:'🚐',l:'Furgoneta'},{e:'🚕',l:'Taxi'},{e:'🏎️',l:'Deportivo'},{e:'🚙',l:'SUV'},
  // Ocio y deporte
  {e:'🛒',l:'Compras'},{e:'🎁',l:'Regalos'},{e:'🎄',l:'Navidad'},{e:'🏋️',l:'Gimnasio'},{e:'🧘',l:'Yoga'},
  {e:'🎯',l:'Dardos'},{e:'🎲',l:'Juegos'},{e:'♟️',l:'Ajedrez'},{e:'🃏',l:'Cartas'},{e:'🧩',l:'Puzzle'},
  {e:'🎻',l:'Violín'},{e:'🥁',l:'Batería'},{e:'🎺',l:'Trompeta'},{e:'🪗',l:'Acordeón'},{e:'🎤',l:'Karaoke'},
  {e:'🎨',l:'Pintura'},{e:'✂️',l:'Costura'},{e:'🧶',l:'Lana'},{e:'🪡',l:'Hilo'},{e:'🧵',l:'Tejido'},
  // Especiales
  {e:'⭐',l:'Favorito'},{e:'❤️',l:'Amor'},{e:'🌟',l:'Especial'},{e:'📌',l:'Importante'},{e:'🔖',l:'Marcador'},
  {e:'✨',l:'Brillante'},{e:'💫',l:'Destello'},{e:'🎊',l:'Fiesta'},{e:'🎉',l:'Celebrar'},{e:'🏆',l:'Trofeo'},
  {e:'🥇',l:'Primero'},{e:'💎',l:'Diamante'},{e:'🌈',l:'Arcoíris'},{e:'🦋',l:'Mariposa'},{e:'🌙',l:'Luna'},
  // Fruta
  {e:'🍎',l:'Manzana'},{e:'🍊',l:'Naranja'},{e:'🍋',l:'Limón'},{e:'🍇',l:'Uvas'},{e:'🍓',l:'Fresa'},
  {e:'🫐',l:'Arándanos'},{e:'🍑',l:'Melocotón'},{e:'🍒',l:'Cerezas'},{e:'🍌',l:'Plátano'},{e:'🍉',l:'Sandía'},
  {e:'🍍',l:'Piña'},{e:'🥭',l:'Mango'},{e:'🥝',l:'Kiwi'},{e:'🍈',l:'Melón'},{e:'🍐',l:'Pera'},
  // Verdura
  {e:'🥦',l:'Brócoli'},{e:'🥕',l:'Zanahoria'},{e:'🍅',l:'Tomate'},{e:'🧅',l:'Cebolla'},{e:'🧄',l:'Ajo'},
  {e:'🥬',l:'Lechuga'},{e:'🌽',l:'Maíz'},{e:'🥒',l:'Pepino'},{e:'🫑',l:'Pimiento'},{e:'🍆',l:'Berenjena'},
  {e:'🥑',l:'Aguacate'},{e:'🫘',l:'Legumbres'},{e:'🥔',l:'Patata'},{e:'🍠',l:'Boniato'},{e:'🌶️',l:'Chile'},
  // Comida preparada
  {e:'🍕',l:'Pizza'},{e:'🍔',l:'Hamburguesa'},{e:'🌮',l:'Taco'},{e:'🌯',l:'Wrap'},{e:'🥗',l:'Ensalada'},
  {e:'🍣',l:'Sushi'},{e:'🍜',l:'Ramen'},{e:'🍝',l:'Pasta'},{e:'🥩',l:'Carne'},{e:'🍗',l:'Pollo'},
  {e:'🥓',l:'Bacon'},{e:'🌭',l:'Perrito'},{e:'🥪',l:'Sándwich'},{e:'🧀',l:'Queso'},{e:'🥚',l:'Huevos'},
  {e:'🥞',l:'Tortitas'},{e:'🧇',l:'Gofre'},{e:'🍳',l:'Fritos'},{e:'🥘',l:'Cazuela'},{e:'🍲',l:'Estofado'},
  {e:'🫕',l:'Fondue'},{e:'🥙',l:'Kebab'},{e:'🍱',l:'Bento'},{e:'🍛',l:'Curry'},{e:'🐟',l:'Pescado'},
  {e:'🦐',l:'Gambas'},{e:'🦞',l:'Langosta'},{e:'🦑',l:'Calamar'},{e:'🍤',l:'Langostino'},{e:'🥫',l:'Conserva'},
  // Pan y dulces
  {e:'🍞',l:'Pan'},{e:'🥐',l:'Croissant'},{e:'🫓',l:'Pan pita'},{e:'🥖',l:'Baguette'},{e:'🧁',l:'Cupcake'},
  {e:'🍰',l:'Tarta'},{e:'🎂',l:'Pastel'},{e:'🍫',l:'Chocolate'},{e:'🍭',l:'Chuche'},{e:'🍪',l:'Galleta'},
  {e:'🍩',l:'Donut'},{e:'🍦',l:'Helado'},{e:'🍮',l:'Flan'},{e:'🧆',l:'Croqueta'},{e:'🥜',l:'Cacahuetes'},
  // Bebidas
  {e:'☕',l:'Café'},{e:'🍵',l:'Té'},{e:'🫖',l:'Tetera'},{e:'🧃',l:'Zumo'},{e:'🥤',l:'Refresco'},
  {e:'🍷',l:'Vino'},{e:'🍺',l:'Cerveza'},{e:'🥂',l:'Champán'},{e:'🍹',l:'Cóctel'},{e:'🧉',l:'Mate'},
  {e:'🥛',l:'Leche'},{e:'🧋',l:'Bubble tea'},{e:'🫗',l:'Bebida'},{e:'💧',l:'Agua'},{e:'🍶',l:'Sake'},
  // Papelería y oficina extra
  {e:'🖊️',l:'Boli'},{e:'✒️',l:'Pluma'},{e:'🖋️',l:'Estilográfica'},{e:'✏️',l:'Lápiz'},{e:'🔏',l:'Sellado'},
  {e:'📝',l:'Notas'},{e:'📋',l:'Portapapeles'},{e:'📌',l:'Chincheta'},{e:'📍',l:'Pin'},{e:'📎',l:'Clip'},
  {e:'🖇️',l:'Clips'},{e:'📏',l:'Regla'},{e:'📐',l:'Escuadra'},{e:'✂️',l:'Tijeras'},{e:'🗃️',l:'Fichero'},
  {e:'🗄️',l:'Archivador'},{e:'🗑️',l:'Papelera'},{e:'📂',l:'Carpeta abierta'},{e:'📁',l:'Carpeta'},{e:'🗂️',l:'Separadores'},
  {e:'📓',l:'Cuaderno'},{e:'📔',l:'Libreta'},{e:'📒',l:'Diario'},{e:'📕',l:'Libro rojo'},{e:'📗',l:'Libro verde'},
  {e:'📘',l:'Libro azul'},{e:'📙',l:'Libro naranja'},{e:'📚',l:'Libros'},{e:'📖',l:'Libro abierto'},{e:'🔖',l:'Marcador'},
  {e:'🏷️',l:'Etiqueta'},{e:'💰',l:'Dinero'},{e:'💳',l:'Tarjeta'},{e:'🧾',l:'Ticket'},{e:'📊',l:'Gráfico'},
  {e:'📈',l:'Sube'},{e:'📉',l:'Baja'},{e:'📅',l:'Calendario'},{e:'📆',l:'Fecha'},{e:'🗓️',l:'Agenda'},
  // Compra
  {e:'🛒',l:'Carrito'},{e:'🛍️',l:'Bolsa'},{e:'🧾',l:'Ticket'},{e:'💳',l:'Tarjeta'},{e:'💰',l:'Dinero'},
  {e:'🏪',l:'Tienda'},{e:'🏬',l:'Centro comercial'},{e:'🧂',l:'Sal'},{e:'🫒',l:'Aceite'},{e:'🧈',l:'Mantequilla'},
];

var EXTRA_EMOJIS=[
  // Casa y estancias
  {e:'🏠',l:'Casa'},{e:'🏡',l:'Hogar'},{e:'🏘️',l:'Urbanización'},{e:'🏢',l:'Edificio'},{e:'🏚️',l:'Casa antigua'},
  {e:'🛋️',l:'Comedor'},{e:'🍽️',l:'Mesa comedor'},{e:'🪑',l:'Silla comedor'},{e:'🪟',l:'Ventanal'},{e:'🚪',l:'Entrada'},
  {e:'🧱',l:'Pared'},{e:'🧯',l:'Extintor'},{e:'🔔',l:'Timbre'},{e:'📦',l:'Mudanza'},{e:'🧰',l:'Mantenimiento'},
  {e:'🛗',l:'Ascensor'},{e:'🪜',l:'Escaleras'},{e:'🏷️',l:'Etiquetas'},{e:'🗝️',l:'Llaves casa'},{e:'🔐',l:'Seguridad'},
  // Muebles y decoración
  {e:'🛏️',l:'Dormitorio'},{e:'🛌',l:'Cama hecha'},{e:'🛋️',l:'Sillón'},{e:'🪑',l:'Taburete'},{e:'🧸',l:'Habitación infantil'},
  {e:'🪞',l:'Tocador'},{e:'🖼️',l:'Galería'},{e:'🪴',l:'Plantas interior'},{e:'🏺',l:'Florero'},{e:'🕯️',l:'Velas'},
  {e:'💡',l:'Bombilla'},{e:'🔦',l:'Linterna'},{e:'🧺',l:'Cesto'},{e:'🧦',l:'Calcetines'},{e:'🧥',l:'Perchero'},
  {e:'👚',l:'Blusas'},{e:'🧣',l:'Complementos'},{e:'👞',l:'Zapatos vestir'},{e:'🥾',l:'Botas'},{e:'🩴',l:'Chanclas'},
  // Cocina y comedor
  {e:'🍳',l:'Cocina'},{e:'🥘',l:'Cacerola'},{e:'🍲',l:'Sopa'},{e:'🫕',l:'Fondue olla'},{e:'🍽️',l:'Vajilla'},
  {e:'🍴',l:'Tenedor cuchillo'},{e:'🥄',l:'Cucharas'},{e:'🔪',l:'Cuchillos'},{e:'🥣',l:'Cuenco'},{e:'🫙',l:'Despensa'},
  {e:'🥫',l:'Latas'},{e:'🧂',l:'Especias'},{e:'🫒',l:'Aceite oliva'},{e:'🧈',l:'Nevera mantequilla'},{e:'🧊',l:'Congelador'},
  {e:'☕',l:'Cafetera'},{e:'🫖',l:'Tetera'},{e:'🥤',l:'Vasos'},{e:'🍷',l:'Copas'},{e:'🥂',l:'Brindis'},
  // Baño y limpieza
  {e:'🛁',l:'Baño bañera'},{e:'🚿',l:'Ducha baño'},{e:'🚽',l:'Inodoro'},{e:'🧻',l:'Papel higiénico'},{e:'🪥',l:'Higiene dental'},
  {e:'🧴',l:'Champú'},{e:'🧼',l:'Jabones'},{e:'🧽',l:'Fregar'},{e:'🧹',l:'Barrer'},{e:'🪣',l:'Fregona cubo'},
  {e:'🫧',l:'Limpieza burbujas'},{e:'🧺',l:'Lavandería'},{e:'👕',l:'Ropa limpia'},{e:'🪠',l:'Fontanería'},{e:'🚰',l:'Grifería'},
  // Comidas extra
  {e:'🥖',l:'Barra pan'},{e:'🥯',l:'Bagel'},{e:'🧀',l:'Quesería'},{e:'🥩',l:'Filetes'},{e:'🍖',l:'Asado'},
  {e:'🍗',l:'Pollo asado'},{e:'🥓',l:'Embutidos'},{e:'🥚',l:'Hueveras'},{e:'🍤',l:'Rebozados'},{e:'🦐',l:'Marisco'},
  {e:'🍝',l:'Espaguetis'},{e:'🍜',l:'Fideos'},{e:'🍛',l:'Arroz curry'},{e:'🍚',l:'Arroz'},{e:'🍙',l:'Bola arroz'},
  {e:'🌯',l:'Burritos'},{e:'🌮',l:'Tacos'},{e:'🥙',l:'Pita rellena'},{e:'🥪',l:'Bocadillos'},{e:'🍔',l:'Hamburguesas'},
  {e:'🍟',l:'Patatas fritas'},{e:'🥨',l:'Pretzel'},{e:'🍿',l:'Palomitas'},{e:'🧆',l:'Croquetas falafel'},{e:'🥟',l:'Empanadillas'},
  {e:'🥧',l:'Empanada pastel'},{e:'🍪',l:'Galletas'},{e:'🍩',l:'Rosquillas'},{e:'🍮',l:'Postres'},{e:'🍯',l:'Miel'},
  {e:'🥜',l:'Frutos secos'},{e:'🌰',l:'Castañas'},{e:'🍄',l:'Setas'},{e:'🫛',l:'Guisantes'},{e:'🫚',l:'Jengibre'},
  // Exterior y ocio en casa
  {e:'🌳',l:'Jardín árbol'},{e:'🌷',l:'Tulipanes'},{e:'🪻',l:'Lavanda flor'},{e:'🌵',l:'Cactus terraza'},{e:'⛲',l:'Fuente jardín'},
  {e:'🏊',l:'Piscina'},{e:'☂️',l:'Sombrilla'},{e:'🪁',l:'Patio juegos'},{e:'🚲',l:'Bicicletas'},{e:'🛴',l:'Patinetes'},
  {e:'📺',l:'Televisor'},{e:'🎮',l:'Consola'},{e:'🧩',l:'Juegos puzzle'},{e:'🎲',l:'Juegos mesa'},{e:'📚',l:'Biblioteca'},
  {e:'🧶',l:'Manualidades'},{e:'🧵',l:'Costurero'},{e:'🎨',l:'Pinturas'},{e:'🎹',l:'Piano casa'},{e:'🎧',l:'Auriculares'}
];
EXTRA_EMOJIS.forEach(item=>{
  if(!ALL_EMOJIS.some(x=>x.e===item.e&&x.l===item.l))ALL_EMOJIS.push(item);
});
var HOME_DETAIL_EMOJIS=[
  // Muebles concretos
  {e:'🪑',l:'Mesa estudio'},{e:'🪑',l:'Mesa despacho'},{e:'🍽️',l:'Mesa cocina'},{e:'🍽️',l:'Mesa plegable'},{e:'🛋️',l:'Mesa centro'},
  {e:'🛏️',l:'Mesita noche'},{e:'🛏️',l:'Cama con mueble integrado'},{e:'💻',l:'Mesa estudio integrada'},{e:'💻',l:'Escritorio integrado'},
  {e:'👕',l:'Armario grande'},{e:'👕',l:'Armario pequeño'},{e:'🚪',l:'Armario empotrado'},{e:'👕',l:'Armario ropa'},{e:'🧥',l:'Armario entrada'},
  {e:'📦',l:'Cajonera'},{e:'📦',l:'Cajonera 3 cajones'},{e:'📦',l:'Cajonera 4 cajones'},{e:'📦',l:'Cajonera 5 cajones'},{e:'📦',l:'Cajonera 6 cajones'},
  {e:'📦',l:'Cajonera varios cajones'},{e:'🧺',l:'Cajones plástico'},{e:'📦',l:'Cajones debajo mesa'},{e:'📦',l:'Armario debajo mesa'},
  {e:'📚',l:'Estantería 4 baldas'},{e:'📚',l:'Estantería pared larga libros'},{e:'📚',l:'Estantería dentro armario'},{e:'📦',l:'Cajón dentro armario'},
  {e:'📚',l:'Estantería alta'},{e:'📚',l:'Estantería baja'},{e:'📚',l:'Estantería pared'},{e:'📚',l:'Librería larga'},
  {e:'📦',l:'Baúl'},{e:'📦',l:'Caja blanca pequeña'},{e:'🧰',l:'Caja herramientas'},{e:'🧺',l:'Cesto ropa'},
  {e:'🚪',l:'Puerta corredera'},{e:'🚪',l:'Puerta armario'},{e:'🚪',l:'Puerta habitación'},{e:'🚪',l:'Puerta exterior'},{e:'🚪',l:'Puerta cristal'},
  {e:'🪟',l:'Ventana habitación'},{e:'🪟',l:'Ventana cocina'},{e:'🪟',l:'Ventana baño'},{e:'🧱',l:'Plano casa'},{e:'🧭',l:'Distribución casa'},
  // Electrodomésticos y cocina
  {e:'🧊',l:'Nevera'},{e:'🧊',l:'Frigorífico'},{e:'🔥',l:'Horno'},{e:'🍳',l:'Vitrocerámica'},{e:'🍳',l:'Placa cocina'},
  {e:'🧺',l:'Lavadora'},{e:'🧺',l:'Secadora'},{e:'🧽',l:'Lavavajillas'},{e:'☕',l:'Cafetera cápsulas'},{e:'☕',l:'Cafetera italiana'},
  {e:'🥤',l:'Vaso agua'},{e:'🥤',l:'Vaso alto'},{e:'🥛',l:'Vaso leche'},{e:'🍷',l:'Copa vino'},{e:'🥂',l:'Copa cava'},
  {e:'🥪',l:'Bocadillos'},{e:'🥖',l:'Bocadillo barra'},{e:'🥪',l:'Sandwiches'},{e:'🍽️',l:'Bandejas'},{e:'🥣',l:'Tuppers'},
  // Oficina, papelería y gadgets
  {e:'💻',l:'Gadgets'},{e:'📱',l:'Gadgets móvil'},{e:'⌚',l:'Smartwatch'},{e:'🔌',l:'Cargadores'},{e:'🔋',l:'Baterías'},
  {e:'🖨️',l:'Impresora oficina'},{e:'📁',l:'Carpetas'},{e:'📂',l:'Carpeta documentos'},{e:'🗂️',l:'Clasificador'},{e:'📎',l:'Clips papelería'},
  {e:'✏️',l:'Lapicero'},{e:'🖊️',l:'Bolígrafos'},{e:'📓',l:'Libretas'},{e:'📋',l:'Listas oficina'},{e:'🗓️',l:'Calendario pared'},
  {e:'📅',l:'Calendario mesa'},{e:'⏰',l:'Reloj alarma'},{e:'🕰️',l:'Reloj pared'},{e:'🧾',l:'Tickets'},{e:'🧾',l:'Facturas'},
  // Cafetería
  {e:'☕',l:'Cafetería'},{e:'🥐',l:'Desayuno cafetería'},{e:'🍰',l:'Pastelería'},{e:'🫖',l:'Té cafetería'},{e:'🥤',l:'Bebidas cafetería'},
  // Exterior, patio y plantas
  {e:'🌳',l:'Patio'},{e:'🌳',l:'Exterior casa'},{e:'🌿',l:'Terraza plantas'},{e:'🍋',l:'Limonero'},{e:'🌳',l:'Árbol jardín'},
  {e:'🌲',l:'Pino jardín'},{e:'🌴',l:'Palmera patio'},{e:'🪴',l:'Macetas patio'},{e:'🌷',l:'Flores patio'},{e:'🪑',l:'Banco jardín'},
  {e:'🍽️',l:'Mesa jardín'},{e:'☂️',l:'Sombrilla patio'},{e:'⛲',l:'Fuente patio'},{e:'🧱',l:'Mesa empotrada'},{e:'🧱',l:'Banco empotrado'}
];
HOME_DETAIL_EMOJIS.forEach(item=>{
  if(!ALL_EMOJIS.some(x=>x.e===item.e&&x.l===item.l))ALL_EMOJIS.push(item);
});
var CAL_COLORS={
  none:{name:'Sin color',bg:'rgba(255,255,255,.55)',border:'rgba(255,255,255,.36)',dot:'#d05828'},
  rosa:{name:'Rosa',bg:'#ffdce8',border:'#e84898',dot:'#e84898'},
  coral:{name:'Coral',bg:'#ffe0d8',border:'#f06050',dot:'#f06050'},
  naranja:{name:'Naranja',bg:'#ffe5c4',border:'#f09030',dot:'#f09030'},
  amarillo:{name:'Amarillo',bg:'#fff0b8',border:'#d6a900',dot:'#d6a900'},
  verde:{name:'Verde',bg:'#d9f3d8',border:'#35a85a',dot:'#35a85a'},
  menta:{name:'Menta',bg:'#d7f4ea',border:'#30b898',dot:'#30b898'},
  azul:{name:'Azul',bg:'#d8eaff',border:'#2f80ed',dot:'#2f80ed'},
  lila:{name:'Lila',bg:'#eadcff',border:'#8b5adf',dot:'#8b5adf'},
  celeste:{name:'Azul celeste',bg:'#dff1fb',border:'#5bb8e8',dot:'#5bb8e8'},
  verdeclaro:{name:'Verde claro',bg:'#e3f5d8',border:'#7cc35a',dot:'#7cc35a'},
  verdeoscuro:{name:'Verde oscuro',bg:'#d3e8da',border:'#2e7d4f',dot:'#2e7d4f'},
  rojo:{name:'Rojo',bg:'#fddcdc',border:'#d93a3a',dot:'#d93a3a'},
  marronclaro:{name:'Marrón claro',bg:'#f1e2d1',border:'#c49a6c',dot:'#c49a6c'},
  marronoscuro:{name:'Marrón oscuro',bg:'#e6d5c6',border:'#7a4e2d',dot:'#7a4e2d'},
  caqui:{name:'Caqui',bg:'#ece8cf',border:'#9a9255',dot:'#9a9255'}
};
var CAL_COLOR_KEYS=Object.keys(CAL_COLORS);

// ── ICONOS DE MUEBLES (dibujados, porque no existen como emoji) ──
var FURN_STROKE='#3a3a3c';   // PorHacer3: iconos en gris, blanco y rojo
function furnSvg(inner){
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="${FURN_STROKE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`);
}
var FURNITURE_ICONS=(()=>{const W='#f1f1f4', LAV='#dcdde2', MINT='#ebebee', ROSE='#ffb4ad', SKY='#cfd1d8', BUT='#ffffff', K=`fill="${FURN_STROKE}" stroke="none"`;
return [
  {l:'Armario',k:['armario','armari','ropero','guardarropa'],svg:`<rect x="13" y="7" width="38" height="47" rx="3" fill="${W}"/><path d="M32 7v47"/><circle cx="28.5" cy="31" r="1.6" ${K}/><circle cx="35.5" cy="31" r="1.6" ${K}/><path d="M17 54v4M47 54v4"/>`},
  {l:'Cómoda',k:['comoda','cómoda','calaixera','cajonera'],svg:`<rect x="9" y="17" width="46" height="34" rx="3" fill="${W}"/><path d="M9 28.3h46M9 39.6h46"/><path d="M28 22.6h8M28 33.9h8M28 45.3h8"/><path d="M14 51v6M50 51v6"/>`},
  {l:'Mesita de noche',k:['mesita','mesilla','tauleta','noche','nit'],svg:`<path d="M24 6h14l4 11H20z" fill="${BUT}"/><path d="M31 17v6M26 23h10"/><rect x="15" y="27" width="34" height="25" rx="3" fill="${W}"/><path d="M15 39.5h34"/><path d="M29 33h6M29 45.5h6"/><path d="M19 52v6M45 52v6"/>`},
  {l:'Estantería',k:['estanteria','estantería','prestatgeria','libreria','librería','biblioteca'],svg:`<rect x="12" y="6" width="40" height="52" rx="2" fill="${W}"/><path d="M12 19h40M12 32h40M12 45h40"/><rect x="16" y="10" width="5" height="9" fill="${ROSE}"/><rect x="22" y="11" width="5" height="8" fill="${SKY}"/><rect x="34" y="23" width="5" height="9" fill="${MINT}"/><rect x="40" y="24" width="5" height="8" fill="${LAV}"/><rect x="18" y="36" width="5" height="9" fill="${BUT}"/><rect x="38" y="49" width="9" height="5" rx="1" fill="${ROSE}"/>`},
  {l:'Escritorio',k:['escritorio','escriptori','mesa de estudio','despacho'],svg:`<rect x="6" y="22" width="52" height="6" rx="2" fill="${W}"/><rect x="9" y="28" width="17" height="25" rx="2" fill="${W}"/><path d="M9 40.5h17M15 34h5M15 46.5h5M51 28v25"/><rect x="34" y="11" width="16" height="11" rx="2" fill="${SKY}"/>`},
  {l:'Mesa',k:['mesa','taula','mesa comedor'],svg:`<rect x="7" y="24" width="50" height="6" rx="2" fill="${W}"/><path d="M12 30v24M52 30v24M20 30v14M44 30v14"/>`},
  {l:'Zapatero',k:['zapatero','sabater','zapatos','sabates','calzado'],svg:`<rect x="10" y="18" width="44" height="36" rx="3" fill="${W}"/><path d="M10 36h44"/><path d="M15 31c0-4 3-5 6-5l4 3h4v2z" fill="${ROSE}"/><path d="M34 31c0-4 3-5 6-5l4 3h4v2z" fill="${SKY}"/><path d="M15 49c0-4 3-5 6-5l4 3h4v2z" fill="${MINT}"/><path d="M34 49c0-4 3-5 6-5l4 3h4v2z" fill="${BUT}"/>`},
  {l:'Mueble TV',k:['tele','tv','television','televisión','mueble tv','moble tv'],svg:`<rect x="15" y="9" width="34" height="22" rx="3" fill="${SKY}"/><path d="M28 31v5h8v-5"/><rect x="6" y="36" width="52" height="16" rx="3" fill="${W}"/><path d="M23.3 36v16M40.6 36v16"/><path d="M12 56v2M52 56v2M12 52v4M52 52v4"/>`},
  {l:'Aparador',k:['aparador','bufe','bufé','buffet','credenza'],svg:`<rect x="7" y="20" width="50" height="30" rx="3" fill="${W}"/><path d="M7 29h50M23.6 29v21M40.3 29v21"/><path d="M28 24.5h8M20 39.5v1M27 39.5v1M37 39.5v1M44 39.5v1"/><path d="M12 50v7M52 50v7"/>`},
  {l:'Vitrina',k:['vitrina','vitrines','cristalera','cristaleria'],svg:`<rect x="13" y="6" width="38" height="50" rx="3" fill="${W}"/><rect x="17" y="10" width="30" height="30" rx="1.5" fill="${SKY}"/><path d="M17 25h30M32 10v30"/><circle cx="24" cy="19" r="3" fill="#fff"/><circle cx="40" cy="34" r="3" fill="#fff"/><path d="M13 45h38M28 50.5h8M17 56v3M47 56v3"/>`},
  {l:'Baúl',k:['baul','baúl','bagul','cofre'],svg:`<path d="M9 30c0-9 6-14 23-14s23 5 23 14z" fill="${W}"/><rect x="9" y="30" width="46" height="24" rx="3" fill="${W}"/><path d="M20 16.6V54M44 16.6V54"/><rect x="28" y="27" width="8" height="9" rx="1.5" fill="${BUT}"/>`},
  {l:'Cajón',k:['cajon','cajón','calaix'],svg:`<path d="M8 26h48v22a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" fill="${W}"/><path d="M8 26l6-8h36l6 8"/><path d="M26 38h12"/>`},
  {l:'Balda',k:['balda','estante','prestatge','repisa','leja'],svg:`<rect x="6" y="34" width="52" height="6" rx="2" fill="${W}"/><path d="M14 40l-4 10M50 40l4 10M14 40v10M50 40v10"/><rect x="14" y="20" width="6" height="14" fill="${ROSE}"/><rect x="21" y="23" width="6" height="11" fill="${SKY}"/><circle cx="43" cy="28" r="6" fill="${MINT}"/>`},
  {l:'Altillo',k:['altillo','altell','maletero'],svg:`<rect x="8" y="6" width="48" height="18" rx="3" fill="${LAV}"/><path d="M32 6v18M28 18h-2M38 18h-2"/><rect x="13" y="28" width="38" height="30" rx="3" fill="${W}" stroke-dasharray="3 4"/>`},
  {l:'Perchero',k:['perchero','penjador','colgador','abrigos'],svg:`<path d="M32 8v46M22 58h20M24 54h16"/><path d="M32 14l-9 6M32 14l9 6M32 22l-8 5M32 22l8 5"/><circle cx="32" cy="8" r="2.5" fill="${BUT}"/><path d="M41 20c3 0 4 3 2 6l-3 6h-6z" fill="${ROSE}"/>`},
  {l:'Mueble de baño',k:['baño','bany','lavabo','pica','mueble de baño'],svg:`<path d="M10 28h44a0 0 0 0 1 0 0c0 6-6 9-12 9H22c-6 0-12-3-12-9z" fill="#fff"/><path d="M32 28v-8h6"/><rect x="12" y="37" width="40" height="19" rx="3" fill="${MINT}"/><path d="M32 37v19M28 46h-2M38 46h-2"/>`},
  {l:'Despensa',k:['despensa','rebost','alacena','armario cocina'],svg:`<rect x="13" y="6" width="38" height="52" rx="3" fill="${W}"/><path d="M13 22h38M13 38h38"/><rect x="18" y="11" width="7" height="11" rx="2" fill="${BUT}"/><rect x="28" y="13" width="7" height="9" rx="2" fill="${ROSE}"/><rect x="38" y="26" width="8" height="12" rx="2" fill="${MINT}"/><rect x="19" y="28" width="8" height="10" rx="2" fill="${SKY}"/><rect x="30" y="43" width="10" height="11" rx="2" fill="${LAV}"/>`},
  {l:'Caja',k:['caja','caixa','contenedor','organizador'],svg:`<rect x="10" y="22" width="44" height="32" rx="3" fill="${SKY}"/><rect x="7" y="15" width="50" height="9" rx="3" fill="${LAV}"/><path d="M27 34h10"/>`},
  {l:'Caja cartón',k:['carton','cartón','cartro','mudanza'],svg:`<path d="M10 24h44v28a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2z" fill="${W}"/><path d="M10 24l6-10h32l6 10M32 14v10"/><rect x="26" y="24" width="12" height="7" fill="${BUT}"/>`},
  {l:'Nevera',k:['nevera','frigorifico','frigorífico','frigo','congelador'],svg:`<rect x="15" y="5" width="34" height="54" rx="4" fill="#fff"/><path d="M15 24h34M20 12v6M20 30v10"/><circle cx="38" cy="15" r="2.5" fill="${MINT}"/>`},
  {l:'Lavadora',k:['lavadora','rentadora','secadora'],svg:`<rect x="12" y="6" width="40" height="52" rx="4" fill="#fff"/><path d="M12 17h40"/><circle cx="32" cy="38" r="12" fill="${SKY}"/><path d="M24 40c4-3 8 3 16 0"/><circle cx="19" cy="11.5" r="1.8" ${K}/><path d="M38 11.5h8"/>`},
  {l:'Cama',k:['cama','llit'],svg:`<rect x="7" y="16" width="10" height="38" rx="2" fill="${W}"/><rect x="17" y="34" width="40" height="12" rx="2" fill="${LAV}"/><rect x="19" y="27" width="12" height="7" rx="3" fill="#fff"/><path d="M17 46h40M54 46v8"/>`},
  {l:'Sofá',k:['sofa','sofá'],svg:`<rect x="12" y="18" width="40" height="18" rx="5" fill="${ROSE}"/><rect x="6" y="28" width="12" height="20" rx="4" fill="${ROSE}"/><rect x="46" y="28" width="12" height="20" rx="4" fill="${ROSE}"/><rect x="18" y="34" width="28" height="14" fill="${ROSE}"/><path d="M10 48v6M54 48v6M32 34v14"/>`},
  {l:'Trastero',k:['trastero','traster','garaje','garatge','sotano','sótano'],svg:`<path d="M6 28L32 10l26 18v28H6z" fill="${W}"/><rect x="16" y="32" width="32" height="24" fill="#fff"/><path d="M16 38h32M16 44h32M16 50h32"/>`},

  {l:'Estantería de pared',k:['estanteria de pared','estantería de pared','estante de pared','prestatgeria de paret','lleixa','flotante','de pared'],svg:`<path d="M6 6h52v52H6z" fill="#fff" stroke-dasharray="2 4" stroke-width="1.6"/><rect x="10" y="22" width="44" height="4" rx="1.5" fill="${W}"/><rect x="10" y="44" width="44" height="4" rx="1.5" fill="${W}"/><rect x="14" y="11" width="5" height="11" fill="${ROSE}"/><rect x="20" y="13" width="5" height="9" fill="${SKY}"/><path d="M40 22l2-7h8l2 7z" fill="${MINT}"/><path d="M46 15c0-4 3-6 5-7M46 15c0-3-2-5-5-6"/><rect x="16" y="34" width="10" height="10" rx="2" fill="${BUT}"/><rect x="33" y="35" width="5" height="9" fill="${LAV}"/><rect x="39" y="33" width="5" height="11" fill="${ROSE}"/>`},
  {l:'Estantería IKEA',k:['ikea','kallax','estanteria ikea','estantería ikea','prestatgeria ikea','estanteria kallax','cubos','cubs','estanteria cubos','estantería cubos','expedit'],svg:`<rect x="8" y="8" width="48" height="48" rx="2" fill="${W}"/><path d="M20 8v48M32 8v48M44 8v48M8 20h48M8 32h48M8 44h48"/><rect x="21.5" y="9.5" width="9" height="9" rx="1" fill="${ROSE}"/><rect x="45.5" y="21.5" width="9" height="9" rx="1" fill="${MINT}"/><rect x="9.5" y="33.5" width="9" height="9" rx="1" fill="${SKY}"/><rect x="33.5" y="45.5" width="9" height="9" rx="1" fill="${BUT}"/><rect x="33.5" y="21.5" width="9" height="9" rx="1" fill="${LAV}"/><path d="M12 56v3M52 56v3"/>`},
  {l:'Sofá dos plazas',k:['dos plazas','2 plazas','dues places','2 places','sofa pequeño','sofá pequeño','loveseat'],svg:`<rect x="15" y="18" width="34" height="18" rx="5" fill="${MINT}"/><rect x="9" y="28" width="11" height="20" rx="4" fill="${MINT}"/><rect x="44" y="28" width="11" height="20" rx="4" fill="${MINT}"/><rect x="20" y="34" width="24" height="14" fill="${MINT}"/><path d="M32 34v14M13 48v6M51 48v6"/>`},
  {l:'Sillón',k:['sillon','sillón','butaca','orejero','balancin','balancín','cadira de braços'],svg:`<path d="M18 14c0-4 3-6 7-6h14c4 0 7 2 7 6v22H18z" fill="${ROSE}"/><rect x="12" y="26" width="10" height="22" rx="4" fill="${ROSE}"/><rect x="42" y="26" width="10" height="22" rx="4" fill="${ROSE}"/><rect x="22" y="34" width="20" height="14" rx="2" fill="${ROSE}"/><path d="M16 48l-2 8M48 48l2 8"/>`},
  {l:'Cama de matrimonio',k:['matrimonio','matrimoni','cama doble','llit doble','cama grande','cama de 150','cama de 135','cama de 160'],svg:`<rect x="8" y="6" width="48" height="10" rx="3" fill="${W}"/><rect x="10" y="16" width="44" height="40" rx="3" fill="#fff"/><rect x="13" y="19" width="17" height="8" rx="3" fill="${LAV}"/><rect x="34" y="19" width="17" height="8" rx="3" fill="${LAV}"/><path d="M10 32h44v21a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="${SKY}"/><path d="M10 36h44"/>`},
  {l:'Cama individual',k:['individual','cama pequeña','cama de 90','una persona','llit individual','llit senzill'],svg:`<rect x="18" y="6" width="28" height="10" rx="3" fill="${W}"/><rect x="20" y="16" width="24" height="40" rx="3" fill="#fff"/><rect x="24" y="19" width="16" height="8" rx="3" fill="${LAV}"/><path d="M20 32h24v21a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3z" fill="${ROSE}"/><path d="M20 36h24"/>`},
  {l:'Cama con cajones',k:['cama con cajones','cajones debajo','cajones abajo','canape','canapé','llit amb calaixos','calaixos sota'],svg:`<rect x="6" y="14" width="8" height="30" rx="2" fill="${W}"/><rect x="14" y="27" width="44" height="8" rx="2" fill="${LAV}"/><rect x="16" y="21" width="12" height="6" rx="3" fill="#fff"/><rect x="14" y="35" width="44" height="18" rx="2" fill="${W}"/><path d="M36 35v18"/><path d="M22 44h6M44 44h6"/>`},
  {l:'Cama con mueble',k:['cama con mueble','cama compacta','cama nido','cama abatible','abatible','llit amb moble','cama tren','cama puente'],svg:`<rect x="6" y="6" width="12" height="50" rx="2" fill="${W}"/><rect x="46" y="6" width="12" height="50" rx="2" fill="${W}"/><rect x="18" y="6" width="28" height="12" rx="2" fill="${W}"/><path d="M6 31h12M46 31h12M12 18v2M52 18v2M32 12h0"/><rect x="18" y="38" width="28" height="7" rx="2" fill="${LAV}"/><rect x="20" y="33" width="9" height="5" rx="2.5" fill="#fff"/><rect x="18" y="45" width="28" height="11" rx="2" fill="${W}"/><path d="M29 50.5h6"/>`},
  {l:'Ventana',k:['ventana','finestra','ventanal','balcon','balcón','balco'],svg:`<rect x="12" y="8" width="40" height="44" rx="2" fill="${SKY}"/><path d="M32 8v44M12 30h40"/><path d="M8 8h48"/><path d="M10 8c0 14 2 26 8 34l-8 0z" fill="${ROSE}"/><path d="M54 8c0 14-2 26-8 34l8 0z" fill="${ROSE}"/><rect x="8" y="52" width="48" height="5" rx="2" fill="${W}"/>`},
  {l:'Armario empotrado',k:['empotrado','empotrat','encastat','armario de pared'],svg:`<path d="M4 6h56M4 58h56" stroke-width="2"/><path d="M4 6v52M60 6v52" stroke-width="1.4" stroke-dasharray="3 3"/><rect x="9" y="6" width="46" height="52" fill="${W}"/><path d="M24.3 6v52M39.6 6v52"/><path d="M21 30v5M28 30v5M36 30v5M43 30v5"/>`},
  {l:'Armario sin empotrar',k:['sin empotrar','armario libre','armario de pie','armario exento','armari lliure','armario antiguo'],svg:`<path d="M10 9h44l-2-4H12z" fill="${W}"/><rect x="12" y="9" width="40" height="38" rx="2" fill="${W}"/><path d="M32 9v38"/><circle cx="28.5" cy="28" r="1.6" ${K}/><circle cx="35.5" cy="28" r="1.6" ${K}/><rect x="12" y="47" width="40" height="8" rx="2" fill="${W}"/><path d="M29 51h6M15 55l-1 4M49 55l1 4"/>`},
  {l:'Mueble comedor',k:['mueble comedor','mueble del comedor','moble menjador','menjador','composicion','composición','salon','salón'],svg:`<rect x="6" y="34" width="52" height="20" rx="2" fill="${W}"/><path d="M23 34v20M41 34v20M27 44h10M18 44v1M46 44v1"/><rect x="23" y="8" width="18" height="26" rx="2" fill="${SKY}"/><path d="M23 21h18"/><circle cx="32" cy="15" r="3" fill="#fff"/><rect x="8" y="16" width="13" height="4" rx="1.5" fill="${W}"/><rect x="43" y="22" width="13" height="4" rx="1.5" fill="${W}"/><rect x="11" y="10" width="4" height="6" fill="${ROSE}"/><path d="M50 22l1-5h3l1 5z" fill="${MINT}"/><path d="M10 54v4M54 54v4"/>`},
  {l:'Armario 3 puertas correderas',k:['correderas','corredera','corredisses','tres puertas','3 puertas','armario grande','tres portes'],svg:`<rect x="5" y="8" width="54" height="48" rx="2" fill="${W}"/><path d="M5 12h54M5 52h54"/><rect x="8" y="12" width="17" height="40" fill="${W}"/><rect x="23.5" y="12" width="17" height="40" fill="${SKY}"/><rect x="39" y="12" width="17" height="40" fill="${W}"/><path d="M21 30v6M43 30v6"/><path d="M28 18l8 8M28 24l5 5" stroke-width="1.6" opacity=".6"/>`},
];})();
FURNITURE_ICONS.forEach(f=>{f.src=furnSvg(f.svg);});
var EMOJI_TABS={"Casa": [{"e": "🛏️", "l": "Cama"}, {"e": "🛋️", "l": "Sofá"}, {"e": "🪑", "l": "Silla"}, {"e": "🚪", "l": "Puerta"}, {"e": "🪞", "l": "Espejo"}, {"e": "🪟", "l": "Ventana"}, {"e": "🖼️", "l": "Cuadro"}, {"e": "🪆", "l": "Decoración"}, {"e": "🕯️", "l": "Vela"}, {"e": "💡", "l": "Luz"}, {"e": "🔆", "l": "Lámpara"}, {"e": "🪔", "l": "Farolillo"}, {"e": "🧸", "l": "Peluche"}, {"e": "🎀", "l": "Lazo"}, {"e": "🏺", "l": "Jarrón"}, {"e": "🪬", "l": "Amuleto"}, {"e": "🧿", "l": "Ojo turco"}, {"e": "🎋", "l": "Bambú"}, {"e": "🪴", "l": "Maceta"}, {"e": "🌺", "l": "Flor"}, {"e": "🌻", "l": "Girasol"}, {"e": "🌹", "l": "Rosa"}, {"e": "💐", "l": "Ramo"}, {"e": "🌿", "l": "Planta"}, {"e": "🌱", "l": "Brote"}, {"e": "🛁", "l": "Bañera"}, {"e": "🚿", "l": "Ducha"}, {"e": "🚽", "l": "WC"}, {"e": "🪥", "l": "Cepillo dientes"}, {"e": "🧴", "l": "Crema"}, {"e": "🧼", "l": "Jabón"}, {"e": "🪒", "l": "Afeitado"}, {"e": "🧻", "l": "Papel"}, {"e": "🪣", "l": "Cubo"}, {"e": "🧽", "l": "Esponja"}, {"e": "🪮", "l": "Cepillo pelo"}, {"e": "💈", "l": "Barbería"}, {"e": "🧖", "l": "Spa"}, {"e": "🪠", "l": "Desatascador"}, {"e": "🚰", "l": "Grifo"}, {"e": "🍳", "l": "Cocinar"}, {"e": "🍽️", "l": "Platos"}, {"e": "🥄", "l": "Cuchara"}, {"e": "🍴", "l": "Cubiertos"}, {"e": "🔪", "l": "Cuchillo"}, {"e": "🫙", "l": "Tarros"}, {"e": "🧃", "l": "Bebidas"}, {"e": "🧊", "l": "Hielo"}, {"e": "🫕", "l": "Olla"}, {"e": "☕", "l": "Café"}, {"e": "🍞", "l": "Pan"}, {"e": "🥗", "l": "Ensalada"}, {"e": "🥤", "l": "Vaso"}, {"e": "🫖", "l": "Tetera"}, {"e": "🍷", "l": "Vino"}, {"e": "🥘", "l": "Cazuela"}, {"e": "🧂", "l": "Sal"}, {"e": "🍰", "l": "Tarta"}, {"e": "🧁", "l": "Cupcake"}, {"e": "🍫", "l": "Chocolate"}, {"e": "🍭", "l": "Chuche"}, {"e": "🧇", "l": "Gofre"}, {"e": "🥞", "l": "Tortitas"}, {"e": "🥚", "l": "Huevo"}, {"e": "🧈", "l": "Mantequilla"}, {"e": "🫓", "l": "Pan pita"}, {"e": "🥐", "l": "Croissant"}, {"e": "🍕", "l": "Pizza"}, {"e": "🍣", "l": "Sushi"}, {"e": "📦", "l": "Caja"}, {"e": "🗃️", "l": "Archivador"}, {"e": "🧺", "l": "Canasta"}, {"e": "🔑", "l": "Llaves"}, {"e": "🗝️", "l": "Llave antigua"}, {"e": "🔒", "l": "Candado"}, {"e": "🪝", "l": "Gancho"}, {"e": "🧲", "l": "Imán"}, {"e": "🔋", "l": "Pilas"}, {"e": "🪜", "l": "Escalera"}, {"e": "🧹", "l": "Escoba"}, {"e": "🫧", "l": "Burbujas"}, {"e": "🏠", "l": "Casa"}, {"e": "🏡", "l": "Hogar"}, {"e": "🏘️", "l": "Urbanización"}, {"e": "🏢", "l": "Edificio"}, {"e": "🏚️", "l": "Casa antigua"}, {"e": "🧱", "l": "Pared"}, {"e": "🧯", "l": "Extintor"}, {"e": "🔔", "l": "Timbre"}, {"e": "🧰", "l": "Mantenimiento"}, {"e": "🛗", "l": "Ascensor"}, {"e": "🏷️", "l": "Etiquetas"}, {"e": "🔐", "l": "Seguridad"}, {"e": "🛌", "l": "Cama hecha"}, {"e": "🔦", "l": "Linterna"}, {"e": "🧦", "l": "Calcetines"}, {"e": "🧥", "l": "Perchero"}, {"e": "👚", "l": "Blusas"}, {"e": "🧣", "l": "Complementos"}, {"e": "👞", "l": "Zapatos vestir"}, {"e": "🥾", "l": "Botas"}, {"e": "🩴", "l": "Chanclas"}, {"e": "🍲", "l": "Sopa"}, {"e": "🥣", "l": "Cuenco"}, {"e": "🥫", "l": "Latas"}, {"e": "🫒", "l": "Aceite oliva"}, {"e": "🥂", "l": "Brindis"}, {"e": "👕", "l": "Ropa limpia"}, {"e": "💻", "l": "Mesa estudio integrada"}, {"e": "📚", "l": "Estantería 4 baldas"}, {"e": "🧭", "l": "Distribución casa"}, {"e": "🔥", "l": "Horno"}, {"e": "🥛", "l": "Vaso leche"}, {"e": "🥪", "l": "Bocadillos"}, {"e": "🥖", "l": "Bocadillo barra"}], "Objetos": [{"e": "💊", "l": "Medicinas"}, {"e": "🩹", "l": "Botiquín"}, {"e": "🩺", "l": "Médico"}, {"e": "🧪", "l": "Botes"}, {"e": "🌡️", "l": "Termómetro"}, {"e": "🩻", "l": "Radiografía"}, {"e": "💉", "l": "Jeringa"}, {"e": "🩸", "l": "Sangre"}, {"e": "🫀", "l": "Corazón"}, {"e": "🧬", "l": "ADN"}, {"e": "📺", "l": "TV"}, {"e": "🎮", "l": "Videojuegos"}, {"e": "🎵", "l": "Música"}, {"e": "🎸", "l": "Guitarra"}, {"e": "🎹", "l": "Piano"}, {"e": "📷", "l": "Fotos"}, {"e": "📚", "l": "Libros"}, {"e": "📖", "l": "Lectura"}, {"e": "🖥️", "l": "PC"}, {"e": "💻", "l": "Portátil"}, {"e": "⌨️", "l": "Teclado"}, {"e": "🖱️", "l": "Ratón"}, {"e": "📱", "l": "Móvil"}, {"e": "🎧", "l": "Auriculares"}, {"e": "📡", "l": "Antena"}, {"e": "🖨️", "l": "Impresora"}, {"e": "💾", "l": "Disco"}, {"e": "📀", "l": "DVD"}, {"e": "📻", "l": "Radio"}, {"e": "🎬", "l": "Películas"}, {"e": "📹", "l": "Vídeo"}, {"e": "🔭", "l": "Telescopio"}, {"e": "🔬", "l": "Microscopio"}, {"e": "🧭", "l": "Brújula"}, {"e": "💼", "l": "Trabajo"}, {"e": "🗂️", "l": "Archivos"}, {"e": "📁", "l": "Carpeta"}, {"e": "✏️", "l": "Lápiz"}, {"e": "📌", "l": "Pin"}, {"e": "📎", "l": "Clip"}, {"e": "📏", "l": "Regla"}, {"e": "📐", "l": "Escuadra"}, {"e": "🗒️", "l": "Bloc"}, {"e": "📓", "l": "Cuaderno"}, {"e": "📋", "l": "Portapapeles"}, {"e": "📊", "l": "Gráfico"}, {"e": "📈", "l": "Subida"}, {"e": "📉", "l": "Bajada"}, {"e": "🗃️", "l": "Archivador"}, {"e": "📬", "l": "Buzón"}, {"e": "📮", "l": "Correos"}, {"e": "🖊️", "l": "Bolígrafo"}, {"e": "✒️", "l": "Pluma"}, {"e": "🗓️", "l": "Agenda"}, {"e": "👕", "l": "Camiseta"}, {"e": "👗", "l": "Vestido"}, {"e": "👟", "l": "Zapatillas"}, {"e": "👠", "l": "Tacones"}, {"e": "👜", "l": "Bolso"}, {"e": "🧣", "l": "Bufanda"}, {"e": "🧥", "l": "Abrigo"}, {"e": "🩱", "l": "Ropa interior"}, {"e": "🧤", "l": "Guantes"}, {"e": "👒", "l": "Sombrero"}, {"e": "🧳", "l": "Maleta"}, {"e": "🎒", "l": "Mochila"}, {"e": "👓", "l": "Gafas"}, {"e": "🕶️", "l": "Gafas de sol"}, {"e": "💍", "l": "Anillo"}, {"e": "👔", "l": "Camisa"}, {"e": "👖", "l": "Pantalón"}, {"e": "🩲", "l": "Bañador"}, {"e": "🩳", "l": "Shorts"}, {"e": "🧢", "l": "Gorra"}, {"e": "👑", "l": "Corona"}, {"e": "👛", "l": "Monedero"}, {"e": "🎩", "l": "Chistera"}, {"e": "🪖", "l": "Casco"}, {"e": "🔧", "l": "Llave inglesa"}, {"e": "🪛", "l": "Destornillador"}, {"e": "🪚", "l": "Sierra"}, {"e": "🔨", "l": "Martillo"}, {"e": "⚙️", "l": "Engranaje"}, {"e": "🪝", "l": "Gancho"}, {"e": "🧱", "l": "Ladrillo"}, {"e": "🪤", "l": "Trampa"}, {"e": "🪣", "l": "Cubo"}, {"e": "⛏️", "l": "Pico"}, {"e": "🔩", "l": "Tornillo"}, {"e": "🪜", "l": "Escalera"}, {"e": "🧰", "l": "Caja herram."}, {"e": "🗜️", "l": "Sargento"}, {"e": "⚒️", "l": "Herramientas"}, {"e": "⭐", "l": "Favorito"}, {"e": "❤️", "l": "Amor"}, {"e": "🌟", "l": "Especial"}, {"e": "🔖", "l": "Marcador"}, {"e": "✨", "l": "Brillante"}, {"e": "💫", "l": "Destello"}, {"e": "🎊", "l": "Fiesta"}, {"e": "🎉", "l": "Celebrar"}, {"e": "🏆", "l": "Trofeo"}, {"e": "🥇", "l": "Primero"}, {"e": "💎", "l": "Diamante"}, {"e": "🌈", "l": "Arcoíris"}, {"e": "🦋", "l": "Mariposa"}, {"e": "🌙", "l": "Luna"}, {"e": "🖋️", "l": "Estilográfica"}, {"e": "🔏", "l": "Sellado"}, {"e": "📝", "l": "Notas"}, {"e": "📍", "l": "Pin"}, {"e": "🖇️", "l": "Clips"}, {"e": "✂️", "l": "Tijeras"}, {"e": "🗄️", "l": "Archivador"}, {"e": "🗑️", "l": "Papelera"}, {"e": "📂", "l": "Carpeta abierta"}, {"e": "📔", "l": "Libreta"}, {"e": "📒", "l": "Diario"}, {"e": "📕", "l": "Libro rojo"}, {"e": "📗", "l": "Libro verde"}, {"e": "📘", "l": "Libro azul"}, {"e": "📙", "l": "Libro naranja"}, {"e": "🏷️", "l": "Etiqueta"}, {"e": "💰", "l": "Dinero"}, {"e": "💳", "l": "Tarjeta"}, {"e": "🧾", "l": "Ticket"}, {"e": "📅", "l": "Calendario"}, {"e": "📆", "l": "Fecha"}, {"e": "⌚", "l": "Smartwatch"}, {"e": "🔌", "l": "Cargadores"}, {"e": "🔋", "l": "Baterías"}, {"e": "⏰", "l": "Reloj alarma"}, {"e": "🕰️", "l": "Reloj pared"}], "Exterior": [{"e": "🌿", "l": "Plantas"}, {"e": "🌸", "l": "Flores"}, {"e": "🌳", "l": "Árbol"}, {"e": "🌱", "l": "Semilla"}, {"e": "☀️", "l": "Sol"}, {"e": "🌦️", "l": "Lluvia"}, {"e": "🌊", "l": "Agua"}, {"e": "🏊", "l": "Piscina"}, {"e": "⛲", "l": "Fuente"}, {"e": "🌵", "l": "Cactus"}, {"e": "🍀", "l": "Trébol"}, {"e": "🌾", "l": "Trigo"}, {"e": "🍁", "l": "Otoño"}, {"e": "🌲", "l": "Pino"}, {"e": "🌴", "l": "Palmera"}, {"e": "🐶", "l": "Perro"}, {"e": "🐱", "l": "Gato"}, {"e": "🐠", "l": "Pez"}, {"e": "🐇", "l": "Conejo"}, {"e": "🐾", "l": "Huellas"}, {"e": "🐦", "l": "Pájaro"}, {"e": "🦜", "l": "Loro"}, {"e": "🐢", "l": "Tortuga"}, {"e": "🦎", "l": "Lagarto"}, {"e": "🐹", "l": "Hámster"}, {"e": "🐈", "l": "Gatito"}, {"e": "🐕", "l": "Perrito"}, {"e": "🐟", "l": "Pececito"}, {"e": "🦊", "l": "Zorro"}, {"e": "🐰", "l": "Conejito"}, {"e": "🚗", "l": "Coche"}, {"e": "🚲", "l": "Bici"}, {"e": "🏍️", "l": "Moto"}, {"e": "🛴", "l": "Patinete"}, {"e": "🚘", "l": "Coche 2"}, {"e": "🛵", "l": "Vespa"}, {"e": "🚐", "l": "Furgoneta"}, {"e": "🚕", "l": "Taxi"}, {"e": "🏎️", "l": "Deportivo"}, {"e": "🚙", "l": "SUV"}, {"e": "🛒", "l": "Compras"}, {"e": "🎁", "l": "Regalos"}, {"e": "🎄", "l": "Navidad"}, {"e": "🏋️", "l": "Gimnasio"}, {"e": "🧘", "l": "Yoga"}, {"e": "🎯", "l": "Dardos"}, {"e": "🎲", "l": "Juegos"}, {"e": "♟️", "l": "Ajedrez"}, {"e": "🃏", "l": "Cartas"}, {"e": "🧩", "l": "Puzzle"}, {"e": "🎻", "l": "Violín"}, {"e": "🥁", "l": "Batería"}, {"e": "🎺", "l": "Trompeta"}, {"e": "🪗", "l": "Acordeón"}, {"e": "🎤", "l": "Karaoke"}, {"e": "🎨", "l": "Pintura"}, {"e": "✂️", "l": "Costura"}, {"e": "🧶", "l": "Lana"}, {"e": "🪡", "l": "Hilo"}, {"e": "🧵", "l": "Tejido"}, {"e": "🌷", "l": "Tulipanes"}, {"e": "🪻", "l": "Lavanda flor"}, {"e": "☂️", "l": "Sombrilla"}, {"e": "🪁", "l": "Patio juegos"}, {"e": "📺", "l": "Televisor"}, {"e": "🎮", "l": "Consola"}, {"e": "📚", "l": "Biblioteca"}, {"e": "🎹", "l": "Piano casa"}, {"e": "🎧", "l": "Auriculares"}, {"e": "🍋", "l": "Limonero"}, {"e": "🪴", "l": "Macetas patio"}, {"e": "🪑", "l": "Banco jardín"}, {"e": "🍽️", "l": "Mesa jardín"}, {"e": "🧱", "l": "Mesa empotrada"}], "Comida": [{"e": "🍎", "l": "Manzana"}, {"e": "🍊", "l": "Naranja"}, {"e": "🍋", "l": "Limón"}, {"e": "🍇", "l": "Uvas"}, {"e": "🍓", "l": "Fresa"}, {"e": "🫐", "l": "Arándanos"}, {"e": "🍑", "l": "Melocotón"}, {"e": "🍒", "l": "Cerezas"}, {"e": "🍌", "l": "Plátano"}, {"e": "🍉", "l": "Sandía"}, {"e": "🍍", "l": "Piña"}, {"e": "🥭", "l": "Mango"}, {"e": "🥝", "l": "Kiwi"}, {"e": "🍈", "l": "Melón"}, {"e": "🍐", "l": "Pera"}, {"e": "🥦", "l": "Brócoli"}, {"e": "🥕", "l": "Zanahoria"}, {"e": "🍅", "l": "Tomate"}, {"e": "🧅", "l": "Cebolla"}, {"e": "🧄", "l": "Ajo"}, {"e": "🥬", "l": "Lechuga"}, {"e": "🌽", "l": "Maíz"}, {"e": "🥒", "l": "Pepino"}, {"e": "🫑", "l": "Pimiento"}, {"e": "🍆", "l": "Berenjena"}, {"e": "🥑", "l": "Aguacate"}, {"e": "🫘", "l": "Legumbres"}, {"e": "🥔", "l": "Patata"}, {"e": "🍠", "l": "Boniato"}, {"e": "🌶️", "l": "Chile"}, {"e": "🍕", "l": "Pizza"}, {"e": "🍔", "l": "Hamburguesa"}, {"e": "🌮", "l": "Taco"}, {"e": "🌯", "l": "Wrap"}, {"e": "🥗", "l": "Ensalada"}, {"e": "🍣", "l": "Sushi"}, {"e": "🍜", "l": "Ramen"}, {"e": "🍝", "l": "Pasta"}, {"e": "🥩", "l": "Carne"}, {"e": "🍗", "l": "Pollo"}, {"e": "🥓", "l": "Bacon"}, {"e": "🌭", "l": "Perrito"}, {"e": "🥪", "l": "Sándwich"}, {"e": "🧀", "l": "Queso"}, {"e": "🥚", "l": "Huevos"}, {"e": "🥞", "l": "Tortitas"}, {"e": "🧇", "l": "Gofre"}, {"e": "🍳", "l": "Fritos"}, {"e": "🥘", "l": "Cazuela"}, {"e": "🍲", "l": "Estofado"}, {"e": "🫕", "l": "Fondue"}, {"e": "🥙", "l": "Kebab"}, {"e": "🍱", "l": "Bento"}, {"e": "🍛", "l": "Curry"}, {"e": "🐟", "l": "Pescado"}, {"e": "🦐", "l": "Gambas"}, {"e": "🦞", "l": "Langosta"}, {"e": "🦑", "l": "Calamar"}, {"e": "🍤", "l": "Langostino"}, {"e": "🥫", "l": "Conserva"}, {"e": "🍞", "l": "Pan"}, {"e": "🥐", "l": "Croissant"}, {"e": "🫓", "l": "Pan pita"}, {"e": "🥖", "l": "Baguette"}, {"e": "🧁", "l": "Cupcake"}, {"e": "🍰", "l": "Tarta"}, {"e": "🎂", "l": "Pastel"}, {"e": "🍫", "l": "Chocolate"}, {"e": "🍭", "l": "Chuche"}, {"e": "🍪", "l": "Galleta"}, {"e": "🍩", "l": "Donut"}, {"e": "🍦", "l": "Helado"}, {"e": "🍮", "l": "Flan"}, {"e": "🧆", "l": "Croqueta"}, {"e": "🥜", "l": "Cacahuetes"}, {"e": "☕", "l": "Café"}, {"e": "🍵", "l": "Té"}, {"e": "🫖", "l": "Tetera"}, {"e": "🧃", "l": "Zumo"}, {"e": "🥤", "l": "Refresco"}, {"e": "🍷", "l": "Vino"}, {"e": "🍺", "l": "Cerveza"}, {"e": "🥂", "l": "Champán"}, {"e": "🍹", "l": "Cóctel"}, {"e": "🧉", "l": "Mate"}, {"e": "🥛", "l": "Leche"}, {"e": "🧋", "l": "Bubble tea"}, {"e": "🫗", "l": "Bebida"}, {"e": "💧", "l": "Agua"}, {"e": "🍶", "l": "Sake"}, {"e": "🛒", "l": "Carrito"}, {"e": "🛍️", "l": "Bolsa"}, {"e": "🧾", "l": "Ticket"}, {"e": "💳", "l": "Tarjeta"}, {"e": "💰", "l": "Dinero"}, {"e": "🏪", "l": "Tienda"}, {"e": "🏬", "l": "Centro comercial"}, {"e": "🧂", "l": "Sal"}, {"e": "🫒", "l": "Aceite"}, {"e": "🧈", "l": "Mantequilla"}, {"e": "🥯", "l": "Bagel"}, {"e": "🍖", "l": "Asado"}, {"e": "🍚", "l": "Arroz"}, {"e": "🍙", "l": "Bola arroz"}, {"e": "🍟", "l": "Patatas fritas"}, {"e": "🥨", "l": "Pretzel"}, {"e": "🍿", "l": "Palomitas"}, {"e": "🥟", "l": "Empanadillas"}, {"e": "🥧", "l": "Empanada pastel"}, {"e": "🍯", "l": "Miel"}, {"e": "🌰", "l": "Castañas"}, {"e": "🍄", "l": "Setas"}, {"e": "🫛", "l": "Guisantes"}, {"e": "🫚", "l": "Jengibre"}]};
var HOUSE_SVG_ICONS=(()=>{const W='#f1f1f4',R='#f0554b',B='#ffffff',S='#cfd1d8',M='#e3e4e8',L='#dcdde2',G='#bfc1c7';return [
  {l:'Casa',k:['casa','mi casa','hogar','llar'],svg:`<path d="M8 30L32 10l24 20" fill="${R}"/><path d="M13 27v29h38V27" fill="${B}"/><rect x="27" y="40" width="10" height="16" rx="2" fill="${W}"/><rect x="17" y="33" width="7" height="7" rx="1" fill="${S}"/><rect x="40" y="33" width="7" height="7" rx="1" fill="${S}"/>`},
  {l:'Casa con jardín',k:['jardin','jardín','jardi'],svg:`<path d="M6 32L24 17l18 15" fill="${R}"/><path d="M10 29v25h28V29" fill="${B}"/><rect x="20" y="40" width="8" height="14" rx="2" fill="${W}"/><circle cx="50" cy="30" r="9" fill="${M}"/><path d="M50 39v15M4 56h56"/>`},
  {l:'Piso',k:['piso','pis','apartamento','edificio','bloque'],svg:`<rect x="14" y="6" width="36" height="50" rx="2" fill="${L}"/><path d="M20 13h6M38 13h6M20 22h6M38 22h6M20 31h6M38 31h6M20 40h6M38 40h6"/><rect x="28" y="45" width="8" height="11" rx="1.5" fill="${W}"/><path d="M8 56h48"/>`},
  {l:'Ático',k:['atico','ático','atic','duplex','dúplex'],svg:`<rect x="12" y="16" width="40" height="40" rx="2" fill="${S}"/><path d="M8 16h48l-6-8H14z" fill="${W}"/><path d="M18 24h8M38 24h8M18 34h8M38 34h8"/><path d="M14 44h36M18 44v-4M26 44v-4M34 44v-4M42 44v-4M50 44v-4"/><rect x="28" y="46" width="8" height="10" fill="${W}"/>`},
  {l:'Casa de campo',k:['campo','masia','masía','pueblo','poble','rural','granja'],svg:`<path d="M4 30l14-12h28l14 12" fill="${W}"/><rect x="8" y="30" width="48" height="26" fill="${B}"/><path d="M27 56V44a5 5 0 0 1 10 0v12" fill="${W}"/><rect x="14" y="37" width="7" height="7" fill="${S}"/><rect x="43" y="37" width="7" height="7" fill="${S}"/><path d="M44 18v-8h5v12"/>`},
  {l:'Cabaña',k:['cabaña','cabana','cabanya','refugio','montaña','muntanya'],svg:`<path d="M32 8L6 50h52z" fill="${W}"/><path d="M14 36h36M10 43h44M18 29h28"/><rect x="27" y="40" width="10" height="16" rx="1.5" fill="${B}"/><path d="M6 56h52"/>`},
  {l:'Casa de playa',k:['playa','platja','mar','costa','verano','estiu','vacaciones'],svg:`<circle cx="48" cy="14" r="6" fill="${B}"/><path d="M8 32L26 18l18 14" fill="${S}"/><path d="M12 30v18h28V30" fill="#fff"/><rect x="22" y="38" width="8" height="10" rx="1.5" fill="${W}"/><path d="M4 54c5-4 9 4 14 0s9 4 14 0 9 4 14 0 9 4 14 0" stroke-width="2.4"/>`},
  {l:'Adosado',k:['adosado','adossat','chalet','xalet'],svg:`<path d="M4 30l14-12 14 12 14-12 14 12" fill="${R}"/><path d="M8 27v29h48V27"/><path d="M8 27v29h24V27z" fill="${B}"/><path d="M32 27v29h24V27z" fill="${M}"/><rect x="15" y="42" width="8" height="14" fill="${W}"/><rect x="41" y="42" width="8" height="14" fill="${W}"/>`},
  {l:'Caravana',k:['caravana','autocaravana','furgo','camper'],svg:`<rect x="6" y="18" width="44" height="28" rx="8" fill="#fff"/><path d="M6 32h44" stroke="${R}" stroke-width="5"/><rect x="12" y="22" width="12" height="7" rx="2" fill="${S}"/><rect x="34" y="24" width="8" height="18" rx="1.5" fill="${W}"/><circle cx="20" cy="48" r="5" fill="${L}"/><path d="M50 40h8"/>`},
  {l:'Oficina',k:['oficina','despacho','trabajo','feina','local'],svg:`<rect x="10" y="10" width="44" height="46" rx="2" fill="${G}"/><path d="M10 22h44"/><path d="M17 30h8M39 30h8M17 39h8M39 39h8"/><rect x="28" y="44" width="8" height="12" fill="${W}"/><rect x="24" y="4" width="16" height="6" rx="2" fill="${B}"/>`},
  {l:'Trastero',k:['trastero','traster','garaje','garatge','almacen','almacén'],svg:`<path d="M6 28L32 10l26 18v28H6z" fill="${W}"/><rect x="16" y="32" width="32" height="24" fill="#fff"/><path d="M16 38h32M16 44h32M16 50h32"/>`},
].map(f=>({...f,src:furnSvg(f.svg)}));})();
var HOUSE_EMOJI_ICONS=[{e:'🏠',l:'Casa'},{e:'🏡',l:'Casa con jardín'},{e:'🏘️',l:'Casas'},{e:'🏢',l:'Edificio'},{e:'🏬',l:'Bloque'},{e:'🏚️',l:'Casa antigua'},{e:'🏰',l:'Castillo'},{e:'🛖',l:'Cabaña'},{e:'⛺',l:'Tienda'},{e:'🏕️',l:'Camping'},{e:'🏖️',l:'Playa'},{e:'🏔️',l:'Montaña'},{e:'🌳',l:'Campo'},{e:'🏙️',l:'Ciudad'},{e:'🏫',l:'Escuela'},{e:'🏪',l:'Tienda'},{e:'🚐',l:'Furgoneta'},{e:'⛵',l:'Barco'}];
var EMOJI_MAP=[
  // Compra / alimentación
  {k:['compra','lista','market','super','mercado','tienda','shop'],e:'🛒'},
  {k:['fruta','frutas','fruter'],e:'🍎'},
  {k:['verdura','verdu','vegetal'],e:'🥦'},
  {k:['carne','carnic'],e:'🥩'},
  {k:['pescado','pesc','marisco'],e:'🐟'},
  {k:['pan','panader','baked'],e:'🍞'},
  {k:['dulce','dulces','postre','pastel','tarta'],e:'🍰'},
  {k:['café','cafe','coffee'],e:'☕'},
  {k:['bebida','drink','refresco','zumo'],e:'🧃'},
  {k:['leche','lacteo','dairy'],e:'🥛'},
  {k:['aceite','aceit'],e:'🫒'},
  {k:['conserva','lata','bote'],e:'🥫'},
  {k:['mesa','comedor','cenar','cena','dining'],e:'🍽️'},
  {k:['mesa estudio','mesa despacho','escritorio','mesa integrada','mesa empotrada'],e:'💻'},
  {k:['silla','sillas','taburete'],e:'🪑'},
  {k:['vajilla','plato','platos','cubiertos'],e:'🍽️'},
  {k:['olla','cacerola','cazuela','guiso'],e:'🥘'},
  {k:['sopa','caldo'],e:'🍲'},
  {k:['arroz'],e:'🍚'},
  {k:['pasta','espagueti','macarrones'],e:'🍝'},
  {k:['pizza'],e:'🍕'},
  {k:['queso'],e:'🧀'},
  {k:['huevo','huevos'],e:'🥚'},
  {k:['pollo'],e:'🍗'},
  {k:['embutido','bacon','jamon','jamón'],e:'🥓'},
  {k:['galleta','galletas'],e:'🍪'},
  {k:['copa','copas','vino'],e:'🍷'},
  // Hogar y limpieza
  {k:['limpieza','limpiar','clean'],e:'🧹'},
  {k:['dormitorio','cama','dormir','cuarto','habitacion','habitación','bedroom'],e:'🛏️'},
  {k:['salon','salón','sofa','sofá','living','sala','estar'],e:'🛋️'},
  {k:['cocina','kitchen','cook','cocinar'],e:'🍳'},
  {k:['nevera','frigorifico','frigorífico','congelador'],e:'🧊'},
  {k:['horno','microondas','vitro','vitroceramica','vitrocerámica'],e:'🔥'},
  {k:['baño','bano','wc','aseo','bathroom'],e:'🚿'},
  {k:['ventana','ventanas','ventanal'],e:'🪟'},
  {k:['puerta','entrada','recibidor'],e:'🚪'},
  {k:['espejo'],e:'🪞'},
  {k:['lampara','lámpara','luz','luces','bombilla'],e:'💡'},
  {k:['cuadro','cuadros','decoracion','decoración'],e:'🖼️'},
  {k:['planta','plantas','maceta','macetas'],e:'🪴'},
  {k:['lavadero','lavanderia','lavandería','colada','lavadora'],e:'🧺'},
  {k:['secadora','lavavajillas'],e:'🧽'},
  {k:['despensa','tarros','botes'],e:'🫙'},
  {k:['escalera','escaleras'],e:'🪜'},
  {k:['garaje','coche','garage','car'],e:'🚗'},
  {k:['jardin','jardín','garden','terraza','exterior','patio'],e:'🌿'},
  {k:['limonero','limon','limón'],e:'🍋'},
  {k:['banco jardin','banco jardín'],e:'🪑'},
  {k:['plano','distribucion','distribución','planta casa'],e:'🧭'},
  {k:['trastero','almacen','almacén','storage'],e:'📦'},
  {k:['ropa','armario','vestidor','wardrobe','clothes'],e:'👕'},
  {k:['armario grande','armario pequeño','armario empotrado','armario debajo mesa','armario debajo de mesa'],e:'👕'},
  {k:['cajon','cajón','cajones','cajonera','cajonera 6','plastico','plástico'],e:'📦'},
  {k:['estanteria','estantería','baldas','libreria','librería','libros pared'],e:'📚'},
  {k:['baul','baúl','cajita','caja blanca'],e:'📦'},
  {k:['zapato','zapatero','shoes'],e:'👟'},
  {k:['juguete','jugar','toys','niños'],e:'🧸'},
  // Oficina y papelería
  {k:['oficina','trabajo','office','work'],e:'💼'},
  {k:['papeleria','papelería','stationery','papel'],e:'✏️'},
  {k:['libros','libro','book','leer','lectura'],e:'📚'},
  {k:['agenda','calendario','citas'],e:'🗓️'},
  {k:['fecha','hora','reloj'],e:'🕰️'},
  {k:['archivo','archiv','carpeta','folder'],e:'🗂️'},
  {k:['notas','nota','apuntes'],e:'📝'},
  {k:['ordenador','pc','computadora','laptop'],e:'💻'},
  {k:['móvil','movil','telefono','phone','gadget','gadgets','cargador','cargadores'],e:'📱'},
  // Salud y farmacia
  {k:['medic','farmacia','salud','health','pastilla'],e:'💊'},
  {k:['botiquin','primeros','auxilio'],e:'🩹'},
  // Mascotas
  {k:['perro','dog','mascota','pet'],e:'🐶'},
  {k:['gato','cat'],e:'🐱'},
  // Ocio y hobbies
  {k:['musica','música','guitar','piano'],e:'🎵'},
  {k:['deporte','gym','gimnasio','fitness'],e:'🏋️'},
  {k:['viaje','viajar','travel','vacacion'],e:'✈️'},
  {k:['fotos','foto','photo','album'],e:'📷'},
  {k:['regalo','regalos','gift'],e:'🎁'},
  {k:['navidad','christmas','xmas'],e:'🎄'},
  {k:['fiesta','party','celebrac'],e:'🎉'},
  // Default
  {k:['todo','tareas','tarea','task'],e:'✅'},
  {k:['favorito','favorita','star'],e:'⭐'},
  {k:['important','urgente','urgent'],e:'❗'},
];

/* ---- Fecha dicha por voz (igual que en HOME): «mañana dentista a las cinco», «el lunes que viene…» ---- */
var VOICE_MONTHS={enero:0,gener:0,febrero:1,febrer:1,marzo:2,marc:2,març:2,abril:3,mayo:4,maig:4,junio:5,juny:5,julio:6,juliol:6,agosto:7,agost:7,septiembre:8,setiembre:8,setembre:8,octubre:9,noviembre:10,novembre:10,diciembre:11,desembre:11};
var VOICE_NUMS={un:1,uno:1,primero:1,u:1,dos:2,tres:3,cuatro:4,quatre:4,cinco:5,cinc:5,seis:6,sis:6,siete:7,set:7,ocho:8,vuit:8,nueve:9,nou:9,diez:10,deu:10,once:11,onze:11,doce:12,dotze:12,trece:13,tretze:13,catorce:14,catorze:14,quince:15,quinze:15,dieciseis:16,setze:16,diecisiete:17,disset:17,dieciocho:18,divuit:18,diecinueve:19,dinou:19,veinte:20,vint:20,veintiuno:21,veintidos:22,veintitres:23,veinticuatro:24,veinticinco:25,veintiseis:26,veintisiete:27,veintiocho:28,veintinueve:29,treinta:30,trenta:30,treintayuno:31};
var VOICE_WEEK={domingo:0,diumenge:0,lunes:1,dilluns:1,martes:2,dimarts:2,miercoles:3,dimecres:3,jueves:4,dijous:4,viernes:5,divendres:5,sabado:6,dissabte:6};
function parseVoiceDateStart(text){
  const raw=String(text||'').trim();
  const norm=raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/treinta y uno/g,'treintayuno');
  const today=new Date();today.setHours(12,0,0,0);
  const words=norm.split(/\s+/);
  const cut=n=>raw.split(/\s+/).slice(n).join(' ').replace(/^[,.:;\-\s]+/,'');
  const num=w=>{if(!w)return NaN;const d=parseInt(w,10);if(!isNaN(d))return d;return VOICE_NUMS[w.replace(/[^a-z]/g,'')]??NaN;};
  // hoy / mañana / pasado mañana / avui / demà / demà passat
  if(/^(hoy|avui)\b/.test(norm))return {date:today,rest:cut(1)};
  if(/^pasado manana\b/.test(norm)){const d=new Date(today);d.setDate(d.getDate()+2);return {date:d,rest:cut(2)};}
  if(/^(manana|dema)\b/.test(norm)){const d=new Date(today);d.setDate(d.getDate()+1);return {date:d,rest:cut(1)};}
  // 2/4/2026 o 2-4-26
  let m=norm.match(/^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/);
  if(m){let y=m[3]?+m[3]:today.getFullYear();if(y<100)y+=2000;const d=new Date(y,+m[2]-1,+m[1],12);if(!isNaN(d))return {date:d,rest:raw.slice(m[0].length).replace(/^[,.:;\-\s]+/,'')};}
  // [el] [lunes] 2 [de] abril [de] [2026]
  let i=0;if(words[i]==='el'||words[i]==='dia'||words[i]==='el dia')i++;if(words[i]==='dia')i++;
  let wd=null;if(VOICE_WEEK[words[i]?.replace(/[^a-z]/g,'')]!==undefined){wd=VOICE_WEEK[words[i].replace(/[^a-z]/g,'')];i++;}
  let day=num(words[i]);
  if(!isNaN(day)&&day>=1&&day<=31){
    let j=i+1;if(words[j]==='de'||words[j]==="d'"||words[j]==='del')j++;
    let mk=words[j]?.replace(/[^a-z]/g,'');if(mk&&mk.startsWith("d")&&VOICE_MONTHS[mk.slice(1)]!==undefined&&VOICE_MONTHS[mk]===undefined)mk=mk.slice(1);
    if(VOICE_MONTHS[mk]!==undefined){
      const mo=VOICE_MONTHS[mk];let k=j+1;let y=null;
      if(words[k]==='de'||words[k]==='del')k++;
      const yy=parseInt(words[k],10);if(!isNaN(yy)&&yy>1900&&yy<2200){y=yy;k++;}else k=j+1;
      if(y===null){y=today.getFullYear();const t=new Date(y,mo,day,12);if(t<today)y++;}
      return {date:new Date(y,mo,day,12),rest:cut(k)};
    }
  }
  if(wd!==null){const d=new Date(today);const diff=(wd-d.getDay()+7)%7||7;d.setDate(d.getDate()+diff);return {date:d,rest:cut(i)};}
  return {date:null,rest:raw};
}
function parseVoiceDateSmart(text){
  const raw=String(text||'').trim();
  const clean=s=>s.replace(/^[,.:;\-\s]+|[,.:;\-\s]+$/g,'');
  // 1) al principio, quitando palabras de relleno («nota para mañana…», «per demà…»)
  const FILL=/^(?:(?:apunta(?:r)?|anota(?:r)?|nota|recuerda(?:me)?|recordar|recorda(?:'m)?|para|per|el|la|dia|día|de)[\s,.:]+)+/i;
  let r=parseVoiceDateStart2(raw);if(r.date)return {date:r.date,rest:clean(r.rest)};
  const noFill=raw.replace(FILL,'');
  if(noFill!==raw){r=parseVoiceDateStart2(noFill);if(r.date)return {date:r.date,rest:clean(r.rest)};}
  // 2) al final o en medio («comprar pan mañana», «dentista el 3 de abril»), pero no «por la mañana»
  const words=raw.split(/\s+/);
  for(let i=1;i<words.length;i++){
    const prev=(words[i-1]||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const w=(words[i]||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\/]/g,'');
    if((w==='manana'||w==='mati')&&/^(la|por|de|del|al|cada|esta|aquesta|el)$/.test(prev))continue; // «por la mañana» = horas
    const tail=words.slice(i).join(' ');
    r=parseVoiceDateStart2(tail);
    if(r.date){
      let before=words.slice(0,i);
      while(before.length&&/^(para|per|el|la|de|del|dia|día|a|en)$/i.test(before[before.length-1].normalize('NFD').replace(/[\u0300-\u036f]/g,'')))before.pop();
      return {date:r.date,rest:clean([before.join(' '),r.rest].filter(Boolean).join(' '))};
    }
  }
  return {date:null,rest:raw};
}
// demà / de mà / demá / dema (como lo escribe a veces el iPhone) y «demà passat»
function voicePreNormalize(t){
  return String(t||'')
    .replace(/(^|\s)de\s+m[aàá](?=$|[\s,.;:])/gi,'$1demà')
    .replace(/(^|\s)dem[aàá]\s+passat(?=$|[\s,.;:])/gi,'$1pasado mañana')
    .replace(/(^|\s)passat\s+dem[aàá](?=$|[\s,.;:])/gi,'$1pasado mañana');
}
function parseVoiceDate(text){return parseVoiceDateSmart(voicePreNormalize(text));}
function parseWeekdayStart(text){
  const raw=String(text||'').trim();
  const words=raw.split(/\s+/);
  const n=words.map(w=>w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9']/g,''));
  const today=new Date();today.setHours(12,0,0,0);
  const NUMW={un:1,una:1,uno:1,dos:2,tres:3,cuatro:4,quatre:4,cinco:5,cinc:5,seis:6,sis:6,siete:7,set:7,ocho:8,vuit:8,nueve:9,nou:9,diez:10,deu:10};
  const num=w=>{const d=parseInt(w,10);return !isNaN(d)?d:(NUMW[w]??NaN);};
  let i=0;
  // «dentro de 3 días», «en 2 semanas», «d'aquí a 3 dies», «d'aqui 2 setmanes»
  {let j=0;
    if(n[0]==='dentro'&&n[1]==='de')j=2;else if(n[0]==='en')j=1;else if(n[0]==="d'aqui"||n[0]==='daqui'){j=1;if(n[1]==='a')j=2;}
    if(j){const k=num(n[j]);const u=n[j+1]||'';
      if(!isNaN(k)&&/^(dia|dias|dies)$/.test(u)){const d=new Date(today);d.setDate(d.getDate()+k);return {date:d,rest:words.slice(j+2).join(' ')};}
      if(!isNaN(k)&&/^(semana|semanas|setmana|setmanes)$/.test(u)){const d=new Date(today);d.setDate(d.getDate()+7*k);return {date:d,rest:words.slice(j+2).join(' ')};}
    }
  }
  // «la semana que viene», «la setmana que ve» sola → lunes de la semana que viene
  let next=false;
  while(/^(el|este|esta|aquest|aquesta|l'|proximo|proxim|proxima|proper|propera|propero|que)$/.test(n[i]||''))i++;
  const WD={lunes:1,dilluns:1,martes:2,dimarts:2,miercoles:3,dimecres:3,jueves:4,dijous:4,viernes:5,divendres:5,sabado:6,dissabte:6,domingo:0,diumenge:0};
  const wdWord=n[i];
  if(WD[wdWord]===undefined)return {date:null,rest:raw};
  const wd=WD[wdWord];i++;
  // «… de la semana que viene», «… que viene», «… de la setmana que ve», «… vinent», «… próximo»
  const tail=n.slice(i,i+6).join(' ');
  const m=tail.match(/^(?:(?:de\s+)?(?:la\s+)?(?:semana|setmana)\s+(?:que\s+viene|que\s+ve|proxima|vinent|seguent|siguiente)|(?:de\s+)?(?:la\s+)?(?:proxima|propera)\s+(?:semana|setmana)|que\s+viene|que\s+ve|vinent|proximo|proxim)\b/);
  if(m){next=/semana|setmana/.test(m[0]);i+=m[0].trim().split(/\s+/).length;}
  let d=new Date(today);
  if(next){
    const mon=new Date(today);mon.setDate(mon.getDate()-((mon.getDay()+6)%7)+7); // lunes de la semana que viene
    d=new Date(mon);d.setDate(mon.getDate()+((wd+6)%7));
  }else{
    const diff=(wd-today.getDay()+7)%7||7;d.setDate(d.getDate()+diff);
  }
  return {date:d,rest:words.slice(i).join(' ')};
}
function parseVoiceDateStart2(text){
  const w=parseWeekdayStart(text);if(w.date)return w;
  const t=String(text||'').trim();
  // «la semana que viene …» / «la setmana que ve …» sin día → lunes de esa semana
  const nn=t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const m=nn.match(/^(?:la\s+)?(?:semana|setmana)\s+(?:que\s+viene|que\s+ve|proxima|vinent)\b/)||nn.match(/^(?:la\s+)?(?:proxima|propera)\s+(?:semana|setmana)\b/);
  if(m){const today=new Date();today.setHours(12,0,0,0);const mon=new Date(today);mon.setDate(mon.getDate()-((mon.getDay()+6)%7)+7);return {date:mon,rest:t.split(/\s+/).slice(m[0].split(/\s+/).length).join(' ')};}
  return parseVoiceDateStart(text);
}


// ══════════════════════════════════════════════
// V20 · TICKETS
// Fotos de tickets (y opcionalmente de lo que es) guardadas por día.
// Se guardan en un archivo aparte del móvil (IndexedDB «home_tickets»), comprimidas,
// para no llenar la memoria de la app.
