---
name: commit
description: Use when preparing, reviewing, or suggesting git commit messages or pull request titles, or before creating a commit.
---

# Commit and PR title conventions

Commit messages and PR titles must be prefixed with exactly one emoji that describes the primary intent of the change.

Prefer the most user-visible category when a commit spans multiple areas.

## Emoji prefixes

- `🐛` Fix a bug.
- `✨` New user-facing feature. Use this only for a meaningful feature users would actively want to try. Use it sparingly. If the change is incremental rather than substantial, prefer `👌`. Use only when there is a frontend change.
- `👌` New user-facing addition to an existing feature, such as a new option or small capability. Use only when there is a frontend change.
- `🔧` New internal implementation. Use when the change is mostly internal and not directly noticeable by end users.
- `♻️` Refactoring. Use when behavior stays effectively the same and the main goal is code cleanup or restructuring.
- `💅` UI or UX update. Use when the main value is visual polish, interaction quality, or layout improvements.
- `📝` Blog or documentation update.

## Before committing

Always check the diff and remove debug logs, temporary files, commented-out experiments, and other temporary artifacts before creating a commit.

## After opening a PR

Never amend commits that are already part of an opened PR. Push follow-up fixes as new commits so review history and existing comments remain stable.

## Format

Use a concise imperative or descriptive title after the emoji:

```text
🐛 Fix workspace invite redirect
🔧 Add billing sync worker
♻️ Simplify block schema helpers
```
