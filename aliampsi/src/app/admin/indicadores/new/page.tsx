import { AdminHeader } from '@/components/admin-ui';
import { IndicadorForm } from '../IndicadorForm';
import { createIndicador } from '../actions';

export default function NuevoIndicador() {
  return (
    <>
      <AdminHeader title="Nuevo indicador" />
      <IndicadorForm action={createIndicador} />
    </>
  );
}
