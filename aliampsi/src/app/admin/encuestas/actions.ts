'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { mandarCertificado } from '@/lib/certificados-envio';
import { slugify } from '@/lib/utils';
import { ESTADOS, MODOS_CERT, PLANTILLAS, codigoInsercion, modoCert, normalizarPreguntas, resultadosEnTexto, resumir, type Datos } from '@/lib/encuestas';
import { leerInscriptos } from '@/lib/inscriptos';

async function slugLibre(base: string, excepto?: string) {
  const raiz = slugify(base).slice(0, 70) || 'encuesta';
  for (let i = 1; i < 100; i++) {
    const s = i === 1 ? raiz : `${raiz}-${i}`;
    const ya = await prisma.encuesta.findUnique({ where: { slug: s }, select: { id: true } });
    if (!ya || ya.id === excepto) return s;
  }
  return `${raiz}-${Date.now()}`;
}

function revalidar(id?: string) {
  revalidatePath('/admin/encuestas');
  if (id) revalidatePath(`/admin/encuestas/${id}`);
}

export async function crearEncuesta(formData: FormData) {
  await requireAdmin();
  const p = PLANTILLAS.find((x) => x.clave === String(formData.get('plantilla'))) ?? PLANTILLAS[PLANTILLAS.length - 1];
  const base = p.crear();
  const enc = await prisma.encuesta.create({
    data: { ...base, slug: await slugLibre(base.slug), preguntas: base.preguntas as unknown as Prisma.InputJsonValue },
  });
  revalidar();
  redirect(`/admin/encuestas/${enc.id}?nueva=1`);
}

export async function guardarEncuesta(id: string, formData: FormData) {
  await requireAdmin();
  let preguntas: unknown = [];
  try { preguntas = JSON.parse(String(formData.get('preguntas') || '[]')); } catch { preguntas = []; }
  const estado = String(formData.get('estado') || 'borrador');
  const titulo = String(formData.get('titulo') || '').trim().slice(0, 200) || 'Encuesta';
  await prisma.encuesta.update({
    where: { id },
    data: {
      titulo,
      slug: await slugLibre(String(formData.get('slug') || titulo), id),
      descripcion: String(formData.get('descripcion') || '').trim().slice(0, 4000),
      gracias: String(formData.get('gracias') || '').trim().slice(0, 1000),
      estado: estado in ESTADOS ? estado : 'borrador',
      anonima: formData.get('anonima') === 'on',
      portada: String(formData.get('portada') || '').trim().slice(0, 500),
      certificado: formData.get('certificado') === 'on',
      certActividad: String(formData.get('certActividad') || '').trim().slice(0, 400),
      certDetalle: String(formData.get('certDetalle') || '').trim().slice(0, 400),
      certModo: String(formData.get('certModo')) in MODOS_CERT ? String(formData.get('certModo')) : 'manual',
      certAuto: formData.get('certModo') === 'todos',
      ...(formData.has('inscriptos') ? { inscriptos: leerInscriptos(String(formData.get('inscriptos') || '')) as unknown as Prisma.InputJsonValue } : {}),
      codigoAcceso: String(formData.get('codigoAcceso') || '').trim().toUpperCase().slice(0, 40),
      preguntas: normalizarPreguntas(preguntas) as unknown as Prisma.InputJsonValue,
    },
  });
  revalidar(id);
  redirect(`/admin/encuestas/${id}?ok=1`);
}

export async function cambiarEstado(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const estado = String(formData.get('estado'));
  if (!(estado in ESTADOS)) return;
  const enc = await prisma.encuesta.findUnique({ where: { id }, include: { _count: { select: { respuestas: true } } } });
  if (!enc) return;
  let slug = enc.slug;
  // Al publicar: si la dirección quedó con un sufijo (-2, -3…) y la limpia está libre, se usa la limpia.
  const limpia = slug.replace(/-\d+$/, '');
  if (estado === 'abierta' && limpia !== slug && enc._count.respuestas === 0) {
    const ocupada = await prisma.encuesta.findUnique({ where: { slug: limpia }, select: { id: true } });
    if (!ocupada) slug = limpia;
  }
  await prisma.encuesta.update({ where: { id }, data: { estado, slug } });
  revalidar(id);
  revalidatePath(`/admin/encuestas/${id}/resultados`);
}

export async function eliminarEncuesta(formData: FormData) {
  await requireAdmin();
  await prisma.encuesta.delete({ where: { id: String(formData.get('id')) } });
  revalidar();
  redirect('/admin/encuestas');
}

/**
 * Análisis de los resultados con Claude. Se envían solo los números y los textos
 * libres, sin datos de quién respondió. Necesita ANTHROPIC_API_KEY en Vercel;
 * el modelo se puede cambiar con ANTHROPIC_MODEL sin tocar el código.
 */
