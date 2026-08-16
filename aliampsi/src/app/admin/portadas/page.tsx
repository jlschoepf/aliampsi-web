import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { AddPortada } from './AddPortada';
import { deletePortada } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminPortadas() {
  const items = await prisma.portada.findMany({ orderBy: { order: 'asc' } });

  return (
    <>
      <AdminHeader
        title="Portadas"
        subtitle="Galería de imágenes genéricas para elegir al crear noticias."
      />

      <div className="mb-6">
        <AddPortada />
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay portadas en la galería.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="aspect-video w-full object-cover" />
              <div className="flex items-center justify-end p-3">
                <DeleteButton action={deletePortada} id={p.id} confirmText="¿Eliminar esta portada de la galería?" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
