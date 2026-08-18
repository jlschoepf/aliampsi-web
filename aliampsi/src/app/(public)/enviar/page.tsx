import { EnvioForm } from './EnvioForm';
import { createEnvio } from './actions';
import { getSettings } from '@/lib/settings';
import { getColaborador } from '@/lib/colaborador-auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Enviar contenido',
  description: 'Espacio para que las asociaciones integrantes envíen noticias, congresos y publicaciones a AL·IAM·PSI.',
  robots: { index: false, follow: false },
};

export default async function EnviarPage({ searchParams }: { searchParams: { error?: string } }) {
  const settings = await getSettings();
  const web3Key = settings.mailProvider === 'web3forms' ? settings.mailApiKey : '';
  const sesion = await getColaborador();
  const perfil = sesion ? await prisma.colaborador.findUnique({ where: { id: sesion.id } }) : null;
  const colaborador = perfil
    ? { name: perfil.name, orgName: perfil.orgName, email: perfil.email, phone: perfil.phone }
    : null;
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

      {!colaborador && (
        <div className="mt-8 rounded-lg border border-line bg-sand/30 p-5">
          <p className="text-sm font-semibold text-ink">¿Enviás contenido seguido?</p>
          <p className="mt-1 text-sm text-ink-muted">
            Creá una cuenta y cargá los datos de tu asociación una sola vez. Después vas a poder hacer
            el seguimiento de todos tus envíos.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/colaboradores/registro" className="btn-coral">Crear cuenta</Link>
            <Link href="/colaboradores/ingresar" className="btn-ghost">Ya tengo cuenta</Link>
          </div>
        </div>
      )}

      <EnvioForm action={createEnvio} web3Key={web3Key} colaborador={colaborador} />
    </section>
  );
}
