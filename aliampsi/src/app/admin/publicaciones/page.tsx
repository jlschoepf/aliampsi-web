import Link from 'next/link';
import { prisma } from '@/lib/db';
import type { Publicacion } from '@prisma/client';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { OrderArrows } from '@/components/OrderArrows';
import { StatusBadges } from '@/components/admin-status';
import { sortForList } from '@/lib/content';
import { deletePublicacion, movePublicacion, resetOrdenPublicaciones } from './actions';

export const dynamic = 'force-dynamic';

const KIND: Record<string, string> = { revista: 'Revista', articulo: 'Artículo', documento: 'Documento' };

export default async function AdminPublicaciones() {
  const todas: Publicacion[] = await prisma.publicacion.findMany();
  // Se muestran en el mismo orden en que las verá el visitante.
  const items = sortForList<Publicacion>(todas);
  const hayOrdenManual = todas.some((p) => p.order > 0);

  return (
    <>
      <AdminHeader
        title="Publicaciones"
        subtitle="Revistas, artículos y documentos. Se listan en el mismo orden que ve el visitante."
        action={{ href: '/admin/publicaciones/new', label: '+ Nueva publicación' }}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-sand/50 px-4 py-3">
        <p className="text-sm text-ink-muted">
          {hayOrdenManual
            ? 'Estás usando un orden propio. Las flechas mueven cada publicación de lugar.'
            : 'Hoy se ordenan por fecha, de más nueva a más vieja. Usá las flechas para fijar un orden propio.'}
        </p>
        {hayOrdenManual && (
          <form action={resetOrdenPublicaciones}>
            <button
              type="submit"
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink"
            >
              Volver al orden por fecha
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay publicaciones.</div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <OrderArrows
                  action={movePublicacion}
                  id={p.id}
                  isFirst={idx === 0}
                  isLast={idx === items.length - 1}
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{p.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {KIND[p.kind] ?? p.kind}
                    {p.order > 0 && <span className="ml-2 text-teal-700">· posición {p.order}</span>}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <StatusBadges featured={p.featured} published={p.published} publishedAt={p.publishedAt} />
                <Badge published={p.published} />
                <a href={`/publicaciones/${p.id}?preview=1`} target="_blank" rel="noreferrer" className="text-sm font-medium text-ink-muted hover:text-ink">
                  Ver
                </a>
                <Link href={`/admin/publicaciones/${p.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">
                  Editar
                </Link>
                <DeleteButton action={deletePublicacion} id={p.id} confirmText={`¿Eliminar “${p.title}”?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
