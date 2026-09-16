import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { BottomNav } from '@/components/BottomNav'
import { MusicPlayer } from '@/components/MusicPlayer'
import { DemoModeBanner } from '@/components/DemoModeBanner'
import { AmbientBackground } from '@/components/AmbientBackground'

export function PublicLayout() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Ambient background — selalu di belakang seluruh UI dan tidak
          menghalangi interaksi (fixed, z-index -1, pointer-events none). */}
      <AmbientBackground />
      <DemoModeBanner />
      <Navbar />
      <main className="relative flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
      <MusicPlayer />
    </div>
  )
}
