-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists pgcrypto;

-- ============================================================
-- Admin Singleton
-- ============================================================
create table public.app_admin (
  singleton_id boolean primary key,
  admin_user_id uuid not null unique
    references auth.users(id) on delete restrict,
  constraint app_admin_singleton_true check (singleton_id = true)
);

alter table public.app_admin enable row level security;

create policy "app_admin_select_authenticated"
on public.app_admin
for select
using (auth.uid() is not null);

create policy "app_admin_update_admin_only"
on public.app_admin
for update
using (auth.uid() = admin_user_id)
with check (auth.uid() = admin_user_id);

-- ============================================================
-- Artworks (All Images)
-- ============================================================
create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  category text not null,
  year int null,
  exhibition_slug text null,
  caption text not null,
  description text null,
  display_order int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint artworks_storage_path_unique unique (storage_path),
  constraint artworks_category_check
    check (category in ('works', 'solo-exhibitions', 'group-exhibitions')),
  constraint artworks_display_order_check
    check (display_order >= 0)
);

create index artworks_category_order_idx
on public.artworks (category, display_order);

alter table public.artworks enable row level security;

create policy "artworks_public_read"
on public.artworks
for select
using (true);

create policy "artworks_admin_write"
on public.artworks
for all
using (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
);

-- ============================================================
-- Biography: Solo Exhibitions
-- ============================================================
create table public.bio_solo_exhibitions (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  description text null,
  display_order int not null,
  created_at timestamptz not null default now(),

  constraint bio_solo_exhibitions_year_check
    check (year between 1900 and 2100),
  constraint bio_solo_exhibitions_order_check
    check (display_order >= 0)
);

alter table public.bio_solo_exhibitions enable row level security;

create policy "bio_solo_exhibitions_public_read"
on public.bio_solo_exhibitions
for select
using (true);

create policy "bio_solo_exhibitions_admin_write"
on public.bio_solo_exhibitions
for all
using (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
);

-- ============================================================
-- Biography: Group Exhibitions
-- ============================================================
create table public.bio_group_exhibitions (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  description text null,
  display_order int not null,
  created_at timestamptz not null default now(),

  constraint bio_group_exhibitions_year_check
    check (year between 1900 and 2100),
  constraint bio_group_exhibitions_order_check
    check (display_order >= 0)
);

alter table public.bio_group_exhibitions enable row level security;

create policy "bio_group_exhibitions_public_read"
on public.bio_group_exhibitions
for select
using (true);

create policy "bio_group_exhibitions_admin_write"
on public.bio_group_exhibitions
for all
using (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
);

-- ============================================================
-- Biography: Education
-- ============================================================
create table public.bio_education (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  description text null,
  display_order int not null,
  created_at timestamptz not null default now(),

  constraint bio_education_order_check
    check (display_order >= 0)
);

alter table public.bio_education enable row level security;

create policy "bio_education_public_read"
on public.bio_education
for select
using (true);

create policy "bio_education_admin_write"
on public.bio_education
for all
using (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
);

-- ============================================================
-- Biography: Residency
-- ============================================================
create table public.bio_residency (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  description text null,
  display_order int not null,
  created_at timestamptz not null default now(),

  constraint bio_residency_year_check
    check (year between 1900 and 2100),
  constraint bio_residency_order_check
    check (display_order >= 0)
);

alter table public.bio_residency enable row level security;

create policy "bio_residency_public_read"
on public.bio_residency
for select
using (true);

create policy "bio_residency_admin_write"
on public.bio_residency
for all
using (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
);

-- ============================================================
-- Biography: Awards
-- ============================================================
create table public.bio_awards (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  description text null,
  display_order int not null,
  created_at timestamptz not null default now(),

  constraint bio_awards_year_check
    check (year between 1900 and 2100),
  constraint bio_awards_order_check
    check (display_order >= 0)
);

alter table public.bio_awards enable row level security;

create policy "bio_awards_public_read"
on public.bio_awards
for select
using (true);

create policy "bio_awards_admin_write"
on public.bio_awards
for all
using (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
);

-- ============================================================
-- Biography: Collections
-- ============================================================
create table public.bio_collections (
  id uuid primary key default gen_random_uuid(),
  year int null,
  description text null,
  display_order int not null,
  created_at timestamptz not null default now(),

  constraint bio_collections_year_check
    check (year is null or year between 1900 and 2100),
  constraint bio_collections_order_check
    check (display_order >= 0)
);

alter table public.bio_collections enable row level security;

create policy "bio_collections_public_read"
on public.bio_collections
for select
using (true);

create policy "bio_collections_admin_write"
on public.bio_collections
for all
using (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
);

-- ============================================================
-- Text Content
-- ============================================================
create table public.texts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  year int not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint texts_slug_unique unique (slug),
  constraint texts_year_check
    check (year between 1900 and 2100)
);

alter table public.texts enable row level security;

create policy "texts_public_read"
on public.texts
for select
using (true);

create policy "texts_admin_write"
on public.texts
for all
using (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
);

-- ============================================================
-- Activity Log (Append-only)
-- ============================================================
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null
    references auth.users(id) on delete restrict,
  action_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create policy "activity_log_admin_read"
on public.activity_log
for select
using (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
);

create policy "activity_log_admin_insert"
on public.activity_log
for insert
with check (
  auth.uid() = (
    select admin_user_id
    from public.app_admin
    where singleton_id = true
  )
);
