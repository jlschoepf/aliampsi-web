'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function createPortada(formData: FormData) {
  await requireAdmin();
  const url = String(formData.get('url') || '').trim();
  if (url) {
    const max = await prisma.portada.findFirst({ orderBy: { order: 'desc' } });
    await prisma.portada.create({ data: { url, order: (max?.order ?? 0) + 1 } });
  }
  revalidatePath('/admin/portadas');
  redirect('/admin/portadas');
}

export async function deletePortada(formData: FormData) {
  await requireAdmin();
  await prisma.portada.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/admin/portadas');
}

/** Cambia el lugar de una portada en la galería (es el orden en que se ofrecen al elegir portada). */
export async function movePortada(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir'));
  const items = await prisma.portada.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const destino = dir === 'up' ? idx - 1 : idx + 1;
  if (destino < 0 || destino >= items.length) return;
  const arr = [...items];
  [arr[idx], arr[destino]] = [arr[destino], arr[idx]];
  await prisma.$transaction(arr.map((it, i) => prisma.portada.update({ where: { id: it.id }, data: { order: i + 1 } })));
  revalidatePath('/admin/portadas');
}
