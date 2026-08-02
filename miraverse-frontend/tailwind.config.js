import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Design tokens (semantic colors via CSS variables)
      // Usage example: text-[--text-primary] bg-[--surface]
      colors: {
        os: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          accent: 'var(--color-accent)',
          text: 'var(--color-text)',
          surface: 'var(--color-surface)'
        }
      },
    },
  },
  plugins: [
    typography,
    forms,
    containerQueries,
  ],
};
