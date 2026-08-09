export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

export function formatDateRange(start?: Date | null, end?: Date | null) {
  if (!start) return '';
  if (!end) return formatDate(start);
  return `${formatDate(start)} — ${formatDate(end)}`;
}

/** Convierte un valor de <input type="date"> a Date o null */
export function parseDate(v: FormDataEntryValue | null): Date | null {
  if (!v || typeof v !== 'string' || !v.trim()) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
