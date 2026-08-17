'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';

export async function createEnvio(formData: FormData) {
  // Campo trampa: si viene completo, es spam automático.
  if (String(formData.get('website') || '').trim() !== '') redirect('/enviar/gracias');

  const title = String(formData.get('title') || '').trim();
  const body = String(formData.get('body') || '').trim();
  const contactEmail = String(formData.get('contactEmail') || '').trim();

  if (!title || !body || !contactEmail) redirect('/enviar?error=1');

  const tipo = String(formData.get('tipo') || 'noticia');
  const allowed = ['noticia', 'congreso', 'publicacion'];

  await prisma.envio.create({
    data: {
      tipo: allowed.includes(tipo) ? tipo : 'noticia',
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

  revalidatePath('/admin/envios');
  redirect('/enviar/gracias');
}
