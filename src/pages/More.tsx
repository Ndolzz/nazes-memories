import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/Icon'

const items: { to: string; label: string; icon: IconName }[] = [
  { to: '/timeline', label: 'Timeline', icon: 'timeline' },
  { to: '/search', label: 'Cari Memories', icon: 'search' },
  { to: '/admin', label: 'Admin', icon: 'settings' }
]

// Halaman "More" untuk mobile — bottom nav hanya muat 5 slot,
// sisanya dikumpulkan di sini.
export function More() {
  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-2">
      <h1 className="font-display text-2xl text-ink mb-4">More</h1>
      {items.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl2 bg-violet-50 text-ink-soft font-medium hover:bg-violet-100 transition-colors"
        >
          <Icon name={i.icon} size={18} />
          {i.label}
        </Link>
      ))}
    </div>
  )
}
