'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base || 'noticia';
  let i = 2;
  while (true) {
    const existing = await prisma.noticia.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${i++}`;
  }
}

function revalidate() {
  revalidatePath('/');
  revalidatePath('/noticias');
  revalidatePath('/admin/noticias');
}

export async function createNoticia(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get('title') || '').trim();
  const published = formData.get('published') === 'on';
  const slug = await uniqueSlug(slugify(title));

  await prisma.noticia.create({
    data: {
      title,
      slug,
      excerpt: String(formData.get('excerpt') || ''),
      content: String(formData.get('content') || ''),
      coverImage: String(formData.get('coverImage') || '') || null,
      published,
      publishedAt: published ? new Date() : null,
    },
  });
  revalidate();
  redirect('/admin/noticias');
}

export async function updateNoticia(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const title = String(formData.get('title') || '').trim();
  const published = formData.get('published') === 'on';
  const current = await prisma.noticia.findUnique({ where: { id } });
  const slug = await uniqueSlug(slugify(title), id);

  await prisma.noticia.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: String(formData.get('excerpt') || ''),
      content: String(formData.get('content') || ''),
      coverImage: String(formData.get('coverImage') || '') || null,
      published,
      publishedAt: published ? current?.publishedAt ?? new Date() : null,
    },
  });
  revalidate();
  redirect('/admin/noticias');
}

export async function deleteNoticia(formData: FormData) {
  await requireAdmin();
  await prisma.noticia.delete({ where: { id: String(formData.get('id')) } });
  revalidate();
}
