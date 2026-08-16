import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

function toEmbed(url?: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

// Permitimos el HTML que genera el editor (con saneado de seguridad).
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'u', 's', 'figure', 'figcaption', 'hr'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...((defaultSchema.attributes && defaultSchema.attributes['*']) || []), 'style', 'className'],
    img: [...((defaultSchema.attributes && defaultSchema.attributes.img) || []), 'src', 'alt', 'title', 'width', 'height'],
    a: [...((defaultSchema.attributes && defaultSchema.attributes.a) || []), 'href', 'target', 'rel'],
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
          a: ({ href, children }) => {
            const embed = toEmbed(href);
            const first = Array.isArray(children) ? children[0] : children;
            const bare = typeof first === 'string' && first === href;
            if (embed && bare) {
              return (
                <span className="my-6 block aspect-video w-full overflow-hidden rounded-xl2 border border-line">
                  <iframe
                    src={embed}
                    title="Video"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
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
