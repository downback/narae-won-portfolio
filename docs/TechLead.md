## Development task breakdown

### 0 Project setup (foundation)

1. **Repo setup**
   - Initialize Next.js (App Router)
   - Configure TailwindCSS
   - Initialize ShadCN and add baseline components needed for forms/layout (as required by the existing design)
   - Add Supabase client setup (env vars, helper modules)

2. **Supabase project setup**
   - Create Supabase project
   - Configure Auth (email/password)
   - Create the single admin user (manual setup in Supabase)
   - Store required env vars for local + deployment

---

### 1 Supabase backend (minimal + secure)

3. **Storage**
   - Create Storage buckets (e.g., `hero`, `works`) or a single bucket with folders
   - Define object naming strategy for “replace” behavior (replace-in-place vs new key per upload)

4. **Database**
   - Create minimal tables for:
     - Hero media metadata (type, storage path, updated timestamp)
     - Works PDF metadata (storage path, updated timestamp)
     - Bio structured fields (matching PRD’s existing structure)

   - Seed initial rows so public pages always have content to render

5. **Security / RLS**
   - Enable RLS on tables
   - Policies:
     - Public read for current content rows (needed by public pages)
     - Admin-only insert/update (restricted to the single admin user)

   - Storage policies:
     - Public read or signed URL approach (per chosen access model)
     - Admin-only upload/update/delete

---

### 2 Public pages (preserve existing design)

6. **Route scaffolding (Next.js App Router)**
   - Implement public routes:
     - Home
     - Works (PDF viewer)
     - Bio
     - Contact

   - Create shared public layout(s) consistent with the existing design

7. **Supabase read integration**
   - Server-side reads for hero media, works PDF metadata, bio content
   - Implement caching strategy to satisfy “immediate reflection” (no stale content)

8. **Home page: hero media rendering**
   - Render image or looped video based on stored metadata
   - Ensure responsive behavior

9. **Works page: PDF viewing**
   - Implement PDF display behavior per existing design constraints
   - Provide mobile-safe fallback behavior (if embedded PDF is unreliable)

10. **Bio page: structured content rendering**

- Render structured fields exactly as defined (no schema/structure redesign)
- Ensure responsive behavior

11. **Contact page**

- Implement required content (static contact info/links unless PRD indicates form handling)

---

### 3 Admin authentication + protected area

12. **Admin login**

- Create admin login route
- Implement Supabase Auth sign-in
- Use ShadCN form components for inputs, validation feedback, and submit actions

13. **Admin route protection**

- Restrict `/admin/**` routes to authenticated sessions
- Redirect unauthenticated users to admin login
- Add server-side session checks where needed

14. **Admin layout + navigation**

- Create admin layout wrapper
- Add minimal navigation to dashboard sections (no UX redesign; just structure)

---

### 4) Admin dashboard (content management)

15. **Dashboard overview**

- Display current hero media + last updated timestamp
- Display current works PDF + last updated timestamp
- Display current bio content snapshot (or key fields)

16. **Hero media upload & replace**

- Upload image/video to Supabase Storage
- Update DB metadata record after successful upload
- Provide preview + success/error states (ShadCN alert/toast patterns)

17. **Works PDF upload & replace**

- Upload PDF to Supabase Storage
- Update DB metadata record after successful upload
- Provide link/preview + success/error states

18. **Bio structured editor**

- Implement form fields matching existing bio structure
- Save updates to DB
- Provide save confirmation + validation errors (ShadCN form components)

19. **Immediate public reflection validation**

- Confirm public pages show updates without manual cache clears
- Add explicit revalidation logic if required by chosen caching approach

---

### 5 Reliability, QA, and release

20. **Validation & constraints**

- Client-side file validation (type + size) for hero media and PDF
- Prevent DB updates when uploads fail

21. **Error handling & observability**

- User-friendly admin errors (unauthorized, upload failure, invalid file)
- Minimal logging strategy (client + server) for troubleshooting

22. **Security verification**

- Confirm public cannot write to DB or Storage
- Confirm only admin can upload/replace/edit
- Confirm no accidental exposure of admin-only routes/data

23. **Responsive QA**

- Verify all public pages across mobile/tablet/desktop
- Verify admin flows are usable on common screen sizes (at least tablet+)

24. **Deployment**

- Deploy Next.js app
- Configure production env vars
- Run smoke tests in production:
  - Admin login
  - Upload hero
  - Upload PDF
  - Edit bio
  - Confirm public pages reflect changes immediately
