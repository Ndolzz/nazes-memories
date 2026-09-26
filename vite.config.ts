import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      // injectManifest: SW di-generate dari src/sw.ts (bukan auto-generate),
      // supaya kita bisa menambahkan handler push/notifikasi sendiri.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: {
        name: "Naze's Memories",
        short_name: "Naze's Memories",
        description:
          "Naze's Memories — tempat menyimpan, mengelola, dan membagikan foto dan video. Every picture has a story.",
        theme_color: '#6E3AA8',
        background_color: '#6E3AA8',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
