import Link from 'next/link';
import { prisma } from '@/lib/db';
import { requireColaborador } from '@/lib/colaborador-auth';
import { formatDate } from '@/lib/utils';
import { salirColaborador, actualizarPerfil } from '../actions';
import { Collapsible } from '@/components/Collapsible';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mi panel — Colaboradores', robots: { index: false, follow: false } };

const TIPO_LABEL: Record<string, string> = {
  noticia: 'Noticia',
  congreso: 'Congreso',
  publicacion: 'Publicación',
  otro: 'Otro',
};

function EstadoChip({ status }: { status: string }) {
  const estilo: Record<string, string> = {
    pendiente: 'bg-coral/15 text-coral-dark',
    aprobado: 'bg-teal-600/10 text-teal-700',
    rechazado: 'bg-sand text-ink-muted',
  };
  const texto: Record<string, string> = {
    pendiente: 'En revisión',
    aprobado: 'Aprobado',
    rechazado: 'No publicado',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${estilo[status] || estilo.pendiente}`}>
      {texto[status] || status}
    </span>
  );
}

export default async function PanelColaborador({ searchParams }: { searchParams: { ok?: string } }) {
  const sesion = await requireColaborador();
  const [perfil, envios] = await Promise.all([
    prisma.colaborador.findUnique({ where: { id: sesion.id } }),
    prisma.envio.findMany({ where: { colaboradorId: sesion.id }, orderBy: { createdAt: 'desc' } }),
  ]);

  const aprobados = envios.filter((e) => e.status === 'aprobado').length;
  const pendientes = envios.filter((e) => e.status === 'pendiente').length;

  return (
    <section className="wrap max-w-4xl py-16 lg:py-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow"><span className="text-coral">·</span> Colaboradores</p>
          <h1 className="mt-4 text-4xl font-extrabold">Hola, {sesion.name.split(' ')[0]}</h1>
          <p className="mt-2 text-ink-muted">{perfil?.orgName}</p>
        </div>
        <form action={salirColaborador}>
          <button type="submit" className="btn-ghost">Cerrar sesión</button>
        </form>
      </div>

      {searchParams?.ok === 'perfil' && (
        <p className="mt-6 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">
          Datos actualizados.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="font-display text-3xl font-extrabold text-ink">{envios.length}</p>
          <p className="text-sm text-ink-muted">Envíos realizados</p>
        </div>
        <div className="card p-5">
          <p className="font-display text-3xl font-extrabold text-teal-700">{aprobados}</p>
          <p className="text-sm text-ink-muted">Publicados</p>
        </div>
        <div className="card p-5">
          <p className="font-display text-3xl font-extrabold text-coral">{pendientes}</p>
          <p className="text-sm text-ink-muted">En revisión</p>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/enviar" className="btn-coral">+ Enviar contenido nuevo</Link>
      </div>

      <h2 className="mt-12 font-display text-2xl font-bold text-ink">Mis envíos</h2>
      {envios.length === 0 ? (
        <div className="card mt-4 p-10 text-center text-ink-muted">
          Todavía no enviaste contenido. Cuando lo hagas, vas a poder seguir su estado desde acá.
        </div>
      ) : (
        <div className="card mt-4 divide-y divide-line">
          {envios.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <EstadoChip status={e.status} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600">
                    {TIPO_LABEL[e.tipo] || e.tipo}
                    {e.tipo === 'otro' && e.tipoOtro ? `: ${e.tipoOtro}` : ''}
                  </span>
                </p>
                <p className="mt-1 truncate font-medium text-ink">{e.title}</p>
                <p className="text-xs text-ink-muted">{formatDate(e.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12">
        <Collapsible title="Mis datos (se usan automáticamente en cada envío)">
          <form action={actualizarPerfil} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="field-label">Nombre y apellido</label>
                <input id="name" name="name" required defaultValue={perfil?.name} className="field" />
              </div>
              <div>
                <label htmlFor="orgName" className="field-label">Asociación</label>
                <input id="orgName" name="orgName" required defaultValue={perfil?.orgName} className="field" />
              </div>
              <div>
                <label htmlFor="country" className="field-label">País</label>
                <input id="country" name="country" defaultValue={perfil?.country} className="field" />
              </div>
              <div>
                <label htmlFor="phone" className="field-label">Teléfono</label>
                <input id="phone" name="phone" defaultValue={perfil?.phone} className="field" />
              </div>
            </div>
            <p className="text-xs text-ink-muted">
              Correo de la cuenta: <strong>{perfil?.email}</strong> (no se puede cambiar)
            </p>
            <button type="submit" className="btn-primary">Guardar datos</button>
          </form>
        </Collapsible>
      </div>
    </section>
  );
}
