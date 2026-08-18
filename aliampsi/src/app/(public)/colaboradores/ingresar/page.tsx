import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getColaborador } from '@/lib/colaborador-auth';
import { ingresarColaborador } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ingresar — Colaboradores', robots: { index: false, follow: false } };

export default async function IngresarPage({ searchParams }: { searchParams: { error?: string; reset?: string } }) {
  if (await getColaborador()) redirect('/colaboradores/panel');

  return (
    <section className="wrap max-w-md py-16 lg:py-24">
      <p className="eyebrow"><span className="text-coral">·</span> Colaboradores</p>
      <h1 className="mt-4 text-3xl font-extrabold">Ingresar</h1>
      <p className="mt-3 text-ink-muted">Accedé para enviar contenido a la Alianza.</p>

      {searchParams?.reset === 'ok' && (
        <p className="mt-6 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">
          Tu contraseña se cambió. Ya podés ingresar con la nueva.
        </p>
      )}

      {searchParams?.error && (
        <p className="mt-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
          Correo o contraseña incorrectos.
        </p>
      )}

      <form action={ingresarColaborador} className="card mt-8 space-y-5 p-6">
        <div>
          <label htmlFor="email" className="field-label">Correo electrónico</label>
          <input id="email" name="email" type="email" required className="field" />
        </div>
        <div>
          <label htmlFor="password" className="field-label">Contraseña</label>
          <input id="password" name="password" type="password" required className="field" />
        </div>
        <button type="submit" className="btn-coral w-full">Ingresar</button>
        <p className="text-center text-sm">
          <Link href="/colaboradores/recuperar" className="text-ink-muted hover:text-coral">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        ¿Todavía no tenés cuenta?{' '}
        <Link href="/colaboradores/registro" className="font-semibold text-teal-600 hover:text-coral">Creala acá</Link>
      </p>
    </section>
  );
}
