'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { ESTADOS_CERT } from '@/lib/encuestas';
import { enviarSolicitud } from '@/lib/certificados-envio';
import { EN_COLA, esCupo } from '@/lib/correo';
import { procesarCola } from '@/lib/cola-correos';

const ruta = (encuestaId: string) => `/admin/encuestas/${encuestaId}/certificados`;

export async function cambiarEstadoSolicitud(formData: FormData) {
  await requireAdmin();
  const estado = String(formData.get('estado'));
  if (!(estado in ESTADOS_CERT)) return;
  const s = await prisma.solicitudCertificado.update({ where: { id: String(formData.get('id')) }, data: { estado } });
  revalidatePath(ruta(s.encuestaId));
}

export async function corregirNombre(formData: FormData) {
  await requireAdmin();
  const nombre = String(formData.get('nombre') || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (nombre.length < 3) return;
  const s = await prisma.solicitudCertificado.update({ where: { id: String(formData.get('id')) }, data: { nombre } });
  revalidatePath(ruta(s.encuestaId));
}

export async function eliminarSolicitud(formData: FormData) {
  await requireAdmin();
  const s = await prisma.solicitudCertificado.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath(ruta(s.encuestaId));
}

/**
 * Valida de una vez los pedidos pendientes cuyo correo aparece en la lista de asistentes
 * (se puede pegar el CSV de Zoom o de Luma tal cual: se extraen solo los correos).
 */
export async function validarConLista(encuestaId: string, formData: FormData) {
  await requireAdmin();
  const texto = String(formData.get('lista') || '');
  const correos = [...new Set((texto.match(/[^\s@,;"'<>()]+@[^\s@,;"'<>()]+\.[^\s@,;"'<>()]{2,}/g) || []).map((c) => c.toLowerCase()))];
  const r = correos.length
    ? await prisma.solicitudCertificado.updateMany({ where: { encuestaId, estado: 'pendiente', correo: { in: correos } }, data: { estado: 'validada' } })
    : { count: 0 };
  revalidatePath(ruta(encuestaId));
  redirect(`${ruta(encuestaId)}?validadas=${r.count}&leidos=${correos.length}`);
}

export async function enviarPorCorreo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const s = await prisma.solicitudCertificado.findUnique({ where: { id }, select: { encuestaId: true } });
  if (!s) return;
  await enviarSolicitud(id);
  revalidatePath(ruta(s.encuestaId));
}

/** Envía de a tandas los certificados validados todavía no enviados (para no exceder el tiempo del servidor). */
export async function enviarValidados(encuestaId: string) {
  await requireAdmin();
  const lote = await prisma.solicitudCertificado.findMany({ where: { encuestaId, estado: 'validada' }, select: { id: true }, take: 15 });
  let ok = 0;
  let intentados = 0;
  for (const s of lote) {
    intentados++;
    const r = await enviarSolicitud(s.id);
    if (r.ok) { ok++; continue; }
    if (esCupo(r.detalle)) {
      // Se agotó el cupo del día: todos los validados que faltan quedan en cola y salen solos después.
      const q = await prisma.solicitudCertificado.updateMany({ where: { encuestaId, estado: 'validada' }, data: { detalle: EN_COLA } });
      revalidatePath(ruta(encuestaId));
      redirect(`${ruta(encuestaId)}?enviados=${ok}&intentados=${intentados}&encolados=${q.count}`);
    }
  }
  revalidatePath(ruta(encuestaId));
  redirect(`${ruta(encuestaId)}?enviados=${ok}&intentados=${intentados}`);
}

/** Intenta ahora mismo mandar lo que está en cola (lo mismo que hace solo cada hora). */
export async function reintentarCola(encuestaId: string) {
  await requireAdmin();
  const r = await procesarCola(45);
  revalidatePath(ruta(encuestaId));
  redirect(`${ruta(encuestaId)}?cola=${r.certificados + r.recordatorios}&quedan=${r.quedan}`);
}
