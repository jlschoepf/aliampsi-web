import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { NoticiaBody } from '@/components/NoticiaBody';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const n = await prisma.noticia.findUnique({ where: { slug: params.slug } });
  return { title: n?.title ?? 'Noticia' };
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
  if (!n.published && !preview) notFound();

  const cover = n.coverImage || '/noticia-default.png';
  const docName = n.document ? decodeURIComponent(n.document.split('/').pop() || 'documento') : '';

  return (
    <article className="wrap max-w-3xl py-16 lg:py-20">
      {!n.published && (
        <div className="mb-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
          Vista previa — este contenido está sin publicar. Solo lo ves como administrador.
        </div>
      )}
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
      <img src={cover} alt="" className="mt-8 w-full rounded-xl2 border border-line object-cover" />

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
    </article>
  );
}
