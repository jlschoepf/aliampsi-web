import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Lista de encuestas para el selector del editor de contenido (solo administradores). */
export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 });
  const encuestas = await prisma.encuesta.findMany({ orderBy: { createdAt: 'desc' }, select: { slug: true, titulo: true, estado: true } });
  return NextResponse.json(encuestas);
}
