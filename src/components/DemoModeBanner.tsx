import { IS_DEMO_MODE } from '@/config'

// Penanda jelas kalau Supabase belum dikonfigurasi — bukan dummy data diam-diam
// menggantikan data asli, tapi status yang eksplisit (spec §46).
export function DemoModeBanner() {
  if (!IS_DEMO_MODE) return null
  return (
    <div className="bg-violet-900 text-violet-50 text-xs sm:text-sm px-4 py-2 text-center">
      Mode demo — Supabase belum terhubung. Isi <code className="font-mono">.env</code> berdasarkan{' '}
      <code className="font-mono">.env.example</code> untuk mengaktifkan data asli.
    </div>
  )
}
