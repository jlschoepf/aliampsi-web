import type { Metadata } from 'next';
import { Bricolage_Grotesque, Inter, Newsreader } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});
const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});
const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['italic', 'normal'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AL·IAM·PSI — Alianza Iberoamericana de Psiquiatría Infantojuvenil',
    template: '%s · AL·IAM·PSI',
  },
  description:
    'Punto de convergencia de las principales asociaciones de psiquiatría de Iberoamérica, dedicado a la salud mental infantojuvenil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
