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
          DEFAULT: '#241227',
          soft: '#4A3350'
        },
        paper: {
          DEFAULT: '#FFFBFE',
          sunk: '#F8EFF7'
        },
        rose: {
          50: '#FDF1F8',
          100: '#FBE1F1',
          300: '#F2A9CC',
          500: '#DB5BA0',
          600: '#C13D8A',
          700: '#9C2C6F'
        },
        violet: {
          100: '#EFE4FA',
          300: '#B98CE0',
          500: '#8A54C4',
          600: '#6E3AA8',
          700: '#4E2779',
          900: '#2B1240'
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
        floating: '0 12px 32px -8px rgba(110,58,168,0.35)'
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
