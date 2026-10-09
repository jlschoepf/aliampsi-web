// Placas de resultados para compartir por WhatsApp (PNG 1080×1350, 4:5).
// Los números salen siempre de las respuestas guardadas; Claude solo aporta textos breves
// (etiquetas cortas, lo más valorado, lo que piden y una cita), a partir del análisis ya hecho.
import type { Encuesta } from '@prisma/client';
import { normalizarPreguntas, resumir, type Datos, type Resumen } from '@/lib/encuestas';

export type TextosPlaca = {
  actividad?: string;
  preguntas?: Record<string, { corto?: string; detalle?: string }>;
  opciones?: Record<string, Record<string, string>>;
  valorado?: { t: string; d?: string }[];
  pedidos?: { t: string; d?: string }[];
  cita?: string;
  temas?: { t: string; d?: string }[];
  graficos?: string[];
  extras?: Extra[];
  en?: string;
};

type Escala = Extract<Resumen, { tipo: 'escala' | 'nps' }>;
type Opciones = Extract<Resumen, { tipo: 'unica' | 'multiple' }>;

export const leerTextos = (v: unknown): TextosPlaca => (v && typeof v === 'object' ? (v as TextosPlaca) : {});
export const hayTextos = (t: TextosPlaca) => !!(t.valorado?.length || t.pedidos?.length);
export const hayTemas = (t: TextosPlaca) => !!t.temas?.length;

