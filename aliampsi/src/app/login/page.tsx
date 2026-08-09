'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { loginAction } from './actions';
import { Wordmark } from '@/components/Wordmark';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? 'Ingresando…' : 'Ingresar'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, { error: '' } as { error?: string });

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand/50 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark className="text-2xl" />
          <p className="mt-2 text-sm text-ink-muted">Panel de administración</p>
        </div>

        <form action={formAction} className="card space-y-4 p-6">
          <div>
            <label className="field-label" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required autoFocus className="field" placeholder="admin@aliampsi.com" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" required className="field" placeholder="••••••••" />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm font-medium text-coral-dark">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-ink-muted hover:text-coral">← Volver al sitio</Link>
        </p>
      </div>
    </div>
  );
}
