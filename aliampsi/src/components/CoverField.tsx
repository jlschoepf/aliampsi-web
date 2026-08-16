'use client';

import { useState } from 'react';
import { ImageField } from './ImageField';
import { Collapsible } from './Collapsible';

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

      {/* Vista compacta: portada actual */}
      <div className="mb-3 mt-1 flex items-center gap-4">
        <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-line bg-sand">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] font-medium text-ink-muted">
              Genérica
            </div>
          )}
        </div>
        <p className="text-xs text-ink-muted">
          {value
            ? 'Portada seleccionada. Podés cambiarla abajo.'
            : 'Se usará la portada genérica de AL·IAM·PSI. Podés elegir otra abajo.'}
        </p>
      </div>

      <Collapsible title="Cambiar portada">
        {covers.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
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
          showUrlInput={false}
          hint="Opcional. Se recorta a formato horizontal."
        />
      </Collapsible>
    </div>
  );
}
