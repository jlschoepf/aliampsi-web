import Link from 'next/link';
import type { Congreso } from '@prisma/client';
import { Field, TextArea, Checkbox, SubmitButton } from '@/components/admin-ui';
import { CoverField } from '@/components/CoverField';
import { MarkdownBodyField } from '@/components/MarkdownBodyField';

function toInputDate(d?: Date | null) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

export function CongresoForm({
  action,
  congreso,
  covers,
}: {
  action: (formData: FormData) => void;
  congreso?: Congreso;
  covers: string[];
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {congreso && <input type="hidden" name="id" value={congreso.id} />}

      <Field label="Título" name="title" required defaultValue={congreso?.title} placeholder="Nombre del congreso o actividad" />
      <TextArea label="Descripción (resumen)" name="description" rows={2} defaultValue={congreso?.description} placeholder="Resumen corto que aparece en la tarjeta" hint="Aparece en el listado." />
      <MarkdownBodyField name="body" label="Contenido (opcional)" defaultValue={congreso?.body} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Fecha de inicio" name="startDate" type="date" defaultValue={toInputDate(congreso?.startDate)} />
        <Field label="Fecha de fin" name="endDate" type="date" defaultValue={toInputDate(congreso?.endDate)} />
      </div>
      <Field label="Lugar" name="location" defaultValue={congreso?.location} placeholder="Ciudad, país o modalidad" />
      <Field label="Enlace (URL)" name="linkUrl" defaultValue={congreso?.linkUrl} placeholder="https://…" hint="Programa, inscripción o galería." />
      <CoverField name="coverImage" defaultValue={congreso?.coverImage} covers={covers} />
      <Checkbox label="Publicar (visible en el sitio)" name="published" defaultChecked={congreso?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar congreso</SubmitButton>
        <Link href="/admin/congresos" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
