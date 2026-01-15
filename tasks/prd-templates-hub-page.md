# PRD: Templates Hub Page

## Overview

A templates discovery page on the landing site allowing users to browse, search, and filter pre-built Typebot templates. Users can view template details and get redirected to the builder with the template pre-loaded after authentication.

## Goals

- Showcase available templates to prospective and existing users
- Enable discovery via search and category filters
- Drive template adoption and builder sign-ups

## Quality Gates

- `bun run typecheck`
- `bun run format-and-lint:fix`
- `/ui-skills` for UI components
- `/agent-browser` for visual verification

## User Stories

### US-001: Templates listing page structure

**Description:** As a visitor, I want to see a templates hub page at `/templates` with hero, search, filters, and grid.

**Acceptance Criteria:**
- [ ] Route `/templates` in `apps/landing-page/`
- [ ] Hero section with title and subtitle
- [ ] Search bar below hero
- [ ] Left sidebar with filter checkboxes (desktop)
- [ ] Grid of template cards in main content area
- [ ] Footer link "Templates" added under Community section

### US-002: Template data loading

**Description:** As a developer, I want to load templates from existing JSON files in `apps/builder/public/templates/`.

**Acceptance Criteria:**
- [ ] Read template JSON files at build time
- [ ] Extract metadata: name, description, preview image (placeholder if missing)
- [ ] Assign categories based on template content
- [ ] Expose data to templates page

### US-003: Category filters

**Description:** As a visitor, I want to filter templates by use case and features.

**Acceptance Criteria:**
- [ ] Use Case filters: Lead Generation, Customer Support, AI Chat, Quiz & Survey, E-commerce, Lead Magnets, Onboarding, Entertainment
- [ ] Feature filters: AI-powered, Payment integration, File upload
- [ ] Multiple selections allowed within and across groups
- [ ] Grid updates on filter change
- [ ] Collapse to dropdown on mobile

### US-004: Search functionality

**Description:** As a visitor, I want to search templates by any metadata.

**Acceptance Criteria:**
- [ ] Search input filters templates in real-time
- [ ] Matches against title, description, tags, category
- [ ] Combines with active filters
- [ ] Shows "No results" state when empty

### US-005: Template card component

**Description:** As a visitor, I want to see template info at a glance.

**Acceptance Criteria:**
- [ ] Preview image (placeholder if missing)
- [ ] Title
- [ ] Short description (truncated if long)
- [ ] Category/feature tags
- [ ] Clickable, links to detail page `/templates/[filename-slug]`

### US-006: Template detail page

**Description:** As a visitor, I want to view full template details before using it.

**Acceptance Criteria:**
- [ ] Route `/templates/[slug]` where slug = filename without extension
- [ ] Full title and description
- [ ] Author info (default: "Typebot" / official)
- [ ] Preview image (placeholder if missing)
- [ ] "Get template" button

### US-007: Get template flow

**Description:** As a visitor, I want to use a template in the builder.

**Acceptance Criteria:**
- [ ] "Get template" redirects to builder with template identifier in URL
- [ ] If not authenticated, redirect to sign-in/sign-up with return URL preserved
- [ ] After auth, automatically import template into user's workspace
- [ ] No confirmation dialog - direct import on redirect

## Non-Goals

- Template preview/demo mode
- User-submitted templates
- Template ratings or reviews
- Template versioning

## Technical Considerations

- Existing templates in `apps/builder/public/templates/` as JSON
- Template slugs = filenames (e.g., `lead-gen.json` → `/templates/lead-gen`)
- Landing page is separate app, may need to copy/reference template data at build
- Auth redirect flow needs query param preservation through sign-in
- Builder needs endpoint/logic to auto-import template on authenticated return
- Consider static generation for SEO on listing and detail pages

## Open Questions

None remaining.