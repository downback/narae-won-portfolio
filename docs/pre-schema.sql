create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.app_admin (
  singleton_id boolean primary key,
  admin_user_id uuid not null unique references auth.users(id) on delete restrict,
  constraint app_admin_singleton_true check (singleton_id = true)
);

insert into public.app_admin (singleton_id, admin_user_id)
values (true, 'PLACEHOLDER_ADMIN_USER_ID');

create policy "app_admin_select_authenticated"
on public.app_admin
for select
using (auth.uid() is not null);

create policy "app_admin_update_admin_only"
on public.app_admin
for update
using (
  auth.uid() = admin_user_id
)
with check (
  auth.uid() = admin_user_id
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  asset_kind text not null,
  mime_type text not null,
  byte_size bigint not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  constraint assets_bucket_path_unique unique (bucket, path),
  constraint assets_kind_check check (asset_kind in ('hero_media', 'works_pdf')),
  constraint assets_byte_size_check check (byte_size > 0)
);

create index if not exists assets_asset_kind_idx on public.assets(asset_kind);

create policy "assets_public_read"
on public.assets
for select
using (true);

create policy "assets_admin_insert"
on public.assets
for insert
with check (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
);

create policy "assets_admin_update"
on public.assets
for update
using (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
);

create policy "assets_admin_delete"
on public.assets
for delete
using (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
);

create table if not exists public.site_content (
  singleton_id boolean primary key,
  intro_text text not null,
  statement_text text not null,
  hero_asset_id uuid not null references public.assets(id) on delete restrict,
  works_pdf_asset_id uuid not null references public.assets(id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id) on delete restrict,
  constraint site_content_singleton_true check (singleton_id = true),
  constraint site_content_distinct_assets check (hero_asset_id <> works_pdf_asset_id)
);

--if not exists(?)
create trigger trg_site_content_set_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

create policy "site_content_public_read"
on public.site_content
for select
using (true);

create policy "site_content_admin_insert"
on public.site_content
for insert
with check (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
);

create policy "site_content_admin_update"
on public.site_content
for update
using (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
);

create table if not exists public.bio_group_shows (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  year int not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id) on delete restrict,
  constraint bio_group_shows_year_check check (year between 1900 and 2100),
  constraint bio_group_shows_sort_order_check check (sort_order >= 0)
);

create index if not exists bio_group_shows_sort_order_idx on public.bio_group_shows(sort_order);

--create trigger trg_bio_group_shows_set_updated_at
--before update on public.bio_group_shows
--for each row execute function public.set_updated_at();

create policy "bio_solo_shows_public_read"
on public.bio_solo_shows
for select
using (true);

create policy "bio_solo_shows_admin_write"
on public.bio_solo_shows
for all
using (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
);

create table if not exists public.bio_solo_shows (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  year int not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id) on delete restrict,
  constraint bio_solo_shows_year_check check (year between 1900 and 2100),
  constraint bio_solo_shows_sort_order_check check (sort_order >= 0)
);

create index if not exists bio_solo_shows_sort_order_idx on public.bio_solo_shows(sort_order);

create trigger trg_bio_solo_shows_set_updated_at
before update on public.bio_solo_shows
for each row execute function public.set_updated_at();

create policy "bio_group_shows_public_read"
on public.bio_group_shows
for select
using (true);

create policy "bio_group_shows_admin_write"
on public.bio_group_shows
for all
using (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
)
with check (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
);

alter table public.app_admin enable row level security;
alter table public.assets enable row level security;
alter table public.site_content enable row level security;
alter table public.bio_group_shows enable row level security;
alter table public.bio_solo_shows enable row level security;
alter table public.bio_education enable row level security;

alter table public.site_content
add column if not exists hero_animation_enabled boolean not null default true;

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('add', 'update', 'delete')),
  area text not null check (area in ('Main Page', 'Works', 'Biography')),
  created_at timestamptz not null default now()
);

create index if not exists activity_log_created_at_idx on public.activity_log(created_at);

create policy "activity_log_public_read"
on public.activity_log
for select
using (true);

create policy "activity_log_admin_insert"
on public.activity_log
for insert
with check (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
);

-- Add created_by column used by the API
alter table public.activity_log
add column if not exists created_by uuid references auth.users(id) on delete restrict;

-- Ensure RLS is enabled if you want policies to apply
alter table public.activity_log enable row level security;

-- If you want admin-only reads (recommended for admin dashboard)
drop policy if exists "activity_log_public_read" on public.activity_log;

create policy "activity_log_admin_read"
on public.activity_log
for select
using (
  auth.uid() = (
    select admin_user_id
    from app_admin
    where singleton_id = true
  )
);

alter table public.activity_log
add column if not exists context text check (context in ('solo', 'group'));