import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { ESTADOS, normalizarPreguntas, resultadosEnTexto, resumir, type Datos, type Resumen } from '@/lib/encuestas';
import { formatDate } from '@/lib/utils';
import { analizarConClaude, cambiarEstado } from '../../actions';

export const dynamic = 'force-dynamic';

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

function Barra({ etiqueta, n, total, destacada }: { etiqueta: string; n: number; total: number; destacada?: boolean }) {
  const p = pct(n, total);
  return (
    <div className="grid grid-cols-[minmax(0,14rem)_1fr_4.5rem] items-center gap-3 text-sm">
      <span className="truncate text-ink" title={etiqueta}>{etiqueta}</span>
      <div className="h-3 overflow-hidden rounded-full bg-sand" role="img" aria-label={`${etiqueta}: ${n} (${p}%)`}>
        <div className={`h-full rounded-full ${destacada ? 'bg-coral' : 'bg-teal-600'}`} style={{ width: `${p}%` }} />
      </div>
      <span className="text-right tabular-nums text-ink-muted">{n} · {p}%</span>
    </div>
  );
}

function Tarjeta({ r, i }: { r: Resumen; i: number }) {
  return (
    <div className="card p-6">
      <p className="font-semibold text-ink">{i}. {r.texto}</p>
      <p className="mt-1 text-xs text-ink-muted">{r.respondieron} respuestas</p>
      <div className="mt-4 space-y-2">
        {(r.tipo === 'unica' || r.tipo === 'multiple') && (
          <>
            {[...r.conteos].sort((a, b) => b.n - a.n).map((c) => <Barra key={c.opcion} etiqueta={c.opcion} n={c.n} total={r.respondieron} />)}
            {r.tipo === 'multiple' && <p className="text-xs text-ink-muted">Se podía marcar más de una: los porcentajes suman más de 100.</p>}
            {r.otros.length > 0 && (
              <details className="mt-2 text-sm"><summary className="cursor-pointer text-teal-700">Ver lo escrito en «Otro» ({r.otros.length})</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">{r.otros.map((o, k) => <li key={k}>{o}</li>)}</ul>
              </details>
            )}
          </>
        )}
        {(r.tipo === 'escala' || r.tipo === 'nps') && (
          <>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <p><span className="font-display text-3xl font-extrabold text-ink">{r.respondieron ? r.promedio.toFixed(1) : '—'}</span> <span className="text-sm text-ink-muted">promedio sobre {r.maximo}</span></p>
              {r.nps && <p><span className={`font-display text-3xl font-extrabold ${r.nps.indice >= 50 ? 'text-teal-700' : r.nps.indice >= 0 ? 'text-ink' : 'text-coral-dark'}`}>{r.nps.indice > 0 ? '+' : ''}{r.nps.indice}</span> <span className="text-sm text-ink-muted">NPS · {r.nps.promotores} promotores, {r.nps.pasivos} pasivos, {r.nps.detractores} detractores</span></p>}
            </div>
            {[...r.distribucion].reverse().map((d) => <Barra key={d.valor} etiqueta={`${d.valor}${d.valor === r.maximo && r.etiquetaMax ? ` · ${r.etiquetaMax}` : d.valor === r.minimo && r.etiquetaMin ? ` · ${r.etiquetaMin}` : ''}`} n={d.n} total={r.respondieron} destacada={r.tipo === 'nps' && d.valor <= 6} />)}
          </>
        )}
        {(r.tipo === 'texto' || r.tipo === 'parrafo') && (
          r.textos.length === 0 ? <p className="text-sm text-ink-muted">Sin respuestas todavía.</p> : (
            <ul className="max-h-96 space-y-2 overflow-y-auto pr-2">
              {r.textos.map((t, k) => <li key={k} className="rounded-lg bg-sand/40 px-4 py-3 text-sm text-ink">«{t}»</li>)}
            </ul>
          )
        )}
      </div>
    </div>
  );
}

