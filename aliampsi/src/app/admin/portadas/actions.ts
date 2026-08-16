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
