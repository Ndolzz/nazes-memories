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
- [Notifikasi push (opsional)](#notifikasi-push-opsional)
- [Development lokal](#development-lokal)
- [Build](#build)
- [Deploy ke GitHub Pages](#deploy-ke-github-pages)
- [Troubleshooting](#troubleshooting)
- [Pertimbangan free-tier](#pertimbangan-free-tier)
- [Status implementasi](#status-implementasi)

---

## Ringkasan proyek

Naze's Memories adalah galeri foto/video pribadi dengan nuansa *digital scrapbook* dan *editorial photo gallery*. Pengunjung publik bisa menjelajah, mencari, memfilter, menandai favorit, dan **berlangganan notifikasi saat ada memory baru**. Admin punya dashboard penuh untuk upload massal (dengan auto-fill tanggal & lokasi dari EXIF), mengelola metadata, dan mengatur tampilan — semuanya tanpa biaya software untuk fitur inti.

## Fitur

- Galeri dengan 5 mode layout: Grid, Masonry, Editorial, Compact, Timeline — dengan animasi stagger saat kartu masuk
- Hero beranda dengan polaroid dekoratif mengambang + statistik jumlah memories nyata (bukan dummy)
- Lightbox fullscreen dengan zoom, swipe, keyboard nav, share, download
- Upload multi-file dengan drag & drop, kompresi gambar otomatis, thumbnail otomatis, dan auto-fill tanggal + lokasi dari EXIF
- Notifikasi push browser "memory baru" (Web Push + VAPID) — subscribe/unsubscribe langsung dari UI
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
| Metadata EXIF | [exifr](https://github.com/MikeKovarik/exifr) |
| Push notification | Web Push ([web-push](https://github.com/web-push-libs/web-push)) + Workbox |
| Backend | Supabase (Auth + PostgreSQL + Storage), free tier |
| Hosting | GitHub Pages (lewat GitHub Actions) |

Tidak ada dependency berbayar yang diwajibkan untuk fitur inti apa pun.

## Arsitektur

```
src/
  components/   Komponen UI reusable (Logo, Icon, MemoryCard, Lightbox, PushBell, dst)
  pages/        Halaman publik + admin (routing lewat React Router)
  layouts/      PublicLayout, AdminLayout
  services/     AuthService, DatabaseService, StorageService, MusicService
  hooks/        useAuth, useMemories, useTheme, useDebouncedValue
  lib/          Inisialisasi Supabase client
  utils/        Validasi, kompresi media, EXIF, push notification, formatting
  types/        Tipe TypeScript bersama
  config/       Konstanta & environment
  sw.ts         Service worker (precache PWA + handler push notifikasi)
scripts/
  notify.mjs    Pengirim push notification — dijalankan GitHub Action terjadwal
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
VITE_VAPID_PUBLIC_KEY=  # opsional — kosongkan jika belum mengaktifkan notifikasi
```

> **Jangan pernah** memasukkan `service_role` key atau VAPID **private** key ke frontend — hanya `anon`/`public` key dan VAPID public key yang aman di client.

Tanpa `.env` terisi, aplikasi otomatis berjalan dalam **Demo Mode** (ditandai jelas lewat banner), tanpa data asli.

## Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (gratis).
2. Buka **SQL Editor**, jalankan seluruh isi `supabase/schema.sql`.
3. Ambil `Project URL` dan `anon public key` dari **Project Settings > API**, masukkan ke `.env`.

> **Upgrade dari versi lama**: cukup jalankan ulang `supabase/schema.sql` — semua objek bersifat idempoten (`create or replace` / `if not exists`), termasuk perbaikan RPC `toggle_favorite` (toggle server-side, tanpa parameter `value` dari client) dan tabel/RPC push subscription.

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
| captured_at | timestamptz | tanggal momen terjadi (auto-fill dari EXIF saat upload) |
| created_at | timestamptz | tanggal upload — dipakai deteksi "memory baru" oleh notifikasi |
| category | text | nullable |
| tags | text[] | |
| location | text | nullable (auto-fill dari GPS EXIF, mis. "6.2088° S, 106.8456° E") |
| is_favorite | boolean | |
| sort_order | integer | untuk urutan kustom |
| views | integer | estimasi (dedup per-session di client) |

Tabel `app_settings` (satu baris) menyimpan konfigurasi tampilan dan upload. Tabel `push_subscriptions` menyimpan langganan notifikasi browser (endpoint + keys) — tanpa policy SELECT publik; akses hanya lewat RPC.

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
- **Favorite publik**: lewat RPC `toggle_favorite()` yang beralih **server-side** (`NOT is_favorite`) dan tidak menerima nilai dari client.
- **View counter**: lewat RPC `increment_memory_views()` yang atomik, dengan dedup per-session di client.
- **Push subscription**: tanpa policy baca/tulis langsung — hanya lewat RPC `save_push_subscription` / `delete_push_subscription`, supaya endpoint (rahasia per-browser) tidak bisa dibaca sembarang orang lewat anon key.

## Setup admin

Supabase tidak menyediakan cara membuat user dengan role custom lewat UI signup biasa, jadi:

1. **Authentication > Users > Add user** → buat akun admin dengan email & password.
2. Klik user tersebut → edit **raw_app_meta_data**, tambahkan:
   ```json
   { "role": "admin" }
   ```
3. Login di `/admin/login` menggunakan akun tersebut.

## Notifikasi push (opsional)

Pengunjung bisa men-subscribe notifikasi browser saat ada memory baru. Sistemnya sepenuhnya gratis: Web Push (VAPID) + GitHub Action terjadwal sebagai pengirim — tidak perlu server.

1. **Generate pasangan kunci VAPID** (sekali seumur project):
   ```bash
   npx web-push generate-vapid-keys
   ```
2. **Frontend**: isi `VITE_VAPID_PUBLIC_KEY` di `.env` (dan di GitHub Secrets dengan nama yang sama) dengan *public* key.
3. **GitHub Secrets** (Settings > Secrets and variables > Actions), tambahkan:
   - `VAPID_PRIVATE_KEY` — *private* key (RAHASIA, tidak pernah ke frontend)
   - `VAPID_SUBJECT` — `mailto:email-kamu@contoh.com`
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key Supabase (RAHASIA, hanya dipakai CI untuk membaca subscription)
   - `SITE_URL` (opsional) — basis URL link notifikasi, default `https://<user>.github.io/nazes-memories`
4. **Database**: jalankan ulang `supabase/schema.sql` (bagian 8 membuat tabel + RPC push).
5. **Uji**: tab **Actions > Push notification (memory baru) > Run workflow** bisa dijalankan manual.

Cara kerja: tombol lonceng (Navbar desktop / halaman More / hero mobile) muncul hanya jika push didukung browser dan VAPID public key terisi. Workflow `notify.yml` berjalan tiap hari pukul 09:00 UTC — jika ada memory dengan `created_at` ≤ 26 jam terakhir, satu notifikasi dikirim ke semua subscriber; subscription kadaluarsa (404/410) dibersihkan otomatis.

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
   - (opsional, untuk notifikasi) `VITE_VAPID_PUBLIC_KEY`
4. Push ke `main` — Actions akan build dan deploy otomatis.

SPA routing di GitHub Pages ditangani lewat trik `public/404.html` (redirect ke `index.html` sambil menyimpan path asli di `sessionStorage`, dibaca kembali oleh `src/main.tsx`).

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Banner "Mode demo" terus muncul | `.env` belum diisi/salah | Cek `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` |
| Galeri publik kosong padahal sudah upload | RLS SELECT belum aktif | Jalankan ulang `supabase/schema.sql` |
| Upload gagal terus | Bucket Storage belum dibuat/publik | Cek Storage > memories > Public bucket |
| Login admin gagal terus meski password benar | `app_metadata.role` belum di-set | Set `{ "role": "admin" }` di user tsb |
| Favorit tidak berubah sama sekali | RPC `toggle_favorite` lama masih di DB | Jalankan ulang `supabase/schema.sql` (create-or-replace) |
| Tombol lonceng tidak muncul | `VITE_VAPID_PUBLIC_KEY` kosong / browser tidak mendukung / izin ditolak | Isi VAPID public key; cek izin notifikasi di pengaturan browser |
| Subscribe berhasil tapi notifikasi tidak datang | Secret CI belum lengkap / workflow belum dijalankan | Lihat langkah di [Notifikasi push](#notifikasi-push-opsional); cek log Actions |
| Routing 404 setelah refresh di GitHub Pages | `404.html` belum ter-deploy | Pastikan file `public/404.html` ikut ter-build ke `dist/` |

## Pertimbangan free-tier

- Supabase free tier: 500MB database, 1GB storage, 2GB bandwidth/bulan — cukup untuk ribuan foto terkompresi.
- Gambar dikompresi otomatis di browser sebelum upload (maks ~1.5MB, ~2400px sisi terpanjang). EXIF dibaca **sebelum** kompresi, karena file hasil kompresi kehilangan metadata.
- Thumbnail terpisah (≤150KB) dipakai di galeri; media penuh baru dimuat saat lightbox dibuka.
- Video tidak dikompresi di client — batasi ukurannya lewat Admin > Settings.
- Pagination (24 item/halaman) dan `loading="lazy"` mencegah query/berat berlebihan.
- Notifikasi push tidak menambah beban Supabase — subscription disimpan di database (baris kecil), pengiriman dilakukan GitHub Actions gratis.
- Halaman admin overview menampilkan estimasi dari data metadata, bukan angka storage backend asli — cek Supabase Dashboard untuk angka pasti.

## Status implementasi

Proyek ini adalah scaffold produksi yang **fungsional secara nyata** untuk alur inti: auth, CRUD memories, upload dengan kompresi & thumbnail & EXIF, galeri multi-layout, lightbox, search/filter/sort, bulk management, timeline, favorit, notifikasi push, tema, PWA shell, dan export manifest.

Beberapa bagian sengaja **belum** diisi dengan implementasi penuh karena memerlukan aset/keputusan dari pemilik proyek, dan sengaja tidak dipalsukan (spec §46, §52 — "no dummy data, no fake buttons"):

- **Music library**: `MusicService` sudah siap sebagai abstraction layer, tapi playlist kosong sampai kamu menambahkan track dengan lisensi yang benar-benar valid (lihat komentar di `src/services/MusicService.ts` dan halaman Admin > Music).
- **Drag-to-reorder** pada mode Custom sort: kolom `sort_order` & RPC pendukungnya sudah ada di database, drag-and-drop UI-nya belum dipasang — bisa ditambahkan dengan library seperti `@dnd-kit/core`.
- **PNG icon PWA** (`icons/icon-192.png`, dst.): placeholder belum digenerate sebagai raster; export dari `public/favicon.svg` sebelum deploy production (mis. lewat `npx pwa-asset-generator`).
