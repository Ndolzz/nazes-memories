import { useEffect, useState } from 'react'
import { DatabaseService } from '@/services/DatabaseService'
import { MemoryGrid } from '@/components/MemoryGrid'
import { EmptyState } from '@/components/EmptyState'
import { IS_DEMO_MODE } from '@/config'
import type { Memory } from '@/types'

export function Timeline() {
  const [items, setItems] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_DEMO_MODE) {
      setLoading(false)
      return
    }
    DatabaseService.getTimeline()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="font-display text-2xl text-ink">Timeline</h1>
      {loading ? (
        <div className="h-40 rounded-xl2 skeleton" />
      ) : items.length === 0 ? (
        <EmptyState icon="timeline" title="No memories yet." description="Beautiful stories are waiting to be added." />
      ) : (
        <MemoryGrid items={items} layout="timeline" />
      )}
    </div>
  )
}
