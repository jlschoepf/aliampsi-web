import Link from 'next/link';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Gracias', robots: { index: false, follow: false } };

export default async function Gracias({ params }: { params: { slug: string } }) {
  const enc = await prisma.encuesta.findUnique({ where: { slug: params.slug }, select: { gracias: true } });
  return (
    <section className="wrap max-w-2xl py-24 text-center">
      <p className="text-5xl" aria-hidden="true">✓</p>
      <h1 className="mt-4 text-3xl font-extrabold">Respuesta enviada</h1>
      <p className="mt-4 text-lg text-ink-muted">{enc?.gracias || '¡Muchas gracias por responder!'}</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">Ir a aliampsi.com</Link>
    </section>
  );
}
