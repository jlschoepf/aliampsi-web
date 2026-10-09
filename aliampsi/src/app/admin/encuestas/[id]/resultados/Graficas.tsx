// Solapa «Gráficas resumen para compartir»: placas fijas, gráficas adicionales y el generador.
import type { Encuesta } from '@prisma/client';
import type { Pregunta } from '@/lib/encuestas';
import { hayTemas, hayTextos, type Extra, type TextosPlaca } from '@/lib/placa';
import { formatDate } from '@/lib/utils';
import { borrarGrafica, crearGraficaClaude, crearGraficaPregunta, prepararPlacas } from '../../actions';
import { BotonEnviar } from './BotonEnviar';

const TIPOS: Record<string, string> = { barras: 'Comparación de promedios', reparto: 'Reparto de respuestas', distribucion: 'Distribución de puntajes', lista: 'Temas e ideas' };

type Props = {
  enc: Encuesta;
  total: number;
  hayClave: boolean;
  textos: TextosPlaca;
  extras: Extra[];
  preguntas: Pregunta[];
  sp: { placas?: string; detalle?: string; grafica?: string; ia?: string };
};

function Tarjeta({ src, titulo, nota, descargar, children, nueva }: { src: string; titulo: string; nota: string; descargar: string; children?: React.ReactNode; nueva?: boolean }) {
  return (
    <figure className={`flex flex-col overflow-hidden rounded-xl border bg-paper ${nueva ? 'border-coral ring-2 ring-coral/30' : 'border-line'}`}>
      <a href={src} target="_blank" rel="noreferrer" className="block aspect-[4/5] bg-sand/40" title="Ver en tamaño completo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={titulo} className="h-full w-full object-cover" loading="lazy" />
      </a>
      <figcaption className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-semibold leading-snug text-ink">{titulo}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{nota}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <a href={descargar} className="btn-primary px-3 py-1.5 text-xs">Descargar PNG</a>
          {children}
        </div>
      </figcaption>
    </figure>
  );
}

