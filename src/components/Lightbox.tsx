import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { Icon } from './Icon'
import { formatDate } from '@/utils/format'
import type { Memory } from '@/types'

// Fullscreen media viewer (spec §10). Keyboard: ← → untuk navigasi, Esc untuk tutup,
// + untuk info. Mobile: swipe kiri/kanan untuk ganti, tap untuk toggle kontrol.
export function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
  onToggleFavorite
}: {
  items: Memory[]
  index: number
  onClose: () => void
  onIndexChange: (i: number) => void
  onToggleFavorite: (m: Memory) => void
}) {
  const [showInfo, setShowInfo] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [zoomed, setZoomed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const memory = items[index]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onIndexChange(Math.max(0, index - 1))
      if (e.key === 'ArrowRight') onIndexChange(Math.min(items.length - 1, index + 1))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, items.length, onClose, onIndexChange])

  if (!memory) return null

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -80) onIndexChange(Math.min(items.length - 1, index + 1))
    else if (info.offset.x > 80) onIndexChange(Math.max(0, index - 1))
  }

  async function handleShare() {
    const url = `${window.location.origin}/memory/${memory.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: memory.title, url })
      } catch {
        /* dibatalkan user */
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={memory.title}
      className="fixed inset-0 z-[90] bg-ink/95 flex flex-col"
      onClick={() => setShowControls((s) => !s)}
    >
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between px-4 py-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} aria-label="Tutup" className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10">
              <Icon name="close" size={20} />
            </button>
            <span className="text-sm text-white/70">{index + 1} / {items.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => onToggleFavorite(memory)} aria-label="Favorite" className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10">
                <Icon name="heart" size={18} className={memory.is_favorite ? 'text-rose-400' : ''} />
              </button>
              <button onClick={handleShare} aria-label="Bagikan" className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10">
                <Icon name="share" size={18} />
              </button>
              <a href={memory.media_url} download aria-label="Unduh" className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10">
                <Icon name="download" size={18} />
              </a>
              <button onClick={() => setShowInfo((s) => !s)} aria-label="Informasi" className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10">
                <Icon name="info" size={18} />
              </button>
              <button
                onClick={() => document.documentElement.requestFullscreen?.()}
                aria-label="Fullscreen"
                className="h-10 w-10 hidden sm:flex items-center justify-center rounded-full hover:bg-white/10"
              >
                <Icon name="fullscreen" size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {showControls && index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onIndexChange(index - 1) }}
            aria-label="Sebelumnya"
            className="hidden sm:flex absolute left-3 z-10 h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <Icon name="chevronLeft" size={20} />
          </button>
        )}

        <motion.div
          key={memory.id}
          drag={memory.media_type === 'image' ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-h-full max-w-full px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {memory.media_type === 'image' ? (
            <img
              src={memory.media_url}
              alt={memory.title}
              onDoubleClick={() => setZoomed((z) => !z)}
              className={`max-h-[80vh] mx-auto rounded-lg transition-transform duration-300 ${zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
            />
          ) : (
            <video
              ref={videoRef}
              src={memory.media_url}
              poster={memory.thumbnail_url ?? undefined}
              controls
              playsInline
              className="max-h-[80vh] mx-auto rounded-lg"
            />
          )}
        </motion.div>

        {showControls && index < items.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onIndexChange(index + 1) }}
            aria-label="Berikutnya"
            className="hidden sm:flex absolute right-3 z-10 h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <Icon name="chevronRight" size={20} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="px-5 py-4 bg-ink text-white"
          >
            <p className="font-display text-lg">{memory.title}</p>
            <p className="text-white/60 text-sm mt-0.5">{formatDate(memory.captured_at)}</p>
            {memory.description && <p className="text-white/80 text-sm mt-2">{memory.description}</p>}
            {memory.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {memory.tags.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">#{t}</span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
