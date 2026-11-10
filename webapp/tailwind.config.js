/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#050507',
          900: '#09090b',
          800: '#0d0e12',
          700: '#13151b',
          600: '#1c1f26',
        },
        gold: {
          light: '#fde68a',
          primary: '#f59e0b',
          dark: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Onest', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Unbounded', 'Onest', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      }
    },
  },
  plugins: [],
}
