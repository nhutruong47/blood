import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Tailwind v4 is loaded via @tailwindcss/vite — no PostCSS or
// tailwind.config.js needed. Vite resolves CSS through its own pipeline.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Proxy `/api/**` to the Spring Boot backend in dev so the frontend
  // can call same-origin URLs and avoid CORS preflights. The backend
  // listens on :8080 by default; override with `BACKEND_URL` env var.
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
      '/actuator': {
        target: process.env.BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Re-introduce the budget when chunks are split so each stays below 600 kB.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split heavy / rarely-touched libs into separate chunks so the
        // first paint only loads the route the user actually visits.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-router-dom')
          ) {
            return 'react';
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query';
          }
          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform') ||
            id.includes('node_modules/zod')
          ) {
            return 'forms';
          }
          if (
            id.includes('node_modules/lucide-react') ||
            id.includes('node_modules/sonner') ||
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/tailwind-merge') ||
            id.includes('node_modules/class-variance-authority')
          ) {
            return 'ui';
          }
          if (id.includes('node_modules/recharts')) {
            return 'recharts';
          }
          if (id.includes('node_modules/react-big-calendar')) {
            return 'calendar';
          }
          if (
            id.includes('node_modules/leaflet') ||
            id.includes('node_modules/react-leaflet')
          ) {
            return 'leaflet';
          }
          return undefined;
        },
      },
    },
  },
});