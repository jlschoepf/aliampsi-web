// Carga inicial de los indicadores de la portada (solo si la tabla está vacía).
// Toma los conteos actuales como punto de partida; se editan desde el panel.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const c = await prisma.indicador.count();
    if (c > 0) {
      console.log(`[seed-indicadores] Ya hay ${c} indicadores; no se carga nada.`);
      return;
    }
    let asoc = 0, cong = 0;
    try { asoc = await prisma.asociacion.count({ where: { published: true } }); } catch (e) {}
    try { cong = await prisma.congreso.count({ where: { published: true } }); } catch (e) {}
    const rows = [
      { value: String(asoc || 6), label: 'Asociaciones integrantes', order: 1 },
      { value: String(cong || 2), label: 'Congresos realizados', order: 2 },
      { value: 'Iberoamérica', label: 'Alcance regional', order: 3 },
    ];
    for (const r of rows) await prisma.indicador.create({ data: { ...r, published: true } });
    console.log(`[seed-indicadores] Cargados ${rows.length} indicadores iniciales.`);
  } catch (e) {
    console.error('[seed-indicadores] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
