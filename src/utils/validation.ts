import { ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES, MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB } from '@/config'
import type { MediaType } from '@/types'

export interface ValidationResult {
  ok: boolean
  mediaType?: MediaType
  error?: string
}

// Validasi nyata sebelum upload: MIME type, extension, dan ukuran.
// Dipanggil sebelum file pernah menyentuh network.
export function validateMediaFile(file: File): ValidationResult {
  const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type)
  const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type)

  if (!isImage && !isVideo) {
    return { ok: false, error: `Format "${file.type || 'tidak dikenal'}" tidak didukung.` }
  }

  const maxBytes = (isImage ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB) * 1024 * 1024
  if (file.size > maxBytes) {
    const limit = isImage ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB
    return { ok: false, error: `Ukuran file melebihi batas ${limit}MB.` }
  }

  return { ok: true, mediaType: isImage ? 'image' : 'video' }
}
