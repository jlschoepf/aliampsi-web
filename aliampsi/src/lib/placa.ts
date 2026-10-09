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
  graficos?: string[];
  en?: string;
};

type Escala = Extract<Resumen, { tipo: 'escala' | 'nps' }>;
type Opciones = Extract<Resumen, { tipo: 'unica' | 'multiple' }>;

export const leerTextos = (v: unknown): TextosPlaca => (v && typeof v === 'object' ? (v as TextosPlaca) : {});
export const hayTextos = (t: TextosPlaca) => !!(t.valorado?.length || t.pedidos?.length);

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
    const orden = [...u.conteos].sort((a, b) => b.n - a.n);
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
export async function pedirTextosPlaca(clave: string, enc: Encuesta, informe: string): Promise<TextosPlaca> {
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
  "graficos": ["<id>", "<id>"],
  "cita": "una frase textual de una respuesta abierta, la más representativa y positiva, de hasta 120 caracteres"
}

Reglas: "graficos" son los id de las dos preguntas de opción única que mejor muestran quiénes participaron (por ejemplo, la formación o cómo se enteraron); "preguntas" incluye todas las preguntas de abajo; "opciones" solo las de opción única o múltiple; "valorado" tiene 4 elementos como máximo y "pedidos" 3 como máximo, tomados del análisis. La cita tiene que aparecer en el análisis o en los datos, sin cambiarla.

PREGUNTAS:
${JSON.stringify(preguntas)}

ANÁLISIS:
${informe.slice(0, 12000)}`;
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
    graficos: Array.isArray(t.graficos) ? t.graficos.map(String).slice(0, 2) : [],
    en: new Date().toISOString(),
  };
}
