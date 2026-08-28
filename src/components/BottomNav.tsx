import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'

const links = [
  { to: '/', label: 'Home', icon: 'home' as const, end: true },
  { to: '/memories', label: 'Memories', icon: 'memory' as const },
  { to: '/random', label: 'Random', icon: 'random' as const },
  { to: '/favorites', label: 'Favorites', icon: 'heart' as const },
  { to: '/more', label: 'More', icon: 'more' as const }
]

// Bottom navigation — prioritas mobile (spec §29/§42). Touch target ≥44px, safe-area aware.
export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-md border-t border-violet-100 safe-bottom">
      <ul className="flex items-stretch justify-between px-2">
        {links.map((l) => (
          <li key={l.to} className="flex-1">
            <NavLink
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 min-h-[52px] text-[11px] font-medium transition-colors ${
                  isActive ? 'text-violet-600' : 'text-ink-soft/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${isActive ? 'bg-rose-50' : ''}`}>
                    <Icon name={l.icon} size={19} />
                  </span>
                  {l.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
