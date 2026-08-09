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
