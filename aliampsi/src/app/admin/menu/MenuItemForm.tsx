import Link from 'next/link';
import type { MenuItem } from '@prisma/client';
import { Field, Checkbox, Select, SubmitButton } from '@/components/admin-ui';

export function MenuItemForm({
  action,
  item,
  padresPosibles = [],
}: {
  action: (formData: FormData) => void;
  item?: MenuItem;
  padresPosibles?: { id: string; label: string }[];
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
      <Select
        label="Dentro del desplegable de"
        name="parentId"
        defaultValue={item?.parentId ?? ''}
        options={[
          { value: '', label: '— Ninguno: va suelto en la barra —' },
          ...padresPosibles.map((p) => ({ value: p.id, label: p.label })),
        ]}
      />
      <p className="-mt-3 text-sm text-ink-muted">
        Si elegís un ítem, este aparece como opción dentro de su desplegable en vez de ocupar
        lugar en la barra.
      </p>
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
