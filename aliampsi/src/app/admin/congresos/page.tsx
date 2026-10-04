import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { StatusBadges } from '@/components/admin-status';
import { formatDateRange } from '@/lib/utils';
import type { Congreso } from '@prisma/client';
import { OrderArrows } from '@/components/OrderArrows';
import { sortForList } from '@/lib/content';
import { deleteCongreso, moveCongreso, resetOrdenCongresos } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminCongresos() {
  const todos: Congreso[] = await prisma.congreso.findMany();
  // Se muestran en el mismo orden en que los verá el visitante.
  const items = sortForList<Congreso>(todos);
  const hayOrdenManual = todos.some((c) => c.order > 0);

  return (
    <>
      <AdminHeader
        title="Congresos y actividades"
        subtitle="Agenda científica de la Alianza. Se listan en el mismo orden que ve el visitante."
        action={{ href: '/admin/congresos/new', label: '+ Nuevo congreso' }}
      />

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay actividades cargadas.</div>
      ) : (
        <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-sand/50 px-4 py-3">
          <p className="text-sm text-ink-muted">
            {hayOrdenManual
              ? 'Estás usando un orden propio. Las flechas mueven cada congreso de lugar.'
              : 'Hoy se ordenan por fecha, del más nuevo al más viejo. Usá las flechas para fijar un orden propio.'}
          </p>
          {hayOrdenManual && (
            <form action={resetOrdenCongresos}>
              <button type="submit" className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink">Volver al orden por fecha</button>
            </form>
          )}
        </div>
        <div className="card divide-y divide-line">
          {items.map((c, idx) => (
            <div key={c.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <OrderArrows action={moveCongreso} id={c.id} isFirst={idx === 0} isLast={idx === items.length - 1} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{c.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {[formatDateRange(c.startDate, c.endDate), c.location].filter(Boolean).join(' · ')}
                    {c.order > 0 && <span className="ml-2 text-teal-700">· posición {c.order}</span>}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <StatusBadges featured={c.featured} published={c.published} publishedAt={c.publishedAt} />
                <Badge published={c.published} />
                <a href={`/congresos/${c.id}?preview=1`} target="_blank" rel="noreferrer" className="text-sm font-medium text-ink-muted hover:text-ink">Ver</a>
                <Link href={`/admin/congresos/${c.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">
                  Editar
                </Link>
                <DeleteButton action={deleteCongreso} id={c.id} confirmText={`¿Eliminar “${c.title}”?`} />
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </>
  );
}
