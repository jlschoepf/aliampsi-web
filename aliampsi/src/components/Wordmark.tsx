import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Wordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        'font-display text-lg font-extrabold tracking-tight',
        light ? 'text-paper' : 'text-ink',
        className
      )}
      aria-label="AL·IAM·PSI — inicio"
    >
      AL<span className="text-coral">·</span>IAM<span className="text-coral">·</span>PSI
    </Link>
  );
}
