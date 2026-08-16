import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const n = await prisma.noticia.findUnique({ where: { slug: params.slug } });
  return { title: n?.title ?? 'Noticia' };
}

export default async function NoticiaDetail({ params }: { params: { slug: string } }) {
  const n = await prisma.noticia.findUnique({ where: { slug: params.slug } });
  if (!n || !n.published) notFound();

  const cover = n.coverImage || '/noticia-default.png';
  const docName = n.document ? decodeURIComponent(n.document.split('/').pop() || 'documento') : '';

  return (
    <article className="wrap max-w-3xl py-16 lg:py-20">
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

      <div className="prose-content mt-8 space-y-4 text-ink/90">
        {n.content.split('\n').filter(Boolean).map((para, i) => (
          <p key={i} className="leading-relaxed">{para}</p>
        ))}
      </div>

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
