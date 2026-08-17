'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/app/admin/actions';
import { APP_VERSION } from '@/lib/version';

const GROUPS: { title: string | null; links: { href: string; label: string; exact?: boolean }[] }[] = [
  {
    title: null,
    links: [{ href: '/admin', label: 'Panel', exact: true }],
  },
  {
    title: 'Portada',
    links: [
      { href: '/admin/banners', label: 'Banners' },
      { href: '/admin/indicadores', label: 'Indicadores' },
    ],
  },
  {
    title: 'Contenido',
    links: [
      { href: '/admin/noticias', label: 'Noticias' },
      { href: '/admin/publicaciones', label: 'Publicaciones' },
      { href: '/admin/congresos', label: 'Congresos' },
      { href: '/admin/portadas', label: 'Portadas' },
      { href: '/admin/envios', label: 'Recepción de envíos' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { href: '/admin/autoridades', label: 'Comisión Directiva' },
      { href: '/admin/asociaciones', label: 'Asociaciones' },
      { href: '/admin/historia', label: 'Historia' },
    ],
  },
  {
    title: 'Configuración',
    links: [
      { href: '/admin/menu', label: 'Menú' },
      { href: '/admin/ajustes', label: 'Ajustes' },
      { href: '/admin/usuarios', label: 'Usuarios' },
    ],
  },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const STORAGE_KEY = 'aliampsi:adminNavCollapsed';

  // Cargar el estado guardado al iniciar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCollapsed(new Set(JSON.parse(raw) as number[]));
    } catch {
      // ignorar
    }
    setLoaded(true);
  }, []);

  // Guardar cuando cambia
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]));
    } catch {
      // ignorar
    }
  }, [collapsed, loaded]);

  const q = query.trim().toLowerCase();
  const toggle = (gi: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(gi)) next.delete(gi);
      else next.add(gi);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2 font-display text-lg font-extrabold text-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/emblem.png" alt="" className="h-7 w-7" />
          <span>AL<span className="text-coral">·</span>IAM<span className="text-coral">·</span>PSI</span>
        </Link>
        <p className="mt-1 text-xs text-paper/50">Administración</p>
      </div>

      <div className="px-3 pb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar sección…"
          className="w-full rounded-lg border border-paper/15 bg-paper/10 px-3 py-2 text-sm text-paper placeholder:text-paper/40 focus:border-paper/40 focus:outline-none"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {GROUPS.map((group, gi) => {
          const links = group.links.filter(
            (l) => !q || l.label.toLowerCase().includes(q) || (group.title ?? '').toLowerCase().includes(q)
          );
          if (links.length === 0) return null;
          const open = q ? true : !collapsed.has(gi);

          return (
            <div key={gi} className={gi === 0 ? '' : 'mt-4'}>
              {group.title && (
                <button
                  type="button"
                  onClick={() => toggle(gi)}
                  className="flex w-full items-center justify-between px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-paper/35 transition hover:text-paper/60"
                  aria-expanded={open}
                >
                  <span>{group.title}</span>
                  <span className={cn('text-[8px] transition-transform', open ? 'rotate-90' : 'rotate-0')}>▶</span>
                </button>
              )}
              {open && (
                <div className="space-y-1">
                  {links.map((l) => {
                    const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        className={cn(
                          'block rounded-lg px-3 py-2.5 text-sm font-medium transition',
                          active ? 'bg-paper/15 text-paper' : 'text-paper/70 hover:bg-paper/10 hover:text-paper'
                        )}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {q && GROUPS.every((g) => g.links.every((l) => !l.label.toLowerCase().includes(q) && !(g.title ?? '').toLowerCase().includes(q))) && (
          <p className="px-3 py-4 text-sm text-paper/40">Sin resultados.</p>
        )}
      </nav>

      <div className="border-t border-paper/10 px-5 py-4">
        <p className="truncate text-xs text-paper/60">{email}</p>
        <div className="mt-3 flex items-center justify-between">
          <Link href="/" target="_blank" className="text-xs text-paper/60 hover:text-paper">
            Ver sitio ↗
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-xs font-medium text-coral hover:text-coral-dark">
              Cerrar sesión
            </button>
          </form>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-paper/30">{APP_VERSION}</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-[11px] font-medium text-paper/60 transition hover:text-paper"
          >
            ⟳ Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}
