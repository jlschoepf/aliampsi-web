import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@aliampsi.com';
  const password = process.env.ADMIN_PASSWORD || 'aliampsi2025';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: 'Administración AL·IAM·PSI' },
  });
  console.log(`✓ Admin listo: ${email}`);

  // --- Asociaciones integrantes (ejemplos de la región) ---
  const asociaciones = [
    { name: 'Asociación Argentina de Psiquiatría Infanto Juvenil', acronym: 'AAPI', country: 'Argentina', website: 'https://www.aapi.org.ar' },
    { name: 'Asociación Española de Psiquiatría del Niño y el Adolescente', acronym: 'AEPNYA', country: 'España', website: 'https://www.aepnya.eu' },
    { name: 'Asociación de Bipolaridad de Ecuador', acronym: 'ABE', country: 'Ecuador', website: '' },
    { name: 'Sociedad de Psiquiatría Infantil', acronym: 'SPI', country: 'México', website: '' },
    { name: 'Sociedad Chilena de Psiquiatría y Neurología de la Infancia y Adolescencia', acronym: 'SOPNIA', country: 'Chile', website: '' },
    { name: 'Asociación Colombiana de Psiquiatría', acronym: 'ACP', country: 'Colombia', website: '' },
  ];
  await prisma.asociacion.deleteMany();
  for (let i = 0; i < asociaciones.length; i++) {
    const a = asociaciones[i];
    await prisma.asociacion.create({
      data: {
        name: a.name,
        acronym: a.acronym,
        country: a.country,
        website: a.website,
        order: i,
        description: `Asociación integrante de AL·IAM·PSI en ${a.country}.`,
        published: true,
      },
    });
  }
  console.log(`✓ ${asociaciones.length} asociaciones`);

  // --- Noticias ---
  const noticias = [
    {
      title: 'El Dr. Pedro Kestelman participó del Congreso de AACAP en Nueva York',
      excerpt:
        'Nuestro Presidente fue invitado al Congreso de la AACAP, donde expuso la realidad de la salud mental de niños y adolescentes en la región.',
      content:
        'Nuestro Presidente, el Dr. Pedro Kestelman, fue invitado a participar en el Congreso de AACAP, del 23 al 28 de octubre en la Ciudad de Nueva York. Expuso allí la realidad de la Salud Mental de niños y adolescentes en nuestra región, destacando los desafíos y las oportunidades de cooperación entre las asociaciones de Iberoamérica.',
    },
    {
      title: 'Conferencia sobre Intentos de Suicidio en Niños y Adolescentes en Quito',
      excerpt:
        'Un excelente intercambio con los colegas de Ecuador que refleja las posibilidades de crecimiento de la Alianza.',
      content:
        'El viernes 25 de agosto compartimos una jornada con los colegas de Ecuador, quienes gentilmente invitaron a Quito para dar una Conferencia sobre Intentos de Suicidio en Niños y Adolescentes. Resultó un excelente intercambio y una muestra de las posibilidades de crecimiento de AL·IAM·PSI. Agradecemos a la Asociación de Bipolaridad de Ecuador y en especial al Dr. Enrique Aguilar.',
    },
    {
      title: 'Día Mundial de la Salud Mental Infantil, Infanto-juvenil y del Adolescente',
      excerpt:
        'Compartimos la iniciativa de IACAPAP para visibilizar la salud mental en las primeras etapas de la vida.',
      content:
        'AL·IAM·PSI adhiere y difunde la iniciativa de IACAPAP en torno al Día Mundial de la Salud Mental Infantil, Infanto-juvenil y del Adolescente, promoviendo la concientización sobre la importancia del cuidado temprano de la salud mental.',
    },
  ];
  await prisma.noticia.deleteMany();
  for (const n of noticias) {
    await prisma.noticia.create({
      data: {
        title: n.title,
        slug: slugify(n.title),
        excerpt: n.excerpt,
        content: n.content,
        published: true,
        publishedAt: new Date(),
      },
    });
  }
  console.log(`✓ ${noticias.length} noticias`);

  // --- Congresos y actividades ---
  await prisma.congreso.deleteMany();
  await prisma.congreso.createMany({
    data: [
      {
        title: 'II Congreso AL·IAM·PSI',
        description:
          'Segundo Congreso de la Alianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines, con la participación de las asociaciones integrantes.',
        location: 'Iberoamérica',
        linkUrl:
          'https://aliampsi.com/wp-content/uploads/2025/04/Programa-II-Congreso-AL.IAM_.PSI-FINAL.pdf',
        published: true,
      },
      {
        title: '68 Congreso AEPNYA · ALIAMPSI',
        description:
          'Programa conjunto del 68 Congreso de AEPNYA junto a AL·IAM·PSI.',
        location: 'España',
        linkUrl:
          'https://aliampsi.com/wp-content/uploads/2025/05/Programa_Cuadro_68-Congreso-AEPNYA_por-partes-12.pdf',
        published: true,
      },
      {
        title: 'I Congreso AL·IAM·PSI',
        description:
          'Primer Congreso de la Alianza. Podés ver la galería de fotos del encuentro.',
        location: 'Argentina',
        linkUrl: 'https://aapi2023.com.ar/fotos2023.php',
        published: true,
      },
    ],
  });
  console.log('✓ 3 congresos');

  // --- Publicaciones ---
  await prisma.publicacion.deleteMany();
  await prisma.publicacion.createMany({
    data: [
      {
        title: 'Revista de Psiquiatría Infanto-Juvenil (AEPNYA)',
        description:
          'Publicación científica de referencia en psiquiatría del niño y el adolescente.',
        kind: 'revista',
        linkUrl: 'https://www.aepnya.eu/index.php/revistaaepnya',
        published: true,
      },
      {
        title: 'Premio AL·IAM·PSI — Bases y Condiciones',
        description:
          'Documento con las bases y condiciones para participar del Premio AL·IAM·PSI.',
        kind: 'documento',
        linkUrl: 'https://www.aapi.org.ar/docs/premioaliampsi2024.pdf',
        published: true,
      },
    ],
  });
  console.log('✓ 2 publicaciones');

  console.log('\nSeed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
