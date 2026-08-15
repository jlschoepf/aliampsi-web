import Link from 'next/link';
import type { Indicador } from '@prisma/client';
import { Field, Select, Checkbox, SubmitButton } from '@/components/admin-ui';

export function IndicadorForm({
  action,
  indicador,
}: {
  action: (formData: FormData) => void;
  indicador?: Indicador;
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {indicador && <input type="hidden" name="id" value={indicador.id} />}

      <Field
        label="Número o texto"
        name="value"
        required
        defaultValue={indicador?.value}
        placeholder='Ej: 15, +20, o "Iberoamérica"'
        hint="Si es un número (o empieza con +), se anima con un conteo. Si es texto, se muestra tal cual."
      />
      <Field label="Etiqueta" name="label" required defaultValue={indicador?.label} placeholder="Ej: Asociaciones integrantes" />
      <Select
        label="Ícono"
        name="icon"
        defaultValue={indicador?.icon ?? ''}
        options={[
          { value: '', label: 'Automático (según la etiqueta)' },
          { value: 'users', label: 'Personas' },
          { value: 'calendar', label: 'Calendario' },
          { value: 'building', label: 'Institución' },
          { value: 'globe', label: 'Globo / región' },
          { value: 'award', label: 'Premio' },
          { value: 'book', label: 'Publicación' },
          { value: 'graduation', label: 'Formación' },
          { value: 'heart', label: 'Corazón' },
          { value: 'star', label: 'Estrella' },
          { value: 'sparkles', label: 'Destello' },
        ]}
      />
      <Field label="Orden" name="order" type="number" defaultValue={indicador?.order ?? 0} hint="Número menor aparece primero." />
      <Checkbox label="Publicar (visible en la portada)" name="published" defaultChecked={indicador?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar indicador</SubmitButton>
        <Link href="/admin/indicadores" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
