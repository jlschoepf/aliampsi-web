'use client';
import { useState } from 'react';
export function CopiarEnlace({ url, etiqueta = 'Copiar enlace' }: { url: string; etiqueta?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 2000); }} className="btn-ghost text-sm">
      {ok ? '¡Copiado!' : etiqueta}
    </button>
  );
}
