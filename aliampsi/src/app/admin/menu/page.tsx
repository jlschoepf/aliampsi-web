import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { OrderArrows } from '@/components/OrderArrows';
import { deleteMenuItem, moveMenuItem } from './actions';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminMenu() {
  const todos = await prisma.menuItem.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });

  // Se listan los de primer nivel y debajo, indentadas, sus opciones.
  const raices = todos.filter((i) => !i.parentId);
  const items = raices.flatMap((r) => [
    r,
    ...todos.filter((h) => h.parentId === r.id),
  ]);
  // Cualquiera cuyo padre ya no exista se muestra igual, para que no quede escondido.
  const idsVisibles = new Set(items.map((i) => i.id));
  for (const h of todos) if (!idsVisibles.has(h.id)) items.push(h);

  return (
    <>
      <AdminHeader
        title="Menú"
        subtitle="Los enlaces del menú principal. Las opciones indentadas viven dentro de un desplegable."
        action={{ href: '/admin/menu/new', label: '+ Nuevo enlace' }}
      />

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay enlaces en el menú.</div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((it, idx) => (
            <div
              key={it.id}
              className={cn('flex items-center justify-between gap-4 p-4', it.parentId && 'bg-sand/30 pl-12')}
            >
              <div className="flex min-w-0 items-center gap-3">
                <OrderArrows action={moveMenuItem} id={it.id} isFirst={idx === 0} isLast={idx === items.length - 1} />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate font-medium text-ink">
                    {it.label}
                    {it.parentId && (
                      <span className="rounded-full bg-teal-600/10 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                        Opción del desplegable
                      </span>
                    )}
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
