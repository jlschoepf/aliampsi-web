// Envío de avisos por correo cuando llega contenido nuevo desde el formulario público.
// Usa Resend si hay una clave configurada (RESEND_API_KEY); si no, usa FormSubmit
// (servicio gratuito, el mismo que ya usa el formulario de contacto del sitio).

type EnvioAviso = {
  tipo: string;
  title: string;
  orgName: string;
  contactName: string;
  contactEmail: string;
  summary: string;
};

const TIPO_LABEL: Record<string, string> = {
  noticia: 'Noticia',
  congreso: 'Congreso',
  publicacion: 'Publicación',
};

export async function notificarEnvio(to: string, envio: EnvioAviso, adminUrl: string): Promise<void> {
  if (!to) return;

  const tipo = TIPO_LABEL[envio.tipo] || envio.tipo;
  const subject = `Nuevo envío en el sitio: ${envio.title}`;
  const lines = [
    `Llegó un nuevo contenido desde el formulario público de AL·IAM·PSI.`,
    ``,
    `Tipo: ${tipo}`,
    `Título: ${envio.title}`,
    `Institución: ${envio.orgName || '—'}`,
    `Contacto: ${envio.contactName || '—'} (${envio.contactEmail || 'sin correo'})`,
    envio.summary ? `Resumen: ${envio.summary}` : '',
    ``,
    `Revisalo en el panel: ${adminUrl}`,
  ].filter(Boolean);
  const text = lines.join('\n');

  const apiKey = process.env.RESEND_API_KEY;

  try {
    if (apiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
      return;
    }

    // Alternativa sin configuración: FormSubmit
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
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
  } catch {
    // El aviso nunca debe impedir que el envío se guarde.
  }
}
