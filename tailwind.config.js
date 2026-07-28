/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Egyetlen színforrás. Új szín NE inline hexként kerüljön a komponensbe.
        wine: {
          50: '#FBF3F5',
          100: '#F7EBEF',
          200: '#E9CDD5',
          300: '#D9AAB6',
          500: '#8A2A3E',
          600: '#6B1D2F',
          700: '#521422',
          900: '#3A0E18',
          950: '#23080F'
        },
        sand: {
          50: '#FDFAF6',
          100: '#FAF6F0',
          200: '#F3ECE0',
          300: '#E8DDCB',
          400: '#E2D7C7',
          500: '#C5A880'
        },
        ink: {
          400: '#A39288',
          500: '#7C6C63',
          600: '#63534B',
          800: '#3D302B',
          900: '#2C221E'
        },
        positive: { 50: '#EDF7EE', 300: '#B7DCBA', 600: '#2E7D32' },
        caution: { 50: '#FDF6E7', 300: '#EFD9A0', 600: '#98650C' }
      },
      fontFamily: {
        // Címsorok: Lora — elegáns szerif, teljes magyar ékezetkészlettel (ő, ű).
        display: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      fontSize: {
        // Törzsszöveg alapja 16px. A 13px (xs) csak jelvényekre és
        // metaadatokra való, futó szövegre nem.
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],
        sm: ['0.9375rem', { lineHeight: '1.5rem' }],
        base: ['1rem', { lineHeight: '1.65rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.8rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.015em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '5xl': ['2.875rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '6xl': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }]
      },
      boxShadow: {
        card: '0 1px 2px rgba(44, 34, 30, 0.04), 0 1px 3px rgba(44, 34, 30, 0.06)',
        lift: '0 4px 12px rgba(44, 34, 30, 0.08), 0 2px 4px rgba(44, 34, 30, 0.04)',
        overlay: '0 16px 48px rgba(44, 34, 30, 0.18)'
      },
      maxWidth: { prose: '68ch' },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: []
};
