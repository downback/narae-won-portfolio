# Product Requirements Document (PRD)

**Project:** Artist Portfolio Website with Admin Content Management
**Owner:** Product
**Stakeholders:** Artist (Client), Developer, Tech Lead, Designer, DBA
**Status:** Planning

---

## 1. Product Overview

### Purpose

This project enhances an existing artist portfolio website by introducing an **admin interface** that allows the artist (non-technical user) to independently manage key site content without developer involvement. The public-facing site must preserve the existing visual identity, layout, and behavior while modernizing the implementation for maintainability and scalability.

### Background

The current website is built using vanilla HTML, CSS, and JavaScript. Content updates (hero image, portfolio PDF, bio text) currently require developer intervention. These updates occur frequently and are time-sensitive (e.g., exhibitions, portfolio updates).

### Problem Statement

- The artist cannot update portfolio or bio content independently.
- Content updates are costly and slow due to developer dependency.
- Existing architecture does not support structured content management.

### Value Proposition

- Empowers the artist to manage their own content safely.
- Preserves the existing aesthetic and user experience.
- Introduces a maintainable system without adopting a full CMS.
- Supports responsive viewing across all device sizes.

---

## 2. Goals & Non-Goals

### Goals

- Enable non-technical admin users to manage site content.
- Maintain design consistency with the existing website.
- Ensure responsive design across mobile, tablet, and desktop.
- Keep the system simple to operate and maintain.

### Non-Goals

- This is **not** a general-purpose CMS.
- No content versioning, publishing workflows, or role hierarchies beyond admin.
- No redesign or rebranding of the website.
- No admin management for the contact page.

---

## 3. Target Users

### 1) Artist (Admin User)

The artist needs a minimal, intuitive interface to update images, PDFs, and text content. They value simplicity, clarity, and confidence that updates will not break the site.

### 2) Website Visitors

Visitors include curators, galleries, collectors, and the general public. They expect fast loading, readable layouts, and consistent behavior across devices.

### 3) Internal Team (Developer / Maintainers)

The internal team requires a clean separation between content and presentation, minimal operational overhead, and predictable data structures.

---

## 4. User Experience & Responsive Design Requirements

### Responsive Design (Mandatory)

- All public pages must be fully usable on:

  - Mobile (≥ 320px width)
  - Tablet
  - Desktop

- Layouts should adapt without horizontal scrolling.
- Navigation must remain accessible on all screen sizes.
- PDF viewing experience must remain functional on mobile devices.

**Design Responsibility:**
The Designer is responsible for defining responsive behavior, breakpoints, and layout adjustments while maintaining the original visual language.

---

## 5. User Flows

### Public Visitor Flow

1. Visitor lands on **Home**
2. Sees navigation bar and animated hero image
3. Navigates to:

   - **Works** → views embedded PDF portfolio
   - **Bio** → reads structured biographical information
   - **Contact** → sees static contact information

### Admin Flow

1. Admin navigates to `/admin`
2. Authenticates via email login through supabase auth
3. Lands on **Admin Dashboard**
4. Selects content area in tabs layout to manage:
   - Home Hero Image
   - Works PDF
   - Bio Content
5. Makes updates and saves changes
6. Changes are reflected immediately on the public site

---

## 6. Functional Requirements

### FR1 — Public Website Pages

**Description:**
The system must support four public pages: Home, Works, Bio, and Contact. Content for Home, Works, and Bio must be dynamically driven by managed content.

- **Priority:** High
- **Complexity:** Moderate

---

### FR2 — Admin Authentication

**Description:**
The system must provide a secure login mechanism for admin access. Only authenticated users may access admin pages.

- **Priority:** High
- **Complexity:** Moderate

---

### FR3 — Admin Dashboard

**Description:**
Provide a simple dashboard that clearly presents editable content sections and their last update time.

- **Priority:** High
- **Complexity:** Easy

---

### FR4 — Home Hero Media Management

**Description:**
Admin must be able to upload and replace the hero image or animated media displayed on the homepage.

**Constraints:**

- Media replacement should not require code changes.

- System must prevent unsupported file types.

- **Priority:** High

- **Complexity:** Moderate

---

### FR5 — Works PDF Management

**Description:**
Admin must be able to upload and replace the portfolio PDF displayed on the Works page.

**Constraints:**

- Only PDF format is supported.

- PDF must be viewable on mobile and desktop.

- **Priority:** High

- **Complexity:** Moderate

---

### FR6 — Bio Content Management

**Description:**
Admin must be able to edit biographical content including:

- Introductory text
- Artist statement
- Structured lists (e.g., exhibitions, education)

Content must be structured to ensure consistent presentation.

- **Priority:** High
- **Complexity:** Moderate

---

### FR7 — Data Integrity & Safety

**Description:**
The system must prevent incomplete or invalid content states (e.g., deleting hero image without replacement).

- **Priority:** High
- **Complexity:** Moderate

---

### FR8 — Admin Usability & Feedback

**Description:**
Admin actions must provide clear success/error feedback (e.g., “Upload successful”).

- **Priority:** Medium
- **Complexity:** Easy

---

## 7. Data & Storage Requirements (Non-Implementation)

> This section defines **what data is needed**, not how it is implemented.

### Content Data

- Hero media reference
- Portfolio PDF reference
- Bio text and structured sections
- Timestamps for last update

### Storage Requirements

- Support for binary file storage (images, PDFs)
- Support for structured text content
- Ability to restrict write access to authenticated admin users

**DBA Responsibility:**
Design schemas, constraints, and access policies that support the above requirements while ensuring data safety and maintainability.

---

## 8. Roles & Responsibilities

### Product (PM)

- Define scope, priorities, and success criteria
- Ensure alignment with client goals

### Designer

- Preserve visual identity of existing site
- Define responsive behavior and layouts
- Design admin UI for clarity and simplicity

### Tech Lead

- Choose implementation approach consistent with requirements
- Ensure maintainability, performance, and security
- Plan integration of auth, storage, and content rendering

### DBA

- Design data models and access controls
- Ensure data integrity and secure content updates
- Plan backup and recovery strategy

---

## 9. Success Metrics

- Admin can update hero image, PDF, and bio without developer help
- Content updates appear correctly on all device sizes
- No regression in public site usability or performance
- Zero production incidents caused by content updates
