import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [noticias, publicaciones, congresos, asociaciones, autoridades, banners] = await Promise.all([
    prisma.noticia.count(),
    prisma.publicacion.count(),
    prisma.congreso.count(),
    prisma.asociacion.count(),
    prisma.autoridad.count(),
    prisma.banner.count(),
  ]);

  const cards = [
    { label: 'Noticias', count: noticias, href: '/admin/noticias' },
    { label: 'Publicaciones', count: publicaciones, href: '/admin/publicaciones' },
    { label: 'Congresos', count: congresos, href: '/admin/congresos' },
    { label: 'Asociaciones', count: asociaciones, href: '/admin/asociaciones' },
    { label: 'Comisión Directiva', count: autoridades, href: '/admin/autoridades' },
    { label: 'Banners', count: banners, href: '/admin/banners' },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink">Panel de administración</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Gestioná los contenidos del sitio de AL·IAM·PSI.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5"
          >
            <p className="text-sm font-medium text-ink-muted">{c.label}</p>
            <p className="mt-2 font-display text-4xl font-extrabold text-ink">{c.count}</p>
            <p className="mt-3 text-sm font-semibold text-teal-600 group-hover:text-coral">
              Gestionar →
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 card p-6">
        <h2 className="font-display text-lg font-bold">Accesos rápidos</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/noticias/new" className="btn-ghost">+ Nueva noticia</Link>
          <Link href="/admin/publicaciones/new" className="btn-ghost">+ Nueva publicación</Link>
          <Link href="/admin/congresos/new" className="btn-ghost">+ Nuevo congreso</Link>
          <Link href="/admin/asociaciones/new" className="btn-ghost">+ Nueva asociación</Link>
          <Link href="/admin/autoridades/new" className="btn-ghost">+ Nueva autoridad</Link>
          <Link href="/admin/banners/new" className="btn-ghost">+ Nuevo banner</Link>
        </div>
      </div>
    </>
  );
}
