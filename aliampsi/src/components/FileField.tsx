'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

export function FileField({
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
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    setStatus('uploading');
    try {
      const result = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload' });
      setValue(result.url);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  const fileName = value ? decodeURIComponent(value.split('/').pop() || 'documento') : '';

  return (
    <div>
      <label className="field-label">{label}</label>

      {value ? (
        <div className="mb-3 flex items-center gap-3">
          <a href={value} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-teal-600 hover:text-coral">
            📎 {fileName}
          </a>
          <button type="button" onClick={() => setValue('')} className="text-sm font-medium text-coral hover:text-coral-dark">
            Quitar
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Pegá una URL o subí un archivo"
          className="field"
        />
        <label className="btn-ghost shrink-0 cursor-pointer">
          {status === 'uploading' ? 'Subiendo…' : 'Subir documento'}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf"
            className="hidden"
            onChange={handleFile}
            disabled={status === 'uploading'}
          />
        </label>
      </div>

      <input type="hidden" name={name} value={value} />
      {status === 'error' && <p className="mt-1.5 text-xs text-coral-dark">No se pudo subir el documento.</p>}
      {hint && status !== 'error' && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
