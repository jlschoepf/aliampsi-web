import { prisma } from '@/lib/db';
import { visibleNowWhere } from '@/lib/content';
import { NoticiaCard, PublicacionCard, CongresoCard, SectionHeading } from '@/components/content';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Buscar',
  robots: { index: false, follow: true },
};

export default async function BuscarPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams?.q || '').trim();

  let noticias: Awaited<ReturnType<typeof prisma.noticia.findMany>> = [];
  let publicaciones: Awaited<ReturnType<typeof prisma.publicacion.findMany>> = [];
  let congresos: Awaited<ReturnType<typeof prisma.congreso.findMany>> = [];

  if (q) {
    const like = { contains: q, mode: 'insensitive' as const };
    [noticias, publicaciones, congresos] = await Promise.all([
      prisma.noticia.findMany({
        where: { AND: [visibleNowWhere(), { OR: [{ title: like }, { excerpt: like }, { content: like }, { tags: like }] }] },
        orderBy: { publishedAt: 'desc' },
        take: 12,
      }),
      prisma.publicacion.findMany({
        where: { AND: [visibleNowWhere(), { OR: [{ title: like }, { description: like }, { body: like }, { tags: like }] }] },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      prisma.congreso.findMany({
        where: { AND: [visibleNowWhere(), { OR: [{ title: like }, { description: like }, { body: like }, { tags: like }, { location: like }] }] },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
    ]);
  }

  const total = noticias.length + publicaciones.length + congresos.length;

  return (
    <section className="wrap py-16 lg:py-20">
      <p className="eyebrow"><span className="text-coral">·</span> Buscar</p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Buscar en el sitio</h1>

      <form action="/buscar" className="mt-8 flex max-w-xl gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Noticias, publicaciones, congresos…"
          className="field"
          autoFocus
        />
        <button type="submit" className="btn-coral shrink-0">Buscar</button>
      </form>

      {!q && (
        <p className="mt-8 text-ink-muted">Escribí una palabra para buscar en noticias, publicaciones y congresos.</p>
      )}

      {q && total === 0 && (
        <p className="mt-8 text-ink-muted">
          No encontramos resultados para «{q}». Probá con otras palabras.
        </p>
      )}

      {q && total > 0 && (
        <p className="mt-8 text-sm text-ink-muted">
          {total} resultado{total === 1 ? '' : 's'} para «{q}».
        </p>
      )}

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
