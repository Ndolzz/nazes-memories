import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO_MODE } from '@/config'

// Satu-satunya tempat SDK Supabase diinisialisasi.
// Frontend HANYA pernah memegang anon/public key — service role key
// tidak boleh pernah muncul di kode client. Semua akses ditegakkan lewat
// Row Level Security policy di database (lihat supabase/schema.sql).
export const supabase: SupabaseClient | null = IS_DEMO_MODE
  ? null
  : createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.'
    )
  }
  return supabase
}
