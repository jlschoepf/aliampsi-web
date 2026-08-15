import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { IndicadorForm } from '../IndicadorForm';
import { updateIndicador } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarIndicador({ params }: { params: { id: string } }) {
  const indicador = await prisma.indicador.findUnique({ where: { id: params.id } });
  if (!indicador) notFound();
  return (
    <>
      <AdminHeader title="Editar indicador" subtitle={indicador.label} />
      <IndicadorForm action={updateIndicador} indicador={indicador} />
    </>
  );
}
