import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { AuthService } from '@/services/AuthService'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { session, error } = await AuthService.signInWithPassword(email, password)
    setLoading(false)
    if (error) return setError(error)
    if (session) navigate('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-2">
          <Logo size={40} className="mx-auto" />
          <h1 className="font-display text-xl">Masuk sebagai Admin</h1>
        </div>

        {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl2 border border-violet-100 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl2 border border-violet-100 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-full bg-naze-gradient text-white text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Memproses…' : 'Masuk'}
        </button>

        <p className="text-xs text-ink-soft/50 text-center">
          Akun admin dibuat lewat Supabase Dashboard, bukan lewat halaman ini.
        </p>
      </form>
    </div>
  )
}
