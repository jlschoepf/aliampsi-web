// Módulo de encuestas: tipos, plantillas, lectura de respuestas y cálculos para los reportes.

export type TipoPregunta = 'seccion' | 'unica' | 'multiple' | 'escala' | 'nps' | 'texto' | 'parrafo';

export type Pregunta = {
  id: string;
  tipo: TipoPregunta;
  texto: string;
  ayuda: string;
  obligatoria: boolean;
  opciones: string[];
  otro: boolean; // agrega la opción "Otro" con campo libre (única y múltiple)
  etiquetaMin: string;
  etiquetaMax: string;
};

export type Valor = string | string[] | number;
export type Datos = Record<string, Valor>;

export const TIPOS: { tipo: TipoPregunta; nombre: string; ayuda: string }[] = [
  { tipo: 'seccion', nombre: 'Título de sección', ayuda: 'Separa la encuesta en partes. No se responde.' },
  { tipo: 'unica', nombre: 'Opción única', ayuda: 'Se elige una sola respuesta.' },
  { tipo: 'multiple', nombre: 'Opción múltiple', ayuda: 'Se pueden marcar varias.' },
  { tipo: 'escala', nombre: 'Escala del 1 al 5', ayuda: 'Para valorar: de muy malo a excelente.' },
  { tipo: 'nps', nombre: 'Recomendación del 0 al 10', ayuda: 'Calcula el índice de recomendación (NPS).' },
  { tipo: 'texto', nombre: 'Respuesta corta', ayuda: 'Una línea de texto.' },
  { tipo: 'parrafo', nombre: 'Párrafo', ayuda: 'Texto libre, para opiniones.' },
];

export const ESTADOS: Record<string, string> = { borrador: 'Borrador', abierta: 'Abierta', cerrada: 'Cerrada' };
export const OTRO = '__otro__';

export function nuevoId() {
  return Math.random().toString(36).slice(2, 10);
}

export function preguntaVacia(tipo: TipoPregunta = 'unica'): Pregunta {
  return {
    id: nuevoId(), tipo, texto: '', ayuda: '', obligatoria: tipo !== 'seccion' && tipo !== 'parrafo',
    opciones: tipo === 'unica' || tipo === 'multiple' ? ['Opción 1', 'Opción 2'] : [], otro: false,
    etiquetaMin: tipo === 'escala' ? 'Muy malo' : tipo === 'nps' ? 'Nada probable' : '',
    etiquetaMax: tipo === 'escala' ? 'Excelente' : tipo === 'nps' ? 'Muy probable' : '',
  };
}

/** Convierte lo que venga de la base o del editor en una lista de preguntas válida. */
export function normalizarPreguntas(v: unknown): Pregunta[] {
  const lista = Array.isArray(v) ? v : [];
  const tipos = TIPOS.map((t) => t.tipo);
  const vistos = new Set<string>();
  return lista
    .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
    .map((p) => {
      const tipo = (tipos.includes(p.tipo as TipoPregunta) ? p.tipo : 'texto') as TipoPregunta;
      let id = String(p.id || '').slice(0, 20) || nuevoId();
      if (vistos.has(id)) id = nuevoId();
      vistos.add(id);
      const opciones = Array.isArray(p.opciones)
        ? p.opciones.map((o) => String(o).trim()).filter(Boolean).slice(0, 40)
        : [];
      return {
        id, tipo,
        texto: String(p.texto || '').trim().slice(0, 400),
        ayuda: String(p.ayuda || '').trim().slice(0, 400),
        obligatoria: tipo === 'seccion' ? false : !!p.obligatoria,
        opciones: tipo === 'unica' || tipo === 'multiple' ? opciones : [],
        otro: (tipo === 'unica' || tipo === 'multiple') && !!p.otro,
        etiquetaMin: String(p.etiquetaMin || '').trim().slice(0, 40),
        etiquetaMax: String(p.etiquetaMax || '').trim().slice(0, 40),
      };
    });
}

export const preguntasQueSeResponden = (ps: Pregunta[]) => ps.filter((p) => p.tipo !== 'seccion');

