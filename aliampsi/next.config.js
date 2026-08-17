/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async redirects() {
    // Direcciones del sitio anterior (WordPress) → nuevas.
    // Permanentes (301) para conservar el posicionamiento en Google.
    return [
      { source: '/asociaciones-miembro', destination: '/asociaciones', permanent: true },
      { source: '/about', destination: '/quienes-somos', permanent: true },
      { source: '/contact', destination: '/contacto', permanent: true },
      { source: '/portfolio', destination: '/noticias', permanent: true },
      { source: '/ingreso-asociaciones', destination: '/contacto', permanent: true },
      { source: '/webinar-aliampsi', destination: '/congresos', permanent: true },
      { source: '/comision-del-banco-de-becas-y-pasantias', destination: '/quienes-somos', permanent: true },
      { source: '/comision-de-publicaciones', destination: '/publicaciones', permanent: true },
      { source: '/elementor-1523', destination: '/publicaciones', permanent: true },
      { source: '/sample-page', destination: '/', permanent: true },
      // Rutas de WordPress que ya no existen
      { source: '/wp-admin', destination: '/login', permanent: false },
      { source: '/wp-login.php', destination: '/login', permanent: false },
      { source: '/feed', destination: '/noticias', permanent: true },
      { source: '/category/:slug', destination: '/noticias', permanent: true },
      { source: '/tag/:slug', destination: '/noticias', permanent: true },
    ];
  },
};
module.exports = nextConfig;
