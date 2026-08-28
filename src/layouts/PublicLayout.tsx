import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { BottomNav } from '@/components/BottomNav'
import { MusicPlayer } from '@/components/MusicPlayer'
import { DemoModeBanner } from '@/components/DemoModeBanner'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <DemoModeBanner />
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
      <MusicPlayer />
    </div>
  )
}
