// País escrito en el panel («Uruguay», «España», «Perú»…) → código ISO de su bandera en /public/banderas
// (SVG de flag-icons, licencia MIT). Se compara sin tildes ni mayúsculas.
const CODIGOS: Record<string, string> = {
  argentina: 'ar', bolivia: 'bo', brasil: 'br', brazil: 'br', chile: 'cl', colombia: 'co', 'costa rica': 'cr', cuba: 'cu',
  'republica dominicana': 'do', ecuador: 'ec', 'el salvador': 'sv', guatemala: 'gt', honduras: 'hn', mexico: 'mx',
  nicaragua: 'ni', panama: 'pa', paraguay: 'py', peru: 'pe', 'puerto rico': 'pr', espana: 'es', portugal: 'pt',
  uruguay: 'uy', venezuela: 've', 'estados unidos': 'us', eeuu: 'us', 'ee. uu.': 'us', canada: 'ca', francia: 'fr',
  italia: 'it', alemania: 'de', 'reino unido': 'gb', andorra: 'ad', 'guinea ecuatorial': 'gq',
};

const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Código de bandera para un país, o null si no se reconoce. */
export function codigoBandera(pais: string): string | null {
  return CODIGOS[normal(pais)] ?? null;
}
