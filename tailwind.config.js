/** @type {import('tailwindcss').Config} */

/*
  =============================================================================
   KTSZE — designrendszer, 2026
  =============================================================================

   A színek OKLCH-ban vannak, CSS változókban tárolva (lásd src/index.css).
   Ez két dolgot old meg egyszerre:

     1. A világos és a sötét téma UGYANAZOKAT az osztályneveket használja.
        A `sand-100` világos módban meleg elefántcsont, sötétben mélylila
        éjfél — így az egész alkalmazás témázható lett anélkül, hogy egyetlen
        komponenst is át kellett volna írni.

     2. Az OKLCH perceptuálisan egyenletes: a színátmenetek nem szürkülnek be
        középen, és az árnyalatok azonos világosságúnak LÁTSZANAK, nem csak
        számban azok.

   A shade-kulcsok (50/100/…/900) szándékosan azonosak a korábbi palettával,
   hogy a meglévő ~50 komponens változtatás nélkül tovább működjön.
  =============================================================================
*/

const ok = (v) => `oklch(var(${v}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Homok / felületek — a világos-sötét váltás gerince
        sand: {
          50: ok('--s-50'),
          100: ok('--s-100'),
          200: ok('--s-200'),
          300: ok('--s-300'),
          400: ok('--s-400'),
          500: ok('--s-500')
        },
        // Szöveg
        ink: {
          300: ok('--i-300'),
          400: ok('--i-400'),
          500: ok('--i-500'),
          600: ok('--i-600'),
          800: ok('--i-800'),
          900: ok('--i-900')
        },
        // Márkaszín: kőszegi borvidék
        wine: {
          50: ok('--w-50'),
          100: ok('--w-100'),
          200: ok('--w-200'),
          300: ok('--w-300'),
          500: ok('--w-500'),
          600: ok('--w-600'),
          700: ok('--w-700'),
          900: ok('--w-900')
        },
        // Luxusakcentus: sárgaréz / pezsgő
        gold: {
          100: ok('--g-100'),
          300: ok('--g-300'),
          500: ok('--g-500'),
          700: ok('--g-700')
        },
        positive: { 50: ok('--p-50'), 300: ok('--p-300'), 600: ok('--p-600') },
        caution: { 50: ok('--c-50'), 300: ok('--c-300'), 600: ok('--c-600') }
      },

      fontFamily: {
        // Fraunces: változó szerif optikai méret tengellyel — nagy méretben
        // finomodik, kis méretben vastagszik. Ez adja az „editorial luxury” érzetet.
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // Számokhoz és adatokhoz — ettől lesz technikás a felület.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],
        sm: ['0.9375rem', { lineHeight: '1.5rem' }],
        base: ['1rem', { lineHeight: '1.7rem' }],
        lg: ['1.125rem', { lineHeight: '1.8rem' }],
        xl: ['1.25rem', { lineHeight: '1.8rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.9rem', letterSpacing: '-0.015em' }],
        '3xl': ['1.9rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '4xl': ['2.4rem', { lineHeight: '1.12', letterSpacing: '-0.028em' }],
        '5xl': ['3.2rem', { lineHeight: '1.05', letterSpacing: '-0.034em' }],
        '6xl': ['4.2rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        '7xl': ['5.6rem', { lineHeight: '0.95', letterSpacing: '-0.045em' }],
        '8xl': ['7.5rem', { lineHeight: '0.92', letterSpacing: '-0.05em' }]
      },

      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.75rem' },

      boxShadow: {
        // Rétegzett, lágy árnyékok — egyetlen kemény drop-shadow helyett.
        hairline: '0 0 0 1px oklch(var(--s-400) / 0.6)',
        card: '0 1px 2px oklch(var(--shadow) / 0.05), 0 2px 8px oklch(var(--shadow) / 0.04)',
        lift: '0 2px 4px oklch(var(--shadow) / 0.04), 0 12px 28px -8px oklch(var(--shadow) / 0.12)',
        float: '0 8px 16px oklch(var(--shadow) / 0.06), 0 24px 56px -12px oklch(var(--shadow) / 0.18)',
        overlay: '0 32px 80px -16px oklch(var(--shadow) / 0.32)',
        glow: '0 0 0 1px oklch(var(--g-500) / 0.35), 0 8px 32px -6px oklch(var(--w-600) / 0.35)',
        inset: 'inset 0 1px 0 0 oklch(1 0 0 / 0.08)'
      },

      maxWidth: { prose: '68ch', wide: '90rem' },

      transitionTimingFunction: {
        // Rugós, de nem cukros — luxusfelületen a mozgás visszafogott.
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
        swift: 'cubic-bezier(0.32, 0.72, 0, 1)'
      },

      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(0.75rem)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        reveal: {
          from: { opacity: '0', transform: 'translateY(2rem) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        // Lassan sodródó fényfoltok a hősszekcióban
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(4%, -6%, 0) scale(1.08)' },
          '66%': { transform: 'translate3d(-5%, 4%, 0) scale(0.95)' }
        },
        // Forgó szegélyfény a kiemelt kártyákon
        'spin-slow': { to: { transform: 'rotate(1turn)' } },
        shimmer: { '100%': { transform: 'translateX(200%)' } },
        marquee: { to: { transform: 'translateX(-50%)' } },
        'pulse-ring': {
          '0%': { opacity: '0.6', transform: 'scale(0.9)' },
          '70%, 100%': { opacity: '0', transform: 'scale(1.6)' }
        }
      },

      animation: {
        'fade-in': 'fade-in 0.4s var(--ease-swift) both',
        'slide-up': 'slide-up 0.4s var(--ease-spring) both',
        reveal: 'reveal 0.7s var(--ease-spring) both',
        drift: 'drift 22s ease-in-out infinite',
        'drift-slow': 'drift 34s ease-in-out infinite reverse',
        'spin-slow': 'spin-slow 6s linear infinite',
        shimmer: 'shimmer 2.2s var(--ease-swift) infinite',
        marquee: 'marquee 42s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s var(--ease-swift) infinite'
      },

      backgroundImage: {
        // A színek témafüggők (--sheen-*), hogy világos háttéren is olvasható
        // maradjon a rá vágott szöveg. Lásd src/index.css.
        'gold-sheen':
          'linear-gradient(110deg, oklch(var(--sheen-1)) 0%, oklch(var(--sheen-2)) 30%, oklch(var(--sheen-3)) 55%, oklch(var(--sheen-2)) 78%, oklch(var(--sheen-1)) 100%)',
        'wine-depth':
          'linear-gradient(150deg, oklch(var(--w-500)) 0%, oklch(var(--w-700)) 55%, oklch(var(--w-900)) 100%)'
      }
    }
  },
  plugins: []
};
