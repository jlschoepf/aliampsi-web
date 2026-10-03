import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { normalizarPreguntas, preguntasQueSeResponden } from '@/lib/encuestas';
import { modoCert } from '@/lib/encuestas';
import { EncuestaForm } from './EncuestaForm';
import { enviarRespuesta, verificarCodigo } from './actions';
import { CodigoAcceso } from './CodigoAcceso';
import { cookieAcceso, firmaAcceso } from '@/lib/acceso';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // generar y enviar el certificado puede llevar unos segundos

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const enc = await prisma.encuesta.findUnique({ where: { slug: params.slug }, select: { titulo: true, portada: true } });
  return {
    title: enc?.titulo ?? 'Encuesta',
    robots: { index: false, follow: false },
    openGraph: enc?.portada ? { images: [enc.portada] } : undefined,
  };
}

export default async function EncuestaPage({ params, searchParams }: { params: { slug: string }; searchParams: { error?: string } }) {
  const enc = await prisma.encuesta.findUnique({ where: { slug: params.slug } });
  if (!enc) notFound();
  const admin = !!(await getSession());
  const previa = enc.estado !== 'abierta';
  if (previa && !admin) {
    return (
      <section className="wrap max-w-2xl py-20 text-center">
        <p className="eyebrow justify-center"><span className="text-coral">·</span> Encuesta</p>
        <h1 className="mt-4 text-3xl font-extrabold">{enc.titulo}</h1>
        <p className="mt-4 text-lg text-ink-muted">
          {enc.estado === 'cerrada' ? 'Esta encuesta ya cerró. ¡Gracias por su interés!' : 'Esta encuesta todavía no está disponible.'}
        </p>
      </section>
    );
  }
  const yaRespondio = !previa && cookies().get(`enc_${enc.id}`)?.value === '1';
  const pideCodigo = !previa && !!enc.codigoAcceso && cookies().get(cookieAcceso(enc.id))?.value !== firmaAcceso(enc.id, enc.codigoAcceso);
  const parrafos = enc.descripcion.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const preguntas = normalizarPreguntas(enc.preguntas);
  const cantidad = preguntasQueSeResponden(preguntas).length;
  const minutos = Math.max(1, Math.round((cantidad * 12) / 60)); // unos 12 segundos por pregunta

  return (
    <section className="wrap max-w-3xl py-14 lg:py-20">
      {previa && (
        <p className="mb-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
          Vista previa para administradores: la encuesta está en «{enc.estado}» y no recibe respuestas.
        </p>
      )}
      {enc.portada && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={enc.portada} alt="" className="mb-10 w-full rounded-2xl border border-line object-cover shadow-sm" />
      )}
      <h1 className="text-3xl font-extrabold sm:text-4xl">{enc.titulo}</h1>
      {cantidad > 0 && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-sand/60 px-3 py-1 text-sm font-medium text-ink-muted">
          <span aria-hidden="true">⏱</span> {cantidad} preguntas · unos {minutos} {minutos === 1 ? 'minuto' : 'minutos'}
        </p>
      )}
      <div className="mt-5 space-y-3 text-lg text-ink-muted">
        {parrafos.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
      </div>

      {searchParams?.error && (
        <p className="mt-6 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
          {searchParams.error === 'cert'
            ? 'Para el certificado necesitamos su nombre completo y un correo electrónico válido.'
            : 'Faltaron respuestas obligatorias. Revise las preguntas marcadas con *.'}
        </p>
      )}

      {!yaRespondio && pideCodigo ? (
        <CodigoAcceso action={verificarCodigo.bind(null, enc.slug, `/encuestas/${enc.slug}`)} />
      ) : yaRespondio ? (
        <div className="card mt-10 p-8 text-center">
          <p className="text-lg font-semibold">Ya respondió esta encuesta desde este dispositivo.</p>
          <p className="mt-2 text-ink-muted">¡Muchas gracias por su participación!</p>
        </div>
      ) : (
        <EncuestaForm preguntas={preguntas} action={enviarRespuesta.bind(null, enc.slug)} previa={previa} certificado={enc.certificado} clave={enc.id} conInscripcion={modoCert(enc) === 'inscriptos'} />
      )}
    </section>
  );
}
