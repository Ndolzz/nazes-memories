import { useEffect, useState } from 'react'
import { Icon, type IconName } from '@/components/Icon'
import { requireSupabase } from '@/lib/supabase'

interface Stats {
  total: number
  photos: number
  videos: number
  favorites: number
  views: number
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: IconName }) {
  return (
    <div className="rounded-xl2 border border-violet-100 p-5 bg-white shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-soft/60 uppercase tracking-wide">{label}</span>
        <span className="h-8 w-8 rounded-full bg-naze-gradient-soft text-violet-600 flex items-center justify-center">
          <Icon name={icon} size={15} />
        </span>
      </div>
      <p className="font-display text-3xl text-ink mt-2">{value.toLocaleString('id-ID')}</p>
    </div>
  )
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const client = requireSupabase()
        const [{ count: total }, { count: photos }, { count: videos }, { count: favorites }, { data: viewsData }] =
          await Promise.all([
            client.from('memories').select('*', { count: 'exact', head: true }),
            client.from('memories').select('*', { count: 'exact', head: true }).eq('media_type', 'image'),
            client.from('memories').select('*', { count: 'exact', head: true }).eq('media_type', 'video'),
            client.from('memories').select('*', { count: 'exact', head: true }).eq('is_favorite', true),
            client.from('memories').select('views')
          ])
        const views = (viewsData ?? []).reduce((sum: number, r: any) => sum + (r.views ?? 0), 0)
        setStats({ total: total ?? 0, photos: photos ?? 0, videos: videos ?? 0, favorites: favorites ?? 0, views })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Overview</h1>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl2 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Memories" value={stats?.total ?? 0} icon="memory" />
          <StatCard label="Photos" value={stats?.photos ?? 0} icon="camera" />
          <StatCard label="Videos" value={stats?.videos ?? 0} icon="video" />
          <StatCard label="Favorites" value={stats?.favorites ?? 0} icon="heart" />
          <StatCard label="Views" value={stats?.views ?? 0} icon="zoom" />
        </div>
      )}
      <p className="text-xs text-ink-soft/50">
        Penggunaan storage tidak ditampilkan di sini karena Supabase free tier tidak menyediakan angka
        tersebut lewat anon key — cek langsung di Supabase Dashboard &gt; Storage untuk data akurat.
      </p>
    </div>
  )
}
