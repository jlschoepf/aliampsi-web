'use client';

import { useFormStatus } from 'react-dom';

/** Botón de formulario que se deshabilita y avisa mientras el servidor trabaja. */
export function BotonEnviar({ children, cargando, className, disabled }: { children: React.ReactNode; cargando: string; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={`${className || ''} disabled:cursor-not-allowed disabled:opacity-60`}>
      {pending ? cargando : children}
    </button>
  );
}
