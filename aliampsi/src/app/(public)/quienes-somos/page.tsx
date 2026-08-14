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

const HISTORIA: { fecha: string; texto: string }[] = [
  { fecha: 'Noviembre 2020', texto: 'Primera reunión de todos los países que forman parte de AL·IAM·PSI, tras los contactos del Dr. Pedro Kestelman con las asociaciones científicas de los países miembros.' },
  { fecha: 'Diciembre 2020', texto: 'Actividad científica inaugural: «Pandemia COVID-19. Qué pasó con nuestros niños, adolescentes y sus familias. Qué podemos esperar en el 2021».' },
  { fecha: 'Octubre 2021', texto: 'Aprobación del Acta Constitutiva y el Reglamento de funcionamiento, y elección de cargos de la primera Comisión Directiva.' },
  { fecha: 'Enero 2022', texto: 'Primera reunión de la Comisión Directiva de AL·IAM·PSI.' },
  { fecha: 'Mayo 2022', texto: 'Primera Jornada AL·IAM·PSI: «Evaluación continua de los efectos de la pandemia COVID-19 y el aislamiento obligatorio» (Argentina, Colombia, Ecuador, España y México).' },
  { fecha: 'Agosto 2023', texto: 'Realización del I Congreso de AL·IAM·PSI, junto con el Congreso de la AAPI.' },
  { fecha: 'Diciembre 2023', texto: 'Cambio de Comisión Directiva: la presidencia pasa a España.' },
  { fecha: 'Junio 2024', texto: 'Webinar AL·IAM·PSI: «Trauma en niños y adolescentes».' },
  { fecha: 'Agosto 2024', texto: 'Adjudicación del Premio Norma Costoya durante el XXI Congreso de la Asociación Argentina de Psiquiatría Infantil (AAPI).' },
  { fecha: 'Mayo 2025', texto: 'II Congreso de AL·IAM·PSI en Barcelona.' },
  { fecha: 'Diciembre 2025', texto: 'Cambio de Comisión Directiva: la presidencia pasa a Uruguay.' },
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
          AL·IAM·PSI es una iniciativa surgida al inicio de la pandemia de COVID-19 para potenciar
          la interacción y el conocimiento de las asociaciones de psiquiatría de Iberoamérica, con
          el fin de mejorar la atención de nuestros pacientes y de la salud mental de la población
          infantojuvenil en su conjunto.
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
          <h2 className="text-3xl font-bold">Nuestro compromiso</h2>
          <p className="mt-4 text-ink-muted">
            La difusión de la psiquiatría infantojuvenil, especialmente en el ámbito hispanoparlante
            y en las demás lenguas de las diversas etnias de la región iberoamericana, es un
            compromiso permanente de la Alianza.
          </p>
        </div>
      </section>

      <section className="border-y border-line bg-sand/40 py-16">
        <div className="wrap">
          <p className="eyebrow"><span className="text-coral">·</span> Historia</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Nuestra trayectoria</h2>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Los hitos que marcaron el crecimiento de AL·IAM·PSI desde su fundación.
          </p>

          <ol className="mt-10 space-y-6 border-l-2 border-line pl-6">
            {HISTORIA.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-coral" />
                <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">{h.fecha}</p>
                <p className="mt-1 text-ink-muted">{h.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

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
