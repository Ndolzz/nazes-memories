import { NavLink } from 'react-router-dom'
import { Logo } from './Logo'
import { Icon } from './Icon'
import { BRAND } from '@/config'

const links = [
  { to: '/', label: 'Home', icon: 'home' as const, end: true },
  { to: '/memories', label: 'Memories', icon: 'memory' as const },
  { to: '/timeline', label: 'Timeline', icon: 'timeline' as const },
  { to: '/favorites', label: 'Favorites', icon: 'heart' as const }
]

// Navbar desktop. Tersembunyi di mobile (bottom nav mengambil alih, lihat BottomNav.tsx).
export function Navbar() {
  return (
    <header className="hidden md:flex sticky top-0 z-40 items-center justify-between px-8 py-4 backdrop-blur-md bg-paper/80 border-b border-violet-100">
      <NavLink to="/" className="flex items-center gap-2.5 group">
        <Logo size={32} />
        <span className="font-display text-lg tracking-tight text-ink group-hover:text-violet-600 transition-colors">
          {BRAND.name}
        </span>
      </NavLink>

      <nav className="flex items-center gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive ? 'bg-naze-gradient text-white shadow-card' : 'text-ink-soft hover:bg-rose-50'
              }`
            }
          >
            <Icon name={l.icon} size={16} />
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <NavLink
          to="/search"
          className="flex items-center justify-center h-9 w-9 rounded-full text-ink-soft hover:bg-rose-50 transition-colors"
          aria-label="Cari memories"
        >
          <Icon name="search" size={18} />
        </NavLink>
        <NavLink
          to="/admin"
          className="flex items-center justify-center h-9 w-9 rounded-full text-ink-soft hover:bg-rose-50 transition-colors"
          aria-label="Admin"
        >
          <Icon name="settings" size={18} />
        </NavLink>
      </div>
    </header>
  )
}
