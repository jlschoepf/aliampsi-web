import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader, Field, TextArea, Select, Checkbox, SubmitButton } from '@/components/admin-ui';
import { ESTADOS, normalizarPreguntas } from '@/lib/encuestas';
import { SITE_URL } from '@/lib/site';
import { guardarEncuesta } from '../actions';
import { EditorPreguntas } from './EditorPreguntas';
import { CopiarEnlace } from './CopiarEnlace';

export const dynamic = 'force-dynamic';

export default async function EditarEncuesta({ params, searchParams }: { params: { id: string }; searchParams: { ok?: string; nueva?: string } }) {
  const enc = await prisma.encuesta.findUnique({ where: { id: params.id }, include: { _count: { select: { respuestas: true } } } });
  if (!enc) notFound();
  const url = `${SITE_URL}/encuestas/${enc.slug}`;
  return (
    <>
      <AdminHeader title={enc.titulo} subtitle="Editá los textos y las preguntas. Para recibir respuestas, poné la encuesta en «Abierta» y compartí el enlace." />
      {searchParams.ok && <p className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Cambios guardados.</p>}
      {searchParams.nueva && <p className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Encuesta creada en borrador. Revisala y, cuando esté lista, cambiá el estado a «Abierta».</p>}

      <div className="card mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0 text-sm">
          <span className="text-ink-muted">Enlace para compartir: </span>
          <a href={url} target="_blank" className="break-all font-medium text-teal-700 hover:underline">{url}</a>
        </div>
        <div className="flex gap-2">
          <CopiarEnlace url={url} />
          <Link href={`/encuestas/${enc.slug}`} target="_blank" className="btn-ghost text-sm">Vista previa</Link>
          <Link href={`/admin/encuestas/${enc.id}/resultados`} className="btn-ghost text-sm">Resultados ({enc._count.respuestas})</Link>
        </div>
      </div>

      <form action={guardarEncuesta.bind(null, enc.id)} className="space-y-8">
        <div className="card grid gap-5 p-6 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Título" name="titulo" defaultValue={enc.titulo} required /></div>
          <Field label="Dirección" name="slug" defaultValue={enc.slug} hint={`Queda como aliampsi.com/encuestas/${enc.slug}`} />
          <Select label="Estado" name="estado" defaultValue={enc.estado} options={Object.entries(ESTADOS).map(([value, label]) => ({ value, label }))} />
          <div className="md:col-span-2"><TextArea label="Presentación" name="descripcion" defaultValue={enc.descripcion} rows={5} hint="Se muestra arriba de las preguntas. Dejá una línea en blanco entre párrafos." /></div>
          <div className="md:col-span-2"><TextArea label="Mensaje de agradecimiento" name="gracias" defaultValue={enc.gracias} rows={2} /></div>
          <div className="md:col-span-2"><Checkbox label="Encuesta anónima (no se pide ni se guarda ningún dato personal)" name="anonima" defaultChecked={enc.anonima} /></div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl font-bold">Preguntas</h2>
          <EditorPreguntas inicial={normalizarPreguntas(enc.preguntas)} conRespuestas={enc._count.respuestas} />
        </div>

        <div className="sticky bottom-0 -mx-2 flex items-center gap-3 border-t border-line bg-paper/95 px-2 py-4 backdrop-blur">
          <SubmitButton>Guardar cambios</SubmitButton>
          <Link href="/admin/encuestas" className="text-sm text-ink-muted hover:text-ink">Volver al listado</Link>
        </div>
      </form>
    </>
  );
}
