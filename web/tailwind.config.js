/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#090D16',
          900: '#06090F',
          800: '#090D16',
          700: '#111827',
          600: '#1E293B',
          500: '#334155'
        },
        segment: {
          nutrition: '#10B981', // Emerald
          workout: '#3B82F6',   // Electric Blue
          fatburn: '#F97316',   // Coral Orange
          health: '#8B5CF6'     // Royal Violet
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
