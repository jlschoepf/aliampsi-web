import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader, Field, TextArea, Select, Checkbox, SubmitButton } from '@/components/admin-ui';
import { ESTADOS, normalizarPreguntas } from '@/lib/encuestas';
import { SITE_URL } from '@/lib/site';
import { cambiarEstado, cargarPlantilla, crearNoticiaConEncuesta, enviarPrueba, guardarEncuesta } from '../actions';
import { configEnvio } from '@/lib/correo';
import { MODOS_CERT, PLANTILLAS, codigoInsercion, modoCert, preguntasQueSeResponden } from '@/lib/encuestas';
import { inscriptosATexto, normalizarInscriptos } from '@/lib/inscriptos';
import { BotonConfirmar } from './BotonConfirmar';
import { CampoCodigo } from './CampoCodigo';
import { CampoInscriptos } from './CampoInscriptos';
import { EditorPreguntas } from './EditorPreguntas';
import { CopiarEnlace } from './CopiarEnlace';
import { ImageField } from '@/components/ImageField';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export default async function EditarEncuesta({ params, searchParams }: { params: { id: string }; searchParams: { ok?: string; nueva?: string; plantilla?: string; prueba?: string; detalle?: string } }) {
  const enc = await prisma.encuesta.findUnique({ where: { id: params.id }, include: { _count: { select: { respuestas: true, solicitudes: true } } } });
  if (!enc) notFound();
  const url = `${SITE_URL}/encuestas/${enc.slug}`;
  const correo = await configEnvio();
  const minutos = Math.max(1, Math.round((preguntasQueSeResponden(normalizarPreguntas(enc.preguntas)).length * 12) / 60));
  const inscriptos = normalizarInscriptos(enc.inscriptos);
  const modo = modoCert(enc);
  // Si ya hay una noticia con la encuesta insertada, el correo lleva a la noticia (donde está también el video).
  const noticia = await prisma.noticia.findFirst({ where: { content: { contains: codigoInsercion(enc.slug) } }, select: { slug: true, published: true } });
  const enlace = noticia ? `${SITE_URL}/noticias/${noticia.slug}` : url;
  const textoCorreo = enc.certificado
    ? `Estimado/a colega:\n\nMuchas gracias por participar en ${enc.certActividad || 'nuestra actividad'}.\n\n${noticia ? 'Ya están disponibles en nuestro sitio la grabación y la encuesta de satisfacción' : 'Ya está disponible en nuestro sitio la encuesta de satisfacción'}: lleva unos ${minutos} minutos.\n\n${enlace}${enc.codigoAcceso ? `\nCódigo de acceso: ${enc.codigoAcceso}` : ''}\n\nAl completar la encuesta puede solicitar su certificado de asistencia.${modo === 'inscriptos' ? ' Si utiliza el mismo nombre y el mismo correo electrónico con los que se inscribió, le llegará automáticamente por correo.' : ''}\n\nSaludos cordiales,\n\nAL·IAM·PSI\nAlianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines`
    : '';
  return (
    <>
      <AdminHeader title={enc.titulo} subtitle="Editá los textos y las preguntas. Para recibir respuestas, poné la encuesta en «Abierta» y compartí el enlace." />
      {searchParams.ok && <p className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Cambios guardados.</p>}
      {searchParams.prueba === 'ok' && <p className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">Certificado de prueba enviado a {searchParams.detalle}. Revisá la bandeja de entrada (y la de correo no deseado).</p>}
      {searchParams.prueba === 'error' && <p className="mb-4 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">No se pudo enviar la prueba: {searchParams.detalle}</p>}
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

      <div className="card mb-6 p-5">
        <h2 className="font-display text-lg font-bold">Insertar en una noticia</h2>
        <p className="mt-1 text-sm text-ink-muted">En el editor de cualquier noticia, tocá el botón <strong className="text-ink">📋 Encuesta</strong> de la barra de herramientas y elegila de la lista. Aparece como una tarjeta en el texto y, en la noticia publicada, se muestra la encuesta completa. Mientras esté en borrador, el público no la ve.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <form action={crearNoticiaConEncuesta.bind(null, enc.id)}>
            <button type="submit" className="btn-primary text-sm">Crear noticia con esta encuesta</button>
          </form>
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-ink-muted">Opción avanzada: código para pegar a mano</summary>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="rounded-lg border border-line bg-sand/40 px-3 py-2 text-sm text-ink">{codigoInsercion(enc.slug)}</code>
            <CopiarEnlace url={codigoInsercion(enc.slug)} etiqueta="Copiar código" />
          </div>
        </details>
      </div>

      {textoCorreo && (
        <div className="card mb-6 p-5">
          <h2 className="font-display text-lg font-bold">Correo para avisar a los inscriptos</h2>
          <p className="mt-1 text-sm text-ink-muted">Texto listo para avisar a los inscriptos desde la cuenta de la Alianza. {noticia ? `Lleva a la noticia donde está insertada la encuesta${noticia.published ? '' : ' (todavía en borrador: publicala antes de enviar)'}.` : 'Lleva a la página de la encuesta; si la insertás en una noticia, el enlace pasa a ser el de la noticia.'}</p>
          <textarea readOnly value={textoCorreo} rows={10} className="field mt-3 text-sm" aria-label="Texto del correo" />
          <div className="mt-2"><CopiarEnlace url={textoCorreo} etiqueta="Copiar texto del correo" /></div>
        </div>
      )}

      <form id="form-plantilla" action={cargarPlantilla.bind(null, enc.id)} />
      <form id="form-prueba" action={enviarPrueba.bind(null, enc.id)} />
      <form action={guardarEncuesta.bind(null, enc.id)} className="space-y-8">
        <div className="card grid gap-5 p-6 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Título" name="titulo" defaultValue={enc.titulo} required /></div>
          <Field label="Dirección" name="slug" defaultValue={enc.slug} hint={`Queda como aliampsi.com/encuestas/${enc.slug}`} />
          <Select label="Estado" name="estado" defaultValue={enc.estado} options={Object.entries(ESTADOS).map(([value, label]) => ({ value, label }))} />
          <div className="md:col-span-2"><CampoCodigo defaultValue={enc.codigoAcceso} /></div>
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
          <fieldset className="rounded-lg border border-line bg-white p-4">
            <legend className="px-1 text-sm font-semibold text-ink">Envío del certificado</legend>
            <div className="space-y-2">
              {Object.entries(MODOS_CERT).map(([valor, texto]) => (
                <label key={valor} className="flex cursor-pointer items-start gap-2 text-sm">
                  <input type="radio" name="certModo" value={valor} defaultChecked={modo === valor} className="mt-1 accent-[#2E7D74]" />
                  <span>{texto}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <CampoInscriptos defaultValue={inscriptosATexto(inscriptos)} />
          </div>
          <div className="rounded-lg border border-line bg-white p-4">
            <p className={`mt-3 text-xs font-medium ${correo.aviso ? 'text-coral-dark' : 'text-teal-700'}`}>
              {correo.aviso ? `Correo: ${correo.aviso}` : `Correo listo · se envía desde ${correo.remitente}`}
            </p>
            <button type="submit" form="form-prueba" className="btn-ghost mt-3 text-sm">Enviarme un certificado de prueba</button>
          </div>
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
