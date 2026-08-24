import Link from 'next/link';
import { Wordmark } from '@/components/Wordmark';
import { solicitarRecuperacionAdmin } from '../reset-actions';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Recuperar contraseña',
  robots: { index: false, follow: false },
};

export default function RecuperarAdminPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const enviado = searchParams?.estado === 'enviado';

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand/50 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark className="text-2xl" />
          <p className="mt-2 text-sm text-ink-muted">Panel de administración</p>
        </div>

        {enviado ? (
          <div className="card p-6">
            <h1 className="font-display text-lg font-bold text-ink">Pedido registrado</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Si ese correo corresponde a una cuenta de administración, en unos minutos
              vas a recibir un enlace para elegir una contraseña nueva. Revisá también
              la carpeta de correo no deseado.
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              El enlace vence en una hora y sirve una sola vez.
            </p>
            <div className="mt-5 rounded-lg bg-sand/60 p-4">
              <p className="text-xs font-semibold text-ink">¿No te llega?</p>
              <p className="mt-1 text-xs text-ink-muted">
                Cualquier otro administrador puede generarte el enlace a mano desde
                Configuración → Usuarios, y pasártelo por otra vía.
              </p>
            </div>
            <Link href="/login" className="btn-ghost mt-5 inline-flex">
              Volver a ingresar
            </Link>
          </div>
        ) : (
          <>
            <form action={solicitarRecuperacionAdmin} className="card space-y-4 p-6">
              <div>
                <h1 className="font-display text-lg font-bold text-ink">
                  Recuperar contraseña
                </h1>
                <p className="mt-1.5 text-sm text-ink-muted">
                  Escribí el correo de tu cuenta de administración y te enviamos un
                  enlace para crear una contraseña nueva.
                </p>
              </div>
              <div>
                <label className="field-label" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  className="field"
                  placeholder="admin@aliampsi.com"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Enviar enlace
              </button>
            </form>

            <p className="mt-6 text-center text-sm">
              <Link href="/login" className="text-ink-muted hover:text-coral">
                ← Volver a ingresar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
