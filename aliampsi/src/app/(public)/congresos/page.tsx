import { prisma } from '@/lib/db';
import { CongresoCard } from '@/components/content';
import { visibleNowWhere, sortForList, filterByTag } from '@/lib/content';
import { TagFilterNote } from '@/components/TagFilterNote';

export const metadata = {
  title: 'Congresos',
  description: 'Congresos y actividades científicas de la Alianza Iberoamericana de Psiquiatría Infantojuvenil.',
  alternates: { canonical: '/congresos' },
  openGraph: { title: 'Congresos', description: 'Congresos y actividades científicas de la Alianza Iberoamericana de Psiquiatría Infantojuvenil.', url: '/congresos' },
};
export const dynamic = 'force-dynamic';

export default async function CongresosPage({ searchParams }: { searchParams: { tag?: string } }) {
  const all = await prisma.congreso.findMany({ where: visibleNowWhere() });
  const tag = searchParams?.tag;
  const congresos = filterByTag(sortForList(all), tag);

  return (
    <section className="wrap py-16 lg:py-20">
      <p className="eyebrow"><span className="text-coral">·</span> Agenda</p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Congresos y actividades</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Las actividades científicas organizadas por AL·IAM·PSI y las asociaciones integrantes.
      </p>
      <TagFilterNote tag={tag} basePath="/congresos" />

      {congresos.length === 0 ? (
        <p className="mt-12 text-ink-muted">Todavía no hay actividades cargadas.</p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {congresos.map((c) => (
            <CongresoCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </section>
  );
}
