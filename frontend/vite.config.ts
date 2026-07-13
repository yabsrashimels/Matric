import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // Explicit root so `vite build --config frontend/vite.config.ts` (invoked from the
    // project root) still resolves index.html and src/ relative to this frontend/ folder.
    root: __dirname,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Keep production build output at the project root's dist/ folder,
      // since server.ts serves static files from `<project root>/dist` in production.
      outDir: path.resolve(__dirname, '..', 'dist'),
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Required for Replit's proxied preview iframe (dynamic subdomain host header).
      allowedHosts: true as const,
    },
  };
});
