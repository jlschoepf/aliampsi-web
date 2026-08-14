import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { AutoridadForm } from '../AutoridadForm';
import { updateAutoridad } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarAutoridad({ params }: { params: { id: string } }) {
  const autoridad = await prisma.autoridad.findUnique({ where: { id: params.id } });
  if (!autoridad) notFound();
  return (
    <>
      <AdminHeader title="Editar autoridad" subtitle={autoridad.name} />
      <AutoridadForm action={updateAutoridad} autoridad={autoridad} />
    </>
  );
}
