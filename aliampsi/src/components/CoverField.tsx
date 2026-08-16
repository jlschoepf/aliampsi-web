'use client';

import { useState } from 'react';
import { ImageField } from './ImageField';

export function CoverField({
  name,
  defaultValue,
  covers,
}: {
  name: string;
  defaultValue?: string | null;
  covers: string[];
}) {
  const [value, setValue] = useState(defaultValue ?? '');

  return (
    <div>
      <label className="field-label">Imagen de portada</label>
      <p className="mb-3 text-xs text-ink-muted">
        Elegí una portada de la Alianza o subí la tuya. Si no elegís ninguna, se usa la genérica por defecto.
      </p>

      {covers.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          <button
            type="button"
            onClick={() => setValue('')}
            className={`flex aspect-video items-center justify-center rounded-lg border text-xs font-medium transition ${
              value === '' ? 'border-coral ring-2 ring-coral/40 text-ink' : 'border-line text-ink-muted hover:border-ink/40'
            }`}
          >
            Genérica
          </button>
          {covers.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => setValue(url)}
              className={`overflow-hidden rounded-lg border transition ${
                value === url ? 'border-coral ring-2 ring-coral/40' : 'border-line hover:border-ink/40'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-video w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <ImageField
        label="O subí la tuya"
        name={name}
        value={value}
        onChange={setValue}
        hint="Opcional. Se recorta a formato horizontal."
      />
    </div>
  );
}
