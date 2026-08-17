import { EnvioForm } from './EnvioForm';
import { createEnvio } from './actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Enviar contenido',
  description: 'Espacio para que las asociaciones integrantes envíen noticias, congresos y publicaciones a AL·IAM·PSI.',
  robots: { index: false, follow: false },
};

export default function EnviarPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <section className="wrap max-w-3xl py-16 lg:py-20">
      <p className="eyebrow"><span className="text-coral">·</span> Para las asociaciones</p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Enviar contenido a la Alianza</h1>
      <p className="mt-4 text-lg text-ink-muted">
        Compartinos noticias, congresos o publicaciones de tu asociación. El equipo de AL·IAM·PSI revisa
        cada envío y lo publica en el sitio.
      </p>

      {searchParams?.error && (
        <p className="mt-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
          Faltan datos obligatorios. Revisá el título, el texto y el correo de contacto.
        </p>
      )}

      <EnvioForm action={createEnvio} />
    </section>
  );
}
