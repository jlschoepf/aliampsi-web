import Link from 'next/link';
import { Wordmark } from '@/components/Wordmark';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Ingresar',
  robots: { index: false, follow: false },
};

const AVISOS: Record<string, string> = {
  'clave-cambiada': 'Tu contraseña se cambió. Ingresá con la nueva.',
  'sesion-vencida': 'Tu sesión se cerró porque la contraseña de la cuenta cambió.',
};

export default function LoginPage({ searchParams }: { searchParams: { estado?: string } }) {
  const aviso = AVISOS[searchParams?.estado || ''];

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand/50 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark className="text-2xl" />
          <p className="mt-2 text-sm text-ink-muted">Panel de administración</p>
        </div>

        {aviso && (
          <p
            role="status"
            className="mb-4 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700"
          >
            {aviso}
          </p>
        )}

        <LoginForm />

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-ink-muted hover:text-coral">← Volver al sitio</Link>
        </p>
      </div>
    </div>
  );
}
