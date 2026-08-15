import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { BannerForm } from '../BannerForm';
import { updateBanner } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditarBanner({ params }: { params: { id: string } }) {
  const banner = await prisma.banner.findUnique({ where: { id: params.id } });
  if (!banner) notFound();
  return (
    <>
      <AdminHeader title="Editar banner" subtitle={banner.title} />
      <BannerForm action={updateBanner} banner={banner} />
    </>
  );
}
