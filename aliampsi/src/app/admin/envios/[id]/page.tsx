import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader, SubmitButton } from '@/components/admin-ui';
import { formatDate } from '@/lib/utils';
import { approveEnvio, rejectEnvio, reopenEnvio } from '../actions';

export const dynamic = 'force-dynamic';

const TIPO_LABEL: Record<string, string> = {
  noticia: 'Noticia',
  congreso: 'Congreso',
  publicacion: 'Publicación',
  otro: 'Otro',
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-ink-muted">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export default async function RevisarEnvio({ params }: { params: { id: string } }) {
  const e = await prisma.envio.findUnique({ where: { id: params.id } });
  if (!e) notFound();

  return (
    <>
      <AdminHeader title="Revisar envío" subtitle={e.title} />

      <div className="card p-6">
        <dl className="divide-y divide-line">
          <Row label="Tipo">
            {TIPO_LABEL[e.tipo] || e.tipo}
            {e.tipo === 'otro' && e.tipoOtro && <> — <strong>{e.tipoOtro}</strong></>}
          </Row>
          <Row label="Recibido">{formatDate(e.createdAt)}</Row>
          <Row label="Institución">{e.orgName || '—'}</Row>
          <Row label="Contacto">
            {e.contactName || '—'}
            {e.contactEmail && (
              <>
                {' · '}
                <a href={`mailto:${e.contactEmail}`} className="text-teal-600 hover:text-coral">{e.contactEmail}</a>
              </>
            )}
            {e.contactPhone && ` · ${e.contactPhone}`}
          </Row>
          {e.summary && <Row label="Resumen">{e.summary}</Row>}
          {e.location && <Row label="Lugar">{e.location}</Row>}
          {e.eventDate && <Row label="Fecha del evento">{e.eventDate}</Row>}
          {e.linkUrl && (
            <Row label="Enlace">
              <a href={e.linkUrl} target="_blank" rel="noreferrer" className="break-all text-teal-600 hover:text-coral">
                {e.linkUrl}
              </a>
            </Row>
          )}
          {e.coverImage && (
            <Row label="Imagen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.coverImage} alt="" className="max-h-48 rounded-lg border border-line object-contain" />
            </Row>
          )}
          {e.document && (
            <Row label="Documento">
              <a href={e.document} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-coral">
                📎 Ver documento
              </a>
            </Row>
          )}
          <Row label="Texto">
            <div className="whitespace-pre-wrap rounded-lg bg-sand/40 p-4 leading-relaxed">{e.body}</div>
          </Row>
        </dl>
      </div>

      {e.status === 'pendiente' ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <form action={approveEnvio} className="card space-y-3 p-6">
            <input type="hidden" name="id" value={e.id} />
            <h2 className="font-semibold text-ink">Aprobar</h2>
            <p className="text-sm text-ink-muted">
              Crea {e.tipo === 'congreso' ? 'un congreso' : e.tipo === 'publicacion' ? 'una publicación' : 'una noticia'} con
              estos datos, <strong>como borrador</strong>. Después la editás y publicás cuando quieras.
              {e.tipo === 'otro' && ' Como el envío es de tipo «Otro», se crea como noticia: podés cambiarla luego.'}
            </p>
            <SubmitButton>Aprobar y crear borrador</SubmitButton>
          </form>

          <form action={rejectEnvio} className="card space-y-3 p-6">
            <input type="hidden" name="id" value={e.id} />
            <h2 className="font-semibold text-ink">Descartar</h2>
            <textarea
              name="adminNote"
              rows={2}
              className="field"
              placeholder="Nota interna (opcional): por qué se descarta"
            />
            <button type="submit" className="btn-ghost">Descartar envío</button>
          </form>
        </div>
      ) : (
        <div className="card mt-6 space-y-3 p-6">
          <p className="text-sm text-ink">
            Este envío ya fue <strong>{e.status === 'aprobado' ? 'aprobado' : 'descartado'}</strong>.
            {e.adminNote && <> Nota: {e.adminNote}</>}
          </p>
          <form action={reopenEnvio}>
            <input type="hidden" name="id" value={e.id} />
            <button type="submit" className="btn-ghost">Volver a pendientes</button>
          </form>
        </div>
      )}

      <p className="mt-6">
        <Link href="/admin/envios" className="text-sm font-medium text-teal-600 hover:text-coral">← Volver a la bandeja</Link>
      </p>
    </>
  );
}
