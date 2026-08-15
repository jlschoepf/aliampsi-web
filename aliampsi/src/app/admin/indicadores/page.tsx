import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { deleteIndicador } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminIndicadores() {
  const items = await prisma.indicador.findMany({ orderBy: { order: 'asc' } });

  return (
    <>
      <AdminHeader
        title="Indicadores"
        subtitle="Los números destacados de la portada (asociaciones, congresos, miembros…)."
        action={{ href: '/admin/indicadores/new', label: '+ Nuevo indicador' }}
      />

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">
          Sin indicadores propios: la portada usa los conteos automáticos. Agregá los tuyos para controlarlos a mano.
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-baseline gap-3">
                <span className="font-display text-2xl font-extrabold text-ink">{it.value}</span>
                <span className="truncate text-sm text-ink-muted">{it.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Badge published={it.published} />
                <Link href={`/admin/indicadores/${it.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">
                  Editar
                </Link>
                <DeleteButton action={deleteIndicador} id={it.id} confirmText="¿Eliminar este indicador?" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
