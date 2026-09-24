import { unstable_cache, revalidateTag } from 'next/cache';

/**
 * Caché de las consultas públicas.
 *
 * Las páginas del sitio consultaban la base de datos en cada visita, incluidas
 * las de los buscadores. Con el menú y los ajustes leyéndose en cada página,
 * eso multiplicaba las consultas y terminó agotando las horas de cómputo.
 *
 * Acá el resultado se guarda un rato y se reutiliza. Cuando se publica algo
 * desde el panel se invalida la etiqueta y el sitio vuelve a leer, así que el
 * contenido nuevo aparece enseguida.
 */

/** Etiqueta única: al invalidarla, todas las consultas cacheadas se renuevan. */
export const TAG_CONTENIDO = 'contenido-publico';

/** Un minuto: suficiente para absorber picos sin que un cambio tarde en verse. */
const SEGUNDOS = 60;

/**
 * Envuelve una consulta para que su resultado se reutilice.
 * `clave` tiene que ser única por tipo de consulta y por sus parámetros.
 */
export function cachear<T>(clave: string[], consulta: () => Promise<T>): Promise<T> {
  const envuelta = unstable_cache(consulta, clave, {
    revalidate: SEGUNDOS,
    tags: [TAG_CONTENIDO],
  });
  return envuelta() as Promise<T>;
}

/** Se llama al publicar, editar o borrar cualquier contenido desde el panel. */
export function invalidarContenido() {
  revalidateTag(TAG_CONTENIDO);
}
