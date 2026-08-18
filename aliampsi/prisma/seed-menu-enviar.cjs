// Agrega al menú el acceso para colaboradores (solo si no existe).
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const ya = await prisma.menuItem.findFirst({ where: { href: '/enviar' } });
    if (ya) { console.log('[seed-menu-enviar] Ya existe; no se agrega.'); return; }
    const max = await prisma.menuItem.findFirst({ orderBy: { order: 'desc' } });
    await prisma.menuItem.create({
      data: {
        label: 'Enviar contenido',
        href: '/enviar',
        order: (max?.order ?? 0) + 1,
        published: true,
        newTab: false,
        cta: false,
      },
    });
    console.log('[seed-menu-enviar] Agregado al menú.');
  } catch (e) {
    console.error('[seed-menu-enviar] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
