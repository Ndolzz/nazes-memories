import { useCallback, useRef, useState } from 'react'
import { Icon } from '@/components/Icon'
import { validateMediaFile } from '@/utils/validation'
import { compressImageIfNeeded, generateImageThumbnail, generateVideoPosterFrame } from '@/utils/media'
import { StorageService } from '@/services/StorageService'
import { DatabaseService } from '@/services/DatabaseService'
import { uuid } from '@/utils/format'
import type { UploadTask } from '@/types'

// Upload interface admin: drag & drop, multi-file, preview, progress per file,
// retry, delete dari antrian, lalu bulk metadata editing sebelum disimpan.
// Alur nyata: validasi → compress → upload storage → simpan metadata → refresh (spec §9, §17).
export function AdminUpload() {
  const [tasks, setTasks] = useState<UploadTask[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [sharedCategory, setSharedCategory] = useState('')
  const [sharedTags, setSharedTags] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList | File[]) => {
    const newTasks: UploadTask[] = Array.from(files).map((file) => ({
      id: uuid(),
      file,
      progress: 0,
      status: 'queued',
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))
    setTasks((prev) => [...prev, ...newTasks])
  }, [])

  function updateTask(id: string, patch: Partial<UploadTask>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function processTask(task: UploadTask) {
    const validation = validateMediaFile(task.file)
    if (!validation.ok || !validation.mediaType) {
      return updateTask(task.id, { status: 'error', error: validation.error })
    }
    const mediaType = validation.mediaType

    try {
      updateTask(task.id, { status: 'compressing' })
      const processedFile = mediaType === 'image' ? await compressImageIfNeeded(task.file) : task.file

      updateTask(task.id, { status: 'uploading', progress: 5 })
      const id = uuid()
      const mediaPath = StorageService.buildPath(mediaType, id, processedFile as File)
      const mediaUrl = await StorageService.upload(mediaPath, processedFile, task.file.type, (pct) =>
        updateTask(task.id, { progress: Math.round(pct * 0.7) })
      )

      let thumbnailUrl: string | null = null
      const thumbBlob =
        mediaType === 'image' ? await generateImageThumbnail(task.file) : await generateVideoPosterFrame(task.file)
      if (thumbBlob) {
        const thumbPath = StorageService.buildPath(mediaType, id, task.file, 'thumbnail')
        thumbnailUrl = await StorageService.upload(thumbPath, thumbBlob, 'image/jpeg', (pct) =>
          updateTask(task.id, { progress: 70 + Math.round(pct * 0.2) })
        )
      }

      updateTask(task.id, { status: 'saving', progress: 92 })
      await DatabaseService.createMemory({
        id,
        title: task.file.name.replace(/\.[^/.]+$/, ''),
        description: null,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl,
        media_type: mediaType,
        file_path: mediaPath,
        captured_at: new Date().toISOString(),
        category: sharedCategory || null,
        tags: sharedTags ? sharedTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        location: null,
        sort_order: 0
      })

      updateTask(task.id, { status: 'done', progress: 100 })
    } catch (e: any) {
      updateTask(task.id, { status: 'error', error: e.message ?? 'Upload gagal.' })
    }
  }

  async function uploadAll() {
    const queued = tasks.filter((t) => t.status === 'queued' || t.status === 'error')
    for (const t of queued) {
      // Sekuensial (bukan Promise.all) supaya tidak membanjiri free-tier bandwidth
      // dengan banyak upload paralel sekaligus.
      // eslint-disable-next-line no-await-in-loop
      await processTask(t)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl">Upload</h1>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
        className={`rounded-xl2 border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? 'border-rose-400 bg-rose-50' : 'border-violet-200 bg-violet-50/50'
        }`}
      >
        <Icon name="upload" size={28} className="mx-auto text-violet-500 mb-3" />
        <p className="text-sm text-ink-soft">Tarik & lepas foto/video di sini, atau</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-sm font-medium text-violet-600 hover:underline"
        >
          pilih file dari perangkat
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {tasks.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Kategori untuk semua file (opsional)"
              value={sharedCategory}
              onChange={(e) => setSharedCategory(e.target.value)}
              className="rounded-xl2 border border-violet-100 px-3 py-2 text-sm"
            />
            <input
              placeholder="Tags, pisahkan koma (opsional)"
              value={sharedTags}
              onChange={(e) => setSharedTags(e.target.value)}
              className="rounded-xl2 border border-violet-100 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl2 border border-violet-100 p-3">
                {t.previewUrl ? (
                  <img src={t.previewUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center text-violet-400">
                    <Icon name="video" size={18} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.file.name}</p>
                  <p className="text-xs text-ink-soft/50">
                    {(t.file.size / 1024 / 1024).toFixed(1)} MB · {t.status === 'error' ? t.error : t.status}
                  </p>
                  {(t.status === 'uploading' || t.status === 'compressing' || t.status === 'saving') && (
                    <div className="h-1.5 rounded-full bg-violet-100 mt-1.5 overflow-hidden">
                      <div className="h-full bg-naze-gradient transition-all" style={{ width: `${t.progress}%` }} />
                    </div>
                  )}
                </div>
                {t.status === 'done' ? (
                  <span className="text-violet-600"><Icon name="heart" size={16} /></span>
                ) : t.status === 'error' ? (
                  <button onClick={() => processTask(t)} className="text-xs font-medium text-violet-600">Coba lagi</button>
                ) : null}
                <button onClick={() => removeTask(t.id)} aria-label="Hapus dari antrian" className="text-ink-soft/40 hover:text-rose-600">
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={uploadAll}
            className="px-5 py-2.5 rounded-full bg-naze-gradient text-white text-sm font-medium"
          >
            Upload semua ({tasks.filter((t) => t.status === 'queued' || t.status === 'error').length})
          </button>
        </>
      )}
    </div>
  )
}
