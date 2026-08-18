'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { notificarEnvio } from '@/lib/notify';
import { registrarEstadoAviso } from '@/app/admin/ajustes/actions';
import { SITE_URL } from '@/lib/site';
import { getColaborador } from '@/lib/colaborador-auth';

export async function createEnvio(formData: FormData) {
  // Campo trampa: si viene completo, es spam automático.
  if (String(formData.get('website') || '').trim() !== '') redirect('/enviar/gracias');

  const title = String(formData.get('title') || '').trim();
  const body = String(formData.get('body') || '').trim();
  const contactEmail = String(formData.get('contactEmail') || '').trim();

  if (!title || !body || !contactEmail) redirect('/enviar?error=1');

  const tipo = String(formData.get('tipo') || 'noticia');
  const allowed = ['noticia', 'congreso', 'publicacion', 'otro'];

  const sesion = await getColaborador();

  const creado = await prisma.envio.create({
    data: {
      colaboradorId: sesion?.id ?? null,
      tipo: allowed.includes(tipo) ? tipo : 'noticia',
      tipoOtro: String(formData.get('tipoOtro') || '').trim().slice(0, 120),
      title: title.slice(0, 200),
      summary: String(formData.get('summary') || '').trim().slice(0, 400),
      body: body.slice(0, 20000),
      orgName: String(formData.get('orgName') || '').trim().slice(0, 200),
      contactName: String(formData.get('contactName') || '').trim().slice(0, 200),
      contactEmail: contactEmail.slice(0, 200),
      contactPhone: String(formData.get('contactPhone') || '').trim().slice(0, 60),
      linkUrl: String(formData.get('linkUrl') || '').trim().slice(0, 500),
      location: String(formData.get('location') || '').trim().slice(0, 200),
      eventDate: String(formData.get('eventDate') || '').trim().slice(0, 120),
      coverImage: String(formData.get('coverImage') || '') || null,
      document: String(formData.get('document') || '') || null,
      status: 'pendiente',
    },
  });

  // Aviso por correo a la casilla configurada en Ajustes (no bloquea el envío).
  try {
    const settings = await getSettings();
    const destino = settings.notifyEmail || settings.contactEmail;
    // Con Web3Forms el aviso ya lo mandó el navegador al enviar el formulario
    // (su plan gratuito no acepta envíos desde el servidor): no lo repetimos.
    const avisaElNavegador = settings.mailProvider === 'web3forms' && !!settings.mailApiKey;
    if (destino && !avisaElNavegador) {
      const r = await notificarEnvio(
        destino,
        {
          tipo: creado.tipo,
          tipoOtro: creado.tipoOtro,
          title: creado.title,
          orgName: creado.orgName,
          contactName: creado.contactName,
          contactEmail: creado.contactEmail,
          summary: creado.summary,
        },
        `${SITE_URL}/admin/envios/${creado.id}`,
        { provider: settings.mailProvider, apiKey: settings.mailApiKey, from: settings.mailFrom }
      );
      await registrarEstadoAviso(r.ok, r.detalle);
    }
  } catch {
    // Si falla el aviso, el envío igual quedó guardado.
  }

  revalidatePath('/admin/envios');
  redirect(sesion ? '/colaboradores/panel' : '/enviar/gracias');
}
