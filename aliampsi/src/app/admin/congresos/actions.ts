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

function data(formData: FormData, current?: { publishedAt: Date | null } | null) {
  const published = formData.get('published') === 'on';
  const dateStr = String(formData.get('publishedAt') || '').trim();
  const publishedAt = dateStr ? new Date(dateStr) : (published ? (current?.publishedAt ?? new Date()) : null);
  return {
    title: String(formData.get('title') || '').trim(),
    description: String(formData.get('description') || ''),
    body: String(formData.get('body') || ''),
    author: String(formData.get('author') || ''),
    document: String(formData.get('document') || '') || null,
    sourceUrl: String(formData.get('sourceUrl') || ''),
    seoTitle: String(formData.get('seoTitle') || ''),
    seoDescription: String(formData.get('seoDescription') || ''),
    location: String(formData.get('location') || ''),
    startDate: parseDate(formData.get('startDate')),
    endDate: parseDate(formData.get('endDate')),
    linkUrl: String(formData.get('linkUrl') || ''),
    coverImage: String(formData.get('coverImage') || '') || null,
    featured: formData.get('featured') === 'on',
    tags: String(formData.get('tags') || '').trim(),
    published,
    publishedAt,
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
  const id = String(formData.get('id'));
  const current = await prisma.congreso.findUnique({ where: { id } });
  await prisma.congreso.update({ where: { id }, data: data(formData, current) });
  revalidate();
  redirect('/admin/congresos');
}

export async function deleteCongreso(formData: FormData) {
  await requireAdmin();
  await prisma.congreso.delete({ where: { id: String(formData.get('id')) } });
  revalidate();
}
