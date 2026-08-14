import { prisma } from '@/lib/db';

export const metadata = { title: 'Comisión Directiva' };
export const dynamic = 'force-dynamic';

export default async function ComisionDirectivaPage() {
  const autoridades = await prisma.autoridad.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  });

  return (
    <section className="wrap py-16 lg:py-20">
      <p className="eyebrow"><span className="text-coral">·</span> Autoridades</p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Comisión Directiva</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Las autoridades que conducen la Alianza Iberoamericana de Psiquiatría Infantojuvenil.
      </p>

      {autoridades.length === 0 ? (
        <p className="mt-12 text-ink-muted">Próximamente.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {autoridades.map((a) => (
            <article key={a.id} className="card p-6">
              <div className="flex items-center gap-4">
                {a.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.photo} alt={a.name} className="h-16 w-16 shrink-0 rounded-full border border-line object-cover" />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sand font-display text-xl font-bold text-teal-600/50">
                    {a.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold leading-tight">{a.name}</h3>
                  {a.role && <p className="text-sm font-medium text-coral">{a.role}</p>}
                  {a.country && <p className="text-xs text-ink-muted">{a.country}</p>}
                </div>
              </div>
              {a.bio && <p className="mt-4 text-sm leading-relaxed text-ink-muted">{a.bio}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
