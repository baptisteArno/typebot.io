
---
name: commit
description: Reviews the current git changes and creates a commit with an emoji-prefixed message that matches the dominant type of work. Also covers pull-request titles and descriptions, which follow the same emoji convention.
allowed-tools: Bash(git:*), Bash(gh:*)
---

# Commit & PR Conventions

Use this skill whenever the user asks to commit current worktree changes, or to create / edit a pull request. Commits and PR titles share the same emoji convention; PR descriptions follow the structure documented below.

## Commit Workflow

1. Inspect the worktree before committing:
   - `git status --short`
   - `git diff --staged`
   - `git diff`
   - `git log --oneline -5`
2. Review all staged and unstaged changes that will be part of the commit.
3. Stage the relevant files, but never include likely secrets such as `.env` files or credential dumps.
4. Write a concise commit message in the repository's usual style.
5. Prefix the message with the single emoji that best matches the dominant change (see Emoji Mapping).
6. Create the commit and confirm success with `git status --short`.

If there is nothing to commit, say so instead of creating an empty commit.

## Emoji Mapping

Commit messages **and PR titles** must be prefixed with exactly one of:

- `🐛` Fix a bug
- `✨` New user-facing feature. Use this only for a meaningful feature users would actively want to try. Use it sparingly. If the change is incremental rather than substantial, prefer `👌`. **Only when there is a frontend change.**
- `👌` New user-facing addition to an existing feature, such as a new option or small capability. **Only when there is a frontend change.**
- `🔧` New internal implementation. When the change is mostly internal and not directly noticeable by end users.
- `♻️` Refactoring. When behavior stays effectively the same and the main goal is code cleanup or restructuring.
- `💅` UI or UX update. When the main value is visual polish, interaction quality, or layout improvements.
- `📝` Blog or documentation update.

Prefer the most user-visible category when a commit spans multiple areas.

## Commit Message Format

```text
<emoji> <imperative summary>
```

Keep it short, specific, and focused on why the change matters.

Examples:

- `🔧 Add logs to debug WA status forward`
- `💅 Make group title hitbox fit text`
- `✨ Add prompt and new models to OpenAI transcription`
- `🐛 Fix webhook listening not working`
- `♻️ Migrate builder from tRPC to oRPC`

## Pull Request Titles

PR titles follow the **exact same rules** as commit messages: one leading emoji from the mapping above, then a short imperative summary. Reuse the title of the dominant commit when the branch has one main commit; otherwise pick the emoji that matches the most user-visible change across the branch.

Do **not** add issue numbers or `(#1234)` suffixes manually — GitHub appends the PR number on its own.

## Pull Request Descriptions

Keep PR bodies short and useful. Default structure:

```markdown
## Summary

<1–3 bullets describing what changed and why, in plain English.>

## Test plan

- [ ] <Concrete checklist item the reviewer can tick off>
- [ ] <Another verification step>
```

Guidelines:

- The summary is for humans skimming the merge queue — lead with the user-facing impact, not the implementation detail.
- The test plan lists how the change was (or should be) validated: commands run, manual flows exercised, edge cases checked. Skip it only for pure docs / blog PRs.
- Omit boilerplate sections (Screenshots, Risks, Rollback…) unless they add information. No empty headings.
- Do not include AI assistant footers, "Generated with …" lines, or `Co-Authored-By` trailers on PR descriptions.

## When NOT to Use This Skill

- Cosmetic git operations that don't create a commit (e.g. `git status`, `git stash`).
- Amending an existing commit's metadata only.
- Operations on remotes (push, fetch) outside of the commit / PR creation flow.
