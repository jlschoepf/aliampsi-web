import { prisma } from '@/lib/db';

export const DEFAULT_SETTINGS = {
  id: 'singleton',
  contactEmail: 'info@aliampsi.com',
  whatsapp: '+54 9 11 5043-7954',
  instagram: 'https://www.instagram.com/aliampsi',
  facebook: 'https://facebook.com/aliampsi',
  youtube: 'https://www.youtube.com/channel/UCjGLu6VjxUikSSVq2lUmreQ',
  linkedin: 'https://linkedin.com/company/aliampsi',
  contactTitle: 'Sumate a la Alianza',
  contactText:
    'Si representás una asociación de psiquiatría infantojuvenil y querés formar parte de AL·IAM·PSI, escribinos. También podés contactarnos por cualquier consulta.',
  footerText:
    'Alianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines. Potenciando el conocimiento para el cuidado de la salud mental de niños y adolescentes.',
  qsTitle: 'Una alianza de asociaciones al servicio de la infancia y la adolescencia',
  qsIntro:
    'AL·IAM·PSI es una iniciativa surgida al inicio de la pandemia de COVID-19 para potenciar la interacción y el conocimiento de las asociaciones de psiquiatría de Iberoamérica, con el fin de mejorar la atención de nuestros pacientes y de la salud mental de la población infantojuvenil en su conjunto.',
  qsMision:
    'Potenciar el conocimiento para el cuidado de la salud mental de niños y adolescentes, generando un espacio de encuentro entre profesionales, instituciones y sociedades científicas de toda Iberoamérica.',
  qsCompromiso:
    'La difusión de la psiquiatría infantojuvenil, especialmente en el ámbito hispanoparlante y en las demás lenguas de las diversas etnias de la región iberoamericana, es un compromiso permanente de la Alianza.',
  qsPilar1Title: 'Cooperación regional',
  qsPilar1Text:
    'Conectamos a las asociaciones de psiquiatría infantojuvenil de Iberoamérica para compartir conocimiento y experiencia.',
  qsPilar2Title: 'Formación e intercambio',
  qsPilar2Text:
    'Impulsamos congresos, webinars, becas y pasantías que fortalecen la formación de profesionales de la región.',
  qsPilar3Title: 'Difusión científica',
  qsPilar3Text:
    'Promovemos publicaciones y contenidos que elevan los estándares de atención en salud mental infantojuvenil.',
};

export type SiteSettings = typeof DEFAULT_SETTINGS;

export async function getSettings(): Promise<SiteSettings> {
  try {
    const s = await prisma.settings.findFirst();
    if (!s) return DEFAULT_SETTINGS;
    const pick = (v: string | null | undefined, def: string) => (v && v.trim() ? v : def);
    return {
      id: s.id,
      contactEmail: pick(s.contactEmail, DEFAULT_SETTINGS.contactEmail),
      whatsapp: s.whatsapp,
      instagram: s.instagram,
      facebook: s.facebook,
      youtube: s.youtube,
      linkedin: s.linkedin,
      contactTitle: pick(s.contactTitle, DEFAULT_SETTINGS.contactTitle),
      contactText: pick(s.contactText, DEFAULT_SETTINGS.contactText),
      footerText: pick(s.footerText, DEFAULT_SETTINGS.footerText),
      qsTitle: pick(s.qsTitle, DEFAULT_SETTINGS.qsTitle),
      qsIntro: pick(s.qsIntro, DEFAULT_SETTINGS.qsIntro),
      qsMision: pick(s.qsMision, DEFAULT_SETTINGS.qsMision),
      qsCompromiso: pick(s.qsCompromiso, DEFAULT_SETTINGS.qsCompromiso),
      qsPilar1Title: pick(s.qsPilar1Title, DEFAULT_SETTINGS.qsPilar1Title),
      qsPilar1Text: pick(s.qsPilar1Text, DEFAULT_SETTINGS.qsPilar1Text),
      qsPilar2Title: pick(s.qsPilar2Title, DEFAULT_SETTINGS.qsPilar2Title),
      qsPilar2Text: pick(s.qsPilar2Text, DEFAULT_SETTINGS.qsPilar2Text),
      qsPilar3Title: pick(s.qsPilar3Title, DEFAULT_SETTINGS.qsPilar3Title),
      qsPilar3Text: pick(s.qsPilar3Text, DEFAULT_SETTINGS.qsPilar3Text),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function waLink(whatsapp: string): string {
  const digits = (whatsapp || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}
