'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const data = {
    contactEmail: String(formData.get('contactEmail') || '').trim(),
    whatsapp: String(formData.get('whatsapp') || '').trim(),
    instagram: String(formData.get('instagram') || '').trim(),
    facebook: String(formData.get('facebook') || '').trim(),
    youtube: String(formData.get('youtube') || '').trim(),
    linkedin: String(formData.get('linkedin') || '').trim(),
    contactTitle: String(formData.get('contactTitle') || '').trim(),
    contactText: String(formData.get('contactText') || '').trim(),
  };
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });
  revalidatePath('/');
  revalidatePath('/contacto');
  redirect('/admin/ajustes?ok=1');
}
