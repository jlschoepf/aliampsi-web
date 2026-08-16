import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { CongresoForm } from '../CongresoForm';
import { updateCongreso } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarCongreso({ params }: { params: { id: string } }) {
  const [congreso, portadas] = await Promise.all([
    prisma.congreso.findUnique({ where: { id: params.id } }),
    prisma.portada.findMany({ orderBy: { order: 'asc' } }),
  ]);
  if (!congreso) notFound();
  return (
    <>
      <AdminHeader title="Editar congreso" subtitle={congreso.title} />
      <CongresoForm action={updateCongreso} congreso={congreso} covers={portadas.map((p) => p.url)} />
    </>
  );
}
