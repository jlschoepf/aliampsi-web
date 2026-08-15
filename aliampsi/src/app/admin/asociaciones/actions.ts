'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

function revalidate() {
  revalidatePath('/');
  revalidatePath('/asociaciones');
  revalidatePath('/admin/asociaciones');
}

function data(formData: FormData) {
  const orderRaw = String(formData.get('order') || '0');
  const order = Number.parseInt(orderRaw, 10);
  return {
    name: String(formData.get('name') || '').trim(),
    acronym: String(formData.get('acronym') || ''),
    country: String(formData.get('country') || ''),
    website: String(formData.get('website') || ''),
    logoImage: String(formData.get('logoImage') || '') || null,
    description: String(formData.get('description') || ''),
    order: Number.isNaN(order) ? 0 : order,
    published: formData.get('published') === 'on',
  };
}

export async function createAsociacion(formData: FormData) {
  await requireAdmin();
  await prisma.asociacion.create({ data: data(formData) });
  revalidate();
  redirect('/admin/asociaciones');
}

export async function updateAsociacion(formData: FormData) {
  await requireAdmin();
  await prisma.asociacion.update({ where: { id: String(formData.get('id')) }, data: data(formData) });
  revalidate();
  redirect('/admin/asociaciones');
}

export async function deleteAsociacion(formData: FormData) {
  await requireAdmin();
  await prisma.asociacion.delete({ where: { id: String(formData.get('id')) } });
  revalidate();
}


export async function moveAsociacion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir'));
  const items = await prisma.asociacion.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const swapWith = dir === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= items.length) return;
  const arr = [...items];
  const tmp = arr[idx];
  arr[idx] = arr[swapWith];
  arr[swapWith] = tmp;
  await prisma.$transaction(
    arr.map((it, i) => prisma.asociacion.update({ where: { id: it.id }, data: { order: i } }))
  );
  revalidate();
}
