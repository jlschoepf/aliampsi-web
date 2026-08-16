import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { NoticiaBody } from '@/components/NoticiaBody';
import { getSession } from '@/lib/auth';
import { JsonLd } from '@/components/JsonLd';
import { SITE_NAME, absUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const p = await prisma.publicacion.findUnique({ where: { id: params.id } });
  if (!p) return { title: 'Publicación' };
  const img = absUrl(p.coverImage);
  const desc = p.description || undefined;
  return {
    title: p.title,
    description: desc,
    alternates: { canonical: `/publicaciones/${p.id}` },
    robots: p.published ? undefined : { index: false, follow: false },
    openGraph: {
      type: 'article',
      title: p.title,
      description: desc,
      url: `/publicaciones/${p.id}`,
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: p.title, description: desc, images: [img] },
  };
}

export default async function PublicacionDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { preview?: string };
}) {
  const p = await prisma.publicacion.findUnique({ where: { id: params.id } });
  if (!p) notFound();
  const preview = searchParams?.preview === '1' && !!(await getSession());
  if (!p.published && !preview) notFound();
  const kindLabel = p.kind === 'revista' ? 'Revista' : p.kind === 'articulo' ? 'Artículo' : 'Documento';

  return (
    <article className="wrap max-w-3xl py-16 lg:py-20">
      {!p.published && (
        <div className="mb-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
          Vista previa — este contenido está sin publicar. Solo lo ves como administrador.
        </div>
      )}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: p.title,
          description: p.description || undefined,
          image: [absUrl(p.coverImage)],
          dateModified: p.updatedAt.toISOString(),
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: { '@type': 'ImageObject', url: absUrl('/emblem.png') },
          },
          mainEntityOfPage: absUrl(`/publicaciones/${p.id}`),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: absUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Publicaciones', item: absUrl('/publicaciones') },
            { '@type': 'ListItem', position: 3, name: p.title, item: absUrl(`/publicaciones/${p.id}`) },
          ],
        }}
      />
      <Link href="/publicaciones" className="text-sm font-semibold text-teal-600 hover:text-coral">
        ← Volver a publicaciones
      </Link>
      <span className="mt-8 inline-block rounded-full bg-teal-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
        {kindLabel}
      </span>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink">{p.title}</h1>
      {p.description && <p className="mt-4 text-lg text-ink-muted">{p.description}</p>}
      {p.author && <p className="mt-2 text-sm text-ink-muted">Por {p.author}</p>}

      {p.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.coverImage} alt={p.title} className="mt-8 w-full rounded-xl2 border border-line object-cover" />
      )}

      {p.body && <NoticiaBody content={p.body} />}

      {p.document && (
        <a
          href={p.document}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-coral hover:text-coral"
        >
          📎 Descargar documento
        </a>
      )}

      {p.linkUrl && (
        <div className="mt-8">
          <a href={p.linkUrl} target="_blank" rel="noreferrer" className="btn-primary inline-flex">
            Acceder a la publicación
          </a>
        </div>
      )}

      {p.sourceUrl && (
        <p className="mt-6">
          <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal-600 hover:text-coral">
            Fuente / leer más →
          </a>
        </p>
      )}
    </article>
  );
}
