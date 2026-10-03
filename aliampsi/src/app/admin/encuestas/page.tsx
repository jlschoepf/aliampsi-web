import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { ESTADOS, normalizarPreguntas, preguntasQueSeResponden } from '@/lib/encuestas';
import { formatDate } from '@/lib/utils';
import { cambiarEstado, eliminarEncuesta } from './actions';

export const dynamic = 'force-dynamic';

const COLOR: Record<string, string> = {
  abierta: 'bg-teal-600/10 text-teal-700',
  borrador: 'bg-ink/5 text-ink-muted',
  cerrada: 'bg-coral/10 text-coral-dark',
};

export default async function AdminEncuestas() {
  const encuestas = await prisma.encuesta.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { respuestas: true, solicitudes: true } } } });
  return (
    <>
      <AdminHeader
        title="Encuestas"
        subtitle="Encuestas de satisfacción y consultas. Se responden en el sitio y los resultados se analizan acá."
        action={{ href: '/admin/encuestas/new', label: '+ Nueva encuesta' }}
      />
      {encuestas.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">Todavía no hay encuestas. Creá la primera con «Nueva encuesta».</div>
      ) : (
        <div className="card divide-y divide-line">
          {encuestas.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${COLOR[e.estado] ?? COLOR.borrador}`}>{ESTADOS[e.estado] ?? e.estado}</span>
                  <Link href={`/admin/encuestas/${e.id}`} className="truncate font-medium text-ink hover:text-teal-700">{e.titulo}</Link>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {preguntasQueSeResponden(normalizarPreguntas(e.preguntas)).length} preguntas · {e._count.respuestas} respuestas{e.codigoAcceso ? ' · con código de acceso' : ''} · creada el {formatDate(e.createdAt)} · /encuestas/{e.slug}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-4 text-sm">
                <form action={cambiarEstado}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="estado" value={e.estado === 'abierta' ? 'cerrada' : 'abierta'} />
                  <button type="submit" className={e.estado === 'abierta' ? 'btn-ghost px-4 py-1.5 text-sm' : 'btn-coral px-4 py-1.5 text-sm'}>
                    {e.estado === 'abierta' ? 'Cerrar' : e.estado === 'cerrada' ? 'Reabrir' : 'Publicar'}
                  </button>
                </form>
                <Link href={`/admin/encuestas/${e.id}/resultados`} className="font-medium text-teal-700 hover:underline">Resultados</Link>
                {e.certificado && <Link href={`/admin/encuestas/${e.id}/certificados`} className="font-medium text-teal-700 hover:underline">Certificados ({e._count.solicitudes})</Link>}
                <Link href={`/admin/encuestas/${e.id}`} className="font-medium text-ink-muted hover:text-ink">Editar</Link>
                <Link href={`/encuestas/${e.slug}`} target="_blank" className="font-medium text-ink-muted hover:text-ink">Ver</Link>
                <DeleteButton action={eliminarEncuesta} id={e.id} confirmText={`¿Eliminar «${e.titulo}» y sus ${e._count.respuestas} respuestas? No se puede deshacer.`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
