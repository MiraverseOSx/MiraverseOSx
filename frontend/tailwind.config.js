/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Commissioner', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        'serif-y2k': ['Cinzel', 'Georgia', 'serif'],
        display: ['Cinzel', 'Georgia', 'serif'],
        ui: ['Commissioner', 'Segoe UI', 'sans-serif'],
        lore: ['Esteban', 'Georgia', 'serif'],
      },
      colors: {
        celestial: {
          dark: '#05030d',
          card: '#090518',
          border: '#3b255d',
          accent: '#a855f7',
        },
      },
    },
  },
  plugins: [],
};
