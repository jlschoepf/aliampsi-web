import Link from 'next/link';
import { toDateInput } from '@/lib/utils';
import type { Publicacion } from '@prisma/client';
import { Field, TextArea, Select, Checkbox, SubmitButton } from '@/components/admin-ui';
import { CoverField } from '@/components/CoverField';
import { Collapsible } from '@/components/Collapsible';
import { MarkdownBodyField } from '@/components/MarkdownBodyField';
import { GalleryField } from '@/components/GalleryField';
import { FileField } from '@/components/FileField';

export function PublicacionForm({
  action,
  publicacion,
  covers,
}: {
  action: (formData: FormData) => void;
  publicacion?: Publicacion;
  covers: string[];
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {publicacion && <input type="hidden" name="id" value={publicacion.id} />}

      <Field label="Título" name="title" required defaultValue={publicacion?.title} placeholder="Nombre de la publicación" />
      <Select
        label="Tipo"
        name="kind"
        defaultValue={publicacion?.kind ?? 'revista'}
        options={[
          { value: 'revista', label: 'Revista' },
          { value: 'articulo', label: 'Artículo' },
          { value: 'documento', label: 'Documento' },
        ]}
      />
      <TextArea label="Descripción (resumen)" name="description" rows={2} defaultValue={publicacion?.description} placeholder="Resumen corto que aparece en la tarjeta" hint="Aparece en el listado." />
      <MarkdownBodyField name="body" label="Contenido (opcional)" defaultValue={publicacion?.body} />
      <GalleryField name="gallery" defaultValue={publicacion?.gallery} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Autor (opcional)" name="author" defaultValue={publicacion?.author} placeholder="Ej: Comité editorial" />
        <Field label="Enlace de fuente (opcional)" name="sourceUrl" defaultValue={publicacion?.sourceUrl} placeholder="https://… (leer más / fuente)" />
      </div>
      <FileField
        label="Documento adjunto (opcional)"
        name="document"
        defaultValue={publicacion?.document}
        hint="PDF u Office. Aparece como botón de descarga en el detalle."
      />
      <Field label="Enlace (URL)" name="linkUrl" defaultValue={publicacion?.linkUrl} placeholder="https://…" hint="Adónde lleva el botón “Acceder”." />
      <CoverField name="coverImage" defaultValue={publicacion?.coverImage} covers={covers} />
      <Collapsible title="Opciones avanzadas — SEO, fecha de publicación y etiquetas">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Fecha de publicación (opcional)" name="publishedAt" type="date" defaultValue={toDateInput(publicacion?.publishedAt)} hint="Vacía: se usa hoy al publicar. Fecha futura: se publica sola ese día." />
          <Field label="Etiquetas (opcional)" name="tags" defaultValue={publicacion?.tags} placeholder="Ej: salud mental, infancia" hint="Separadas por comas." />
        </div>
        <Field label="Título SEO" name="seoTitle" defaultValue={publicacion?.seoTitle} placeholder="Título para buscadores (si difiere del título)" />
        <TextArea label="Descripción SEO" name="seoDescription" rows={2} defaultValue={publicacion?.seoDescription} hint="Ideal 120–160 caracteres." />
      </Collapsible>
      <Checkbox label="Destacar (aparece primero y con distintivo)" name="featured" defaultChecked={publicacion?.featured ?? false} />
      <Checkbox label="Publicar (visible en el sitio)" name="published" defaultChecked={publicacion?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar publicación</SubmitButton>
        <Link href="/admin/publicaciones" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
