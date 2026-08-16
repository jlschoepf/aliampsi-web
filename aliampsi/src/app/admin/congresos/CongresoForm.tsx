import Link from 'next/link';
import { toDateInput } from '@/lib/utils';
import type { Congreso } from '@prisma/client';
import { Field, TextArea, Checkbox, SubmitButton } from '@/components/admin-ui';
import { CoverField } from '@/components/CoverField';
import { Collapsible } from '@/components/Collapsible';
import { MarkdownBodyField } from '@/components/MarkdownBodyField';
import { GalleryField } from '@/components/GalleryField';
import { FileField } from '@/components/FileField';

function toInputDate(d?: Date | null) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

export function CongresoForm({
  action,
  congreso,
  covers,
}: {
  action: (formData: FormData) => void;
  congreso?: Congreso;
  covers: string[];
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {congreso && <input type="hidden" name="id" value={congreso.id} />}

      <Field label="Título" name="title" required defaultValue={congreso?.title} placeholder="Nombre del congreso o actividad" />
      <TextArea label="Descripción (resumen)" name="description" rows={2} defaultValue={congreso?.description} placeholder="Resumen corto que aparece en la tarjeta" hint="Aparece en el listado." />
      <MarkdownBodyField name="body" label="Contenido (opcional)" defaultValue={congreso?.body} />
      <GalleryField name="gallery" defaultValue={congreso?.gallery} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Autor (opcional)" name="author" defaultValue={congreso?.author} placeholder="Ej: Comité editorial" />
        <Field label="Enlace de fuente (opcional)" name="sourceUrl" defaultValue={congreso?.sourceUrl} placeholder="https://… (leer más / fuente)" />
      </div>
      <FileField
        label="Documento adjunto (opcional)"
        name="document"
        defaultValue={congreso?.document}
        hint="PDF u Office. Aparece como botón de descarga en el detalle."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Fecha de inicio" name="startDate" type="date" defaultValue={toInputDate(congreso?.startDate)} />
        <Field label="Fecha de fin" name="endDate" type="date" defaultValue={toInputDate(congreso?.endDate)} />
      </div>
      <Field label="Lugar" name="location" defaultValue={congreso?.location} placeholder="Ciudad, país o modalidad" />
      <Field label="Enlace (URL)" name="linkUrl" defaultValue={congreso?.linkUrl} placeholder="https://…" hint="Programa, inscripción o galería." />
      <CoverField name="coverImage" defaultValue={congreso?.coverImage} covers={covers} />
      <Collapsible title="Opciones avanzadas — SEO, fecha de publicación y etiquetas">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Fecha de publicación (opcional)" name="publishedAt" type="date" defaultValue={toDateInput(congreso?.publishedAt)} hint="Vacía: se usa hoy al publicar. Fecha futura: se publica sola ese día." />
          <Field label="Etiquetas (opcional)" name="tags" defaultValue={congreso?.tags} placeholder="Ej: salud mental, infancia" hint="Separadas por comas." />
        </div>
        <Field label="Título SEO" name="seoTitle" defaultValue={congreso?.seoTitle} placeholder="Título para buscadores (si difiere del título)" />
        <TextArea label="Descripción SEO" name="seoDescription" rows={2} defaultValue={congreso?.seoDescription} hint="Ideal 120–160 caracteres." />
      </Collapsible>
      <Checkbox label="Destacar (aparece primero y con distintivo)" name="featured" defaultChecked={congreso?.featured ?? false} />
      <Checkbox label="Publicar (visible en el sitio)" name="published" defaultChecked={congreso?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar congreso</SubmitButton>
        <Link href="/admin/congresos" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
