// Util push notification (Web Push, VAPID) — subscribe/unsubscribe browser
// pengunjung agar mendapat notifikasi saat ada memory baru.
//
// Alur: minta izin Notification API → subscribe via PushManager (VAPID public
// key dari env) → simpan subscription ke Supabase lewat RPC save_push_subscription
// (lihat schema.sql bagian 8). Pengiriman dilakukan GitHub Action terjadwal
// (scripts/notify.mjs) memakai VAPID private key — private key TIDAK PERNAH
// masuk frontend.
//
// Jika VITE_VAPID_PUBLIC_KEY belum diisi, semua fungsi dianggap "tidak tersedia"
// dan tombol subscribe tidak dirender (spec §46/§52 — no fake buttons).

import { requireSupabase } from '@/lib/supabase'
import { VAPID_PUBLIC_KEY } from '@/config'

export type PushState = 'unsupported' | 'unavailable' | 'denied' | 'idle' | 'subscribed'

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    typeof VAPID_PUBLIC_KEY === 'string' &&
    VAPID_PUBLIC_KEY.length > 0
  )
}

// VAPID public key dikirim sebagai applicationServerKey (Uint8Array base64url).
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

// Status saat ini: izin browser + apakah subscription aktif di server push.
export async function getPushState(): Promise<PushState> {
  if (!isPushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return sub ? 'subscribed' : 'idle'
  } catch {
    return 'unavailable'
  }
}

// Minta izin + subscribe + simpan ke database. Mengembalikan status akhir.
export async function subscribeToPush(): Promise<PushState> {
  if (!isPushSupported()) return 'unsupported'
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'idle'

  const reg = await navigator.serviceWorker.ready
  const existing = await reg.pushManager.getSubscription()
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!)
    }))

  const client = requireSupabase()
  const { error } = await client.rpc('save_push_subscription', {
    sub: sub.toJSON()
  })
  if (error) throw new Error(error.message)
  return 'subscribed'
}

// Berhenti berlangganan: hapus dari database (via RPC) lalu unsubscribe browser.
export async function unsubscribeFromPush(): Promise<PushState> {
  if (!isPushSupported()) return 'unsupported'
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      const client = requireSupabase()
      const { error } = await client.rpc('delete_push_subscription', {
        pEndpoint: sub.endpoint
      })
      if (error) throw new Error(error.message)
      await sub.unsubscribe()
    }
  } catch (e) {
    // Jangan blok pembatalan di UI walau pembersihan server gagal —
    // baris lama akan dibersihkan otomatis oleh pengirim (404/410).
    console.warn('push cleanup', e)
  }
  return 'idle'
}
