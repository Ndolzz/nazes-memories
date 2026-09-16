import { useMemo, useState } from 'react'
import { Icon } from '@/components/Icon'
import { MemoryGrid } from '@/components/MemoryGrid'
import { EmptyState } from '@/components/EmptyState'
import { useMemories } from '@/hooks/useMemories'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { MemoryFilters } from '@/types'

export function Search() {
  const [q, setQ] = useState('')
  const debounced = useDebouncedValue(q, 350)
  const filters = useMemo<MemoryFilters>(() => ({ search: debounced }), [debounced])
  const { items, loading } = useMemories(filters, 'newest')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="relative">
        <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari judul, deskripsi, tag, kategori, atau lokasi…"
          className="w-full rounded-full border border-violet-100 bg-paper pl-11 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        />
      </div>

      {q && !loading && items.length === 0 && (
        <EmptyState icon="search" title="No memories found." description="Coba kata kunci lain." />
      )}

      {items.length > 0 && <MemoryGrid items={items} layout="grid" />}
    </div>
  )
}
