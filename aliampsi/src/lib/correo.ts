// Envío de correos con adjunto (por ahora: certificados). Usa Resend, el servicio profesional que
// el sitio ya admite en Ajustes; también toma RESEND_API_KEY / RESEND_FROM de las variables de Vercel.
import { getSettings } from '@/lib/settings';

export type ConfigEnvio = { listo: boolean; clave: string; remitente: string; responderA: string; aviso: string };

export async function configEnvio(): Promise<ConfigEnvio> {
  const s = await getSettings();
  const clave = s.mailProvider === 'resend' && s.mailApiKey ? s.mailApiKey : process.env.RESEND_API_KEY || '';
  const remitente = (s.mailProvider === 'resend' && s.mailFrom) || process.env.RESEND_FROM || '';
  let aviso = '';
  if (!clave) aviso = 'Falta configurar Resend: en Ajustes elegí «Resend» como servicio de envío y cargá su clave.';
  else if (!remitente || /resend\.dev/i.test(remitente))
    aviso = 'El remitente no es de un dominio propio. Resend solo deja enviar a la dirección dueña de la cuenta hasta que se verifique el dominio aliampsi.com y se cargue un remitente como «AL·IAM·PSI <certificados@aliampsi.com>».';
  return { listo: !!clave, clave, remitente: remitente || 'AL·IAM·PSI <onboarding@resend.dev>', responderA: s.contactEmail || '', aviso };
}

export async function enviarConAdjunto(
  cfg: ConfigEnvio,
  m: { para: string; asunto: string; texto: string; html: string; archivo: { nombre: string; contenido: Uint8Array } }
): Promise<{ ok: boolean; detalle: string }> {
  if (!cfg.listo) return { ok: false, detalle: cfg.aviso };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.clave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: cfg.remitente, to: [m.para], subject: m.asunto, text: m.texto, html: m.html,
        reply_to: cfg.responderA || undefined,
        attachments: [{ filename: m.archivo.nombre, content: Buffer.from(m.archivo.contenido).toString('base64') }],
      }),
    });
    const cuerpo = await r.text();
    if (!r.ok) {
      let msg = cuerpo;
      try { msg = JSON.parse(cuerpo).message || cuerpo; } catch { /* texto plano */ }
      return { ok: false, detalle: `Resend respondió ${r.status}: ${String(msg).slice(0, 200)}` };
    }
    return { ok: true, detalle: 'Enviado' };
  } catch (e) {
    return { ok: false, detalle: `No se pudo conectar con Resend: ${String((e as Error).message || e).slice(0, 160)}` };
  }
}

/**
 * Envío en lote (sin adjuntos) con la API de lotes de Resend: hasta 100 correos por llamada.
 * Devuelve los correos que salieron bien y el error de los que no.
 */
export async function enviarLote(
  cfg: ConfigEnvio,
  mensajes: { para: string; asunto: string; texto: string; html: string }[]
): Promise<{ enviados: string[]; error: string }> {
  if (!cfg.listo) return { enviados: [], error: cfg.aviso };
  const enviados: string[] = [];
  for (let i = 0; i < mensajes.length; i += 100) {
    const tanda = mensajes.slice(i, i + 100);
    try {
      const r = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.clave}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(tanda.map((m) => ({ from: cfg.remitente, to: [m.para], subject: m.asunto, text: m.texto, html: m.html, reply_to: cfg.responderA || undefined }))),
      });
      if (!r.ok) {
        const t = await r.text();
        let msg = t; try { msg = JSON.parse(t).message || t; } catch { /* texto */ }
        return { enviados, error: `Resend respondió ${r.status}: ${String(msg).slice(0, 200)}` };
      }
      enviados.push(...tanda.map((m) => m.para));
    } catch (e) {
      return { enviados, error: `No se pudo conectar con Resend: ${String((e as Error).message || e).slice(0, 160)}` };
    }
  }
  return { enviados, error: '' };
}
