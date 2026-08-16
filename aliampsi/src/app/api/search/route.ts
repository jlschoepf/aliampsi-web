import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { visibleNowWhere } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get('q') || '').trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const like = { contains: q, mode: 'insensitive' as const };

  try {
    const [noticias, publicaciones, congresos] = await Promise.all([
      prisma.noticia.findMany({
        where: { AND: [visibleNowWhere(), { OR: [{ title: like }, { excerpt: like }, { tags: like }] }] },
        orderBy: { publishedAt: 'desc' },
        take: 4,
      }),
      prisma.publicacion.findMany({
        where: { AND: [visibleNowWhere(), { OR: [{ title: like }, { description: like }, { tags: like }] }] },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      prisma.congreso.findMany({
        where: { AND: [visibleNowWhere(), { OR: [{ title: like }, { description: like }, { tags: like }, { location: like }] }] },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    const results = [
      ...noticias.map((n) => ({ id: n.id, type: 'Noticia', title: n.title, href: `/noticias/${n.slug}`, image: n.coverImage || '/noticia-default.png' })),
      ...publicaciones.map((p) => ({ id: p.id, type: 'Publicación', title: p.title, href: `/publicaciones/${p.id}`, image: p.coverImage })),
      ...congresos.map((c) => ({ id: c.id, type: 'Congreso', title: c.title, href: `/congresos/${c.id}`, image: c.coverImage })),
    ];

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
