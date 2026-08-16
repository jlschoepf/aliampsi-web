'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

function parse(v?: string | null): string[] {
  if (!v) return [];
  try {
    const a = JSON.parse(v);
    return Array.isArray(a) ? a.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function GalleryField({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  const [items, setItems] = useState<string[]>(parse(defaultValue));
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (inputRef.current) inputRef.current.value = '';
    if (!files.length) return;
    setStatus('uploading');
    try {
      const urls: string[] = [];
      for (const f of files) {
        const r = await upload(f.name, f, { access: 'public', handleUploadUrl: '/api/upload' });
        urls.push(r.url);
      }
      setItems((prev) => [...prev, ...urls]);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: 'left' | 'right') =>
    setItems((prev) => {
      const a = [...prev];
      const j = dir === 'left' ? i - 1 : i + 1;
      if (j < 0 || j >= a.length) return a;
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });

  return (
    <div>
      <label className="field-label">Galería de imágenes (opcional)</label>

      {items.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((url, i) => (
            <div key={url + i} className="group relative overflow-hidden rounded-lg border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/70 px-1.5 py-1 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={() => move(i, 'left')} className="px-1 text-xs text-white hover:text-coral" aria-label="Mover a la izquierda">←</button>
                <button type="button" onClick={() => remove(i)} className="px-1 text-xs font-semibold text-white hover:text-coral" aria-label="Quitar">✕</button>
                <button type="button" onClick={() => move(i, 'right')} className="px-1 text-xs text-white hover:text-coral" aria-label="Mover a la derecha">→</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="btn-ghost cursor-pointer">
        {status === 'uploading' ? 'Subiendo…' : '+ Agregar imágenes'}
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={status === 'uploading'} />
      </label>

      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {status === 'error' && <p className="mt-1 text-xs text-coral-dark">No se pudieron subir algunas imágenes.</p>}
      <p className="mt-1.5 text-xs text-ink-muted">Podés subir varias a la vez. Se muestran como galería en la página de detalle.</p>
    </div>
  );
}
