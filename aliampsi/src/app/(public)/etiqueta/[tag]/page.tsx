import Link from 'next/link';
import { prisma } from '@/lib/db';
import { visibleNowWhere, filterByTag, sortForList } from '@/lib/content';
import { NoticiaCard, PublicacionCard, CongresoCard, SectionHeading } from '@/components/content';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `Etiqueta: ${tag}`,
    description: `Contenidos etiquetados como «${tag}» en AL·IAM·PSI.`,
    alternates: { canonical: `/etiqueta/${encodeURIComponent(tag)}` },
  };
}

export default async function EtiquetaPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);

  const [allN, allP, allC] = await Promise.all([
    prisma.noticia.findMany({ where: visibleNowWhere() }),
    prisma.publicacion.findMany({ where: visibleNowWhere() }),
    prisma.congreso.findMany({ where: visibleNowWhere() }),
  ]);

  const noticias = sortForList(filterByTag(allN, tag));
  const publicaciones = sortForList(filterByTag(allP, tag));
  const congresos = sortForList(filterByTag(allC, tag));
  const total = noticias.length + publicaciones.length + congresos.length;

  return (
    <section className="wrap py-16 lg:py-20">
      <p className="eyebrow"><span className="text-coral">·</span> Etiqueta</p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">#{tag}</h1>
      <p className="mt-4 text-ink-muted">
        {total === 0
          ? 'No hay contenidos con esta etiqueta por ahora.'
          : `${total} contenido${total === 1 ? '' : 's'} etiquetado${total === 1 ? '' : 's'} como «${tag}».`}
      </p>
      <p className="mt-2">
        <Link href="/buscar" className="text-sm font-semibold text-teal-600 hover:text-coral">Ir al buscador →</Link>
      </p>

      {noticias.length > 0 && (
        <div className="mt-12">
          <SectionHeading eyebrow="Noticias" title="Noticias" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {noticias.map((n) => <NoticiaCard key={n.id} n={n} />)}
          </div>
        </div>
      )}

      {publicaciones.length > 0 && (
        <div className="mt-16">
          <SectionHeading eyebrow="Publicaciones" title="Publicaciones" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicaciones.map((p) => <PublicacionCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {congresos.length > 0 && (
        <div className="mt-16">
          <SectionHeading eyebrow="Congresos" title="Congresos y actividades" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {congresos.map((c) => <CongresoCard key={c.id} c={c} />)}
          </div>
        </div>
      )}
    </section>
  );
}
