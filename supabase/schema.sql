-- ============================================================================
-- Naze's Memories — Supabase schema
-- Jalankan di Supabase Dashboard > SQL Editor (satu kali, saat setup awal).
-- Semua objek idempoten (create or replace / if not exists), jadi meng-upgrade
-- dari versi lama cukup dengan menjalankan ulang file ini.
-- ============================================================================

-- 1) Tabel utama: memories -----------------------------------------------
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  media_url text not null,
  thumbnail_url text,
  media_type text not null check (media_type in ('image', 'video')),
  file_path text not null,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  category text,
  tags text[] not null default '{}',
  location text,
  is_favorite boolean not null default false,
  sort_order integer not null default 0,
  views integer not null default 0
);

create index if not exists memories_captured_at_idx on public.memories (captured_at desc);
create index if not exists memories_category_idx on public.memories (category);
create index if not exists memories_is_favorite_idx on public.memories (is_favorite);
create index if not exists memories_sort_order_idx on public.memories (sort_order);
create index if not exists memories_tags_idx on public.memories using gin (tags);

-- 2) Tabel pengaturan aplikasi (satu baris, id = 1) -----------------------
create table if not exists public.app_settings (
  id integer primary key default 1,
  site_title text not null default 'Naze''s Memories',
  tagline text not null default 'Every picture has a story.',
  default_layout text not null default 'grid',
  default_sort text not null default 'newest',
  pagination_size integer not null default 24,
  theme_preset text not null default 'rose',
  typography_style text not null default 'editorial',
  music_enabled boolean not null default false,
  max_image_size_mb integer not null default 8,
  max_video_size_mb integer not null default 50,
  constraint single_row check (id = 1)
);

insert into public.app_settings (id) values (1) on conflict (id) do nothing;

-- 3) Helper: cek apakah user saat ini admin --------------------------------
-- Role admin disimpan di app_metadata (hanya bisa diubah via Supabase Dashboard
-- atau service role key — TIDAK bisa diubah user itu sendiri lewat frontend).
-- Set role: Dashboard > Authentication > Users > pilih user > Edit > raw_app_meta_data:
--   { "role": "admin" }
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- 4) Row Level Security -----------------------------------------------------
alter table public.memories enable row level security;
alter table public.app_settings enable row level security;

-- Publik: hanya boleh SELECT.
drop policy if exists "public read memories" on public.memories;
create policy "public read memories"
  on public.memories
  for select using (true);

-- Admin: full akses INSERT/UPDATE/DELETE.
drop policy if exists "admin write memories" on public.memories;
create policy "admin write memories"
  on public.memories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read settings" on public.app_settings;
create policy "public read settings"
  on public.app_settings
  for select using (true);

drop policy if exists "admin write settings" on public.app_settings;
create policy "admin write settings"
  on public.app_settings
  for update using (public.is_admin()) with check (public.is_admin());

-- 5) RPC: toggle favorite (aman untuk publik) -------------------------------
-- Publik boleh mengubah is_favorite lewat RPC ini SAJA, bukan lewat UPDATE
-- langsung — jadi tidak ada celah untuk mengubah kolom lain (title, media_url, dst).
--
-- CATATAN KEAMANAN (perbaikan): versi lama menerima parameter `value boolean`
-- dari client, sehingga siapa pun bisa men-set is_favorite seluruh galeri
-- secara sembarangan. Sekarang server yang menentukan nilai berikutnya
-- (NOT is_favorite) dan hanya untuk SATU baris per panggilan — client tidak
-- bisa memilih nilainya.
create or replace function public.toggle_favorite(memory_id uuid)
returns void
language sql
security definer
as $$
  update public.memories set is_favorite = not is_favorite where id = memory_id;
$$;

grant execute on function public.toggle_favorite(uuid) to anon, authenticated;

-- 6) RPC: increment views atomik ---------------------------------------------
-- Tetap terbuka untuk publik (view counter memang data publik). Mitigasi
-- penggelembungan angka dilakukan di client lewat dedup per-session
-- (lihat DatabaseService.incrementViews): satu browser hanya menambah
-- views satu kali per memory per session. Dedup di client bukan pengaman
-- keras — perlakukan angka `views` sebagai estimasi, bukan data kritis.
create or replace function public.increment_memory_views(memory_id uuid)
returns void
language sql
security definer
as $$
  update public.memories set views = views + 1 where id = memory_id;
$$;

grant execute on function public.increment_memory_views(uuid) to anon, authenticated;

-- 7) RPC: ambil satu memory acak (untuk fitur "Surprise Me") ------------------
create or replace function public.get_random_memory()
returns setof public.memories
language sql
stable
as $$
  select * from public.memories order by random() limit 1;
$$;

grant execute on function public.get_random_memory() to anon, authenticated;

-- 8) Push notification: langganan browser ------------------------------------
-- Pengunjung bisa men-subscribe notifikasi "memory baru". Subscription
-- (endpoint + keys) disimpan di tabel ini. TIDAK ada policy RLS select/
-- insert langsung — semua akses publik hanya lewat RPC save/delete di bawah,
-- supaya endpoint (yang bersifat rahasia per-browser) tidak bisa dibaca
-- sembarang orang lewat anon key. Pengiriman notifikasi dilakukan oleh
-- GitHub Action terjadwal (scripts/notify.mjs) memakai service role key.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create or replace function public.save_push_subscription(sub jsonb)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.push_subscriptions (endpoint, p256dh, auth)
  values (
    sub->>'endpoint',
    sub->'keys'->>'p256dh',
    sub->'keys'->>'auth'
  )
  on conflict (endpoint) do update
    set p256dh = excluded.p256dh,
        auth = excluded.auth,
        created_at = now();
end;
$$;

grant execute on function public.save_push_subscription(jsonb) to anon, authenticated;

-- Parameter sengaja dinamai `p_endpoint` — jika bernama `endpoint`, ia akan
-- menbayangi kolom `endpoint` di WHERE dan query menjadi ambigu.
create or replace function public.delete_push_subscription(p_endpoint text)
returns void
language sql
security definer
as $
  delete from public.push_subscriptions where endpoint = p_endpoint;
$;

grant execute on function public.delete_push_subscription(text) to anon, authenticated;

-- ============================================================================
-- Setup Storage (dilakukan lewat Dashboard, bukan SQL):
-- 1. Storage > New bucket > nama: "memories" > Public bucket: ON
-- 2. Storage > memories > Policies:
--    - SELECT: public (true) — agar media bisa ditampilkan
--    - INSERT/UPDATE/DELETE: hanya authenticated dengan is_admin() true
--      (gunakan template policy lalu tempel kondisi: (select public.is_admin()))
-- ============================================================================
