import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Icon } from '@/components/Icon'
import { PushBell } from '@/components/PushBell'
import { BRAND, IS_DEMO_MODE } from '@/config'
import { DatabaseService } from '@/services/DatabaseService'

// Hero halaman utama — versi refresh:
// - Judul & tagline dengan animasi masuk berurutan (stagger).
// - Dua "polaroid" dekoratif miring di kiri-kanan (desktop saja) — murni
//   hiasan gradient, BUKAN foto palsu — dengan float sangat lambat yang
//   otomatis mati saat prefers-reduced-motion.
// - Baris statistik NYATA (jumlah memories dari database), bukan angka dummy:
//   hanya tampil setelah data asli terbaca dan selalu disembunyikan di demo mode.
export function Home() {
  const [loadingRandom, setLoadingRandom] = useState(false)
  const [total, setTotal] = useState<number | null>(null)
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()

  // Statistik nyata: total memories dari database. Bukan dummy data —
  // jika gagal/bermasalah, baris statistik tidak dirender sama sekali.
  useEffect(() => {
    if (IS_DEMO_MODE) return
    let mounted = true
    DatabaseService.listMemories({ pageSize: 1 })
      .then((r) => mounted && setTotal(r.total))
      .catch(() => {
        /* diam — statistik opsional */
      })
    return () => {
      mounted = false
    }
  }, [])

  async function surpriseMe() {
    if (IS_DEMO_MODE) return navigate('/memories')
    setLoadingRandom(true)
    try {
      const memory = await DatabaseService.getRandomMemory()
      if (memory) navigate(`/memory/${memory.id}?surprise=1`)
      else navigate('/memories')
    } finally {
      setLoadingRandom(false)
    }
  }

  // Float halus untuk polaroid dekoratif — sekali masuk, lalu mengambang
  // sangat lambat. Reduced motion → hanya animasi masuk sekali.
  const floatAnimate = reducedMotion
    ? { y: 0 }
    : { y: [0, -12, 0] }

  return (
    <div className="relative overflow-hidden">
      {/* Featured glow — ambient glow di sekitar hero/featured memory,
          sedikit lebih kuat daripada background global tetapi tetap lembut
          (class .ambient-featured-glow didefinisikan di index.css). */}
      <div className="ambient-featured-glow" aria-hidden="true" />

      {/* Polaroid dekoratif — gradient + ikon, jelas bukan konten (aria-hidden).
          Hanya di layar >= sm supaya hero mobile tetap bersih. */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: -30, rotate: -12 }}
        animate={{ opacity: 1, x: 0, rotate: -8, ...floatAnimate }}
        transition={{
          opacity: { duration: 0.8, delay: 0.45 },
          x: { duration: 0.8, delay: 0.45 },
          rotate: { duration: 0.8, delay: 0.45 },
          y: { duration: 9, repeat: Infinity, ease: 'easeInOut' }
        }}
        className="hidden sm:flex absolute left-[6%] lg:left-[12%] top-24 h-44 w-36 flex-col items-center justify-center gap-3 rounded-xl2 bg-naze-gradient-soft shadow-card"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-violet-500">
          <Icon name="camera" size={22} />
        </span>
        <span className="font-hand text-xl text-violet-600/80">moments…</span>
      </motion.div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: 30, rotate: 12 }}
        animate={{ opacity: 1, x: 0, rotate: 7, ...floatAnimate }}
        transition={{
          opacity: { duration: 0.8, delay: 0.6 },
          x: { duration: 0.8, delay: 0.6 },
          rotate: { duration: 0.8, delay: 0.6 },
          y: { duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }
        }}
        className="hidden sm:flex absolute right-[6%] lg:right-[12%] top-28 h-40 w-32 flex-col items-center justify-center gap-3 rounded-xl2 bg-naze-gradient-soft shadow-card"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-rose-500">
          <Icon name="heart" size={20} />
        </span>
        <span className="font-hand text-xl text-rose-600/80">stories…</span>
      </motion.div>

      <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Logo size={48} className="mx-auto" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl mt-6 text-ink tracking-tight"
        >
          {BRAND.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-hand text-2xl sm:text-3xl text-violet-600 mt-2"
        >
          {BRAND.tagline}
        </motion.p>

        {/* Statistik nyata — hanya muncul jika database terhubung. */}
        {!IS_DEMO_MODE && total !== null && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="mt-4 text-sm text-ink-soft/70"
          >
            <span className="font-semibold text-ink">{total}</span>{' '}
            {total === 1 ? 'memory tersimpan' : 'memories tersimpan'} · dan terus bertambah
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-9"
        >
          <Link
            to="/memories"
            className="px-6 py-3 rounded-full bg-naze-gradient text-white font-medium text-sm shadow-floating hover:opacity-90 transition-opacity"
          >
            Explore Memories
          </Link>
          <button
            onClick={surpriseMe}
            disabled={loadingRandom}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-violet-200 text-ink-soft font-medium text-sm hover:bg-paper transition-colors disabled:opacity-60"
          >
            <Icon name="random" size={16} />
            {loadingRandom ? 'Mencari…' : 'Surprise Me'}
          </button>
        </motion.div>

        {/* Toggle notifikasi — hanya muncul jika push didukung & VAPID terisi.
            Varian teks kecil supaya hero tetap bersih. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-5 md:hidden flex justify-center"
        >
          <PushBell variant="row" />
        </motion.div>
      </div>
    </div>
  )
}
