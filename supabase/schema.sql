-- ============================================================================
-- Naze's Memories — Supabase schema
-- Jalankan di Supabase Dashboard > SQL Editor (satu kali, saat setup awal).
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
create policy "public read memories" on public.memories
  for select using (true);

-- Admin: full akses INSERT/UPDATE/DELETE.
drop policy if exists "admin write memories" on public.memories;
create policy "admin write memories" on public.memories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read settings" on public.app_settings;
create policy "public read settings" on public.app_settings
  for select using (true);

drop policy if exists "admin write settings" on public.app_settings;
create policy "admin write settings" on public.app_settings
  for update using (public.is_admin()) with check (public.is_admin());

-- 5) RPC: toggle favorite (aman untuk publik) -------------------------------
-- Publik boleh mengubah is_favorite lewat RPC ini SAJA, bukan lewat UPDATE
-- langsung — jadi tidak ada celah untuk mengubah kolom lain (title, media_url, dst).
create or replace function public.toggle_favorite(memory_id uuid, value boolean)
returns void
language sql
security definer
as $$
  update public.memories set is_favorite = value where id = memory_id;
$$;

grant execute on function public.toggle_favorite(uuid, boolean) to anon, authenticated;

-- 6) RPC: increment views atomik ---------------------------------------------
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

-- ============================================================================
-- Setup Storage (dilakukan lewat Dashboard, bukan SQL):
-- 1. Storage > New bucket > nama: "memories" > Public bucket: ON
-- 2. Storage > memories > Policies:
--    - SELECT: public (true) — agar media bisa ditampilkan
--    - INSERT/UPDATE/DELETE: hanya authenticated dengan is_admin() true
--      (gunakan template policy lalu tempel kondisi: (select public.is_admin()))
-- ============================================================================
