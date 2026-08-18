'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function toggleColaborador(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const c = await prisma.colaborador.findUnique({ where: { id } });
  if (!c) return;
  await prisma.colaborador.update({ where: { id }, data: { active: !c.active } });
  revalidatePath('/admin/colaboradores');
}

export async function deleteColaborador(formData: FormData) {
  await requireAdmin();
  await prisma.colaborador.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/admin/colaboradores');
}
