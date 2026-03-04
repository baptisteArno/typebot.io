---
name: brainstorming
---

# Brainstorming Ideas Into Designs

## Overview

Help turn ideas into fully formed designs and specs through natural collaborative dialogue. **Start from the user's perspective**: map out what the person using the product will see, feel, and do — screen by screen, interaction by interaction. Only once the frontend experience is clear, define the backend that supports it.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Checklist

You MUST complete these in order:

1. **Explore project context** — check files, docs, recent commits
2. **Understand the idea** — ask clarifying questions one at a time about purpose, audience, and success criteria
3. **Map the user journey** — define who the user is, what screens they see, what they interact with, and how the experience flows end to end
4. **Detail the frontend** — for each screen/state, clarify layout, key interactions, edge states (empty, loading, error), and how the user moves forward
5. **Derive the backend** — based on the frontend needs, define what data, APIs, logic, and services are required to power each screen and interaction
6. **Present the full design** — in sections scaled to complexity, get user approval after each section
7. **Write design doc** — save to `specs/YYYY-MM-DD-<topic>.md` and commit

## The Process

### 1. Understanding the Idea

- Check out the current project state first (files, docs, recent commits)
- Ask questions **one at a time** to understand the idea
- Prefer multiple choice questions when possible, open-ended is fine too
- Focus on: **Who is this for? What problem does it solve? What does success look like?**

### 2. Mapping the User Journey

This is the heart of the process. Before any architecture or backend discussion, get crystal clear on the experience.

**Start with the user:**

- Who is the primary user? (role, context, mindset)
- What triggers them to use this? (entry point, motivation)
- What's the happy path from start to finish?

**Walk through it screen by screen:**

- What does the user see first? (initial state, empty state)
- What can they do? (primary actions, secondary actions)
- What happens when they do it? (feedback, transitions, next screen)
- Where can things go wrong? (error states, dead ends, confusion points)
- How do they know they've succeeded? (confirmation, result)

**Ask about each screen/step one at a time.** Use questions like:

- "So the user lands on this page — what's the first thing they should see?"
- "They tap Submit — what happens next? What do they see while it's loading?"
- "What if there's no data yet? What does the empty state look like?"
- "Is there anything on this screen that could confuse someone using it for the first time?"

**Capture the journey as a sequence:**

- Screen/state name → what the user sees → what they can do → where they go next
- Note transitions, loading states, and error handling at each step

### 3. Detailing the Frontend

Once the journey is mapped, go deeper on each screen:

- **Layout & hierarchy**: What's most prominent? What's secondary?
- **Key interactions**: Clicks, inputs, gestures, real-time updates
- **States**: Empty, loading, populated, error, disabled, success
- **Responsiveness**: Does this need to work on mobile? Different viewports?
- **Accessibility**: Any considerations for the audience?

Present 2-3 approaches for any screen or interaction where there's a meaningful design choice (e.g., wizard vs. single page form, list vs. card grid, modal vs. inline editing). Lead with your recommendation.

### 4. Deriving the Backend

Now — and only now — define what the backend needs to do to support the frontend:

- **For each screen**: What data does it need? Where does that data come from?
- **For each interaction**: What API call does it trigger? What validation is needed? What's the response?
- **Data model**: What entities exist? What are their relationships? (Derived from what the UI displays and manipulates)
- **Edge cases**: What happens on the backend when the frontend hits an error state?
- **Auth & permissions**: Who can see/do what? (Derived from the user roles identified in the journey)
- **Performance**: Are there screens that need real-time data, caching, or pagination?

The principle: **every backend decision should trace back to a frontend need.** If you can't point to a screen or interaction that requires it, question whether it's needed (YAGNI).

### 5. Presenting the Design

- Present section by section, scaled to complexity
- Ask after each section whether it looks right so far
- **Order of presentation**:
  1. User journey overview (the end-to-end flow in plain language)
  2. Screen-by-screen frontend detail
  3. Backend architecture that supports it
  4. Error handling, edge cases, and open questions
- Be ready to go back and revise earlier sections if later ones surface issues

### 6. Exploring Alternatives

When presenting approaches at any stage:

- Propose 2-3 options with trade-offs
- Lead with your recommendation and explain why
- Frame trade-offs in terms of **user experience impact**, not just technical cost
  - e.g., "Option A is simpler to build but means the user has to refresh to see updates" vs. "Option B adds WebSocket complexity but the user sees changes in real time"

## After the Design

**Documentation:**

- Write the validated design to `specs/YYYY-MM-DD-<topic>.md`
- Structure the doc as: User Journey → Frontend Detail → Backend Detail

## Key Principles

- **UX first, infrastructure second** — Always start from what the user sees and does
- **One question at a time** — Don't overwhelm with multiple questions
- **Screen by screen** — Walk through the experience concretely, not abstractly
- **Every backend decision traces to a frontend need** — If it doesn't serve a screen or interaction, question it
- **YAGNI ruthlessly** — Remove unnecessary features from all designs
- **Explore alternatives** — Propose 2-3 approaches before settling, frame trade-offs in UX terms
- **Incremental validation** — Present design in sections, get approval before moving on
- **Be flexible** — Go back and clarify when something doesn't make sense
