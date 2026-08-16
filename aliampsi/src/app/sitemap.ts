import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = [
    '',
    '/quienes-somos',
    '/comision-directiva',
    '/asociaciones',
    '/noticias',
    '/congresos',
    '/publicaciones',
    '/contacto',
  ];
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p || '/'}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [noticias, publicaciones, congresos] = await Promise.all([
      prisma.noticia.findMany({ where: { published: true } }),
      prisma.publicacion.findMany({ where: { published: true } }),
      prisma.congreso.findMany({ where: { published: true } }),
    ]);
    dynamicRoutes = [
      ...noticias.map((n) => ({
        url: `${SITE_URL}/noticias/${n.slug}`,
        lastModified: n.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
      ...publicaciones.map((p) => ({
        url: `${SITE_URL}/publicaciones/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
      ...congresos.map((c) => ({
        url: `${SITE_URL}/congresos/${c.id}`,
        lastModified: c.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
    ];
  } catch {
    // si la base no responde, al menos devolvemos las estáticas
  }

  return [...staticRoutes, ...dynamicRoutes];
}
