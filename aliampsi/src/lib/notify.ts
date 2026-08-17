// Envío de avisos por correo cuando llega contenido nuevo desde el formulario público.
// Usa Resend si hay clave configurada (RESEND_API_KEY); si no, FormSubmit (gratuito).
// Siempre devuelve un resultado para poder mostrarlo en el panel.

export type EnvioAviso = {
  tipo: string;
  tipoOtro?: string;
  title: string;
  orgName: string;
  contactName: string;
  contactEmail: string;
  summary: string;
};

export type ResultadoAviso = {
  ok: boolean;
  proveedor: 'resend' | 'formsubmit';
  detalle: string;
};

const TIPO_LABEL: Record<string, string> = {
  noticia: 'Noticia',
  congreso: 'Congreso',
  publicacion: 'Publicación',
  otro: 'Otro',
};

function esCorreoValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function notificarEnvio(
  to: string,
  envio: EnvioAviso,
  adminUrl: string
): Promise<ResultadoAviso> {
  const proveedor: 'resend' | 'formsubmit' = process.env.RESEND_API_KEY ? 'resend' : 'formsubmit';

  if (!to) return { ok: false, proveedor, detalle: 'No hay un correo configurado para avisos.' };
  if (!esCorreoValido(to)) return { ok: false, proveedor, detalle: `La dirección «${to}» no parece válida.` };

  const base = TIPO_LABEL[envio.tipo] || envio.tipo;
  const tipo = envio.tipo === 'otro' && envio.tipoOtro ? `${base} — ${envio.tipoOtro}` : base;
  const subject = `Nuevo envío en el sitio: ${envio.title}`;
  const text = [
    'Llegó un nuevo contenido desde el formulario público de AL·IAM·PSI.',
    '',
    `Tipo: ${tipo}`,
    `Título: ${envio.title}`,
    `Institución: ${envio.orgName || '—'}`,
    `Contacto: ${envio.contactName || '—'} (${envio.contactEmail || 'sin correo'})`,
    envio.summary ? `Resumen: ${envio.summary}` : '',
    '',
    `Revisalo en el panel: ${adminUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    if (proveedor === 'resend') {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'AL·IAM·PSI <onboarding@resend.dev>',
          to: [to],
          subject,
          text,
          reply_to: envio.contactEmail || undefined,
        }),
      });
      const cuerpo = await r.text();
      if (r.ok) return { ok: true, proveedor, detalle: 'Correo entregado a Resend para su envío.' };
      return { ok: false, proveedor, detalle: `Resend respondió ${r.status}: ${cuerpo.slice(0, 300)}` };
    }

    const r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        Tipo: tipo,
        Titulo: envio.title,
        Institucion: envio.orgName || '—',
        Contacto: `${envio.contactName || '—'} (${envio.contactEmail || 'sin correo'})`,
        Resumen: envio.summary || '—',
        Revisar: adminUrl,
      }),
    });

    const cuerpo = await r.text();
    const texto = cuerpo.toLowerCase();

    if (!r.ok) {
      return { ok: false, proveedor, detalle: `FormSubmit respondió ${r.status}: ${cuerpo.slice(0, 300)}` };
    }
    if (texto.includes('confirm') || texto.includes('activat')) {
      return {
        ok: false,
        proveedor,
        detalle:
          'FormSubmit envió un correo de ACTIVACIÓN a esa casilla. Abrilo, confirmá (mirá también spam) y volvé a probar.',
      };
    }
    if (texto.includes('success')) {
      return { ok: true, proveedor, detalle: 'Correo enviado correctamente.' };
    }
    return { ok: false, proveedor, detalle: `Respuesta inesperada: ${cuerpo.slice(0, 300)}` };
  } catch (e) {
    return { ok: false, proveedor, detalle: `No se pudo conectar con el servicio de correo: ${(e as Error).message}` };
  }
}
