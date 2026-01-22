DBA Product Requirements Document

**Project:** Artist Portfolio Website (Image + Text Based)
**Audience:** DBA / Backend Engineering
**Role Scope:** Database schema design, storage structure, access control, data integrity
**Out of Scope:** UI/UX, frontend logic, application architecture

---

## 1. Project Context

This project is an artist portfolio website that reuses an existing UI and admin login experience.
All content is managed exclusively via **Supabase Database** and **Supabase Storage**.

The database and storage layers together act as a **lightweight CMS**, optimized for:

* editorial control
* predictable structure
* long-term maintainability
* minimal schema complexity

---

## 2. Core Characteristics

* **Single admin user**
* **Public read / admin write** access model
* **Image-based works and exhibitions**
* **Text-based editorial pages**
* **Structured biographical (CV) information**
* **Explicit, semantic storage paths**
* **No hero image**
* **No PDF-based portfolio**
* **No drafts, versions, or soft deletes**

---

## 3. Storage Requirements (Supabase Storage)

### 3.1 Bucket

* **Bucket name:** `site-assets`
* **Access model:**

  * Public read access
  * Authenticated admin write access only

---

### 3.2 Folder Structure

Storage contains **images only**.

```
site-assets/
├── works/
├── solo-exhibitions/
└── group-exhibitions/
```

**Rules**

* No placeholder files
* No empty folders
* Folders exist only if they contain real images
* Year folders under `works/` are created dynamically when images are uploaded
* Exhibition folders use **semantic slugs**, not IDs
* Storage paths must remain **stable after creation**
* Future years or exhibitions must **not** require schema changes

---

### 3.3 Storage Constraints

* Images are allowed **only** in:

  * `works/`
  * `solo-exhibitions/`
  * `group-exhibitions/`
* One storage object corresponds to one database record
* Storage is not treated as a source of truth; the database is authoritative

---

## 4. Database Domains

The database is responsible for:

1. Image metadata and captions
2. Text-based editorial pages
3. Structured biographical (CV) data
4. Activity logging for admin actions
5. Referential integrity between DB records and storage objects

---

## 5. Artwork & Exhibition Images

### Table: `artworks`

Represents **all images displayed on the site**, including:

* Works
* Solo exhibition images
* Group exhibition images

**One row = one image file in storage**

#### Columns

* `id` — primary key
* `storage_path` — string, required, unique
* `category` — enum-like text:

  * `works`
  * `solo-exhibitions`
  * `group-exhibitions`
* `year` — integer, nullable
  (used for works only)
* `exhibition_slug` — string, nullable
  (used for exhibitions only)
* `caption` — text, required (may be empty)
* `description` — text, nullable
* `display_order` — integer
* `created_at`
* `updated_at`

#### Rules

* Each image must have exactly one `artworks` row
* Ordering must be deterministic within:

  * `(category, year)` for works
  * `(category, exhibition_slug)` for exhibitions
* Storage paths are immutable once referenced

---

## 6. Biography / CV Data (Structured)

Biography data is **structured, editorial, and text-only**.
Each table is independent and ordered.

All bio tables:

* Allow empty states
* Store plain text only
* Support deterministic ordering

---

### 6.1 `bio_solo_exhibitions`

* `id`
* `year`
* `description`
* `display_order`
* `created_at`

---

### 6.2 `bio_group_exhibitions`

* `id`
* `year`
* `description`
* `display_order`
* `created_at`

---

### 6.3 `bio_education`

* `id`
* `year` (text, free-form; e.g. “2018–2022”)
* `description`
* `display_order`
* `created_at`

---

### 6.4 `bio_residency`

* `id`
* `year`
* `description`
* `display_order`
* `created_at`

---

### 6.5 `bio_awards`

* `id`
* `year`
* `description`
* `display_order`
* `created_at`

---

### 6.6 `bio_collections`

* `id`
* `year` (nullable)
* `description`
* `display_order`
* `created_at`

---

## 7. Text Pages

### Table: `texts`

Represents long-form editorial content, including:

* Essays
* Statements
* Writings
* Press texts

#### Columns

* `id`
* `slug` (unique, URL-safe)
* `title`
* `year`
* `body`
* `created_at`
* `updated_at`

#### Notes

* Text content is plain text or markdown
* All records are publicly readable
* No draft or publish state
* Ordering is handled externally or implicitly

---

## 8. Activity Logging

### Table: `activity_log`

Tracks admin actions for accountability and debugging.

#### Columns

* `id`
* `admin_id`
* `action_type` (e.g. create, update, delete)
* `entity_type` (e.g. artwork, text, bio)
* `entity_id`
* `metadata` (JSON)
* `created_at`

#### Rules

* Append-only
* No updates
* No deletes
* Admin-only write access

---

## 9. Access Control & Security

### 9.1 Read Access

Public read access is allowed for:

* Artworks
* Texts
* Biography tables

---

### 9.2 Write Access

Only the authenticated admin may:

* Insert, update, or delete DB records
* Upload, update, or delete storage files
* Create activity log entries

---

### 9.3 Safeguards

* No anonymous writes
* No multi-role system
* Database-level enforcement via RLS
* Storage-level enforcement via Storage Policies
* Storage paths must not be modified after DB reference

---

## 10. Non-Requirements (Explicit)

The system does **not** require:

* Version history
* Drafts or revisions
* Soft deletes
* Search or tagging
* Localization
* Analytics
* Generic CMS abstractions

---

## 11. DBA Responsibilities

The DBA is responsible for:

1. Maintaining schema integrity
2. Enforcing RLS policies
3. Defining storage access policies
4. Preventing invalid or broken content states
5. Ensuring long-term schema stability

---

## 12. Product Intent (Guiding Principles)

* **Structure > flexibility**
* **Editorial control > automation**
* **Predictable data > generalized CMS patterns**
* **Future growth without schema changes**

---

## Final Summary

| Area    | Decision                          |
| ------- | --------------------------------- |
| Media   | Image-based only                  |
| Storage | Semantic folders, no placeholders |
| Bio     | Minimal, structured tables        |
| Texts   | Long-form editorial content       |
| Admin   | Single user                       |
| Logs    | Mandatory, append-only            |