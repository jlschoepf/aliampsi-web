import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const FALLBACK = [
  { id: 'f1', label: 'Quiénes somos', href: '/quienes-somos', newTab: false, cta: false },
  { id: 'f2', label: 'Autoridades', href: '/comision-directiva', newTab: false, cta: false },
  { id: 'f3', label: 'Asociaciones', href: '/asociaciones', newTab: false, cta: false },
  { id: 'f4', label: 'Noticias', href: '/noticias', newTab: false, cta: false },
  { id: 'f5', label: 'Congresos', href: '/congresos', newTab: false, cta: false },
  { id: 'f6', label: 'Publicaciones', href: '/publicaciones', newTab: false, cta: false },
  { id: 'f7', label: 'Contacto', href: '/contacto', newTab: false, cta: false },
  { id: 'f8', label: 'Asociarse', href: '/contacto', newTab: false, cta: true },
];

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let items = FALLBACK;
  try {
    const rows = await prisma.menuItem.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });
    if (rows.length > 0) {
      items = rows.map((r) => ({ id: r.id, label: r.label, href: r.href, newTab: r.newTab, cta: r.cta }));
    }
  } catch {
    // usa el fallback
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader items={items} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
