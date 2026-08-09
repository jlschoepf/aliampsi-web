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
      {n.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={n.coverImage} alt="" className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-sand">
          <span className="font-display text-4xl text-teal-600/40">·</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
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
    <article className="card flex flex-col p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-coral">
        <span>Congreso</span>
        {c.location && <span className="text-ink-muted">· {c.location}</span>}
      </div>
      <h3 className="mt-3 text-xl font-semibold leading-snug">{c.title}</h3>
      {dateLabel && <p className="mt-1 text-sm font-medium text-teal-600">{dateLabel}</p>}
      {c.description && <p className="mt-3 flex-1 text-sm text-ink-muted">{c.description}</p>}
      {c.linkUrl && (
        <a href={c.linkUrl} target="_blank" rel="noreferrer" className="btn-ghost mt-5 self-start">
          Ver programa
        </a>
      )}
    </article>
  );
}

export function PublicacionCard({ p }: { p: Publicacion }) {
  const kindLabel = p.kind === 'revista' ? 'Revista' : p.kind === 'articulo' ? 'Artículo' : 'Documento';
  return (
    <article className="card flex flex-col p-6">
      <span className="w-fit rounded-full bg-teal-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
        {kindLabel}
      </span>
      <h3 className="mt-3 font-serif text-xl italic leading-snug text-ink">{p.title}</h3>
      {p.description && <p className="mt-2 flex-1 text-sm text-ink-muted">{p.description}</p>}
      {p.linkUrl && (
        <a href={p.linkUrl} target="_blank" rel="noreferrer" className="btn-primary mt-5 self-start">
          Acceder
        </a>
      )}
    </article>
  );
}

export function AsociacionCard({ a }: { a: Asociacion }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        {a.logoImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.logoImage}
            alt={`Logo de ${a.name}`}
            className="h-12 w-12 shrink-0 rounded-xl border border-line bg-white object-contain p-1"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-paper">
            {a.acronym ? a.acronym.slice(0, 4) : a.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        {a.country && (
          <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-ink-muted">
            {a.country}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold leading-snug">{a.name}</h3>
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
