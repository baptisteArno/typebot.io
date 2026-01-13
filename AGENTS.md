# Repository Guidelines

## Project Structure & Module Organization

- `apps/builder` hosts product surfaces like the builder, viewer, docs, and landing page (e.g., `apps/builder`, `apps/viewer`).
- `packages/` contains shared libraries, blocks, embeds, and tooling (`packages/ui`, `packages/lib`, `packages/blocks/*`, `packages/embeds/*`).
- `.context/` contains git subtrees for context of how to use specific libraries.

<!-- opensrc:start -->

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
npx opensrc <package>           # npm package (e.g., npx opensrc zod)
npx opensrc pypi:<package>      # Python package (e.g., npx opensrc pypi:requests)
npx opensrc crates:<package>    # Rust crate (e.g., npx opensrc crates:serde)
npx opensrc <owner>/<repo>      # GitHub repo (e.g., npx opensrc vercel/ai)
```

<!-- opensrc:end -->

## Library Documentation (.context/)

**IMPORTANT**: Always check the `.context/` directory for library-specific documentation and example code before implementing features with these libraries.

Available library contexts:

- `.context/orpc/` - oRPC Typesafe APIs library documentation and examples

When working with oRPC refer to these directories for best practices, API usage, and implementation patterns.

## Build, Test, and Development Commands

- `bun install`: install workspace dependencies (Bun is the package manager).
- `bun run typecheck`: typecheck apps (builder, viewer, landing-page, docs).
- `bun run format-and-lint:fix`: run Biome checks across the repo and apply auto-fixes.

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
