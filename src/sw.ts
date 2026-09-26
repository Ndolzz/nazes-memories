// Service worker Naze's Memories (mode injectManifest dari vite-plugin-pwa).
// File ini di-bundle oleh Vite (bukan tsc — di-exclude di tsconfig karena
// berjalan di lingkungan Web Worker, bukan DOM).
//
// Tanggung jawab:
// 1. Precache shell aplikasi (PWA offline) — manifest di-inject vite-plugin-pwa.
// 2. Handler event `push` — menampilkan notifikasi "memory baru" yang dikirim
//    GitHub Action terjadwal (scripts/notify.mjs).
// 3. Handler `notificationclick` — buka/fokus tab ke memory terkait.

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

declare const self: any

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event: any) => {
  let data: { title?: string; body?: string; url?: string; tag?: string } = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    // Payload bukan JSON (mis. teks polos) — pakai body default.
  }

  const title = data.title || "Naze's Memories"
  const options = {
    body: data.body || 'Ada memory baru untuk dilihat.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || 'naze-new-memory',
    data: { url: data.url || '/' }
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(self.clients.openWindow(url))
})
