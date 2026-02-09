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
- [x] Works
- [x] Exhibitions
- [x] Texts
- [x] CV

- [x] ADMIN : works uploader ipad modal height(exhibition uploader )
- [x] ADMIN : exhibition uploader width

- [x] ADMIN : exhibition uploader MULTIPLE additional images
- [x] ADMIN : exhibition uploader additional images preview
- [x] ADMIN : exhibition uploader additional images
- [x] ADMIN : separate tables of exhibition and works
- [x] ADMIN : apply tables in ui
- [x] -> check it on public page
- [x] ADMIN : works uploader 2018 - 2021 -> mandatory
- [x] ADMIN : exhibition & works image preview square
- [x] ADMIN : login-modal btn

- [x] PUBLIC : works & exhibition pages start from the top
- [x] PUBLIC : text item ui mobile - grid
- [x] PUBLIC : text open -> scroll -> list position changing

- [x] Favicon
- [x] instagram link
- [x] PUBLIC : text input

---

## Phase 6 — Error Handling & refactoring

- [ ] edit mode additional image not saved
- [ ] exhibition section in admin drag and drop not working
- [ ] mobile navbar
- [ ] exhibition 페이지에서 사진을 여러장 업데이트 하는 경우

---

## Phase 7 — Final QA & Hardening

**Goal:** Validate correctness, safety, and alignment with PRD.

- [ ] 캡션은 작업 제목과 캡션텍스트를 원하는 구간에서 줄 바꿈을 모두 할 수 있으면 좋겠습니다.
- [ ] 제목과 캡션의 텍스트 크기가 조금 작아져도 좋을 것 같아요.
      영문과 국문제목을 모두 기재할 경우(혹은 긴 제목과 캡션일 경우) 제목이 길어지더라고요.

- [ ] 관리자 페이지에 사용할 이메일과 비밀번호도 공유드리겠습니다.
      ID: woennarae@gmail.com
      PW: naraeworks123
