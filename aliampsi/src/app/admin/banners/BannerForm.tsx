import Link from 'next/link';
import type { Banner } from '@prisma/client';
import { Field, TextArea, Checkbox, SubmitButton } from '@/components/admin-ui';
import { ImageField } from '@/components/ImageField';

export function BannerForm({
  action,
  banner,
}: {
  action: (formData: FormData) => void;
  banner?: Banner;
}) {
  return (
    <form action={action} className="card space-y-5 p-6">
      {banner && <input type="hidden" name="id" value={banner.id} />}

      <Field label="Título" name="title" required defaultValue={banner?.title} placeholder="Título principal del banner" />
      <Field label="Bajada / etiqueta (opcional)" name="eyebrow" defaultValue={banner?.eyebrow} placeholder="Texto chico arriba del título" />
      <TextArea label="Texto (opcional)" name="text" rows={3} defaultValue={banner?.text} placeholder="Descripción o mensaje del banner" />
      <ImageField label="Imagen de fondo" name="image" defaultValue={banner?.image} hint="Recomendado: horizontal (16:9). Si no ponés imagen, se usa un fondo con la identidad de la Alianza." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Botón 1 — texto (opcional)" name="ctaLabel" defaultValue={banner?.ctaLabel} placeholder="Ej: Conocé la Alianza" />
        <Field label="Botón 1 — enlace" name="ctaUrl" defaultValue={banner?.ctaUrl} placeholder="Ej: /quienes-somos" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Botón 2 — texto (opcional)" name="cta2Label" defaultValue={banner?.cta2Label} placeholder="Ej: Asociar mi institución" />
        <Field label="Botón 2 — enlace" name="cta2Url" defaultValue={banner?.cta2Url} placeholder="Ej: /contacto" />
      </div>
      <Field label="Orden" name="order" type="number" defaultValue={banner?.order ?? 0} hint="Número menor aparece primero." />
      <Checkbox label="Publicar (visible en la portada)" name="published" defaultChecked={banner?.published ?? true} />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton>Guardar banner</SubmitButton>
        <Link href="/admin/banners" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
