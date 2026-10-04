'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { invalidarContenido } from '@/lib/cache';
import { idDeYoutube } from '@/lib/videos';

function revalidar() {
  invalidarContenido();
  revalidatePath('/');
  revalidatePath('/admin/videos');
}

/** Título del video según YouTube (si no se escribe uno). */
async function tituloDeYoutube(id: string): Promise<string> {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://youtu.be/${id}`)}`, { cache: 'no-store' });
    if (r.ok) return String((await r.json()).title || '').slice(0, 200);
  } catch { /* sin título automático */ }
  return '';
}

export async function crearVideo(formData: FormData) {
  await requireAdmin();
  const id = idDeYoutube(String(formData.get('enlace') || ''));
  if (!id) redirect('/admin/videos?error=enlace');
  const titulo = String(formData.get('titulo') || '').trim().slice(0, 200) || (await tituloDeYoutube(id)) || 'Video';
  // Los nuevos entran primeros: es lo que se quiere mostrar en la portada.
  const todos = await prisma.video.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
  await prisma.$transaction([
    prisma.video.create({ data: { youtubeId: id, titulo, order: 0 } }),
    ...todos.map((v, i) => prisma.video.update({ where: { id: v.id }, data: { order: i + 1 } })),
  ]);
  revalidar();
  redirect('/admin/videos?ok=1');
}

export async function actualizarVideo(formData: FormData) {
  await requireAdmin();
  await prisma.video.update({
    where: { id: String(formData.get('id')) },
    data: {
      titulo: String(formData.get('titulo') || '').trim().slice(0, 200) || 'Video',
      descripcion: String(formData.get('descripcion') || '').trim().slice(0, 400),
      published: formData.get('published') === 'on',
    },
  });
  revalidar();
}

export async function moverVideo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir'));
  const items = await prisma.video.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
  const idx = items.findIndex((x) => x.id === id);
  const destino = dir === 'up' ? idx - 1 : idx + 1;
  if (idx === -1 || destino < 0 || destino >= items.length) return;
  const arr = [...items];
  [arr[idx], arr[destino]] = [arr[destino], arr[idx]];
  await prisma.$transaction(arr.map((v, i) => prisma.video.update({ where: { id: v.id }, data: { order: i } })));
  revalidar();
}

export async function eliminarVideo(formData: FormData) {
  await requireAdmin();
  await prisma.video.delete({ where: { id: String(formData.get('id')) } });
  revalidar();
}
