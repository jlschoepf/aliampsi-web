// Videos de YouTube: identificador a partir de cualquier enlace (o del código <iframe> que copia YouTube).
export function idDeYoutube(entrada: string): string | null {
  const t = entrada.trim();
  const src = t.match(/src=["']([^"']+)["']/i)?.[1] ?? t;
  const m = src.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return m[1];
  return /^[\w-]{11}$/.test(t) ? t : null;
}

export const miniatura = (id: string, calidad: 'maxresdefault' | 'hqdefault' = 'maxresdefault') => `https://i.ytimg.com/vi/${id}/${calidad}.jpg`;

/** Canal de YouTube de la Alianza. */
export const CANAL_YOUTUBE = 'https://www.youtube.com/channel/UCjGLu6VjxUikSSVq2lUmreQ';
