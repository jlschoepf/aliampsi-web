import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { StatusBadges } from '@/components/admin-status';
import { formatDate } from '@/lib/utils';
import type { Noticia } from '@prisma/client';
import { OrderArrows } from '@/components/OrderArrows';
import { sortForList } from '@/lib/content';
import { deleteNoticia, moveNoticia, resetOrdenNoticias } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminNoticias() {
  const todas: Noticia[] = await prisma.noticia.findMany();
  // Se muestran en el mismo orden en que las verá el visitante.
  const noticias = sortForList<Noticia>(todas);
  const hayOrdenManual = todas.some((n) => n.order > 0);

  return (
    <>
      <AdminHeader
        title="Noticias"
        subtitle="Novedades de la Alianza y sus asociaciones. Se listan en el mismo orden que ve el visitante."
        action={{ href: '/admin/noticias/new', label: '+ Nueva noticia' }}
      />

      {noticias.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">
          Todavía no hay noticias. Creá la primera con “Nueva noticia”.
        </div>
      ) : (
        <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-sand/50 px-4 py-3">
          <p className="text-sm text-ink-muted">
            {hayOrdenManual
              ? 'Estás usando un orden propio. Las flechas mueven cada noticia de lugar.'
              : 'Hoy se ordenan por fecha, de más nueva a más vieja. Usá las flechas para fijar un orden propio.'}
          </p>
          {hayOrdenManual && (
            <form action={resetOrdenNoticias}>
              <button type="submit" className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink">
                Volver al orden por fecha
              </button>
            </form>
          )}
        </div>
        <div className="card divide-y divide-line">
          {noticias.map((n, idx) => (
            <div key={n.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <OrderArrows action={moveNoticia} id={n.id} isFirst={idx === 0} isLast={idx === noticias.length - 1} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{n.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {formatDate(n.publishedAt ?? n.createdAt)}
                    {n.order > 0 && <span className="ml-2 text-teal-700">· posición {n.order}</span>}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <StatusBadges featured={n.featured} published={n.published} publishedAt={n.publishedAt} />
                <Badge published={n.published} />
                <a href={`/noticias/${n.slug}?preview=1`} target="_blank" rel="noreferrer" className="text-sm font-medium text-ink-muted hover:text-ink">
                  Ver
                </a>
                <Link href={`/admin/noticias/${n.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">
                  Editar
                </Link>
                <DeleteButton action={deleteNoticia} id={n.id} confirmText={`¿Eliminar la noticia “${n.title}”?`} />
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </>
  );
}
