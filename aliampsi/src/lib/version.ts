// Fuente única de la versión de la app.
// Subir este valor en cada cambio de código dispara el aviso de "versión nueva".
export const APP_VERSION = 'v2026.10.03-96';

export type EntradaHistorial = { version: string; fecha: string; cambios: string[] };

// Lo que cambió, escrito para quien administra el sitio. La más nueva, arriba.
// El detalle técnico de cada versión está en CHANGELOG.md.
export const HISTORIAL: EntradaHistorial[] = [
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
