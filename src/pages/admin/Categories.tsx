import { useEffect, useState } from 'react'
import { DatabaseService } from '@/services/DatabaseService'

export function AdminCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    DatabaseService.listCategories().then(setCategories).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="font-display text-2xl">Categories</h1>
      <p className="text-sm text-ink-soft/60">
        Kategori dibuat otomatis dari field kategori setiap memory (lihat menu Upload atau Memories).
        Belum ada tabel kategori terpisah — daftar di bawah ini diambil langsung dari data yang ada.
      </p>
      {loading ? (
        <div className="h-24 rounded-xl2 skeleton" />
      ) : categories.length === 0 ? (
        <p className="text-sm text-ink-soft/50">Belum ada kategori.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="text-sm px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 font-medium">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