export default async function Resultados({ params, searchParams }: { params: { id: string }; searchParams: { ia?: string; detalle?: string } }) {
  const enc = await prisma.encuesta.findUnique({ where: { id: params.id }, include: { respuestas: { select: { datos: true, createdAt: true }, orderBy: { createdAt: 'asc' } } } });
  if (!enc) notFound();
  const preguntas = normalizarPreguntas(enc.preguntas);
  const total = enc.respuestas.length;
  const resumen = resumir(preguntas, enc.respuestas.map((r) => r.datos as Datos));
  const nps = resumen.find((r) => r.tipo === 'nps' && r.nps) as Extract<Resumen, { tipo: 'escala' | 'nps' }> | undefined;
  const escalas = resumen.filter((r) => r.tipo === 'escala') as Extract<Resumen, { tipo: 'escala' | 'nps' }>[];
  // «Satisfacción general»: la escala más amplia (por ejemplo, la del 1 al 10); si no hay, la primera.
  const general = [...escalas].sort((a, b) => b.maximo - a.maximo)[0];
  const hayClave = !!process.env.ANTHROPIC_API_KEY;
  const texto = resultadosEnTexto(enc.titulo, total, resumen);

  return (
    <>
      <AdminHeader title="Resultados" subtitle={enc.titulo} />
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink-muted">Estado: {ESTADOS[enc.estado] ?? enc.estado}</span>
        <form action={cambiarEstado}>
          <input type="hidden" name="id" value={enc.id} />
          <input type="hidden" name="estado" value={enc.estado === 'abierta' ? 'cerrada' : 'abierta'} />
          <button type="submit" className="btn-ghost text-sm">{enc.estado === 'abierta' ? 'Cerrar encuesta' : 'Abrir encuesta'}</button>
        </form>
        <a href={`/admin/encuestas/${enc.id}/csv`} className="btn-ghost text-sm">Descargar CSV</a>
        <Link href={`/admin/encuestas/${enc.id}`} className="btn-ghost text-sm">Editar</Link>
        <Link href={`/encuestas/${enc.slug}`} target="_blank" className="btn-ghost text-sm">Ver encuesta</Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Respuestas</p><p className="mt-1 font-display text-4xl font-extrabold">{total}</p></div>
        <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Satisfacción general</p><p className="mt-1 font-display text-4xl font-extrabold">{general && general.respondieron ? general.promedio.toFixed(1) : '—'}<span className="text-lg text-ink-muted"> / {general ? general.maximo : 5}</span></p></div>
        <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Recomendación (NPS)</p><p className="mt-1 font-display text-4xl font-extrabold">{nps?.nps ? `${nps.nps.indice > 0 ? '+' : ''}${nps.nps.indice}` : '—'}</p></div>
        <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Período</p><p className="mt-2 text-sm text-ink">{total ? `${formatDate(enc.respuestas[0].createdAt)} – ${formatDate(enc.respuestas[total - 1].createdAt)}` : 'Sin respuestas todavía'}</p></div>
      </div>

      <section id="analisis" className="card mb-8 p-6">
        <h2 className="font-display text-xl font-bold">Análisis con Claude</h2>
        <p className="mt-1 text-sm text-ink-muted">Claude lee los números y las respuestas abiertas —sin datos de quién respondió— y redacta un informe para la Comisión Directiva.</p>
        {searchParams.ia === 'sin-respuestas' && <p className="mt-3 text-sm font-medium text-coral-dark">Todavía no hay respuestas para analizar.</p>}
        {searchParams.ia === 'error' && <p className="mt-3 text-sm font-medium text-coral-dark">No se pudo completar el análisis: {searchParams.detalle}</p>}
        {!hayClave ? (
          <div className="mt-4 rounded-lg border border-line bg-sand/40 p-4 text-sm text-ink">
            <p className="font-semibold">Falta conectar Claude al sitio.</p>
            <p className="mt-1 text-ink-muted">Hay que crear una clave en console.anthropic.com y cargarla en Vercel como variable de entorno <code>ANTHROPIC_API_KEY</code>. Mientras tanto, podés copiar los resultados de abajo y pegarlos en Claude.</p>
          </div>
        ) : (
          <form action={analizarConClaude} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={enc.id} />
            <label className="field-label" htmlFor="enfoque">¿Algo en particular que quieras que mire? (opcional)</label>
            <textarea id="enfoque" name="enfoque" rows={2} className="field text-sm" placeholder="Por ejemplo: comparar la valoración de las dos exposiciones, o qué temas piden para el próximo webinar." />
            <button type="submit" disabled={total === 0} className="btn-coral disabled:opacity-50">{enc.analisis ? 'Volver a analizar' : 'Analizar resultados'}</button>
            <p className="text-xs text-ink-muted">Tarda unos segundos. El informe queda guardado acá.</p>
          </form>
        )}
        {enc.analisis && (
          <div className="mt-6 border-t border-line pt-6">
            <p className="mb-3 text-xs text-ink-muted">Último análisis: {enc.analisisEn ? formatDate(enc.analisisEn) : ''} · con {total} respuestas{searchParams.ia === 'ok' ? ' · recién actualizado' : ''}</p>
            <div className="space-y-3 text-sm text-ink/90">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h3 className="mt-6 font-display text-lg font-bold text-ink">{children}</h3>,
                  h2: ({ children }) => <h3 className="mt-6 font-display text-lg font-bold text-ink">{children}</h3>,
                  h3: ({ children }) => <h4 className="mt-4 font-semibold text-ink">{children}</h4>,
                  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
                  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-coral/50 pl-4 italic text-ink-muted">{children}</blockquote>,
                  table: ({ children }) => <div className="overflow-x-auto"><table className="w-full text-left text-sm">{children}</table></div>,
                  th: ({ children }) => <th className="border-b border-line px-2 py-1 font-semibold">{children}</th>,
                  td: ({ children }) => <td className="border-b border-line px-2 py-1">{children}</td>,
                }}
              >
                {enc.analisis}
              </ReactMarkdown>
            </div>
          </div>
        )}
        <details className="mt-6 text-sm">
          <summary className="cursor-pointer font-medium text-teal-700">Ver los resultados en texto, para copiar y pegar en Claude</summary>
          <textarea readOnly value={texto} rows={12} className="field mt-3 font-mono text-xs" aria-label="Resultados en texto" />
        </details>
      </section>

      {total === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay respuestas. {enc.estado !== 'abierta' && 'Abrí la encuesta y compartí el enlace para empezar a recibirlas.'}</div>
      ) : (
        <div className="space-y-4">{resumen.map((r, i) => <Tarjeta key={r.id} r={r} i={i + 1} />)}</div>
      )}
    </>
  );
}
