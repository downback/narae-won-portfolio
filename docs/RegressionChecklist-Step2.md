# Step 2 Regression Checklist

Use this checklist after changes in admin upload/edit/delete/reorder flows.

## Exhibitions

- [ ] Create solo exhibition with main image only.
- [ ] Create group exhibition with main image + additional images.
- [ ] Edit exhibition metadata only (no file changes).
- [ ] Edit exhibition main image only.
- [ ] Edit exhibition with additional image uploads.
- [ ] Edit exhibition with additional image removals in the same PATCH request.
- [ ] Confirm removed additional images are deleted from DB and storage.
- [ ] Delete non-primary exhibition image.
- [ ] Delete primary exhibition image and verify parent exhibition removal behavior.
- [ ] Reorder solo exhibitions and verify public order.
- [ ] Reorder group exhibitions and verify public order.

## Works

- [ ] Create work with valid year/title/caption/image.
- [ ] Edit work metadata without changing image.
- [ ] Edit work image and verify old storage path cleanup.
- [ ] Delete work and verify storage file deletion.
- [ ] Reorder works inside year group and verify order on public page.
- [ ] Verify year range grouping (`2018-2021`) remains correct.

## Texts

- [ ] Create text with valid title/year/body.
- [ ] Edit text with valid title/year/body.
- [ ] Delete text and verify removal from admin and public lists.

## Auth and API Safety

- [ ] Confirm unauthorized requests to `app/api/admin/**` return 401.
- [ ] Confirm invalid UUID params return 400 where expected.
- [ ] Confirm invalid reorder payload IDs return 400.
- [ ] Confirm failed uploads do not leave inconsistent DB rows.
