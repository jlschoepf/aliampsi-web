// Reorganiza el menú plano original en la estructura con desplegable.
//
// Corre una sola vez: si ya existe algún ítem con parentId, no toca nada, así
// que cualquier cambio hecho después desde el panel se respeta.
//
// Estructura resultante:
//   La Alianza ▾ (Quiénes somos · Autoridades · Asociaciones integrantes · Contacto)
//   Noticias · Publicaciones · Congresos · Enviar contenido · [Asociarse]

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Se agrupan por destino, no por etiqueta, porque el nombre puede haberse editado.
const DENTRO_DE_LA_ALIANZA = ['/quienes-somos', '/comision-directiva', '/asociaciones', '/contacto'];

const ORDEN_BARRA = ['/noticias', '/publicaciones', '/congresos', '/enviar'];

(async () => {
  try {
    const yaAgrupado = await prisma.menuItem.count({ where: { parentId: { not: null } } });
    if (yaAgrupado > 0) {
      console.log(`[seed-menu-grupos] Ya hay ${yaAgrupado} opciones dentro de un desplegable; no se toca nada.`);
      return;
    }

    const items = await prisma.menuItem.findMany();
    if (items.length === 0) {
      console.log('[seed-menu-grupos] El menú está vacío; nada que reorganizar.');
      return;
    }

    const hijos = items.filter((i) => !i.cta && DENTRO_DE_LA_ALIANZA.includes(i.href));
    if (hijos.length < 2) {
      console.log('[seed-menu-grupos] El menú ya no tiene la forma original; no se reorganiza.');
      return;
    }

    // El contenedor no debe llevar a ningún lado por sí mismo: apunta a la primera opción.
    const padre = await prisma.menuItem.create({
      data: { label: 'La Alianza', href: '/quienes-somos', order: 1, published: true, cta: false },
    });

    let orden = 1;
    for (const destino of DENTRO_DE_LA_ALIANZA) {
      const hijo = hijos.find((h) => h.href === destino);
      if (!hijo) continue;
      const label = hijo.href === '/asociaciones' ? 'Asociaciones integrantes' : hijo.label;
      await prisma.menuItem.update({
        where: { id: hijo.id },
        data: { parentId: padre.id, order: orden++, label },
      });
    }

    // El resto queda en la barra, en un orden previsible.
    let barra = 2;
    for (const destino of ORDEN_BARRA) {
      const it = items.find((i) => !i.cta && i.href === destino);
      if (it) await prisma.menuItem.update({ where: { id: it.id }, data: { order: barra++ } });
    }
    for (const it of items.filter((i) => i.cta)) {
      await prisma.menuItem.update({ where: { id: it.id }, data: { order: 99 } });
    }

    console.log(`[seed-menu-grupos] "La Alianza" creado con ${hijos.length} opciones dentro.`);
  } catch (e) {
    console.error('[seed-menu-grupos] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
