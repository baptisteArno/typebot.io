# Repository Guidelines

## Project Structure & Module Organization

- `apps/` hosts product surfaces like the builder, viewer, docs, and landing page (e.g., `apps/builder`, `apps/viewer`).
- `packages/` contains shared libraries, blocks, embeds, and tooling (`packages/ui`, `packages/lib`, `packages/blocks/*`, `packages/embeds/*`).
- `scripts/` is for repository-wide maintenance scripts.
- Tests live alongside code in `*.test.ts` and under app-specific fixtures (e.g., `apps/viewer/src/test`).

## Build, Test, and Development Commands

- `bun install`: install workspace dependencies (Bun is the package manager).
- `bun run dev`: start local dev for builder/viewer/partykit via Turborepo.
- `bun run build`: typecheck and build selected apps (builder, viewer, landing-page, docs).
- `bun run format-and-lint`: run Biome checks across the repo.
- `bun run format-and-lint:fix`: apply Biome auto-fixes.
- `bun run lint-repo`: validate workspace dependency ordering.

## Coding Style & Naming Conventions

- Primary languages are TypeScript/TSX; follow existing patterns in each package/app.
- Formatting and linting are enforced by Biome (`biome.json`); use spaces and let Biome format.
- Use PascalCase for React components and camelCase for variables/functions, mirroring existing code.
- Never use `any` type. Always use proper TypeScript types, interfaces, or union types instead.
- Whenever possible, never use `as`. Instead, use `satisfies` as of last resort to make sure we keep strong type-safety.
- Prefer writing long and complex functions that provide good, deep abstraction.
- IMPORTANT: Only add a comment if a piece of logic is hard to grasp.
- Prefer infer the return type of a function instead of declaring it.
- Helper functions should be placed at the bottom of the file.
- No brackets on if blocks if it's just 1 line.

## Testing Guidelines

- Unit tests run with Bun: `bun test` within a package (e.g., `apps/builder`, `packages/lib`).
- Unit tests use the `*.test.ts` suffix.
- E2E tests are only written for the viewer and use the `*.spec.ts` suffix; run them with `bun run test:e2e` in `apps/viewer`.

## Commit & Pull Request Guidelines

- Use emoji-prefixed, imperative commit messages with this convention:
  - ✨ New product feature (product-facing only)
  - 💅 UI/UX improvement
  - 📚 Content (blog posts, docs)
  - ♻️ Refactoring
  - 🐛 Bug fix
  - ✏️ Typo
  - 🔧 Internal changes (not user facing)
- PRs should include a clear description, reproduction steps if fixing a bug, and screenshots/GIFs for UI changes.
- Link related issues when applicable.

## Environment Variables

- Always use `env` from `@typebot.io/env` instead of `process.env` directly.
- This package provides type-safe, validated environment variables.
- Example: `env.NODE_ENV` instead of `process.env.NODE_ENV`.

## Configuration & Security Notes

- Environment variables are loaded with `dotenv` in several scripts; keep `.env` values out of commits.
- See `SECURITY.md` for reporting vulnerabilities and security expectations.
