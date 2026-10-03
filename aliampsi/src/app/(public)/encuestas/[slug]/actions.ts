'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { leerRespuestas, normalizarPreguntas } from '@/lib/encuestas';
import { enviarSolicitud } from '@/lib/certificados-envio';

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
  let resultado = '';
  if (pide) {
    // Si ya se le envió el certificado de esta encuesta, no se repite (evita duplicados y abusos).
    const yaEnviado = await prisma.solicitudCertificado.findFirst({ where: { encuestaId: enc.id, correo, estado: 'enviada' }, select: { id: true } });
    if (yaEnviado) resultado = 'ya';
    else {
      // Sin vínculo con la respuesta y solo con el día: no permite saber qué contestó cada persona.
      const hoy = new Date(); hoy.setUTCHours(0, 0, 0, 0);
      const sol = await prisma.solicitudCertificado.create({ data: { encuestaId: enc.id, nombre, correo, fecha: hoy } });
      resultado = '1';
      if (enc.certAuto) {
        try { resultado = (await enviarSolicitud(sol.id)).ok ? 'enviado' : '1'; } catch { resultado = '1'; }
      }
    }
  }
  // Marca suave para no pedir la encuesta dos veces en el mismo dispositivo. No identifica a nadie.
  cookies().set(`enc_${enc.id}`, '1', { maxAge: 60 * 60 * 24 * 180, httpOnly: true, sameSite: 'lax', path: '/' });
  redirect(`/encuestas/${slug}/gracias${resultado ? `?cert=${resultado}` : ''}`);
}
