import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { AsociacionForm } from '../AsociacionForm';
import { updateAsociacion } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarAsociacion({ params }: { params: { id: string } }) {
  const asociacion = await prisma.asociacion.findUnique({ where: { id: params.id } });
  if (!asociacion) notFound();
  return (
    <>
      <AdminHeader title="Editar asociación" subtitle={asociacion.name} />
      <AsociacionForm action={updateAsociacion} asociacion={asociacion} />
    </>
  );
}
