import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { ESTADOS_CERT, modoCert } from '@/lib/encuestas';
import { normalizarInscriptos } from '@/lib/inscriptos';
import { formatDate } from '@/lib/utils';
import { cambiarEstadoSolicitud, corregirNombre, eliminarSolicitud, enviarPorCorreo, enviarValidados, reintentarCola, validarConLista } from '../../certificados-actions';
import { enCola } from '@/lib/cola-correos';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const COLOR: Record<string, string> = {
  pendiente: 'bg-ink/5 text-ink-muted', validada: 'bg-teal-600/10 text-teal-700',
  rechazada: 'bg-coral/10 text-coral-dark', enviada: 'bg-ink text-paper',
};

function Boton({ id, estado, children, tono = 'ghost' }: { id: string; estado: string; children: React.ReactNode; tono?: 'ghost' | 'coral' }) {
  return (
    <form action={cambiarEstadoSolicitud}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="estado" value={estado} />
      <button type="submit" className={`${tono === 'coral' ? 'btn-coral' : 'btn-ghost'} px-3 py-1.5 text-xs`}>{children}</button>
    </form>
  );
}

export default async function Certificados({ params, searchParams }: { params: { id: string }; searchParams: { estado?: string; validadas?: string; leidos?: string; enviados?: string; intentados?: string; encolados?: string; cola?: string; quedan?: string } }) {
  const enc = await prisma.encuesta.findUnique({ where: { id: params.id }, include: { solicitudes: { orderBy: { nombre: 'asc' } } } });
  if (!enc) notFound();
  const filtro = searchParams.estado && searchParams.estado in ESTADOS_CERT ? searchParams.estado : '';
  const conteo = Object.fromEntries(Object.keys(ESTADOS_CERT).map((e) => [e, enc.solicitudes.filter((s) => s.estado === e).length]));
  const lista = filtro ? enc.solicitudes.filter((s) => s.estado === filtro) : enc.solicitudes;
  const actividad = enc.certActividad || enc.titulo;
  const asunto = `Certificado de asistencia · AL·IAM·PSI`;
  const cuerpo = (nombre: string) =>
    `Estimado/a ${nombre}:\n\nLe hacemos llegar adjunto su certificado de asistencia a ${actividad}.\n\nMuchas gracias por participar y por completar la encuesta de satisfacción.\n\nSi lo desea, puede compartir su certificado en sus redes sociales. Si lo publica en LinkedIn, puede mencionar a AL·IAM·PSI (linkedin.com/company/aliampsi).\n\nSaludos cordiales,\n\nAL·IAM·PSI\nAlianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines\naliampsi.com`;
  const gmail = (correo: string, nombre: string) =>
    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(correo)}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo(nombre))}`;
  const base = `/admin/encuestas/${enc.id}/certificados`;
  const enEspera = enc.solicitudes.filter((s) => s.estado === 'validada' && enCola(s.detalle)).length;

  return (
    <>
      <AdminHeader title="Certificados de asistencia" subtitle={enc.titulo} />
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link href={`/admin/encuestas/${enc.id}`} className="btn-ghost text-sm">Editar encuesta</Link>
        <Link href={`/admin/encuestas/${enc.id}/resultados`} className="btn-ghost text-sm">Resultados</Link>
        <Link href={`/admin/encuestas/${enc.id}/seguimiento`} className="btn-ghost text-sm">Inscriptos sin certificado</Link>
        {conteo.validada > 0 && <a href={`${base}/pdf?estado=validada`} className="btn-ghost text-sm">Descargar los {conteo.validada} validados (un PDF)</a>}
        {conteo.validada > 0 && (
          <form action={enviarValidados.bind(null, enc.id)}>
            <button type="submit" className="btn-primary text-sm">Enviar por correo a los validados{conteo.validada > 15 ? ' (de a 15)' : ''}</button>
          </form>
        )}
      </div>

      {!enc.certificado && (
        <p className="mb-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral-dark">
          Esta encuesta no ofrece certificado. Activalo en «Editar encuesta» para que aparezca el pedido al final.
        </p>
      )}
      {searchParams.enviados !== undefined && (
        <p className="mb-6 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">
          Envié {searchParams.enviados} de {searchParams.intentados} certificados. {Number(searchParams.enviados) < Number(searchParams.intentados) ? 'Los que fallaron muestran el motivo en su fila.' : ''}
        </p>
      )}
      {searchParams.encolados !== undefined && Number(searchParams.encolados) > 0 && (
        <p className="mb-6 rounded-lg bg-sand/60 px-4 py-3 text-sm font-medium text-ink">Se agotó el cupo diario de correos: {searchParams.encolados} certificados quedaron en cola y salen solos apenas se libere.</p>
      )}
      {searchParams.cola !== undefined && (
        <p className="mb-6 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">
          {Number(searchParams.cola) > 0 ? `Salieron ${searchParams.cola} correos de la cola.` : 'Resend todavía no liberó el cupo: no salió ninguno.'} {Number(searchParams.quedan) > 0 ? `Quedan ${searchParams.quedan} en cola.` : 'La cola quedó vacía.'}
        </p>
      )}
      {enEspera > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-sand/40 px-4 py-3 text-sm text-ink">
          <p><strong>{enEspera} {enEspera === 1 ? 'certificado en cola' : 'certificados en cola'}.</strong> Se mandan solos cada hora, apenas Resend libera el cupo diario (100 correos por día en el plan gratuito). No hace falta hacer nada.</p>
          <form action={reintentarCola.bind(null, enc.id)}><button type="submit" className="btn-ghost text-xs">Probar ahora</button></form>
        </div>
      )}
      {modoCert(enc) === 'todos' && <p className="mb-6 rounded-lg bg-sand/50 px-4 py-3 text-sm text-ink">Envío automático para todos: los certificados se mandan solos al completar la encuesta, sin validación.</p>}
      {modoCert(enc) === 'inscriptos' && (
        <p className="mb-6 rounded-lg bg-sand/50 px-4 py-3 text-sm text-ink">
          Envío automático para inscriptos ({normalizarInscriptos(enc.inscriptos).length} en la lista): quien coincide por nombre o correo recibe el certificado en el momento. Los que no coinciden quedan <strong>pendientes</strong> acá, para validarlos a mano. La lista se carga en «Editar encuesta».
        </p>
      )}
      {searchParams.validadas !== undefined && (
        <p className="mb-6 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">
          Leí {searchParams.leidos} correos en la lista y validé {searchParams.validadas} {searchParams.validadas === '1' ? 'pedido' : 'pedidos'} pendientes que coincidían. Los que no coinciden siguen pendientes, para revisarlos a mano.
        </p>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(ESTADOS_CERT).map(([e, nombre]) => (
          <Link key={e} href={filtro === e ? base : `${base}?estado=${e}`} className={`card p-5 transition-colors ${filtro === e ? 'ring-2 ring-teal-600' : 'hover:border-teal-600'}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{nombre}s</p>
            <p className="mt-1 font-display text-4xl font-extrabold">{conteo[e]}</p>
          </Link>
        ))}
      </div>

      <details className="card mb-6 p-6" open={conteo.pendiente > 0 && conteo.validada === 0}>
        <summary className="cursor-pointer font-display text-lg font-bold">Validar con la lista de asistentes</summary>
        <p className="mt-2 text-sm text-ink-muted">Pegá la lista de asistentes de Zoom o de Luma —puede ser el archivo completo, tal cual—. Se toman solo los correos, y se validan los pedidos pendientes que coinciden.</p>
        <form action={validarConLista.bind(null, enc.id)} className="mt-4 space-y-3">
          <textarea name="lista" rows={6} className="field font-mono text-xs" placeholder={'ana.lopez@correo.com\njuan.perez@correo.com\n…'} aria-label="Lista de asistentes" />
          <button type="submit" className="btn-primary">Validar coincidencias</button>
        </form>
      </details>

      {lista.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">{enc.solicitudes.length === 0 ? 'Todavía no hay pedidos de certificado.' : 'No hay pedidos en este estado.'}</div>
      ) : (
        <div className="card divide-y divide-line">
          {lista.map((s) => (
            <div key={s.id} className="flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${COLOR[s.estado] ?? COLOR.pendiente}`}>{ESTADOS_CERT[s.estado] ?? s.estado}</span>
                  <span className="text-sm text-ink-muted">{s.correo}</span>
                  <span className="text-xs text-ink-muted">· {formatDate(s.fecha)}</span>
                </div>
                {s.detalle && <p className={`mt-1 text-xs font-medium ${s.detalle.startsWith('Coincide') ? 'text-teal-700' : s.estado === 'validada' && enCola(s.detalle) ? 'text-ink-muted' : 'text-coral-dark'}`}>{s.estado === 'validada' && enCola(s.detalle) ? 'En cola: se envía solo apenas se libere el cupo diario de correos.' : s.detalle}</p>}
                <form action={corregirNombre} className="mt-2 flex max-w-lg items-center gap-2">
                  <input type="hidden" name="id" value={s.id} />
                  <input name="nombre" defaultValue={s.nombre} aria-label="Nombre en el certificado" className="field py-1.5 font-semibold" />
                  <button type="submit" className="shrink-0 text-xs font-medium text-teal-700 hover:underline" title="Guardar el nombre corregido">Guardar</button>
                </form>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {s.estado === 'pendiente' && (<><Boton id={s.id} estado="validada" tono="coral">Validar</Boton><Boton id={s.id} estado="rechazada">Rechazar</Boton></>)}
                {(s.estado === 'validada' || s.estado === 'enviada') && (
                  <>
                    <form action={enviarPorCorreo}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className={`${s.estado === 'validada' ? 'btn-coral' : 'btn-ghost'} px-3 py-1.5 text-xs`}>{s.estado === 'enviada' ? 'Reenviar' : 'Enviar por correo'}</button>
                    </form>
                    <a href={`${base}/pdf?sid=${s.id}`} className="btn-ghost px-3 py-1.5 text-xs">Descargar PDF</a>
                    <a href={gmail(s.correo, s.nombre)} target="_blank" rel="noopener" className="btn-ghost px-3 py-1.5 text-xs">Escribir en Gmail</a>
                  </>
                )}
                {s.estado === 'validada' && <Boton id={s.id} estado="enviada">Marcar enviado</Boton>}
                {s.estado !== 'pendiente' && <Boton id={s.id} estado="pendiente">Volver a pendiente</Boton>}
                <DeleteButton action={eliminarSolicitud} id={s.id} label="Eliminar" confirmText={`¿Eliminar el pedido de ${s.nombre}?`} />
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-ink-muted">
        «Enviar por correo» manda el certificado desde el sitio, con el PDF adjunto. Si preferís mandarlo desde la cuenta de la Alianza, usá «Escribir en Gmail»: abre el correo ya redactado; adjuntá el PDF descargado y, al enviarlo, marcalo como enviado.
      </p>
    </>
  );
}
