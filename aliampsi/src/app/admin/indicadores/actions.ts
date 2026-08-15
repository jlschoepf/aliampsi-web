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
