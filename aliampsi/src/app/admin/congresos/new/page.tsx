import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { CongresoForm } from '../CongresoForm';
import { createCongreso } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NuevoCongreso() {
  const portadas = await prisma.portada.findMany({ orderBy: { order: 'asc' } });
  return (
    <>
      <AdminHeader title="Nuevo congreso" />
      <CongresoForm action={createCongreso} covers={portadas.map((p) => p.url)} />
    </>
  );
}
