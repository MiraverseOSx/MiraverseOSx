import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Keep component builds separate from the game's wwwroot and offline-shell plugin.
export default defineConfig({ plugins: [react()] });
