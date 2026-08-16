import { prisma } from '@/lib/db';
import { PublicacionCard } from '@/components/content';
import { visibleNowWhere, sortForList, filterByTag } from '@/lib/content';
import { TagFilterNote } from '@/components/TagFilterNote';

export const metadata = {
  title: 'Publicaciones',
  description: 'Artículos, revistas y documentos de la Alianza Iberoamericana de Psiquiatría Infantojuvenil.',
  alternates: { canonical: '/publicaciones' },
  openGraph: { title: 'Publicaciones', description: 'Artículos, revistas y documentos de la Alianza Iberoamericana de Psiquiatría Infantojuvenil.', url: '/publicaciones' },
};
export const dynamic = 'force-dynamic';

export default async function PublicacionesPage({ searchParams }: { searchParams: { tag?: string } }) {
  const all = await prisma.publicacion.findMany({ where: visibleNowWhere() });
  const tag = searchParams?.tag;
  const publicaciones = filterByTag(sortForList(all), tag);

  return (
    <section className="wrap py-16 lg:py-20">
      <p className="eyebrow"><span className="text-coral">·</span> Biblioteca</p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Publicaciones</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Revistas científicas, documentos y materiales de referencia en psiquiatría infantojuvenil.
      </p>
      <TagFilterNote tag={tag} basePath="/publicaciones" />

      {publicaciones.length === 0 ? (
        <p className="mt-12 text-ink-muted">Todavía no hay publicaciones cargadas.</p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publicaciones.map((p) => (
            <PublicacionCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  );
}
