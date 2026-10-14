// Arma una noticia (borrador) con los resultados de una encuesta: sube las placas a Vercel Blob
// y redacta el texto con los números reales. Queda sin publicar para revisarla en el editor.
import { put } from '@vercel/blob';
import type { Encuesta } from '@prisma/client';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { coma, datosPlaca, hayTemas } from '@/lib/placa';
import { dibujarPlaca } from '@/lib/placa-imagen';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function crearNoticiaDeResultados(enc: Encuesta & { respuestas: { datos: unknown }[] }) {
  const d = datosPlaca(enc);
  const certificados = await prisma.solicitudCertificado.count({ where: { encuestaId: enc.id, estado: 'enviada' } });

  // Placas a Vercel Blob.
  const numeros: (1 | 2 | 3)[] = hayTemas(d.textos) ? [1, 2, 3] : [1, 2];
  const urls: string[] = [];
  for (const n of numeros) {
    const img = await dibujarPlaca(d, n);
    const buf = Buffer.from(await img.arrayBuffer());
    const b = await put(`noticias/resultados-${enc.slug}-${n}.png`, buf, { access: 'public', contentType: 'image/png', addRandomSuffix: true });
    urls.push(b.url);
  }

  // En medio de una frase: «el webinar «…»», no «el Webinar «…»».
  const actividad = d.actividad.replace(/^(Webinar|Curso|Taller|Jornada|Seminario|Congreso)\b/, (m) => m.toLowerCase());
  const cifras: string[] = [];
  if (d.general) cifras.push(`una satisfacción general de <strong>${coma(d.general.valor)} sobre ${d.general.maximo}</strong>`);
  if (d.nps !== null) cifras.push(`un índice de recomendación (NPS) de <strong>${d.nps > 0 ? '+' : ''}${d.nps}</strong>`);
  const temas = d.textos.temas || [];
  const valorado = d.textos.valorado || [];
  const pedidos = d.textos.pedidos || [];

  const p: string[] = [];
  p.push(`<p>Desde AL·IAM·PSI queremos agradecer a todas las personas que nos acompañaron en el ${esc(actividad)}. La participación y el interés que mostraron confirman la importancia de seguir generando espacios de formación e intercambio sobre la salud mental de niños, niñas y adolescentes en la región.</p>`);
  p.push(`<h2>Una actividad muy bien valorada</h2>`);
  p.push(`<p>Un agradecimiento especial a quienes se tomaron unos minutos para completar la encuesta de satisfacción: recibimos <strong>${d.total} respuestas</strong>${cifras.length ? `, con ${cifras.join(' y ')}` : ''}.${valorado.length ? ` Lo más valorado por quienes respondieron: ${valorado.slice(0, 3).map((v) => v.t.charAt(0).toLowerCase() + v.t.slice(1)).join(', ').replace(/, ([^,]*)$/, ' y $1')}.` : ''}</p>`);
  if (certificados > 0) p.push(`<p>Además, entregamos <strong>${certificados} certificados digitales de asistencia</strong> a quienes respondieron la encuesta. Les recordamos que pueden compartirlos en sus redes y mencionar a AL·IAM·PSI en LinkedIn.</p>`);
  if (urls[0]) p.push(`<p><img src="${urls[0]}" alt="Resultados de la encuesta: los números" /></p>`);
  p.push(`<h2>Sus respuestas, insumo para lo que viene</h2>`);
  p.push(`<p>Las opiniones recibidas son un material muy valioso para planificar las próximas actividades.${pedidos.length ? ` Entre los pedidos más repetidos aparecen ${pedidos.map((x) => x.t.charAt(0).toLowerCase() + x.t.slice(1)).join(', ').replace(/, ([^,]*)$/, ' y $1')}.` : ''}${temas.length ? ' Y nos dejaron claras las áreas temáticas que les gustaría abordar:' : ''}</p>`);
  if (temas.length) p.push(`<ul>${temas.map((t) => `<li><strong>${esc(t.t)}</strong>${t.d ? `: ${esc(t.d.charAt(0).toLowerCase() + t.d.slice(1))}` : ''}</li>`).join('')}</ul>`);
  for (const u of urls.slice(1)) p.push(`<p><img src="${u}" alt="Resultados de la encuesta" /></p>`);
  p.push(`<h2>Nos vemos en el próximo webinar</h2>`);
  p.push(`<p>Ya estamos trabajando en la próxima actividad, que anunciaremos en breve. Los invitamos a estar atentos a este sitio y a nuestra página de LinkedIn (linkedin.com/company/aliampsi) para enterarse de la fecha y la inscripción.</p>`);
  p.push(`<p>¡Gracias por ser parte de AL·IAM·PSI!</p>`);

  const title = `Gracias por participar: así vivieron el ${actividad}`.slice(0, 160);
  let slug = slugify(`resultados ${actividad}`).slice(0, 80);
  for (let i = 2; await prisma.noticia.findUnique({ where: { slug } }); i++) slug = `${slugify(`resultados ${actividad}`).slice(0, 76)}-${i}`;

  return prisma.noticia.create({
    data: {
      title,
      slug,
      excerpt: `${d.total} personas respondieron la encuesta de satisfacción${d.general ? ` y le dieron ${coma(d.general.valor)} sobre ${d.general.maximo}` : ''}. Gracias a todos los que participaron: sus respuestas ya son insumo para el próximo webinar.`,
      content: p.join('\n'),
      coverImage: urls[0] || null,
      coverFit: 'auto',
      coverEnCuerpo: false,
      tags: 'Webinar, Encuestas',
      seoTitle: `Resultados del ${actividad}`.slice(0, 70),
      seoDescription: `Resultados de la encuesta de satisfacción del ${actividad}: ${d.total} respuestas${d.general ? `, satisfacción ${coma(d.general.valor)}/${d.general.maximo}` : ''}.`.slice(0, 160),
      published: false,
    },
  });
}
