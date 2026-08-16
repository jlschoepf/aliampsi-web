import Link from 'next/link';
import type { Publicacion } from '@prisma/client';
import { Field, TextArea, Select, Checkbox, SubmitButton } from '@/components/admin-ui';
import { CoverField } from '@/components/CoverField';
import { MarkdownBodyField } from '@/components/MarkdownBodyField';

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
      <Field label="Enlace (URL)" name="linkUrl" defaultValue={publicacion?.linkUrl} placeholder="https://…" hint="Adónde lleva el botón “Acceder”." />
      <CoverField name="coverImage" defaultValue={publicacion?.coverImage} covers={covers} />
      <Checkbox label="Publicar (visible en el sitio)" name="published" defaultChecked={publicacion?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar publicación</SubmitButton>
        <Link href="/admin/publicaciones" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
