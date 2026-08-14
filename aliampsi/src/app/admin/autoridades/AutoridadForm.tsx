import Link from 'next/link';
import type { Autoridad } from '@prisma/client';
import { Field, TextArea, Checkbox, SubmitButton } from '@/components/admin-ui';
import { ImageField } from '@/components/ImageField';

export function AutoridadForm({
  action,
  autoridad,
}: {
  action: (formData: FormData) => void;
  autoridad?: Autoridad;
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {autoridad && <input type="hidden" name="id" value={autoridad.id} />}

      <Field label="Nombre" name="name" required defaultValue={autoridad?.name} placeholder="Nombre y apellido" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Cargo" name="role" defaultValue={autoridad?.role} placeholder="Ej: Presidente/a" />
        <Field label="País" name="country" defaultValue={autoridad?.country} placeholder="Ej: Uruguay" />
      </div>
      <TextArea label="Reseña" name="bio" rows={4} defaultValue={autoridad?.bio} placeholder="Breve reseña profesional" />
      <ImageField label="Foto" name="photo" defaultValue={autoridad?.photo} hint="Opcional. Subí un archivo o pegá una URL." />
      <Field label="Orden" name="order" type="number" defaultValue={autoridad?.order ?? 0} hint="Número menor aparece primero." />
      <Checkbox label="Publicar (visible en el sitio)" name="published" defaultChecked={autoridad?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar autoridad</SubmitButton>
        <Link href="/admin/autoridades" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
