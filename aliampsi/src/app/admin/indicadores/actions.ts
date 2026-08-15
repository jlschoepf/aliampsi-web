'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

function revalidate() {
  revalidatePath('/');
  revalidatePath('/admin/indicadores');
}

function data(formData: FormData) {
  const orderRaw = String(formData.get('order') || '0');
  const order = Number.parseInt(orderRaw, 10);
  return {
    value: String(formData.get('value') || '').trim(),
    label: String(formData.get('label') || '').trim(),
    order: Number.isNaN(order) ? 0 : order,
    published: formData.get('published') === 'on',
  };
}

export async function createIndicador(formData: FormData) {
  await requireAdmin();
  await prisma.indicador.create({ data: data(formData) });
  revalidate();
  redirect('/admin/indicadores');
}

export async function updateIndicador(formData: FormData) {
  await requireAdmin();
  await prisma.indicador.update({ where: { id: String(formData.get('id')) }, data: data(formData) });
  revalidate();
  redirect('/admin/indicadores');
}

export async function deleteIndicador(formData: FormData) {
  await requireAdmin();
  await prisma.indicador.delete({ where: { id: String(formData.get('id')) } });
  revalidate();
}

export async function moveIndicador(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir'));
  const items = await prisma.indicador.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const swapWith = dir === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= items.length) return;
  const arr = [...items];
  const tmp = arr[idx];
  arr[idx] = arr[swapWith];
  arr[swapWith] = tmp;
  await prisma.$transaction(
    arr.map((it, i) => prisma.indicador.update({ where: { id: it.id }, data: { order: i } }))
  );
  revalidate();
}
