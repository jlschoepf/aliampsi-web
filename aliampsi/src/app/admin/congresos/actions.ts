'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { parseDate } from '@/lib/utils';

function revalidate() {
  revalidatePath('/');
  revalidatePath('/congresos');
  revalidatePath('/admin/congresos');
}

function data(formData: FormData) {
  return {
    title: String(formData.get('title') || '').trim(),
    description: String(formData.get('description') || ''),
    body: String(formData.get('body') || ''),
    author: String(formData.get('author') || ''),
    document: String(formData.get('document') || '') || null,
    sourceUrl: String(formData.get('sourceUrl') || ''),
    location: String(formData.get('location') || ''),
    startDate: parseDate(formData.get('startDate')),
    endDate: parseDate(formData.get('endDate')),
    linkUrl: String(formData.get('linkUrl') || ''),
    coverImage: String(formData.get('coverImage') || '') || null,
    published: formData.get('published') === 'on',
  };
}

export async function createCongreso(formData: FormData) {
  await requireAdmin();
  await prisma.congreso.create({ data: data(formData) });
  revalidate();
  redirect('/admin/congresos');
}

export async function updateCongreso(formData: FormData) {
  await requireAdmin();
  await prisma.congreso.update({ where: { id: String(formData.get('id')) }, data: data(formData) });
  revalidate();
  redirect('/admin/congresos');
}

export async function deleteCongreso(formData: FormData) {
  await requireAdmin();
  await prisma.congreso.delete({ where: { id: String(formData.get('id')) } });
  revalidate();
}
