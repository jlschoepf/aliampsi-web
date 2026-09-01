import Script from 'next/script';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { prisma } from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const FALLBACK = [
  { id: 'f1', label: 'La Alianza', href: '/quienes-somos', newTab: false, cta: false, parentId: null },
  { id: 'f1a', label: 'Quiénes somos', href: '/quienes-somos', newTab: false, cta: false, parentId: 'f1' },
  { id: 'f1b', label: 'Autoridades', href: '/comision-directiva', newTab: false, cta: false, parentId: 'f1' },
  { id: 'f1c', label: 'Asociaciones integrantes', href: '/asociaciones', newTab: false, cta: false, parentId: 'f1' },
  { id: 'f1d', label: 'Contacto', href: '/contacto', newTab: false, cta: false, parentId: 'f1' },
  { id: 'f4', label: 'Noticias', href: '/noticias', newTab: false, cta: false, parentId: null },
  { id: 'f6', label: 'Publicaciones', href: '/publicaciones', newTab: false, cta: false, parentId: null },
  { id: 'f5', label: 'Congresos', href: '/congresos', newTab: false, cta: false, parentId: null },
  { id: 'f7', label: 'Enviar contenido', href: '/enviar', newTab: false, cta: false, parentId: null },
  { id: 'f8', label: 'Asociarse', href: '/contacto', newTab: false, cta: true, parentId: null },
];

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let items = FALLBACK;
  try {
    const rows = await prisma.menuItem.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });
    if (rows.length > 0) {
      items = rows.map((r) => ({ id: r.id, label: r.label, href: r.href, newTab: r.newTab, cta: r.cta, parentId: r.parentId }));
    }
  } catch {
    // usa el fallback
  }

  const settings = await getSettings();
  const gaId = settings.gaId;

  return (
    <div className="flex min-h-screen flex-col">
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
          </Script>
        </>
      )}
      <SiteHeader items={items} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
