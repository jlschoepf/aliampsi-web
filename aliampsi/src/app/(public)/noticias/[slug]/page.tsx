import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { NoticiaBody } from '@/components/NoticiaBody';
import { getSession } from '@/lib/auth';
import { NoticiaCard, SectionHeading } from '@/components/content';
import { isVisibleNow, parseTags, pickRelated, visibleNowWhere } from '@/lib/content';
import { JsonLd } from '@/components/JsonLd';
import { SITE_NAME, absUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const n = await prisma.noticia.findUnique({ where: { slug: params.slug } });
  if (!n) return { title: 'Noticia' };
  const img = absUrl(n.coverImage);
  const title = n.seoTitle || n.title;
  const desc = n.seoDescription || n.excerpt || undefined;
  return {
    title,
    description: desc,
    alternates: { canonical: `/noticias/${n.slug}` },
    robots: n.published ? undefined : { index: false, follow: false },
    openGraph: {
      type: 'article',
      title,
      description: desc,
      url: `/noticias/${n.slug}`,
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: [img] },
  };
}

export default async function NoticiaDetail({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { preview?: string };
}) {
  const n = await prisma.noticia.findUnique({ where: { slug: params.slug } });
  if (!n) notFound();
  const preview = searchParams?.preview === '1' && !!(await getSession());
  const visible = isVisibleNow(n);
  if (!visible && !preview) notFound();

  const relatedPool = await prisma.noticia.findMany({ where: visibleNowWhere() });
  const related = pickRelated(relatedPool, n, 3);

  const cover = n.coverImage || '/noticia-default.png';
  const docName = n.document ? decodeURIComponent(n.document.split('/').pop() || 'documento') : '';

  return (
    <>
    <article className="wrap max-w-3xl py-16 lg:py-20">
      {!visible && (
        <div className="mb-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
          Vista previa — este contenido no está visible públicamente (borrador o programado). Solo lo ves como administrador.
        </div>
      )}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: n.title,
          description: n.excerpt || undefined,
          image: [absUrl(n.coverImage)],
          datePublished: (n.publishedAt ?? n.createdAt).toISOString(),
          dateModified: n.updatedAt.toISOString(),
          author: { '@type': 'Organization', name: n.author || SITE_NAME },
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: { '@type': 'ImageObject', url: absUrl('/emblem.png') },
          },
          mainEntityOfPage: absUrl(`/noticias/${n.slug}`),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: absUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Noticias', item: absUrl('/noticias') },
            { '@type': 'ListItem', position: 3, name: n.title, item: absUrl(`/noticias/${n.slug}`) },
          ],
        }}
      />
      <Link href="/noticias" className="text-sm font-semibold text-teal-600 hover:text-coral">
        ← Volver a noticias
      </Link>
      <time className="mt-8 block text-sm font-medium uppercase tracking-wider text-teal-600">
        {formatDate(n.publishedAt ?? n.createdAt)}
      </time>
      <h1 className="mt-3 text-4xl font-extrabold leading-tight">{n.title}</h1>
      {n.author && <p className="mt-2 text-sm text-ink-muted">Por {n.author}</p>}
      {n.excerpt && <p className="mt-4 text-lg text-ink-muted">{n.excerpt}</p>}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cover} alt={n.title} className="mt-8 w-full rounded-xl2 border border-line object-cover" />

      <NoticiaBody content={n.content} />

      {n.document && (
        <a
          href={n.document}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-coral hover:text-coral"
        >
          📎 Descargar documento
          <span className="text-xs font-normal text-ink-muted">({docName})</span>
        </a>
      )}

      {n.sourceUrl && (
        <p className="mt-6">
          <a href={n.sourceUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal-600 hover:text-coral">
            Fuente / leer más →
          </a>
        </p>
      )}
      {parseTags(n.tags).length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
          {parseTags(n.tags).map((t) => (
            <a key={t} href={`/etiqueta/${encodeURIComponent(t)}`} className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink-muted transition hover:bg-teal-600/10 hover:text-teal-700">
              #{t}
            </a>
          ))}
        </div>
      )}
    </article>
    {related.length > 0 && (
      <section className="wrap pb-16 lg:pb-24">
        <SectionHeading eyebrow="Seguir leyendo" title="Contenidos relacionados" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => <NoticiaCard key={r.id} n={r} />)}
        </div>
      </section>
    )}
    </>
  );
}
