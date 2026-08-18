/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Master Typography (§2) - Monospace excluded
        sans: ['Corbel', 'Carlito', 'Segoe UI', 'sans-serif'],
        ui: ['Corbel', 'Carlito', 'Segoe UI', 'sans-serif'],
        display: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        lore: ['Alice', 'Georgia', 'serif'],
        alice: ['Alice', 'Georgia', 'serif'],
        script: ['Great Vibes', 'Cookie', 'cursive'],
        mono: ['Corbel', 'Carlito', 'Segoe UI', 'sans-serif'], // Fallback mapped to Corbel
      },
      colors: {
        // 3.1 Global OS Base — "Celestial Night"
        celestial: {
          deep: '#0A1026',        // Deep Space
          midnight: '#142B52',    // Midnight Blue
          constellation: '#254A7A',// Constellation Blue
          slate: '#5D7EA8',       // Moonlight Slate
          gold: '#D4B06A',        // Starlight Gold (Primary Accent)
          softgold: '#F0D79A',    // Soft Gold
          ivory: '#F8F6EE',       // Ivory White (Primary Text)
          mist: '#C7D2E0',        // Starlight Mist (Secondary Text)
        },
        // 3.2 Sector: Nephele / Arcane Archives & Nether Systems
        nephele: {
          lavender: '#E1DAFB',
          frost: '#FFD2F4',
          glaucous: '#758AD1',
          persian: '#4D3EA3',
          violet: '#450C3F',
        },
        // 3.2 Sector: Faith Medical / Arcadia Ecological Wardens
        faith: {
          darkjungle: '#1E201F',
          jungle: '#193A31',
          greencyan: '#1D6C61',
          verdigris: '#3EB9A8',
          forest: '#5AA371',
        },
        // 3.2 Sector: Orynvell Imperial & High Council
        orynvell: {
          cream: '#FFFDF7',
          gold: '#ECC86C',
          aether: '#1B3358',
        },
      },
      boxShadow: {
        'cosmic-low': '0 2px 8px rgba(10, 16, 38, 0.35)',
        'cosmic-std': '0 12px 36px rgba(10, 16, 38, 0.60)',
        'cosmic-deep': '0 24px 60px rgba(10, 16, 38, 0.75)',
        'glow-gold': '0 0 16px rgba(212, 176, 106, 0.45)',
        'glow-verdigris': '0 0 16px rgba(62, 185, 168, 0.45)',
        'glow-violet': '0 0 16px rgba(117, 138, 209, 0.45)',
      },
      backdropBlur: {
        'nova': '20px',
      },
    },
  },
  plugins: [],
};
