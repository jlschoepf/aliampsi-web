// Configuración general del sitio.
// Logo completo (fondos claros) y emblema (fondos oscuros y favicon), en /public.
export const LOGO_SRC = '/logo.png';
export const EMBLEM_SRC = '/emblem.png';

// URL pública del sitio (para SEO, sitemap, Open Graph). Configurable por entorno.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aliampsi-web.vercel.app').replace(/\/$/, '');
export const SITE_NAME = 'AL·IAM·PSI';
export const SITE_LONG_NAME =
  'Alianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines';
export const SITE_DESCRIPTION =
  'Punto de convergencia de las principales asociaciones de psiquiatría de Iberoamérica, dedicado a la salud mental infantojuvenil.';
export const OG_IMAGE = '/noticia-default.png';

// Convierte una ruta relativa en URL absoluta (para OG y datos estructurados).
export function absUrl(path?: string | null): string {
  if (!path) return `${SITE_URL}${OG_IMAGE}`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
