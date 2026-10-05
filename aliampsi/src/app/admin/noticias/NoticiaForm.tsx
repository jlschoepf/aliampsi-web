import Link from 'next/link';
import { toDateInput } from '@/lib/utils';
import type { Noticia } from '@prisma/client';
import { Field, TextArea, Checkbox, SubmitButton, Select } from '@/components/admin-ui';
import { CoverField } from '@/components/CoverField';
import { Collapsible } from '@/components/Collapsible';
import { FileField } from '@/components/FileField';
import { BodyEditor } from '@/components/BodyEditor';
import { SlugField } from '@/components/SlugField';
import { GalleryField } from '@/components/GalleryField';

export function NoticiaForm({
  action,
  noticia,
  covers,
}: {
  action: (formData: FormData) => void;
  noticia?: Noticia;
  covers: string[];
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {noticia && <input type="hidden" name="id" value={noticia.id} />}

      <Field label="Título" name="title" required defaultValue={noticia?.title} placeholder="Título de la noticia" />
      <SlugField defaultValue={noticia?.slug} publicada={Boolean(noticia?.published)} />
      <TextArea
        label="Resumen"
        name="excerpt"
        rows={2}
        defaultValue={noticia?.excerpt}
        placeholder="Breve resumen que aparece en las tarjetas"
        hint="Aparece en el listado y en la portada."
      />
      <BodyEditor name="content" defaultValue={noticia?.content} />
      <GalleryField name="gallery" defaultValue={noticia?.gallery} />
      <CoverField name="coverImage" defaultValue={noticia?.coverImage} covers={covers} />
      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Encuadre de la portada" name="coverFit" defaultValue={noticia?.coverFit ?? 'auto'} options={[
          { value: 'auto', label: 'Automático (recomendado)' },
          { value: 'top', label: 'Mostrar la parte de arriba' },
          { value: 'center', label: 'Mostrar el centro' },
          { value: 'bottom', label: 'Mostrar la parte de abajo' },
          { value: 'contain', label: 'Mostrar la imagen entera' },
        ]} />
        <div className="flex items-end pb-2"><Checkbox label="Mostrar la portada también al comienzo del texto" name="coverEnCuerpo" defaultChecked={noticia?.coverEnCuerpo ?? true} /></div>
      </div>
      <p className="-mt-2 text-xs text-ink-muted">Automático: las imágenes verticales o cuadradas (flyers) se ven enteras, con la misma imagen desenfocada de fondo; las horizontales llenan el recuadro.</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Autor (opcional)" name="author" defaultValue={noticia?.author} placeholder="Ej: Comité de Comunicación" />
        <Field label="Enlace de fuente (opcional)" name="sourceUrl" defaultValue={noticia?.sourceUrl} placeholder="https://… (leer más / fuente)" />
      </div>
      <FileField
        label="Documento adjunto (opcional)"
        name="document"
        defaultValue={noticia?.document}
        hint="PDF u Office. Aparece como botón de descarga en la noticia."
      />
      <Collapsible title="Opciones avanzadas — SEO, fecha de publicación y etiquetas">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Fecha de publicación (opcional)" name="publishedAt" type="date" defaultValue={toDateInput(noticia?.publishedAt)} hint="Vacía: se usa hoy al publicar. Fecha futura: se publica sola ese día." />
          <Field label="Etiquetas (opcional)" name="tags" defaultValue={noticia?.tags} placeholder="Ej: salud mental, infancia" hint="Separadas por comas." />
        </div>
        <Field label="Título SEO" name="seoTitle" defaultValue={noticia?.seoTitle} placeholder="Título para buscadores (si difiere del título)" />
        <TextArea label="Descripción SEO" name="seoDescription" rows={2} defaultValue={noticia?.seoDescription} hint="Ideal 120–160 caracteres." />
      </Collapsible>
      <Checkbox label="Destacar (aparece primero y con distintivo)" name="featured" defaultChecked={noticia?.featured ?? false} />
      <Checkbox label="Publicar (visible en el sitio)" name="published" defaultChecked={noticia?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar noticia</SubmitButton>
        <Link href="/admin/noticias" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
