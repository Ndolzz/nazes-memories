import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
      <Logo size={40} />
      <p className="font-display text-2xl text-ink">Halaman tidak ditemukan.</p>
      <Link to="/" className="text-violet-600 font-medium text-sm hover:underline">
        Kembali ke Home
      </Link>
    </div>
  )
}
