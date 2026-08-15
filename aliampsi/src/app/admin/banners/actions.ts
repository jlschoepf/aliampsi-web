'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

function revalidate() {
  revalidatePath('/');
  revalidatePath('/admin/banners');
}

function data(formData: FormData) {
  const orderRaw = String(formData.get('order') || '0');
  const order = Number.parseInt(orderRaw, 10);
  return {
    eyebrow: String(formData.get('eyebrow') || ''),
    title: String(formData.get('title') || '').trim(),
    text: String(formData.get('text') || ''),
    image: String(formData.get('image') || '') || null,
    ctaLabel: String(formData.get('ctaLabel') || ''),
    ctaUrl: String(formData.get('ctaUrl') || ''),
    cta2Label: String(formData.get('cta2Label') || ''),
    cta2Url: String(formData.get('cta2Url') || ''),
    overlay: String(formData.get('overlay') || 'dark'),
    textColor: String(formData.get('textColor') || 'light'),
    order: Number.isNaN(order) ? 0 : order,
    published: formData.get('published') === 'on',
  };
}

export async function createBanner(formData: FormData) {
  await requireAdmin();
  await prisma.banner.create({ data: data(formData) });
  revalidate();
  redirect('/admin/banners');
}

export async function updateBanner(formData: FormData) {
  await requireAdmin();
  await prisma.banner.update({ where: { id: String(formData.get('id')) }, data: data(formData) });
  revalidate();
  redirect('/admin/banners');
}

export async function deleteBanner(formData: FormData) {
  await requireAdmin();
  await prisma.banner.delete({ where: { id: String(formData.get('id')) } });
  revalidate();
}


export async function moveBanner(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir'));
  const items = await prisma.banner.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const swapWith = dir === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= items.length) return;
  const arr = [...items];
  const tmp = arr[idx];
  arr[idx] = arr[swapWith];
  arr[swapWith] = tmp;
  await prisma.$transaction(
    arr.map((it, i) => prisma.banner.update({ where: { id: it.id }, data: { order: i } }))
  );
  revalidate();
}
