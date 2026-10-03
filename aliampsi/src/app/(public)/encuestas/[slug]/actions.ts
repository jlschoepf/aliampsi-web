'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { leerRespuestas, modoCert, normalizarPreguntas } from '@/lib/encuestas';
import { coincide, normalizarInscriptos } from '@/lib/inscriptos';
import { enviarSolicitud } from '@/lib/certificados-envio';
import { cookieAcceso, firmaAcceso, normalizarCodigo } from '@/lib/acceso';

export async function enviarRespuesta(slug: string, formData: FormData) {
  // Trampa para robots: un campo invisible que una persona nunca completa.
  if (String(formData.get('website') || '').trim() !== '') redirect(`/encuestas/${slug}/gracias`);

  const enc = await prisma.encuesta.findUnique({ where: { slug } });
  if (!enc || enc.estado !== 'abierta') redirect(`/encuestas/${slug}`);
  // Con código de acceso, solo se aceptan respuestas de quien lo ingresó.
  if (enc.codigoAcceso && cookies().get(cookieAcceso(enc.id))?.value !== firmaAcceso(enc.id, enc.codigoAcceso)) redirect(`/encuestas/${slug}`);

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
      const modo = modoCert(enc);
      const match = modo === 'inscriptos' ? coincide(nombre, correo, normalizarInscriptos(enc.inscriptos)) : null;
      const automatico = modo === 'todos' || !!match;
      const sol = await prisma.solicitudCertificado.create({
        data: {
          encuestaId: enc.id, nombre, correo, fecha: hoy,
          estado: automatico ? 'validada' : 'pendiente',
          detalle: match ? `Coincide con la inscripción (por ${match})` : modo === 'inscriptos' ? 'No coincide con la lista de inscriptos: validar a mano' : '',
        },
      });
      resultado = modo === 'inscriptos' && !match ? 'revision' : '1';
      if (automatico) {
        try { if ((await enviarSolicitud(sol.id)).ok) resultado = 'enviado'; } catch { /* queda validado para reenviar desde el panel */ }
      }
    }
  }
  // Marca suave para no pedir la encuesta dos veces en el mismo dispositivo. No identifica a nadie.
  cookies().set(`enc_${enc.id}`, '1', { maxAge: 60 * 60 * 24 * 180, httpOnly: true, sameSite: 'lax', path: '/' });
  redirect(`/encuestas/${slug}/gracias${resultado ? `?cert=${resultado}` : ''}`);
}

/** Verifica el código de acceso. Si es correcto, lo recuerda en el dispositivo y vuelve a la página. */
export async function verificarCodigo(slug: string, volver: string, _prev: { error: string }, formData: FormData): Promise<{ error: string }> {
  const enc = await prisma.encuesta.findUnique({ where: { slug }, select: { id: true, codigoAcceso: true } });
  if (!enc) return { error: 'La encuesta no existe.' };
  const ingresado = String(formData.get('codigo') || '');
  if (!enc.codigoAcceso || normalizarCodigo(ingresado) !== normalizarCodigo(enc.codigoAcceso)) {
    await new Promise((r) => setTimeout(r, 700)); // frena los intentos al azar
    return { error: 'El código no es correcto. Revíselo en el correo que recibió.' };
  }
  cookies().set(cookieAcceso(enc.id), firmaAcceso(enc.id, enc.codigoAcceso), { maxAge: 60 * 60 * 24 * 60, httpOnly: true, sameSite: 'lax', path: '/' });
  redirect(volver.startsWith('/') ? volver : `/encuestas/${slug}`);
}
