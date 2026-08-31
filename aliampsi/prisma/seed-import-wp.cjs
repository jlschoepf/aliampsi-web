// Importa el contenido del WordPress anterior (viejo.aliampsi.com) al sitio nuevo.
//
// Es idempotente: cada entrada se identifica por su slug, así que volver a
// correrlo no duplica nada. Si el origen no responde, no bloquea el build.
//
// Las noticias entran como BORRADOR (published: false) para que se revisen
// desde el panel antes de publicarlas.
//
// Reparto acordado:
//   - Noticias institucionales  -> Noticia
//   - Artículos científicos     -> Publicacion (kind: articulo)
//   - Avisos de congresos       -> Congreso
//
// Se puede desactivar con IMPORTAR_WP=off en las variables de entorno.

const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');

const prisma = new PrismaClient();
const ORIGEN = 'https://viejo.aliampsi.com';

// Reparto por ID de entrada del WordPress viejo.
const A_PUBLICACIONES = new Set([2053, 2139]);
const A_CONGRESOS = new Set([2121, 1470, 1912]);

const log = (m) => console.log('[import-wp] ' + m);

// --- utilidades -----------------------------------------------------------

function limpiarTexto(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&hellip;/g, '…')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodificar(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&hellip;/g, '…');
}

async function traer(url, intentos = 3) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return r;
      if (i === intentos) throw new Error('HTTP ' + r.status);
    } catch (e) {
      if (i === intentos) throw e;
      await new Promise((s) => setTimeout(s, 1200 * i));
    }
  }
}

// Sube una imagen del sitio viejo a Vercel Blob y devuelve su URL nueva.
// Cachea por ruta para no subir dos veces el mismo archivo.
const subidas = new Map();

async function migrarImagen(rutaOriginal) {
  if (!rutaOriginal) return null;
  const ruta = String(rutaOriginal)
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/+/, '/');
  if (!ruta.includes('/wp-content/uploads/')) return null;
  if (subidas.has(ruta)) return subidas.get(ruta);

  try {
    const r = await traer(ORIGEN + encodeURI(ruta));
    const buf = Buffer.from(await r.arrayBuffer());
    if (!buf.length) throw new Error('archivo vacío');

    const nombre = 'wp/' + ruta.split('/wp-content/uploads/')[1];
    const blob = await put(nombre, buf, {
      access: 'public',
      addRandomSuffix: false,
      contentType: r.headers.get('content-type') || undefined,
    });
    subidas.set(ruta, blob.url);
    log('imagen ok: ' + nombre);
    return blob.url;
  } catch (e) {
    log('imagen FALLÓ (' + ruta + '): ' + ((e && e.message) || e));
    subidas.set(ruta, null);
    return null;
  }
}

// Reescribe el HTML del cuerpo: sube cada imagen y apunta a la URL nueva.
async function migrarCuerpo(html) {
  let salida = String(html || '');
  const rutas = [...salida.matchAll(/src="([^"]*\/wp-content\/uploads\/[^"]*)"/g)]
    .map((m) => m[1]);

  for (const original of [...new Set(rutas)]) {
    // La versión sin sufijo -1024x683 es el archivo original, de mejor calidad.
    const sinTamano = original.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');
    const nueva = (await migrarImagen(sinTamano)) || (await migrarImagen(original));
    if (nueva) salida = salida.split(original).join(nueva);
  }

  // Quitar los comentarios de bloque de Gutenberg y los atributos de WordPress.
  return salida
    .replace(/<!--\s*\/?wp:[^>]*-->/g, '')
    .replace(/\sclass="[^"]*wp-[^"]*"/g, '')
    .replace(/\s(?:width|height|srcset|sizes|loading|decoding)="[^"]*"/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// --- importación ----------------------------------------------------------

(async () => {
  try {
    if (String(process.env.IMPORTAR_WP || '').toLowerCase() === 'off') {
      log('desactivado por IMPORTAR_WP=off.');
      return;
    }

    let entradas;
    try {
      const r = await traer(
        ORIGEN + '/wp-json/wp/v2/posts?per_page=50&status=publish&_embed=wp:featuredmedia'
      );
      entradas = await r.json();
    } catch (e) {
      log('no se pudo leer el origen; se omite: ' + ((e && e.message) || e));
      return;
    }
    if (!Array.isArray(entradas) || !entradas.length) {
      log('el origen no devolvió entradas; nada que hacer.');
      return;
    }
    log('encontradas ' + entradas.length + ' entradas en el origen.');

    let nuevas = 0;
    let salteadas = 0;

    for (const e of entradas) {
      const titulo = decodificar((e.title && e.title.rendered) || '').trim();
      const slug = decodeURIComponent(e.slug || '')
        .replace(/[^a-z0-9\u00e0-\u00ff]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
        .slice(0, 90);
      if (!titulo || !slug) continue;

      const fecha = e.date ? new Date(e.date) : null;
      const resumen = limpiarTexto((e.excerpt && e.excerpt.rendered) || '').slice(0, 300);

      // Imagen de portada: se toma la original, no la miniatura.
      let portada = null;
      const media =
        e._embedded &&
        e._embedded['wp:featuredmedia'] &&
        e._embedded['wp:featuredmedia'][0];
      if (media && media.source_url) portada = await migrarImagen(media.source_url);

      const cuerpo = await migrarCuerpo((e.content && e.content.rendered) || '');
      const marca = '\n\n<p><em>Publicado originalmente en el sitio anterior de AL·IAM·PSI.</em></p>';

      if (A_PUBLICACIONES.has(e.id)) {
        const ya = await prisma.publicacion.findFirst({ where: { title: titulo } });
        if (ya) { salteadas++; continue; }
        await prisma.publicacion.create({
          data: {
            title: titulo,
            description: resumen,
            body: cuerpo + marca,
            kind: 'articulo',
            coverImage: portada,
            publishedAt: fecha,
            published: false,
            tags: 'archivo',
          },
        });
        log('publicación: ' + titulo.slice(0, 60));
        nuevas++;
        continue;
      }

      if (A_CONGRESOS.has(e.id)) {
        const ya = await prisma.congreso.findFirst({ where: { title: titulo } });
        if (ya) { salteadas++; continue; }
        await prisma.congreso.create({
          data: {
            title: titulo,
            description: resumen,
            body: cuerpo + marca,
            coverImage: portada,
            startDate: fecha,
            publishedAt: fecha,
            published: false,
            tags: 'archivo',
          },
        });
        log('congreso: ' + titulo.slice(0, 60));
        nuevas++;
        continue;
      }

      const ya = await prisma.noticia.findUnique({ where: { slug } });
      if (ya) { salteadas++; continue; }
      await prisma.noticia.create({
        data: {
          title: titulo,
          slug,
          excerpt: resumen,
          content: cuerpo + marca,
          coverImage: portada,
          publishedAt: fecha,
          published: false,
          tags: 'archivo',
        },
      });
      log('noticia: ' + titulo.slice(0, 60));
      nuevas++;
    }

    log('listo. Nuevas: ' + nuevas + ' · ya existían: ' + salteadas + '.');
    log('Quedan como BORRADOR: revisalas en el panel antes de publicar.');
  } catch (e) {
    console.error('[import-wp] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