/**
 * Lee las respuestas de un formulario enviado. Devuelve los datos y la lista de
 * preguntas obligatorias que quedaron sin responder.
 */
export function leerRespuestas(preguntas: Pregunta[], fd: FormData): { datos: Datos; faltan: string[] } {
  const datos: Datos = {};
  const faltan: string[] = [];
  for (const p of preguntasQueSeResponden(preguntas)) {
    const k = `p_${p.id}`;
    const otroTexto = String(fd.get(`${k}_otro`) || '').trim().slice(0, 300);
    if (p.tipo === 'unica') {
      const v = String(fd.get(k) || '');
      if (v === OTRO) { if (otroTexto) datos[p.id] = `Otro: ${otroTexto}`; }
      else if (p.opciones.includes(v)) datos[p.id] = v;
    } else if (p.tipo === 'multiple') {
      const vs = fd.getAll(k).map(String);
      const ok = vs.filter((x) => p.opciones.includes(x));
      if (vs.includes(OTRO) && otroTexto) ok.push(`Otro: ${otroTexto}`);
      if (ok.length) datos[p.id] = ok;
    } else if (p.tipo === 'escala' || p.tipo === 'nps') {
      const n = Number(fd.get(k));
      const max = p.tipo === 'escala' ? 5 : 10, min = p.tipo === 'escala' ? 1 : 0;
      if (fd.get(k) !== null && fd.get(k) !== '' && Number.isInteger(n) && n >= min && n <= max) datos[p.id] = n;
    } else {
      const v = String(fd.get(k) || '').trim().slice(0, p.tipo === 'texto' ? 300 : 4000);
      if (v) datos[p.id] = v;
    }
    if (p.obligatoria && datos[p.id] === undefined) faltan.push(p.id);
  }
  return { datos, faltan };
}

// ---------- reportes ----------

export type Resumen =
  | { id: string; tipo: 'unica' | 'multiple'; texto: string; respondieron: number; conteos: { opcion: string; n: number }[]; otros: string[] }
  | { id: string; tipo: 'escala' | 'nps'; texto: string; respondieron: number; promedio: number; distribucion: { valor: number; n: number }[]; nps?: { indice: number; promotores: number; pasivos: number; detractores: number }; etiquetaMin: string; etiquetaMax: string }
  | { id: string; tipo: 'texto' | 'parrafo'; texto: string; respondieron: number; textos: string[] };

export function resumir(preguntas: Pregunta[], respuestas: Datos[]): Resumen[] {
  return preguntasQueSeResponden(preguntas).map((p): Resumen => {
    const valores = respuestas.map((r) => r[p.id]).filter((v) => v !== undefined && v !== '');
    if (p.tipo === 'unica' || p.tipo === 'multiple') {
      const conteo = new Map<string, number>(p.opciones.map((o) => [o, 0]));
      const otros: string[] = [];
      for (const v of valores) {
        for (const x of Array.isArray(v) ? v : [String(v)]) {
          if (x.startsWith('Otro: ')) otros.push(x.slice(6));
          else conteo.set(x, (conteo.get(x) || 0) + 1);
        }
      }
      const conteos = [...conteo.entries()].map(([opcion, n]) => ({ opcion, n }));
      if (p.otro || otros.length) conteos.push({ opcion: 'Otro', n: otros.length });
      return { id: p.id, tipo: p.tipo, texto: p.texto, respondieron: valores.length, conteos, otros };
    }
    if (p.tipo === 'escala' || p.tipo === 'nps') {
      const nums = valores.map(Number).filter((n) => !Number.isNaN(n));
      const desde = p.tipo === 'escala' ? 1 : 0, hasta = p.tipo === 'escala' ? 5 : 10;
      const distribucion = Array.from({ length: hasta - desde + 1 }, (_, i) => ({ valor: desde + i, n: nums.filter((x) => x === desde + i).length }));
      const promedio = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      const base = { id: p.id, tipo: p.tipo, texto: p.texto, respondieron: nums.length, promedio, distribucion, etiquetaMin: p.etiquetaMin, etiquetaMax: p.etiquetaMax };
      if (p.tipo === 'nps' && nums.length) {
        const pro = nums.filter((x) => x >= 9).length, det = nums.filter((x) => x <= 6).length;
        return { ...base, nps: { indice: Math.round(((pro - det) / nums.length) * 100), promotores: pro, pasivos: nums.length - pro - det, detractores: det } };
      }
      return base;
    }
    return { id: p.id, tipo: p.tipo as 'texto' | 'parrafo', texto: p.texto, respondieron: valores.length, textos: valores.map(String) };
  });
}

