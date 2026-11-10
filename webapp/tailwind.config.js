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
          950: '#06080B',
          900: '#0B0E14',
          800: '#10141D',
          700: '#181F2C',
          600: '#232D3F',
        },
        magcoin: {
          gold: '#F59E0B',
          amber: '#D97706',
          darkgold: '#B45309',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
