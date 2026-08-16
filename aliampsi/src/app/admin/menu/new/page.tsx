import { AdminHeader } from '@/components/admin-ui';
import { MenuItemForm } from '../MenuItemForm';
import { createMenuItem } from '../actions';

export default function NuevoMenuItem() {
  return (
    <>
      <AdminHeader title="Nuevo enlace de menú" />
      <MenuItemForm action={createMenuItem} />
    </>
  );
}
