import Link from 'next/link';
import type { Asociacion } from '@prisma/client';
import { Field, TextArea, Checkbox, SubmitButton } from '@/components/admin-ui';
import { ImageField } from '@/components/ImageField';

export function AsociacionForm({
  action,
  asociacion,
}: {
  action: (formData: FormData) => void;
  asociacion?: Asociacion;
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {asociacion && <input type="hidden" name="id" value={asociacion.id} />}

      <Field label="Nombre" name="name" required defaultValue={asociacion?.name} placeholder="Nombre completo de la asociación" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Sigla" name="acronym" defaultValue={asociacion?.acronym} placeholder="Ej: AEPNYA" />
        <Field label="País" name="country" defaultValue={asociacion?.country} placeholder="Ej: España" />
      </div>
      <TextArea label="Descripción" name="description" rows={3} defaultValue={asociacion?.description} placeholder="Breve descripción" />
      <Field label="Sitio web (URL)" name="website" defaultValue={asociacion?.website} placeholder="https://…" />
      <ImageField label="Logo" name="logoImage" defaultValue={asociacion?.logoImage} hint="Opcional. Subí un archivo o pegá una URL." />
      <Field label="Orden" name="order" type="number" defaultValue={asociacion?.order ?? 0} hint="Número menor aparece primero." />
      <Checkbox label="Publicar (visible en el sitio)" name="published" defaultChecked={asociacion?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar asociación</SubmitButton>
        <Link href="/admin/asociaciones" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
