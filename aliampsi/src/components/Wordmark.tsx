import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LOGO_SRC, EMBLEM_SRC } from '@/lib/site';

export function Wordmark({ className, light = false }: { className?: string; light?: boolean }) {
  // En fondos oscuros mostramos el emblema a color + el nombre en texto claro.
  if (light) {
    return (
      <Link href="/" className={cn('inline-flex items-center gap-2.5', className)} aria-label="AL·IAM·PSI — inicio">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={EMBLEM_SRC} alt="" className="h-8 w-8" />
        <span className="font-display text-lg font-extrabold tracking-tight text-paper">
          AL<span className="text-coral">·</span>IAM<span className="text-coral">·</span>PSI
        </span>
      </Link>
    );
  }

  // En fondos claros, el logo completo.
  return (
    <Link href="/" className={cn('inline-flex items-center', className)} aria-label="AL·IAM·PSI — inicio">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SRC} alt="AL·IAM·PSI" className="h-9 w-auto sm:h-10" />
    </Link>
  );
}
