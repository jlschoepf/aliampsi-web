// Fuente única de la versión de la app.
// Subir este valor en cada cambio de código dispara el aviso de "versión nueva".
export const APP_VERSION = 'v2026.09.26-90';

export type EntradaHistorial = { version: string; fecha: string; cambios: string[] };

// Lo que cambió, escrito para quien administra el sitio. La más nueva, arriba.
// El detalle técnico de cada versión está en CHANGELOG.md.
export const HISTORIAL: EntradaHistorial[] = [
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
