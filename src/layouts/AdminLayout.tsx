import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Icon, type IconName } from '@/components/Icon'
import { useAuth } from '@/hooks/useAuth'
import { LoadingScreen } from '@/components/LoadingScreen'
import { IS_DEMO_MODE } from '@/config'

const links: { to: string; label: string; icon: IconName }[] = [
  { to: '/admin', label: 'Overview', icon: 'grid' },
  { to: '/admin/memories', label: 'Memories', icon: 'memory' },
  { to: '/admin/upload', label: 'Upload', icon: 'upload' },
  { to: '/admin/categories', label: 'Categories', icon: 'filter' },
  { to: '/admin/music', label: 'Music', icon: 'music' },
  { to: '/admin/appearance', label: 'Appearance', icon: 'sun' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' }
]

// Admin dashboard shell. Akses ditentukan oleh AuthService.isAdmin (role di
// app_metadata + RLS di database) — bukan pengecekan email hardcode.
export function AdminLayout() {
  const { user, isAdmin, loading } = useAuth()

  if (IS_DEMO_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-3">
          <Logo size={40} className="mx-auto" />
          <p className="font-display text-xl">Admin butuh Supabase</p>
          <p className="text-sm text-ink-soft/70">
            Hubungkan Supabase lewat file <code className="font-mono">.env</code> untuk mengaktifkan login admin.
          </p>
        </div>
      </div>
    )
  }

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/admin/login" replace />
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-ink-soft">Akun ini tidak memiliki akses admin.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:flex md:w-60 md:flex-col border-r border-violet-100 p-5 gap-1">
        <div className="flex items-center gap-2 px-2 pb-6">
          <Logo size={28} />
          <span className="font-display text-sm">Admin</span>
        </div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-naze-gradient text-white' : 'text-ink-soft hover:bg-rose-50'
              }`
            }
          >
            <Icon name={l.icon} size={16} />
            {l.label}
          </NavLink>
        ))}
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-violet-100">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-display text-sm">Admin</span>
          </div>
        </header>
        <nav className="md:hidden flex gap-1 overflow-x-auto px-3 py-2 border-b border-violet-100">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/admin'}
              className={({ isActive }) =>
                `whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isActive ? 'bg-naze-gradient text-white' : 'bg-violet-50 text-ink-soft'
                }`
              }
            >
              <Icon name={l.icon} size={13} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
