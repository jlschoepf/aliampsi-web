import Link from 'next/link';

export const metadata = { title: 'Quiénes somos' };

const PILARES = [
  {
    title: 'Cooperación regional',
    text: 'Conectamos a las asociaciones de psiquiatría infantojuvenil de Iberoamérica para compartir conocimiento y experiencia.',
  },
  {
    title: 'Formación e intercambio',
    text: 'Impulsamos congresos, webinars, becas y pasantías que fortalecen la formación de profesionales de la región.',
  },
  {
    title: 'Difusión científica',
    text: 'Promovemos publicaciones y contenidos que elevan los estándares de atención en salud mental infantojuvenil.',
  },
];

export default function QuienesSomosPage() {
  return (
    <>
      <section className="wrap py-16 lg:py-20">
        <p className="eyebrow"><span className="text-coral">·</span> Quiénes somos</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Una alianza de asociaciones al servicio de la infancia y la adolescencia
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-muted">
          Somos el punto de convergencia de las principales asociaciones de psiquiatría de
          Iberoamérica, dedicadas a mejorar la atención de nuestros pacientes y de la salud mental
          de la población infantojuvenil en su conjunto.
        </p>
      </section>

      <section className="border-y border-line bg-sand/40 py-16">
        <div className="wrap grid gap-6 md:grid-cols-3">
          {PILARES.map((p) => (
            <div key={p.title} className="card p-6">
              <div className="mb-4 h-1.5 w-10 rounded-full bg-coral" />
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap grid gap-10 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Nuestra misión</h2>
          <p className="mt-4 text-ink-muted">
            Potenciar el conocimiento para el cuidado de la salud mental de niños y adolescentes,
            generando un espacio de encuentro entre profesionales, instituciones y sociedades
            científicas de toda Iberoamérica.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-bold">Presidencia</h2>
          <p className="mt-4 text-ink-muted">
            La Alianza es presidida por el <strong className="text-ink">Dr. Pedro Kestelman</strong>,
            quien representa a AL·IAM·PSI en congresos y encuentros internacionales, difundiendo la
            realidad de la salud mental infantojuvenil de la región.
          </p>
        </div>
      </section>

      <section className="wrap pb-20">
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
