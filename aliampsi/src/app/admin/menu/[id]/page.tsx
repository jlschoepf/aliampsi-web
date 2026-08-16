import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { MenuItemForm } from '../MenuItemForm';
import { updateMenuItem } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarMenuItem({ params }: { params: { id: string } }) {
  const item = await prisma.menuItem.findUnique({ where: { id: params.id } });
  if (!item) notFound();
  return (
    <>
      <AdminHeader title="Editar enlace" subtitle={item.label} />
      <MenuItemForm action={updateMenuItem} item={item} />
    </>
  );
}
