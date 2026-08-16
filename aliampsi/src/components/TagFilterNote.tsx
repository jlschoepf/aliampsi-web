import Link from 'next/link';

export function TagFilterNote({ tag, basePath }: { tag?: string; basePath: string }) {
  if (!tag) return null;
  return (
    <div className="mt-6 flex items-center gap-3 text-sm">
      <span className="text-ink-muted">Filtrando por etiqueta:</span>
      <span className="rounded-full bg-teal-600/10 px-3 py-1 font-medium text-teal-700">{tag}</span>
      <Link href={basePath} className="font-medium text-coral hover:text-coral-dark">Quitar filtro ✕</Link>
    </div>
  );
}
