import { requireSupabase, supabase } from '@/lib/supabase'
import { IS_DEMO_MODE } from '@/config'
import type { Session, User } from '@supabase/supabase-js'

// Abstraksi auth. Halaman/komponen tidak pernah memanggil supabase.auth.* langsung —
// semuanya lewat AuthService, supaya provider auth bisa diganti tanpa menulis ulang UI.
// Otorisasi admin TIDAK dicek lewat email hardcode; role datang dari
// `is_admin()` di database (app_metadata.role === 'admin'), lihat schema.sql.
class AuthServiceImpl {
  async signInWithPassword(email: string, password: string): Promise<{ session: Session | null; error: string | null }> {
    if (IS_DEMO_MODE) {
      return { session: null, error: 'Demo mode: hubungkan Supabase dulu di .env untuk login admin.' }
    }
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password })
    return { session: data.session, error: error?.message ?? null }
  }

  async signOut(): Promise<void> {
    if (IS_DEMO_MODE) return
    await requireSupabase().auth.signOut()
  }

  async getSession(): Promise<Session | null> {
    if (IS_DEMO_MODE) return null
    const { data } = await requireSupabase().auth.getSession()
    return data.session
  }

  async getUser(): Promise<User | null> {
    if (IS_DEMO_MODE) return null
    const { data } = await requireSupabase().auth.getUser()
    return data.user
  }

  isAdmin(user: User | null): boolean {
    if (!user) return false
    // Role disimpan di app_metadata (hanya bisa diubah lewat Supabase dashboard/service role),
    // bukan di user_metadata yang bisa diedit user itu sendiri.
    return user.app_metadata?.role === 'admin'
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    if (IS_DEMO_MODE || !supabase) return () => {}
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
    return () => data.subscription.unsubscribe()
  }
}

export const AuthService = new AuthServiceImpl()
