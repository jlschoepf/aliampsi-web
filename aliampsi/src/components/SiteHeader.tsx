'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Wordmark } from './Wordmark';
import { cn } from '@/lib/utils';

export type NavItem = {
  id: string;
  label: string;
  href: string;
  newTab: boolean;
  cta: boolean;
};

export function SiteHeader({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = items.filter((i) => !i.cta);
  const ctas = items.filter((i) => i.cta);

  const renderLink = (item: NavItem, className: string, onClick?: () => void) => {
    if (item.newTab || /^https?:\/\//i.test(item.href)) {
      return (
        <a key={item.id} href={item.href} target="_blank" rel="noreferrer" className={className} onClick={onClick}>
          {item.label}
        </a>
      );
    }
    return (
      <Link key={item.id} href={item.href} className={className} onClick={onClick}>
        {item.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between">
        <Wordmark />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((item) => {
            const active = pathname === item.href;
            return renderLink(
              item,
              cn(
                'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                active ? 'bg-sand text-ink' : 'text-ink-muted hover:bg-sand hover:text-ink'
              )
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/buscar"
            aria-label="Buscar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-sand hover:text-ink"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          {ctas.map((item) => renderLink(item, 'btn-coral'))}
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
            <Link
              href="/buscar"
              onClick={() => setOpen(false)}
              className="mb-1 flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-sand"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Buscar
            </Link>
            {links.map((item) =>
              renderLink(
                item,
                'rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-sand',
                () => setOpen(false)
              )
            )}
            {ctas.map((item) => renderLink(item, 'btn-coral mt-2', () => setOpen(false)))}
          </nav>
        </div>
      )}
    </header>
  );
}
