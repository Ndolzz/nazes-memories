import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Naze's Memories — build config.
// base: './' keeps asset paths relative so the SPA works from any
// sub-path on GitHub Pages (e.g. username.github.io/nazes-memories/).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: "Naze's Memories",
        short_name: 'Naze',
        description: 'Every picture has a story.',
        theme_color: '#6E3AA8',
        background_color: '#FFFBFE',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/storage/v1/object'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-thumbnails',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 }
            }
          }
        ]
      }
    })
  ],
  server: { port: 5173 },
  build: { sourcemap: false, chunkSizeWarningLimit: 900 }
})
