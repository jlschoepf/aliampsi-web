import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  SectionHeading,
  NoticiaCard,
  CongresoCard,
  AsociacionCard,
} from '@/components/content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [noticias, congresos, asociaciones, counts] = await Promise.all([
    prisma.noticia.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    }),
    prisma.congreso.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.asociacion.findMany({ where: { published: true }, orderBy: { order: 'asc' }, take: 6 }),
    Promise.all([
      prisma.asociacion.count({ where: { published: true } }),
      prisma.congreso.count({ where: { published: true } }),
    ]),
  ]);

  const [asocCount, congCount] = counts;
  const stats = [
    { value: asocCount, label: 'Asociaciones integrantes' },
    { value: congCount, label: 'Congresos realizados' },
    { value: 'Iberoamérica', label: 'Alcance regional' },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-coral/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-teal-600/10 blur-3xl" />
        <div className="wrap relative grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <p className="eyebrow">
              <span className="text-coral">·</span> Alianza Iberoamericana
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Una alianza para la{' '}
              <span className="text-coral">salud mental</span> de niños y adolescentes.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              Somos el punto de convergencia de las principales asociaciones de psiquiatría
              infantojuvenil de Iberoamérica, dedicadas a potenciar el conocimiento y mejorar la
              atención de nuestros pacientes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quienes-somos" className="btn-primary">
                Conocé la Alianza
              </Link>
              <Link href="/contacto" className="btn-ghost">
                Asociar mi institución
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4">
            {stats.map((s) => (
              <div key={s.label} className="card flex items-baseline justify-between px-6 py-5">
                <span className="font-display text-4xl font-extrabold text-ink">{s.value}</span>
                <span className="text-right text-sm font-medium text-ink-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUÉ ES */}
      <section className="border-y border-line bg-sand/40">
        <div className="wrap grid gap-8 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            ¿Qué es <span className="whitespace-nowrap">AL·IAM·PSI?</span>
          </h2>
          <div className="space-y-4 text-ink-muted">
            <p>
              AL·IAM·PSI reúne a las principales asociaciones de psiquiatría de la infancia y la
              adolescencia de Iberoamérica en torno a un objetivo común: mejorar la atención de la
              salud mental de la población infantojuvenil.
            </p>
            <p>
              A través de congresos, publicaciones, becas y actividades científicas, la Alianza
              genera un espacio de cooperación e intercambio entre profesionales de toda la región.
            </p>
            <Link href="/quienes-somos" className="inline-block font-semibold text-teal-600 hover:text-coral">
              Leer más sobre nosotros →
            </Link>
          </div>
        </div>
      </section>

      {/* PRÓXIMAS ACTIVIDADES */}
      {congresos.length > 0 && (
        <section className="wrap py-20">
          <SectionHeading
            eyebrow="Agenda"
            title="Congresos y actividades"
            intro="Participá de las actividades científicas organizadas por la Alianza y las asociaciones integrantes."
            action={
              <Link href="/congresos" className="btn-ghost hidden md:inline-flex">
                Ver todo
              </Link>
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {congresos.map((c) => (
              <CongresoCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}

      {/* NOTICIAS */}
      {noticias.length > 0 && (
        <section className="border-y border-line bg-sand/40 py-20">
          <div className="wrap">
            <SectionHeading
              eyebrow="Novedades"
              title="Últimas noticias"
              intro="Conocé las novedades relevantes de la Alianza y sus miembros."
              action={
                <Link href="/noticias" className="btn-ghost hidden md:inline-flex">
                  Ver todas
                </Link>
              }
            />
            <div className="grid gap-6 md:grid-cols-3">
              {noticias.map((n) => (
                <NoticiaCard key={n.id} n={n} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ASOCIACIONES */}
      {asociaciones.length > 0 && (
        <section className="wrap py-20">
          <SectionHeading
            eyebrow="Red"
            title="Asociaciones integrantes"
            intro="Las instituciones que forman parte de la Alianza a lo largo de Iberoamérica."
            action={
              <Link href="/asociaciones" className="btn-ghost hidden md:inline-flex">
                Ver todas
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {asociaciones.map((a) => (
              <AsociacionCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}

      {/* CTA ASOCIARSE */}
      <section className="wrap pb-24">
        <div className="relative overflow-hidden rounded-xl2 bg-ink px-8 py-16 text-center text-paper">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-coral/20 blur-3xl" />
          <h2 className="relative text-3xl font-bold text-paper sm:text-4xl">¿Representás una asociación?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-paper/75">
            Si representás una asociación de psiquiatría infantojuvenil, te invitamos a sumarte a
            AL·IAM·PSI y ser parte de esta red iberoamericana.
          </p>
          <Link href="/contacto" className="btn-coral relative mt-8">
            Quiero asociarme
          </Link>
        </div>
      </section>
    </>
  );
}
