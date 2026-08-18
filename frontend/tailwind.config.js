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
        // 3.1 Global OS Base — Luminous "Celestial Night" (Zero Muddy Blacks)
        celestial: {
          deep: '#142850',         // Cosmic Sapphire
          midnight: '#1E3D75',     // Luminous Midnight Blue
          constellation: '#315D9E',// Constellation Azure
          slate: '#7B9CC4',        // Moonlight Slate
          gold: '#E5C370',         // Radiant Starlight Gold
          softgold: '#FBE6AB',     // Soft Luminous Gold
          ivory: '#FFFFFF',        // Pure Crisp White
          mist: '#D5E2F5',         // High-Contrast Crisp Mist
          card: 'rgba(255, 255, 255, 0.12)',
        },
        // 3.2 Sector: Nephele / Arcane Archives & Nether Systems
        nephele: {
          lavender: '#EDE7FF',
          frost: '#FFE2F9',
          glaucous: '#8FA2E6',
          persian: '#624BC7',
          violet: '#581D5E',
        },
        // 3.2 Sector: Faith Medical / Arcadia Ecological Wardens
        faith: {
          darkjungle: '#1D3B34',
          jungle: '#245448',
          greencyan: '#2A8B7D',
          verdigris: '#4CD6C4',
          forest: '#6EC087',
        },
        // 3.2 Sector: Orynvell Imperial & High Council
        orynvell: {
          cream: '#FFFDF7',
          gold: '#F5D378',
          aether: '#24467D',
        },
      },
      boxShadow: {
        'cosmic-low': '0 4px 14px rgba(12, 25, 54, 0.35)',
        'cosmic-std': '0 16px 44px rgba(12, 25, 54, 0.55)',
        'cosmic-deep': '0 28px 70px rgba(12, 25, 54, 0.70)',
        'glow-gold': '0 0 18px rgba(229, 195, 112, 0.55)',
        'glow-verdigris': '0 0 18px rgba(76, 214, 196, 0.55)',
        'glow-violet': '0 0 18px rgba(143, 162, 230, 0.55)',
      },
      backdropBlur: {
        'nova': '20px',
      },
    },
  },
  plugins: [],
};
