import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { DatabaseService } from '@/services/DatabaseService'
import { EmptyState } from '@/components/EmptyState'
import { IS_DEMO_MODE } from '@/config'

// Rute "/random" dari bottom nav — memicu animasi transisi lalu membuka
// memory acak, sama seperti tombol "Surprise Me" di Home (spec §22).
export function Random() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (IS_DEMO_MODE) {
      setError('Mode demo — hubungkan Supabase untuk memakai fitur ini.')
      return
    }
    let mounted = true
    DatabaseService.getRandomMemory()
      .then((m) => {
        if (!mounted) return
        if (m) navigate(`/memory/${m.id}?surprise=1`, { replace: true })
        else setError('Belum ada memory untuk diacak.')
      })
      .catch((e) => mounted && setError(e.message))
    return () => {
      mounted = false
    }
  }, [navigate])

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16">
        <EmptyState icon="random" title="Belum bisa mengacak." description={error} />
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 1.1, repeat: Infinity }}>
        <Logo size={44} />
      </motion.div>
      <p className="text-ink-soft/60 text-sm">Mencari momen untukmu…</p>
    </div>
  )
}
