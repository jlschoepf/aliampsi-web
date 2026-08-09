import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { NoticiaForm } from '../NoticiaForm';
import { updateNoticia } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarNoticia({ params }: { params: { id: string } }) {
  const noticia = await prisma.noticia.findUnique({ where: { id: params.id } });
  if (!noticia) notFound();
  return (
    <>
      <AdminHeader title="Editar noticia" subtitle={noticia.title} />
      <NoticiaForm action={updateNoticia} noticia={noticia} />
    </>
  );
}
