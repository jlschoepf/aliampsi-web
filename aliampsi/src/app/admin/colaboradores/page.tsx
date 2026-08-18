import { prisma } from '@/lib/db';
import { AdminHeader } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { formatDate } from '@/lib/utils';
import { toggleColaborador, deleteColaborador } from './actions';

export const dynamic = 'force-dynamic';

const TIPO_LABEL: Record<string, string> = {
  noticia: 'Noticias',
  congreso: 'Congresos',
  publicacion: 'Publicaciones',
  otro: 'Otros',
};

export default async function AdminColaboradores() {
  const [colaboradores, envios] = await Promise.all([
    prisma.colaborador.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.envio.findMany(),
  ]);

  // Resumen por colaborador
  const resumen = colaboradores.map((c) => {
    const suyos = envios.filter((e) => e.colaboradorId === c.id);
    const porTipo: Record<string, number> = {};
    suyos.forEach((e) => {
      porTipo[e.tipo] = (porTipo[e.tipo] || 0) + 1;
    });
    return {
      c,
      total: suyos.length,
      aprobados: suyos.filter((e) => e.status === 'aprobado').length,
      pendientes: suyos.filter((e) => e.status === 'pendiente').length,
      porTipo,
      ultimo: suyos.length
        ? suyos.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)).createdAt
        : null,
    };
  });
  resumen.sort((a, b) => b.total - a.total);

  // Totales generales
  const anonimos = envios.filter((e) => !e.colaboradorId).length;
  const totalPorTipo: Record<string, number> = {};
  envios.forEach((e) => {
    totalPorTipo[e.tipo] = (totalPorTipo[e.tipo] || 0) + 1;
  });

  return (
    <>
      <AdminHeader
        title="Colaboradores"
        subtitle="Quiénes envían contenido a la Alianza y cuánto aportan."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="font-display text-3xl font-extrabold text-ink">{colaboradores.length}</p>
          <p className="text-sm text-ink-muted">Colaboradores registrados</p>
        </div>
        <div className="card p-5">
          <p className="font-display text-3xl font-extrabold text-ink">{envios.length}</p>
          <p className="text-sm text-ink-muted">Envíos totales</p>
        </div>
        <div className="card p-5">
          <p className="font-display text-3xl font-extrabold text-teal-700">
            {envios.filter((e) => e.status === 'aprobado').length}
          </p>
          <p className="text-sm text-ink-muted">Aprobados</p>
        </div>
        <div className="card p-5">
          <p className="font-display text-3xl font-extrabold text-ink-muted">{anonimos}</p>
          <p className="text-sm text-ink-muted">Envíos sin cuenta</p>
        </div>
      </div>

      <div className="card mb-6 p-5">
        <p className="mb-3 text-sm font-semibold text-ink">Envíos por tipo</p>
        <div className="flex flex-wrap gap-4">
          {Object.keys(TIPO_LABEL).map((t) => (
            <div key={t} className="rounded-lg bg-sand/50 px-4 py-2">
              <span className="font-display text-xl font-bold text-ink">{totalPorTipo[t] || 0}</span>{' '}
              <span className="text-sm text-ink-muted">{TIPO_LABEL[t]}</span>
            </div>
          ))}
        </div>
      </div>

      {colaboradores.length === 0 ? (
        <div className="card p-10 text-center text-ink-muted">
          Todavía no hay colaboradores registrados. Compartí el enlace{' '}
          <strong>/colaboradores/registro</strong> con las asociaciones.
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {resumen.map(({ c, total, aprobados, pendientes, porTipo, ultimo }) => (
            <div key={c.id} className="flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium text-ink">
                  {c.name}
                  {!c.active && (
                    <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                      Suspendido
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-ink-muted">
                  {c.orgName}
                  {c.country && ` · ${c.country}`}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {c.email}
                  {c.phone && ` · ${c.phone}`}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Registrado el {formatDate(c.createdAt)}
                  {ultimo && ` · Último envío: ${formatDate(ultimo)}`}
                  {c.lastLoginAt && ` · Último ingreso: ${formatDate(c.lastLoginAt)}`}
                </p>
                {total > 0 && (
                  <p className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-ink-muted">
                    {Object.entries(porTipo).map(([t, n]) => (
                      <span key={t} className="rounded bg-sand px-2 py-0.5">
                        {n} {TIPO_LABEL[t] || t}
                      </span>
                    ))}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-5">
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-ink">{total}</p>
                  <p className="text-[11px] text-ink-muted">
                    {aprobados} aprobados · {pendientes} pendientes
                  </p>
                </div>
                <form action={toggleColaborador}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-sm font-medium text-teal-600 hover:text-coral">
                    {c.active ? 'Suspender' : 'Reactivar'}
                  </button>
                </form>
                <DeleteButton
                  action={deleteColaborador}
                  id={c.id}
                  confirmText={`¿Eliminar la cuenta de ${c.name}? Sus envíos se conservan.`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
