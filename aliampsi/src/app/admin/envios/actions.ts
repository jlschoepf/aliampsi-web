'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

function revalidate() {
  revalidatePath('/admin/envios');
  revalidatePath('/admin');
}

// Convierte texto plano en HTML simple (un párrafo por línea).
function toHtml(text: string): string {
  return text
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('');
}

export async function approveEnvio(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const e = await prisma.envio.findUnique({ where: { id } });
  if (!e) return;

  const html = toHtml(e.body);
  const credito = e.orgName ? `Enviado por ${e.orgName}` : '';

  if (e.tipo === 'congreso') {
    await prisma.congreso.create({
      data: {
        title: e.title,
        description: e.summary,
        body: html,
        location: e.location,
        linkUrl: e.linkUrl,
        coverImage: e.coverImage,
        document: e.document,
        author: credito,
        published: false, // queda como borrador para revisar
      },
    });
  } else if (e.tipo === 'publicacion') {
    await prisma.publicacion.create({
      data: {
        title: e.title,
        description: e.summary,
        body: html,
        kind: 'documento',
        linkUrl: e.linkUrl,
        coverImage: e.coverImage,
        document: e.document,
        author: credito,
        published: false,
      },
    });
  } else {
    // Slug único para la noticia
    const base = slugify(e.title) || 'noticia';
    let slug = base;
    let i = 2;
    while (await prisma.noticia.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    await prisma.noticia.create({
      data: {
        title: e.title,
        slug,
        excerpt: e.summary,
        content: html,
        coverImage: e.coverImage,
        document: e.document,
        sourceUrl: e.linkUrl,
        author: credito,
        published: false,
      },
    });
  }

  await prisma.envio.update({ where: { id }, data: { status: 'aprobado' } });
  revalidate();
  redirect('/admin/envios');
}

export async function rejectEnvio(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  await prisma.envio.update({
    where: { id },
    data: { status: 'rechazado', adminNote: String(formData.get('adminNote') || '') },
  });
  revalidate();
  redirect('/admin/envios');
}

export async function reopenEnvio(formData: FormData) {
  await requireAdmin();
  await prisma.envio.update({ where: { id: String(formData.get('id')) }, data: { status: 'pendiente' } });
  revalidate();
}

export async function deleteEnvio(formData: FormData) {
  await requireAdmin();
  await prisma.envio.delete({ where: { id: String(formData.get('id')) } });
  revalidate();
}
