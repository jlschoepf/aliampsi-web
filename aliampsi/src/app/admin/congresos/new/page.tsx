import { AdminHeader } from '@/components/admin-ui';
import { CongresoForm } from '../CongresoForm';
import { createCongreso } from '../actions';

export default function NuevoCongreso() {
  return (
    <>
      <AdminHeader title="Nuevo congreso" />
      <CongresoForm action={createCongreso} />
    </>
  );
}
