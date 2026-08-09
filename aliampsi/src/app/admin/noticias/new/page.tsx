import { AdminHeader } from '@/components/admin-ui';
import { NoticiaForm } from '../NoticiaForm';
import { createNoticia } from '../actions';

export default function NuevaNoticia() {
  return (
    <>
      <AdminHeader title="Nueva noticia" subtitle="Creá una novedad para el sitio." />
      <NoticiaForm action={createNoticia} />
    </>
  );
}
