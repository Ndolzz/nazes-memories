import { useState } from 'react'
import { MemoryGrid } from '@/components/MemoryGrid'
import { EmptyState } from '@/components/EmptyState'
import { useMemories } from '@/hooks/useMemories'
import type { GalleryLayout } from '@/types'

export function Favorites() {
  const [layout] = useState<GalleryLayout>('grid')
  const { items, loading } = useMemories({ type: 'favorites' }, 'newest')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-display text-2xl text-ink">Favorite Memories</h1>
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-xl2 skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="heart" title="Belum ada favorit." description="Tandai memory favoritmu dengan ikon hati." />
      ) : (
        <MemoryGrid items={items} layout={layout} />
      )}
    </div>
  )
}