export async function analizarConClaude(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const enfoque = String(formData.get('enfoque') || '').trim().slice(0, 600);
  const enc = await prisma.encuesta.findUnique({ where: { id }, include: { respuestas: { select: { datos: true } } } });
  if (!enc) redirect('/admin/encuestas');
  const clave = process.env.ANTHROPIC_API_KEY;
  if (!clave) redirect(`/admin/encuestas/${id}/resultados?ia=sin-clave`);
  if (enc.respuestas.length === 0) redirect(`/admin/encuestas/${id}/resultados?ia=sin-respuestas`);

  const resumen = resumir(normalizarPreguntas(enc.preguntas), enc.respuestas.map((r) => r.datos as Datos));
  const datos = resultadosEnTexto(enc.titulo, enc.respuestas.length, resumen);
  const pedido = `Sos analista de la Alianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines (AL·IAM·PSI). Analizá los resultados de esta encuesta de satisfacción y escribí un informe en español, claro y sobrio, para la Comisión Directiva.

Estructura (con títulos en markdown, ##):
1. Resumen ejecutivo: 3 a 5 frases con lo principal y los números clave.
2. Quiénes respondieron: perfil de la audiencia.
3. Lo mejor valorado y lo más débil, con cifras.
4. Qué dicen las respuestas abiertas: temas recurrentes, con citas breves y textuales cuando ayuden.
5. Recomendaciones concretas para las próximas actividades, priorizadas.

Reglas: basate solo en los datos; no inventes cifras. Si hay pocas respuestas, decilo y tomá las conclusiones como indicios. Indicá el NPS si existe y qué significa.${enfoque ? `\n\nAdemás, prestá especial atención a esto: ${enfoque}` : ''}

DATOS:
${datos}`;

  let texto = '';
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': clave, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 6000, thinking: { type: 'disabled' }, messages: [{ role: 'user', content: pedido }] }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || `HTTP ${r.status}`);
    texto = (j.content || []).filter((c: { type: string }) => c.type === 'text').map((c: { text: string }) => c.text).join('\n').trim();
    // Si la respuesta vino sin texto (por ejemplo, cortada antes de escribir), se informa en vez de guardar un informe vacío.
    if (!texto) throw new Error(`Claude respondió sin texto (motivo: ${j.stop_reason || 'desconocido'}; bloques: ${(j.content || []).map((c: { type: string }) => c.type).join(', ') || 'ninguno'}). Probá de nuevo.`);
  } catch (e) {
    const msg = encodeURIComponent(String((e as Error).message || e).slice(0, 200));
    redirect(`/admin/encuestas/${id}/resultados?ia=error&detalle=${msg}`);
  }
  await prisma.encuesta.update({ where: { id }, data: { analisis: texto, analisisEn: new Date() } });
  revalidatePath(`/admin/encuestas/${id}/resultados`);
  redirect(`/admin/encuestas/${id}/resultados?ia=ok#analisis`);
}

/** Reemplaza las preguntas de una encuesta por las de una plantilla (los demás datos no cambian). */
export async function cargarPlantilla(id: string, formData: FormData) {
  await requireAdmin();
  const p = PLANTILLAS.find((x) => x.clave === String(formData.get('plantilla')));
  if (!p) redirect(`/admin/encuestas/${id}`);
  await prisma.encuesta.update({ where: { id }, data: { preguntas: p.crear().preguntas as unknown as Prisma.InputJsonValue } });
  revalidar(id);
  redirect(`/admin/encuestas/${id}?plantilla=1`);
}

/** Manda un certificado de muestra al correo de quien está en el panel, para comprobar que el envío funciona. */
export async function enviarPrueba(id: string) {
  const yo = await requireAdmin();
  const enc = await prisma.encuesta.findUnique({ where: { id } });
  if (!enc) redirect('/admin/encuestas');
  const r = await mandarCertificado(enc, yo.name || 'Nombre de prueba', yo.email);
  redirect(`/admin/encuestas/${id}?prueba=${r.ok ? 'ok' : 'error'}&detalle=${encodeURIComponent(r.ok ? yo.email : r.detalle)}`);
}

/** Crea una noticia en borrador con la encuesta ya insertada, y abre su editor. */
export async function crearNoticiaConEncuesta(id: string) {
  await requireAdmin();
  const enc = await prisma.encuesta.findUnique({ where: { id } });
  if (!enc) redirect('/admin/encuestas');
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const titulo = enc.titulo.replace(/^Encuesta an[oó]nima de satisfacci[oó]n/i, 'Encuesta de satisfacción');
  const actividad = enc.certActividad || 'nuestra última actividad';
  const intro = `Le invitamos a completar la encuesta de satisfacción de ${actividad}. Su opinión nos ayuda a mejorar las próximas actividades de la Alianza.${enc.codigoAcceso ? ' Para responderla, necesitará el código de acceso que le enviamos por correo.' : ''}${enc.certificado ? (modoCert(enc) === 'inscriptos' ? ' Al finalizar, puede solicitar su certificado de asistencia: si usa el mismo nombre y correo con los que se inscribió, le llegará automáticamente por correo.' : ' Al finalizar, puede solicitar su certificado de asistencia.') : ''}`;
  const base = slugify(titulo).slice(0, 80) || 'encuesta';
  let slug = base;
  for (let i = 2; await prisma.noticia.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`;
  const n = await prisma.noticia.create({
    data: {
      title: titulo, slug,
      excerpt: enc.certificado ? 'Complete la encuesta y, si lo desea, solicite su certificado de asistencia.' : 'Su opinión nos ayuda a mejorar las próximas actividades.',
      content: `<p>${esc(intro)}</p><p>${codigoInsercion(enc.slug)}</p>`,
      coverImage: enc.portada || null,
      published: false,
    },
  });
  revalidatePath('/admin/noticias');
  redirect(`/admin/noticias/${n.id}`);
}
