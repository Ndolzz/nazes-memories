/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design tokens for Naze's Memories.
        // A soft, editorial pink→violet system — not a flat "pink app."
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          soft: 'rgb(var(--c-ink-soft) / <alpha-value>)'
        },
        // Overlay gelap tetap untuk viewer media — tidak berubah di dark mode.
        night: '#1B1226',
        paper: {
          DEFAULT: 'rgb(var(--c-paper) / <alpha-value>)',
          sunk: 'rgb(var(--c-paper-sunk) / <alpha-value>)'
        },
        rose: {
          50: 'rgb(var(--c-rose-50) / <alpha-value>)',
          100: 'rgb(var(--c-rose-100) / <alpha-value>)',
          200: 'rgb(var(--c-rose-200) / <alpha-value>)',
          300: 'rgb(var(--c-rose-300) / <alpha-value>)',
          400: 'rgb(var(--c-rose-400) / <alpha-value>)',
          500: 'rgb(var(--c-rose-500) / <alpha-value>)',
          600: 'rgb(var(--c-rose-600) / <alpha-value>)',
          700: 'rgb(var(--c-rose-700) / <alpha-value>)'
        },
        violet: {
          50: 'rgb(var(--c-violet-50) / <alpha-value>)',
          100: 'rgb(var(--c-violet-100) / <alpha-value>)',
          200: 'rgb(var(--c-violet-200) / <alpha-value>)',
          300: 'rgb(var(--c-violet-300) / <alpha-value>)',
          400: 'rgb(var(--c-violet-400) / <alpha-value>)',
          500: 'rgb(var(--c-violet-500) / <alpha-value>)',
          600: 'rgb(var(--c-violet-600) / <alpha-value>)',
          700: 'rgb(var(--c-violet-700) / <alpha-value>)',
          900: 'rgb(var(--c-violet-900) / <alpha-value>)'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hand: ['"Caveat"', 'cursive']
      },
      backgroundImage: {
        'naze-gradient': 'linear-gradient(135deg, #F2A9CC 0%, #C13D8A 40%, #6E3AA8 100%)',
        'naze-gradient-soft': 'linear-gradient(135deg, #FBE1F1 0%, #EFE4FA 100%)'
      },
      boxShadow: {
        card: '0 1px 2px rgba(43,18,64,0.06), 0 8px 24px -12px rgba(110,58,168,0.25)',
        floating: '0 12px 32px -8px rgba(110,58,168,0.35)',
        // Glow ambient untuk memory card (hover/press) — pakai token
        // variables supaya otomatis menyesuaikan light/dark mode.
        glow: '0 0 0 1px rgb(var(--c-violet-300) / 0.16), 0 14px 44px -12px rgb(var(--c-violet-500) / 0.4), 0 0 30px -4px rgb(var(--c-rose-500) / 0.22)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      keyframes: {
        'sparkle-in': {
          '0%': { opacity: 0, transform: 'scale(0.6) rotate(-15deg)' },
          '60%': { opacity: 1, transform: 'scale(1.1) rotate(5deg)' },
          '100%': { opacity: 1, transform: 'scale(1) rotate(0deg)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'sparkle-in': 'sparkle-in 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        shimmer: 'shimmer 1.6s linear infinite'
      }
    }
  },
  plugins: []
}
