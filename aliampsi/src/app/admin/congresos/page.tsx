import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { formatDateRange } from '@/lib/utils';
import { deleteCongreso } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminCongresos() {
  const items = await prisma.congreso.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <>
      <AdminHeader
        title="Congresos y actividades"
        subtitle="Agenda científica de la Alianza."
        action={{ href: '/admin/congresos/new', label: '+ Nuevo congreso' }}
      />

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay actividades cargadas.</div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{c.title}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {[formatDateRange(c.startDate, c.endDate), c.location].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Badge published={c.published} />
                <Link href={`/admin/congresos/${c.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">
                  Editar
                </Link>
                <DeleteButton action={deleteCongreso} id={c.id} confirmText={`¿Eliminar “${c.title}”?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
