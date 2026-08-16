import { prisma } from '@/lib/db';
import { NoticiaCard } from '@/components/content';

export const metadata = {
  title: 'Noticias',
  description: 'Novedades y comunicados de la Alianza Iberoamericana de Psiquiatría Infantojuvenil.',
  alternates: { canonical: '/noticias' },
  openGraph: { title: 'Noticias', description: 'Novedades y comunicados de la Alianza Iberoamericana de Psiquiatría Infantojuvenil.', url: '/noticias' },
};
export const dynamic = 'force-dynamic';

export default async function NoticiasPage() {
  const noticias = await prisma.noticia.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <section className="wrap py-16 lg:py-20">
      <p className="eyebrow"><span className="text-coral">·</span> Novedades</p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Noticias</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Las últimas novedades relevantes de la Alianza y sus asociaciones integrantes.
      </p>

      {noticias.length === 0 ? (
        <p className="mt-12 text-ink-muted">Todavía no hay noticias publicadas.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {noticias.map((n) => (
            <NoticiaCard key={n.id} n={n} />
          ))}
        </div>
      )}
    </section>
  );
}
