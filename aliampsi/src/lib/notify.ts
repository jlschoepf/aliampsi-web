// Aviso por correo cuando llega contenido nuevo desde el formulario público.
// Proveedores soportados (se eligen desde Ajustes):
//  - web3forms: gratuito, solo requiere una clave de acceso que llega por correo.
//  - resend:    servicio profesional, requiere cuenta y clave API.
//  - formsubmit: alternativa sin clave (poco confiable desde servidores: suele bloquear).

export type EnvioAviso = {
  tipo: string;
  tipoOtro?: string;
  title: string;
  orgName: string;
  contactName: string;
  contactEmail: string;
  summary: string;
};

export type ConfigCorreo = {
  provider: string;
  apiKey: string;
  from: string;
};

export type ResultadoAviso = { ok: boolean; proveedor: string; detalle: string };

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
  adminUrl: string,
  config: ConfigCorreo
): Promise<ResultadoAviso> {
  const apiKey = config.apiKey || process.env.RESEND_API_KEY || '';
  const provider = config.apiKey ? config.provider : process.env.RESEND_API_KEY ? 'resend' : 'formsubmit';

  if (!to) return { ok: false, proveedor: provider, detalle: 'No hay un correo configurado para avisos.' };
  if (!esCorreoValido(to))
    return { ok: false, proveedor: provider, detalle: `La dirección «${to}» no parece válida.` };

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
    if (provider === 'resend') {
      if (!apiKey) return { ok: false, proveedor: provider, detalle: 'Falta la clave de Resend.' };
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: config.from || process.env.RESEND_FROM || 'AL·IAM·PSI <onboarding@resend.dev>',
          to: [to],
          subject,
          text,
          reply_to: envio.contactEmail || undefined,
        }),
      });
      const cuerpo = await r.text();
      if (r.ok) return { ok: true, proveedor: provider, detalle: 'Correo enviado con Resend.' };
      return { ok: false, proveedor: provider, detalle: `Resend respondió ${r.status}: ${cuerpo.slice(0, 250)}` };
    }

    if (provider === 'web3forms') {
      if (!apiKey)
        return {
          ok: false,
          proveedor: provider,
          detalle: 'Falta la clave de acceso de Web3Forms. Pedila gratis en web3forms.com y pegala en Ajustes.',
        };
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: apiKey,
          subject,
          from_name: 'Sitio AL·IAM·PSI',
          email: envio.contactEmail || undefined,
          message: text,
        }),
      });
      const data = (await r.json().catch(() => null)) as { success?: boolean; message?: string } | null;
      if (r.ok && data?.success) return { ok: true, proveedor: provider, detalle: 'Correo enviado con Web3Forms.' };
      return {
        ok: false,
        proveedor: provider,
        detalle: `Web3Forms respondió ${r.status}: ${data?.message || 'sin detalle'}`,
      };
    }

    // FormSubmit (sin clave). Suele bloquearse desde servidores.
    const r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: subject, Mensaje: text }),
    });
    const cuerpo = await r.text();
    if (r.status === 403 || cuerpo.includes('Just a moment')) {
      return {
        ok: false,
        proveedor: 'formsubmit',
        detalle:
          'FormSubmit bloquea los envíos hechos desde el servidor (protección Cloudflare). Elegí Web3Forms o Resend en Ajustes.',
      };
    }
    if (r.ok && cuerpo.toLowerCase().includes('success'))
      return { ok: true, proveedor: 'formsubmit', detalle: 'Correo enviado.' };
    return { ok: false, proveedor: 'formsubmit', detalle: `Respuesta ${r.status}: ${cuerpo.slice(0, 250)}` };
  } catch (e) {
    return { ok: false, proveedor: provider, detalle: `No se pudo conectar: ${(e as Error).message}` };
  }
}

/** Envío genérico de un correo a cualquier destinatario (requiere Resend). */
export async function enviarCorreo(
  to: string,
  subject: string,
  text: string,
  config: ConfigCorreo
): Promise<ResultadoAviso> {
  const apiKey = config.apiKey || process.env.RESEND_API_KEY || '';
  const usaResend = (config.provider === 'resend' && config.apiKey) || !!process.env.RESEND_API_KEY;

  if (!esCorreoValido(to)) {
    return { ok: false, proveedor: 'resend', detalle: `La dirección «${to}» no parece válida.` };
  }
  if (!usaResend) {
    return {
      ok: false,
      proveedor: config.provider,
      detalle:
        'Para enviar correos a los colaboradores hace falta Resend. Con Web3Forms solo se puede avisar a la casilla propia.',
    };
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: config.from || process.env.RESEND_FROM || 'AL·IAM·PSI <onboarding@resend.dev>',
        to: [to],
        subject,
        text,
      }),
    });
    const cuerpo = await r.text();
    if (r.ok) return { ok: true, proveedor: 'resend', detalle: 'Correo enviado.' };
    return { ok: false, proveedor: 'resend', detalle: `Resend respondió ${r.status}: ${cuerpo.slice(0, 250)}` };
  } catch (e) {
    return { ok: false, proveedor: 'resend', detalle: `No se pudo conectar: ${(e as Error).message}` };
  }
}
