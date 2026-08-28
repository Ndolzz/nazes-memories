import { MemoryCard } from './MemoryCard'
import type { Memory, GalleryLayout } from '@/types'
import { formatMonthYear } from '@/utils/format'

// Merender lima mode layout dari data yang sama (spec §8): grid, masonry
// (CSS columns), editorial (kolom lebar dengan 1 hero besar), compact
// (grid padat), timeline (dikelompokkan per bulan).
export function MemoryGrid({ items, layout }: { items: Memory[]; layout: GalleryLayout }) {
  if (layout === 'masonry') {
    return (
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
        {items.map((m) => (
          <MemoryCard key={m.id} memory={m} layout={layout} />
        ))}
      </div>
    )
  }

  if (layout === 'editorial') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((m, i) => (
          <div key={m.id} className={i % 7 === 0 ? 'col-span-2 sm:col-span-2 row-span-2' : ''}>
            <MemoryCard memory={m} layout={layout} />
          </div>
        ))}
      </div>
    )
  }

  if (layout === 'compact') {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {items.map((m) => (
          <MemoryCard key={m.id} memory={m} layout={layout} />
        ))}
      </div>
    )
  }

  if (layout === 'timeline') {
    const groups = new Map<string, Memory[]>()
    for (const m of items) {
      const key = formatMonthYear(m.captured_at)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(m)
    }
    return (
      <div className="space-y-10">
        {Array.from(groups.entries()).map(([month, group]) => (
          <div key={month}>
            <p className="eyebrow mb-3">{month}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.map((m) => (
                <MemoryCard key={m.id} memory={m} layout="grid" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // grid (default)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((m) => (
        <MemoryCard key={m.id} memory={m} layout={layout} />
      ))}
    </div>
  )
}
