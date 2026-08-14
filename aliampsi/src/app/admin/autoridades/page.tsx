import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { deleteAutoridad } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminAutoridades() {
  const items = await prisma.autoridad.findMany({ orderBy: { order: 'asc' } });

  return (
    <>
      <AdminHeader
        title="Comisión Directiva"
        subtitle="Autoridades de la Alianza."
        action={{ href: '/admin/autoridades/new', label: '+ Nueva autoridad' }}
      />

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay autoridades cargadas.</div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{a.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{[a.role, a.country].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Badge published={a.published} />
                <Link href={`/admin/autoridades/${a.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">
                  Editar
                </Link>
                <DeleteButton action={deleteAutoridad} id={a.id} confirmText={`¿Eliminar a ${a.name}?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
