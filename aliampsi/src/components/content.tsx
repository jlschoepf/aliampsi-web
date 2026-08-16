import Link from 'next/link';
import { formatDate, formatDateRange } from '@/lib/utils';
import type { Noticia, Congreso, Publicacion, Asociacion } from '@prisma/client';

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="eyebrow">
            <span className="text-coral">·</span> {eyebrow}
          </p>
        )}
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h2>
        {intro && <p className="mt-3 text-ink-muted">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function NoticiaCard({ n }: { n: Noticia }) {
  return (
    <Link
      href={`/noticias/${n.slug}`}
      className="group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={n.coverImage || '/noticia-default.png'} alt={n.title} className="h-44 w-full object-cover" />
      <div className="flex flex-1 flex-col p-5">
        {n.featured && <span className="mb-2 w-fit rounded-full bg-coral px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Destacado</span>}
        <time className="text-xs font-medium uppercase tracking-wider text-teal-600">
          {formatDate(n.publishedAt ?? n.createdAt)}
        </time>
        <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-coral">{n.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-muted">{n.excerpt}</p>
        <span className="mt-4 text-sm font-semibold text-ink">Leer más →</span>
      </div>
    </Link>
  );
}

export function CongresoCard({ c }: { c: Congreso }) {
  const dateLabel = formatDateRange(c.startDate, c.endDate);
  return (
    <article className="card flex flex-col overflow-hidden">
      {c.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.coverImage} alt={c.title} className="h-40 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-6">
        {c.featured && <span className="mb-2 w-fit rounded-full bg-coral px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Destacado</span>}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-coral">
          <span>Congreso</span>
          {c.location && <span className="text-ink-muted">· {c.location}</span>}
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-snug">{c.title}</h3>
        {dateLabel && <p className="mt-1 text-sm font-medium text-teal-600">{dateLabel}</p>}
        {c.description && <p className="mt-3 flex-1 text-sm text-ink-muted">{c.description}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link href={`/congresos/${c.id}`} className="text-sm font-semibold text-teal-600 hover:text-coral">
            Leer más →
          </Link>
          {c.linkUrl && (
            <a href={c.linkUrl} target="_blank" rel="noreferrer" className="btn-ghost">
              Ver programa
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function PublicacionCard({ p }: { p: Publicacion }) {
  const kindLabel = p.kind === 'revista' ? 'Revista' : p.kind === 'articulo' ? 'Artículo' : 'Documento';
  return (
    <article className="card flex flex-col overflow-hidden">
      {p.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.coverImage} alt={p.title} className="h-40 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-6">
        {p.featured && <span className="mb-2 w-fit rounded-full bg-coral px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Destacado</span>}
        <span className="w-fit rounded-full bg-teal-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
          {kindLabel}
        </span>
        <h3 className="mt-3 font-serif text-xl italic leading-snug text-ink">{p.title}</h3>
        {p.description && <p className="mt-2 flex-1 text-sm text-ink-muted">{p.description}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link href={`/publicaciones/${p.id}`} className="text-sm font-semibold text-teal-600 hover:text-coral">
            Leer más →
          </Link>
          {p.linkUrl && (
            <a href={p.linkUrl} target="_blank" rel="noreferrer" className="btn-primary">
              Acceder
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function AsociacionCard({ a }: { a: Asociacion }) {
  const body = (
    <>
      <div className="flex h-28 items-center justify-center rounded-xl border border-line bg-white p-5">
        {a.logoImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.logoImage}
            alt={`Logo de ${a.name}`}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="font-display text-2xl font-bold text-ink/70">
            {a.acronym ? a.acronym.slice(0, 6) : a.name.slice(0, 3).toUpperCase()}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug">{a.name}</h3>
        {a.country && (
          <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-ink-muted">
            {a.country}
          </span>
        )}
      </div>
      {a.description && <p className="mt-2 text-sm text-ink-muted">{a.description}</p>}
      {a.website && (
        <span className="mt-4 inline-block text-sm font-semibold text-teal-600 group-hover:text-coral">
          Visitar sitio →
        </span>
      )}
    </>
  );

  const className = 'group card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5';
  return a.website ? (
    <a href={a.website} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}
