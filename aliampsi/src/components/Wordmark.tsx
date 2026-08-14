import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LOGO_SRC } from '@/lib/site';

export function Wordmark({ className, light = false }: { className?: string; light?: boolean }) {
  // En fondos oscuros (light=true) usamos el nombre en texto claro, porque el
  // logo a color no se ve bien. En fondos claros mostramos el logo real.
  if (light) {
    return (
      <Link
        href="/"
        className={cn('font-display text-lg font-extrabold tracking-tight text-paper', className)}
        aria-label="AL·IAM·PSI — inicio"
      >
        AL<span className="text-coral">·</span>IAM<span className="text-coral">·</span>PSI
      </Link>
    );
  }

  return (
    <Link href="/" className={cn('inline-flex items-center', className)} aria-label="AL·IAM·PSI — inicio">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SRC} alt="AL·IAM·PSI" className="h-9 w-auto sm:h-10" />
    </Link>
  );
}
