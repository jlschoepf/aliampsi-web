import { AdminHeader } from '@/components/admin-ui';
import { AsociacionForm } from '../AsociacionForm';
import { createAsociacion } from '../actions';

export default function NuevaAsociacion() {
  return (
    <>
      <AdminHeader title="Nueva asociación" />
      <AsociacionForm action={createAsociacion} />
    </>
  );
}
