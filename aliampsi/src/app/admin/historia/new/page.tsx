import { AdminHeader } from '@/components/admin-ui';
import { HitoForm } from '../HitoForm';
import { createHito } from '../actions';

export default function NuevoHito() {
  return (
    <>
      <AdminHeader title="Nuevo hito" />
      <HitoForm action={createHito} />
    </>
  );
}
