import { prisma } from '@/lib/db';
import { PublicacionCard } from '@/components/content';

export const metadata = { title: 'Publicaciones' };
export const dynamic = 'force-dynamic';

export default async function PublicacionesPage() {
  const publicaciones = await prisma.publicacion.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <section className="wrap py-16 lg:py-20">
      <p className="eyebrow"><span className="text-coral">·</span> Biblioteca</p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Publicaciones</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Revistas científicas, documentos y materiales de referencia en psiquiatría infantojuvenil.
      </p>

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
