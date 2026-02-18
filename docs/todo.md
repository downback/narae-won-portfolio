- [x] Dashboard connected state
- [x] quick action panel
- [x] en -> kor

Refactoring

- [x] Step 1 - Baseline scan completed (no edits).
- [x] Step 1 - Extract shared constants for impact-radius reduction (`bucketName`, year range, common categories).
- [x] Step 1 - Document runtime boundaries in code comments/docs (`app/(public)`, `app/admin`, `app/api/admin`, `lib/server.ts`, `lib/client.ts`).
- [x] Step 1 - Add small architecture map in docs for critical shared modules and their callers.

- [x] Step 2 - Change-risk-first review completed (high-churn areas identified).
- [x] Step 2 - Stabilize highest-risk exhibition flow first (`components/admin/exhibition/AdminExhibitionsPanel.tsx`, `components/admin/exhibition/ExhibitionUploadModal.tsx`, `app/api/admin/exhibitions/route.ts`, `app/api/admin/exhibitions/[id]/route.ts`).
- [x] Step 2 - Then stabilize works flow with same pattern (`components/admin/works/WorksPanel.tsx`, `components/admin/works/WorkUploadModal.tsx`, `app/api/admin/works/route.ts`, `app/api/admin/works/[id]/route.ts`).
- [x] Step 2 - Standardize shared API helpers (auth gate, UUID validation, error mapping, storage path builder) to reduce copy-paste risk.
- [x] Step 2 - Add focused regression checklist for upload/edit/delete/reorder flows (exhibitions + works + texts).

- [x] Step 3 - Security and data-layer audit completed.
- [x] Step 3 - Add explicit admin authorization check helper for all `app/api/admin/**` routes (defense in depth on top of RLS).
- [x] Step 3 - Replace weak UUID regex with strict shared validator and apply to params + reorder payload IDs.
- [x] Step 3 - Add server-side upload file size limits and consistent MIME/content validation strategy.
- [x] Step 3 - Harden multi-step upload/update cleanup paths to prevent partial-failure data/storage drift.
- [x] Step 3 - Align RLS policy style to recommended `(select auth.uid())` pattern during schema hardening.

- [x] Step 4 - Correctness/maintainability review completed.
- [x] Step 4 - Fix exhibition delete success/failure semantics in `app/api/admin/exhibitions/[id]/route.ts` (do not return success on parent delete failure).
- [x] Step 4 - Make exhibition edit flow atomic from user perspective (avoid deleting additional images before full PATCH success).
- [x] Step 4 - Prevent partial-update semantics in exhibition PATCH (safe operation order + rollback strategy).
- [x] Step 4 - Standardize year validation rules between works/texts APIs.
- [x] Step 4 - Remove `setTimeout(0)`-based modal reset patterns in upload modals and use deterministic reset logic.
- [x] Step 4 - Improve object URL lifecycle management in admin panels (revoke after refresh, not only on unmount).
- [x] Step 4 - Replace hardcoded year options in `components/admin/works/WorksPanel.tsx` with range-derived options.

- [ ] Step 5 - Dead code and cleanup pass (detailed execution plan).
- [x] Step 5.1 - Build cleanup inventory by category: unused imports, unused exports, unused components/files, unreachable branches, legacy comments.
- [x] Step 5.2 - Mark each candidate with confidence label (`safe-remove` | `needs-check`) and reason.
- [x] Step 5.3 - Run import/export usage trace across `app/**`, `components/**`, `lib/**` and capture references for each candidate.
- [x] Step 5.4 - Remove only `safe-remove` unused imports and trivial dead local variables in touched files (no behavior change).
- [ ] Step 5.5 - Remove orphaned files/components only when zero references are confirmed and impact radius is documented.
- [x] Step 5.6 - For `needs-check` candidates, keep code intact and write follow-up notes with required manual verification points.
- [x] Step 5.7 - Clean legacy/commented-out code blocks that are confirmed obsolete; keep explanatory comments only where they add future context.
- [x] Step 5.8 - Verify cleanup safety: run lints and targeted regression checks for admin flows (works/exhibitions/texts/bio reorder).
- [x] Step 5.9 - Publish cleanup report with: removed items, flagged items, risk level, and rollback notes.
- [x] Dead code and cleanup pass - candidate removal traced for `app/api/admin/hero-image/route.ts` and `app/api/admin/works-pdf/route.ts` (`docs/CleanupImpact-Step3.md`).
- [ ] Refactor proposal set (incremental): produce low-risk, high-impact refactor steps with rationale, affected area, risk level, and verification notes (what must be manually checked if tests are missing).
- [ ] Structured review report: deliver findings in your required severity order (CRITICAL -> HIGH/MEDIUM -> CLEANUP/OPTIONAL) with approval status (Approve / Warning / Block) and concrete next actions.

ERROR Handling

- [x] admin exhibition section : error specify - file size
  - [x] dialog confirm to file size
- [x] admin work section : drag and drop to order doesn't work
      saving.....
- [x] admin text section :
  - [x] edit mode - input value error
  - [x] edit mode - button invalid mode
