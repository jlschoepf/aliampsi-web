import Link from 'next/link';
import { prisma } from '@/lib/db';
import { restablecerContrasena } from '../reset-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Elegir contraseña nueva', robots: { index: false, follow: false } };

const ERRORES: Record<string, string> = {
  corta: 'La contraseña debe tener al menos 8 caracteres.',
  distintas: 'Las dos contraseñas no coinciden.',
  invalido: 'El enlace no es válido o ya venció.',
};

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  const token = searchParams?.token || '';
  const error = searchParams?.error ? ERRORES[searchParams.error] : null;

  const reset = token ? await prisma.passwordReset.findUnique({ where: { token } }) : null;
  const valido = !!reset && !reset.usedAt && reset.expiresAt > new Date();

  if (!valido) {
    return (
      <section className="wrap max-w-md py-16 lg:py-24">
        <h1 className="text-3xl font-extrabold">Enlace no válido</h1>
        <p className="mt-4 text-ink-muted">
          Este enlace ya se usó o venció (duran 24 horas). Pedí uno nuevo para continuar.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/colaboradores/recuperar" className="btn-coral">Pedir un enlace nuevo</Link>
          <Link href="/colaboradores/ingresar" className="btn-ghost">Ingresar</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="wrap max-w-md py-16 lg:py-24">
      <p className="eyebrow"><span className="text-coral">·</span> Colaboradores</p>
      <h1 className="mt-4 text-3xl font-extrabold">Elegí una contraseña nueva</h1>

      {error && (
        <p className="mt-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
          {error}
        </p>
      )}

      <form action={restablecerContrasena} className="card mt-8 space-y-5 p-6">
        <input type="hidden" name="token" value={token} />
        <div>
          <label htmlFor="password" className="field-label">Contraseña nueva</label>
          <input id="password" name="password" type="password" required minLength={8} className="field" placeholder="Mínimo 8 caracteres" />
        </div>
        <div>
          <label htmlFor="password2" className="field-label">Repetir contraseña</label>
          <input id="password2" name="password2" type="password" required minLength={8} className="field" />
        </div>
        <button type="submit" className="btn-coral w-full">Guardar contraseña</button>
      </form>
    </section>
  );
}
