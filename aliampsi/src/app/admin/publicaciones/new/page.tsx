import { AdminHeader } from '@/components/admin-ui';
import { PublicacionForm } from '../PublicacionForm';
import { createPublicacion } from '../actions';

export default function NuevaPublicacion() {
  return (
    <>
      <AdminHeader title="Nueva publicación" />
      <PublicacionForm action={createPublicacion} />
    </>
  );
}