/** Texto plano con los resultados, para el análisis con Claude o para copiar. */
export function resultadosEnTexto(titulo: string, total: number, resumen: Resumen[]): string {
  const l: string[] = [`ENCUESTA: ${titulo}`, `Respuestas recibidas: ${total}`, ''];
  for (const r of resumen) {
    l.push(`PREGUNTA: ${r.texto} (respondieron ${r.respondieron})`);
    if (r.tipo === 'unica' || r.tipo === 'multiple') {
      for (const c of r.conteos) l.push(`- ${c.opcion}: ${c.n}`);
      if (r.otros.length) l.push(`  Respuestas en "Otro": ${r.otros.join(' | ')}`);
    } else if (r.tipo === 'escala' || r.tipo === 'nps') {
      l.push(`- Promedio: ${r.promedio.toFixed(2)}`);
      l.push(`- Distribución: ${r.distribucion.map((d) => `${d.valor}→${d.n}`).join(', ')}`);
      if (r.nps) l.push(`- NPS: ${r.nps.indice} (promotores ${r.nps.promotores}, pasivos ${r.nps.pasivos}, detractores ${r.nps.detractores})`);
    } else {
      for (const t of r.textos) l.push(`- «${t.replace(/\s+/g, ' ')}»`);
    }
    l.push('');
  }
  return l.join('\n');
}

// ---------- plantillas ----------

const q = (tipo: TipoPregunta, texto: string, extra: Partial<Pregunta> = {}): Pregunta => ({ ...preguntaVacia(tipo), texto, ...extra });
const PAISES = ['Argentina', 'Bolivia', 'Chile', 'Colombia', 'Ecuador', 'España', 'Guatemala', 'México', 'Perú', 'Uruguay'];

export type Plantilla = { clave: string; nombre: string; descripcion: string; crear: () => { titulo: string; slug: string; descripcion: string; gracias: string; preguntas: Pregunta[] } };

