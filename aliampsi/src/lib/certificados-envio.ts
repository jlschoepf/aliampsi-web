// Genera el certificado de una persona y se lo envía por correo. Lo usan el envío automático
// al completar la encuesta, el botón «Enviar por correo» del panel y el envío de prueba.
import { prisma } from '@/lib/db';
import { generarCertificados } from '@/lib/certificado';
import { configEnvio, enviarConAdjunto, esCupo, EN_COLA } from '@/lib/correo';
import type { Encuesta } from '@prisma/client';

const html = (t: string) => t.split('\n\n').map((p) => `<p style="margin:0 0 14px;font:15px/1.55 Arial,sans-serif;color:#123B3C">${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`).join('');

export function textoCorreo(nombre: string, actividad: string) {
  return `Estimado/a ${nombre}:\n\nMuchas gracias por participar en ${actividad} y por completar la encuesta de satisfacción.\n\nAdjuntamos su certificado de asistencia en PDF.\n\nSi lo desea, puede compartir su certificado en sus redes sociales. Si lo publica en LinkedIn, puede mencionar a AL·IAM·PSI (linkedin.com/company/aliampsi).\n\nSaludos cordiales,\n\nAL·IAM·PSI\nAlianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines\nhttps://aliampsi.com`;
}

export async function mandarCertificado(enc: Encuesta, nombre: string, correo: string): Promise<{ ok: boolean; detalle: string }> {
  const actividad = enc.certActividad || enc.titulo;
  const pdf = await generarCertificados([nombre], { actividad, detalle: enc.certDetalle });
  const texto = textoCorreo(nombre, actividad);
  const archivo = `Certificado de asistencia - ${nombre}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w .-]/g, '').trim() + '.pdf';
  return enviarConAdjunto(await configEnvio(), {
    para: correo, asunto: 'Su certificado de asistencia · AL·IAM·PSI', texto, html: html(texto), archivo: { nombre: archivo, contenido: pdf },
  });
}

/** Envía el certificado de un pedido guardado y registra el resultado. */
export async function enviarSolicitud(id: string): Promise<{ ok: boolean; detalle: string }> {
  const s = await prisma.solicitudCertificado.findUnique({ where: { id }, include: { encuesta: true } });
  if (!s) return { ok: false, detalle: 'El pedido no existe.' };
  const r = await mandarCertificado(s.encuesta, s.nombre, s.correo);
  const hoy = new Date(); hoy.setUTCHours(0, 0, 0, 0);
  await prisma.solicitudCertificado.update({
    where: { id },
    data: r.ok ? { estado: 'enviada', enviadoEn: hoy, detalle: s.detalle.startsWith('Coincide') ? s.detalle : '' } : { detalle: esCupo(r.detalle) ? EN_COLA : `Error al enviar: ${r.detalle}` },
  });
  return r;
}
