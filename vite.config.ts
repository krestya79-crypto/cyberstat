import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
const base = process.env.VITE_BASE_PATH || '/';
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'lectures/*.pdf'],
      manifest: {
        name: 'CyberStat — Probability & Statistics',
        short_name: 'CyberStat',
        description: 'Statistical problem solving with formulas, worked solutions and data-driven graphs.',
        theme_color: '#3766a4',
        background_color: '#f7f8fa',
        display: 'standalone',
        start_url: base,
        scope: base,
        id: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,pdf}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: { output: { manualChunks: { math: ['katex', 'jstat'] } } },
  },
});
