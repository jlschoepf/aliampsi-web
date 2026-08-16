import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { NoticiaForm } from '../NoticiaForm';
import { createNoticia } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NuevaNoticia() {
  const portadas = await prisma.portada.findMany({ orderBy: { order: 'asc' } });
  return (
    <>
      <AdminHeader title="Nueva noticia" subtitle="Creá una novedad para el sitio." />
      <NoticiaForm action={createNoticia} covers={portadas.map((p) => p.url)} />
    </>
  );
}
