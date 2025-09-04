# Commit Message Instructions (Copilot Optimized)

Consistent, compact, searchable history. Use EXACT subject pattern:

<type><scope?>: <imperative, lowercase summary>

Where:
- type: emoji keyword indicating change nature
- scope (optional): area in parentheses (e.g. `(api)`, `(infra)`, `(consumer)`)
- summary: imperative, <= 50 chars, no trailing period

## Allowed Types (Emoji Prefix)
- :sparkles: feature / enhancement
- :bug: bug fix
- :wrench: config / build / infra tweak
- :zap: performance improvement
- :recycle: refactor (no behavior change)
- :white_check_mark: tests
- :books: docs
- :rocket: deployment / release workflow
- :lock: security related
- :fire: remove code / deps

## Subject Line Rules (MUST)
1. Lowercase first word; no leading emoji text beyond type.
2. Imperative mood ("add", "fix", "remove").
3. Max 50 chars (hard limit — rewrite if longer).
4. No period at end.
5. Avoid vague verbs ("change", "update") — be specific.

## Body (Optional)
Include only if context is needed.
- Separate from subject by one blank line.
- Wrap at ~72 chars.
- Explain WHAT and WHY (omit HOW unless non‑obvious risk/constraint).
- If breaking change: start body with `BREAKING:` and describe migration.

## Footer (Optional)
- Issue refs: `Closes #123`, `Refs #456` (each on its own line).
- Co-authors: `Co-authored-by: Name <email>`.

## Language
- Commit messages: English only.
- (Reminder) Code reviews (not commits) must respond in Portuguese per repository Copilot instructions.

## Checklist Before Commit
[] Correct type
[] Scope (if helpful)
[] Imperative, concise summary <= 50 chars
[] No trailing period
[] Body only if it adds necessary context
[] Issues referenced if applicable

## Examples (Good)
:sparkles: add user authentication module
:bug:(api) fix crash on logout when token expires
:zap(db) reduce allocations in batch writer
:recycle(core) extract retry policy abstraction
:fire: remove deprecated v1 webhook handlers

## Anti-Patterns (Avoid)
"update stuff" -> too vague
"Fixing issue with X." -> capitalized + trailing period
":sparkles: Added new feature" -> capitalized + past tense
":bug: fix a bug in consumer when message is null" (>50 chars; rewrite)

## Rewrite Examples
Bad: ":bug: fix a bug in consumer when message is null"
Good: ":bug:(consumer) handle null message"

Bad: ":wrench: update config"
Good: ":wrench(infra) raise rds connection timeout"

Follow this file exactly; if constraints clash, prioritize: (1) clarity, (2) brevity, (3) consistency.
