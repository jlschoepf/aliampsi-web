'use server';

import { randomBytes } from 'crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/colaborador-auth';
import { getSettings } from '@/lib/settings';
import { enviarCorreo } from '@/lib/notify';
import { SITE_URL } from '@/lib/site';

const VALIDEZ_HORAS = 24;

/** Crea un enlace de recuperación para un colaborador y devuelve la URL. */
export async function crearEnlaceRecuperacion(colaboradorId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await prisma.passwordReset.create({
    data: {
      colaboradorId,
      token,
      expiresAt: new Date(Date.now() + VALIDEZ_HORAS * 60 * 60 * 1000),
    },
  });
  return `${SITE_URL}/colaboradores/restablecer?token=${token}`;
}

/** Pedido de recuperación desde la página pública. */
export async function solicitarRecuperacion(formData: FormData) {
  const email = String(formData.get('email') || '').toLowerCase().trim();
  if (!email) redirect('/colaboradores/recuperar?estado=enviado');

  const c = await prisma.colaborador.findUnique({ where: { email } });

  // Respuesta siempre igual: no revelamos si el correo existe o no.
  if (!c || !c.active) redirect('/colaboradores/recuperar?estado=enviado');

  const url = await crearEnlaceRecuperacion(c.id);
  const settings = await getSettings();

  const r = await enviarCorreo(
    c.email,
    'Restablecer tu contraseña — AL·IAM·PSI',
    [
      `Hola ${c.name},`,
      '',
      'Recibimos un pedido para restablecer la contraseña de tu cuenta de colaborador en AL·IAM·PSI.',
      '',
      'Entrá a este enlace para elegir una nueva contraseña:',
      url,
      '',
      `El enlace vence en ${VALIDEZ_HORAS} horas y se puede usar una sola vez.`,
      'Si no pediste esto, podés ignorar este mensaje.',
    ].join('\n'),
    { provider: settings.mailProvider, apiKey: settings.mailApiKey, from: settings.mailFrom }
  );

  // Si no se pudo enviar (por ejemplo, sin Resend), queda pendiente para que
  // el equipo lo gestione desde el panel.
  if (r.ok) {
    await prisma.passwordReset.updateMany({
      where: { colaboradorId: c.id, usedAt: null },
      data: { notified: true },
    });
  }

  revalidatePath('/admin/colaboradores');
  redirect('/colaboradores/recuperar?estado=enviado');
}

/** Guarda la nueva contraseña usando el token. */
export async function restablecerContrasena(formData: FormData) {
  const token = String(formData.get('token') || '');
  const password = String(formData.get('password') || '');
  const repetir = String(formData.get('password2') || '');

  if (password.length < 8) redirect(`/colaboradores/restablecer?token=${token}&error=corta`);
  if (password !== repetir) redirect(`/colaboradores/restablecer?token=${token}&error=distintas`);

  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    redirect('/colaboradores/restablecer?error=invalido');
  }

  await prisma.colaborador.update({
    where: { id: reset.colaboradorId },
    data: { passwordHash: await hashPassword(password) },
  });
  await prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } });

  redirect('/colaboradores/ingresar?reset=ok');
}
