// Carga la galería de portadas genéricas (solo si está vacía).
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const c = await prisma.portada.count();
    if (c > 0) { console.log(`[seed-portadas] Ya hay ${c}; no se carga nada.`); return; }
    for (let i = 1; i <= 10; i++) {
      const url = `/covers/cover-${String(i).padStart(2, '0')}.png`;
      await prisma.portada.create({ data: { url, order: i } });
    }
    console.log('[seed-portadas] Cargadas 10 portadas genéricas.');
  } catch (e) {
    console.error('[seed-portadas] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
