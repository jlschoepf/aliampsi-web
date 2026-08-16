'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

export function MarkdownBodyField({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  const [value, setValue] = useState(defaultValue ?? '');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function insertAtCursor(text: string) {
    const ta = taRef.current;
    if (!ta) {
      setValue((v) => v + text);
      return;
    }
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const next = value.slice(0, start) + text + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = '';
    if (!file) return;
    setStatus('uploading');
    try {
      const r = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload' });
      insertAtCursor(`\n\n![](${r.url})\n\n`);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  function insertVideo() {
    const url = window.prompt('Pegá el enlace del video (YouTube o Vimeo):');
    if (url && url.trim()) insertAtCursor(`\n\n${url.trim()}\n\n`);
  }

  const Btn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink transition hover:bg-sand"
    >
      {children}
    </button>
  );

  return (
    <div>
      <label className="field-label">Contenido</label>
      <div className="mb-2 flex flex-wrap gap-2">
        <label className="cursor-pointer rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink transition hover:bg-sand">
          {status === 'uploading' ? 'Subiendo…' : '🖼 Insertar imagen'}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={status === 'uploading'} />
        </label>
        <Btn onClick={insertVideo}>🎬 Insertar video</Btn>
        <Btn onClick={() => insertAtCursor('\n\n## Subtítulo\n\n')}>Subtítulo</Btn>
        <Btn onClick={() => insertAtCursor('**texto**')}>Negrita</Btn>
        <Btn onClick={() => insertAtCursor('\n\n- Ítem 1\n- Ítem 2\n\n')}>Lista</Btn>
        <Btn onClick={() => insertAtCursor('[texto](https://…)')}>Enlace</Btn>
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={14}
        className="field font-mono text-sm"
        placeholder="Escribí la noticia. Usá los botones para imágenes, videos y formato."
      />
      <input type="hidden" name={name} value={value} />
      <p className="mt-1.5 text-xs text-ink-muted">
        Formato Markdown: **negrita**, ## Subtítulo, listas con «-». Un enlace de YouTube/Vimeo solo en su línea se muestra como video.
      </p>
      {status === 'error' && <p className="mt-1 text-xs text-coral-dark">No se pudo subir la imagen.</p>}
    </div>
  );
}
