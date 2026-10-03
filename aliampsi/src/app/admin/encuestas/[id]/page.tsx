import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader, Field, TextArea, Select, Checkbox, SubmitButton } from '@/components/admin-ui';
import { ESTADOS, normalizarPreguntas } from '@/lib/encuestas';
import { SITE_URL } from '@/lib/site';
import { cambiarEstado, cargarPlantilla, guardarEncuesta } from '../actions';
import { PLANTILLAS } from '@/lib/encuestas';
import { BotonConfirmar } from './BotonConfirmar';
import { EditorPreguntas } from './EditorPreguntas';
import { CopiarEnlace } from './CopiarEnlace';
import { ImageField } from '@/components/ImageField';

export const dynamic = 'force-dynamic';

export default async function EditarEncuesta({ params, searchParams }: { params: { id: string }; searchParams: { ok?: string; nueva?: string; plantilla?: string } }) {
  const enc = await prisma.encuesta.findUnique({ where: { id: params.id }, include: { _count: { select: { respuestas: true, solicitudes: true } } } });
  if (!enc) notFound();
  const url = `${SITE_URL}/encuestas/${enc.slug}`;
  return (
    <>
      <AdminHeader title={enc.titulo} subtitle="Editá los textos y las preguntas. Para recibir respuestas, poné la encuesta en «Abierta» y compartí el enlace." />
      {searchParams.ok && <p className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Cambios guardados.</p>}
      {searchParams.plantilla && <p className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Preguntas reemplazadas por las de la plantilla. Revisalas abajo.</p>}
      {searchParams.nueva && <p className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Encuesta creada en borrador. Revisala y, cuando esté lista, cambiá el estado a «Abierta».</p>}

      <div className="card mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0 text-sm">
          <span className={`mr-2 rounded-full px-2.5 py-1 text-xs font-semibold ${enc.estado === 'abierta' ? 'bg-teal-600/10 text-teal-700' : 'bg-ink/5 text-ink-muted'}`}>{enc.estado === 'abierta' ? 'Publicada' : enc.estado === 'cerrada' ? 'Cerrada' : 'Borrador'}</span>
          <span className="text-ink-muted">Enlace para compartir: </span>
          <a href={url} target="_blank" className="break-all font-medium text-teal-700 hover:underline">{url}</a>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={cambiarEstado}>
            <input type="hidden" name="id" value={enc.id} />
            <input type="hidden" name="estado" value={enc.estado === 'abierta' ? 'cerrada' : 'abierta'} />
            <button type="submit" className={enc.estado === 'abierta' ? 'btn-ghost text-sm' : 'btn-coral text-sm'}>
              {enc.estado === 'abierta' ? 'Cerrar encuesta' : enc.estado === 'cerrada' ? 'Reabrir' : 'Publicar'}
            </button>
          </form>
          <CopiarEnlace url={url} />
          <Link href={`/encuestas/${enc.slug}`} target="_blank" className="btn-ghost text-sm">Vista previa</Link>
          <Link href={`/admin/encuestas/${enc.id}/resultados`} className="btn-ghost text-sm">Resultados ({enc._count.respuestas})</Link>
          {enc.certificado && <Link href={`/admin/encuestas/${enc.id}/certificados`} className="btn-ghost text-sm">Certificados ({enc._count.solicitudes})</Link>}
        </div>
      </div>

      <form id="form-plantilla" action={cargarPlantilla.bind(null, enc.id)} />
      <form action={guardarEncuesta.bind(null, enc.id)} className="space-y-8">
        <div className="card grid gap-5 p-6 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Título" name="titulo" defaultValue={enc.titulo} required /></div>
          <Field label="Dirección" name="slug" defaultValue={enc.slug} hint={`Queda como aliampsi.com/encuestas/${enc.slug}`} />
          <Select label="Estado" name="estado" defaultValue={enc.estado} options={Object.entries(ESTADOS).map(([value, label]) => ({ value, label }))} />
          <div className="md:col-span-2"><TextArea label="Presentación" name="descripcion" defaultValue={enc.descripcion} rows={5} hint="Se muestra arriba de las preguntas. Dejá una línea en blanco entre párrafos." /></div>
          <div className="md:col-span-2"><TextArea label="Mensaje de agradecimiento" name="gracias" defaultValue={enc.gracias} rows={2} /></div>
          <div className="md:col-span-2"><Checkbox label="Encuesta anónima (no se pide ni se guarda ningún dato personal)" name="anonima" defaultChecked={enc.anonima} /></div>
          <div className="md:col-span-2"><ImageField label="Imagen de portada" name="portada" defaultValue={enc.portada} hint="Opcional. Se muestra arriba de la encuesta y al compartir el enlace. Ideal: horizontal, 1600 × 640 px." /></div>
        </div>

        <div className="card space-y-5 p-6">
          <div>
            <h2 className="font-display text-xl font-bold">Certificado de asistencia</h2>
            <p className="mt-1 text-sm text-ink-muted">Al final de la encuesta, quien quiera puede pedir su certificado con nombre y correo. Esos datos se guardan aparte de las respuestas, que siguen siendo anónimas. Los pedidos se validan y se descargan en «Certificados».</p>
          </div>
          <Checkbox label="Ofrecer certificado de asistencia en esta encuesta" name="certificado" defaultChecked={enc.certificado} />
          <TextArea label="Actividad" name="certActividad" defaultValue={enc.certActividad} rows={2} hint="Completa la frase «por su participación como asistente en…». Ej.: el Webinar Internacional «…»" />
          <TextArea label="Detalle" name="certDetalle" defaultValue={enc.certDetalle} rows={2} hint="Organizadores, modalidad y fecha. Va debajo, en letra más chica." />
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl font-bold">Preguntas</h2>
          <EditorPreguntas inicial={normalizarPreguntas(enc.preguntas)} conRespuestas={enc._count.respuestas} />
        </div>

        <details className="card p-6">
          <summary className="cursor-pointer font-display text-lg font-bold">Cargar preguntas desde una plantilla</summary>
          <p className="mt-2 text-sm text-ink-muted">Reemplaza todas las preguntas de esta encuesta por las de la plantilla elegida, en su versión más reciente. Los textos, la portada y el certificado no cambian.{enc._count.respuestas > 0 ? ` Atención: esta encuesta ya tiene ${enc._count.respuestas} respuestas y dejarían de coincidir con las preguntas nuevas.` : ''}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select name="plantilla" form="form-plantilla" className="field max-w-md" aria-label="Plantilla" defaultValue={PLANTILLAS[0].clave}>
              {PLANTILLAS.filter((p) => p.clave !== 'en-blanco').map((p) => <option key={p.clave} value={p.clave}>{p.nombre}</option>)}
            </select>
            <BotonConfirmar form="form-plantilla" texto="Cargar preguntas" aviso="¿Reemplazar todas las preguntas por las de la plantilla? Los cambios sin guardar de esta página se pierden." />
          </div>
        </details>

        <div className="sticky bottom-0 -mx-2 flex items-center gap-3 border-t border-line bg-paper/95 px-2 py-4 backdrop-blur">
          <SubmitButton>Guardar cambios</SubmitButton>
          <Link href="/admin/encuestas" className="text-sm text-ink-muted hover:text-ink">Volver al listado</Link>
        </div>
      </form>
    </>
  );
}
