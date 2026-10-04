'use server';

// Lee la lista de inscriptos desde un archivo: CSV o texto (Luma, Zoom, Google Forms…),
// Excel (.xlsx, .xls, .ods) o PDF. Devuelve la lista ya normalizada («Nombre, correo» por línea).
import { requireAdmin } from '@/lib/auth';
import { inscriptosATexto, leerInscriptos } from '@/lib/inscriptos';

export type Lectura = { ok: boolean; texto: string; cantidad: number; sinCorreo: number; mensaje: string };

export async function leerArchivoInscriptos(fd: FormData): Promise<Lectura> {
  await requireAdmin();
  const archivo = fd.get('archivo');
  if (!(archivo instanceof File) || archivo.size === 0) return { ok: false, texto: '', cantidad: 0, sinCorreo: 0, mensaje: 'No llegó ningún archivo.' };
  if (archivo.size > 10 * 1024 * 1024) return { ok: false, texto: '', cantidad: 0, sinCorreo: 0, mensaje: 'El archivo pesa más de 10 MB.' };
  const nombre = archivo.name.toLowerCase();
  const buf = Buffer.from(await archivo.arrayBuffer());
  let texto = '';
  try {
    if (/\.(xlsx|xlsm|xls|ods)$/.test(nombre)) {
      const XLSX = await import('xlsx');
      const libro = XLSX.read(buf, { type: 'buffer' });
      // todas las hojas, por si la lista está repartida
      texto = libro.SheetNames.map((h) => XLSX.utils.sheet_to_csv(libro.Sheets[h])).join('\n');
    } else if (/\.pdf$/.test(nombre)) {
      const { extractText, getDocumentProxy } = await import('unpdf');
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text } = await extractText(pdf, { mergePages: false });
      texto = (Array.isArray(text) ? text : [text]).join('\n');
    } else {
      texto = buf.toString('utf8').replace(/^\uFEFF/, '');
    }
  } catch (e) {
    return { ok: false, texto: '', cantidad: 0, sinCorreo: 0, mensaje: `No se pudo leer el archivo: ${String((e as Error).message || e).slice(0, 140)}` };
  }
  const lista = leerInscriptos(texto);
  if (!lista.length) return { ok: false, texto: '', cantidad: 0, sinCorreo: 0, mensaje: 'No encontré nombres ni correos en el archivo. Revisá que tenga una columna de correo o una persona por línea.' };
  return { ok: true, texto: inscriptosATexto(lista), cantidad: lista.length, sinCorreo: lista.filter((i) => !i.correo).length, mensaje: '' };
}
