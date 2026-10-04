// Bloque de video para el editor de contenido: se ve como reproductor mientras se arma la noticia
// y se guarda como <iframe>, que la página publicada muestra igual. Acepta el enlace de YouTube o
// Vimeo (pegado o con el botón 🎬) y también el código <iframe> que copian esos servicios.
import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

/** Convierte un enlace o un código <iframe> de YouTube/Vimeo en la dirección para insertar. */
export function aEmbed(entrada: string): string | null {
  const texto = entrada.trim();
  const desdeIframe = texto.match(/src=["']([^"']+)["']/i);
  const url = desdeIframe ? desdeIframe[1] : texto;
  const yt = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/(?:player\.vimeo\.com\/video\/|vimeo\.com\/)(\d{6,})/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/** Las noticias viejas guardaban el video como enlace en un párrafo propio: al abrirlas, se muestran como reproductor. */
export function prepararHtml(html: string): string {
  return html.replace(/<p[^>]*>\s*(?:<a [^>]*href="([^"]+)"[^>]*>[^<]*<\/a>|(https?:\/\/[^\s<]+))\s*<\/p>/gi, (todo, href, suelto) => {
    const src = aEmbed(href || suelto || '');
    return src ? `<iframe src="${src}"></iframe>` : todo;
  });
}

export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return { src: { default: null } };
  },

  parseHTML() {
    return [{
      tag: 'iframe[src]',
      getAttrs: (el) => {
        const src = aEmbed((el as HTMLElement).getAttribute('src') || '');
        return src ? { src } : false; // los demás iframes (por ejemplo, Luma) no son de este bloque
      },
    }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes, {
      width: '560', height: '315', frameborder: '0', allowfullscreen: 'true', title: 'Video',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    })];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'my-4';
      dom.contentEditable = 'false';
      const caja = document.createElement('div');
      caja.style.cssText = 'position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:12px;border:1px solid #E5E0D6;background:#0b2627';
      const iframe = document.createElement('iframe');
      iframe.src = node.attrs.src;
      iframe.title = 'Video';
      iframe.allowFullscreen = true;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
      caja.appendChild(iframe);
      const nota = document.createElement('p');
      nota.textContent = 'Video insertado: así se verá en la página. Para quitarlo, hacé clic a su lado y borralo.';
      nota.style.cssText = 'margin:6px 0 0;font-size:12px;color:#5A6B67';
      dom.append(caja, nota);
      return { dom };
    };
  },

  addProseMirrorPlugins() {
    const tipo = this.type;
    return [new Plugin({
      key: new PluginKey('pegar-video'),
      props: {
        // Pegar el enlace de YouTube/Vimeo (o su código <iframe>) inserta el reproductor.
        handlePaste: (view, event) => {
          const texto = event.clipboardData?.getData('text/plain')?.trim() || '';
          if (!texto || /\s/.test(texto.replace(/<iframe[\s\S]*<\/iframe>/i, 'x'))) return false;
          const src = aEmbed(texto);
          if (!src) return false;
          view.dispatch(view.state.tr.replaceSelectionWith(tipo.create({ src })).scrollIntoView());
          return true;
        },
      },
    })];
  },
});
