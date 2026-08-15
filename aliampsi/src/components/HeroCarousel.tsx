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

  return (
    <section className="relative">
      <div className="relative min-h-[460px] overflow-hidden lg:min-h-[540px]">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            aria-hidden={idx !== i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === i ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {b.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/25" />
              </>
            ) : (
              <div className="absolute inset-0 bg-ink">
                <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-coral/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
              </div>
            )}

            <div className="relative flex min-h-[460px] items-center py-16 lg:min-h-[540px]">
              <div className="wrap">
                <div className="max-w-2xl">
                  {b.eyebrow && (
                    <p className="eyebrow text-paper/80"><span className="text-coral">·</span> {b.eyebrow}</p>
                  )}
                  <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] text-paper sm:text-5xl lg:text-6xl">
                    {b.title}
                  </h1>
                  {b.text && (
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/85">{b.text}</p>
                  )}
                  {b.ctaLabel && b.ctaUrl && (
                    <div className="mt-8">
                      <Link href={b.ctaUrl} className="btn-coral">{b.ctaLabel}</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(i - 1)}
            aria-label="Banner anterior"
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/20 text-2xl leading-none text-paper backdrop-blur transition hover:bg-paper/30 sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(i + 1)}
            aria-label="Banner siguiente"
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/20 text-2xl leading-none text-paper backdrop-blur transition hover:bg-paper/30 sm:flex"
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
                  idx === i ? 'w-6 bg-paper' : 'w-2.5 bg-paper/50 hover:bg-paper/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
