import { requireSupabase } from '@/lib/supabase'
import { STORAGE_BUCKET, STORAGE_PATHS } from '@/config'
import type { MediaType } from '@/types'

// Semua logic Supabase Storage hidup di sini, bukan tersebar di komponen.
// Struktur folder: memories/images|videos/<uuid>.<ext>, thumbnail terpisah.
function extOf(file: File): string {
  const fromName = file.name.split('.').pop()
  return (fromName || file.type.split('/').pop() || 'bin').toLowerCase()
}

class StorageServiceImpl {
  buildPath(mediaType: MediaType, id: string, file: File, kind: 'media' | 'thumbnail' = 'media'): string {
    const folder = kind === 'thumbnail' ? STORAGE_PATHS.thumbnails : mediaType === 'image' ? STORAGE_PATHS.images : STORAGE_PATHS.videos
    return `${folder}/${id}.${extOf(file)}`
  }

  async upload(path: string, file: Blob, contentType: string, onProgress?: (pct: number) => void): Promise<string> {
    const client = requireSupabase()
    // supabase-js v2 tidak expose progress event nativenya di semua target,
    // jadi kita beri sinyal awal/akhir yang jujur alih-alih progress palsu.
    onProgress?.(10)
    const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, file, {
      contentType,
      cacheControl: '31536000',
      upsert: false
    })
    if (error) throw new Error(error.message)
    onProgress?.(100)
    return this.getPublicUrl(path)
  }

  getPublicUrl(path: string): string {
    const client = requireSupabase()
    const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  async remove(paths: string[]): Promise<void> {
    if (paths.length === 0) return
    const client = requireSupabase()
    const { error } = await client.storage.from(STORAGE_BUCKET).remove(paths)
    if (error) throw new Error(error.message)
  }

  async getUsageBytesApprox(): Promise<number | null> {
    // Supabase free tier tidak menyediakan endpoint usage publik lewat anon key.
    // Kita hanya bisa menampilkan estimasi dari total ukuran file di DB (lihat DatabaseService),
    // bukan angka storage backend yang sebenarnya — makanya nilai ini disediakan sebagai null di sini
    // dan dihitung dari metadata di admin dashboard, ditandai jelas sebagai "estimasi".
    return null
  }
}

export const StorageService = new StorageServiceImpl()
