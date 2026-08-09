import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { deleteAsociacion } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminAsociaciones() {
  const items = await prisma.asociacion.findMany({ orderBy: { order: 'asc' } });

  return (
    <>
      <AdminHeader
        title="Asociaciones integrantes"
        subtitle="Instituciones que forman parte de la Alianza."
        action={{ href: '/admin/asociaciones/new', label: '+ Nueva asociación' }}
      />

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay asociaciones cargadas.</div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-xs font-bold text-paper">
                  {a.acronym ? a.acronym.slice(0, 4) : a.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{a.name}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{a.country || 'Sin país'}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Badge published={a.published} />
                <Link href={`/admin/asociaciones/${a.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">
                  Editar
                </Link>
                <DeleteButton action={deleteAsociacion} id={a.id} confirmText={`¿Eliminar “${a.name}”?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
