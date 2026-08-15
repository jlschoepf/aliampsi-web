import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader, Badge } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { deleteHito, moveHito } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminHistoria() {
  const items = await prisma.hito.findMany({ orderBy: { order: 'asc' } });

  return (
    <>
      <AdminHeader
        title="Historia"
        subtitle="La línea de tiempo de la página «Quiénes somos»."
        action={{ href: '/admin/historia/new', label: '+ Nuevo hito' }}
      />

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay hitos cargados.</div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((it, idx) => (
            <div key={it.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex flex-col">
                  <form action={moveHito}>
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button type="submit" disabled={idx === 0} aria-label="Subir" className="flex h-5 w-5 items-center justify-center rounded text-ink-muted hover:bg-sand hover:text-ink disabled:pointer-events-none disabled:opacity-25">▲</button>
                  </form>
                  <form action={moveHito}>
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button type="submit" disabled={idx === items.length - 1} aria-label="Bajar" className="flex h-5 w-5 items-center justify-center rounded text-ink-muted hover:bg-sand hover:text-ink disabled:pointer-events-none disabled:opacity-25">▼</button>
                  </form>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{it.fecha}</p>
                  <p className="truncate text-xs text-ink-muted">{it.texto}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Badge published={it.published} />
                <Link href={`/admin/historia/${it.id}`} className="text-sm font-medium text-teal-600 hover:text-coral">Editar</Link>
                <DeleteButton action={deleteHito} id={it.id} confirmText={`¿Eliminar el hito "${it.fecha}"?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
