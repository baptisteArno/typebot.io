<!--
GitHub Copilot repository instructions
This file is intentionally concise, explicit, action‑oriented, and optimized for Copilot's custom instructions ingestion.
-->

# GitHub Copilot Repository Instructions

## Purpose

Provide precise constraints so that Copilot suggestions, reviews, commit messages, and PR descriptions stay consistent with our engineering standards.

## Code Generation Guidelines

DO:

- Reuse existing utility / extension functions when present.
- Favor immutable data structures (`val`) and pure functions.
- Include minimal KDoc for public APIs (what + why, not how) — English.
- Provide tests (unit) for new logic: happy path + at least one edge case.

DON'T:

- Introduce commented blocks, dead code, or unexplained magic numbers.
- Bypass existing error handling conventions.
- Change public contracts silently; document breaking changes.

## Error & Logging Conventions

- Prefer structured logging; avoid leaking secrets / PII.
- Elevate only actionable errors; degrade gracefully with meaningful messages.

## Reviews (Portuguese Response Mode)

When asked for a CODE REVIEW:

- Escreva a análise em Portugês (mantendo trechos de código em inglês).
- Estrutura sugerida: Resumo / Pontos Fortes / Riscos / Sugestões / Ações Recomendadas.
- Use lista objetiva; evite jargão desnecessário.

Exact trigger rule: "When performing a code review, respond in Portugês." (keep this literal string for tooling reliance).

## Commit Messages & PRs

- Follow `.github/commit-message.instructions.md`.
- In PR descriptions: WHAT changed, WHY, and any RISK / MIGRATION notes.

## Validation Checklist (Auto‑Mental Pass Before Suggesting)

- [ ] Guidelines loaded
- [ ] Code in English, review (if any) in Portuguese
- [ ] No commented‑out code introduced
- [ ] Tests or rationale for absence
- [ ] Handles null / error paths
- [ ] No unnecessary new dependencies

## Missing Context Handling

If required context is absent, state: "Assumption: <brief>" before proceeding.

## Security & Secrets

- Never hardcode credentials, tokens, or secrets.
- Flag any potential exposure paths.

## Final Note

Prefer clarity, small diffs, and explicit reasoning. If a suggestion could have architectural impact, annotate it with a short rationale section.
