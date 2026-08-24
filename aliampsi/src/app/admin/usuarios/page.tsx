import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { AdminHeader } from '@/components/admin-ui';
import { DeleteButton } from '@/components/DeleteButton';
import { formatDate } from '@/lib/utils';
import { crearEnlaceRecuperacionAdmin } from '@/app/login/reset-actions';

export const dynamic = 'force-dynamic';

async function createUser(formData: FormData) {
  'use server';
  await requireAdmin();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) redirect('/admin/usuarios?msg=faltan');
  if (password.length < 10) redirect('/admin/usuarios?msg=corta');
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) redirect('/admin/usuarios?msg=existe');
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.create({ data: { email, name: name || null, passwordHash } });
  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios?msg=creado');
}

async function deleteUser(formData: FormData) {
  'use server';
  const session = await requireAdmin();
  const id = String(formData.get('id'));
  if (id === session.id) redirect('/admin/usuarios?msg=selfdelete');
  const count = await prisma.admin.count();
  if (count <= 1) redirect('/admin/usuarios?msg=ultimo');
  await prisma.admin.delete({ where: { id } });
  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios?msg=eliminado');
}

/** Genera a mano un enlace de recuperación, para pasárselo a esa persona. */
async function generarEnlaceAdmin(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) redirect('/admin/usuarios?msg=error');
  const url = await crearEnlaceRecuperacionAdmin(id);
  redirect(`/admin/usuarios?enlace=${encodeURIComponent(url)}`);
}

/** Marca un pedido de recuperación como ya atendido. */
async function marcarAtendido(formData: FormData) {
  'use server';
  await requireAdmin();
  await prisma.adminPasswordReset.update({
    where: { id: String(formData.get('id')) },
    data: { notified: true },
  });
  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios?msg=atendido');
}

async function changeMyPassword(formData: FormData) {
  'use server';
  const session = await requireAdmin();
  const current = String(formData.get('current') || '');
  const next = String(formData.get('next') || '');
  if (next.length < 10) redirect('/admin/usuarios?msg=corta');
  const me = await prisma.admin.findUnique({ where: { id: session.id } });
  if (!me) redirect('/admin/usuarios?msg=error');
  const ok = await bcrypt.compare(current, me.passwordHash);
  if (!ok) redirect('/admin/usuarios?msg=malactual');
  const passwordHash = await bcrypt.hash(next, 10);
  await prisma.admin.update({
    where: { id: session.id },
    data: { passwordHash, passwordChangedAt: new Date() },
  });
  redirect('/admin/usuarios?msg=passok');
}

