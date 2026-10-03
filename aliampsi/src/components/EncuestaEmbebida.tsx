import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { normalizarPreguntas, preguntasQueSeResponden } from '@/lib/encuestas';
import { EncuestaForm } from '@/app/(public)/encuestas/[slug]/EncuestaForm';
import { enviarRespuesta } from '@/app/(public)/encuestas/[slug]/actions';

/**
 * Encuesta insertada dentro de una noticia con el código [encuesta:direccion].
 * El público solo la ve si está publicada; quien administra la ve también en borrador, como vista previa.
 */
export async function EncuestaEmbebida({ slug }: { slug: string }) {
  const enc = await prisma.encuesta.findUnique({ where: { slug } });
  const admin = !!(await getSession());
  const aviso = (t: string) => (
    <p className="my-8 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">{t}</p>
  );
  if (!enc) return admin ? aviso(`No hay ninguna encuesta con la dirección «${slug}». Revisá el código insertado en la noticia.`) : null;
  if (enc.estado === 'borrador' && !admin) return null;
  if (enc.estado === 'cerrada') {
    return (
      <div className="card my-10 p-6 text-center">
        <p className="font-semibold text-ink">{enc.titulo}</p>
        <p className="mt-1 text-ink-muted">Esta encuesta ya cerró. ¡Gracias por su interés!</p>
      </div>
    );
  }
  const previa = enc.estado !== 'abierta';
  const preguntas = normalizarPreguntas(enc.preguntas);
  const cantidad = preguntasQueSeResponden(preguntas).length;
  const minutos = Math.max(1, Math.round((cantidad * 12) / 60));
  const yaRespondio = !previa && cookies().get(`enc_${enc.id}`)?.value === '1';
  const parrafos = enc.descripcion.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);

  return (
    <section id={`encuesta-${enc.slug}`} className="my-12 rounded-2xl border border-line bg-white/70 p-5 shadow-sm sm:p-8">
      {previa && aviso('Vista previa para administradores: la encuesta está en borrador. El público no la ve en la noticia hasta que la publiques.')}
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">{enc.titulo}</h2>
      {cantidad > 0 && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-sand/60 px-3 py-1 text-sm font-medium text-ink-muted">
          <span aria-hidden="true">⏱</span> {cantidad} preguntas · unos {minutos} {minutos === 1 ? 'minuto' : 'minutos'}
        </p>
      )}
      <div className="mt-4 space-y-3 text-ink-muted">
        {parrafos.map((t, i) => <p key={i} className="whitespace-pre-line leading-relaxed">{t}</p>)}
      </div>
      {yaRespondio ? (
        <div className="mt-8 rounded-xl bg-sand/40 p-6 text-center">
          <p className="font-semibold text-ink">Ya respondió esta encuesta desde este dispositivo.</p>
          <p className="mt-1 text-ink-muted">¡Muchas gracias por su participación!</p>
        </div>
      ) : (
        <EncuestaForm preguntas={preguntas} action={enviarRespuesta.bind(null, enc.slug)} previa={previa} certificado={enc.certificado} clave={enc.id} />
      )}
    </section>
  );
}
