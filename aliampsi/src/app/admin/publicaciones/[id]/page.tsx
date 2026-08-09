import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { PublicacionForm } from '../PublicacionForm';
import { updatePublicacion } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarPublicacion({ params }: { params: { id: string } }) {
  const publicacion = await prisma.publicacion.findUnique({ where: { id: params.id } });
  if (!publicacion) notFound();
  return (
    <>
      <AdminHeader title="Editar publicación" subtitle={publicacion.title} />
      <PublicacionForm action={updatePublicacion} publicacion={publicacion} />
    </>
  );
}
