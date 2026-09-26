// Pengirim push notification "memory baru" — dijalankan GitHub Action
// terjadwal (.github/workflows/notify.yml), BUKAN dari browser.
//
// Alur tiap run:
// 1. Ambil memories yang created_at dalam 26 jam terakhir (guard sedikit > 24h
//    supaya tidak ada yang terlewat bila cron mundur beberapa menit).
// 2. Jika tidak ada memory baru → selesai (tidak ada notifikasi).
// 3. Ambil semua push subscription (butuh service role key — hanya di CI,
//    tidak pernah dikirim ke browser).
// 4. Kirim satu notifikasi per subscription memakai web-push (VAPID).
//    Endpoint yang menjawab 404/410 (user uninstall/unsubscribe) dibersihkan.
//
// Env yang dibutuhkan (dari GitHub Secrets):
//   SUPABASE_URL                — project URL (sama dengan VITE_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY   — service role key (RAHASIA, jangan pernah ke frontend)
//   VAPID_PUBLIC_KEY            — VAPID public key (sama dengan VITE_VAPID_PUBLIC_KEY)
//   VAPID_PRIVATE_KEY           — VAPID private key (RAHASIA)
//   VAPID_SUBJECT               — "mailto:email-kamu@contoh.com"
//   SITE_URL (opsional)         — basis URL untuk link notifikasi,
//                                 default https://<owner>.github.io/nazes-memories

import webpush from 'web-push'

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT,
  SITE_URL = 'https://ndolzz.github.io/nazes-memories'
} = process.env

for (const [name, value] of Object.entries({
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT
})) {
  if (!value) {
    console.error(`Missing env: ${name} — isi GitHub Secrets lalu jalankan ulang.`)
    process.exit(1)
  }
}

const HEADERS = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
}

async function rest(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { headers: HEADERS })
  if (!res.ok) throw new Error(`Supabase ${path} -> HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

async function main() {
  // Jendela 26 jam — cron harian berarti tiap memory dinotifikasi tepat satu kali.
  const since = new Date(Date.now() - 26 * 3600 * 1000).toISOString()
  const memories = await rest(
    `/memories?select=id,title,created_at&created_at=gte.${since}&order=created_at.desc&limit=5`
  )
  if (!memories.length) {
    console.log('Tidak ada memory baru — tidak ada notifikasi yang dikirim.')
    return
  }

  const subs = await rest('/push_subscriptions?select=*')
  if (!subs.length) {
    console.log(`${memories.length} memory baru, tapi belum ada subscriber.`)
    return
  }

  const newest = memories[0]
  const payload = JSON.stringify({
    title: memories.length === 1 ? 'Memory baru!' : `${memories.length} memory baru!`,
    body: newest.title,
    url: `${SITE_URL}/memory/${newest.id}`,
    tag: 'naze-new-memory'
  })

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  let sent = 0
  let cleaned = 0
  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        sent++
      } catch (err) {
        // 404/410 = subscription tidak valid lagi (user uninstall dll) → bersihkan.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(sub.endpoint)}`,
            { method: 'DELETE', headers: HEADERS }
          )
          cleaned++
        } else {
          console.warn(`Gagal kirim ke ${sub.endpoint.slice(0, 48)}…:`, err.statusCode || err.message)
        }
      }
    })
  )

  console.log(`Notifikasi terkirim: ${sent}, subscription dibersihkan: ${cleaned}.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
