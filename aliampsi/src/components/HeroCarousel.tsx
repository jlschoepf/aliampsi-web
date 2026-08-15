'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

export type BannerSlide = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  image: string | null;
  ctaLabel: string;
  ctaUrl: string;
  cta2Label: string;
  cta2Url: string;
  overlay: string;
  textColor: string;
};

export function HeroCarousel({ banners }: { banners: BannerSlide[] }) {
  const [i, setI] = useState(0);
  const n = banners.length;
  const go = useCallback((idx: number) => setI(((idx % n) + n) % n), [n]);

  useEffect(() => {
    if (n <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % n), 6000);
    return () => clearInterval(id);
  }, [n]);

  if (n === 0) return null;

  const current = banners[i];
  const controlsLight = current?.image ? current.textColor !== 'dark' : false;

  const overlayClass = (o: string) => {
    if (o === 'light') return 'absolute inset-0 bg-gradient-to-r from-paper/95 via-paper/85 to-paper/50';
    if (o === 'none') return '';
    return 'absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/75 to-ink/40';
  };

  return (
    <section className="relative">
      <div className="relative min-h-[460px] overflow-hidden lg:min-h-[540px]">
        {banners.map((b, idx) => {
          const hasImage = !!b.image;
          const light = hasImage ? b.textColor !== 'dark' : false;
          // Sombra para despegar el texto de la foto (solo cuando hay imagen).
          const titleShadow = hasImage
            ? light
              ? '[text-shadow:0_2px_10px_rgba(15,59,60,0.55)]'
              : '[text-shadow:0_1px_8px_rgba(250,247,242,0.85)]'
            : '';
          const textShadow = hasImage
            ? light
              ? '[text-shadow:0_1px_6px_rgba(15,59,60,0.5)]'
              : '[text-shadow:0_1px_5px_rgba(250,247,242,0.8)]'
            : '';
          // Botón secundario legible sobre foto.
          const secondaryClass = !hasImage
            ? 'btn-ghost'
            : light
              ? 'inline-flex items-center rounded-full border border-paper/40 bg-ink/35 px-5 py-2.5 text-sm font-semibold text-paper backdrop-blur transition hover:bg-ink/55'
              : 'inline-flex items-center rounded-full bg-paper/90 px-5 py-2.5 text-sm font-semibold text-ink shadow-sm backdrop-blur transition hover:bg-paper';

          return (
            <div
              key={b.id}
              aria-hidden={idx !== i}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === i ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              {hasImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image as string} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  {b.overlay !== 'none' && <div className={overlayClass(b.overlay)} />}
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-paper to-sand">
                  <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-coral/10 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-teal-600/10 blur-3xl" />
                </div>
              )}

              <div className="relative flex min-h-[460px] items-center py-16 lg:min-h-[540px]">
                <div className="wrap">
                  <div className="max-w-2xl">
                    {b.eyebrow && (
                      <p className={light ? 'eyebrow text-paper/90' : 'eyebrow'}>
                        <span className="text-coral">·</span> {b.eyebrow}
                      </p>
                    )}
                    <h1
                      className={`mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl ${
                        light ? 'text-paper' : 'text-ink'
                      } ${titleShadow}`}
                    >
                      {b.title}
                    </h1>
                    {b.text && (
                      <p
                        className={`mt-5 max-w-xl text-lg leading-relaxed ${
                          light ? 'text-paper' : 'text-ink'
                        } ${textShadow}`}
                      >
                        {b.text}
                      </p>
                    )}
                    {((b.ctaLabel && b.ctaUrl) || (b.cta2Label && b.cta2Url)) && (
                      <div className="mt-8 flex flex-wrap gap-3">
                        {b.ctaLabel && b.ctaUrl && (
                          <Link href={b.ctaUrl} className="btn-coral shadow-sm">
                            {b.ctaLabel}
                          </Link>
                        )}
                        {b.cta2Label && b.cta2Url && (
                          <Link href={b.cta2Url} className={secondaryClass}>
                            {b.cta2Label}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(i - 1)}
            aria-label="Banner anterior"
            className={`absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-2xl leading-none backdrop-blur transition sm:flex ${
              controlsLight ? 'bg-paper/20 text-paper hover:bg-paper/30' : 'bg-ink/10 text-ink hover:bg-ink/20'
            }`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(i + 1)}
            aria-label="Banner siguiente"
            className={`absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-2xl leading-none backdrop-blur transition sm:flex ${
              controlsLight ? 'bg-paper/20 text-paper hover:bg-paper/30' : 'bg-ink/10 text-ink hover:bg-ink/20'
            }`}
          >
            ›
          </button>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {banners.map((b, idx) => (
              <button
                key={b.id}
                type="button"
                onClick={() => go(idx)}
                aria-label={`Ir al banner ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  idx === i
                    ? `w-6 ${controlsLight ? 'bg-paper' : 'bg-ink'}`
                    : `w-2.5 ${controlsLight ? 'bg-paper/50 hover:bg-paper/80' : 'bg-ink/30 hover:bg-ink/60'}`
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
