# Frontend TODO List (Phased)

---

## Phase 1 — Project Foundation & Routing

**Goal:** Establish correct public/admin routing and base app structure.

- [x] Set up Next.js App Router structure with `(public)` and `admin` segments
- [x] Implement public route structure:
  - `works` (single entry point, data-driven)
  - `exhibitions/solo/[slug]`
  - `exhibitions/group/[slug]`
  - `texts` (editorial pages)

- [x] Ensure no unused list routes exist (no index pages for exhibitions)
- [x] Set up shared layout(s) for public pages
- [x] Set up admin layout with protected routing (no UI redesign)

---

## Phase 2 — Supabase Client & Auth Integration

**Goal:** Correct, reusable Supabase integration with strict admin enforcement.

- [x] Initialize Supabase client (browser + shared utilities)
- [x] Implement admin authentication flow using existing login experience
- [x] Enforce admin-only access for all `/admin` routes
- [x] Ensure auth state is the single source of truth (no timeouts, no hacks)
- [x] Handle unauthenticated and unauthorized states cleanly

---

## Phase 3 — Public Data Fetching & Upload

**Goal:** connect all public content deterministically from the database.

- Implement fetch & upload
  - [x] artworks (grouped/sorted by year, category, display order)
    - [x] artworks preview
    - [x] edit -> modal
    - [x] delete -> confirmation
    - [x] card separate by year
    - [x] new confirmation modal
    - [x] leave confirmation modal open
    - [x] make inputs empty
    - [x] add year ui refine
    - [x] add year modal
    - [x] add year existing check
    - [x] add year DB
    - [x] 2018-2021
    - [x] drag and drop
  - [x] refactor folders in components
  - [x] exhibitions
    - [x] separate solo/group uploader
    - [x] drag and drop
  - [x] texts
    - [x] texts preview
    - [x] texts delete and edit
  - [x] biography tables
    - [x] add new sections(Residency, Awards & Selections, Collection)
    - [x] separate components

- [ ] Preview ui for artworks and exhibitions section
- [ ] Uploader ui for ipad & mobile
- [ ] Render content strictly based on DB ordering fields
- [ ] Gracefully handle empty states (no crashes, no broken UI)
- [ ] Ensure image-heavy pages are mobile-safe (basic loading behavior)

---

## Phase 4 — Public page UI

- [x] Font
- [x] Navbar
  - [x] ui copy
  - [x] mobile / desktop enhance
- [x] Sub-Header for mobile
- [x] Works
  - [x] ui copy
- [x] Exhibitions
  - [x] ui copy
- [x] Texts
  - [x] ui copy
- [x] CV
  - [x] ui copy

---

## Phase 5 — Public page DB

- [x] Navbar
  - [x] 2018 - 2021 logic
- [ ] Sub-Header for mobile
  - [ ]
- [x] Works
  - [ ]
- [ ] Exhibitions
  - [ ]
- [ ] Texts
  - [ ]
- [ ] CV
  - [ ]

- [ ] 안쓰이는 데이터 삭제
- [ ] works uploader 2018 - 2021 -> mandatory
- [ ] ADMIN : works uploader ipad modal height
- [ ] ADMIN : exhibition uploader additional images

---

## Phase 6 — Activity Logging & Error Handling

**Goal:** Make admin actions auditable and failures safe.

- [ ] Log every admin mutation to `activity_log`
- [ ] Ensure logging is automatic and non-blocking
- [ ] Surface clear, friendly error messages to admin users
- [ ] Avoid exposing internal errors on public pages
- [ ] Ensure partial failures do not break public state

---

## Phase 7 — Final QA & Hardening

**Goal:** Validate correctness, safety, and alignment with PRD.

- [ ] Verify all public pages work without authentication
- [ ] Verify admin-only writes are fully enforced
- [ ] Confirm RLS errors are handled gracefully in UI
- [ ] Test image upload/update/delete edge cases
- [ ] Test empty DB scenarios (fresh project)
- [ ] Run mobile and basic performance sanity checks
