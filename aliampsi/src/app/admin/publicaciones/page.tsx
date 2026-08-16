import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { StatusBadges } from '@/components/admin-status';
import { deletePublicacion } from './actions';

export const dynamic = 'force-dynamic';

const KIND: Record<string, string> = { revista: 'Revista', articulo: 'Artículo', documento: 'Documento' };

export default async function AdminPublicaciones() {
  const items = await prisma.publicacion.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <>
      <AdminHeader
        title="Publicaciones"
        subtitle="Revistas, artículos y documentos."
        action={{ href: '/admin/publicaciones/new', label: '+ Nueva publicación' }}
      />

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay publicaciones.</div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{p.title}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{KIND[p.kind] ?? p.kind}</p>
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
