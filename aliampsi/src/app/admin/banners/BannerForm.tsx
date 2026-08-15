import Link from 'next/link';
import type { Banner } from '@prisma/client';
import { Field, TextArea, Checkbox, Select, SubmitButton } from '@/components/admin-ui';
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
        <Select
          label="Velo sobre la imagen"
          name="overlay"
          defaultValue={banner?.overlay ?? 'dark'}
          options={[
            { value: 'dark', label: 'Oscuro (foto atenuada)' },
            { value: 'light', label: 'Claro (foto aclarada)' },
            { value: 'none', label: 'Sin velo' },
          ]}
        />
        <Select
          label="Color del texto"
          name="textColor"
          defaultValue={banner?.textColor ?? 'light'}
          options={[
            { value: 'light', label: 'Claro (letras blancas)' },
            { value: 'dark', label: 'Oscuro (letras negras)' },
          ]}
        />
      </div>
      <p className="-mt-2 text-xs text-ink-muted">
        Estas dos opciones aplican cuando el banner tiene imagen de fondo. Para la foto clara con
        letras oscuras del sitio original: velo «Claro» + texto «Oscuro».
      </p>
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
