// Generador de certificados de asistencia (PDF, A4 horizontal) con la identidad de AL·IAM·PSI.
// Mismo diseño que los certificados de los expositores. Las piezas (firma, logos, tipografías)
// están en /certificados-assets, fuera de la carpeta pública: la firma no se puede descargar del sitio.
import { promises as fs } from 'fs';
import path from 'path';
import { PDFDocument, rgb, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const DIR = path.join(process.cwd(), 'certificados-assets');
const W = 841.89, H = 595.28; // A4 horizontal, en puntos
const hex = (h: string) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const SALVIA = hex('#E4EDE7'), CREMA = hex('#FAF7F2'), INK = hex('#123B3C'), CORAL = hex('#EC6A52');
const GRIS = hex('#5A6B67'), TEXTO = hex('#28484A'), TEAL = hex('#2E7D74'), LINEA = hex('#C9D7CF'), BLANCO = rgb(1, 1, 1);

export type DatosCertificado = {
  titulo?: string;      // texto de la pastilla, en mayúsculas
  actividad: string;    // «el Webinar Internacional …»
  detalle: string;      // organizadores, modalidad y fecha
  firmante?: string;
  cargo?: string;
};

type Recursos = { bric: PDFFont; reg: PDFFont; semi: PDFFont; bold: PDFFont; logo: PDFImage; firma: PDFImage; supia: PDFImage; aapi: PDFImage };

async function cargar(doc: PDFDocument): Promise<Recursos> {
  doc.registerFontkit(fontkit);
  const leer = (f: string) => fs.readFile(path.join(DIR, f));
  const [b, r, s, bo, lg, fi, su, aa] = await Promise.all(
    ['Bricolage-800.ttf', 'Inter-400.ttf', 'Inter-600.ttf', 'Inter-700.ttf', 'logo-naranja.png', 'firma.png', 'supia.png', 'aapi.png'].map(leer)
  );
  return {
    bric: await doc.embedFont(b, { subset: true }), reg: await doc.embedFont(r, { subset: true }),
    semi: await doc.embedFont(s, { subset: true }), bold: await doc.embedFont(bo, { subset: true }),
    logo: await doc.embedPng(lg), firma: await doc.embedPng(fi), supia: await doc.embedPng(su), aapi: await doc.embedPng(aa),
  };
}

function centrado(p: PDFPage, txt: string, y: number, font: PDFFont, size: number, color = INK) {
  p.drawText(txt, { x: W / 2 - font.widthOfTextAtSize(txt, size) / 2, y, size, font, color });
}

function espaciado(p: PDFPage, txt: string, x: number, y: number, font: PDFFont, size: number, esp: number, color = BLANCO) {
  for (const ch of txt) { p.drawText(ch, { x, y, size, font, color }); x += font.widthOfTextAtSize(ch, size) + esp; }
}
const anchoEspaciado = (txt: string, font: PDFFont, size: number, esp: number) =>
  [...txt].reduce((a, ch) => a + font.widthOfTextAtSize(ch, size), 0) + esp * (txt.length - 1);

/** Párrafo centrado con tramos de distinta tipografía (texto común y destacado). */
function parrafo(p: PDFPage, tramos: { txt: string; font: PDFFont; color: ReturnType<typeof rgb> }[], yTop: number, size: number, ancho: number, interlinea: number): number {
  const palabras = tramos.flatMap((t) => t.txt.split(/\s+/).filter(Boolean).map((w) => ({ w, font: t.font, color: t.color })));
  const lineas: typeof palabras[] = []; let actual: typeof palabras = []; let largo = 0;
  for (const pal of palabras) {
    const wpal = pal.font.widthOfTextAtSize(pal.w, size), esp = pal.font.widthOfTextAtSize(' ', size);
    if (actual.length && largo + esp + wpal > ancho) { lineas.push(actual); actual = []; largo = 0; }
    largo += (actual.length ? esp : 0) + wpal; actual.push(pal);
  }
  if (actual.length) lineas.push(actual);
  let y = yTop;
  for (const l of lineas) {
    const total = l.reduce((a, pal, i) => a + pal.font.widthOfTextAtSize(pal.w, size) + (i ? pal.font.widthOfTextAtSize(' ', size) : 0), 0);
    let x = W / 2 - total / 2;
    l.forEach((pal, i) => {
      if (i) x += pal.font.widthOfTextAtSize(' ', size);
      p.drawText(pal.w, { x, y, size, font: pal.font, color: pal.color }); x += pal.font.widthOfTextAtSize(pal.w, size);
    });
    y -= interlinea;
  }
  return y;
}

function pagina(doc: PDFDocument, R: Recursos, nombre: string, d: DatosCertificado) {
  const p = doc.addPage([W, H]);
  p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREMA });
  // zona superior salvia con borde curvo (coordenadas SVG: y hacia abajo desde el borde superior)
  p.drawSvgPath(`M0,0 L${W},0 L${W},150 C${W * 0.7},178 ${W * 0.3},178 0,150 Z`, { x: 0, y: H, color: SALVIA });
  const r = 14, m = 16;
  p.drawSvgPath(`M${m + r},${m} H${W - m - r} Q${W - m},${m} ${W - m},${m + r} V${H - m - r} Q${W - m},${H - m} ${W - m - r},${H - m} H${m + r} Q${m},${H - m} ${m},${H - m - r} V${m + r} Q${m},${m} ${m + r},${m} Z`, { x: 0, y: H, borderColor: LINEA, borderWidth: 0.9 });
  // logo
  const lw = 150, lh = (lw * R.logo.height) / R.logo.width;
  p.drawImage(R.logo, { x: W / 2 - lw / 2, y: H - 38 - lh, width: lw, height: lh });
  // pastilla
  const titulo = (d.titulo || 'CERTIFICADO DE ASISTENCIA').toUpperCase();
  const tam = 9.2, esp = 1.9, alto = 22, ancho = anchoEspaciado(titulo, R.bold, tam, esp) + 34, py = H - 38 - lh - 34;
  p.drawSvgPath(`M${alto / 2},0 H${ancho - alto / 2} A${alto / 2},${alto / 2} 0 0 1 ${ancho - alto / 2},${alto} H${alto / 2} A${alto / 2},${alto / 2} 0 0 1 ${alto / 2},0 Z`, { x: W / 2 - ancho / 2, y: py + alto, color: CORAL });
  espaciado(p, titulo, W / 2 - ancho / 2 + 17, py + alto / 2 - tam * 0.36, R.bold, tam, esp);
  // destinatario
  centrado(p, 'Se otorga a', H - 196, R.reg, 11.5, GRIS);
  let tn = 40; while (R.bric.widthOfTextAtSize(nombre, tn) > W - 180 && tn > 20) tn -= 1;
  centrado(p, nombre, H - 240, R.bric, tn);
  p.drawRectangle({ x: W / 2 - 18, y: H - 258, width: 36, height: 2.2, color: CORAL });
  // texto
  const yFin = parrafo(p, [
    { txt: 'por su participación como asistente en', font: R.reg, color: TEXTO },
    { txt: `${d.actividad}.`, font: R.semi, color: INK },
  ], H - 292, 13, 620, 19.4);
  parrafo(p, [{ txt: d.detalle, font: R.reg, color: GRIS }], yFin - 6, 10.8, 620, 15);
  // firma
  const fy = 140, fw = 122, fh = (fw * R.firma.height) / R.firma.width;
  p.drawImage(R.firma, { x: W / 2 - fw / 2 + 6, y: fy - 4, width: fw, height: fh });
  p.drawLine({ start: { x: W / 2 - 90, y: fy }, end: { x: W / 2 + 90, y: fy }, thickness: 0.7, color: INK });
  centrado(p, d.firmante || 'Dr. Johann Schoepf', fy - 15, R.semi, 11);
  centrado(p, d.cargo || 'Presidente de AL·IAM·PSI · 2026-2027', fy - 28, R.reg, 9.2, GRIS);
  // pie: organizan
  const lab = 'ORGANIZAN'; espaciado(p, lab, W / 2 - anchoEspaciado(lab, R.semi, 7.4, 1.4) / 2, 62, R.semi, 7.4, 1.4, GRIS);
  const items = [{ i: R.logo, w: 92 }, { i: R.supia, h: 26 }, { i: R.aapi, h: 26 }].map((it) =>
    it.w ? { i: it.i, w: it.w, h: (it.w * it.i.height) / it.i.width } : { i: it.i, w: ((it.h as number) * it.i.width) / it.i.height, h: it.h as number });
  const gap = 26, total = items.reduce((a, it) => a + it.w, 0) + gap * (items.length - 1), base = 30;
  let x = W / 2 - total / 2;
  items.forEach((it, k) => {
    p.drawImage(it.i, { x, y: base + (26 - it.h) / 2, width: it.w, height: it.h }); x += it.w;
    if (k < items.length - 1) { p.drawLine({ start: { x: x + gap / 2, y: base }, end: { x: x + gap / 2, y: base + 26 }, thickness: 0.8, color: LINEA }); x += gap; }
  });
}

/** Un PDF con una página por persona. */
export async function generarCertificados(nombres: string[], d: DatosCertificado): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(nombres.length === 1 ? `Certificado de asistencia — ${nombres[0]}` : 'Certificados de asistencia');
  doc.setAuthor('AL·IAM·PSI'); doc.setSubject(d.actividad); doc.setCreator('aliampsi.com');
  const R = await cargar(doc);
  for (const n of nombres) pagina(doc, R, n, d);
  return doc.save();
}
