'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { crearEnlaceRecuperacion } from '@/app/(public)/colaboradores/reset-actions';
import { redirect } from 'next/navigation';

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

/** Genera un enlace de recuperación para pasárselo al colaborador. */
export async function generarEnlaceReset(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const url = await crearEnlaceRecuperacion(id);
  revalidatePath('/admin/colaboradores');
  redirect(`/admin/colaboradores?enlace=${encodeURIComponent(url)}&para=${id}`);
}

/** Marca un pedido de recuperación como atendido. */
export async function marcarResetAtendido(formData: FormData) {
  await requireAdmin();
  await prisma.passwordReset.update({
    where: { id: String(formData.get('id')) },
    data: { notified: true },
  });
  revalidatePath('/admin/colaboradores');
}
