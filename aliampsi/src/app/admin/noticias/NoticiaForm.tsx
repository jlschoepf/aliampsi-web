import Link from 'next/link';
import type { Noticia } from '@prisma/client';
import { Field, TextArea, Checkbox, SubmitButton } from '@/components/admin-ui';
import { ImageField } from '@/components/ImageField';

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
      <TextArea
        label="Contenido"
        name="content"
        rows={10}
        defaultValue={noticia?.content}
        placeholder="Texto completo de la noticia. Separá los párrafos con un salto de línea."
        hint="Cada salto de línea genera un párrafo."
      />
      <ImageField
        label="Imagen de portada"
        name="coverImage"
        defaultValue={noticia?.coverImage}
        hint="Opcional. Subí un archivo o pegá una URL."
      />
      <Checkbox label="Publicar (visible en el sitio)" name="published" defaultChecked={noticia?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar noticia</SubmitButton>
        <Link href="/admin/noticias" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
