import { requireAdmin } from '@/lib/auth';
import { AdminNav } from '@/components/AdminNav';
import { UpdateBanner } from '@/components/UpdateBanner';

export const metadata = { title: 'Administración' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-sand/40 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-ink lg:block">
        <AdminNav email={user.email} />
      </aside>

      {/* Barra superior en móvil */}
      <div className="bg-ink lg:hidden">
        <AdminNav email={user.email} />
      </div>

      <div className="min-w-0">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">{children}</div>
      </div>

      <UpdateBanner />
    </div>
  );
}
