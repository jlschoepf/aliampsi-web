import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { codigoInsercion } from '@/lib/encuestas';
import { normalizarInscriptos } from '@/lib/inscriptos';
import { configEnvio } from '@/lib/correo';
import { SITE_URL } from '@/lib/site';
import { ASUNTO_RECORDATORIO, TEXTO_RECORDATORIO, cruzar } from '@/lib/seguimiento';
import { cancelarColaRecordatorio, enviarRecordatorios } from '../../seguimiento-actions';
import { leerCola } from '@/lib/cola-correos';
import { ListaDestinatarios } from './ListaDestinatarios';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export default async function Seguimiento({ params, searchParams }: { params: { id: string }; searchParams: { enviados?: string; total?: string; prueba?: string; error?: string; ver?: string; encolados?: string } }) {
  const enc = await prisma.encuesta.findUnique({ where: { id: params.id }, include: { solicitudes: { select: { nombre: true, correo: true, estado: true } } } });
  if (!enc) notFound();
  const inscriptos = normalizarInscriptos(enc.inscriptos);
  const filas = cruzar(inscriptos, enc.solicitudes, (enc.recordatorios as Record<string, string>) || {});
  const con = filas.filter((f) => f.estado === 'con-certificado');
  const pendientes = filas.filter((f) => f.estado === 'pedido-pendiente');
  const sin = filas.filter((f) => f.estado === 'sin-pedido');
  const ver = searchParams.ver === 'pendientes' ? 'pendientes' : searchParams.ver === 'todos' ? 'todos' : 'sin';
  const lista = ver === 'pendientes' ? pendientes : ver === 'todos' ? [...sin, ...pendientes] : sin;
  const noticia = await prisma.noticia.findFirst({ where: { content: { contains: codigoInsercion(enc.slug) } }, select: { slug: true } });
  const enlace = noticia ? `${SITE_URL}/noticias/${noticia.slug}` : `${SITE_URL}/encuestas/${enc.slug}`;
  const correo = await configEnvio();
  const base = `/admin/encuestas/${enc.id}/seguimiento`;
  const cola = leerCola(enc.colaRecordatorio);
  const pct = inscriptos.length ? Math.round((con.length / inscriptos.length) * 100) : 0;

  return (
    <>
      <AdminHeader title="Inscriptos sin certificado" subtitle={enc.titulo} />
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href={`/admin/encuestas/${enc.id}`} className="btn-ghost text-sm">Editar encuesta</Link>
        <Link href={`/admin/encuestas/${enc.id}/certificados`} className="btn-ghost text-sm">Certificados</Link>
      </div>

      {searchParams.enviados && <p className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Recordatorio enviado a {searchParams.enviados} de {searchParams.total} personas.</p>}
      {searchParams.prueba && <p className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Prueba enviada a {searchParams.prueba}. Revisá cómo llega antes de mandarlo a todos.</p>}
      {searchParams.encolados && <p className="mb-4 rounded-lg bg-sand/60 px-4 py-3 text-sm font-medium text-ink">Se agotó el cupo diario de correos: {searchParams.encolados} recordatorios quedaron en cola y salen solos apenas se libere.</p>}
      {cola && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-sand/40 px-4 py-3 text-sm text-ink">
          <p><strong>{cola.correos.length} recordatorios en cola.</strong> Se mandan solos cada hora, apenas Resend libera el cupo diario (100 correos por día en el plan gratuito).</p>
          <form action={cancelarColaRecordatorio.bind(null, enc.id)}><button type="submit" className="text-xs font-medium text-coral-dark hover:underline">Cancelar los que están en cola</button></form>
        </div>
      )}
      {searchParams.error && <p className="mb-4 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">{searchParams.error}</p>}

      {inscriptos.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Esta encuesta no tiene lista de inscriptos. Cargala en «Editar encuesta» para poder hacer el seguimiento.</div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Ya tienen certificado</p><p className="mt-1 font-display text-4xl font-extrabold">{con.length}</p><p className="text-xs text-ink-muted">{pct}% de {inscriptos.length} inscriptos</p></div>
            <Link href={`${base}?ver=pendientes`} className={`card p-5 hover:border-teal-600 ${ver === 'pendientes' ? 'ring-2 ring-teal-600' : ''}`}><p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Pidieron, pendientes de validar</p><p className="mt-1 font-display text-4xl font-extrabold">{pendientes.length}</p><p className="text-xs text-ink-muted">Se resuelven en «Certificados»</p></Link>
            <Link href={base} className={`card p-5 hover:border-teal-600 ${ver === 'sin' ? 'ring-2 ring-teal-600' : ''}`}><p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Todavía no lo pidieron</p><p className="mt-1 font-display text-4xl font-extrabold text-coral-dark">{sin.length}</p><p className="text-xs text-ink-muted">No completaron la encuesta o no pidieron el certificado</p></Link>
          </div>

          <form action={enviarRecordatorios.bind(null, enc.id)} className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <input type="hidden" name="enlace" value={enlace} />
            <div className="card p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold">Destinatarios</h2>
                <div className="flex gap-3 text-sm">
                  <Link href={base} className={ver === 'sin' ? 'font-semibold text-ink' : 'text-teal-700 hover:underline'}>Sin pedido ({sin.length})</Link>
                  <Link href={`${base}?ver=todos`} className={ver === 'todos' ? 'font-semibold text-ink' : 'text-teal-700 hover:underline'}>Todos los que no lo tienen ({sin.length + pendientes.length})</Link>
                </div>
              </div>
              {lista.length === 0 ? <p className="py-8 text-center text-ink-muted">¡Nadie en esta lista! 🎉</p> : <ListaDestinatarios key={ver} filas={lista} enCola={cola?.correos ?? []} />}
            </div>

            <div className="card space-y-4 p-5">
              <h2 className="font-display text-lg font-bold">Mensaje</h2>
              <div>
                <label className="field-label" htmlFor="asunto">Asunto</label>
                <input id="asunto" name="asunto" defaultValue={ASUNTO_RECORDATORIO} className="field" />
              </div>
              <div>
                <label className="field-label" htmlFor="cuerpo">Texto</label>
                <textarea id="cuerpo" name="cuerpo" defaultValue={TEXTO_RECORDATORIO} rows={16} className="field text-sm" />
                <p className="mt-1 text-xs text-ink-muted"><code>{'{nombre}'}</code> se reemplaza por el nombre de cada persona y <code>{'{enlace}'}</code> por {enlace}. Al pie va la firma de Johann.</p>
              </div>
              <p className={`text-xs font-medium ${correo.aviso ? 'text-coral-dark' : 'text-teal-700'}`}>{correo.aviso ? `Correo: ${correo.aviso}` : `Se envía desde ${correo.remitente}`}</p>
              <div className="flex flex-wrap gap-3">
                <button type="submit" name="modo" value="prueba" className="btn-ghost">Enviarme una prueba</button>
                <button type="submit" name="modo" value="enviar" className="btn-coral">Enviar a los marcados</button>
              </div>
              <p className="text-xs text-ink-muted">Cada persona recibe su propio correo (nadie ve a los demás). Queda registrado a quién se le mandó, para no repetirlo.</p>
            </div>
          </form>
        </>
      )}
    </>
  );
}
