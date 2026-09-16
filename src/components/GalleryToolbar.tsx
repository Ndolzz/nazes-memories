import { Icon, type IconName } from './Icon'
import type { GalleryLayout, SortMode } from '@/types'

const layouts: { value: GalleryLayout; icon: IconName; label: string }[] = [
  { value: 'grid', icon: 'grid', label: 'Grid' },
  { value: 'masonry', icon: 'masonry', label: 'Masonry' },
  { value: 'editorial', icon: 'zoom', label: 'Editorial' },
  { value: 'compact', icon: 'grid', label: 'Compact' },
  { value: 'timeline', icon: 'timeline', label: 'Timeline' }
]

export function GalleryToolbar({
  layout,
  onLayout,
  sort,
  onSort
}: {
  layout: GalleryLayout
  onLayout: (l: GalleryLayout) => void
  sort: SortMode
  onSort: (s: SortMode) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1 rounded-full bg-violet-50 p-1">
        {layouts.map((l) => (
          <button
            key={l.value}
            onClick={() => onLayout(l.value)}
            aria-pressed={layout === l.value}
            aria-label={l.label}
            title={l.label}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              layout === l.value ? 'bg-paper text-violet-600 shadow-card' : 'text-ink-soft/50 hover:text-ink-soft'
            }`}
          >
            <Icon name={l.icon} size={16} />
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as SortMode)}
        className="text-sm rounded-full border border-violet-100 bg-paper px-3 py-1.5 text-ink-soft focus-visible:outline-none"
        aria-label="Urutkan"
      >
        <option value="newest">Terbaru</option>
        <option value="oldest">Terlama</option>
        <option value="custom">Urutan kustom</option>
        <option value="random">Acak</option>
      </select>
    </div>
  )
}