export const PLANTILLAS: Plantilla[] = [
  {
    clave: 'webinar-violencia-escolar',
    nombre: 'Satisfacción · Webinar «Salud Mental y violencia escolar»',
    descripcion: 'La encuesta del webinar del 30 de setiembre de 2026, lista para usar.',
    crear: () => ({
      titulo: 'Encuesta de satisfacción · Webinar «Salud Mental y violencia escolar»',
      slug: 'webinar-violencia-escolar',
      descripcion:
        'Estimado/a colega:\n\nLe agradecemos su participación en el Webinar Internacional «Salud Mental y violencia escolar. Intersecciones entre entorno escolar, clínica y terapéutica», realizado el 30 de setiembre de 2026.\n\nSu opinión nos permite mejorar las próximas actividades de AL·IAM·PSI. La encuesta es anónima y lleva unos tres minutos.',
      gracias: '¡Muchas gracias por su tiempo! Sus respuestas nos ayudan a seguir mejorando las actividades de la Alianza.',
      preguntas: [
        q('seccion', 'Sobre usted', { ayuda: 'Nos ayuda a conocer a quienes participan.' }),
        q('unica', '¿Desde qué país participó?', { opciones: PAISES, otro: true }),
        q('unica', '¿Cómo se enteró del webinar?', { opciones: ['Correo de su asociación', 'Redes sociales (Instagram, LinkedIn, etc.)', 'Sitio web de AL·IAM·PSI', 'WhatsApp', 'Un colega o conocido'], otro: true }),
        q('multiple', '¿Es socio/a de alguna asociación integrante de AL·IAM·PSI?', { ayuda: 'Puede marcar más de una.', opciones: ['Sí, de SUPIA (Uruguay)', 'Sí, de AAPI (Argentina)', 'Sí, de otra asociación integrante de AL·IAM·PSI', 'No soy socio/a de ninguna'] }),
        q('unica', '¿Cuál es su formación de grado?', { opciones: ['Medicina', 'Psicología', 'Enfermería', 'Trabajo Social', 'Educación / Docencia', 'Estudiante'], otro: true }),
        q('unica', '¿Cuál es su principal especialidad o formación de posgrado?', { opciones: ['Psiquiatría de niños y adolescentes', 'Psiquiatría de adultos', 'Pediatría', 'Residente (psiquiatría, psiquiatría pediátrica o pediatría)', 'Psicología clínica', 'No corresponde'], otro: true }),
        q('seccion', 'El webinar', { ayuda: 'Valore del 1 (muy malo) al 5 (excelente).' }),
        q('escala', '¿Cómo valora el webinar en general?'),
        q('escala', '¿Qué tan útiles le resultaron los contenidos para su práctica profesional?', { etiquetaMin: 'Nada útiles', etiquetaMax: 'Muy útiles' }),
        q('escala', 'Exposición de la Dra. Nora Leal Marchena: «Violencia en niños y adolescentes: etiología, clínica y herramientas terapéuticas»'),
        q('escala', 'Exposición del Dr. Federico Melián: «Antes del síntoma: construyendo ecosistemas escolares de bienestar y prevención»'),
        q('escala', 'Calidad técnica de la transmisión (audio, imagen y conexión)'),
        q('unica', 'La duración del webinar le pareció…', { opciones: ['Corta', 'Adecuada', 'Larga'] }),
        q('unica', '¿El horario le resultó cómodo?', { opciones: ['Sí', 'No', 'Me da lo mismo'] }),
        q('seccion', 'Su opinión'),
        q('nps', '¿Qué tan probable es que recomiende las actividades de AL·IAM·PSI a un colega?'),
        q('parrafo', '¿Qué fue lo más valioso del webinar?', { obligatoria: false }),
        q('parrafo', '¿Qué podríamos mejorar?', { obligatoria: false }),
        q('parrafo', '¿Qué temas le gustaría que abordemos en próximas actividades?', { obligatoria: false }),
      ],
    }),
  },
  {
    clave: 'satisfaccion-actividad',
    nombre: 'Satisfacción de una actividad (genérica)',
    descripcion: 'Base para cualquier congreso, jornada o webinar: se ajustan los nombres y listo.',
    crear: () => ({
      titulo: 'Encuesta de satisfacción',
      slug: `encuesta-${nuevoId()}`,
      descripcion: 'Estimado/a colega:\n\nLe agradecemos su participación. Su opinión nos permite mejorar las próximas actividades de AL·IAM·PSI. La encuesta es anónima.',
      gracias: '¡Muchas gracias por su tiempo!',
      preguntas: [
        q('unica', '¿Desde qué país participó?', { opciones: PAISES, otro: true }),
        q('unica', '¿Cuál es su formación de grado?', { opciones: ['Medicina', 'Psicología', 'Enfermería', 'Trabajo Social', 'Educación / Docencia', 'Estudiante'], otro: true }),
        q('escala', '¿Cómo valora la actividad en general?'),
        q('escala', '¿Qué tan útiles le resultaron los contenidos para su práctica profesional?', { etiquetaMin: 'Nada útiles', etiquetaMax: 'Muy útiles' }),
        q('escala', 'Organización y aspectos técnicos'),
        q('nps', '¿Qué tan probable es que recomiende las actividades de AL·IAM·PSI a un colega?'),
        q('parrafo', '¿Qué podríamos mejorar?', { obligatoria: false }),
        q('parrafo', '¿Qué temas le gustaría que abordemos en próximas actividades?', { obligatoria: false }),
      ],
    }),
  },
  {
    clave: 'en-blanco',
    nombre: 'En blanco',
    descripcion: 'Empezar de cero.',
    crear: () => ({ titulo: 'Nueva encuesta', slug: `encuesta-${nuevoId()}`, descripcion: '', gracias: '¡Muchas gracias por responder!', preguntas: [] }),
  },
];
