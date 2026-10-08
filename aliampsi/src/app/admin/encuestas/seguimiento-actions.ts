'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { configEnvio, enviarLote, esCupo } from '@/lib/correo';
import { normalizarInscriptos } from '@/lib/inscriptos';
import { armarRecordatorio as armar, leerCola } from '@/lib/cola-correos';

const ruta = (id: string) => `/admin/encuestas/${id}/seguimiento`;
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
  // Si se agotó el cupo del día, los que faltan quedan en cola y salen solos apenas se libere.
  const faltan = r.error && esCupo(r.error) ? destinatarios.map((i) => i.correo).filter((c) => !r.enviados.includes(c)) : [];
  const previa = leerCola(enc.colaRecordatorio);
  const cola = faltan.length ? { asunto, cuerpo, enlace, correos: [...new Set([...(previa?.correos || []), ...faltan])] } : previa;
  await prisma.encuesta.update({ where: { id }, data: { recordatorios: reg as Prisma.InputJsonValue, colaRecordatorio: (cola ?? {}) as Prisma.InputJsonValue } });
  revalidatePath(ruta(id));
  const q = new URLSearchParams({ enviados: String(r.enviados.length), total: String(destinatarios.length) });
  if (faltan.length) q.set('encolados', String(faltan.length));
  else if (r.error) q.set('error', r.error);
  redirect(`${ruta(id)}?${q}`);
}

/** Vacía la cola de recordatorios pendientes de esta encuesta (no se mandan). */
export async function cancelarColaRecordatorio(id: string) {
  await requireAdmin();
  await prisma.encuesta.update({ where: { id }, data: { colaRecordatorio: {} } });
  revalidatePath(ruta(id));
  redirect(ruta(id));
}
