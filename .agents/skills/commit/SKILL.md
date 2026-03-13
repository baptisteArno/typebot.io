---
name: commit
description: Reviews the current git changes and creates a commit with an emoji-prefixed message that matches the dominant type of work.
allowed-tools: Bash(git:*)
---

# Commit Current Changes

Use this skill when the user asks to commit the current worktree changes.

## Workflow

1. Inspect the worktree before committing:
   - `git status --short`
   - `git diff --staged`
   - `git diff`
   - `git log --oneline -5`
2. Review all staged and unstaged changes that will be part of the commit.
3. Stage the relevant files, but never include likely secrets such as `.env` files or credential dumps.
4. Write a concise commit message in the repository's usual style.
5. Prefix the message with the single emoji that best matches the dominant change.
6. Create the commit and confirm success with `git status --short`.

If there is nothing to commit, say so instead of creating an empty commit.

## Emoji Mapping

- `🐛` Fix a bug
- `✨` New user-facing feature. Use this only for a meaningful feature users would actively want to try.
- `👌` New user-facing addition to an existing feature, such as a new option or small capability.
- `🔧` New internal implementation
- `♻️` Refactoring
- `💅` UI or UX update
- `📝` Blog or documentation update

## Choosing the Prefix

- Prefer the most user-visible category when a commit spans multiple areas.
- Use `✨` sparingly. If the change is incremental rather than substantial, prefer `👌`.
- Use `💅` when the main value is visual polish, interaction quality, or layout improvements.
- Use `🔧` when the change is mostly internal and not directly noticeable by end users.
- Use `♻️` when behavior stays effectively the same and the main goal is code cleanup or restructuring.

## Message Format

Write the message as:

```text
<emoji> <imperative summary>
```

Keep it short, specific, and focused on why the change matters.

Examples:

- `🔧 Add logs to debug WA status forward`
- `💅 Make group title hitbox fit text`
- `✨ Add prompt and new models to OpenAI transcription`
