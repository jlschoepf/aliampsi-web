'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

function revalidate() {
  revalidatePath('/publicaciones');
  revalidatePath('/admin/publicaciones');
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
    kind: String(formData.get('kind') || 'revista'),
    linkUrl: String(formData.get('linkUrl') || ''),
    coverImage: String(formData.get('coverImage') || '') || null,
    featured: formData.get('featured') === 'on',
    tags: String(formData.get('tags') || '').trim(),
    gallery: String(formData.get('gallery') || ''),
    published,
    publishedAt,
  };
}

export async function createPublicacion(formData: FormData) {
  await requireAdmin();
  await prisma.publicacion.create({ data: data(formData) });
  revalidate();
  redirect('/admin/publicaciones');
}

export async function updatePublicacion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const current = await prisma.publicacion.findUnique({ where: { id } });
  await prisma.publicacion.update({ where: { id }, data: data(formData, current) });
  revalidate();
  redirect('/admin/publicaciones');
}

export async function deletePublicacion(formData: FormData) {
  await requireAdmin();
  await prisma.publicacion.delete({ where: { id: String(formData.get('id')) } });
  revalidate();
}
