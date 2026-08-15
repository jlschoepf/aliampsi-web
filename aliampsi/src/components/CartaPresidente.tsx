'use client';

import { useEffect, useState } from 'react';

export function CartaPresidente({ src }: { src: string }) {
  const [open, setOpen] = useState(false);

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
      <p className="mt-3 text-center text-xs text-ink-muted">Tocá la carta para verla en tamaño completo.</p>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Carta del Presidente"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper/15 text-2xl leading-none text-paper backdrop-blur transition hover:bg-paper/30"
          >
            ×
          </button>
          <div
            className="max-h-full overflow-auto rounded-xl2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Carta del Presidente de AL·IAM·PSI, Dr. Johann Schoepf"
              className="block h-auto w-auto max-h-[88vh] max-w-full rounded-xl2"
            />
          </div>
        </div>
      )}
    </>
  );
}
