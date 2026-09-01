'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Wordmark } from './Wordmark';
import { HeaderSearch } from './HeaderSearch';
import { cn } from '@/lib/utils';

export type NavItem = {
  id: string;
  label: string;
  href: string;
  newTab: boolean;
  cta: boolean;
  parentId?: string | null;
};

type NavNode = NavItem & { children: NavItem[] };

/** Agrupa los ítems: los que tienen padre quedan dentro de él. */
function buildTree(items: NavItem[]): NavNode[] {
  const raices = items.filter((i) => !i.parentId).map((i) => ({ ...i, children: [] as NavItem[] }));
  const porId = new Map(raices.map((r) => [r.id, r]));
  for (const i of items) {
    if (!i.parentId) continue;
    const padre = porId.get(i.parentId);
    if (padre) padre.children.push(i);
    // Si el padre no existe o está oculto, el ítem se muestra suelto.
    else raices.push({ ...i, children: [] });
  }
  return raices;
}

const esExterno = (item: NavItem) => item.newTab || /^https?:\/\//i.test(item.href);

export function SiteHeader({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [abierto, setAbierto] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const arbol = buildTree(items);
  const links = arbol.filter((i) => !i.cta);
  const ctas = arbol.filter((i) => i.cta);

  // Cierra el desplegable al cambiar de página.
  useEffect(() => {
    setAbierto(null);
    setOpen(false);
  }, [pathname]);

  // Escape cierra; un clic afuera también.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(null);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setAbierto(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [abierto]);

  const renderLink = (item: NavItem, className: string, onClick?: () => void) => {
    if (esExterno(item)) {
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

  const estiloEnlace = (activo: boolean) =>
    cn(
      'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
      activo ? 'bg-sand text-ink' : 'text-ink-muted hover:bg-sand hover:text-ink'
    );

  const ramaActiva = (n: NavNode) =>
    pathname === n.href || n.children.some((c) => c.href === pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Wordmark />

        <nav ref={navRef} className="hidden items-center gap-1 lg:flex">
          {links.map((n) => {
            if (n.children.length === 0) {
              return renderLink(n, estiloEnlace(pathname === n.href));
            }
            const estaAbierto = abierto === n.id;
            return (
              <div key={n.id} className="relative">
                <button
                  type="button"
                  onClick={() => setAbierto(estaAbierto ? null : n.id)}
                  aria-expanded={estaAbierto}
                  aria-haspopup="true"
                  className={cn(estiloEnlace(ramaActiva(n)), 'inline-flex items-center gap-1')}
                >
                  {n.label}
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className={cn('h-3.5 w-3.5 transition-transform', estaAbierto && 'rotate-180')}
                  >
                    <path d="M5.5 7.5 10 12l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {estaAbierto && (
                  <div className="absolute left-0 top-full z-50 mt-1 min-w-[15rem] overflow-hidden rounded-xl border border-line bg-paper py-1.5 shadow-lg">
                    {n.children.map((c) =>
                      renderLink(
                        c,
                        cn(
                          'block px-4 py-2.5 text-sm transition-colors',
                          pathname === c.href
                            ? 'bg-sand font-medium text-ink'
                            : 'text-ink-muted hover:bg-sand hover:text-ink'
                        ),
                        () => setAbierto(null)
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <HeaderSearch />
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
            <HeaderSearch variant="mobile" />
            {links.map((n) => (
              <div key={n.id}>
                {n.children.length === 0 ? (
                  renderLink(
                    n,
                    'block rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-sand',
                    () => setOpen(false)
                  )
                ) : (
                  <>
                    <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      {n.label}
                    </p>
                    {n.children.map((c) =>
                      renderLink(
                        c,
                        'block rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-sand',
                        () => setOpen(false)
                      )
                    )}
                  </>
                )}
              </div>
            ))}
            {ctas.map((item) => renderLink(item, 'btn-coral mt-2', () => setOpen(false)))}
          </nav>
        </div>
      )}
    </header>
  );
}
