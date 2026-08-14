'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Wordmark } from './Wordmark';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/quienes-somos', label: 'Quiénes somos' },
  { href: '/comision-directiva', label: 'Autoridades' },
  { href: '/asociaciones', label: 'Asociaciones' },
  { href: '/noticias', label: 'Noticias' },
  { href: '/congresos', label: 'Congresos' },
  { href: '/publicaciones', label: 'Publicaciones' },
  { href: '/contacto', label: 'Contacto' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between">
        <Wordmark />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-sand text-ink' : 'text-ink-muted hover:bg-sand hover:text-ink'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link href="/contacto" className="btn-coral">
            Asociarse
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <span className="sr-only">Menú</span>
          <div className="space-y-1.5">
            <span className={cn('block h-0.5 w-5 bg-ink transition', open && 'translate-y-2 rotate-45')} />
            <span className={cn('block h-0.5 w-5 bg-ink transition', open && 'opacity-0')} />
            <span className={cn('block h-0.5 w-5 bg-ink transition', open && '-translate-y-2 -rotate-45')} />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-paper lg:hidden">
          <nav className="wrap flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-sand"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/contacto" onClick={() => setOpen(false)} className="btn-coral mt-2">
              Asociarse
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
