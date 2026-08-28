import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Icon } from '@/components/Icon'
import { BRAND, IS_DEMO_MODE } from '@/config'
import { DatabaseService } from '@/services/DatabaseService'
import { useNavigate } from 'react-router-dom'

// Hero halaman utama. Background: gradient lembut + beberapa "kartu foto"
// mengambang yang miring — bahasa visual scrapbook — dengan animasi masuk
// yang halus sekali saja (bukan animasi berjalan terus, hemat baterai HP low-end).
export function Home() {
  const [loadingRandom, setLoadingRandom] = useState(false)
  const navigate = useNavigate()

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

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-naze-gradient-soft" aria-hidden="true" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-rose-300/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-violet-300/30 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Logo size={48} className="mx-auto" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl mt-6 text-ink"
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
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-violet-200 text-ink-soft font-medium text-sm hover:bg-white transition-colors disabled:opacity-60"
          >
            <Icon name="random" size={16} />
            {loadingRandom ? 'Mencari…' : 'Surprise Me'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
