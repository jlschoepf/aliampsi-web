'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { loginAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? 'Ingresando…' : 'Ingresar'}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, { error: '' } as { error?: string });

  return (
    <form action={formAction} className="card space-y-4 p-6">
      <div>
        <label className="field-label" htmlFor="email">Correo electrónico</label>
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
      <div>
        <label className="field-label" htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-coral/10 px-3 py-2 text-sm font-medium text-coral-dark">
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="pt-1 text-center text-sm">
        <Link href="/login/recuperar" className="font-medium text-teal-600 hover:text-coral">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  );
}
