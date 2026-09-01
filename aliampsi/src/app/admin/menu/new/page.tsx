import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { MenuItemForm } from '../MenuItemForm';
import { createMenuItem } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NuevoMenuItem() {
  // Solo los ítems de primer nivel pueden contener opciones (un solo nivel de anidado).
  const padres = await prisma.menuItem.findMany({
    where: { parentId: null, cta: false },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, label: true },
  });
  return (
    <>
      <AdminHeader title="Nuevo enlace de menú" />
      <MenuItemForm action={createMenuItem} padresPosibles={padres} />
    </>
  );
}
