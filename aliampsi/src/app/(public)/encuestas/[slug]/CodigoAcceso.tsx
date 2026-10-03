'use client';

import { useFormState, useFormStatus } from 'react-dom';

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-coral min-h-[52px] px-8 text-base shadow-md disabled:opacity-60">
      {pending ? 'Verificando…' : 'Comenzar la encuesta →'}
    </button>
  );
}

export function CodigoAcceso({ action }: { action: (prev: { error: string }, fd: FormData) => Promise<{ error: string }> }) {
  const [estado, enviar] = useFormState(action, { error: '' });
  return (
    <form action={enviar} className="card mt-8 p-6 sm:p-8">
      <p className="text-lg font-semibold text-ink">Ingrese el código de acceso</p>
      <p className="mt-1 text-ink-muted">Lo encuentra en el correo con el que le invitamos a responder la encuesta.</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <label htmlFor="codigo" className="sr-only">Código de acceso</label>
          <input id="codigo" name="codigo" type="text" required autoComplete="off" autoCapitalize="characters" spellCheck={false}
            placeholder="Código" aria-invalid={!!estado.error} aria-describedby={estado.error ? 'codigo-error' : undefined}
            className={`field min-h-[52px] text-center text-lg font-semibold uppercase tracking-[0.2em] sm:text-left ${estado.error ? 'border-coral ring-2 ring-coral/40' : ''}`} />
          {estado.error && <p id="codigo-error" role="alert" className="mt-2 text-sm font-medium text-coral-dark">{estado.error}</p>}
        </div>
        <Boton />
      </div>
    </form>
  );
}
