import Link from 'next/link';
import type { Noticia } from '@prisma/client';
import { Field, TextArea, Checkbox, SubmitButton } from '@/components/admin-ui';
import { ImageField } from '@/components/ImageField';
import { FileField } from '@/components/FileField';
import { MarkdownBodyField } from '@/components/MarkdownBodyField';

export function NoticiaForm({
  action,
  noticia,
}: {
  action: (formData: FormData) => void;
  noticia?: Noticia;
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {noticia && <input type="hidden" name="id" value={noticia.id} />}

      <Field label="Título" name="title" required defaultValue={noticia?.title} placeholder="Título de la noticia" />
      <TextArea
        label="Resumen"
        name="excerpt"
        rows={2}
        defaultValue={noticia?.excerpt}
        placeholder="Breve resumen que aparece en las tarjetas"
        hint="Aparece en el listado y en la portada."
      />
      <MarkdownBodyField name="content" defaultValue={noticia?.content} />
      <ImageField
        label="Imagen de portada"
        name="coverImage"
        defaultValue={noticia?.coverImage}
        hint="Opcional. Si no ponés una, se usa la imagen genérica de AL·IAM·PSI."
      />
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
      <Checkbox label="Publicar (visible en el sitio)" name="published" defaultChecked={noticia?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar noticia</SubmitButton>
        <Link href="/admin/noticias" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
