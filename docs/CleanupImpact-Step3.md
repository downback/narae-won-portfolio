# Cleanup Impact: hero-image and works-pdf routes

## Candidate Removal Status

- `app/api/admin/hero-image/route.ts`: candidate removal confirmed (no in-repo callers)
- `app/api/admin/works-pdf/route.ts`: candidate removal confirmed (no in-repo callers)

## Usage Trace Summary

- No references found to:
  - `/api/admin/hero-image`
  - `/api/admin/works-pdf`
- No admin UI fetch usage found for either endpoint.
- No public app rendering path depends on either endpoint directly.

## Related Schema / Data Model Impact

Removing these two API routes does **not** alter schema by itself, but leaves related schema fields currently unused by app code:

- `public.site_content.hero_asset_id`
- `public.site_content.works_pdf_asset_id`
- `public.site_content.hero_animation_enabled`
- `public.assets.asset_kind` values tied to these routes:
  - `hero_media`
  - `works_pdf`

These fields remain in `docs/new-schema.sql` and database policies, but become passive until a feature uses them again.

## Docs Impact

- No existing docs references to `/api/admin/hero-image` or `/api/admin/works-pdf` were found.
- Architecture/runtime docs do not require updates for route removal.

## Safety Notes

- Safe to remove route files and now-unused PDF upload helper code.
- This cleanup does not change existing works/exhibitions/texts admin flows.
- If hero/PDF admin upload features are needed again, route restoration or new route design will be required.
