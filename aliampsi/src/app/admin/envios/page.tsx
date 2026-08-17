import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { formatDate } from '@/lib/utils';
import { deleteEnvio } from './actions';

export const dynamic = 'force-dynamic';

const TIPO_LABEL: Record<string, string> = {
  noticia: 'Noticia',
  congreso: 'Congreso',
  publicacion: 'Publicación',
  otro: 'Otro',
};

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    pendiente: 'bg-coral/15 text-coral-dark',
    aprobado: 'bg-teal-600/10 text-teal-700',
    rechazado: 'bg-sand text-ink-muted',
  };
  const label: Record<string, string> = {
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    rechazado: 'Descartado',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status] || map.pendiente}`}>
      {label[status] || status}
    </span>
  );
}

export default async function AdminEnvios({ searchParams }: { searchParams: { estado?: string } }) {
  const estado = searchParams?.estado || 'pendiente';
  const where = estado === 'todos' ? {} : { status: estado };
  const [items, pendientes] = await Promise.all([
    prisma.envio.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.envio.count({ where: { status: 'pendiente' } }),
  ]);

  const tabs = [
    { key: 'pendiente', label: `Pendientes${pendientes ? ` (${pendientes})` : ''}` },
    { key: 'aprobado', label: 'Aprobados' },
    { key: 'rechazado', label: 'Descartados' },
    { key: 'todos', label: 'Todos' },
  ];

  return (
    <>
      <AdminHeader
        title="Recepción de envíos"
        subtitle="Contenidos que envían las asociaciones desde el formulario público."
      />

      <div className="mb-5 rounded-lg border border-line bg-sand/30 p-4">
        <p className="text-sm font-medium text-ink">Enlace para compartir con las asociaciones</p>
        <p className="mt-1 break-all font-mono text-xs text-teal-700">
          {process.env.NEXT_PUBLIC_SITE_URL || 'https://aliampsi-web.vercel.app'}/enviar
        </p>
        <p className="mt-1.5 text-xs text-ink-muted">
          Cualquiera con este enlace puede enviar una propuesta. Nada se publica sin tu aprobación.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/envios?estado=${t.key}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              estado === t.key ? 'bg-ink text-paper' : 'bg-sand text-ink-muted hover:text-ink'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">No hay envíos en esta bandeja.</div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2">
                  <StatusChip status={e.status} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600">
                    {TIPO_LABEL[e.tipo] || e.tipo}
                    {e.tipo === 'otro' && e.tipoOtro ? `: ${e.tipoOtro}` : ''}
                  </span>
                </p>
                <p className="mt-1 truncate font-medium text-ink">{e.title}</p>
                <p className="truncate text-xs text-ink-muted">
                  {e.orgName || 'Sin institución'} · {formatDate(e.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Link href={`/admin/envios/${e.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">
                  Revisar
                </Link>
                <DeleteButton action={deleteEnvio} id={e.id} confirmText={`¿Eliminar el envío "${e.title}"?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
