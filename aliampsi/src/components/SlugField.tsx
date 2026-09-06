'use client';

import { useState } from 'react';

/** Deja el texto en la forma que admite una dirección web. */
function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function SlugField({
  defaultValue,
  publicada = false,
}: {
  defaultValue?: string | null;
  publicada?: boolean;
}) {
  const inicial = defaultValue || '';
  const [valor, setValor] = useState(inicial);

  const limpio = normalizar(valor).slice(0, 80).replace(/-+$/, '');
  const cambio = Boolean(inicial) && limpio !== inicial;
  const largo = limpio.length > 60;

  return (
    <div>
      <label className="field-label" htmlFor="slug">
        Enlace de la noticia (opcional)
      </label>

      <div className="flex items-center gap-0 rounded-lg border border-line bg-white focus-within:border-teal-600">
        <span className="shrink-0 py-2 pl-3 text-sm text-ink-muted">/noticias/</span>
        <input
          id="slug"
          name="slug"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="se arma solo con el título"
          className="w-full border-0 bg-transparent py-2 pr-3 text-sm outline-none"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <p className="mt-1.5 text-sm text-ink-muted">
        Dejalo vacío y se genera con el título. Escribí algo corto y descriptivo:
        conviene que se entienda de un vistazo y que se pueda dictar por teléfono.
      </p>

      {limpio && (
        <p className="mt-1.5 break-all text-sm">
          <span className="text-ink-muted">Va a quedar: </span>
          <span className="font-medium text-teal-700">aliampsi.com/noticias/{limpio}</span>
        </p>
      )}

      {valor.trim() && valor !== limpio && (
        <p className="mt-1.5 text-sm text-ink-muted">
          Se ajustó el texto: van solo minúsculas, números y guiones.
        </p>
      )}

      {largo && (
        <p className="mt-1.5 text-sm text-amber-700">
          Sigue siendo largo. Con tres o cuatro palabras alcanza.
        </p>
      )}

      {cambio && publicada && (
        <p className="mt-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Ojo: esta noticia ya está publicada. Si cambiás el enlace, el anterior deja de
          funcionar y los que ya lo compartieron van a llegar a una página de error.
        </p>
      )}
    </div>
  );
}
