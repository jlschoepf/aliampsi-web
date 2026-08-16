import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { NoticiaBody } from '@/components/NoticiaBody';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const p = await prisma.publicacion.findUnique({ where: { id: params.id } });
  return { title: p?.title ?? 'Publicación' };
}

export default async function PublicacionDetail({ params }: { params: { id: string } }) {
  const p = await prisma.publicacion.findUnique({ where: { id: params.id } });
  if (!p || !p.published) notFound();
  const kindLabel = p.kind === 'revista' ? 'Revista' : p.kind === 'articulo' ? 'Artículo' : 'Documento';

  return (
    <article className="wrap max-w-3xl py-16 lg:py-20">
      <Link href="/publicaciones" className="text-sm font-semibold text-teal-600 hover:text-coral">
        ← Volver a publicaciones
      </Link>
      <span className="mt-8 inline-block rounded-full bg-teal-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
        {kindLabel}
      </span>
      <h1 className="mt-3 font-serif text-4xl italic leading-tight text-ink">{p.title}</h1>
      {p.description && <p className="mt-4 text-lg text-ink-muted">{p.description}</p>}

      {p.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.coverImage} alt="" className="mt-8 w-full rounded-xl2 border border-line object-cover" />
      )}

      {p.body && <NoticiaBody content={p.body} />}

      {p.linkUrl && (
        <a href={p.linkUrl} target="_blank" rel="noreferrer" className="btn-primary mt-8 inline-flex">
          Acceder a la publicación
        </a>
      )}
    </article>
  );
}
