import type { Config } from 'tailwindcss'

/**
 * EMBL design tokens mapped to Tailwind utilities.
 * Colours are driven by CSS variables defined in src/index.css so the single
 * source of truth lives there. EMBL identity is green-led + white-led; per-team
 * colour coding is explicitly forbidden — entities are distinguished by icon only.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        embl: {
          green: 'var(--embl-green)',
          'green-darkest': 'var(--embl-green-darkest)',
          'green-dark': 'var(--embl-green-dark)',
          'green-light': 'var(--embl-green-light)',
          'green-lightest': 'var(--embl-green-lightest)',
          grey: 'var(--embl-grey)',
          'grey-darkest': 'var(--embl-grey-darkest)',
          'grey-dark': 'var(--embl-grey-dark)',
          'grey-light': 'var(--embl-grey-light)',
          'grey-lightest': 'var(--embl-grey-lightest)',
          link: 'var(--embl-link)',
          'link-hover': 'var(--embl-link-hover)',
          'link-visited': 'var(--embl-link-visited)',
          red: 'var(--embl-red)',
        },
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", 'Helvetica', 'Arial', 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        roundel: '42% 58% 56% 44% / 48% 42% 58% 52%',
      },
    },
  },
  plugins: [],
} satisfies Config
