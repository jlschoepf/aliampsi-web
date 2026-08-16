import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { NoticiaForm } from '../NoticiaForm';
import { updateNoticia } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarNoticia({ params }: { params: { id: string } }) {
  const [noticia, portadas] = await Promise.all([
    prisma.noticia.findUnique({ where: { id: params.id } }),
    prisma.portada.findMany({ orderBy: { order: 'asc' } }),
  ]);
  if (!noticia) notFound();
  return (
    <>
      <AdminHeader title="Editar noticia" subtitle={noticia.title} />
      <NoticiaForm action={updateNoticia} noticia={noticia} covers={portadas.map((p) => p.url)} />
    </>
  );
}
