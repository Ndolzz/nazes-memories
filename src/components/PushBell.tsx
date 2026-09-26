import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/Icon'
import { IS_DEMO_MODE } from '@/config'
import {
  isPushSupported,
  getPushState,
  subscribeToPush,
  unsubscribeFromPush,
  type PushState
} from '@/utils/push'

// Tombol lonceng notifikasi "memory baru" — muncul HANYA jika push didukung
// browser, VAPID public key terisi di env, dan bukan demo mode (no fake
// buttons, spec §46/§52). Dua varian:
//   variant="icon" — untuk Navbar desktop (tombol bulat 36px)
//   variant="row"  — untuk halaman More mobile (baris seperti link lain)

export function PushBell({ variant = 'icon' }: { variant?: 'icon' | 'row' }) {
  const [state, setState] = useState<PushState>('unsupported')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    if (!IS_DEMO_MODE && isPushSupported()) {
      getPushState().then((s) => mounted && setState(s))
    }
    return () => {
      mounted = false
    }
  }, [])

  // unsupported/unavailable/denied → jangan tampilkan tombol subscribe palsu.
  if (state === 'unsupported' || state === 'unavailable' || state === 'denied') return null

  async function toggle() {
    if (busy) return
    setBusy(true)
    try {
      const next =
        state === 'subscribed' ? await unsubscribeFromPush() : await subscribeToPush()
      setState(next)
    } catch (e: any) {
      console.warn('push toggle failed', e)
    } finally {
      setBusy(false)
    }
  }

  const subscribed = state === 'subscribed'

  if (variant === 'row') {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl2 bg-violet-50 text-ink-soft font-medium hover:bg-violet-100 transition-colors disabled:opacity-60"
      >
        <Icon name="bell" size={18} className={subscribed ? 'text-rose-600' : ''} />
        <span className="flex-1 text-left">
          {subscribed ? 'Notifikasi aktif — ketuk untuk berhenti' : 'Aktifkan notifikasi memory baru'}
        </span>
        {subscribed && <span className="text-xs text-rose-600 font-semibold">ON</span>}
      </button>
    )
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={toggle}
      disabled={busy}
      aria-label={subscribed ? 'Nonaktifkan notifikasi' : 'Aktifkan notifikasi memory baru'}
      title={subscribed ? 'Notifikasi aktif — klik untuk berhenti' : 'Aktifkan notifikasi memory baru'}
      className={`relative flex items-center justify-center h-9 w-9 rounded-full transition-colors disabled:opacity-60 ${
        subscribed ? 'bg-rose-50 text-rose-600' : 'text-ink-soft hover:bg-rose-50'
      }`}
    >
      <Icon name="bell" size={18} />
      {subscribed && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
      )}
    </motion.button>
  )
}
