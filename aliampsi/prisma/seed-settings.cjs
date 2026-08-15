// Crea la configuración inicial del sitio (solo si no existe).
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const c = await prisma.settings.count();
    if (c > 0) {
      console.log('[seed-settings] La configuración ya existe; no se toca.');
      return;
    }
    await prisma.settings.create({
      data: {
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
      },
    });
    console.log('[seed-settings] Configuración inicial creada.');
  } catch (e) {
    console.error('[seed-settings] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
