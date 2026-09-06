import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

type Embed = { src: string; tipo: 'video' | 'luma' };

/** Dominios cuyos iframes se permiten. Todo lo demás se descarta. */
const IFRAMES_PERMITIDOS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'lu.ma',
  'luma.com',
];

function origenPermitido(src?: string): boolean {
  if (!src) return false;
  try {
    const u = new URL(src, 'https://aliampsi.com');
    return u.protocol === 'https:' && IFRAMES_PERMITIDOS.includes(u.hostname);
  } catch {
    return false;
  }
}

function toEmbed(url?: string): Embed | null {
  if (!url) return null;

  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/);
  if (yt) return { src: `https://www.youtube.com/embed/${yt[1]}`, tipo: 'video' };

  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { src: `https://player.vimeo.com/video/${vm[1]}`, tipo: 'video' };

  // Luma: si ya es la dirección para insertar, se usa tal cual.
  const lumaEmbed = url.match(/^https:\/\/(?:lu\.ma|luma\.com)\/embed\/event\/([\w-]+)/);
  if (lumaEmbed) return { src: url, tipo: 'luma' };

  // Luma: dirección normal del evento. Solo sirve con el identificador evt-…,
  // que es el que aparece en el código que da Luma en Gestionar evento → Más.
  const lumaEvt = url.match(/^https:\/\/(?:lu\.ma|luma\.com)\/(evt-[\w-]+)/);
  if (lumaEvt) return { src: `https://lu.ma/embed/event/${lumaEvt[1]}/simple`, tipo: 'luma' };

  return null;
}

// Permitimos el HTML que genera el editor (con saneado de seguridad).
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'u', 's', 'figure', 'figcaption', 'hr', 'iframe'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...((defaultSchema.attributes && defaultSchema.attributes['*']) || []), 'style', 'className'],
    img: [...((defaultSchema.attributes && defaultSchema.attributes.img) || []), 'src', 'alt', 'title', 'width', 'height'],
    a: [...((defaultSchema.attributes && defaultSchema.attributes.a) || []), 'href', 'target', 'rel'],
    iframe: ['src', 'title', 'width', 'height', 'allow', 'allowFullScreen', 'allowfullscreen', 'style', 'frameBorder', 'frameborder'],
  },
};

export function NoticiaBody({ content }: { content: string }) {
  return (
    <div className="mt-8 space-y-4 text-ink/90">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          h2: ({ children }) => <h2 className="mt-8 text-2xl font-bold text-ink">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-6 text-xl font-bold text-ink">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-coral pl-4 italic text-ink-muted">{children}</blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="my-8 border-line" />,
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={typeof src === 'string' ? src : ''}
              alt={alt || ''}
              className="my-6 w-full rounded-xl2 border border-line"
            />
          ),
          iframe: ({ src, title, height }) => {
            // Solo se muestran los iframes de servicios conocidos.
            if (!origenPermitido(typeof src === 'string' ? src : undefined)) return null;
            const esLuma = /(?:lu\.ma|luma\.com)/.test(String(src));
            const alto = Number.parseInt(String(height || ''), 10);
            if (esLuma) {
              return (
                <span className="my-6 block w-full overflow-hidden rounded-xl2 border border-line">
                  <iframe
                    src={String(src)}
                    title={typeof title === 'string' ? title : 'Inscripción al evento'}
                    className="w-full"
                    style={{ height: Number.isNaN(alto) ? 560 : alto, border: 0 }}
                    allow="fullscreen; payment"
                    loading="lazy"
                  />
                </span>
              );
            }
            return (
              <span className="my-6 block aspect-video w-full overflow-hidden rounded-xl2 border border-line">
                <iframe
                  src={String(src)}
                  title={typeof title === 'string' ? title : 'Video'}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </span>
            );
          },
          a: ({ href, children }) => {
            const embed = toEmbed(href);
            const first = Array.isArray(children) ? children[0] : children;
            const bare = typeof first === 'string' && first === href;
            if (embed && bare) {
              if (embed.tipo === 'luma') {
                return (
                  <span className="my-6 block w-full overflow-hidden rounded-xl2 border border-line">
                    <iframe
                      src={embed.src}
                      title="Inscripción al evento"
                      className="w-full"
                      style={{ height: 560, border: 0 }}
                      allow="fullscreen; payment"
                      loading="lazy"
                    />
                  </span>
                );
              }
              return (
                <span className="my-6 block aspect-video w-full overflow-hidden rounded-xl2 border border-line">
                  <iframe
                    src={embed.src}
                    title="Video"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </span>
              );
            }
            return (
              <a href={href} target="_blank" rel="noreferrer" className="font-medium text-teal-600 underline hover:text-coral">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
