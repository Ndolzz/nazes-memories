// Ekstraksi metadata EXIF dari file foto/video di browser, memakai `exifr`.
// Dipakai pipeline upload untuk auto-fill `captured_at` (tanggal momen, bukan
// tanggal upload) dan `location` (koordinat GPS) — tanpa EXIF, captured_at
// akan jatuh ke "sekarang" seperti sebelumnya.

import { parse } from 'exifr'

export interface ExifMetadata {
  capturedAt: string | null
  location: string | null
}

const EMPTY: ExifMetadata = { capturedAt: null, location: null }

function toIsoDate(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  return null
}

// Format koordinat menjadi string yang enak dibaca manusia, mis. "6.2088° S, 106.8456° E".
// GPS (0,0) diabaikan — beberapa scanner/kamera menulis 0,0 saat GPS tidak terkunci.
function formatLocation(lat: unknown, lon: unknown): string | null {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  if (lat === 0 && lon === 0) return null
  const fmt = (v: number, pos: string, neg: string) =>
    `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`
  return `${fmt(lat, 'N', 'S')}, ${fmt(lon, 'E', 'W')}`
}

// Best-effort: file tanpa EXIF (PNG hasil editan, sebagian video, dsb.)
// mengembalikan { null, null } dan pipeline upload lanjut dengan fallback.
export async function extractExifMetadata(file: File): Promise<ExifMetadata> {
  try {
    const data: Record<string, unknown> | undefined = await parse(file, {
      tiff: true,
      ifd0: true,
      exif: true,
      gps: true,
      translateValues: true,
      reviveValues: true,
      silentErrors: true
    })
    if (!data) return EMPTY
    const capturedAt = toIsoDate(
      data.DateTimeOriginal ?? data.CreateDate ?? data.ModifyDate
    )
    const location = formatLocation(data.latitude, data.longitude)
    return { capturedAt, location }
  } catch {
    return EMPTY
  }
}
