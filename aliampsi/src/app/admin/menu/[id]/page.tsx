import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { MenuItemForm } from '../MenuItemForm';
import { updateMenuItem } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarMenuItem({ params }: { params: { id: string } }) {
  const item = await prisma.menuItem.findUnique({ where: { id: params.id } });
  if (!item) notFound();
  // No se puede colgar de sí mismo ni de otro que ya sea una opción.
  const padres = await prisma.menuItem.findMany({
    where: { parentId: null, cta: false, id: { not: params.id } },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, label: true },
  });
  return (
    <>
      <AdminHeader title="Editar enlace" subtitle={item.label} />
      <MenuItemForm action={updateMenuItem} item={item} padresPosibles={padres} />
    </>
  );
}
