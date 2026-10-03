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
  otroEtiqueta: string; // texto de esa opción, por ejemplo «Otra sociedad científica»
  etiquetaMin: string;
  etiquetaMax: string;
  minimo: number; // solo escala: desde (0 o 1)
  maximo: number; // solo escala: hasta (2 a 10)
};

export type Valor = string | string[] | number;
export type Datos = Record<string, Valor>;

export const TIPOS: { tipo: TipoPregunta; nombre: string; ayuda: string }[] = [
  { tipo: 'seccion', nombre: 'Título de sección', ayuda: 'Separa la encuesta en partes. No se responde.' },
  { tipo: 'unica', nombre: 'Opción única', ayuda: 'Se elige una sola respuesta.' },
  { tipo: 'multiple', nombre: 'Opción múltiple', ayuda: 'Se pueden marcar varias.' },
  { tipo: 'escala', nombre: 'Escala', ayuda: 'Para valorar. Del 1 al 5 por defecto; el rango se puede cambiar.' },
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
    opciones: tipo === 'unica' || tipo === 'multiple' ? ['Opción 1', 'Opción 2'] : [], otro: false, otroEtiqueta: 'Otro',
    etiquetaMin: tipo === 'escala' ? 'Muy malo' : tipo === 'nps' ? 'Nada probable' : '',
    etiquetaMax: tipo === 'escala' ? 'Excelente' : tipo === 'nps' ? 'Muy probable' : '',
    minimo: tipo === 'nps' ? 0 : 1,
    maximo: tipo === 'nps' ? 10 : 5,
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
        otroEtiqueta: String(p.otroEtiqueta || '').trim().slice(0, 80) || 'Otro',
        etiquetaMin: String(p.etiquetaMin || '').trim().slice(0, 40),
        etiquetaMax: String(p.etiquetaMax || '').trim().slice(0, 40),
        ...rango(tipo, p.minimo, p.maximo),
      };
    });
}

/** Rango válido de una escala: la de recomendación es siempre 0–10; las demás, de 0 o 1 hasta 2–10. */
export function rango(tipo: TipoPregunta, min?: unknown, max?: unknown): { minimo: number; maximo: number } {
  if (tipo === 'nps') return { minimo: 0, maximo: 10 };
  if (tipo !== 'escala') return { minimo: 1, maximo: 5 };
  const mi = Number(min) === 0 ? 0 : 1;
  const ma = Math.min(10, Math.max(mi + 1, Math.round(Number(max)) || 5));
  return { minimo: mi, maximo: ma };
}

