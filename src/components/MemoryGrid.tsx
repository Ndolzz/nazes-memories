import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MemoryCard } from './MemoryCard'
import type { Memory, GalleryLayout } from '@/types'
import { formatMonthYear } from '@/utils/format'

// Merender lima mode layout dari data yang sama (spec §8): grid, masonry
// (CSS columns), editorial (kolom lebar dengan 1 hero besar), compact
// (grid padat), timeline (dikelompokkan per bulan).
//
// Refresh: kartu grid/editorial/compact/timeline masuk dengan animasi
// fade-up stagger (delay per index, di-cap supaya halaman panjang tidak
// menunggu). Masonry tetap tanpa wrapper animasi — wrapper motion akan
// merusak break-inside CSS columns. Reduced motion → tanpa stagger.

function StaggerItem({ index, children }: { index: number; children: ReactNode }) {
  const reduced = useReducedMotion()
  if (reduced) return <>{children}</>
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.045, 0.45), ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

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
            <StaggerItem index={i}>
              <MemoryCard memory={m} layout={layout} />
            </StaggerItem>
          </div>
        ))}
      </div>
    )
  }

  if (layout === 'compact') {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {items.map((m, i) => (
          <StaggerItem key={m.id} index={i}>
            <MemoryCard memory={m} layout={layout} />
          </StaggerItem>
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
              {group.map((m, i) => (
                <StaggerItem key={m.id} index={i}>
                  <MemoryCard memory={m} layout="grid" />
                </StaggerItem>
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
      {items.map((m, i) => (
        <StaggerItem key={m.id} index={i}>
          <MemoryCard memory={m} layout={layout} />
        </StaggerItem>
      ))}
    </div>
  )
}
