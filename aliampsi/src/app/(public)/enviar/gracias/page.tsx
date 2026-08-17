import Link from 'next/link';

export const metadata = { title: 'Envío recibido', robots: { index: false, follow: false } };

export default function GraciasPage() {
  return (
    <section className="wrap max-w-2xl py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-600/10 text-3xl">✓</div>
      <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">¡Recibimos tu envío!</h1>
      <p className="mt-4 text-lg text-ink-muted">
        Muchas gracias. El equipo de AL·IAM·PSI lo va a revisar y, si hace falta, se comunicará con vos
        al correo que dejaste.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/enviar" className="btn-ghost">Enviar otro contenido</Link>
        <Link href="/" className="btn-coral">Volver al inicio</Link>
      </div>
    </section>
  );
}
