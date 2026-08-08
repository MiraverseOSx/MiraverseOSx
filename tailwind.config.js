import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./miraverse-frontend/src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif-y2k': ['Esteban', 'Georgia', 'serif'],
        display: ['"Yeseva One"', 'Georgia', 'serif'],
        ui: ['Commissioner', 'Segoe UI', 'sans-serif'],
        body: ['Esteban', 'Georgia', 'serif'],
        lore: ['Alice', 'Georgia', 'serif'],
        signature: ['Cookie', 'cursive'],
        tech: ['Commissioner', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        os: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          accent: 'var(--color-accent)',
          text: 'var(--color-text)',
          surface: 'var(--color-surface)',
        },
        lavender: 'var(--lavender)',
        rose: 'var(--rose)',
        purple: 'var(--purple)',
        deepblue: 'var(--deep-blue)',
      },
      borderRadius: {
        window: 'var(--radius-window)',
        card: 'var(--radius-card)',
      },
      boxShadow: {
        window: 'var(--shadow-window)',
      },
    },
  },
  plugins: [
    typography,
    forms,
    containerQueries,
  ],
};
