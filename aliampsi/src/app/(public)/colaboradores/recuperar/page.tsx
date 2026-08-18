import Link from 'next/link';
import { solicitarRecuperacion } from '../reset-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Recuperar contraseña', robots: { index: false, follow: false } };

export default function RecuperarPage({ searchParams }: { searchParams: { estado?: string } }) {
  const enviado = searchParams?.estado === 'enviado';

  return (
    <section className="wrap max-w-md py-16 lg:py-24">
      <p className="eyebrow"><span className="text-coral">·</span> Colaboradores</p>
      <h1 className="mt-4 text-3xl font-extrabold">Recuperar contraseña</h1>

      {enviado ? (
        <div className="card mt-8 p-6">
          <p className="font-semibold text-ink">Pedido registrado</p>
          <p className="mt-2 text-sm text-ink-muted">
            Si existe una cuenta con ese correo, vas a recibir un enlace para elegir una contraseña
            nueva. Revisá también la carpeta de spam.
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            Si en un rato no te llega, escribinos a{' '}
            <a href="mailto:info@aliampsi.com" className="font-medium text-teal-600 hover:text-coral">
              info@aliampsi.com
            </a>{' '}
            y te ayudamos.
          </p>
          <Link href="/colaboradores/ingresar" className="btn-ghost mt-5 inline-flex">
            Volver a ingresar
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-3 text-ink-muted">
            Escribí el correo de tu cuenta y te enviamos un enlace para crear una contraseña nueva.
          </p>
          <form action={solicitarRecuperacion} className="card mt-8 space-y-5 p-6">
            <div>
              <label htmlFor="email" className="field-label">Correo electrónico</label>
              <input id="email" name="email" type="email" required className="field" />
            </div>
            <button type="submit" className="btn-coral w-full">Enviar enlace</button>
          </form>
          <p className="mt-6 text-sm text-ink-muted">
            <Link href="/colaboradores/ingresar" className="font-semibold text-teal-600 hover:text-coral">
              ← Volver a ingresar
            </Link>
          </p>
        </>
      )}
    </section>
  );
}
