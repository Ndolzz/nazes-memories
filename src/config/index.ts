// Konfigurasi global. Nilai default free-tier-friendly; semua bisa dioverride
// lewat Admin > Settings (disimpan di tabel `app_settings`, lihat DatabaseService).

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// True ketika .env belum diisi — dipakai untuk menampilkan Demo Mode banner
// yang jelas, bukan untuk diam-diam mengganti data asli dengan dummy data.
export const IS_DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('xxxxxxxxxxxx')

export const MAX_IMAGE_SIZE_MB = Number(import.meta.env.VITE_MAX_IMAGE_SIZE_MB ?? 8)
export const MAX_VIDEO_SIZE_MB = Number(import.meta.env.VITE_MAX_VIDEO_SIZE_MB ?? 50)

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm']

export const DEFAULT_PAGE_SIZE = 24

export const STORAGE_BUCKET = 'memories'
export const STORAGE_PATHS = {
  images: 'images',
  videos: 'videos',
  thumbnails: 'thumbnails'
} as const

export const BRAND = {
  name: "Naze's Memories",
  tagline: 'Every picture has a story.'
}
