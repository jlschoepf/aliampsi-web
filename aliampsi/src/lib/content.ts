// Utilidades para contenido con publicación programada, etiquetas y destacados.

export type Publishable = { published: boolean; publishedAt: Date | null };

// Filtro Prisma: publicado y con fecha nula o ya pasada (programación).
export function visibleNowWhere() {
  return {
    published: true,
    OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
  };
}

// ¿Es visible al público en este momento?
export function isVisibleNow(item: Publishable): boolean {
  return item.published && (!item.publishedAt || item.publishedAt <= new Date());
}

// Convierte "a, b , c" en ['a','b','c'] (sin vacíos, sin duplicados).
export function parseTags(tags?: string | null): string[] {
  const list = (tags || '').split(',').map((t) => t.trim()).filter(Boolean);
  return Array.from(new Set(list));
}

// Ordena: destacados primero, luego por fecha (publicación o creación) descendente.
export function sortForList<T extends { featured: boolean; publishedAt: Date | null; createdAt: Date }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const da = (a.publishedAt ?? a.createdAt).getTime();
    const db = (b.publishedAt ?? b.createdAt).getTime();
    return db - da;
  });
}

// Filtra por etiqueta (case-insensitive) si se pasa una.
export function filterByTag<T extends { tags: string }>(items: T[], tag?: string): T[] {
  if (!tag) return items;
  const t = tag.trim().toLowerCase();
  return items.filter((i) => parseTags(i.tags).some((x) => x.toLowerCase() === t));
}

// Elige contenidos relacionados: primero los que comparten etiquetas, luego los más recientes.
export function pickRelated<
  T extends { id: string; tags: string; featured: boolean; publishedAt: Date | null; createdAt: Date }
>(all: T[], current: { id: string; tags: string }, n = 3): T[] {
  const currentTags = parseTags(current.tags).map((t) => t.toLowerCase());
  const others = all.filter((x) => x.id !== current.id);
  const shared = others.filter((x) =>
    parseTags(x.tags).some((t) => currentTags.includes(t.toLowerCase()))
  );
  const sharedIds = new Set(shared.map((x) => x.id));
  const rest = others.filter((x) => !sharedIds.has(x.id));
  return [...sortForList(shared), ...sortForList(rest)].slice(0, n);
}
