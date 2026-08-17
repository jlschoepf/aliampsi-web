import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Registra si el aviso enviado desde el navegador salió bien o falló.
export async function POST(request: Request) {
  try {
    const { ok, detalle } = (await request.json()) as { ok?: boolean; detalle?: string };
    const estado = `${ok ? 'ok' : 'error'}|${String(detalle || '').slice(0, 400)}`;
    await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: { notifyStatus: estado, notifyAt: new Date() },
      create: { id: 'singleton', notifyStatus: estado, notifyAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
