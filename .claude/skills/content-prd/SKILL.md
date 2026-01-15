---
name: content-prd
description: "Generate a Content Requirements Document for blog posts, docs, and marketing pages. Creates structured briefs with user stories optimized for AI agent execution. Triggers on: create content prd, write content for, plan this article, content brief for, spec out content."
---

# Content PRD Generator

## The Job

1. Ask 3-5 clarifying questions (one set at a time, adapt based on answers)
2. Generate structured PRD wrapped in `[PRD]...[/PRD]` markers
3. Do NOT write the content - just create the PRD

## Typebot Content Style

**Tone:** Professional, accessible, educational. Direct language, practical value, no fluff or keyword stuffing.

**Structure:** Short paragraphs, bold key takeaways, bullet lists, comparison tables, internal links.

**MDX Components:**
- `<Image src="" alt="" caption="" />`, `<Info>`, `<Success>`, `<Warning>`
- `<Typebot typebot="" />`, `<Youtube id="" />`, `<Cta />`, `<Table>`

**Frontmatter:**
```yaml
---
title: "Article Title"
description: "Meta description (150-160 chars)"
postedAt: "YYYY-MM-DD"
author: baptiste
cover: "/blog-assets/[slug]/featured-image-[slug].avif"
---
```

## Clarifying Questions

Explore these areas through conversation:
- **Content Type:** Blog post, docs, or marketing page?
- **Target Reader:** Who is this for? What do they already know?
- **Core Question:** What specific question does this answer?
- **Unique Angle:** What makes this valuable vs existing content?
- **Scope:** What to cover vs leave out?

## PRD Structure

### 1. Overview
Brief description and the reader question it answers.

### 2. Goals
What readers should learn, what action to take, SEO intent.

### 3. Quality Gates (fixed for all content)
```markdown
- Readability: Grade 8 or below
- Paragraphs: Max 3-4 sentences
- Scannability: Bold key takeaways, use lists
- No SEO hacks, no filler
```

### 4. User Stories
```markdown
### US-001: [Section Title]
**Description:** As a [reader], I want to understand [topic] so that [benefit].

**Acceptance Criteria:**
- [ ] Specific criterion
- [ ] Word count: ~XXX words
- [ ] Includes: [specific elements]
```
Each story = one section. Include word counts. Do NOT repeat quality gates in stories.

### 5. Content Requirements
Specific elements: `CR-1: Include table of X vs Y`, `CR-2: Link to [article]`, `CR-3: Embed Typebot showing [feature]`

### 6. Non-Goals
What this will NOT cover.

### 7. SEO & Meta
Target keyword, meta description, title variations, internal links.

### 8. Technical Requirements
- File: `apps/landing-page/content/blog/[slug].mdx`
- Assets: `public/blog-assets/[slug]/`
- Required images and MDX components

### 9. Success Metrics
Word count target, readability target, key points covered.

### 10. Open Questions
Remaining questions needing clarification.

## Example

**User:** Create a PRD for an article about chatbot ROI

**Assistant:** A few questions:
1. Blog post, docs, or marketing page?
2. Who's the reader and what's their situation?
3. What's the one question this should answer?

**User:** Blog post. Business owners wondering if chatbots are worth it.

**Assistant:** A few more:
1. Angle - theoretical benefits, case studies with numbers, or ROI calculation guide?
2. Embed Typebot examples?

**User:** Case studies with real numbers. Yes to examples.

**Assistant:**

[PRD]
# Content PRD: Chatbot ROI

## Overview
Blog post answering "Is a chatbot worth the investment?" with case studies and real numbers.

## Goals
- Help business owners understand ROI potential
- Provide concrete numbers and calculations
- Rank for "chatbot ROI"

## Quality Gates
- Readability: Grade 8 or below
- Paragraphs: Max 3-4 sentences
- Bold key takeaways, use lists

## User Stories

### US-001: Introduction
**Description:** As a business owner, I want to understand why chatbot ROI matters.
**Acceptance Criteria:**
- [ ] Hook with relatable pain point
- [ ] Preview article contents
- [ ] Word count: ~150 words

### US-002: Case Study
**Description:** As a business owner, I want real examples with numbers.
**Acceptance Criteria:**
- [ ] Before/after metrics
- [ ] ROI percentage calculation
- [ ] Embed Typebot example
- [ ] Word count: ~350 words

## Content Requirements
- CR-1: Comparison table of chatbot vs human support costs
- CR-2: Link to pricing page
- CR-3: Embed lead capture Typebot example

## Non-Goals
- Technical implementation guide
- Platform comparisons

## SEO & Meta
- Keyword: "chatbot ROI"
- Meta: "Is a chatbot worth the investment? See real ROI numbers and a simple calculation framework."

## Technical Requirements
- File: `apps/landing-page/content/blog/chatbot-roi.mdx`
- Assets: `public/blog-assets/chatbot-roi/`
- Components: `<Cta />`, `<Info>`, `<Typebot />`, `<Table>`

## Success Metrics
- ~1,800 words, Grade 8 readability

## Open Questions
- Specific customer case study available?
[/PRD]
