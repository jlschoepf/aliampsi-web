// Lista de inscriptos de una actividad: lectura desde lo que se pegue (archivo de Luma o una persona
// por línea) y comparación con quien pide el certificado, por correo o por nombre.

export type Inscripto = { nombre: string; correo: string };
export type Coincidencia = 'correo' | 'nombre' | null;

const CORREO = /[^\s@,;"'<>()]+@[^\s@,;"'<>()]+\.[^\s@,;"'<>()]{2,}/;

/** Separa una línea de CSV respetando comillas. */
function celdas(linea: string, sep: string): string[] {
  const out: string[] = []; let cur = ''; let q = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') { if (q && linea[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (c === sep && !q) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

/** Lee la lista pegada: el CSV de Luma o Zoom (con encabezados) o una persona por línea («Nombre Apellido, correo»). */
export function leerInscriptos(texto: string): Inscripto[] {
  const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lineas.length) return [];
  const sep = ['\t', ';', ','].find((s) => lineas[0].includes(s)) || ',';
  const cab = celdas(lineas[0], sep).map((c) => c.toLowerCase().replace(/[^a-z_ ]/g, '').trim());
  const col = (...nombres: string[]) => cab.findIndex((c) => nombres.includes(c));
  const iCorreo = col('email', 'correo', 'e-mail', 'mail', 'correo electronico', 'correo electrnico', 'user email');
  const conCabecera = iCorreo >= 0 && !CORREO.test(lineas[0]);
  const lista: Inscripto[] = [];
  if (conCabecera) {
    const iNom = col('name', 'nombre', 'full name', 'nombre completo', 'nombre y apellido');
    const iPri = col('first_name', 'first name', 'nombres');
    const iApe = col('last_name', 'last name', 'apellido', 'apellidos');
    for (const l of lineas.slice(1)) {
      const c = celdas(l, sep);
      const nombre = (iNom >= 0 && c[iNom]) || [iPri >= 0 ? c[iPri] : '', iApe >= 0 ? c[iApe] : ''].join(' ').trim();
      lista.push({ nombre: nombre.replace(/\s+/g, ' ').trim(), correo: (c[iCorreo] || '').toLowerCase().trim() });
    }
  } else {
    for (const l of lineas) {
      const m = l.match(CORREO);
      const correo = m ? m[0].toLowerCase() : '';
      const nombre = (m ? l.replace(m[0], ' ') : l).replace(/[,;\t"<>()|]+/g, ' ').replace(/\s+/g, ' ').trim();
      lista.push({ nombre, correo });
    }
  }
  // sin vacíos y sin repetidos (por correo, o por nombre si no hay correo)
  const vistos = new Set<string>();
  return lista.filter((i) => {
    if (!i.correo && i.nombre.split(' ').length < 2) return false;
    const k = i.correo || `n:${claveNombre(i.nombre).join(' ')}`;
    if (vistos.has(k)) return false;
    vistos.add(k); return true;
  });
}

export const inscriptosATexto = (l: Inscripto[]) => l.map((i) => [i.nombre, i.correo].filter(Boolean).join(', ')).join('\n');

const TITULOS = new Set(['dr', 'dra', 'dres', 'lic', 'licda', 'licdo', 'prof', 'profa', 'mg', 'mag', 'msc', 'mtro', 'mtra', 'psic', 'ps', 'sr', 'sra', 'srta', 'ing', 'phd', 'md', 'doctor', 'doctora', 'licenciado', 'licenciada', 'profesor', 'profesora', 'agdo', 'adj', 'de', 'del', 'la', 'las', 'los', 'y']);

/** Palabras significativas de un nombre: sin tildes, mayúsculas, títulos, conectores ni iniciales sueltas. */
export function claveNombre(n: string): string[] {
  return n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-zñ\s]/g, ' ')
    .split(/\s+/).filter((w) => w.length > 1 && !TITULOS.has(w));
}

function mismoNombre(a: string, b: string): boolean {
  const A = new Set(claveNombre(a)), B = new Set(claveNombre(b));
  const [chico, grande] = A.size <= B.size ? [A, B] : [B, A];
  if (chico.size < 2) return false; // como mínimo nombre y apellido
  return [...chico].every((w) => grande.has(w));
}

/** ¿Quien pide el certificado figura en la lista? Primero por correo; si no, por nombre. */
export function coincide(nombre: string, correo: string, lista: Inscripto[]): Coincidencia {
  const c = correo.trim().toLowerCase();
  if (c && lista.some((i) => i.correo === c)) return 'correo';
  if (lista.some((i) => i.nombre && mismoNombre(nombre, i.nombre))) return 'nombre';
  return null;
}

/** Normaliza lo que venga guardado en la base. */
export function normalizarInscriptos(v: unknown): Inscripto[] {
  return (Array.isArray(v) ? v : [])
    .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
    .map((x) => ({ nombre: String(x.nombre || '').trim().slice(0, 160), correo: String(x.correo || '').trim().toLowerCase().slice(0, 160) }))
    .filter((x) => x.nombre || x.correo);
}
