import { useCallback, useEffect, useState } from 'react'
import { DatabaseService } from '@/services/DatabaseService'
import { IS_DEMO_MODE, DEFAULT_PAGE_SIZE } from '@/config'
import type { Memory, MemoryFilters, SortMode } from '@/types'

// Hook data-fetching utama galeri: pagination + filter + sort, dengan
// state loading/error yang jujur (bukan optimistic dummy data).
export function useMemories(filters: MemoryFilters, sort: SortMode) {
  const [items, setItems] = useState<Memory[]>([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (targetPage: number, replace: boolean) => {
      if (IS_DEMO_MODE) {
        setLoading(false)
        setItems([])
        setTotal(0)
        setHasMore(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const res = await DatabaseService.listMemories({ filters, sort, page: targetPage, pageSize: DEFAULT_PAGE_SIZE })
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]))
        setTotal(res.total)
        setHasMore(res.hasMore)
        setPage(targetPage)
      } catch (e: any) {
        setError(e.message ?? 'Gagal memuat memories.')
      } finally {
        setLoading(false)
      }
    },
    [JSON.stringify(filters), sort]
  )

  useEffect(() => {
    load(0, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), sort])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) load(page + 1, false)
  }, [loading, hasMore, page, load])

  const refresh = useCallback(() => load(0, true), [load])

  return { items, total, hasMore, loading, error, loadMore, refresh }
}
