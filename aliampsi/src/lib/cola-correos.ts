// Cola de correos que no salieron porque se agotó el cupo diario de Resend (100 por día en el plan
// gratuito). Los certificados quedan marcados «En cola» y los recordatorios se guardan en la encuesta;
// /api/cron/correos los manda solos, cada hora, apenas Resend vuelve a aceptar envíos.
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { configEnvio, enviarLote, esCupo, EN_COLA } from '@/lib/correo';
import { FIRMA_JOHANN, firmaHtml } from '@/lib/firma';
import { normalizarInscriptos } from '@/lib/inscriptos';
import { personalizar, textoAHtml } from '@/lib/seguimiento';
import { enviarSolicitud } from '@/lib/certificados-envio';

export { esCupo, EN_COLA };
const ENVIANDO = 'Enviando…';

/** ¿Este pedido validado espera en la cola? (incluye los errores de cupo anteriores a la cola). */
export const enCola = (detalle: string) =>
  detalle.startsWith('En cola') || detalle === ENVIANDO || (detalle.startsWith('Error al enviar') && esCupo(detalle));

export type ColaRecordatorio = { asunto: string; cuerpo: string; enlace: string; correos: string[] };
export const leerCola = (v: unknown): ColaRecordatorio | null => {
  const c = v as Partial<ColaRecordatorio> | null;
  return c && Array.isArray(c.correos) && c.correos.length && c.asunto && c.cuerpo
    ? { asunto: c.asunto, cuerpo: c.cuerpo, enlace: c.enlace || '', correos: c.correos }
    : null;
};

const firmaTexto = `\n\n${FIRMA_JOHANN.nombre}\n${FIRMA_JOHANN.cargo}\naliampsi.com · linkedin.com/company/aliampsi`;

/** Arma el recordatorio personalizado para una persona (lo usan el panel y la cola). */
export function armarRecordatorio(asunto: string, cuerpo: string, nombre: string, enlace: string, para: string) {
  const t = personalizar(cuerpo, nombre, enlace);
  return { para, asunto: personalizar(asunto, nombre, enlace), texto: t + firmaTexto, html: textoAHtml(t, firmaHtml(FIRMA_JOHANN)) };
}

export type ResultadoCola = { certificados: number; recordatorios: number; quedan: number; cupoAgotado: boolean };

/** Manda lo que esté en cola hasta agotar el tiempo o el cupo. Seguro de llamar varias veces. */
export async function procesarCola(segundos = 45): Promise<ResultadoCola> {
  const hasta = Date.now() + segundos * 1000;
  const res: ResultadoCola = { certificados: 0, recordatorios: 0, quedan: 0, cupoAgotado: false };

  // 1. Certificados: de a uno (llevan el PDF adjunto), los más viejos primero.
  const pendientes = (await prisma.solicitudCertificado.findMany({
    where: { estado: 'validada', OR: [{ detalle: { startsWith: 'En cola' } }, { detalle: ENVIANDO }, { detalle: { startsWith: 'Error al enviar' } }] },
    select: { id: true, detalle: true },
    orderBy: { fecha: 'asc' },
  })).filter((s) => enCola(s.detalle));
  for (const s of pendientes) {
    if (res.cupoAgotado || Date.now() > hasta) break;
    // Se reserva el pedido antes de mandarlo, para que dos ejecuciones simultáneas no lo dupliquen.
    const tomado = await prisma.solicitudCertificado.updateMany({ where: { id: s.id, estado: 'validada', detalle: s.detalle }, data: { detalle: ENVIANDO } });
    if (!tomado.count) continue;
    const r = await enviarSolicitud(s.id);
    if (r.ok) res.certificados++;
    else if (esCupo(r.detalle)) res.cupoAgotado = true;
  }

  // 2. Recordatorios: en tandas chicas, para aprovechar el cupo que quede sin pasarse.
  const encuestas = await prisma.encuesta.findMany({ select: { id: true, inscriptos: true, recordatorios: true, colaRecordatorio: true } });
  for (const enc of encuestas) {
    let cola: ColaRecordatorio | null = leerCola(enc.colaRecordatorio);
    if (!cola) continue;
    const inscriptos = new Map(normalizarInscriptos(enc.inscriptos).filter((i) => i.correo).map((i) => [i.correo, i.nombre]));
    const reg = { ...((enc.recordatorios as Record<string, string>) || {}) };
    while (cola && !res.cupoAgotado && Date.now() < hasta) {
      const tanda = cola.correos.slice(0, 10);
      const c: ColaRecordatorio = cola;
      const r = await enviarLote(await configEnvio(), tanda.map((correo) => armarRecordatorio(c.asunto, c.cuerpo, inscriptos.get(correo) || '', c.enlace, correo)));
      const hoy = new Date().toISOString();
      for (const correo of r.enviados) reg[correo] = hoy;
      res.recordatorios += r.enviados.length;
      // Un error que no es de cupo (por ejemplo, un correo inválido) saca esa tanda de la cola, para no trabarla.
      const fallida = r.error && !esCupo(r.error) ? tanda : [];
      const resto: string[] = c.correos.filter((x: string) => !r.enviados.includes(x) && !fallida.includes(x));
      cola = resto.length ? { ...c, correos: resto } : null;
      await prisma.encuesta.update({
        where: { id: enc.id },
        data: { recordatorios: reg as Prisma.InputJsonValue, colaRecordatorio: (cola ?? {}) as Prisma.InputJsonValue },
      });
      if (r.error && esCupo(r.error)) { res.cupoAgotado = true; break; }
    }
  }

  // 3. Lo que sigue esperando.
  const quedanCert = (await prisma.solicitudCertificado.findMany({ where: { estado: 'validada' }, select: { detalle: true } })).filter((s) => enCola(s.detalle)).length;
  const quedanRec = (await prisma.encuesta.findMany({ select: { colaRecordatorio: true } })).reduce((n, e) => n + (leerCola(e.colaRecordatorio)?.correos.length || 0), 0);
  res.quedan = quedanCert + quedanRec;
  return res;
}
