import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { generarCertificados } from '@/lib/certificado';

export const dynamic = 'force-dynamic';

// ?sid=… → certificado de una persona · ?estado=validada → todos los de ese estado en un solo PDF
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const url = new URL(req.url);
  const sid = url.searchParams.get('sid');
  const estado = url.searchParams.get('estado');
  const enc = await prisma.encuesta.findUnique({ where: { id: params.id } });
  if (!enc) return new Response('No existe', { status: 404 });
  const solicitudes = await prisma.solicitudCertificado.findMany({
    where: { encuestaId: enc.id, ...(sid ? { id: sid } : { estado: estado || 'validada' }) },
    orderBy: { nombre: 'asc' },
  });
  if (!solicitudes.length) return new Response('No hay certificados para generar.', { status: 404 });
  const pdf = await generarCertificados(solicitudes.map((s) => s.nombre), {
    actividad: enc.certActividad || enc.titulo,
    detalle: enc.certDetalle,
  });
  const base = sid ? `Certificado - ${solicitudes[0].nombre}` : `Certificados - ${enc.slug} - ${estado || 'validada'}`;
  const archivo = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w .-]/g, '').trim();
  return new Response(Buffer.from(pdf), {
    headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${archivo}.pdf"` },
  });
}
