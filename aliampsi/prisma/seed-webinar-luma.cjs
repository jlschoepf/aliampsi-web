// Deja el enlace del evento de Luma en su propio párrafo dentro de la noticia
// del webinar, que es la condición para que el sitio lo muestre como formulario
// de inscripción incrustado en lugar de un enlace suelto.
//
// Es idempotente: si el párrafo ya está, no hace nada.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NOTICIA_ID = 'cmtprjolp0001c5mldisaktmv';
const EVENTO = 'https://luma.com/9bqhbhd9';
const PARRAFO = `<p><a href="${EVENTO}">${EVENTO}</a></p>`;

(async () => {
  try {
    const n = await prisma.noticia.findUnique({ where: { id: NOTICIA_ID } });
    if (!n) {
      console.log('[webinar-luma] No existe esa noticia; nada que hacer.');
      return;
    }

    const contenido = String(n.content || '');

    // ¿Ya hay un párrafo cuyo único contenido es el enlace?
    const yaEsta = /<p>\s*<a[^>]*href="https:\/\/(?:lu\.ma|luma\.com)\/[^"]*"[^>]*>\s*https?:\/\/[^<]*<\/a>\s*<\/p>/i.test(contenido);
    if (yaEsta) {
      console.log('[webinar-luma] El enlace ya está en su propio párrafo; no se toca.');
      return;
    }

    const actualizado = contenido.trimEnd() + '\n' + PARRAFO;
    await prisma.noticia.update({
      where: { id: NOTICIA_ID },
      data: { content: actualizado },
    });
    console.log('[webinar-luma] Enlace del evento agregado en su propio párrafo.');
  } catch (e) {
    console.error('[webinar-luma] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
