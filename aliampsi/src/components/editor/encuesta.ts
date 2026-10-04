// Bloque «encuesta» del editor: se elige de una lista y se ve como tarjeta. Se guarda como
// <p>[encuesta:direccion]</p>, el formato que la página de la noticia ya reemplaza por la encuesta completa.
import { Node } from '@tiptap/core';

export type EncuestaItem = { slug: string; titulo: string; estado: string };

let cache: Promise<EncuestaItem[]> | null = null;
export function listarEncuestas(refrescar = false): Promise<EncuestaItem[]> {
  if (!cache || refrescar) cache = fetch('/api/admin/encuestas', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])).catch(() => []);
  return cache;
}

const ESTADO: Record<string, [string, string]> = {
  abierta: ['Publicada', 'background:#E3F1EE;color:#1F6E62'],
  borrador: ['Borrador · el público no la ve', 'background:#EEE;color:#5A6B67'],
  cerrada: ['Cerrada', 'background:#FCE9E4;color:#B4472F'],
};

export const EncuestaBloque = Node.create({
  name: 'encuesta',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return { slug: { default: '' }, titulo: { default: '' } };
  },

  parseHTML() {
    return [{
      tag: 'p',
      priority: 1000, // antes que el párrafo común
      getAttrs: (el) => {
        const m = ((el as HTMLElement).textContent || '').match(/^\s*\[encuesta:\s*([a-z0-9-]+)\s*\]\s*$/i);
        return m ? { slug: m[1].toLowerCase(), titulo: (el as HTMLElement).getAttribute('data-titulo') || '' } : false;
      },
    }];
  },

  renderHTML({ node }) {
    return ['p', { 'data-encuesta': node.attrs.slug, 'data-titulo': node.attrs.titulo }, `[encuesta:${node.attrs.slug}]`];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.contentEditable = 'false';
      dom.style.cssText = 'margin:16px 0;border:1px solid #CFE0DA;border-left:6px solid #EC6A52;border-radius:12px;background:#F4F8F6;padding:14px 16px;display:flex;gap:12px;align-items:center';
      const ico = document.createElement('div'); ico.textContent = '📋'; ico.style.cssText = 'font-size:26px;line-height:1';
      const txt = document.createElement('div'); txt.style.cssText = 'min-width:0;flex:1';
      const t1 = document.createElement('div'); t1.style.cssText = 'font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5A6B67'; t1.textContent = 'Encuesta insertada';
      const t2 = document.createElement('div'); t2.style.cssText = 'font-weight:600;color:#123B3C;margin-top:2px'; t2.textContent = node.attrs.titulo || node.attrs.slug;
      const t3 = document.createElement('div'); t3.style.cssText = 'font-size:12px;color:#5A6B67;margin-top:2px'; t3.textContent = 'En la noticia se muestra la encuesta completa, para responderla ahí mismo.';
      const pill = document.createElement('span'); pill.style.cssText = 'font-size:11px;font-weight:600;border-radius:999px;padding:3px 9px;white-space:nowrap';
      txt.append(t1, t2, t3); dom.append(ico, txt, pill);
      listarEncuestas().then((lista) => {
        const e = lista.find((x) => x.slug === node.attrs.slug);
        if (!e) { pill.textContent = 'No encontrada'; pill.style.cssText += ';background:#FCE9E4;color:#B4472F'; return; }
        t2.textContent = e.titulo;
        const [etq, estilo] = ESTADO[e.estado] || [e.estado, 'background:#EEE;color:#5A6B67'];
        pill.textContent = etq; pill.style.cssText += ';' + estilo;
      });
      return { dom };
    };
  },
});
