'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import {
  hashPassword,
  verifyColaborador,
  createColaboradorSession,
  destroyColaboradorSession,
  requireColaborador,
} from '@/lib/colaborador-auth';

export async function registrarColaborador(formData: FormData) {
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const password = String(formData.get('password') || '');
  const name = String(formData.get('name') || '').trim();
  const orgName = String(formData.get('orgName') || '').trim();

  if (!email || !password || !name || !orgName) redirect('/colaboradores/registro?error=faltan');
  if (password.length < 8) redirect('/colaboradores/registro?error=clave');

  const existe = await prisma.colaborador.findUnique({ where: { email } });
  if (existe) redirect('/colaboradores/registro?error=existe');

  const c = await prisma.colaborador.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      name,
      orgName,
      country: String(formData.get('country') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
    },
  });

  await createColaboradorSession({ id: c.id, email: c.email, name: c.name, orgName: c.orgName });
  redirect('/colaboradores/panel');
}

export async function ingresarColaborador(formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const user = await verifyColaborador(email, password);
  if (!user) redirect('/colaboradores/ingresar?error=1');

  await prisma.colaborador.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createColaboradorSession(user);
  redirect('/colaboradores/panel');
}

export async function salirColaborador() {
  await destroyColaboradorSession();
  redirect('/');
}

export async function actualizarPerfil(formData: FormData) {
  const c = await requireColaborador();
  await prisma.colaborador.update({
    where: { id: c.id },
    data: {
      name: String(formData.get('name') || '').trim(),
      orgName: String(formData.get('orgName') || '').trim(),
      country: String(formData.get('country') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
    },
  });
  revalidatePath('/colaboradores/panel');
  redirect('/colaboradores/panel?ok=perfil');
}
