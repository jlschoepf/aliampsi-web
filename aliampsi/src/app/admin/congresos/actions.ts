'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { invalidarContenido } from '@/lib/cache';
import { requireAdmin } from '@/lib/auth';
import { parseDate } from '@/lib/utils';
import { sortForList } from '@/lib/content';
import type { Congreso } from '@prisma/client';

function revalidate() {
  invalidarContenido();
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
    gallery: String(formData.get('gallery') || ''),
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

/** Sube o baja un congreso. Al mover uno se numeran todos, con el mismo criterio que el sitio público. */
export async function moveCongreso(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir'));
  const ordenados = sortForList<Congreso>(await prisma.congreso.findMany());
  const idx = ordenados.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const destino = dir === 'up' ? idx - 1 : idx + 1;
  if (destino < 0 || destino >= ordenados.length) return;
  const arr = [...ordenados];
  [arr[idx], arr[destino]] = [arr[destino], arr[idx]];
  await prisma.$transaction(arr.map((it, i) => prisma.congreso.update({ where: { id: it.id }, data: { order: i + 1 } })));
  revalidate();
}

/** Vuelve al orden por fecha: borra las posiciones fijadas a mano. */
export async function resetOrdenCongresos() {
  await requireAdmin();
  await prisma.congreso.updateMany({ data: { order: 0 } });
  revalidate();
}
