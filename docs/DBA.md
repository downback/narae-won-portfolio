- [x]Step 1 — Create Storage bucket

  - Go to Storage → Buckets → New bucket
  - Name: `site-assets`
  - Choose:
    - Public bucket (simpler public read), or
    - Private bucket (more secure; requires signed URLs)
  - Save

- [x]Step 2 — Create tables (Table Editor)

  - Create these tables in Database → Table Editor:
    - `app_admin` (singleton)
    - `assets`
    - `site_content` (singleton)
    - `bio_exhibitions`
    - `bio_education`
  - As you create each table:
    - Add the columns exactly as listed above
    - Add constraints:
      - singleton checks
      - NOT NULLs
      - CHECKs (dates/years/order)
      - UNIQUE (`bucket`, `path`)
    - Add foreign keys:
      - `assets.created_by` → `auth.users(id)`
      - `site_content.updated_by` → `auth.users(id)`
      - `site_content.hero_asset_id` → `assets(id)` (RESTRICT delete)
      - `site_content.works_pdf_asset_id` → `assets(id)` (RESTRICT delete)
      - list tables’ `updated_by` → `auth.users(id)`

- [x]Step 3 — Turn on RLS

  - For each table:
    - Go to Database → Tables → (table) → RLS
    - Enable Row Level Security
  - Tables:
    - `app_admin`
    - `assets`
    - `site_content`
    - `bio_exhibitions`
    - `bio_education`

- [x]Step 4 — Create RLS policies

  - For each content table (`site_content`, `assets`, `bio_exhibitions`, `bio_education`):
    - Add a SELECT policy allowing public read
    - Add INSERT / UPDATE / DELETE policies allowing only:
      - authenticated users AND
      - user id matches `app_admin.admin_user_id`
  - For `app_admin` (recommended):
    - Allow SELECT only to authenticated users (or only admin)
    - Allow UPDATE only via service role, or lock it down after setup

- [ ]Step 5 — Add Storage policies

  - Go to Storage → Policies for bucket `site-assets`
  - Read policy:
    - allow public reads (or authenticated reads if bucket is private)
  - Write policy:
    - allow upload / update / delete only if uploader is the single admin user
    - use the same admin check as DB RLS via `app_admin`

- [ ]Step 6 — Create the admin user

  - Go to Authentication → Users
  - Create or sign up the admin account
  - Copy the admin user UUID

- [ ]Step 7 — Initialize `app_admin`

  - Insert the singleton row into `app_admin`:
    - `singleton_id = true`
    - `admin_user_id = <admin UUID>`
  - Treat future admin changes as a controlled operation (ideally service-role only)

- [ ]Step 8 — Seed initial content and asset references

  - Upload hero media and works PDF to the bucket
  - Create corresponding rows in `assets` with correct `asset_kind` and metadata
  - Insert the singleton row in `site_content`:
    - `singleton_id = true`
    - set `hero_asset_id` and `works_pdf_asset_id`
    - set `intro_text` and `statement_text`
    - set `updated_by` to the admin UUID

- [ ]Step 9 — Verify safety behaviors
  - Anonymous reads should succeed
  - Anonymous writes should fail
  - Authenticated non-admin writes should fail
  - Deleting an asset referenced by `site_content` should fail (RESTRICT)
  - Setting `site_content.hero_asset_id` to a nonexistent id should fail (FK)