export function Graficas({ enc, total, hayClave, textos, extras, preguntas, sp }: Props) {
  const base = `/admin/encuestas/${enc.id}/placa`;
  const v = encodeURIComponent(`${textos.en || ''}${total}`);
  const fijas = [
    { n: '1', titulo: 'Los números', nota: 'Satisfacción, recomendación y valoraciones' },
    { n: '2', titulo: 'Quiénes participaron y qué pidieron', nota: hayTextos(textos) ? 'Perfil, lo más valorado y pedidos' : 'Completa al preparar los textos con Claude' },
    ...(hayTemas(textos) ? [{ n: '3', titulo: 'Los temas que quieren tratar', nota: 'Áreas temáticas propuestas en las respuestas abiertas' }] : []),
  ];
  const graficables = preguntas.filter((p) => ['unica', 'multiple', 'escala', 'nps'].includes(p.tipo));
  const viejo = textos.en && enc.analisisEn && new Date(textos.en) < enc.analisisEn;

  if (total === 0) return <p className="text-sm text-ink-muted">Las gráficas aparecen cuando haya respuestas.</p>;

  return (
    <div className="space-y-8">
      {sp.placas === 'ok' && <p className="rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Listo: las gráficas ya tienen los textos del análisis.</p>}
      {sp.placas === 'sin-analisis' && <p className="rounded-lg bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">Primero hacé el análisis de texto: las gráficas toman sus textos de ahí.</p>}
      {sp.placas === 'error' && <p className="rounded-lg bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">No se pudo: {sp.detalle}</p>}
      {sp.ia === 'sin-clave' && <p className="rounded-lg bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">Falta conectar Claude al sitio (variable ANTHROPIC_API_KEY en Vercel).</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-sand/30 px-5 py-4">
        <div className="text-sm">
          <p className="font-semibold text-ink">{hayTextos(textos) ? 'Textos de las gráficas preparados' : 'Falta preparar los textos de las gráficas'}</p>
          <p className="text-ink-muted">
            {textos.en ? `Preparados el ${formatDate(new Date(textos.en))}.` : 'Claude resume lo más valorado, los pedidos y los temas propuestos.'}
            {viejo ? ' El análisis de texto es más nuevo: conviene actualizarlos.' : ''}
          </p>
        </div>
        {hayClave && enc.analisis ? (
          <form action={prepararPlacas}>
            <input type="hidden" name="id" value={enc.id} />
            <BotonEnviar className={hayTextos(textos) && !viejo ? 'btn-ghost text-sm' : 'btn-coral text-sm'} cargando="Preparando…">{hayTextos(textos) ? 'Actualizar textos' : 'Preparar textos con Claude'}</BotonEnviar>
          </form>
        ) : (
          <span className="text-xs text-ink-muted">{hayClave ? 'Primero hacé el análisis de texto.' : 'Claude no está conectado.'}</span>
        )}
      </div>

      <div>
        <h3 className="font-display text-lg font-bold">Placas para compartir</h3>
        <p className="mt-0.5 text-sm text-ink-muted">Formato 4:5 (1080 × 1350), listo para WhatsApp, Instagram y LinkedIn.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {fijas.map((f) => (
            <Tarjeta key={f.n} src={`${base}/${f.n}?v=${v}`} titulo={f.titulo} nota={f.nota} descargar={`${base}/${f.n}?descargar=1`} />
          ))}
          {extras.map((e) => (
            <Tarjeta key={e.id} src={`${base}/x-${e.id}`} titulo={[e.titulo, e.destacado].filter(Boolean).join(' ')} nota={`${TIPOS[e.tipo] || e.tipo}${e.pedido ? ` · pedido: «${e.pedido}»` : ''}`} descargar={`${base}/x-${e.id}?descargar=1`} nueva={sp.grafica === e.id}>
              <form action={borrarGrafica}>
                <input type="hidden" name="id" value={enc.id} />
                <input type="hidden" name="grafica" value={e.id} />
                <button type="submit" className="text-xs font-medium text-coral-dark hover:underline">Quitar</button>
              </form>
            </Tarjeta>
          ))}
        </div>
      </div>

      <div id="generar" className="rounded-xl border border-line p-5">
        <h3 className="font-display text-lg font-bold">Generar más gráficas</h3>
        <p className="mt-0.5 text-sm text-ink-muted">Las nuevas aparecen arriba, con la misma estética, listas para descargar.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <form action={crearGraficaPregunta} className="space-y-3">
            <input type="hidden" name="id" value={enc.id} />
            <label className="field-label" htmlFor="pregunta">De una pregunta</label>
            <select id="pregunta" name="pregunta" className="field text-sm" required defaultValue="">
              <option value="" disabled>Elegí una pregunta…</option>
              {graficables.map((p) => <option key={p.id} value={p.id}>{p.texto.length > 90 ? `${p.texto.slice(0, 90)}…` : p.texto}</option>)}
            </select>
            <p className="text-xs text-ink-muted">Reparto de respuestas o distribución de puntajes, según el tipo de pregunta. No usa Claude.</p>
            <BotonEnviar className="btn-ghost text-sm" cargando="Creando…">Crear gráfica</BotonEnviar>
          </form>
          <form action={crearGraficaClaude} className="space-y-3">
            <input type="hidden" name="id" value={enc.id} />
            <label className="field-label" htmlFor="pedido">Pedísela a Claude</label>
            <textarea id="pedido" name="pedido" rows={3} className="field text-sm" disabled={!hayClave} placeholder="Por ejemplo: compará las dos ponencias · qué profesiones participaron · las ideas para mejorar la difusión" />
            <p className="text-xs text-ink-muted">Claude elige el tipo de gráfica y los textos; los números los calcula el sitio. Tarda unos segundos.</p>
            <BotonEnviar className="btn-coral text-sm" cargando="Generando…" disabled={!hayClave}>Generar con Claude</BotonEnviar>
          </form>
        </div>
      </div>
    </div>
  );
}
