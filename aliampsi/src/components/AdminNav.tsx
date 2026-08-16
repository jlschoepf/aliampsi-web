'use client';

import Link from 'next/link';
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

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {GROUPS.map((group, gi) => (
          <div key={gi} className={gi === 0 ? '' : 'mt-5'}>
            {group.title && (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-paper/35">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.links.map((l) => {
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
          </div>
        ))}
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
