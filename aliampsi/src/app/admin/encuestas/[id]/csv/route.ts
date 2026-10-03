import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { normalizarPreguntas, preguntasQueSeResponden, type Datos } from '@/lib/encuestas';
const slugToFile = (s: string) => `encuesta-${s}-${new Date().toISOString().slice(0, 10)}`;

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const enc = await prisma.encuesta.findUnique({ where: { id: params.id }, include: { respuestas: { orderBy: { createdAt: 'asc' } } } });
  if (!enc) return new Response('No existe', { status: 404 });
  const ps = preguntasQueSeResponden(normalizarPreguntas(enc.preguntas));
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  const filas = [['Fecha', ...ps.map((p) => p.texto)].map(esc).join(';')];
  for (const r of enc.respuestas) {
    const d = r.datos as Datos;
    filas.push([r.createdAt.toISOString().slice(0, 16).replace('T', ' '), ...ps.map((p) => { const v = d[p.id]; return Array.isArray(v) ? v.join(' | ') : v ?? ''; })].map(esc).join(';'));
  }
  // BOM + punto y coma: Excel en español lo abre bien con tildes y en columnas.
  return new Response('\uFEFF' + filas.join('\r\n'), {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${slugToFile(enc.slug)}.csv"` },
  });
}
