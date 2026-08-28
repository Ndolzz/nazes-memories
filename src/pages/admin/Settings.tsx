import { useEffect, useState } from 'react'
import { DatabaseService } from '@/services/DatabaseService'
import { IS_DEMO_MODE } from '@/config'
import type { AppSettings } from '@/types'

export function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    if (IS_DEMO_MODE) return
    DatabaseService.getSettings().then(setSettings)
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true)
    try {
      await DatabaseService.updateSettings(settings)
      setSavedAt(Date.now())
    } finally {
      setSaving(false)
    }
  }

  async function exportManifest(format: 'json' | 'csv') {
    const content = await DatabaseService.exportManifest(format)
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `naze-memories-manifest.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="font-display text-2xl">Settings</h1>

      {settings && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Site title</label>
            <input
              value={settings.site_title}
              onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
              className="w-full mt-1 rounded-xl2 border border-violet-100 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Tagline</label>
            <input
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full mt-1 rounded-xl2 border border-violet-100 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Max ukuran gambar (MB)</label>
              <input
                type="number"
                value={settings.max_image_size_mb}
                onChange={(e) => setSettings({ ...settings, max_image_size_mb: Number(e.target.value) })}
                className="w-full mt-1 rounded-xl2 border border-violet-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Max ukuran video (MB)</label>
              <input
                type="number"
                value={settings.max_video_size_mb}
                onChange={(e) => setSettings({ ...settings, max_video_size_mb: Number(e.target.value) })}
                className="w-full mt-1 rounded-xl2 border border-violet-100 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-full bg-naze-gradient text-white text-sm font-medium disabled:opacity-60">
            {saving ? 'Menyimpan…' : 'Simpan pengaturan'}
          </button>
          {savedAt && <span className="text-xs text-ink-soft/50 ml-2">Tersimpan.</span>}
        </div>
      )}

      <div className="pt-6 border-t border-violet-100 space-y-3">
        <p className="text-sm font-medium text-ink">Backup metadata</p>
        <p className="text-xs text-ink-soft/60">
          Mengunduh manifest metadata (bukan file media itu sendiri — media tetap ada di Supabase Storage).
        </p>
        <div className="flex gap-2">
          <button onClick={() => exportManifest('json')} className="px-4 py-2 rounded-full border border-violet-200 text-sm font-medium text-ink-soft">
            Download Manifest (JSON)
          </button>
          <button onClick={() => exportManifest('csv')} className="px-4 py-2 rounded-full border border-violet-200 text-sm font-medium text-ink-soft">
            Download Manifest (CSV)
          </button>
        </div>
      </div>
    </div>
  )
}
