import Link from 'next/link';
import { Wordmark } from './Wordmark';
import { getSettings, waLink } from '@/lib/settings';

export async function SiteFooter() {
  const s = await getSettings();
  const SOCIAL = [
    { href: s.instagram, label: 'Instagram' },
    { href: s.facebook, label: 'Facebook' },
    { href: s.youtube, label: 'YouTube' },
    { href: s.linkedin, label: 'LinkedIn' },
    { href: waLink(s.whatsapp), label: 'WhatsApp' },
  ].filter((x) => x.href);
  return (
    <footer className="mt-24 border-t border-line bg-ink text-paper">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/70">
            Alianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines. Potenciando
            el conocimiento para el cuidado de la salud mental de niños y adolescentes.
          </p>
          <a href={`mailto:${s.contactEmail}`} className="mt-4 inline-block font-display text-lg text-paper hover:text-coral">
            {s.contactEmail}
          </a>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-paper/50">Secciones</h4>
          <ul className="mt-4 space-y-2 text-sm text-paper/80">
            <li><Link href="/quienes-somos" className="hover:text-coral">Quiénes somos</Link></li>
            <li><Link href="/asociaciones" className="hover:text-coral">Asociaciones</Link></li>
            <li><Link href="/noticias" className="hover:text-coral">Noticias</Link></li>
            <li><Link href="/congresos" className="hover:text-coral">Congresos</Link></li>
            <li><Link href="/publicaciones" className="hover:text-coral">Publicaciones</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-paper/50">Seguinos</h4>
          <ul className="mt-4 space-y-2 text-sm text-paper/80">
            {SOCIAL.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-coral">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/login" className="mt-6 inline-block text-xs text-paper/40 hover:text-paper/70">
            Acceso administración
          </Link>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="wrap flex flex-col items-center justify-between gap-2 py-6 text-xs text-paper/50 sm:flex-row">
          <span>© {new Date().getFullYear()} AL·IAM·PSI — Organización sin fines de lucro.</span>
          <span>Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
