import { AdminHeader } from '@/components/admin-ui';
import { AutoridadForm } from '../AutoridadForm';
import { createAutoridad } from '../actions';

export default function NuevaAutoridad() {
  return (
    <>
      <AdminHeader title="Nueva autoridad" />
      <AutoridadForm action={createAutoridad} />
    </>
  );
}
