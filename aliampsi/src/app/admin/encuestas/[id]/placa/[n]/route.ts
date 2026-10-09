// Placas de resultados en PNG (1080×1350) para compartir por WhatsApp.
// /admin/encuestas/[id]/placa/1 → los números · /placa/2 → quiénes participaron y qué pidieron.
// Con ?descargar=1 el navegador la baja como archivo.
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { datosPlaca } from '@/lib/placa';
import { dibujarPlaca } from '@/lib/placa-imagen';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string; n: string } }) {
  await requireAdmin();
  const enc = await prisma.encuesta.findUnique({ where: { id: params.id }, include: { respuestas: { select: { datos: true } } } });
  if (!enc) return new Response('No existe la encuesta', { status: 404 });
  const d = datosPlaca(enc);
  const n = params.n === '2' ? 2 : 1;
  const img = await dibujarPlaca(d, n);
  const headers = new Headers(img.headers);
  headers.set('Cache-Control', 'no-store');
  if (new URL(req.url).searchParams.get('descargar')) {
    const nombre = `${enc.slug}-resultados-${n}.png`;
    headers.set('Content-Disposition', `attachment; filename="${nombre}"`);
  }
  return new Response(img.body, { status: 200, headers });
}