export type Paso = { titulo: string; ayuda: string; preguntas: Pregunta[] };
/** Divide la encuesta en pasos: uno por cada título de sección. Sin secciones, es un solo paso. */
export function pasos(ps: Pregunta[]): Paso[] {
  const out: Paso[] = [];
  for (const p of ps) {
    if (p.tipo === 'seccion') out.push({ titulo: p.texto, ayuda: p.ayuda, preguntas: [] });
    else { if (!out.length) out.push({ titulo: '', ayuda: '', preguntas: [] }); out[out.length - 1].preguntas.push(p); }
  }
  return out.filter((x) => x.preguntas.length);
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
      const { minimo: min, maximo: max } = rango(p.tipo, p.minimo, p.maximo);
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
  | { id: string; tipo: 'escala' | 'nps'; texto: string; respondieron: number; promedio: number; distribucion: { valor: number; n: number }[]; nps?: { indice: number; promotores: number; pasivos: number; detractores: number }; etiquetaMin: string; etiquetaMax: string; minimo: number; maximo: number }
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
      if (p.otro || otros.length) conteos.push({ opcion: p.otroEtiqueta || 'Otro', n: otros.length });
      return { id: p.id, tipo: p.tipo, texto: p.texto, respondieron: valores.length, conteos, otros };
    }
    if (p.tipo === 'escala' || p.tipo === 'nps') {
      const nums = valores.map(Number).filter((n) => !Number.isNaN(n));
      const { minimo: desde, maximo: hasta } = rango(p.tipo, p.minimo, p.maximo);
      const distribucion = Array.from({ length: hasta - desde + 1 }, (_, i) => ({ valor: desde + i, n: nums.filter((x) => x === desde + i).length }));
      const promedio = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      const base = { id: p.id, tipo: p.tipo, texto: p.texto, respondieron: nums.length, promedio, distribucion, etiquetaMin: p.etiquetaMin, etiquetaMax: p.etiquetaMax, minimo: desde, maximo: hasta };
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
    if ('conteos' in r) {
      for (const c of r.conteos) l.push(`- ${c.opcion}: ${c.n}`);
      if (r.otros.length) l.push(`  Respuestas en "Otro": ${r.otros.join(' | ')}`);
    } else if ('distribucion' in r) {
      l.push(`- Promedio: ${r.promedio.toFixed(2)} (escala ${r.minimo} a ${r.maximo})`);
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

export type Plantilla = { clave: string; nombre: string; descripcion: string; crear: () => { titulo: string; slug: string; descripcion: string; gracias: string; preguntas: Pregunta[]; portada?: string; certificado?: boolean; certActividad?: string; certDetalle?: string } };

export const ESTADOS_CERT: Record<string, string> = { pendiente: 'Pendiente', validada: 'Validada', rechazada: 'Rechazada', enviada: 'Enviada' };

export const PLANTILLAS: Plantilla[] = [
  {
    clave: 'webinar-violencia-escolar',
    nombre: 'Satisfacción · Webinar «Salud Mental y violencia escolar»',
    descripcion: 'Con la misma estructura de la encuesta de satisfacción de SUPIA, adaptada al webinar del 30 de setiembre de 2026.',
    crear: () => {
      const acuerdo = { etiquetaMin: 'Totalmente en desacuerdo', etiquetaMax: 'Totalmente de acuerdo' };
      const ponencia = (quien: string, aspecto: string) =>
        q('escala', `Por favor, evalúe la ponencia ${quien} en cuanto a: ${aspecto}`, { etiquetaMin: 'Muy mala', etiquetaMax: 'Excelente' });
      return {
        titulo: 'Encuesta anónima de satisfacción · Webinar «Salud Mental y violencia escolar»',
        slug: 'webinar-violencia-escolar',
        descripcion:
          'Webinar Internacional «Salud Mental y violencia escolar. Intersecciones entre entorno escolar, clínica y terapéutica»\nAL·IAM·PSI, SUPIA y AAPI · 30 de setiembre de 2026\n\nEstimado/a colega:\n\nLe agradecemos su participación en esta actividad. Su opinión es fundamental para nosotros y nos permitirá mejorar la calidad de futuras actividades.\n\nEsta encuesta es completamente anónima y sus respuestas serán tratadas de forma confidencial.',
        gracias: '¡Muchas gracias por su tiempo! Sus respuestas nos ayudan a mejorar las actividades de la Alianza.',
        portada: '/encuestas/portada-webinar-violencia-escolar.jpg',
        certificado: true,
        certActividad: 'el Webinar Internacional «Salud Mental y violencia escolar. Intersecciones entre entorno escolar, clínica y terapéutica»',
        certDetalle: 'Actividad organizada por AL·IAM·PSI, SUPIA y AAPI, realizada en modalidad virtual el 30 de setiembre de 2026.',
        preguntas: [
          q('seccion', 'Sección 1: Perfil del asistente', { ayuda: 'Esta sección nos ayuda a comprender mejor a nuestra audiencia.' }),
          q('unica', '¿Cómo se enteró de esta actividad?', { opciones: ['Correo electrónico de AL·IAM·PSI, SUPIA o AAPI', 'Redes sociales (Instagram, LinkedIn, etc.)', 'A través de un colega o conocido', 'Publicidad en otra sociedad científica'], otro: true }),
          q('multiple', '¿Es usted socio/a de alguna de las siguientes sociedades?', { ayuda: 'Puede marcar más de una opción. Si es socio/a de otra sociedad científica, indique cuál.', opciones: ['Sociedad Uruguaya de Psiquiatría de la Infancia y la Adolescencia (SUPIA)', 'Asociación Argentina de Psiquiatría Infantojuvenil (AAPI)', 'No soy socio/a de ninguna sociedad científica'], otro: true, otroEtiqueta: 'Otra sociedad científica' }),
          q('unica', '¿Cuál es su formación de grado?', { opciones: ['Doctor/a en Medicina', 'Licenciado/a en Psicología', 'Licenciado/a en Enfermería', 'Licenciado/a en Trabajo Social', 'Maestro/a o docente'], otro: true }),
          q('unica', '¿Cuál es su principal formación de posgrado o especialidad?', { opciones: ['Psiquiatría de Niños y Adolescentes', 'Psiquiatría de Adultos', 'Pediatría', 'Residente de Psiquiatría / Psiquiatría Pediátrica / Pediatría', 'Psicología Clínica'], otro: true }),
          q('seccion', 'Sección 2: Contenido y expositores'),
          q('escala', '¿Cómo calificaría la relevancia del tema general para su práctica profesional?', { etiquetaMin: 'Nada relevante', etiquetaMax: 'Muy relevante' }),
          q('escala', 'El contenido presentado fue claro y comprensible.', acuerdo),
          ponencia('de la Dra. Nora Leal Marchena', 'claridad y didáctica'),
          ponencia('de la Dra. Nora Leal Marchena', 'dominio del tema'),
          ponencia('del Dr. Federico Melián', 'claridad y didáctica'),
          ponencia('del Dr. Federico Melián', 'dominio del tema'),
          q('escala', 'Los conocimientos adquiridos serán de utilidad para su desempeño clínico/académico.', acuerdo),
          q('seccion', 'Sección 3: Organización'),
          q('escala', '¿Cómo calificaría la organización general de la actividad?', { etiquetaMin: 'Muy mala', etiquetaMax: 'Excelente' }),
          q('unica', 'La comunicación previa al evento (inscripción, programa, recordatorios) fue:', { opciones: ['Excelente', 'Muy buena', 'Buena', 'Regular', 'Mala'] }),
          q('unica', 'La duración del webinar fue:', { opciones: ['Muy corta', 'Adecuada', 'Muy larga'] }),
          q('seccion', 'Sección 4: Valoración general'),
          q('escala', 'En una escala del 1 al 10, ¿cuál es su nivel de satisfacción general con esta actividad?', { minimo: 1, maximo: 10, etiquetaMin: 'Nada satisfecho/a', etiquetaMax: 'Muy satisfecho/a' }),
          q('parrafo', '¿Qué fue lo que más valoró o le gustó de la actividad?', { obligatoria: false }),
          q('parrafo', '¿Tiene alguna sugerencia para mejorar futuras actividades organizadas por AL·IAM·PSI?', { obligatoria: false }),
          q('nps', '¿Qué probabilidad hay de que recomiende las actividades de AL·IAM·PSI a un colega?'),
        ],
      };
    },
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
