/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f5f0ff',
          100: '#ede5ff',
          200: '#d8ccff',
          300: '#bba3ff',
          400: '#9b70ff',
          500: '#7C3AED',   // ← purple principal
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#1E1B4B',   // ← deep navy
          950: '#130f2e',
        },
        gold: {
          300: '#fde68a',
          400: '#FACC15',   // ← yellow acento
          500: '#F59E0B',   // ← amber
          600: '#d97706',
        },
        surface: '#F8FAFC',   // ← fondo
      },
    },
  },
  plugins: [],
}