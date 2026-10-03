import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Gracias', robots: { index: false, follow: false } };

export default async function Gracias({ params, searchParams }: { params: { slug: string }; searchParams: { cert?: string } }) {
  const enc = await prisma.encuesta.findUnique({ where: { slug: params.slug }, select: { gracias: true } });
  return (
    <section className="wrap max-w-2xl py-24 text-center">
      <p className="text-5xl" aria-hidden="true">✓</p>
      <h1 className="mt-4 text-3xl font-extrabold">Respuesta enviada</h1>
      <p className="mt-4 text-lg text-ink-muted">{enc?.gracias || '¡Muchas gracias por responder!'}</p>
      {searchParams.cert && (
        <p className="mx-auto mt-4 max-w-md rounded-lg bg-sand/50 px-4 py-3 text-ink">
          {searchParams.cert === 'enviado'
            ? 'Le enviamos su certificado de asistencia por correo electrónico. Si no lo ve en unos minutos, revise la carpeta de correo no deseado.'
            : searchParams.cert === 'ya'
            ? 'Su certificado de asistencia ya le fue enviado a ese correo.'
            : 'Recibimos su pedido de certificado. Se lo enviaremos por correo en los próximos días.'}
        </p>
      )}
      <Link href="/" className="btn-primary mt-8 inline-flex">Ir a aliampsi.com</Link>
    </section>
  );
}
