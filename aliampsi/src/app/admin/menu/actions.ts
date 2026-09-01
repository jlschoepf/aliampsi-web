'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

function revalidate() {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/menu');
}

function data(formData: FormData) {
  const orderRaw = String(formData.get('order') || '0');
  const order = Number.parseInt(orderRaw, 10);
  const parentRaw = String(formData.get('parentId') || '').trim();
  const propioId = String(formData.get('id') || '').trim();
  // Un ítem no puede colgar de sí mismo.
  const parentId = !parentRaw || parentRaw === propioId ? null : parentRaw;
  return {
    label: String(formData.get('label') || '').trim(),
    href: String(formData.get('href') || '').trim(),
    newTab: formData.get('newTab') === 'on',
    cta: formData.get('cta') === 'on',
    order: Number.isNaN(order) ? 0 : order,
    published: formData.get('published') === 'on',
    parentId,
  };
}

export async function createMenuItem(formData: FormData) {
  await requireAdmin();
  await prisma.menuItem.create({ data: data(formData) });
  revalidate();
  redirect('/admin/menu');
}

export async function updateMenuItem(formData: FormData) {
  await requireAdmin();
  await prisma.menuItem.update({ where: { id: String(formData.get('id')) }, data: data(formData) });
  revalidate();
  redirect('/admin/menu');
}

export async function deleteMenuItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  // Si tenía opciones dentro, vuelven a la barra en vez de quedar huérfanas.
  await prisma.menuItem.updateMany({ where: { parentId: id }, data: { parentId: null } });
  await prisma.menuItem.delete({ where: { id } });
  revalidate();
}

export async function moveMenuItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir'));
  const items = await prisma.menuItem.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const swapWith = dir === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= items.length) return;
  const arr = [...items];
  const tmp = arr[idx];
  arr[idx] = arr[swapWith];
  arr[swapWith] = tmp;
  await prisma.$transaction(
    arr.map((it, i) => prisma.menuItem.update({ where: { id: it.id }, data: { order: i } }))
  );
  revalidate();
}
