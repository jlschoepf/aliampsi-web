'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Result = { id: string; type: string; title: string; href: string; image?: string | null };

export function HeaderSearch({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Buscar mientras se escribe (con pequeña espera)
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = await r.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // Cerrar con Escape o al hacer clic afuera
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const panel = (
    <div className="absolute inset-x-0 top-full z-50 border-b border-line bg-paper shadow-lg">
      <div className="wrap py-4">
        <form action="/buscar" className="flex gap-2">
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar noticias, publicaciones, congresos…"
            className="field"
            aria-label="Buscar en el sitio"
          />
          <button type="submit" className="btn-coral shrink-0">Buscar</button>
        </form>

        {q.trim().length >= 2 && (
          <div className="mt-3">
            {loading && <p className="px-1 py-3 text-sm text-ink-muted">Buscando…</p>}
            {!loading && results.length === 0 && (
              <p className="px-1 py-3 text-sm text-ink-muted">Sin resultados para «{q.trim()}».</p>
            )}
            {!loading && results.length > 0 && (
              <>
                <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                  {results.map((r) => (
                    <li key={r.type + r.id}>
                      <Link
                        href={r.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-1 py-2.5 transition hover:bg-sand"
                      >
                        {r.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.image} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />
                        ) : (
                          <span className="h-10 w-16 shrink-0 rounded bg-sand" />
                        )}
                        <span className="min-w-0">
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-teal-600">{r.type}</span>
                          <span className="block truncate text-sm font-medium text-ink">{r.title}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/buscar?q=${encodeURIComponent(q.trim())}`}
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-block px-1 text-sm font-semibold text-teal-600 hover:text-coral"
                >
                  Ver todos los resultados →
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );

  return (
    <div ref={boxRef} className="contents">
      {variant === 'desktop' ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Buscar"
          aria-expanded={open}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-sand hover:text-ink"
        >
          {icon}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Buscar"
          aria-expanded={open}
          className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-sand"
        >
          {icon} Buscar
        </button>
      )}
      {open && panel}
    </div>
  );
}
