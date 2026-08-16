import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { NoticiaBody } from '@/components/NoticiaBody';
import { formatDateRange } from '@/lib/utils';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const c = await prisma.congreso.findUnique({ where: { id: params.id } });
  return { title: c?.title ?? 'Congreso' };
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

      {c.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.coverImage} alt="" className="mt-8 w-full rounded-xl2 border border-line object-cover" />
      )}

      {c.body && <NoticiaBody content={c.body} />}

      {c.linkUrl && (
        <a href={c.linkUrl} target="_blank" rel="noreferrer" className="btn-primary mt-8 inline-flex">
          Ver programa / inscripción
        </a>
      )}
    </article>
  );
}
