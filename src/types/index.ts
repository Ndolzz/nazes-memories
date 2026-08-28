// Tipe data inti Naze's Memories.
// Metadata hidup di database (tabel `memories`); file media hidup di Storage.

export type MediaType = 'image' | 'video'

export type GalleryLayout = 'grid' | 'masonry' | 'editorial' | 'compact' | 'timeline'

export type GalleryTypographyStyle =
  | 'classic'
  | 'editorial'
  | 'romantic'
  | 'minimal'
  | 'polaroid'

export interface Memory {
  id: string
  title: string
  description: string | null
  media_url: string
  thumbnail_url: string | null
  media_type: MediaType
  file_path: string
  captured_at: string // ISO date — tanggal momen itu terjadi
  created_at: string // ISO date — kapan diunggah
  category: string | null
  tags: string[]
  location: string | null
  is_favorite: boolean
  sort_order: number
  views: number
}

export type MemoryDraft = Omit<
  Memory,
  'id' | 'created_at' | 'views' | 'is_favorite' | 'sort_order' | 'media_url' | 'thumbnail_url' | 'file_path'
> & {
  file: File
}

export interface MemoryFilters {
  search?: string
  type?: 'all' | MediaType | 'favorites'
  category?: string
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'custom' | 'all'
  customFrom?: string
  customTo?: string
}

export type SortMode = 'newest' | 'oldest' | 'custom' | 'random'

export interface Track {
  id: string
  title: string
  artist: string
  license: string
  source: string
  url: string
  duration?: number
}

export interface AppSettings {
  site_title: string
  tagline: string
  default_layout: GalleryLayout
  default_sort: SortMode
  pagination_size: number
  theme_preset: 'rose' | 'lavender' | 'magenta' | 'midnight'
  typography_style: GalleryTypographyStyle
  music_enabled: boolean
  max_image_size_mb: number
  max_video_size_mb: number
}

export interface UploadTask {
  id: string
  file: File
  progress: number
  status: 'queued' | 'validating' | 'compressing' | 'uploading' | 'saving' | 'done' | 'error'
  error?: string
  previewUrl?: string
}
