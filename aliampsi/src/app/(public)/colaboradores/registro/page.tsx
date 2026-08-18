import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getColaborador } from '@/lib/colaborador-auth';
import { registrarColaborador } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Crear cuenta de colaborador', robots: { index: false, follow: false } };

const ERRORES: Record<string, string> = {
  faltan: 'Completá todos los campos obligatorios.',
  clave: 'La contraseña debe tener al menos 8 caracteres.',
  existe: 'Ya existe una cuenta con ese correo. Podés ingresar directamente.',
};

export default async function RegistroPage({ searchParams }: { searchParams: { error?: string } }) {
  if (await getColaborador()) redirect('/colaboradores/panel');
  const error = searchParams?.error ? ERRORES[searchParams.error] : null;

  return (
    <section className="wrap max-w-xl py-16 lg:py-20">
      <p className="eyebrow"><span className="text-coral">·</span> Colaboradores</p>
      <h1 className="mt-4 text-4xl font-extrabold">Crear cuenta</h1>
      <p className="mt-4 text-ink-muted">
        Registrá los datos de tu asociación una sola vez. Después, para enviar contenido solo vas a
        tener que escribir la noticia.
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
          {error}
        </p>
      )}

      <form action={registrarColaborador} className="card mt-8 space-y-5 p-6 sm:p-8">
        <div>
          <label htmlFor="name" className="field-label">Nombre y apellido *</label>
          <input id="name" name="name" required className="field" placeholder="Quién va a cargar el contenido" />
        </div>
        <div>
          <label htmlFor="orgName" className="field-label">Asociación o institución *</label>
          <input id="orgName" name="orgName" required className="field" placeholder="Ej: Sociedad Uruguaya de Psiquiatría…" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="country" className="field-label">País</label>
            <input id="country" name="country" className="field" placeholder="Uruguay" />
          </div>
          <div>
            <label htmlFor="phone" className="field-label">Teléfono</label>
            <input id="phone" name="phone" className="field" placeholder="+598 …" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="field-label">Correo electrónico *</label>
          <input id="email" name="email" type="email" required className="field" placeholder="nombre@institucion.org" />
        </div>
        <div>
          <label htmlFor="password" className="field-label">Contraseña *</label>
          <input id="password" name="password" type="password" required minLength={8} className="field" placeholder="Mínimo 8 caracteres" />
        </div>
        <button type="submit" className="btn-coral">Crear cuenta</button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        ¿Ya tenés cuenta?{' '}
        <Link href="/colaboradores/ingresar" className="font-semibold text-teal-600 hover:text-coral">Ingresá acá</Link>
      </p>
    </section>
  );
}
