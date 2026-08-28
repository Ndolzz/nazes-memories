export function AdminMusic() {
  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="font-display text-2xl">Music</h1>
      <p className="text-sm text-ink-soft/60 leading-relaxed">
        Playlist dikelola lewat <code className="font-mono text-xs">src/services/MusicService.ts</code>.
        Tambahkan track dengan metadata lengkap (Title, Artist, License, Source) untuk musik
        royalty-free / public domain / Creative Commons, atau musik buatan sendiri — lalu daftarkan
        URL filenya (mis. dari folder <code className="font-mono text-xs">public/music</code> atau
        Supabase Storage). Editor playlist langsung dari dashboard ini sengaja belum diaktifkan sampai
        ada sumber musik legal yang benar-benar terpasang, supaya fitur ini tidak terlihat berfungsi
        padahal kosong.
      </p>
    </div>
  )
}
