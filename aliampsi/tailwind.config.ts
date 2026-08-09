import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F2',
        ink: {
          DEFAULT: '#123B3C',
          soft: '#1E4E4C',
          muted: '#5A6B67',
        },
        teal: {
          600: '#2E7D74',
          700: '#1E5B54',
        },
        coral: {
          DEFAULT: '#EC6A52',
          dark: '#D2543D',
        },
        sand: '#EFE9DE',
        line: '#E2DAcc',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      maxWidth: {
        content: '1180px',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
export default config;
