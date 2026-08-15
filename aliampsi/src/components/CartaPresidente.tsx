'use client';

import { useEffect, useRef, useState } from 'react';

export function CartaPresidente({ src }: { src: string }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) setZoom(false);
  }, [open]);

  function toggleZoom() {
    setZoom((z) => !z);
    // al alejar, volver arriba del scroll
    if (zoom && scrollRef.current) scrollRef.current.scrollTo({ top: 0 });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full overflow-hidden rounded-xl2 border border-line bg-white shadow-sm transition hover:shadow-md"
        aria-label="Ver la carta del presidente en tamaño completo"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Carta del Presidente de AL·IAM·PSI, Dr. Johann Schoepf"
          className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
        />
      </button>
      <p className="mt-3 text-center text-xs text-ink-muted">Tocá la carta para verla en grande.</p>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-ink/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Carta del Presidente"
        >
          {/* Barra superior */}
          <div className="flex shrink-0 items-center justify-end gap-2 p-3">
            <button
              type="button"
              onClick={toggleZoom}
              aria-label={zoom ? 'Alejar' : 'Acercar'}
              className="flex h-10 items-center gap-2 rounded-full bg-paper/15 px-4 text-sm font-medium text-paper backdrop-blur transition hover:bg-paper/30"
            >
              <span className="text-lg leading-none">{zoom ? '−' : '+'}</span>
              {zoom ? 'Alejar' : 'Acercar'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/15 text-2xl leading-none text-paper backdrop-blur transition hover:bg-paper/30"
            >
              ×
            </button>
          </div>

          {/* Área de la imagen (scrolleable) */}
          <div
            ref={scrollRef}
            className={`flex-1 overflow-auto px-4 pb-6 ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={() => setOpen(false)}
          >
            <div className="flex min-h-full items-start justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Carta del Presidente de AL·IAM·PSI, Dr. Johann Schoepf"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleZoom();
                }}
                className={`rounded-xl2 shadow-2xl transition-all duration-300 ${
                  zoom ? 'w-auto max-w-none' : 'h-auto w-full max-w-3xl'
                }`}
                style={zoom ? { width: 'min(1400px, 180%)' } : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
