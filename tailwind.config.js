/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          DEFAULT: '#6B1D2F',
          hover: '#521422',
          soft: '#F7EBEF',
          border: '#D9AAB6'
        },
        beige: {
          bg: '#FAF6F0',
          surface: '#F3ECE0',
          border: '#E2D7C7',
          gold: '#C5A880'
        },
        brown: {
          text: '#2C221E',
          muted: '#63534B',
          light: '#A39288'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
