import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const metadata = {
  title: 'Quiénes somos',
  description: 'Conocé la Alianza Iberoamericana de Psiquiatría Infantojuvenil: su historia, misión y compromiso con la salud mental de niños, niñas y adolescentes.',
  alternates: { canonical: '/quienes-somos' },
  openGraph: { title: 'Quiénes somos', description: 'Conocé la Alianza Iberoamericana de Psiquiatría Infantojuvenil: su historia, misión y compromiso con la salud mental de niños, niñas y adolescentes.', url: '/quienes-somos' },
};
export const dynamic = 'force-dynamic';

export default async function QuienesSomosPage() {
  const s = await getSettings();
  const hitos = await prisma.hito.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
  });

  const pilares = [
    { title: s.qsPilar1Title, text: s.qsPilar1Text },
    { title: s.qsPilar2Title, text: s.qsPilar2Text },
    { title: s.qsPilar3Title, text: s.qsPilar3Text },
  ].filter((p) => p.title || p.text);

  return (
    <>
      <section className="wrap py-16 lg:py-20">
        <p className="eyebrow"><span className="text-coral">·</span> Quiénes somos</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
          {s.qsTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-muted">{s.qsIntro}</p>
      </section>

      {pilares.length > 0 && (
        <section className="border-y border-line bg-sand/40 py-16">
          <div className="wrap grid gap-6 md:grid-cols-3">
            {pilares.map((p, i) => (
              <div key={i} className="card p-6">
                <div className="mb-4 h-1.5 w-10 rounded-full bg-coral" />
                <h3 className="text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{p.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="wrap grid gap-10 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Nuestra misión</h2>
          <p className="mt-4 text-ink-muted">{s.qsMision}</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold">Nuestro compromiso</h2>
          <p className="mt-4 text-ink-muted">{s.qsCompromiso}</p>
        </div>
      </section>

      {hitos.length > 0 && (
        <section className="border-y border-line bg-sand/40 py-16">
          <div className="wrap">
            <p className="eyebrow"><span className="text-coral">·</span> Historia</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Nuestra trayectoria</h2>
            <p className="mt-3 max-w-2xl text-ink-muted">
              Los hitos que marcaron el crecimiento de AL·IAM·PSI desde su fundación.
            </p>

            <ol className="mt-10 space-y-6 border-l-2 border-line pl-6">
              {hitos.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-coral" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">{h.fecha}</p>
                  <p className="mt-1 text-ink-muted">{h.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="wrap pb-20 pt-16">
        <div className="rounded-xl2 border border-line bg-white/60 p-8 text-center">
          <h2 className="text-2xl font-bold">¿Querés formar parte?</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-muted">
            Las asociaciones de psiquiatría infantojuvenil de Iberoamérica pueden sumarse a la Alianza.
          </p>
          <Link href="/contacto" className="btn-coral mt-6">Contactarnos</Link>
        </div>
      </section>
    </>
  );
}
