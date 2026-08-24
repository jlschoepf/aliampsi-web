import Link from 'next/link';
import { prisma } from '@/lib/db';
import { hashResetToken } from '@/lib/auth';
import { Wordmark } from '@/components/Wordmark';
import { restablecerContrasenaAdmin } from '../reset-actions';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Elegir contraseña nueva',
  robots: { index: false, follow: false },
};

const ERRORES: Record<string, string> = {
  corta: 'La contraseña debe tener al menos 10 caracteres.',
  distintas: 'Las dos contraseñas no coinciden.',
  invalido: '',
};

export default async function RestablecerAdminPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  const token = searchParams?.token || '';
  const error = searchParams?.error || '';

  const reset = token
    ? await prisma.adminPasswordReset.findUnique({
        where: { tokenHash: hashResetToken(token) },
      })
    : null;

  const valido = !!reset && !reset.usedAt && reset.expiresAt > new Date();

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand/50 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark className="text-2xl" />
          <p className="mt-2 text-sm text-ink-muted">Panel de administración</p>
        </div>

        {!valido ? (
          <div className="card p-6">
            <h1 className="font-display text-lg font-bold text-ink">
              Este enlace ya no sirve
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Los enlaces de recuperación vencen a la hora y se pueden usar una sola
              vez. Si todavía necesitás cambiar tu contraseña, pedí uno nuevo.
            </p>
            <Link href="/login/recuperar" className="btn-primary mt-5 inline-flex">
              Pedir un enlace nuevo
            </Link>
            <p className="mt-5 text-sm">
              <Link href="/login" className="text-ink-muted hover:text-coral">
                ← Volver a ingresar
              </Link>
            </p>
          </div>
        ) : (
          <form action={restablecerContrasenaAdmin} className="card space-y-4 p-6">
            <input type="hidden" name="token" value={token} />
            <div>
              <h1 className="font-display text-lg font-bold text-ink">
                Elegí una contraseña nueva
              </h1>
              <p className="mt-1.5 text-sm text-ink-muted">
                Al guardarla se cierran todas las sesiones abiertas de esta cuenta.
              </p>
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Contraseña nueva
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={10}
                autoFocus
                autoComplete="new-password"
                className="field"
                aria-describedby="ayuda-clave"
              />
              <p id="ayuda-clave" className="mt-1 text-xs text-ink-muted">
                Al menos 10 caracteres. Una frase de varias palabras es más segura y
                más fácil de recordar que una palabra con símbolos.
              </p>
            </div>

            <div>
              <label className="field-label" htmlFor="password2">
                Repetir la contraseña
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                className="field"
              />
            </div>

            {error && ERRORES[error] && (
              <p
                role="alert"
                className="rounded-lg bg-coral/10 px-3 py-2 text-sm font-medium text-coral-dark"
              >
                {ERRORES[error]}
              </p>
            )}

            <button type="submit" className="btn-primary w-full">
              Guardar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
