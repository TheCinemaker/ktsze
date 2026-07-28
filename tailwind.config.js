/** @type {import('tailwindcss').Config} */

// =============================================================================
//  "NOCTURNE" — designrendszer, 2026
//
//  Minden szín OKLCH CSS-változóból származik (definíció: src/index.css,
//  :root és [data-theme="dark"]). Ennek az egyetlen döntésnek a hozadéka:
//  a már meglévő ~50 komponens `bg-sand-100` / `text-ink-900` osztályai
//  komponensenkénti `dark:` variáns nélkül válnak témaérzékennyé.
//
//  OKLCH-t használunk hex helyett, mert perceptuálisan egyenletes: az azonos
//  L értékű árnyalatok tényleg azonos világosságúnak látszanak, így a
//  kontrasztarányok kiszámíthatók, a színátmenetek pedig nem szürkülnek be.
//
//  Skálák szemantikája:
//    sand  — felületek (háttér → kiemelt felület → vonal)
//    ink   — szöveg (halvány → erős)
//    wine  — márkaszín, akcentus   ] mindkettő invertálódik sötét témában
//    gold  — pezsgőarany, luxusakcentus
//    jade  — Írottkő-zöld, siker/élő állapot
//    noir  — NEM invertálódik: mindig mély, sötét felület (hero háttér, arany
//            gombok szövegszíne). Sötét témában is sötét marad.
// =============================================================================

const c = (name) => `oklch(var(--${name}) / <alpha-value>)`;
const scale = (prefix, steps) =>
  Object.fromEntries(steps.map((s) => [s, c(`${prefix}-${s}`)]));

const RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Kártya-/mezőfelület. Világos témában fehér, sötétben emelt felület.
        // A `bg-white` helyett MINDIG ezt kell használni.
        paper: c('paper'),
        scrim: c('scrim'),

        sand: scale('sand', [50, 100, 200, 300, 400, 500, 600, 700, 800]),
        ink: scale('ink', [200, 300, 400, 500, 600, 700, 800, 900]),
        wine: scale('wine', RAMP),
        gold: scale('gold', RAMP),
        jade: scale('jade', RAMP),
        // "Éjszakai" készlet — EGYIK SEM invertálódik. Ezek kerülnek a mindig
        // sötét felületekre (hero, lábléc, záró sáv): ott a szövegnek témától
        // függetlenül világosnak kell maradnia.
        noir: scale('noir', [700, 800, 900, 950]),
        ivory: scale('ivory', [100, 200, 300, 400, 500, 600]),
        champagne: scale('champagne', [300, 400, 500]),
        mint: scale('mint', [400, 500]),
        blush: scale('blush', [400]),

        positive: scale('positive', [50, 100, 300, 500, 600, 700]),
        caution: scale('caution', [50, 100, 300, 500, 600, 700])
      },

      fontFamily: {
        // Fraunces: változó szerif optikai méret (opsz) és "WONK" tengellyel —
        // nagy méretben magas kontrasztú, szerkesztőségi karakter, kis méretben
        // magától lágyul. Lora marad tartaléknak: garantáltan van benne ő és ű.
        display: ['Fraunces', 'Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // Számokhoz, adatokhoz, technikai címkékhez.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },

      fontSize: {
        // A törzsszöveg fix; a címsorok folyékonyak (clamp), így nincs szükség
        // töréspontonkénti méretezésre — a tipográfia folyamatosan skálázódik.
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],
        sm: ['0.9375rem', { lineHeight: '1.5rem' }],
        base: ['1rem', { lineHeight: '1.65rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.8rem' }],
        '2xl': ['clamp(1.375rem, 1.2rem + 0.9vw, 1.625rem)', { lineHeight: '1.25', letterSpacing: '-0.014em' }],
        '3xl': ['clamp(1.625rem, 1.35rem + 1.4vw, 2.125rem)', { lineHeight: '1.18', letterSpacing: '-0.02em' }],
        '4xl': ['clamp(2rem, 1.55rem + 2.2vw, 2.875rem)', { lineHeight: '1.1', letterSpacing: '-0.026em' }],
        '5xl': ['clamp(2.5rem, 1.7rem + 3.6vw, 4rem)', { lineHeight: '1.04', letterSpacing: '-0.032em' }],
        '6xl': ['clamp(3rem, 1.6rem + 6vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.038em' }],
        '7xl': ['clamp(3.5rem, 1.2rem + 9vw, 7.5rem)', { lineHeight: '0.92', letterSpacing: '-0.044em' }]
      },

      borderRadius: {
        '4xl': '1.75rem',
        '5xl': '2.25rem',
        '6xl': '3rem'
      },

      boxShadow: {
        // Két rétegű árnyékok: szűk kontakt-árnyék + tág ambiens. Sötét témában
        // a változók halványabbra váltanak, és felül egy fényvisszaverő él kerül rájuk.
        card: 'var(--sh-card)',
        lift: 'var(--sh-lift)',
        float: 'var(--sh-float)',
        overlay: 'var(--sh-overlay)',
        glow: 'var(--sh-glow)',
        'glow-gold': 'var(--sh-glow-gold)'
      },

      maxWidth: {
        prose: '68ch',
        page: '86rem'
      },

      backgroundImage: {
        // Statikus SVG-turbulencia. Ez az a "digitális patina", ami megtöri a
        // nagy felületű színátmenetek sávosodását és fizikai anyagérzetet ad.
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")"
      },

      transitionTimingFunction: {
        // Egyetlen "márkagörbe": gyors indulás, hosszú, puha kifutás.
        lux: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      },

      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'reveal-up': {
          from: { opacity: '0', transform: 'translateY(2.25rem)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        // Lassan sodródó aurora-foltok a hero mögött.
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(6%,-8%,0) scale(1.14)' },
          '66%': { transform: 'translate3d(-7%,5%,0) scale(0.92)' }
        },
        // Aranyszegély körbefutó csillanása (a @property --angle hajtja).
        sheen: { to: { '--angle': '360deg' } },
        shimmer: { '100%': { transform: 'translateX(220%)' } },
        marquee: { to: { transform: 'translateX(-50%)' } },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '80%,100%': { transform: 'scale(2.1)', opacity: '0' }
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-0.5rem)' }
        }
      },

      animation: {
        'fade-in': 'fade-in 0.24s ease-out both',
        'slide-up': 'slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
        'reveal-up': 'reveal-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        drift: 'drift 26s ease-in-out infinite',
        'drift-slow': 'drift 42s ease-in-out infinite reverse',
        sheen: 'sheen 6s linear infinite',
        shimmer: 'shimmer 2.6s ease-in-out infinite',
        marquee: 'marquee 46s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.24, 0, 0.38, 1) infinite',
        float: 'float 6s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
