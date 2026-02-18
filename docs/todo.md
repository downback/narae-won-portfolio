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

- [x] Step 6 - Refactor proposal set (incremental, PR-sized).
- [x] Step 6.1 - Batch A proposal: extract shared API helper module for admin route patterns (`logActivity`, JSON body parsing, common 4xx/5xx response mapping).  
  Risk: low | Area: `app/api/admin/**`, `lib/server/**` | Verify: exhibition/works/texts/bio CRUD + reorder routes.
- [x] Step 6.2 - Batch B proposal: normalize modal form-state reset utility across `ExhibitionUploadModal`, `WorkUploadModal`, `TextUploadModal` without changing input display behavior.  
  Risk: low-medium | Area: `components/admin/**` | Verify: add/edit modal open-close cycles, initial values, disabled/save state.
- [x] Step 6.3 - Batch C proposal: standardize upload transaction flow utility (upload -> DB write -> rollback cleanup) for image routes.  
  Risk: medium | Area: `app/api/admin/exhibitions*`, `app/api/admin/works*` | Verify: forced-failure scenarios, storage orphan checks.
- [x] Step 6.4 - Batch D proposal: unify reorder route implementation (payload validation + update loop + error aggregation).  
  Risk: low-medium | Area: `app/api/admin/*/reorder/route.ts` | Verify: drag-and-drop reorder behavior in works/exhibitions/bio.
- [x] Step 6.5 - Batch E proposal: introduce shared validation module for request schemas (Zod-based, incremental adoption).  
  Risk: medium | Area: `app/api/admin/**`, `lib/validation/**` | Verify: invalid payload responses remain user-safe and consistent.
- [x] Step 6.6 - Batch F proposal: clean naming inconsistencies and minor structural debt (`Lodaer.tsx` rename plan, optional hook extraction candidates).  
  Risk: low | Area: `components/public/shared/**`, related imports | Verify: import paths, Lightbox flow, build/lint pass.
- [x] Step 6.7 - For each batch, write mini RFC in docs with: rationale, affected files, risk level, rollout order, rollback notes.
- [x] Step 6.8 - Prioritize and schedule: choose next 2 batches only (avoid broad refactor blast radius in one cycle). (`Batch A` -> `Batch D`)

- [ ] Structured review report: deliver findings in your required severity order (CRITICAL -> HIGH/MEDIUM -> CLEANUP/OPTIONAL) with approval status (Approve / Warning / Block) and concrete next actions.

ERROR Handling

- [x] admin exhibition section : error specify - file size
  - [x] dialog confirm to file size
- [x] admin work section : drag and drop to order doesn't work
      saving.....
- [x] admin text section :
  - [x] edit mode - input value error
  - [x] edit mode - button invalid mode
