import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter, Newsreader } from 'next/font/google';
import './globals.css';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, OG_IMAGE } from '@/lib/site';
import { getSettings } from '@/lib/settings';

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

export const viewport: Viewport = {
  themeColor: '#123B3C',
};

const DEFAULT_TITLE = 'AL·IAM·PSI — Alianza Iberoamericana de Psiquiatría Infantojuvenil';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.seoTitle || DEFAULT_TITLE;
  const description = s.seoDescription || SITE_DESCRIPTION;
  const ogImage = s.seoImage || OG_IMAGE;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: '%s · AL·IAM·PSI' },
    description,
    applicationName: SITE_NAME,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'es_ES',
      url: SITE_URL,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
    manifest: '/manifest.webmanifest',
    icons: { icon: '/icon.png', apple: '/icon-192.png' },
    verification: s.gscVerification ? { google: s.gscVerification } : undefined,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
