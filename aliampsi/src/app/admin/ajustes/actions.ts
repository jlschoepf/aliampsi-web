'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { notificarEnvio } from '@/lib/notify';
import { getSettings } from '@/lib/settings';
import { SITE_URL } from '@/lib/site';

const FIELDS = [
  'contactEmail', 'whatsapp', 'instagram', 'facebook', 'youtube', 'linkedin',
  'contactTitle', 'contactText', 'footerText',
  'qsTitle', 'qsIntro', 'qsMision', 'qsCompromiso',
  'qsPilar1Title', 'qsPilar1Text', 'qsPilar2Title', 'qsPilar2Text', 'qsPilar3Title', 'qsPilar3Text',
  'seoTitle', 'seoDescription', 'seoImage', 'gscVerification', 'gaId', 'notifyEmail', 'mailProvider', 'mailApiKey', 'mailFrom',
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

// Guarda el resultado del último intento de aviso (para mostrarlo en el panel).
export async function registrarEstadoAviso(ok: boolean, detalle: string) {
  const estado = `${ok ? 'ok' : 'error'}|${detalle}`.slice(0, 500);
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: { notifyStatus: estado, notifyAt: new Date() },
    create: { id: 'singleton', notifyStatus: estado, notifyAt: new Date() },
  });
}

// Envía un correo de prueba a la casilla configurada y guarda el resultado.
export async function probarAviso() {
  await requireAdmin();
  const s = await getSettings();
  const destino = s.notifyEmail || s.contactEmail;

  const r = await notificarEnvio(
    destino,
    {
      tipo: 'noticia',
      title: 'Prueba de aviso del sitio',
      orgName: 'AL·IAM·PSI',
      contactName: 'Panel de administración',
      contactEmail: destino,
      summary: 'Este es un correo de prueba para verificar los avisos de nuevos envíos.',
    },
    `${SITE_URL}/admin/envios`,
    { provider: s.mailProvider, apiKey: s.mailApiKey, from: s.mailFrom }
  );

  await registrarEstadoAviso(r.ok, r.detalle);
  revalidatePath('/admin/ajustes');
  redirect(`/admin/ajustes?prueba=${r.ok ? 'ok' : 'error'}#avisos`);
}
