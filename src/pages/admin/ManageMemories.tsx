import { useEffect, useState } from 'react'
import { Icon } from '@/components/Icon'
import { DatabaseService } from '@/services/DatabaseService'
import { StorageService } from '@/services/StorageService'
import { formatDate } from '@/utils/format'
import type { Memory } from '@/types'

// Bulk management (spec §18): pilih banyak memory sekaligus, jalankan aksi,
// dan setiap aksi destruktif (delete) wajib konfirmasi eksplisit.
export function AdminManageMemories() {
  const [items, setItems] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [categoryInput, setCategoryInput] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await DatabaseService.listMemories({ sort: 'newest', pageSize: 200 })
      setItems(res.items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))))
  }

  async function bulkFavorite(value: boolean) {
    await DatabaseService.bulkUpdate(Array.from(selected), { is_favorite: value })
    await load()
    setSelected(new Set())
  }

  async function bulkCategory() {
    if (!categoryInput.trim()) return
    await DatabaseService.bulkUpdate(Array.from(selected), { category: categoryInput.trim() })
    setCategoryInput('')
    await load()
    setSelected(new Set())
  }

  async function bulkDelete() {
    const targets = items.filter((i) => selected.has(i.id))
    await StorageService.remove(targets.map((t) => t.file_path))
    await DatabaseService.deleteMemories(Array.from(selected))
    setConfirmDelete(false)
    await load()
    setSelected(new Set())
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl">Memories</h1>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-ink-soft/60">{selected.size} dipilih</span>
            <button onClick={() => bulkFavorite(true)} className="text-xs font-medium px-3 py-1.5 rounded-full bg-rose-50 text-rose-700">
              Favorite
            </button>
            <button onClick={() => bulkFavorite(false)} className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-50 text-violet-700">
              Unfavorite
            </button>
            <input
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="Kategori baru…"
              className="text-xs px-3 py-1.5 rounded-full border border-violet-100 w-32"
            />
            <button onClick={bulkCategory} className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-50 text-violet-700">
              Terapkan
            </button>
            <button onClick={() => setConfirmDelete(true)} className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-700">
              Hapus
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-40 rounded-xl2 skeleton" />
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-soft/60">Belum ada memory. Upload dulu lewat menu Upload.</p>
      ) : (
        <div className="rounded-xl2 border border-violet-100 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-violet-50 text-xs font-medium text-ink-soft/60">
            <input type="checkbox" checked={selected.size === items.length} onChange={toggleAll} />
            <span>Pilih semua</span>
          </div>
          {items.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5 border-t border-violet-50">
              <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggle(m.id)} />
              <img src={m.thumbnail_url ?? m.media_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{m.title}</p>
                <p className="text-xs text-ink-soft/50">{formatDate(m.captured_at, 'short')} · {m.category ?? 'Tanpa kategori'}</p>
              </div>
              {m.is_favorite && <Icon name="heart" size={14} className="text-rose-600" />}
              {m.media_type === 'video' && <Icon name="video" size={14} className="text-violet-500" />}
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center px-6">
          <div className="bg-white rounded-xl2 p-6 max-w-sm w-full space-y-4">
            <p className="font-display text-lg">Hapus {selected.size} memory?</p>
            <p className="text-sm text-ink-soft/70">Tindakan ini tidak dapat dibatalkan. File di storage juga akan dihapus.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-full text-sm text-ink-soft">Batal</button>
              <button onClick={bulkDelete} className="px-4 py-2 rounded-full text-sm bg-red-600 text-white font-medium">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
