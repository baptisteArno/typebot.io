# AGENTS.md

Typebot is a chatbot platform that provides a visual builder for composing conversational flows from modular blocks (bubbles, inputs, logic, and integrations), a theming system (fonts/colors/CSS), and an embeddable runtime (container/popup/bubble) with a JS library. It includes a results pipeline with analytics and exports, plus developer‑oriented APIs and webhook/HTTP integrations to connect bots to external services.

## Project Structure

- `apps/builder/` - Visual flow editor
- `apps/viewer/` - Runtime that executes bots
- `apps/landing-page/` - Commercial website landing page
- `apps/docs/` - Documentation
- `packages/` - All feature-driven modules, shared libs, schemas, UI package.

## Default Workflow

Follow this workflow unless explicitly instructed otherwise.

1. **Explore the current state**

   - Inspect the existing implementation.
   - Identify relevant files, patterns, and constraints.

2. **Study dependencies and best practices**

   - Inspect dependency source code and documentation using `opensrc` skill.
   - If we are working with some Effect code, make sure to run `bunx effect-solutions list` and read the relevant best practices guide.
   - Use web searches when additional context is helpful.
   - Do not rely on assumptions or prior knowledge. Verify behavior directly in the source.

3. **Clarify uncertainties**

   - Ask questions about unclear requirements, edge cases, or technical decisions.
   - Refine specifications before writing code.
   - When ambiguity exists, this step is mandatory.

4. **Implement**

   - Follow established project conventions.
   - Prefer the smallest change that keeps the design coherent.
   - If the smallest change would introduce or extend inconsistency/tech debt, propose a refactor plan first:
     - What is incoherent today and why the small fix worsens it
     - The refactor scope (files/modules impacted)
     - Migration strategy (incremental steps if possible)
     - Test plan and verification steps
   - After the plan is agreed, implement the refactor.
   - Add or update unit tests when relevant.
   - Unit tests must use the `*.test.ts` suffix.

5. **Verify** (IMPORTANT: never skip this step)

   - Run `bun run check`. It runs typechecking, lint and unit tests.

6. **Review**

   - Re-read the implementation as a reviewer, not the author.
   - Look for:
     - Bugs, edge cases, or incorrect assumptions
     - Type-safety issues or unsound casts
     - Inconsistencies with existing patterns
     - Unnecessary complexity or missed simplifications
   - If issues are found, fix them and re-run verification.

7. **Report**

   - Summarize key decisions made during implementation.
   - Call out any tradeoffs, assumptions, or rejected alternatives.
   - Explicitly mention if:
     - A refactor was chosen over a local fix (and why)
     - Existing behavior was preserved intentionally
     - Open questions or follow-ups remain

## opensrc

To fetch source code for a package or repository you need to understand, run:

```bash
bunx opensrc <package>           # npm package (e.g., bunx opensrc zod)
bunx opensrc pypi:<package>      # Python package (e.g., bunx opensrc pypi:requests)
bunx opensrc crates:<package>    # Rust crate (e.g., bunx opensrc crates:serde)
bunx opensrc <owner>/<repo>      # GitHub repo (e.g., bunx opensrc vercel/ai)
```

Source code for dependencies is then available in `opensrc/`.

## Coding guidelines

- Never use `any` type. Always use proper TypeScript types, interfaces, or union types instead.
- Whenever possible, never use `as`. Instead, use `satisfies` as a last resort to make sure we keep strong type-safety.
- Only add a comment if a piece of logic is hard to grasp.
- Prefer inferring types instead of declaring it.
- No brackets on `if` blocks if it's just 1 line.
- Outside of Effect code, prefer using `env` from `@typebot.io/env` instead of `process.env` directly. This package provides type-safe, validated environment variables.

## Refactors

Deep refactors are allowed when they reduce long-term complexity or restore architectural coherence.

Rules:

- Propose before implementing if the change is cross-cutting or touches core abstractions.
- Keep the refactor goal-oriented (no “cleanup while here”).
- Preserve behavior unless a behavior change is explicitly required.
- Prefer incremental refactors when feasible; otherwise ensure the change remains reviewable.
