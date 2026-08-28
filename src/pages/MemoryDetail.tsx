import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@/components/Icon'
import { DatabaseService } from '@/services/DatabaseService'
import { formatDate } from '@/utils/format'
import { IS_DEMO_MODE } from '@/config'
import type { Memory } from '@/types'

// Halaman detail per memory di "/memory/:id" (spec §11), URL unik untuk share.
export function MemoryDetail() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const isSurprise = params.get('surprise') === '1'
  const [memory, setMemory] = useState<Memory | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    if (IS_DEMO_MODE) {
      setLoading(false)
      setNotFound(true)
      return
    }
    let mounted = true
    setLoading(true)
    DatabaseService.getMemory(id)
      .then((m) => {
        if (!mounted) return
        if (m) {
          setMemory(m)
          DatabaseService.incrementViews(id)
        } else {
          setNotFound(true)
        }
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [id])

  async function toggleFavorite() {
    if (!memory) return
    const next = !memory.is_favorite
    setMemory({ ...memory, is_favorite: next })
    try {
      await DatabaseService.setFavorite(memory.id, next)
    } catch {
      setMemory({ ...memory, is_favorite: !next })
    }
  }

  async function handleShare() {
    if (!memory) return
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: memory.title, url })
      } catch {
        /* dibatalkan */
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        <div className="aspect-[4/3] rounded-xl2 skeleton" />
        <div className="h-6 w-2/3 rounded skeleton" />
        <div className="h-4 w-1/3 rounded skeleton" />
      </div>
    )
  }

  if (notFound || !memory) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center space-y-3">
        <p className="font-display text-xl">Memory tidak ditemukan.</p>
        <Link to="/memories" className="text-violet-600 text-sm font-medium hover:underline">
          Kembali ke Memories
        </Link>
      </div>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-6 py-10"
    >
      {isSurprise && <p className="eyebrow mb-3">Remember this moment</p>}

      <div className="rounded-xl2 overflow-hidden bg-violet-50 shadow-card">
        {memory.media_type === 'image' ? (
          <img src={memory.media_url} alt={memory.title} className="w-full max-h-[70vh] object-cover" />
        ) : (
          <video src={memory.media_url} poster={memory.thumbnail_url ?? undefined} controls playsInline className="w-full max-h-[70vh]" />
        )}
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Captured on {formatDate(memory.captured_at)}</p>
          <h1 className="font-display text-3xl text-ink mt-1">{memory.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleFavorite}
            aria-label="Favorite"
            className={`h-10 w-10 flex items-center justify-center rounded-full border transition-colors ${
              memory.is_favorite ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-violet-100 text-ink-soft'
            }`}
          >
            <Icon name="heart" size={18} />
          </button>
          <button
            onClick={handleShare}
            aria-label="Bagikan"
            className="h-10 w-10 flex items-center justify-center rounded-full border border-violet-100 text-ink-soft"
          >
            <Icon name="share" size={18} />
          </button>
        </div>
      </div>

      {memory.description && <p className="text-ink-soft/80 mt-4 leading-relaxed">{memory.description}</p>}

      <div className="flex flex-wrap gap-2 mt-5">
        {memory.category && (
          <span className="text-xs px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-medium">{memory.category}</span>
        )}
        {memory.tags.map((t) => (
          <span key={t} className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-700">#{t}</span>
        ))}
      </div>

      {memory.location && (
        <p className="text-sm text-ink-soft/60 mt-4 flex items-center gap-1.5">
          <Icon name="calendar" size={14} /> {memory.location}
        </p>
      )}
    </motion.article>
  )
}
