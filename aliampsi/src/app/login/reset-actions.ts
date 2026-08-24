'use server';

import { randomBytes } from 'crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { hashPassword, hashResetToken } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { enviarCorreo } from '@/lib/notify';
import { SITE_URL } from '@/lib/site';

/** Los enlaces de administrador viven poco: dan acceso total al panel. */
const VALIDEZ_MINUTOS = 60;
/** Tope de pedidos por cuenta y por hora, para que nadie inunde la casilla. */
const MAX_PEDIDOS_POR_HORA = 3;

/**
 * Genera un enlace de recuperación para un administrador.
 * Devuelve la URL completa. El token viaja solo en esa URL: en la base
 * de datos queda únicamente su hash.
 */
export async function crearEnlaceRecuperacionAdmin(adminId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');

  // Solo puede haber un enlace vivo por cuenta: los anteriores se anulan.
  await prisma.adminPasswordReset.updateMany({
    where: { adminId, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.adminPasswordReset.create({
    data: {
      adminId,
      tokenHash: hashResetToken(token),
      expiresAt: new Date(Date.now() + VALIDEZ_MINUTOS * 60 * 1000),
    },
  });

  return `${SITE_URL}/login/restablecer?token=${token}`;
}

/** Pedido hecho desde la página pública de recuperación. */
export async function solicitarRecuperacionAdmin(formData: FormData) {
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const destino = '/login/recuperar?estado=enviado';

  // La respuesta es siempre la misma, exista o no la cuenta: así nadie puede
  // usar este formulario para averiguar qué correos son administradores.
  if (!email) redirect(destino);

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) redirect(destino);

  const desde = new Date(Date.now() - 60 * 60 * 1000);
  const recientes = await prisma.adminPasswordReset.count({
    where: { adminId: admin.id, createdAt: { gte: desde } },
  });
  if (recientes >= MAX_PEDIDOS_POR_HORA) redirect(destino);

  const url = await crearEnlaceRecuperacionAdmin(admin.id);
  const settings = await getSettings();

  const enviado = await enviarCorreo(
    admin.email,
    'Restablecer tu contraseña de administración — AL·IAM·PSI',
    [
      `Hola ${admin.name || ''}`.trim() + ',',
      '',
      'Recibimos un pedido para restablecer la contraseña de tu cuenta de',
      'administración del sitio de AL·IAM·PSI.',
      '',
      'Entrá a este enlace para elegir una contraseña nueva:',
      url,
      '',
      `El enlace vence en ${VALIDEZ_MINUTOS} minutos y se puede usar una sola vez.`,
      '',
      'Si no pediste esto, ignorá este mensaje: tu contraseña actual sigue',
      'funcionando y nadie puede cambiarla sin este enlace. Si recibís varios',
      'mensajes como este sin haberlos pedido, avisale al equipo de la Alianza.',
    ].join('\n'),
    { provider: settings.mailProvider, apiKey: settings.mailApiKey, from: settings.mailFrom }
  );

  // Si el correo no salió, el pedido queda marcado como no notificado y aparece
  // como aviso en el panel, para que otro administrador genere el enlace a mano.
  if (enviado.ok) {
    await prisma.adminPasswordReset.updateMany({
      where: { adminId: admin.id, usedAt: null },
      data: { notified: true },
    });
  }

  revalidatePath('/admin/usuarios');
  redirect(destino);
}

/** Guarda la contraseña nueva a partir del token del enlace. */
export async function restablecerContrasenaAdmin(formData: FormData) {
  const token = String(formData.get('token') || '');
  const password = String(formData.get('password') || '');
  const repetir = String(formData.get('password2') || '');

  const volver = (error: string) =>
    redirect(`/login/restablecer?token=${encodeURIComponent(token)}&error=${error}`);

  if (!token) redirect('/login/restablecer?error=invalido');
  if (password.length < 10) volver('corta');
  if (password !== repetir) volver('distintas');

  const reset = await prisma.adminPasswordReset.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    redirect('/login/restablecer?error=invalido');
  }

  const ahora = new Date();
  await prisma.$transaction([
    prisma.admin.update({
      where: { id: reset.adminId },
      data: { passwordHash: await hashPassword(password), passwordChangedAt: ahora },
    }),
    prisma.adminPasswordReset.update({
      where: { id: reset.id },
      data: { usedAt: ahora },
    }),
  ]);

  redirect('/login?estado=clave-cambiada');
}
