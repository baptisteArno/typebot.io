---
name: product-prd
description: "Generate a Product Requirements Document (PRD) for feature development. Creates PRDs with user stories optimized for AI agent execution."
---

# Product PRD Generator

1. Ask open-ended clarifying questions
2. Ask follow-ups if needed
3. Generate PRD wrapped in `[PRD]...[/PRD]`

**Do NOT implement. Just create the PRD.**

---

## PRD Structure

```markdown
# PRD: Feature Name

## Overview

Brief description of the feature and problem it solves.

## Goals

- What should users be able to do?
- What business/technical outcome?

## Quality Gates

These checks must pass for every user story:

- `bun run typecheck`
- `bun run format-and-lint:fix`

For UI work:

- Use `/ui-skills` constraints
- Verify with `/agent-browser`

For testing:

- Unit tests only for critical/complex functions
- E2E tests only for critical viewer flows

## User Stories

### US-001: [Title]

**Description:** As a [user], I want [feature] so that [benefit].

**Acceptance Criteria:**

- [ ] Verifiable criterion
- [ ] Include file paths if known

## Non-Goals

What this will NOT include.

## Technical Considerations

Constraints, existing patterns, integration points.

## Open Questions

Remaining uncertainties.
```

---

## Example

**User:** Create a PRD for adding a delay block

**Assistant:** A few questions:

1. What's the use case?
2. Should duration be configurable?
3. Where should it appear in the builder?

**User:** Pacing conversations. Yes configurable. Under logic blocks.

**Assistant:** A couple more:

1. Duration range - seconds only or also minutes?
2. Visual feedback during delay?

**User:** Seconds and minutes. Yes, typing indicator.

**Assistant:**

[PRD]

# PRD: Delay Block

## Overview

Configurable pause block for natural conversation pacing with typing indicator.

## Goals

- Add natural pauses in conversations
- Configurable duration (1s to 5min)
- Show typing indicator during delay

## Quality Gates

- `bun run typecheck`
- `bun run format-and-lint:fix`
- `/ui-skills` for UI, `/agent-browser` for verification
- Unit tests for critical functions, E2E for critical viewer flows

## User Stories

### US-001: Delay block schema

**Description:** As a developer, I want to define the delay block schema.

**Acceptance Criteria:**

- [ ] Schema in `packages/blocks/delay/`
- [ ] Options: duration, unit (seconds/minutes)
- [ ] Validation: 1s-5min range

### US-002: Builder integration

**Description:** As a creator, I want to add delay blocks from logic category.

**Acceptance Criteria:**

- [ ] Block in logic sidebar
- [ ] Settings panel with duration/unit inputs
- [ ] Verify with `/agent-browser`

### US-003: Viewer execution

**Description:** As a user, I want delays to pause naturally with typing indicator.

**Acceptance Criteria:**

- [ ] Pause for configured duration
- [ ] Show typing indicator
- [ ] E2E test for delay execution

## Non-Goals

- Custom animations
- Variable-based delays
- Delays > 5 minutes

## Open Questions

- Should delay be skippable?
  [/PRD]
