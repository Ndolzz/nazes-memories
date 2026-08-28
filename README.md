# Naze's Memories

**Every picture has a story.**

Platform digital memories gallery untuk menyimpan, mengelola, dan membagikan foto serta video secara online — gratis, cepat, dan aman, dibangun di atas free tier Supabase + GitHub Pages.

---

## Daftar isi

- [Ringkasan proyek](#ringkasan-proyek)
- [Fitur](#fitur)
- [Stack teknologi](#stack-teknologi)
- [Arsitektur](#arsitektur)
- [Instalasi](#instalasi)
- [Setup environment](#setup-environment)
- [Setup Supabase](#setup-supabase)
- [Skema database](#skema-database)
- [Setup Storage](#setup-storage)
- [Row Level Security](#row-level-security)
- [Setup admin](#setup-admin)
- [Development lokal](#development-lokal)
- [Build](#build)
- [Deploy ke GitHub Pages](#deploy-ke-github-pages)
- [Troubleshooting](#troubleshooting)
- [Pertimbangan free-tier](#pertimbangan-free-tier)
- [Status implementasi](#status-implementasi)

---

## Ringkasan proyek

Naze's Memories adalah galeri foto/video pribadi dengan nuansa *digital scrapbook* dan *editorial photo gallery*. Pengunjung publik bisa menjelajah, mencari, memfilter, dan menandai favorit. Admin punya dashboard penuh untuk upload massal, mengelola metadata, dan mengatur tampilan — semuanya tanpa biaya software untuk fitur inti.

## Fitur

- Galeri dengan 5 mode layout: Grid, Masonry, Editorial, Compact, Timeline
- Lightbox fullscreen dengan zoom, swipe, keyboard nav, share, download
- Upload multi-file dengan drag & drop, kompresi gambar otomatis, thumbnail otomatis
- Admin dashboard: overview statistik, bulk edit/delete, kategori, appearance, settings
- Pencarian (debounced) + filter (tipe, kategori, tanggal) + sort
- Fitur "Surprise Me" — memory acak lewat RPC database
- Timeline otomatis dikelompokkan per bulan dari `captured_at`
- Favorit publik yang aman (lewat RPC, bukan update langsung)
- Tema Light/Dark/System + 4 preset warna
- PWA: bisa di-install, splash screen, offline shell
- Export manifest metadata ke JSON/CSV
- Aksesibilitas: ARIA label, keyboard nav, fokus terlihat, `prefers-reduced-motion`

## Stack teknologi

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Animasi | Framer Motion |
| Backend | Supabase (Auth + PostgreSQL + Storage), free tier |
| Hosting | GitHub Pages (lewat GitHub Actions) |

Tidak ada dependency berbayar yang diwajibkan untuk fitur inti apa pun.

## Arsitektur

```
src/
  components/   Komponen UI reusable (Logo, Icon, MemoryCard, Lightbox, dst)
  pages/        Halaman publik + admin (routing lewat React Router)
  layouts/      PublicLayout, AdminLayout
  services/     AuthService, DatabaseService, StorageService, MusicService
  hooks/        useAuth, useMemories, useTheme, useDebouncedValue
  lib/          Inisialisasi Supabase client
  utils/        Validasi, kompresi media, formatting
  types/        Tipe TypeScript bersama
  config/       Konstanta & environment
```

Semua akses Supabase (Auth, database, storage) melewati lapisan `services/`. Komponen dan halaman **tidak pernah** memanggil `supabase.from(...)` atau `supabase.storage...` langsung — ini membuat backend bisa diganti di masa depan tanpa menulis ulang UI.

## Instalasi

```bash
git clone <repo-url> nazes-memories
cd nazes-memories
npm install
```

## Setup environment

```bash
cp .env.example .env
```

Isi `.env`:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
VITE_MAX_IMAGE_SIZE_MB=8
VITE_MAX_VIDEO_SIZE_MB=50
```

> **Jangan pernah** memasukkan `service_role` key ke frontend — hanya `anon`/`public` key yang aman digunakan di client.

Tanpa `.env` terisi, aplikasi otomatis berjalan dalam **Demo Mode** (ditandai jelas lewat banner), tanpa data asli.

## Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (gratis).
2. Buka **SQL Editor**, jalankan seluruh isi `supabase/schema.sql`.
3. Ambil `Project URL` dan `anon public key` dari **Project Settings > API**, masukkan ke `.env`.

## Skema database

Tabel utama `memories` (lihat `supabase/schema.sql` untuk definisi lengkap):

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | primary key |
| title | text | |
| description | text | nullable |
| media_url | text | URL publik dari Storage |
| thumbnail_url | text | nullable |
| media_type | text | `image` \| `video` |
| file_path | text | path di Storage, untuk keperluan hapus |
| captured_at | timestamptz | tanggal momen terjadi |
| created_at | timestamptz | tanggal upload |
| category | text | nullable |
| tags | text[] | |
| location | text | nullable |
| is_favorite | boolean | |
| sort_order | integer | untuk urutan kustom |
| views | integer | |

Index dibuat pada `captured_at`, `category`, `is_favorite`, `sort_order`, dan `tags` (GIN) untuk query yang sering dipakai.

Tabel `app_settings` (satu baris) menyimpan konfigurasi tampilan dan upload yang bisa diubah admin lewat dashboard.

## Setup Storage

1. **Storage > New bucket** → nama `memories`, set **Public bucket: ON**.
2. Buat 3 folder secara implisit lewat aplikasi: `images/`, `videos/`, `thumbnails/` (StorageService membuatnya otomatis saat upload pertama).
3. Tambahkan policy storage (lewat Dashboard > Storage > memories > Policies):
   - `SELECT`: `true` (publik boleh melihat media)
   - `INSERT` / `UPDATE` / `DELETE`: hanya jika `(select public.is_admin())` bernilai true

Nama file di Storage menggunakan UUID, bukan nama file asli, untuk menghindari konflik dan kebocoran informasi.

## Row Level Security

Kebijakan RLS lengkap ada di `supabase/schema.sql`:

- **Publik**: hanya bisa `SELECT` dari `memories` dan `app_settings`.
- **Admin**: bisa `INSERT` / `UPDATE` / `DELETE`, ditentukan lewat fungsi `is_admin()` yang membaca `app_metadata.role` dari JWT — **bukan** pengecekan email hardcode.
- **Favorite publik**: dilakukan lewat RPC `toggle_favorite()` yang hanya boleh mengubah kolom `is_favorite`, bukan `UPDATE` bebas — mencegah manipulasi data lain oleh pengunjung.
- **View counter**: lewat RPC `increment_memory_views()` yang atomik di database.

## Setup admin

Supabase tidak menyediakan cara membuat user dengan role custom lewat UI signup biasa, jadi:

1. **Authentication > Users > Add user** → buat akun admin dengan email & password.
2. Klik user tersebut → edit **raw_app_meta_data**, tambahkan:
   ```json
   { "role": "admin" }
   ```
3. Login di `/admin/login` menggunakan akun tersebut.

## Development lokal

```bash
npm run dev
```

Buka `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview   # untuk uji hasil build secara lokal
```

## Deploy ke GitHub Pages

Repo ini sudah menyertakan `.github/workflows/deploy.yml` yang otomatis build & deploy setiap push ke `main`.

1. Push repo ini ke GitHub.
2. **Settings > Pages > Source** → pilih **GitHub Actions**.
3. **Settings > Secrets and variables > Actions**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Push ke `main` — Actions akan build dan deploy otomatis.

SPA routing di GitHub Pages ditangani lewat trik `public/404.html` (redirect ke `index.html` sambil menyimpan path asli di `sessionStorage`, dibaca kembali oleh `src/main.tsx`).

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Banner "Mode demo" terus muncul | `.env` belum diisi/salah | Cek `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` |
| Galeri publik kosong padahal sudah upload | RLS SELECT belum aktif | Jalankan ulang `supabase/schema.sql` |
| Upload gagal terus | Bucket Storage belum dibuat/publik | Cek Storage > memories > Public bucket |
| Login admin gagal terus meski password benar | `app_metadata.role` belum di-set | Set `{ "role": "admin" }` di user tsb |
| Routing 404 setelah refresh di GitHub Pages | `404.html` belum ter-deploy | Pastikan file `public/404.html` ikut ter-build ke `dist/` |

## Pertimbangan free-tier

- Supabase free tier: 500MB database, 1GB storage, 2GB bandwidth/bulan — cukup untuk ribuan foto terkompresi.
- Gambar dikompresi otomatis di browser sebelum upload (maks ~1.5MB, ~2400px sisi terpanjang).
- Thumbnail terpisah (≤150KB) dipakai di galeri; media penuh baru dimuat saat lightbox dibuka.
- Video tidak dikompresi di client — batasi ukurannya lewat Admin > Settings.
- Pagination (24 item/halaman) dan `loading="lazy"` mencegah query/berat berlebihan.
- Halaman admin overview menampilkan estimasi dari data metadata, bukan angka storage backend asli (anon key tidak punya akses ke itu) — cek Supabase Dashboard untuk angka pasti.

## Status implementasi

Proyek ini adalah scaffold produksi yang **fungsional secara nyata** untuk alur inti: auth, CRUD memories, upload dengan kompresi & thumbnail, galeri multi-layout, lightbox, search/filter/sort, bulk management, timeline, favorit, tema, PWA shell, dan export manifest.

Beberapa bagian sengaja **belum** diisi dengan implementasi penuh karena memerlukan aset/keputusan dari pemilik proyek, dan sengaja tidak dipalsukan (spec §46, §52 — "no dummy data, no fake buttons"):

- **Music library**: `MusicService` sudah siap sebagai abstraction layer, tapi playlist kosong sampai kamu menambahkan track dengan lisensi yang benar-benar valid (lihat komentar di `src/services/MusicService.ts` dan halaman Admin > Music).
- **Drag-to-reorder** pada mode Custom sort: kolom `sort_order` & RPC pendukungnya sudah ada di database, drag-and-drop UI-nya belum dipasang — bisa ditambahkan dengan library seperti `@dnd-kit/core`.
- **PNG icon PWA** (`icons/icon-192.png`, dst.): placeholder belum digenerate sebagai raster; export dari `public/favicon.svg` sebelum deploy production (mis. lewat `npx pwa-asset-generator`).
