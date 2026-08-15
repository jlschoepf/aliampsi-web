import Link from 'next/link';
import type { Hito } from '@prisma/client';
import { Field, TextArea, Checkbox, SubmitButton } from '@/components/admin-ui';

export function HitoForm({
  action,
  hito,
}: {
  action: (formData: FormData) => void;
  hito?: Hito;
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {hito && <input type="hidden" name="id" value={hito.id} />}
      <Field label="Fecha / etiqueta" name="fecha" required defaultValue={hito?.fecha} placeholder="Ej: Noviembre 2020" />
      <TextArea label="Descripción" name="texto" rows={3} defaultValue={hito?.texto} placeholder="Qué pasó en ese hito" />
      <Field label="Orden" name="order" type="number" defaultValue={hito?.order ?? 0} hint="Número menor aparece primero." />
      <Checkbox label="Publicar (visible en el sitio)" name="published" defaultChecked={hito?.published ?? true} />
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar hito</SubmitButton>
        <Link href="/admin/historia" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
