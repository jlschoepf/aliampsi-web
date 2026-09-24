import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ahora = () => new Date();

/** Publicado y con fecha ya cumplida: lo que el visitante ve hoy. */
const enVivo = { published: true, OR: [{ publishedAt: null }, { publishedAt: { lte: ahora() } }] };
/** Sin publicar: borradores. */
const borrador = { published: false };
/** Publicado pero con fecha futura: sale solo ese día. */
const programado = { published: true, publishedAt: { gt: ahora() } };

export default async function AdminDashboard() {
  const [
    nVivo, nBorr, nProg,
    pVivo, pBorr, pProg,
    cVivo, cBorr, cProg,
    asociaciones, autoridades,
    colabTotal, colabActivos,
    envPend, envAprob, envRech,
    ultimasNoticias, ultimosEnvios,
  ] = await Promise.all([
    prisma.noticia.count({ where: enVivo }),
    prisma.noticia.count({ where: borrador }),
    prisma.noticia.count({ where: programado }),
    prisma.publicacion.count({ where: enVivo }),
    prisma.publicacion.count({ where: borrador }),
    prisma.publicacion.count({ where: programado }),
    prisma.congreso.count({ where: enVivo }),
    prisma.congreso.count({ where: borrador }),
    prisma.congreso.count({ where: programado }),
    prisma.asociacion.count(),
    prisma.autoridad.count(),
    prisma.colaborador.count(),
    prisma.colaborador.count({ where: { active: true } }),
    prisma.envio.count({ where: { status: 'pendiente' } }),
    prisma.envio.count({ where: { status: 'aprobado' } }),
    prisma.envio.count({ where: { status: 'rechazado' } }),
    prisma.noticia.findMany({
      where: enVivo,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      select: { id: true, title: true, publishedAt: true, createdAt: true },
    }),
    prisma.envio.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, orgName: true, status: true, createdAt: true },
    }),
  ]);

  const totalVivo = nVivo + pVivo + cVivo;
  const totalBorr = nBorr + pBorr + cBorr;
  const totalProg = nProg + pProg + cProg;

  const contenido = [
    { label: 'Noticias', vivo: nVivo, borr: nBorr, prog: nProg, href: '/admin/noticias' },
    { label: 'Publicaciones', vivo: pVivo, borr: pBorr, prog: pProg, href: '/admin/publicaciones' },
    { label: 'Congresos', vivo: cVivo, borr: cBorr, prog: cProg, href: '/admin/congresos' },
  ];

  const resumen = [
    { label: 'Publicado y visible', valor: totalVivo, nota: 'Lo que ve el visitante hoy', tono: 'teal' },
    { label: 'Sin publicar', valor: totalBorr, nota: 'Borradores a revisar', tono: totalBorr > 0 ? 'amber' : 'plain' },
    { label: 'Programado', valor: totalProg, nota: 'Sale solo en su fecha', tono: 'plain' },
    { label: 'Envíos sin revisar', valor: envPend, nota: 'Aportes de las asociaciones', tono: envPend > 0 ? 'coral' : 'plain' },
  ];

  const tono: Record<string, string> = {
    teal: 'text-teal-700',
    amber: 'text-amber-700',
    coral: 'text-coral-dark',
    plain: 'text-ink',
  };

  const estadoEnvio: Record<string, string> = {
    pendiente: 'bg-coral/10 text-coral-dark',
    aprobado: 'bg-teal-600/10 text-teal-700',
    rechazado: 'bg-ink/10 text-ink-muted',
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink">Panel de administración</h1>
        <p className="mt-1 text-sm text-ink-muted">Estado del sitio de AL·IAM·PSI.</p>
      </div>

      {envPend > 0 && (
        <Link
          href="/admin/envios"
          className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-coral/40 bg-coral/10 px-5 py-4 transition hover:bg-coral/15"
        >
          <span>
            <span className="block text-sm font-semibold text-coral-dark">
              {envPend} envío{envPend === 1 ? '' : 's'} sin revisar
            </span>
            <span className="block text-xs text-ink-muted">
              Contenidos que enviaron las asociaciones desde el formulario público.
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-coral-dark">Revisar →</span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resumen.map((r) => (
          <div key={r.label} className="card p-5">
            <p className="text-sm font-medium text-ink-muted">{r.label}</p>
            <p className={`mt-2 font-display text-4xl font-extrabold ${tono[r.tono]}`}>{r.valor}</p>
            <p className="mt-2 text-xs text-ink-muted">{r.nota}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-bold">Contenido</h2>
          <span className="text-xs text-ink-muted">Visible · Borrador · Programado</span>
        </div>
        <div className="divide-y divide-line">
          {contenido.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-sand/40"
            >
              <span className="font-medium text-ink">{c.label}</span>
              <span className="flex items-center gap-5 text-sm">
                <span className="font-semibold text-teal-700">{c.vivo}</span>
                <span className={c.borr > 0 ? 'font-semibold text-amber-700' : 'text-ink-muted'}>{c.borr}</span>
                <span className="text-ink-muted">{c.prog}</span>
                <span className="text-teal-600">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-line px-6 py-4">
            <h2 className="font-display text-lg font-bold">Últimas publicadas</h2>
          </div>
          {ultimasNoticias.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-ink-muted">Todavía no hay noticias publicadas.</p>
          ) : (
            <ul className="divide-y divide-line">
              {ultimasNoticias.map((n) => (
                <li key={n.id}>
                  <Link href={`/admin/noticias/${n.id}`} className="block px-6 py-3 transition hover:bg-sand/40">
                    <p className="truncate text-sm font-medium text-ink">{n.title}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{formatDate(n.publishedAt ?? n.createdAt)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-line px-6 py-4">
            <h2 className="font-display text-lg font-bold">Participación de la red</h2>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
            <div className="px-4 py-4 text-center">
              <p className="font-display text-2xl font-bold text-ink">{asociaciones}</p>
              <p className="mt-1 text-xs text-ink-muted">Asociaciones</p>
            </div>
            <div className="px-4 py-4 text-center">
              <p className="font-display text-2xl font-bold text-ink">{colabActivos}</p>
              <p className="mt-1 text-xs text-ink-muted">
                Colaboradores{colabTotal !== colabActivos ? ` de ${colabTotal}` : ''}
              </p>
            </div>
            <div className="px-4 py-4 text-center">
              <p className="font-display text-2xl font-bold text-ink">{autoridades}</p>
              <p className="mt-1 text-xs text-ink-muted">Autoridades</p>
            </div>
          </div>

          {ultimosEnvios.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-ink-muted">Todavía no hay envíos.</p>
          ) : (
            <ul className="divide-y divide-line">
              {ultimosEnvios.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/envios/${e.id}`} className="block px-6 py-3 transition hover:bg-sand/40">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{e.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          estadoEnvio[e.status] ?? 'bg-ink/10 text-ink-muted'
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {e.orgName || 'Sin organización'} · {formatDate(e.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-line px-6 py-3 text-xs text-ink-muted">
            Envíos: {envPend} sin revisar · {envAprob} aprobados · {envRech} rechazados
          </div>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <h2 className="font-display text-lg font-bold">Visitas al sitio</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Las estadísticas de visitantes, páginas más vistas y países se consultan en los paneles
          externos, que no consumen recursos de la base de datos.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="https://vercel.com/aliampsi/aliampsi-web/analytics" target="_blank" rel="noreferrer" className="btn-ghost">
            Visitantes y páginas ↗
          </a>
          <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="btn-ghost">
            Búsquedas en Google ↗
          </a>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <h2 className="font-display text-lg font-bold">Accesos rápidos</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/noticias/new" className="btn-ghost">+ Nueva noticia</Link>
          <Link href="/admin/publicaciones/new" className="btn-ghost">+ Nueva publicación</Link>
          <Link href="/admin/congresos/new" className="btn-ghost">+ Nuevo congreso</Link>
          <Link href="/admin/asociaciones/new" className="btn-ghost">+ Nueva asociación</Link>
          <Link href="/admin/autoridades/new" className="btn-ghost">+ Nueva autoridad</Link>
          <Link href="/admin/banners/new" className="btn-ghost">+ Nuevo banner</Link>
          <Link href="/admin/indicadores/new" className="btn-ghost">+ Nuevo indicador</Link>
        </div>
      </div>
    </>
  );
}
