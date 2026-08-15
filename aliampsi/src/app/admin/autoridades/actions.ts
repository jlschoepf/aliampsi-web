'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

function revalidate() {
  revalidatePath('/');
  revalidatePath('/comision-directiva');
  revalidatePath('/admin/autoridades');
}

function data(formData: FormData) {
  const orderRaw = String(formData.get('order') || '0');
  const order = Number.parseInt(orderRaw, 10);
  return {
    name: String(formData.get('name') || '').trim(),
    role: String(formData.get('role') || ''),
    country: String(formData.get('country') || ''),
    bio: String(formData.get('bio') || ''),
    photo: String(formData.get('photo') || '') || null,
    order: Number.isNaN(order) ? 0 : order,
    published: formData.get('published') === 'on',
  };
}

export async function createAutoridad(formData: FormData) {
  await requireAdmin();
  await prisma.autoridad.create({ data: data(formData) });
  revalidate();
  redirect('/admin/autoridades');
}

export async function updateAutoridad(formData: FormData) {
  await requireAdmin();
  await prisma.autoridad.update({ where: { id: String(formData.get('id')) }, data: data(formData) });
  revalidate();
  redirect('/admin/autoridades');
}

export async function deleteAutoridad(formData: FormData) {
  await requireAdmin();
  await prisma.autoridad.delete({ where: { id: String(formData.get('id')) } });
  revalidate();
}


export async function moveAutoridad(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir'));
  const items = await prisma.autoridad.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const swapWith = dir === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= items.length) return;
  const arr = [...items];
  const tmp = arr[idx];
  arr[idx] = arr[swapWith];
  arr[swapWith] = tmp;
  await prisma.$transaction(
    arr.map((it, i) => prisma.autoridad.update({ where: { id: it.id }, data: { order: i } }))
  );
  revalidate();
}
