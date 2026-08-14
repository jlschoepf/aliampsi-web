// Carga inicial de la Comisión Directiva (período 2023-2025), tomada del sitio
// anterior, como punto de partida. Se ejecuta en cada build pero SOLO inserta
// si la tabla está vacía (idempotente). Corregir presidencia/cambios desde el panel.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AUTORIDADES = [
  {
    name: 'Dra. Luisa Lázaro', role: 'Presidenta', country: 'España', order: 1,
    bio: 'Médica Psiquiatra y Máster en Gestión Hospitalaria. Consultora Sénior y Jefe del Servicio de Psiquiatría y Psicología Infantil y Juvenil del Clínic Barcelona, catedrática de Psiquiatría de la Universidad de Barcelona y miembro investigador del IDIBAPS y del CIBERSAM.',
  },
  {
    name: 'Dr. Pedro Kestelman', role: 'Vicepresidente 1º', country: 'Argentina', order: 2,
    bio: 'Médico Psiquiatra Infantojuvenil. Expresidente de AAPI, exmédico Principal de Salud Mental en el Hospital de Pediatría J.P. Garrahan, excoordinador de Internación Psiquiátrica del Hospital de Niños R. Gutiérrez y docente/consultor de Residencias en Psiquiatría Infanto Juvenil (Argentina).',
  },
  {
    name: 'Dra. Mónica Silva', role: 'Vicepresidenta 2ª ad hoc', country: 'Uruguay', order: 3,
    bio: 'Médica Psiquiatra Pediátrica, Terapeuta de familia y pareja. Exdocente de Psiquiatría Infantil (Udelar), Directora de Salud de INAU y Vicepresidente de SUPIA. Dedicada a la Psiquiatría social, las infancias vulneradas y la Violencia.',
  },
  {
    name: 'Gisella Vargas Cajahuanca', role: 'Vocal', country: 'Perú', order: 4,
    bio: 'Psiquiatra especialista en niños y adolescentes. Presidente de la Sociedad Peruana de Psiquiatría Infanto Juvenil. Jefe de la Oficina de Apoyo a la Docencia e Investigación del Hospital Larco Herrera. Docente de la Facultad de Medicina de la Universidad San Martín de Porres.',
  },
  {
    name: 'Dra. Liliana Betancourt', role: 'Vocal', country: 'Colombia', order: 5,
    bio: 'Médica Psiquiatra Infantojuvenil. Jefe de Salud Mental del Instituto Roosevelt, profesora de Psiquiatría en la Pontificia Universidad Javeriana, docente del postgrado de Psiquiatría en Uninorte y directivo en la ACP.',
  },
  {
    name: 'Dr. Alejandro Maturana', role: 'Vocal', country: 'Chile', order: 6,
    bio: 'Psiquiatra Infantojuvenil, Psicoterapeuta de adolescentes y Magíster en Psiquiatría del Adolescente. Profesor asistente de Psiquiatría Infanto-Juvenil de la Universidad de Chile, investigador asociado en Psiquis-Lab, Psiquiatra en Clínica Las Condes y director del Grupo de Estudio EMARS de SOPNIA.',
  },
  {
    name: 'Virginia Ortiz Paredes', role: 'Vocal', country: 'Guatemala', order: 7,
    bio: 'Médico Psiquiatra y Máster en Paidopsiquiatría. Docente responsable del Postgrado de Psiquiatría Infanto-juvenil y Secretaria Académica de la Facultad de Ciencias Médicas de la Universidad de San Carlos de Guatemala.',
  },
  {
    name: 'Dr. Emmanuel Isaías Sarmiento Hernández', role: 'Vocal', country: 'México', order: 8,
    bio: 'Presidente Electo de la Asociación Mexicana de Psiquiatría Infantil (AMPI). Especialista en Psiquiatría y en Psiquiatría Infantil y de la Adolescencia.',
  },
  {
    name: 'Montse Pàmias, MD, PhD', role: 'Tesorería', country: 'España', order: 9,
    bio: 'Directora del Servicio de Salud Mental Infantil y Juvenil de la Corporació Sanitària Parc Taulí (Sabadell, Barcelona). Profesora asociada de la UAB y miembro de CIBERSAM.',
  },
  {
    name: 'Laia Vilalta', role: 'Secretaría', country: 'España', order: 10,
    bio: 'Psiquiatra infantil y de la adolescencia. Jefe de Docencia del Área de Salud Mental del Hospital Sant Joan de Déu, Barcelona. Vocal Internacional de la Asociación Española de Psiquiatría de la Infancia y la Adolescencia (AEPNYA).',
  },
  {
    name: 'Dr. Enrique Aguilar Zambrano', role: 'Asesor regional', country: 'Ecuador', order: 11,
    bio: 'Médico Psiquiatra Infantil, profesor del Postgrado de Psiquiatría. Vocal de AIEPAD.',
  },
  {
    name: 'Dr. Sergio Guzmán Calderón', role: 'Asesor regional', country: 'Bolivia', order: 12,
    bio: 'Psiquiatra Infantojuvenil en el Hospital del Niño Dr. Ovidio Aliaga Uria y Coordinador de Telepsiquiatría Infantil.',
  },
];

(async () => {
  try {
    const count = await prisma.autoridad.count();
    if (count > 0) {
      console.log(`[seed-autoridades] Ya hay ${count} autoridades; no se carga nada.`);
      return;
    }
    for (const a of AUTORIDADES) {
      await prisma.autoridad.create({ data: { ...a, published: true } });
    }
    console.log(`[seed-autoridades] Cargadas ${AUTORIDADES.length} autoridades iniciales.`);
  } catch (e) {
    console.error('[seed-autoridades] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
