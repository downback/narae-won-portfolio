# File Naming Convention

## Required Filenames for Supabase Storage

To ensure optimal performance, uploaded files **must** use these exact filenames:

### Hero Image

- **Path:** `site-assets/hero/hero-image.png`
- **Supported formats:** PNG preferred (can also use JPG, JPEG, or WebP with `.png` extension)
- **Usage:** Main homepage hero image with animation

### Portfolio PDF

- **Path:** `site-assets/works/portfolio.pdf`
- **Format:** PDF only
- **Usage:** Works page portfolio viewer

## Why Fixed Filenames?

Using fixed filenames eliminates the need for expensive `list()` database queries:

- **Before:** ~1-2 seconds loading time (list files → get URL)
- **After:** ~50ms loading time (get URL directly)

## Admin Upload Instructions

When uploading through the admin panel:

1. Upload will automatically save to the correct path
2. New uploads overwrite existing files
3. Changes are reflected immediately on the public site

## Fallback Behavior

If files are not found at the expected paths:

- Hero: Falls back to `/hero-image.jpg` (local fallback)
- PDF: Falls back to `/portfolio.pdf` (local fallback)
