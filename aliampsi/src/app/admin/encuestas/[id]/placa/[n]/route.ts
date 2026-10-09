// Placas de resultados en PNG (1080×1350) para compartir por WhatsApp.
// /admin/encuestas/[id]/placa/1 → los números · /placa/2 → quiénes participaron y qué pidieron · /placa/3 → temas que quieren tratar.
// /placa/x-<id> → gráficas adicionales creadas desde el panel. Con ?descargar=1 el navegador la baja como archivo.
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { datosExtra, datosPlaca, leerExtras, leerTextos } from '@/lib/placa';
import { dibujarExtra, dibujarPlaca } from '@/lib/placa-imagen';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string; n: string } }) {
  await requireAdmin();
  const enc = await prisma.encuesta.findUnique({ where: { id: params.id }, include: { respuestas: { select: { datos: true } } } });
  if (!enc) return new Response('No existe la encuesta', { status: 404 });
  let img: Response;
  let n: string;
  if (params.n.startsWith('x-')) {
    const extra = leerExtras(leerTextos(enc.analisisPlaca)).find((e) => e.id === params.n.slice(2));
    if (!extra) return new Response('No existe esa gráfica', { status: 404 });
    img = await dibujarExtra(datosExtra(enc, extra));
    n = extra.id;
  } else {
    const k = params.n === '3' ? 3 : params.n === '2' ? 2 : 1;
    img = await dibujarPlaca(datosPlaca(enc), k);
    n = String(k);
  }
  const headers = new Headers(img.headers);
  headers.set('Cache-Control', 'no-store');
  if (new URL(req.url).searchParams.get('descargar')) {
    const nombre = `${enc.slug}-resultados-${n}.png`;
    headers.set('Content-Disposition', `attachment; filename="${nombre}"`);
  }
  return new Response(img.body, { status: 200, headers });
}