const MESSAGES: Record<string, { text: string; ok: boolean }> = {
  creado: { text: 'Usuario creado correctamente.', ok: true },
  eliminado: { text: 'Usuario eliminado.', ok: true },
  passok: { text: 'Tu contraseña se actualizó.', ok: true },
  atendido: { text: 'Pedido marcado como atendido.', ok: true },
  existe: { text: 'Ya existe un usuario con ese correo.', ok: false },
  corta: { text: 'La contraseña debe tener al menos 10 caracteres.', ok: false },
  faltan: { text: 'Completá el correo y la contraseña.', ok: false },
  selfdelete: { text: 'No podés eliminar tu propio usuario.', ok: false },
  ultimo: { text: 'No se puede eliminar el último administrador.', ok: false },
  malactual: { text: 'La contraseña actual no es correcta.', ok: false },
  error: { text: 'Ocurrió un error. Probá de nuevo.', ok: false },
};

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: { msg?: string; enlace?: string };
}) {
  const session = await requireAdmin();
  const admins = await prisma.admin.findMany({ orderBy: { createdAt: 'asc' } });
  const msg = searchParams?.msg ? MESSAGES[searchParams.msg] : null;

  // Pedidos de recuperación vigentes cuyo correo no pudo enviarse.
  const pendientes = await prisma.adminPasswordReset.findMany({
    where: { notified: false, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <AdminHeader title="Usuarios" subtitle="Administradores con acceso al panel." />

      {pendientes.length > 0 && (
        <div className="mb-6 rounded-lg border border-coral/40 bg-coral/10 p-4">
          <p className="text-sm font-semibold text-coral-dark">
            {pendientes.length} pedido{pendientes.length === 1 ? '' : 's'} de recuperación
            sin poder avisar por correo
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Alguien pidió restablecer su contraseña y el correo automático no salió.
            Generá el enlace desde la lista de abajo y pasáselo por otra vía.
          </p>
          <div className="mt-3 space-y-2">
            {pendientes.map((p) => {
              const quien = admins.find((a) => a.id === p.adminId);
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded bg-white px-3 py-2"
                >
                  <span className="text-sm text-ink">
                    {quien ? quien.email : 'Cuenta eliminada'} · {formatDate(p.createdAt)}
                  </span>
                  <form action={marcarAtendido}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-ink-muted hover:text-ink"
                    >
                      Marcar atendido
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {searchParams?.enlace && (
        <div className="mb-6 rounded-lg border border-teal-600/30 bg-teal-600/5 p-4">
          <p className="text-sm font-semibold text-teal-700">Enlace de recuperación generado</p>
          <p className="mt-1 text-xs text-ink-muted">
            Copialo y pasáselo a esa persona por un medio seguro. Vence en una hora,
            sirve una sola vez y permite cambiar la contraseña de esa cuenta: no lo
            compartas con nadie más.
          </p>
          <p className="mt-2 break-all rounded bg-white px-3 py-2 font-mono text-xs text-ink">
            {searchParams.enlace}
          </p>
        </div>
      )}

      {msg && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
            msg.ok ? 'bg-teal-600/10 text-teal-700' : 'bg-coral/10 text-coral-dark'
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="card divide-y divide-line">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">
                {a.name || 'Administrador'}
                {a.id === session.id && (
                  <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-xs text-ink-muted">
                    vos
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {a.email} · desde {formatDate(a.createdAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <form action={generarEnlaceAdmin}>
                <input type="hidden" name="id" value={a.id} />
                <button
                  type="submit"
                  className="text-sm font-medium text-ink-muted hover:text-ink"
                >
                  Generar enlace de recuperación
                </button>
              </form>
              {a.id !== session.id && (
                <DeleteButton
                  action={deleteUser}
                  id={a.id}
                  label="Quitar acceso"
                  confirmText={`¿Quitar el acceso de ${a.email}?`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-line bg-sand/30 p-4">
        <p className="text-sm font-medium text-ink">Si alguien pierde su contraseña</p>
        <p className="mt-1 text-xs text-ink-muted">
          Puede pedir el enlace por su cuenta desde <strong>/login/recuperar</strong> y le
          llega por correo. Si el correo no funciona, generá el enlace desde acá y
          pasáselo. Conviene que siempre haya al menos dos administradores activos.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form action={createUser} className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-bold text-ink">Agregar administrador</h2>
          <div>
            <label className="field-label" htmlFor="name">Nombre</label>
            <input id="name" name="name" className="field" placeholder="Nombre y apellido" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Correo electrónico *</label>
            <input id="email" name="email" type="email" required className="field" placeholder="correo@ejemplo.com" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Contraseña *</label>
            <input id="password" name="password" type="text" required className="field" placeholder="Mínimo 10 caracteres" />
            <p className="mt-1 text-xs text-ink-muted">
              Compartila con la persona; luego podrá cambiarla desde acá.
            </p>
          </div>
          <button type="submit" className="btn-primary">Crear usuario</button>
        </form>

        <form action={changeMyPassword} className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-bold text-ink">Cambiar mi contraseña</h2>
          <div>
            <label className="field-label" htmlFor="current">Contraseña actual *</label>
            <input id="current" name="current" type="password" required className="field" placeholder="••••••••" />
          </div>
          <div>
            <label className="field-label" htmlFor="next">Nueva contraseña *</label>
            <input id="next" name="next" type="password" required className="field" placeholder="Mínimo 10 caracteres" />
          </div>
          <button type="submit" className="btn-primary">Actualizar contraseña</button>
        </form>
      </div>
    </>
  );
}
