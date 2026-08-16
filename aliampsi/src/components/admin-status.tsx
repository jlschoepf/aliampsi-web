export function StatusBadges({
  featured,
  published,
  publishedAt,
}: {
  featured?: boolean;
  published: boolean;
  publishedAt: Date | null;
}) {
  const scheduled = published && !!publishedAt && new Date(publishedAt) > new Date();
  return (
    <>
      {scheduled && (
        <span className="rounded-full bg-teal-600/10 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
          Programada
        </span>
      )}
      {featured && (
        <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-semibold text-coral-dark">
          ★ Destacada
        </span>
      )}
    </>
  );
}
