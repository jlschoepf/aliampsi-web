// Fuente única de la versión de la app.
// Subir este valor en cada cambio de código dispara el aviso de "versión nueva".
export const APP_VERSION = 'v2026.10.04-108';

export type EntradaHistorial = { version: string; fecha: string; cambios: string[] };

// Lo que cambió, escrito para quien administra el sitio. La más nueva, arriba.
// El detalle técnico de cada versión está en CHANGELOG.md.
export const HISTORIAL: EntradaHistorial[] = [
  {
    version: 'v2026.10.04-108',
    fecha: '4/10/2026',
    cambios: ['Imágenes para la noticia del webinar: portada nueva, fondo del banner de la portada del sitio y modelo del certificado de asistencia.'],
  },
  {
    version: 'v2026.10.04-107',
    fecha: '4/10/2026',
    cambios: [
      'Los videos se ven como reproductor también dentro del editor: alcanza con pegar el enlace de YouTube o Vimeo (o su código para insertar) y aparece el video.',
      'El botón 🎬 inserta el reproductor, y las noticias que tenían el video como enlace lo muestran así al abrirlas.',
    ],
  },
  {
    version: 'v2026.10.04-106',
    fecha: '4/10/2026',
    cambios: [
      'Los congresos también se ordenan a mano con flechas, como las noticias y las publicaciones; el sitio y la portada los muestran en ese orden.',
      'La galería de portadas también se puede ordenar.',
    ],
  },
  {
    version: 'v2026.10.04-105',
    fecha: '4/10/2026',
    cambios: ['Nueva portada de la noticia del webinar: una notebook con la videollamada de los expositores.'],
  },
  {
    version: 'v2026.10.03-104',
    fecha: '3/10/2026',
    cambios: ['La portada de una noticia también se puede cargar pegando la dirección de una imagen ya publicada, además de subir un archivo.'],
  },
  {
    version: 'v2026.10.03-103',
    fecha: '3/10/2026',
    cambios: ['Imágenes de la noticia del webinar «Salud Mental y violencia escolar» (portada y pieza para redes).'],
  },
  {
    version: 'v2026.10.03-102',
    fecha: '3/10/2026',
    cambios: [
      'Certificados con lista de inscriptos: se carga la lista (nombre y correo) en la encuesta, y quien coincide por correo o por nombre recibe el certificado en el momento. Los que no coinciden quedan pendientes para validar a mano.',
      'El correo para avisar a los inscriptos se arma solo, con el enlace a la noticia donde está la encuesta.',
    ],
  },
  {
    version: 'v2026.10.03-101',
    fecha: '3/10/2026',
    cambios: [
      'Las encuestas pueden pedir un código de acceso común, que se manda por correo a los asistentes. Sin el código no se ven las preguntas ni se aceptan respuestas.',
      'En el editor: botón para generar el código y el texto del correo para los asistentes, listo para copiar.',
    ],
  },
  {
    version: 'v2026.10.03-100',
    fecha: '3/10/2026',
    cambios: [
      'Las encuestas se pueden insertar en una noticia con el código [encuesta:direccion]: se responden ahí mismo, con sus pasos y el certificado.',
      'En el editor de cada encuesta, el código listo para copiar y el botón «Crear noticia con esta encuesta», que arma la noticia en borrador.',
    ],
  },
  {
    version: 'v2026.10.03-99',
    fecha: '3/10/2026',
    cambios: [
      'Certificados por correo: opción para enviarlos automáticamente apenas se completa la encuesta, con el PDF adjunto.',
      'En «Certificados», botón «Enviar por correo» (uno por uno o todos los validados) y registro de errores de envío.',
      'Botón para enviarse un certificado de prueba y comprobar que el correo llega.',
    ],
  },
  {
    version: 'v2026.10.03-98',
    fecha: '3/10/2026',
    cambios: ['Botón «Publicar» en el listado y en el editor de cada encuesta (y «Cerrar» cuando ya está publicada). Al publicar, la dirección pierde el sufijo «-2» si quedó con uno.'],
  },
  {
    version: 'v2026.10.03-97',
    fecha: '3/10/2026',
    cambios: [
      'Las encuestas ahora se responden de a una sección por pantalla, con una barra de progreso que se va llenando, una tilde en cada pregunta respondida y la duración estimada arriba.',
      'Si alguien cierra la página sin enviar, al volver sus respuestas siguen ahí.',
      'La opción «Otro» puede tener su propio texto, y el editor permite cargar las preguntas desde una plantilla.',
      'Encuesta del webinar: sale la SPU, se agrega «Otra sociedad científica» (con campo para indicar cuál) y «Maestro/a o docente».',
    ],
  },
  {
    version: 'v2026.10.03-96',
    fecha: '3/10/2026',
    cambios: ['La página de cada encuesta ya no muestra el rótulo «Encuesta anónima» arriba del título.'],
  },
  {
    version: 'v2026.10.03-95',
    fecha: '3/10/2026',
    cambios: ['Corregido el recorte del medallón del Dr. Federico Melián en la portada de la encuesta del webinar.'],
  },
  {
    version: 'v2026.10.03-94',
    fecha: '3/10/2026',
    cambios: [
      'Las encuestas pueden tener imagen de portada; la del webinar ya trae la suya.',
      'Certificados de asistencia: quien completa la encuesta puede pedir el suyo. Los pedidos se validan en el panel —uno por uno o contra la lista de asistentes— y el PDF sale con la firma del presidente.',
      'Los datos del certificado se guardan aparte de las respuestas: la encuesta sigue siendo anónima.',
    ],
  },
  {
    version: 'v2026.10.03-93',
    fecha: '3/10/2026',
    cambios: [
      'La encuesta del webinar ahora sigue la estructura de la encuesta de satisfacción de SUPIA: 4 secciones y 18 preguntas.',
      'Las escalas de las encuestas admiten cualquier rango, por ejemplo del 1 al 10.',
    ],
  },
  {
    version: 'v2026.10.03-92',
    fecha: '3/10/2026',
    cambios: [
      'Nuevo módulo de Encuestas: se crean desde plantillas o en blanco, se responden en el sitio y los resultados se ven con gráficos.',
      'Los resultados se pueden descargar en CSV y analizar con Claude, que redacta un informe para la Comisión Directiva.',
      'Ya está cargada la plantilla de la encuesta de satisfacción del webinar «Salud Mental y violencia escolar».',
    ],
  },
  {
    version: 'v2026.09.27-91',
    fecha: '27/9/2026',
    cambios: [
      'Vuelve el orden manual: en el panel, las flechas suben o bajan cada noticia y cada publicación, y el sitio las muestra en ese orden.',
      'El botón «Volver al orden por fecha» deshace el orden propio.',
    ],
  },
  {
    version: 'v2026.09.26-90',
    fecha: '26/9/2026',
    cambios: [
      'Las páginas de Noticias, Publicaciones y Congresos vuelven a cargar siempre. Después de la mejora de velocidad del 24/9 podían fallar de a ratos.',
    ],
  },
  {
    version: 'v2026.09.24-89',
    fecha: '24/9/2026',
    cambios: [
      'El sitio carga más rápido y consume menos recursos. Lo que se publica desde el panel aparece enseguida, como antes.',
    ],
  },
  {
    version: 'v2026.09.24-88',
    fecha: '24/9/2026',
    cambios: [
      'El tablero muestra qué contenido está publicado, en borrador o programado, y los envíos que faltan revisar.',
      'Empezaron a medirse las visitas al sitio; se consultan desde el tablero.',
    ],
  },
  {
    version: 'v2026.08.31-84',
    fecha: '31/8/2026',
    cambios: ['Al crear una noticia se puede elegir el enlace con el que se va a compartir.'],
  },
];
