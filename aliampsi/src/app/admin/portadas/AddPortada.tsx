import { ImageField } from '@/components/ImageField';
import { SubmitButton } from '@/components/admin-ui';
import { createPortada } from './actions';

export function AddPortada() {
  return (
    <form action={createPortada} className="card space-y-4 p-6">
      <ImageField
        label="Nueva portada"
        name="url"
        hint="Subí una imagen (ideal horizontal 16:9) o pegá una URL. Se sumará a la galería de noticias."
      />
      <SubmitButton>Agregar a la galería</SubmitButton>
    </form>
  );
}
