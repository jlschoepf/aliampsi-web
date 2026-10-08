// Manda los correos que quedaron en cola por falta de cupo diario. Lo llama cada hora el flujo
// «Cola de correos» de GitHub Actions (y una vez por día el cron de Vercel, como respaldo).
// Solo envía lo que ya está aprobado en el panel, así que es seguro llamarlo de más.
import { NextResponse } from 'next/server';
import { procesarCola } from '@/lib/cola-correos';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const r = await procesarCola(45);
  return NextResponse.json({ ok: true, ...r, hora: new Date().toISOString() });
}
