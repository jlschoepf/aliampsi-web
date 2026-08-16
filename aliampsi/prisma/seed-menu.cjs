// Carga el menú inicial (solo si está vacío), replicando el menú actual.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ITEMS = [
  { label: 'Quiénes somos', href: '/quienes-somos', cta: false },
  { label: 'Autoridades', href: '/comision-directiva', cta: false },
  { label: 'Asociaciones', href: '/asociaciones', cta: false },
  { label: 'Noticias', href: '/noticias', cta: false },
  { label: 'Congresos', href: '/congresos', cta: false },
  { label: 'Publicaciones', href: '/publicaciones', cta: false },
  { label: 'Contacto', href: '/contacto', cta: false },
  { label: 'Asociarse', href: '/contacto', cta: true },
];
(async () => {
  try {
    const c = await prisma.menuItem.count();
    if (c > 0) { console.log(`[seed-menu] Ya hay ${c} items; no se carga nada.`); return; }
    for (let i = 0; i < ITEMS.length; i++) {
      await prisma.menuItem.create({ data: { ...ITEMS[i], order: i + 1, published: true, newTab: false } });
    }
    console.log(`[seed-menu] Cargados ${ITEMS.length} items de menú.`);
  } catch (e) {
    console.error('[seed-menu] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
