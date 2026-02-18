# Step 6 Refactor Proposal (Incremental)

## Goal

Create low-risk, high-impact refactor proposals that can be executed in small PR-sized batches without changing product behavior.

## Prioritized Next 2 Batches

1. **Batch A (first)** - shared admin API helpers
2. **Batch D (second)** - reorder route unification

Reason for priority:

- Both are high duplication areas.
- Both are low to low-medium risk when done incrementally.
- Both reduce maintenance burden broadly across `app/api/admin/**`.

---

## Batch A - Shared Admin API Helpers

### Rationale

- Admin routes repeat the same patterns for:
  - activity logging
  - auth/user checks
  - JSON parse try/catch responses
  - common `400/401/403/500` error handling style
- Centralizing these patterns reduces drift and improves consistency.

### Affected Area

- `app/api/admin/**`
- `lib/server/**` (helper entry point)

### Proposed Changes

- Add helper utilities for:
  - `logActivity(...)`
  - safe JSON parsing with consistent error response
  - common response builders (`badRequest`, `unauthorized`, `forbidden`, `serverError`)
- Replace duplicated per-route inline logic gradually.

### Risk Level

- **Low**

### Rollout Order

1. Introduce helper functions without route migration.
2. Migrate 2-3 routes first (`texts`, `works/reorder`, one bio route).
3. Validate behavior.
4. Migrate remaining routes in follow-up PR.

### Rollback Plan

- Revert route-level helper adoption; keep original route-local logic.
- Helper module can remain unused safely.

### Manual Verification

- Admin CRUD on `works`, `exhibitions`, `texts`, `bio`.
- Error message/status consistency for invalid payload and auth failure.
- Activity log insert behavior unchanged.

---

## Batch B - Modal Reset Utility Normalization

### Rationale

- Modal reset/open logic is duplicated and slightly different across:
  - `ExhibitionUploadModal`
  - `WorkUploadModal`
  - `TextUploadModal`
- Normalize reset behavior while preserving current input display behavior.

### Affected Area

- `components/admin/**`

### Proposed Changes

- Introduce a shared reset pattern (or utility hook) for:
  - apply initial values on open
  - clear local temp files/preview URLs on close
  - preserve user-visible input behavior exactly

### Risk Level

- **Low-Medium** (UI state-sensitive)

### Rollout Order

1. Define baseline behavior snapshot for all 3 modals.
2. Refactor one modal first (`TextUploadModal`) and verify.
3. Apply to `WorkUploadModal`, then `ExhibitionUploadModal`.

### Rollback Plan

- Revert individual modal file if any input behavior changes.

### Manual Verification

- Add/edit mode open-close cycles.
- Initial values shown exactly as before.
- Disabled/save button conditions unchanged.

---

## Batch C - Upload Transaction Flow Utility

### Rationale

- Upload routes currently implement compensating cleanup repeatedly.
- A shared transaction helper can reduce orphan-file risk and duplicated rollback code.

### Affected Area

- `app/api/admin/exhibitions*`
- `app/api/admin/works*`
- potential shared helper in `lib/storage/**`

### Proposed Changes

- Standardize patterns:
  - upload files
  - DB write
  - rollback storage on DB failure
- keep route-specific business logic intact.

### Risk Level

- **Medium**

### Rollout Order

1. Extract helper with zero behavior change.
2. Adopt in `works` routes first.
3. Adopt in `exhibitions` routes.

### Rollback Plan

- Revert only helper-adopted routes, keep old inline logic.

### Manual Verification

- Force failure scenarios (upload success + DB fail).
- Confirm no storage orphan files.

---

## Batch D - Reorder Route Unification

### Rationale

- Reorder routes share nearly identical payload validation/update patterns.
- This is a strong duplication hotspot across bio/works/exhibitions.

### Affected Area

- `app/api/admin/*/reorder/route.ts`

### Proposed Changes

- Create shared reorder utility for:
  - payload validation
  - UUID validation
  - error aggregation
  - consistent response structure

### Risk Level

- **Low-Medium**

### Rollout Order

1. Migrate one bio reorder route.
2. Migrate remaining bio reorder routes.
3. Migrate `works/reorder` and `exhibitions/reorder`.

### Rollback Plan

- Revert route-by-route migration.

### Manual Verification

- Drag-and-drop reorder in:
  - exhibitions (solo/group)
  - works (year groups)
  - bio sections

---

## Batch E - Shared Request Validation (Zod)

### Rationale

- Validation exists but is mostly manual and duplicated.
- Incremental Zod adoption improves maintainability and consistency.

### Affected Area

- `app/api/admin/**`
- shared schemas in `lib/validation/**`

### Proposed Changes

- Add route schemas incrementally (start with `texts` then `works`).
- Keep current response message style.

### Risk Level

- **Medium**

### Rollout Order

1. Introduce schema module with one route.
2. Validate compatibility.
3. Expand route-by-route.

### Rollback Plan

- Revert schema usage per route; keep route-local checks.

### Manual Verification

- Invalid payload tests (missing fields/type mismatch/range issues).
- Verify safe and user-friendly error responses.

---

## Batch F - Naming/Structural Debt Cleanup

### Rationale

- Small naming inconsistencies and structural debt reduce readability.
- Candidate: `components/public/shared/Lodaer.tsx` typo rename.

### Affected Area

- `components/public/shared/**`
- import sites in public components

### Proposed Changes

- Rename typo files with coordinated import updates.
- Optional small extraction only where duplication clearly hurts clarity.

### Risk Level

- **Low**

### Rollout Order

1. Rename file + update imports in one PR.
2. Run lint/build and UI smoke test.

### Rollback Plan

- Revert rename commit only.

### Manual Verification

- Lightbox loader rendering.
- No broken import paths in public pages.

---

## Execution Guardrails

- Keep PRs single-purpose and small.
- No business logic or UX flow changes.
- Preserve existing input display behavior and error wording unless explicitly planned.