/** Acorta un texto largo sin cortar palabras. */
export function acortar(s: string, max = 36) {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

/** Número con coma decimal, como se escribe en español. */
export const coma = (n: number, dec = 1) => n.toFixed(dec).replace('.', ',');

export type DatosPlaca = {
  actividad: string;
  total: number;
  general: { valor: number; maximo: number } | null;
  nps: number | null;
  npsReparto: { promotores: number; pasivos: number; detractores: number } | null;
  barras: { titulo: string; detalle: string; valor: number; maximo: number }[];
  tortas: { titulo: string; partes: { etiqueta: string; pct: number }[] }[];
  textos: TextosPlaca;
};

/** Reúne todo lo que dibujan las placas a partir de la encuesta guardada. */
export function datosPlaca(enc: Encuesta & { respuestas: { datos: unknown }[] }): DatosPlaca {
  const textos = leerTextos(enc.analisisPlaca);
  const preguntas = normalizarPreguntas(enc.preguntas);
  const resumen = resumir(preguntas, enc.respuestas.map((r) => r.datos as Datos));
  const total = enc.respuestas.length;
  const escalas = resumen.filter((r) => r.tipo === 'escala' && r.respondieron > 0) as Escala[];
  const general = [...escalas].sort((a, b) => b.maximo - a.maximo)[0];
  const nps = resumen.find((r) => r.tipo === 'nps' && r.nps) as Escala | undefined;
  const corto = (r: Resumen) => textos.preguntas?.[r.id];

  // Barras: las escalas del mismo rango que la mayoría (por ejemplo, 1 a 5), de mayor a menor.
  const rangoComun = escalas.filter((e) => e !== general).map((e) => e.maximo).sort((a, b) => escalas.filter((e) => e.maximo === b).length - escalas.filter((e) => e.maximo === a).length)[0];
  const barras = escalas
    .filter((e) => e !== general && e.maximo === rangoComun)
    .map((e) => ({ titulo: corto(e)?.corto || acortar(e.texto.split(/en cuanto a:?/i).pop() || e.texto), detalle: corto(e)?.detalle || '', valor: e.promedio, maximo: e.maximo }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 6);

  // Tortas: las dos primeras preguntas de opción única, con las tres opciones principales y el resto agrupado.
  const todasUnicas = resumen.filter((r) => r.tipo === 'unica' && r.respondieron > 0) as Opciones[];
  const elegidas = (textos.graficos || []).map((id) => todasUnicas.find((u) => u.id === id)).filter(Boolean) as Opciones[];
  const unicas = [...elegidas, ...todasUnicas.filter((u) => !elegidas.includes(u))].slice(0, 2);
  const tortas = unicas.map((u) => {
    // «Otro» (la opción con texto libre) nunca va como categoría propia: se suma a «Otros».
    const esOtro = (o: string) => /^otr[oa]s?\b/i.test(o.trim());
    const orden = [...u.conteos].filter((c) => !esOtro(c.opcion)).sort((a, b) => b.n - a.n);
    const principales = orden.slice(0, 3).filter((c) => c.n > 0);
    const resto = u.respondieron - principales.reduce((s, c) => s + c.n, 0);
    const nombre = (o: string) => textos.opciones?.[u.id]?.[o] || acortar(o, 26);
    const partes = principales.map((c) => ({ etiqueta: nombre(c.opcion), pct: Math.round((c.n / u.respondieron) * 100) }));
    if (resto > 0) partes.push({ etiqueta: 'Otros', pct: 100 - partes.reduce((s, p) => s + p.pct, 0) });
    return { titulo: corto(u)?.corto || acortar(u.texto.replace(/^¿|\?$/g, ''), 30), partes };
  });

  return {
    actividad: textos.actividad || enc.certActividad || enc.titulo.replace(/^Encuesta de satisfacci[oó]n\s*[·:-]\s*/i, ''),
    total,
    general: general ? { valor: general.promedio, maximo: general.maximo } : null,
    nps: nps?.nps ? nps.nps.indice : null,
    npsReparto: nps?.nps ? { promotores: nps.nps.promotores, pasivos: nps.nps.pasivos, detractores: nps.nps.detractores } : null,
    barras,
    tortas,
    textos,
  };
}

/** Le pide a Claude los textos breves de las placas (JSON), a partir del análisis ya escrito. */
export async function pedirTextosPlaca(clave: string, enc: Encuesta & { respuestas: { datos: unknown }[] }, informe: string): Promise<TextosPlaca> {
  const abiertas = (resumir(normalizarPreguntas(enc.preguntas), enc.respuestas.map((r) => r.datos as Datos)).filter((r) => r.tipo === 'texto' || r.tipo === 'parrafo') as Extract<Resumen, { tipo: 'texto' | 'parrafo' }>[])
    .map((r) => `PREGUNTA: ${r.texto}\n${r.textos.filter((t) => t.trim()).map((t) => `- ${t.trim()}`).join('\n')}`)
    .join('\n\n')
    .slice(0, 20000);
  const preguntas = normalizarPreguntas(enc.preguntas)
    .filter((p) => ['unica', 'multiple', 'escala', 'nps'].includes(p.tipo))
    .map((p) => ({ id: p.id, tipo: p.tipo, texto: p.texto, opciones: p.tipo === 'unica' || p.tipo === 'multiple' ? p.opciones : undefined }));
  const pedido = `Vas a preparar los textos de dos placas gráficas (para WhatsApp) con los resultados de una encuesta de AL·IAM·PSI. Los números ya están calculados: no los repitas ni inventes otros. Escribí en español neutro, frases breves y sin punto final.

Devolvé SOLO un objeto JSON con esta forma:
{
  "actividad": "nombre corto de la actividad, por ejemplo: Webinar «Salud Mental y violencia escolar»",
  "preguntas": { "<id>": { "corto": "etiqueta de 2 a 4 palabras", "detalle": "dato secundario opcional, por ejemplo el nombre del ponente" } },
  "opciones": { "<id de pregunta>": { "<opción original, copiada exacta>": "versión corta de 1 a 3 palabras" } },
  "valorado": [ { "t": "lo más valorado, 2 a 5 palabras", "d": "aclaración breve opcional" } ],
  "pedidos": [ { "t": "lo que piden para la próxima, 2 a 5 palabras", "d": "aclaración breve opcional" } ],
  "temas": [ { "t": "área temática que piden tratar, 2 a 5 palabras", "d": "ejemplos concretos que mencionan, breve" } ],
  "graficos": ["<id>", "<id>"],
  "cita": "una frase textual de una respuesta abierta, la más representativa y positiva, de hasta 120 caracteres"
}

Reglas: "temas" reúne las áreas temáticas que las personas piden o sugieren tratar en próximas actividades, agrupadas por afinidad y ordenadas de la más mencionada a la menos mencionada (6 como máximo); salen de las respuestas abiertas, no las inventes, y si nadie propuso temas dejala vacía. "graficos" son los id de las dos preguntas de opción única que mejor muestran quiénes participaron (por ejemplo, la formación o cómo se enteraron); "preguntas" incluye todas las preguntas de abajo; "opciones" solo las de opción única o múltiple; "valorado" tiene 4 elementos como máximo y "pedidos" 3 como máximo, tomados del análisis. La cita tiene que aparecer en el análisis o en los datos, sin cambiarla.

PREGUNTAS:
${JSON.stringify(preguntas)}

ANÁLISIS:
${informe.slice(0, 12000)}

RESPUESTAS ABIERTAS (anónimas):
${abiertas}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': clave, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 3000, thinking: { type: 'between_tools' }, messages: [{ role: 'user', content: pedido }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || `HTTP ${r.status}`);
  const texto = (j.content || []).filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('');
  const desde = texto.indexOf('{');
  const hasta = texto.lastIndexOf('}');
  if (desde < 0 || hasta < desde) throw new Error('Claude no devolvió los textos de las placas.');
  const t = JSON.parse(texto.slice(desde, hasta + 1)) as TextosPlaca;
  return {
    actividad: String(t.actividad || '').slice(0, 90),
    preguntas: t.preguntas || {},
    opciones: t.opciones || {},
    valorado: (t.valorado || []).slice(0, 4),
    pedidos: (t.pedidos || []).slice(0, 3),
    cita: String(t.cita || '').slice(0, 160),
    temas: (t.temas || []).slice(0, 6),
    graficos: Array.isArray(t.graficos) ? t.graficos.map(String).slice(0, 2) : [],
    extras: [],
    en: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Gráficas adicionales: las crea el panel a pedido (de una pregunta, o pidiéndoselas a Claude).

export type TipoExtra = 'barras' | 'reparto' | 'distribucion' | 'lista';
export type Extra = {
  id: string;
  tipo: TipoExtra;
  titulo: string;
  destacado?: string;
  bajada?: string;
  preguntas?: string[];
  etiquetas?: Record<string, string>;
  items?: { t: string; d?: string }[];
  pedido?: string;
  en: string;
};

export const leerExtras = (t: TextosPlaca): Extra[] => (Array.isArray(t.extras) ? t.extras : []);

/** Gráfica de una sola pregunta, sin pasar por Claude. */
export function extraDePregunta(p: { id: string; tipo: string; texto: string }, textos: TextosPlaca): Extra | null {
  const tipo: TipoExtra | null = p.tipo === 'unica' || p.tipo === 'multiple' ? 'reparto' : p.tipo === 'escala' || p.tipo === 'nps' ? 'distribucion' : null;
  if (!tipo) return null;
  const corto = textos.preguntas?.[p.id];
  return { id: Math.random().toString(36).slice(2, 10), tipo, titulo: corto?.corto || acortar(p.texto.replace(/^¿|\?$/g, ''), 60), bajada: corto?.detalle || '', preguntas: [p.id], en: new Date().toISOString() };
}

/** Datos ya calculados para dibujar una gráfica adicional. */
export type DatosExtra = {
  extra: Extra;
  actividad: string;
  total: number;
  barras: { titulo: string; detalle: string; valor: number; maximo: number }[];
  reparto: { etiqueta: string; n: number; pct: number }[];
  distribucion: { valor: number; n: number }[];
  promedio: number | null;
  rango: { minimo: number; maximo: number } | null;
  respondieron: number;
};

export function datosExtra(enc: Encuesta & { respuestas: { datos: unknown }[] }, extra: Extra): DatosExtra {
  const textos = leerTextos(enc.analisisPlaca);
  const resumen = resumir(normalizarPreguntas(enc.preguntas), enc.respuestas.map((r) => r.datos as Datos));
  const porId = new Map(resumen.map((r) => [r.id, r]));
  const elegidas = (extra.preguntas || []).map((id) => porId.get(id)).filter(Boolean) as Resumen[];
  const nombre = (r: Resumen) => extra.etiquetas?.[r.id] || textos.preguntas?.[r.id]?.corto || acortar(r.texto.split(/en cuanto a:?/i).pop() || r.texto);
  const out: DatosExtra = {
    extra,
    actividad: textos.actividad || enc.certActividad || enc.titulo,
    total: enc.respuestas.length,
    barras: [], reparto: [], distribucion: [], promedio: null, rango: null, respondieron: 0,
  };
  if (extra.tipo === 'barras') {
    out.barras = (elegidas.filter((r) => r.tipo === 'escala' || r.tipo === 'nps') as Escala[])
      .map((r) => ({ titulo: nombre(r), detalle: extra.etiquetas?.[r.id] ? '' : textos.preguntas?.[r.id]?.detalle || '', valor: r.promedio, maximo: r.maximo }))
      .slice(0, 8);
  }
  const primera = elegidas[0];
  if (extra.tipo === 'reparto' && primera && (primera.tipo === 'unica' || primera.tipo === 'multiple')) {
    const base = primera.respondieron || 1;
    const orden = [...primera.conteos].sort((a, b) => b.n - a.n);
    const corta = (o: string) => extra.etiquetas?.[o] || textos.opciones?.[primera.id]?.[o] || acortar(o, 40);
    const visibles = orden.slice(0, 7);
    out.reparto = visibles.map((c) => ({ etiqueta: corta(c.opcion), n: c.n, pct: Math.round((c.n / base) * 100) }));
    const resto = orden.slice(7).reduce((s, c) => s + c.n, 0);
    if (resto) out.reparto.push({ etiqueta: 'Otras opciones', n: resto, pct: Math.round((resto / base) * 100) });
    out.respondieron = primera.respondieron;
  }
  if (extra.tipo === 'distribucion' && primera && (primera.tipo === 'escala' || primera.tipo === 'nps')) {
    out.distribucion = primera.distribucion;
    out.promedio = primera.promedio;
    out.rango = { minimo: primera.minimo, maximo: primera.maximo };
    out.respondieron = primera.respondieron;
  }
  return out;
}

/** Le pide a Claude el diseño de una gráfica nueva a partir de un pedido en palabras. */
export async function pedirExtraClaude(clave: string, enc: Encuesta & { respuestas: { datos: unknown }[] }, pedidoUsuario: string): Promise<Extra> {
  const resumen = resumir(normalizarPreguntas(enc.preguntas), enc.respuestas.map((r) => r.datos as Datos));
  const preguntas = resumen
    .filter((r) => ['unica', 'multiple', 'escala', 'nps'].includes(r.tipo))
    .map((r) => ({ id: r.id, tipo: r.tipo, texto: r.texto, ...(r.tipo === 'unica' || r.tipo === 'multiple' ? { opciones: r.conteos.map((c) => `${c.opcion} (${c.n})`) } : { promedio: Number((r as Escala).promedio.toFixed(2)) }) }));
  const abiertas = (resumen.filter((r) => r.tipo === 'texto' || r.tipo === 'parrafo') as Extract<Resumen, { tipo: 'texto' | 'parrafo' }>[])
    .map((r) => `PREGUNTA: ${r.texto}\n${r.textos.filter((t) => t.trim()).map((t) => `- ${t.trim()}`).join('\n')}`)
    .join('\n\n')
    .slice(0, 18000);
  const pedido = `Diseñá UNA gráfica para compartir (placa de AL·IAM·PSI) con los resultados de esta encuesta, según este pedido: «${pedidoUsuario}».

Tipos posibles:
- "barras": compara promedios de varias preguntas de escala. Usá "preguntas" con sus id (de 2 a 8).
- "reparto": muestra cómo se repartieron las respuestas de UNA pregunta de opción única o múltiple. "preguntas": [id].
- "distribucion": muestra cuántas personas eligieron cada puntaje en UNA pregunta de escala o recomendación. "preguntas": [id].
- "lista": temas o ideas que surgen de las respuestas abiertas (de 3 a 6 "items", agrupados por afinidad, de lo más mencionado a lo menos). No inventes: salen de las respuestas.

Devolvé SOLO un objeto JSON:
{ "tipo": "...", "titulo": "primera línea del título, 2 a 5 palabras", "destacado": "segunda línea del título, en color, 2 a 5 palabras", "bajada": "una frase breve que explica la gráfica", "preguntas": ["id"], "etiquetas": { "<id de pregunta u opción original>": "nombre corto" }, "items": [ { "t": "2 a 5 palabras", "d": "ejemplos breves" } ] }

Los números los calcula el sitio: no escribas cifras en los textos. Español neutro, sin punto final.

PREGUNTAS CERRADAS:
${JSON.stringify(preguntas)}

RESPUESTAS ABIERTAS (anónimas):
${abiertas}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': clave, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 2000, thinking: { type: 'between_tools' }, messages: [{ role: 'user', content: pedido }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || `HTTP ${r.status}`);
  const texto = (j.content || []).filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('');
  const a = texto.indexOf('{');
  const b = texto.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('Claude no devolvió una gráfica.');
  const e = JSON.parse(texto.slice(a, b + 1)) as Partial<Extra>;
  const tipos: TipoExtra[] = ['barras', 'reparto', 'distribucion', 'lista'];
  if (!e.tipo || !tipos.includes(e.tipo)) throw new Error('Claude propuso un tipo de gráfica que el sitio no sabe dibujar.');
  const ids = new Set(resumen.map((x) => x.id));
  const extra: Extra = {
    id: Math.random().toString(36).slice(2, 10),
    tipo: e.tipo,
    titulo: String(e.titulo || 'Resultados').slice(0, 60),
    destacado: String(e.destacado || '').slice(0, 60),
    bajada: String(e.bajada || '').slice(0, 160),
    preguntas: (e.preguntas || []).map(String).filter((id) => ids.has(id)),
    etiquetas: e.etiquetas || {},
    items: (e.items || []).slice(0, 6),
    pedido: pedidoUsuario.slice(0, 300),
    en: new Date().toISOString(),
  };
  if (extra.tipo === 'lista' ? !extra.items?.length : !extra.preguntas?.length) throw new Error('Con ese pedido no se pudo armar una gráfica: probá describirla de otra forma.');
  return extra;
}
