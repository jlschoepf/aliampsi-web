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
};

export type SiteSettings = typeof DEFAULT_SETTINGS;

export async function getSettings(): Promise<SiteSettings> {
  try {
    const s = await prisma.settings.findFirst();
    if (!s) return DEFAULT_SETTINGS;
    return {
      id: s.id,
      contactEmail: s.contactEmail || DEFAULT_SETTINGS.contactEmail,
      whatsapp: s.whatsapp,
      instagram: s.instagram,
      facebook: s.facebook,
      youtube: s.youtube,
      linkedin: s.linkedin,
      contactTitle: s.contactTitle || DEFAULT_SETTINGS.contactTitle,
      contactText: s.contactText || DEFAULT_SETTINGS.contactText,
      footerText: s.footerText || DEFAULT_SETTINGS.footerText,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function waLink(whatsapp: string): string {
  const digits = (whatsapp || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}
