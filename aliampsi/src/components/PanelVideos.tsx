'use client';

import { useState } from 'react';
import { CANAL_YOUTUBE, miniatura } from '@/lib/videos';

type V = { id: string; youtubeId: string; titulo: string };

/** Panel de videos de la portada: reproductor grande (se carga recién al tocar) y lista para elegir. */
export function PanelVideos({ videos }: { videos: V[] }) {
  const [actual, setActual] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const v = videos[actual];
  const elegir = (i: number) => { setActual(i); setReproduciendo(true); };

  return (
    <section className="bg-ink py-16 text-paper lg:py-20" aria-labelledby="videos-titulo">
      <div className="wrap">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-paper/80"><span className="text-coral">·</span> Videos</p>
            <h2 id="videos-titulo" className="mt-2 text-3xl font-extrabold text-paper sm:text-4xl">Mirá nuestras actividades</h2>
            <p className="mt-2 max-w-xl text-paper/75">Webinars, presentaciones y encuentros de la Alianza, para ver cuando quieras.</p>
          </div>
          <a href={CANAL_YOUTUBE} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-paper/30 px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-paper/10">
            Ver el canal en YouTube
          </a>
        </div>

        <div className={`grid gap-6 ${videos.length > 1 ? 'lg:grid-cols-[1.7fr_1fr]' : ''}`}>
          <div>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-paper/10">
              {reproduciendo ? (
                <iframe
                  key={v.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`}
                  title={v.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <button type="button" onClick={() => setReproduciendo(true)} className="group absolute inset-0 h-full w-full" aria-label={`Reproducir: ${v.titulo}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={miniatura(v.youtubeId)} onError={(e) => { (e.currentTarget as HTMLImageElement).src = miniatura(v.youtubeId, 'hqdefault'); }} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-coral shadow-lg transition group-hover:scale-110">
                    <svg viewBox="0 0 24 24" className="ml-1 h-9 w-9 fill-white" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </button>
              )}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-paper">{v.titulo}</h3>
          </div>

          {videos.length > 1 && (
            <ul className="space-y-3 lg:max-h-[460px] lg:overflow-y-auto lg:pr-1">
              {videos.map((x, i) => (
                <li key={x.id}>
                  <button type="button" onClick={() => elegir(i)} aria-current={i === actual}
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${i === actual ? 'bg-paper/10 ring-1 ring-coral/60' : 'hover:bg-paper/5'}`}>
                    <span className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={miniatura(x.youtubeId, 'hqdefault')} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="line-clamp-3 text-sm font-medium text-paper/90">{x.titulo}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
