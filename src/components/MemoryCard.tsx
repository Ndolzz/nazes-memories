import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { formatDate } from '@/utils/format'
import type { Memory, GalleryLayout } from '@/types'

// Kartu galeri: gambar/video, title, tanggal, kategori, favorite, indikator video.
// Layout menentukan aspect ratio & sedikit densitas, bukan komponen terpisah,
// supaya konsisten di semua mode (spec §8).
export function MemoryCard({ memory, layout }: { memory: Memory; layout: GalleryLayout }) {
  const aspect =
    layout === 'masonry' ? '' : layout === 'compact' ? 'aspect-square' : 'aspect-[4/5]'

  return (
    <Link
      to={`/memory/${memory.id}`}
      className="group relative block overflow-hidden rounded-xl2 bg-violet-50 shadow-card transition-shadow duration-500 ease-out group-hover:shadow-glow group-active:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
    >
      <div className={`relative w-full overflow-hidden ${aspect}`}>
        <img
          src={memory.thumbnail_url ?? memory.media_url}
          alt={memory.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {memory.media_type === 'video' && (
          <span className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/50 text-white backdrop-blur-sm">
            <Icon name="video" size={14} />
          </span>
        )}
        {memory.is_favorite && (
          <span className="absolute top-2.5 left-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-rose-600">
            <Icon name="heart" size={14} />
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="font-display text-white text-sm truncate">{memory.title}</p>
          <p className="text-white/75 text-xs">{formatDate(memory.captured_at, 'short')}</p>
        </div>
      </div>
    </Link>
  )
}
