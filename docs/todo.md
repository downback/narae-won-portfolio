## Project TODO (Full-stack Developer)

### Milestone 0 — Foundation

- [x] Create Next.js repo (App Router)
- [x] Install/configure TailwindCSS
- [x] Initialize ShadCN and add required base components (form, input, button, textarea, card, alert/toast, dialog if needed)
- [x] Add Supabase client configuration (env vars + client helpers for server/client usage)
- [x] Create Supabase project
- [x] Configure Supabase Auth (email/password enabled)
- [x] Create the single admin user in Supabase and record the admin `user_id` for RLS use
- [ ] Define decision: Storage access model (public buckets vs private + signed URLs)
- [ ] Define decision: file replacement strategy (replace-in-place vs new object key per upload)

---

### Milestone 1 — Supabase Backend (DB + Storage + Security)

- [x] Create Storage buckets (or folders) for:

  - [ ] Hero media
  - [ ] Works PDF

- [x] Implement Storage policies:

  - [ ] Public read or signed URL model (per decision)
  - [ ] Admin-only write/update/delete

- [x] Create database tables for:

  - [ ] Hero media metadata (type, storage path/key, updated_at)
  - [ ] Works PDF metadata (storage path/key, updated_at)
  - [ ] Bio structured content (fields matching existing structure)

- [ ] Seed initial rows (so public pages always have a valid “current” record)
- [ ] Enable RLS for all content tables
- [ ] Implement RLS policies:

  - [ ] Public read access for current content
  - [ ] Admin-only insert/update for the single admin user

- [x] Validate security with two sessions:

  - [ ] Unauthed user can read public content only
  - [ ] Unauthed user cannot write DB/Storage
  - [ ] Admin can write DB/Storage

---

### Milestone 2 — Public Site Routes (Preserve existing design)

- [ ] Scaffold public routes:

  - [ ] Home
  - [x] Works
  - [x] Bio
  - [ ] Contact

  - [x] Contact - locate contents in the center
  - [x] mobile sidebar no hover effect
  - [x] sidebar refactor
  - [x ] Works - loading animation
  - [ ] admin ui start
    - [x] admin sidebar
    - [x] admin sub-header
    - [x] add svg
    - [x] edit modal
    - Dashboard
      - [x] recent activity (add new | delete | update + main page | works | Biography + date of admin activity)
      - [x] quick buttons for modal
    - main page
      - [x] current image / change btn -> modal(image upload / animation check-box / preview + save btn) -> confirmation modal
    - works
      - [x] add new work btn -> modal(select category / images upload / caption / preview & drag order + save btn) -> confirmation modal
    - Bio
      - [x] add new info btn -> modal(select category / text + save btn) -> confirmation modal
  - [ ] admin db connect
  - [ ] main image file name on supabase
  - [ ] Home - animation adjust

- [ ] Implement Supabase server-side with admin page

  - [ ] Dashboard
  - [ ] main page
  - [ ] works
  - [ ] bio

- [ ] Implement caching strategy to ensure “immediate reflection” (no stale content)
- [ ] Home: render hero media (image or looped video) based on metadata
- [ ] Works: implement PDF viewing behavior + mobile fallback (open/download if embed fails)
- [ ] Bio: render structured bio fields exactly as required
- [ ] Contact: implement required static contact content (no form unless explicitly required)

---

### Milestone 3 — Admin Auth + Protected Area

- [ ] Create `/admin/login` page
- [ ] Build login form using ShadCN form components (inputs, validation messaging, button)
- [ ] Implement Supabase Auth sign-in flow
- [ ] Implement admin route protection for `/admin/**`:

  - [ ] Redirect unauthenticated to `/admin/login`
  - [ ] Prevent server-rendered admin pages from loading without session

- [ ] Create admin layout wrapper (navigation + page container per existing constraints)

---

### Milestone 4 — Admin Dashboard (Content Management)

- [ ] Create `/admin` dashboard page (overview)
- [ ] Dashboard: show current hero media + last updated timestamp
- [ ] Dashboard: show current works PDF + last updated timestamp
- [ ] Dashboard: show bio content snapshot (key fields)
- [ ] Hero media management

  - [ ] File input + upload button (ShadCN components)
  - [ ] Client-side validation (type + size)
  - [ ] Upload to Supabase Storage
  - [ ] Update hero metadata row in DB (only after upload success)
  - [ ] Preview updated media
  - [ ] Success/error UI feedback (ShadCN alert/toast patterns)

- [ ] Works PDF management

  - [ ] File input + upload button
  - [ ] Client-side validation (PDF + size)
  - [ ] Upload to Storage
  - [ ] Update works metadata row in DB
  - [ ] Provide preview link/viewer
  - [ ] Success/error feedback

- [ ] Bio editor

  - [ ] Build form matching structured fields (ShadCN form components)
  - [ ] Load current bio values
  - [ ] Save updates to DB
  - [ ] Success/error feedback

- [ ] Verify updates reflect immediately on public pages (hero, works, bio)

---

### Milestone 5 — Quality, Security, Release

- [ ] Add robust error handling for all admin actions (auth errors, upload failures, permission errors)
- [ ] Confirm RLS + Storage policy behavior in production-like environment
- [ ] Check responsiveness across common breakpoints:

  - [ ] Public pages (must pass)
  - [ ] Admin pages (at least usable on tablet/desktop)

- [ ] Add basic smoke-test checklist (manual) and run it end-to-end:

  - [ ] Admin login
  - [ ] Upload hero image
  - [ ] Upload hero video
  - [ ] Upload works PDF
  - [ ] Edit bio
  - [ ] Confirm public pages reflect changes immediately

- [ ] Deploy Next.js app (e.g., Vercel)
- [ ] Configure production env vars
- [ ] Run production smoke tests again
- [ ] Document minimal “how to update content” steps for handoff to maintainer/admin
