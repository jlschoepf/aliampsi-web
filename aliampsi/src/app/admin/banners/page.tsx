import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { OrderArrows } from '@/components/OrderArrows';
import { deleteBanner, moveBanner } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminBanners() {
  const items = await prisma.banner.findMany({ orderBy: { order: 'asc' } });

  return (
    <>
      <AdminHeader
        title="Banners de portada"
        subtitle="Presentaciones rotativas del inicio del sitio."
        action={{ href: '/admin/banners/new', label: '+ Nuevo banner' }}
      />

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">
          Todavía no hay banners. Mientras no cargues ninguno, la portada usa su presentación por defecto.
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((b, idx) => (
            <div key={b.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <OrderArrows action={moveBanner} id={b.id} isFirst={idx === 0} isLast={idx === items.length - 1} />
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image} alt="" className="h-12 w-20 shrink-0 rounded-md border border-line object-cover" />
                ) : (
                  <div className="h-12 w-20 shrink-0 rounded-md bg-ink" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{b.title || '(sin título)'}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">Orden: {b.order}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Badge published={b.published} />
                <Link href={`/admin/banners/${b.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">
                  Editar
                </Link>
                <DeleteButton action={deleteBanner} id={b.id} confirmText="¿Eliminar este banner?" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
