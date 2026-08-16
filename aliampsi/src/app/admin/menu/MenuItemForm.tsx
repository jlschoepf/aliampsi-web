import Link from 'next/link';
import type { MenuItem } from '@prisma/client';
import { Field, Checkbox, SubmitButton } from '@/components/admin-ui';

export function MenuItemForm({
  action,
  item,
}: {
  action: (formData: FormData) => void;
  item?: MenuItem;
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Nombre" name="label" required defaultValue={item?.label} placeholder="Ej: Quiénes somos" />
      <Field
        label="Enlace"
        name="href"
        required
        defaultValue={item?.href}
        placeholder="Ej: /quienes-somos o https://…"
        hint="Interno (empieza con /) o externo (https://…)."
      />
      <Field label="Orden" name="order" type="number" defaultValue={item?.order ?? 0} hint="Número menor aparece primero." />
      <Checkbox label="Abrir en una pestaña nueva" name="newTab" defaultChecked={item?.newTab ?? false} />
      <Checkbox label="Mostrarlo como botón destacado (coral)" name="cta" defaultChecked={item?.cta ?? false} />
      <Checkbox label="Visible en el sitio" name="published" defaultChecked={item?.published ?? true} />
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar</SubmitButton>
        <Link href="/admin/menu" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
