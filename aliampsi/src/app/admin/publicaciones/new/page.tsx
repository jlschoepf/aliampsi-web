import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { PublicacionForm } from '../PublicacionForm';
import { createPublicacion } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NuevaPublicacion() {
  const portadas = await prisma.portada.findMany({ orderBy: { order: 'asc' } });
  return (
    <>
      <AdminHeader title="Nueva publicación" />
      <PublicacionForm action={createPublicacion} covers={portadas.map((p) => p.url)} />
    </>
  );
}
