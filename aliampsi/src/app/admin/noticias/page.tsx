import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { StatusBadges } from '@/components/admin-status';
import { formatDate } from '@/lib/utils';
import { deleteNoticia } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminNoticias() {
  const noticias = await prisma.noticia.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <>
      <AdminHeader
        title="Noticias"
        subtitle="Novedades de la Alianza y sus asociaciones."
        action={{ href: '/admin/noticias/new', label: '+ Nueva noticia' }}
      />

      {noticias.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">
          Todavía no hay noticias. Creá la primera con “Nueva noticia”.
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {noticias.map((n) => (
            <div key={n.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{n.title}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{formatDate(n.publishedAt ?? n.createdAt)}</p>
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
      )}
    </>
  );
}
