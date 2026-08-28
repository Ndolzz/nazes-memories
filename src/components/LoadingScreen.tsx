import { motion } from 'framer-motion'
import { Logo } from './Logo'
import { BRAND } from '@/config'

// Loading screen dengan logo — animasi "N → sparkle → Memories" (spec §39):
// N muncul dulu (logo), lalu sparkle berdenyut, lalu wordmark "Memories" fade in.
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-paper">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Logo size={56} animated />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="font-display text-lg text-ink/70"
      >
        {BRAND.name}
      </motion.p>
    </div>
  )
}
