const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const HITOS = [
  { fecha: 'Noviembre 2020', texto: 'Primera reunión de todos los países que forman parte de AL·IAM·PSI, tras los contactos del Dr. Pedro Kestelman con las asociaciones científicas de los países miembros.' },
  { fecha: 'Diciembre 2020', texto: 'Actividad científica inaugural: «Pandemia COVID-19. Qué pasó con nuestros niños, adolescentes y sus familias. Qué podemos esperar en el 2021».' },
  { fecha: 'Octubre 2021', texto: 'Aprobación del Acta Constitutiva y el Reglamento de funcionamiento, y elección de cargos de la primera Comisión Directiva.' },
  { fecha: 'Enero 2022', texto: 'Primera reunión de la Comisión Directiva de AL·IAM·PSI.' },
  { fecha: 'Mayo 2022', texto: 'Primera Jornada AL·IAM·PSI: «Evaluación continua de los efectos de la pandemia COVID-19 y el aislamiento obligatorio» (Argentina, Colombia, Ecuador, España y México).' },
  { fecha: 'Agosto 2023', texto: 'Realización del I Congreso de AL·IAM·PSI, junto con el Congreso de la AAPI.' },
  { fecha: 'Diciembre 2023', texto: 'Cambio de Comisión Directiva: la presidencia pasa a España.' },
  { fecha: 'Junio 2024', texto: 'Webinar AL·IAM·PSI: «Trauma en niños y adolescentes».' },
  { fecha: 'Agosto 2024', texto: 'Adjudicación del Premio Norma Costoya durante el XXI Congreso de la Asociación Argentina de Psiquiatría Infantil (AAPI).' },
  { fecha: 'Mayo 2025', texto: 'II Congreso de AL·IAM·PSI en Barcelona.' },
  { fecha: 'Diciembre 2025', texto: 'Cambio de Comisión Directiva: la presidencia pasa a Uruguay.' },
];
(async () => {
  try {
    const c = await prisma.hito.count();
    if (c > 0) { console.log(`[seed-hitos] Ya hay ${c} hitos; no se carga nada.`); return; }
    for (let i = 0; i < HITOS.length; i++) {
      await prisma.hito.create({ data: { ...HITOS[i], order: i + 1, published: true } });
    }
    console.log(`[seed-hitos] Cargados ${HITOS.length} hitos.`);
  } catch (e) {
    console.error('[seed-hitos] Error (no bloquea el build):', (e && e.message) || e);
  } finally {
    await prisma.$disconnect();
  }
})();
