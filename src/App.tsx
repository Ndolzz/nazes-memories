import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Home } from '@/pages/Home'
import { Memories } from '@/pages/Memories'
import { MemoryDetail } from '@/pages/MemoryDetail'
import { Favorites } from '@/pages/Favorites'
import { Timeline } from '@/pages/Timeline'
import { Random } from '@/pages/Random'
import { Search } from '@/pages/Search'
import { More } from '@/pages/More'
import { NotFound } from '@/pages/NotFound'
import { AdminLogin } from '@/pages/admin/Login'
import { AdminOverview } from '@/pages/admin/Overview'
import { AdminManageMemories } from '@/pages/admin/ManageMemories'
import { AdminUpload } from '@/pages/admin/Upload'
import { AdminCategories } from '@/pages/admin/Categories'
import { AdminMusic } from '@/pages/admin/Music'
import { AdminAppearance } from '@/pages/admin/Appearance'
import { AdminSettings } from '@/pages/admin/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/memory/:id" element={<MemoryDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/random" element={<Random />} />
        <Route path="/search" element={<Search />} />
        <Route path="/more" element={<More />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="memories" element={<AdminManageMemories />} />
        <Route path="upload" element={<AdminUpload />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="music" element={<AdminMusic />} />
        <Route path="appearance" element={<AdminAppearance />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
