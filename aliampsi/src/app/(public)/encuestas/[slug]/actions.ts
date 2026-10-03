'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { leerRespuestas, normalizarPreguntas } from '@/lib/encuestas';

export async function enviarRespuesta(slug: string, formData: FormData) {
  // Trampa para robots: un campo invisible que una persona nunca completa.
  if (String(formData.get('website') || '').trim() !== '') redirect(`/encuestas/${slug}/gracias`);

  const enc = await prisma.encuesta.findUnique({ where: { slug } });
  if (!enc || enc.estado !== 'abierta') redirect(`/encuestas/${slug}`);

  const { datos, faltan } = leerRespuestas(normalizarPreguntas(enc.preguntas), formData);
  if (faltan.length) redirect(`/encuestas/${slug}?error=1`);

  // Pedido de certificado (opcional): se valida antes de guardar nada.
  const pide = enc.certificado && formData.get('cert_quiero') === 'on';
  const nombre = String(formData.get('cert_nombre') || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  const correo = String(formData.get('cert_correo') || '').trim().toLowerCase().slice(0, 160);
  if (pide && (nombre.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo))) redirect(`/encuestas/${slug}?error=cert`);

  await prisma.respuestaEncuesta.create({ data: { encuestaId: enc.id, datos: datos as Prisma.InputJsonValue } });
  if (pide) {
    // Sin vínculo con la respuesta y solo con el día: no permite saber qué contestó cada persona.
    const hoy = new Date(); hoy.setUTCHours(0, 0, 0, 0);
    await prisma.solicitudCertificado.create({ data: { encuestaId: enc.id, nombre, correo, fecha: hoy } });
  }
  // Marca suave para no pedir la encuesta dos veces en el mismo dispositivo. No identifica a nadie.
  cookies().set(`enc_${enc.id}`, '1', { maxAge: 60 * 60 * 24 * 180, httpOnly: true, sameSite: 'lax', path: '/' });
  redirect(`/encuestas/${slug}/gracias${pide ? '?cert=1' : ''}`);
}
