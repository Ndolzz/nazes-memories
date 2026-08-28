import { useMemo, useState } from 'react'
import { GalleryToolbar } from '@/components/GalleryToolbar'
import { MemoryGrid } from '@/components/MemoryGrid'
import { EmptyState } from '@/components/EmptyState'
import { Icon } from '@/components/Icon'
import { useMemories } from '@/hooks/useMemories'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { GalleryLayout, MemoryFilters, SortMode } from '@/types'

const filterTabs: { value: MemoryFilters['type']; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'image', label: 'Foto' },
  { value: 'video', label: 'Video' },
  { value: 'favorites', label: 'Favorit' }
]

export function Memories() {
  const [layout, setLayout] = useState<GalleryLayout>('grid')
  const [sort, setSort] = useState<SortMode>('newest')
  const [type, setType] = useState<MemoryFilters['type']>('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 350)

  const filters = useMemo<MemoryFilters>(() => ({ type, search: debouncedSearch }), [type, debouncedSearch])
  const { items, loading, error, hasMore, loadMore } = useMemories(filters, sort)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl text-ink">Memories</h1>
          <div className="relative w-full max-w-xs hidden sm:block">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, tag, lokasi…"
              className="w-full rounded-full border border-violet-100 bg-white pl-9 pr-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filterTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                type === t.value ? 'bg-naze-gradient text-white' : 'bg-violet-50 text-ink-soft'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <GalleryToolbar layout={layout} onLayout={setLayout} sort={sort} onSort={setSort} />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-xl2 skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="memory"
          title={search ? 'No memories found.' : 'No memories yet.'}
          description={
            search
              ? 'Coba kata kunci lain.'
              : 'Beautiful stories are waiting to be added.'
          }
          action={
            search ? (
              <button onClick={() => setSearch('')} className="text-sm font-medium text-violet-600 hover:underline">
                Reset filter
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <MemoryGrid items={items} layout={layout} />
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-5 py-2.5 rounded-full border border-violet-200 text-sm font-medium text-ink-soft hover:bg-violet-50 disabled:opacity-60"
              >
                {loading ? 'Memuat…' : 'Muat lebih banyak'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
