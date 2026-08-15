'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const FIELDS = [
  'contactEmail', 'whatsapp', 'instagram', 'facebook', 'youtube', 'linkedin',
  'contactTitle', 'contactText', 'footerText',
  'qsTitle', 'qsIntro', 'qsMision', 'qsCompromiso',
  'qsPilar1Title', 'qsPilar1Text', 'qsPilar2Title', 'qsPilar2Text', 'qsPilar3Title', 'qsPilar3Text',
];

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const data: Record<string, string> = {};
  for (const f of FIELDS) data[f] = String(formData.get(f) || '').trim();
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });
  revalidatePath('/');
  revalidatePath('/contacto');
  revalidatePath('/quienes-somos');
  redirect('/admin/ajustes?ok=1');
}
