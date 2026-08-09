'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

export function ImageField({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? '');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('uploading');
    setError('');
    try {
      const result = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      setValue(result.url);
      setStatus('idle');
    } catch {
      setStatus('error');
      setError('No se pudo subir la imagen. Configurá el almacenamiento (Vercel Blob) o pegá una URL.');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="field-label" htmlFor={`${name}-url`}>{label}</label>

      {value ? (
        <div className="mb-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-16 w-16 rounded-lg border border-line object-cover" />
          <button
            type="button"
            onClick={() => setValue('')}
            className="text-sm font-medium text-coral hover:text-coral-dark"
          >
            Quitar imagen
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`${name}-url`}
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Pegá una URL o subí un archivo"
          className="field"
        />
        <label className="btn-ghost shrink-0 cursor-pointer">
          {status === 'uploading' ? 'Subiendo…' : 'Subir archivo'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            disabled={status === 'uploading'}
          />
        </label>
      </div>

      {/* Valor que viaja en el formulario */}
      <input type="hidden" name={name} value={value} />

      {error && <p className="mt-1.5 text-xs text-coral-dark">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
