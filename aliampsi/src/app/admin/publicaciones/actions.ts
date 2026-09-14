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

/**
 * Sube o baja una publicación en el listado.
 *
 * Al mover una, se numeran todas de nuevo de arriba abajo: así el orden
 * elegido queda fijo y no depende más de la fecha.
 */
export async function movePublicacion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir'));

  const todas = await prisma.publicacion.findMany();
  // Mismo criterio que usa el sitio público, para que lo que se ve al mover
  // coincida con lo que verá el visitante.
  const ordenadas = [...todas].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const oa = a.order && a.order > 0 ? a.order : Number.MAX_SAFE_INTEGER;
    const ob = b.order && b.order > 0 ? b.order : Number.MAX_SAFE_INTEGER;
    if (oa !== ob) return oa - ob;
    const da = (a.publishedAt ?? a.createdAt).getTime();
    const db = (b.publishedAt ?? b.createdAt).getTime();
    return db - da;
  });

  const idx = ordenadas.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const destino = dir === 'up' ? idx - 1 : idx + 1;
  if (destino < 0 || destino >= ordenadas.length) return;

  const arr = [...ordenadas];
  const tmp = arr[idx];
  arr[idx] = arr[destino];
  arr[destino] = tmp;

  await prisma.$transaction(
    arr.map((it, i) => prisma.publicacion.update({ where: { id: it.id }, data: { order: i + 1 } }))
  );
  revalidate();
}

/** Vuelve al orden por fecha: borra las posiciones fijadas a mano. */
export async function resetOrdenPublicaciones() {
  await requireAdmin();
  await prisma.publicacion.updateMany({ data: { order: 0 } });
  revalidate();
}
