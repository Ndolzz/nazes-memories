import imageCompression from 'browser-image-compression'

// Kompresi gambar di browser sebelum upload — menjaga free-tier storage/bandwidth tetap awet.
// Video tidak dikompresi di client (terlalu berat untuk HP low-end); batasnya
// ditegakkan lewat validasi ukuran di utils/validation.ts.
export async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  try {
    return await imageCompression(file, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 2400,
      useWebWorker: true,
      fileType: file.type
    })
  } catch {
    // Jika kompresi gagal (mis. format tak terduga), lanjutkan dengan file asli
    // daripada memblokir upload sepenuhnya.
    return file
  }
}

export async function generateImageThumbnail(file: File): Promise<Blob> {
  return imageCompression(file, {
    maxSizeMB: 0.15,
    maxWidthOrHeight: 480,
    useWebWorker: true,
    fileType: file.type
  })
}

export async function generateVideoPosterFrame(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.src = URL.createObjectURL(file)
    video.currentTime = 0.5
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(null)
      ctx.drawImage(video, 0, 0)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src)
        resolve(blob)
      }, 'image/jpeg', 0.8)
    }
    video.onerror = () => resolve(null)
  })
}
