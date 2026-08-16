'use client';

import dynamic from 'next/dynamic';

// El editor usa APIs del navegador: se carga solo en el cliente.
const RichTextEditor = dynamic(
  () => import('./RichTextEditor').then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[320px] rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink-muted">
        Cargando editor…
      </div>
    ),
  }
);

export function BodyEditor(props: { name: string; defaultValue?: string | null; label?: string }) {
  return <RichTextEditor {...props} />;
}
