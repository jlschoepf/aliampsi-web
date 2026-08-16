import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { OrderArrows } from '@/components/OrderArrows';
import { deleteMenuItem, moveMenuItem } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminMenu() {
  const items = await prisma.menuItem.findMany({ orderBy: { order: 'asc' } });

  return (
    <>
      <AdminHeader
        title="Menú"
        subtitle="Los enlaces del menú principal del sitio."
        action={{ href: '/admin/menu/new', label: '+ Nuevo enlace' }}
      />

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay enlaces en el menú.</div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((it, idx) => (
            <div key={it.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <OrderArrows action={moveMenuItem} id={it.id} isFirst={idx === 0} isLast={idx === items.length - 1} />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate font-medium text-ink">
                    {it.label}
                    {it.cta && <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-semibold text-coral-dark">Botón</span>}
                    {it.newTab && <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-medium text-ink-muted">Pestaña nueva</span>}
                  </p>
                  <p className="truncate text-xs text-ink-muted">{it.href}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Badge published={it.published} />
                <Link href={`/admin/menu/${it.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">Editar</Link>
                <DeleteButton action={deleteMenuItem} id={it.id} confirmText={`¿Eliminar "${it.label}" del menú?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
