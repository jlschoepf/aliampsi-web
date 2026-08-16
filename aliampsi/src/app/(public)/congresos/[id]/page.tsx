import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { NoticiaBody } from '@/components/NoticiaBody';
import { formatDateRange } from '@/lib/utils';
import { getSession } from '@/lib/auth';
import { JsonLd } from '@/components/JsonLd';
import { SITE_NAME, absUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const c = await prisma.congreso.findUnique({ where: { id: params.id } });
  if (!c) return { title: 'Congreso' };
  const img = absUrl(c.coverImage);
  const title = c.seoTitle || c.title;
  const desc = c.seoDescription || c.description || undefined;
  return {
    title,
    description: desc,
    alternates: { canonical: `/congresos/${c.id}` },
    robots: c.published ? undefined : { index: false, follow: false },
    openGraph: {
      type: 'article',
      title,
      description: desc,
      url: `/congresos/${c.id}`,
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: [img] },
  };
}

export default async function CongresoDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { preview?: string };
}) {
  const c = await prisma.congreso.findUnique({ where: { id: params.id } });
  if (!c) notFound();
  const preview = searchParams?.preview === '1' && !!(await getSession());
  if (!c.published && !preview) notFound();
  const dateLabel = formatDateRange(c.startDate, c.endDate);

  return (
    <article className="wrap max-w-3xl py-16 lg:py-20">
      {!c.published && (
        <div className="mb-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
          Vista previa — este contenido está sin publicar. Solo lo ves como administrador.
        </div>
      )}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: c.title,
          description: c.description || undefined,
          startDate: c.startDate ? c.startDate.toISOString() : undefined,
          endDate: c.endDate ? c.endDate.toISOString() : undefined,
          image: [absUrl(c.coverImage)],
          location: c.location ? { '@type': 'Place', name: c.location } : undefined,
          organizer: { '@type': 'Organization', name: SITE_NAME, url: absUrl('/') },
          url: c.linkUrl || absUrl(`/congresos/${c.id}`),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: absUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Congresos', item: absUrl('/congresos') },
            { '@type': 'ListItem', position: 3, name: c.title, item: absUrl(`/congresos/${c.id}`) },
          ],
        }}
      />
      <Link href="/congresos" className="text-sm font-semibold text-teal-600 hover:text-coral">
        ← Volver a congresos
      </Link>
      <div className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-coral">
        <span>Congreso</span>
        {c.location && <span className="text-ink-muted">· {c.location}</span>}
      </div>
      <h1 className="mt-3 text-4xl font-extrabold leading-tight">{c.title}</h1>
      {dateLabel && <p className="mt-2 text-sm font-medium text-teal-600">{dateLabel}</p>}
      {c.description && <p className="mt-4 text-lg text-ink-muted">{c.description}</p>}
      {c.author && <p className="mt-2 text-sm text-ink-muted">Por {c.author}</p>}

      {c.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.coverImage} alt={c.title} className="mt-8 w-full rounded-xl2 border border-line object-cover" />
      )}

      {c.body && <NoticiaBody content={c.body} />}

      {c.document && (
        <a
          href={c.document}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-coral hover:text-coral"
        >
          📎 Descargar documento
        </a>
      )}

      {c.linkUrl && (
        <div className="mt-8">
          <a href={c.linkUrl} target="_blank" rel="noreferrer" className="btn-primary inline-flex">
            Ver programa / inscripción
          </a>
        </div>
      )}

      {c.sourceUrl && (
        <p className="mt-6">
          <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal-600 hover:text-coral">
            Fuente / leer más →
          </a>
        </p>
      )}
    </article>
  );
}
