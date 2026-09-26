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
export async function cachear<T>(clave: string[], consulta: () => Promise<T>): Promise<T> {
  const envuelta = unstable_cache(consulta, clave, {
    revalidate: SEGUNDOS,
    tags: [TAG_CONTENIDO],
  });
  return revivirFechas(await envuelta()) as T;
}

/**
 * El caché guarda los resultados como JSON, y en JSON las fechas se vuelven texto.
 * La primera lectura trae fechas de verdad y las siguientes, texto: cualquier código
 * que ordene o compare fechas funcionaba una vez y fallaba durante el minuto
 * siguiente. Acá se devuelven a su forma original, para todas las páginas a la vez.
 */
const FECHA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

function revivirFechas(v: unknown): unknown {
  if (typeof v === 'string') return FECHA_ISO.test(v) ? new Date(v) : v;
  if (Array.isArray(v)) return v.map(revivirFechas);
  if (v && typeof v === 'object' && !(v instanceof Date)) {
    const salida: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) salida[k] = revivirFechas(x);
    return salida;
  }
  return v;
}

/** Se llama al publicar, editar o borrar cualquier contenido desde el panel. */
export function invalidarContenido() {
  revalidateTag(TAG_CONTENIDO);
}
