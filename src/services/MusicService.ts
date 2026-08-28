import type { Track } from '@/types'

// Abstraksi sumber musik. Playlist default kosong secara sengaja — proyek ini
// tidak boleh mengklaim menyertakan lagu berlisensi tanpa file lagunya benar-benar ada.
// Admin mengisi playlist lewat Admin > Music dengan menambahkan track yang punya
// metadata lisensi lengkap (Title, Artist, License, Source), atau meng-upload
// file musik miliknya sendiri ke folder public/music dan mendaftarkannya di sini.
//
// Karena diabstraksi lewat MusicService, provider musik (self-hosted file,
// Supabase Storage, atau layanan lain di masa depan) bisa diganti tanpa
// menyentuh UI player.
class MusicServiceImpl {
  private playlist: Track[] = []

  setPlaylist(tracks: Track[]) {
    this.playlist = tracks
  }

  getPlaylist(): Track[] {
    return this.playlist
  }

  isEmpty(): boolean {
    return this.playlist.length === 0
  }
}

export const MusicService = new MusicServiceImpl()
