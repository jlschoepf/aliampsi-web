import { prisma } from '@/lib/db';
import { AsociacionCard } from '@/components/content';

export const metadata = { title: 'Asociaciones integrantes' };
export const dynamic = 'force-dynamic';

export default async function AsociacionesPage() {
  const asociaciones = await prisma.asociacion.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  });

  return (
    <section className="wrap py-16 lg:py-20">
      <p className="eyebrow"><span className="text-coral">·</span> Red iberoamericana</p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Asociaciones integrantes</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Las instituciones que forman parte de AL·IAM·PSI a lo largo de Iberoamérica.
      </p>

      {asociaciones.length === 0 ? (
        <p className="mt-12 text-ink-muted">Todavía no hay asociaciones cargadas.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {asociaciones.map((a) => (
            <AsociacionCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </section>
  );
}
