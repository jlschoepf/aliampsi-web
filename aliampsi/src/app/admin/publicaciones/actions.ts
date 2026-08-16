'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

function revalidate() {
  revalidatePath('/publicaciones');
  revalidatePath('/admin/publicaciones');
}

function data(formData: FormData) {
  return {
    title: String(formData.get('title') || '').trim(),
    description: String(formData.get('description') || ''),
    body: String(formData.get('body') || ''),
    author: String(formData.get('author') || ''),
    document: String(formData.get('document') || '') || null,
    sourceUrl: String(formData.get('sourceUrl') || ''),
    kind: String(formData.get('kind') || 'revista'),
    linkUrl: String(formData.get('linkUrl') || ''),
    coverImage: String(formData.get('coverImage') || '') || null,
    published: formData.get('published') === 'on',
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
  await prisma.publicacion.update({ where: { id: String(formData.get('id')) }, data: data(formData) });
  revalidate();
  redirect('/admin/publicaciones');
}

export async function deletePublicacion(formData: FormData) {
  await requireAdmin();
  await prisma.publicacion.delete({ where: { id: String(formData.get('id')) } });
  revalidate();
}
