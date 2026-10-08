// Seguimiento de certificados: cruza la lista de inscriptos con los pedidos de certificado.
// La encuesta es confidencial (las respuestas no se vinculan con nadie): lo que se puede saber es
// quién pidió y recibió su certificado, que es lo que se usa para recordarles a los demás.
import { coincide, type Inscripto } from '@/lib/inscriptos';

export type EstadoInscripto = 'con-certificado' | 'pedido-pendiente' | 'sin-pedido';
export type FilaSeguimiento = Inscripto & { estado: EstadoInscripto; recordado: string | null };

export function cruzar(
  inscriptos: Inscripto[],
  solicitudes: { nombre: string; correo: string; estado: string }[],
  recordatorios: Record<string, string>
): FilaSeguimiento[] {
  const enviadas = solicitudes.filter((s) => s.estado === 'enviada');
  const abiertas = solicitudes.filter((s) => s.estado !== 'enviada');
  return inscriptos.map((i) => {
    const comoLista = (l: typeof solicitudes) => l.map((s) => ({ nombre: s.nombre, correo: s.correo.toLowerCase() }));
    const estado: EstadoInscripto = coincide(i.nombre, i.correo, comoLista(enviadas))
      ? 'con-certificado'
      : coincide(i.nombre, i.correo, comoLista(abiertas)) ? 'pedido-pendiente' : 'sin-pedido';
    return { ...i, estado, recordado: (i.correo && recordatorios[i.correo]) || null };
  });
}

const TITULOS = /^(dr|dra|lic|licda|prof|profa|mg|mag|psic|ps|sr|sra|srta|ing)\.?$/i;
/** Primer nombre para el saludo: sin títulos y con mayúscula inicial. */
export function primerNombre(nombre: string): string {
  const w = nombre.trim().split(/\s+/).find((x) => !TITULOS.test(x)) || '';
  return w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '';
}

export const ASUNTO_RECORDATORIO = '🎓 Tu certificado del webinar te está esperando';
export const TEXTO_RECORDATORIO = `¡Hola, {nombre}! 👋

Vimos que todavía no pediste tu certificado de asistencia al webinar «Salud Mental y violencia escolar».

Es muy fácil: entrás a la noticia, completás la encuesta (lleva unos cuatro minutos) y al final pedís el certificado. Te llega por mail al instante.

👉 {enlace}

💡 Importante: usá el mismo nombre y mail con los que te inscribiste.

Si ya lo pediste y no te llegó, respondé este correo y lo resolvemos.

¡Abrazo!`;

/** Reemplaza {nombre} y {enlace}. Sin nombre, el saludo queda «¡Hola!». */
export function personalizar(texto: string, nombre: string, enlace: string): string {
  const n = primerNombre(nombre);
  return texto.replace(/,\s*\{nombre\}/g, n ? `, ${n}` : '').replace(/\{nombre\}/g, n).replace(/\{enlace\}/g, enlace);
}

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function textoAHtml(texto: string, firma: string): string {
  const parrafos = texto.split(/\n{2,}/).map((p) =>
    `<p style="margin:0 0 14px;font:15px/1.55 Arial,sans-serif;color:#123B3C">${esc(p).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#C2462C">$1</a>').replace(/\n/g, '<br>')}</p>`);
  return parrafos.join('') + `<div style="margin-top:18px">${firma}</div>`;
}
