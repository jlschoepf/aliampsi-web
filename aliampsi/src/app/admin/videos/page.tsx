import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { OrderArrows } from '@/components/OrderArrows';
import { miniatura } from '@/lib/videos';
import { actualizarVideo, crearVideo, eliminarVideo, moverVideo } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminVideos({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const videos = await prisma.video.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
  return (
    <>
      <AdminHeader title="Videos" subtitle="Panel de videos de YouTube de la portada. El primero se muestra grande; los demás, al costado." />
      {searchParams.ok && <p className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Video agregado: quedó primero en la portada.</p>}
      {searchParams.error && <p className="mb-4 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">No reconocí ese enlace. Tiene que ser de YouTube, por ejemplo https://youtu.be/qVAkDfStdec</p>}

      <form action={crearVideo} className="card mb-6 grid gap-3 p-5 md:grid-cols-[1.4fr_1fr_auto] md:items-end">
        <div>
          <label className="field-label" htmlFor="enlace">Enlace de YouTube</label>
          <input id="enlace" name="enlace" required className="field" placeholder="https://youtu.be/…  (también sirve el código para insertar)" />
        </div>
        <div>
          <label className="field-label" htmlFor="titulo">Título (opcional)</label>
          <input id="titulo" name="titulo" className="field" placeholder="Si lo dejás vacío, se toma el de YouTube" />
        </div>
        <button type="submit" className="btn-primary">Agregar video</button>
      </form>

      {videos.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay videos. Agregá el primero con su enlace de YouTube.</div>
      ) : (
        <div className="card divide-y divide-line">
          {videos.map((v, idx) => (
            <div key={v.id} className="flex flex-wrap items-center gap-4 p-4">
              <OrderArrows action={moverVideo} id={v.id} isFirst={idx === 0} isLast={idx === videos.length - 1} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={miniatura(v.youtubeId, 'hqdefault')} alt="" className="h-16 w-28 shrink-0 rounded-lg object-cover" />
              <form action={actualizarVideo} className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                <input type="hidden" name="id" value={v.id} />
                <input name="titulo" defaultValue={v.titulo} aria-label="Título" className="field min-w-[220px] flex-1 py-1.5 font-medium" />
                <label className="flex items-center gap-1.5 text-sm text-ink-muted"><input type="checkbox" name="published" defaultChecked={v.published} /> Visible</label>
                <button type="submit" className="text-sm font-medium text-teal-700 hover:underline">Guardar</button>
                {idx === 0 && v.published && <span className="rounded-full bg-coral/10 px-2.5 py-1 text-xs font-semibold text-coral-dark">Principal en la portada</span>}
              </form>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <a href={`https://youtu.be/${v.youtubeId}`} target="_blank" rel="noreferrer" className="font-medium text-ink-muted hover:text-ink">Ver</a>
                <DeleteButton action={eliminarVideo} id={v.id} confirmText={`¿Quitar «${v.titulo}» del panel de videos?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
