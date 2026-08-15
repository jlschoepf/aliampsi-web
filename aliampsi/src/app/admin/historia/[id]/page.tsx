import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { HitoForm } from '../HitoForm';
import { updateHito } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarHito({ params }: { params: { id: string } }) {
  const hito = await prisma.hito.findUnique({ where: { id: params.id } });
  if (!hito) notFound();
  return (
    <>
      <AdminHeader title="Editar hito" subtitle={hito.fecha} />
      <HitoForm action={updateHito} hito={hito} />
    </>
  );
}
