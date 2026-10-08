'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { configEnvio, enviarLote } from '@/lib/correo';
import { FIRMA_JOHANN, firmaHtml } from '@/lib/firma';
import { normalizarInscriptos } from '@/lib/inscriptos';
import { personalizar, textoAHtml } from '@/lib/seguimiento';

const ruta = (id: string) => `/admin/encuestas/${id}/seguimiento`;
const firmaTexto = `\n\n${FIRMA_JOHANN.nombre}\n${FIRMA_JOHANN.cargo}\naliampsi.com · linkedin.com/company/aliampsi`;

function armar(asunto: string, cuerpo: string, nombre: string, enlace: string, para: string) {
  const t = personalizar(cuerpo, nombre, enlace);
  return { para, asunto: personalizar(asunto, nombre, enlace), texto: t + firmaTexto, html: textoAHtml(t, firmaHtml(FIRMA_JOHANN)) };
}

export async function enviarRecordatorios(id: string, formData: FormData) {
  const yo = await requireAdmin();
  const enc = await prisma.encuesta.findUnique({ where: { id } });
  if (!enc) redirect('/admin/encuestas');
  const asunto = String(formData.get('asunto') || '').trim().slice(0, 200);
  const cuerpo = String(formData.get('cuerpo') || '').trim().slice(0, 6000);
  const enlace = String(formData.get('enlace') || '').trim();
  if (!asunto || !cuerpo) redirect(`${ruta(id)}?error=${encodeURIComponent('Falta el asunto o el texto del mensaje.')}`);
  const cfg = await configEnvio();

  if (formData.get('modo') === 'prueba') {
    const r = await enviarLote(cfg, [armar(asunto, cuerpo, yo.name || 'Diego', enlace, yo.email)]);
    redirect(`${ruta(id)}?${r.error ? `error=${encodeURIComponent(r.error)}` : `prueba=${encodeURIComponent(yo.email)}`}`);
  }

  const elegidos = new Set(formData.getAll('correo').map((c) => String(c).toLowerCase()));
  const destinatarios = normalizarInscriptos(enc.inscriptos).filter((i) => i.correo && elegidos.has(i.correo));
  if (!destinatarios.length) redirect(`${ruta(id)}?error=${encodeURIComponent('No marcaste a nadie en la lista.')}`);
  const r = await enviarLote(cfg, destinatarios.map((i) => armar(asunto, cuerpo, i.nombre, enlace, i.correo)));

  const hoy = new Date().toISOString();
  const reg = { ...((enc.recordatorios as Record<string, string>) || {}) };
  for (const c of r.enviados) reg[c] = hoy;
  await prisma.encuesta.update({ where: { id }, data: { recordatorios: reg as Prisma.InputJsonValue } });
  revalidatePath(ruta(id));
  const q = new URLSearchParams({ enviados: String(r.enviados.length), total: String(destinatarios.length) });
  if (r.error) q.set('error', r.error);
  redirect(`${ruta(id)}?${q}`);
}
