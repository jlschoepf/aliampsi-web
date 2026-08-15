import { AdminHeader } from '@/components/admin-ui';
import { BannerForm } from '../BannerForm';
import { createBanner } from '../actions';

export default function NuevoBanner() {
  return (
    <>
      <AdminHeader title="Nuevo banner" />
      <BannerForm action={createBanner} />
    </>
  );
}
