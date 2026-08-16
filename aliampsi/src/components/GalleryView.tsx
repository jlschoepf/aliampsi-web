export function GalleryView({ gallery }: { gallery: string }) {
  let items: string[] = [];
  try {
    const a = JSON.parse(gallery || '[]');
    if (Array.isArray(a)) items = a.filter((x) => typeof x === 'string');
  } catch {
    items = [];
  }
  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-600">Galería</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((url, i) => (
          <a key={url + i} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl2 border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="aspect-square w-full object-cover transition hover:scale-105" />
          </a>
        ))}
      </div>
    </div>
  );
}
