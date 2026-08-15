// Carga un banner de portada por defecto (solo si la tabla está vacía),
// replicando el hero actual para que la portada sea editable desde el arranque.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const c = await prisma.banner.count();
    if (c > 0) {
      console.log(`[seed-banners] Ya hay ${c} banners; no se carga nada.`);
      return;
    }
    await prisma.banner.create({
      data: {
        eyebrow: 'Alianza Iberoamericana',
        title: 'Una alianza para la salud mental de niños y adolescentes.',
        text: 'Somos el punto de convergencia de las principales asociaciones de psiquiatría infantojuvenil de Iberoamérica, dedicadas a potenciar el conocimiento y mejorar la atención de nuestros pacientes.',
        image: null,
        ctaLabel: 'Conocé la Alianza',
        ctaUrl: '/quienes-somos',
        cta2Label: 'Asociar mi institución',
        cta2Url: '/contacto',
        order: 1,
        published: true,
      },
    });
    console.log('[seed-banners] Banner por defecto cargado.');
  } catch (e) {
    console.error('[seed-banners] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
