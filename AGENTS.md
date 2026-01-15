# Typebot Agent Guidelines

## Project Structure & Module Organization

- `apps/builder` hosts product surfaces like the builder, viewer, docs, and landing page (e.g., `apps/builder`, `apps/viewer`).
- `packages/` contains shared libraries, blocks, embeds, and tooling (`packages/ui`, `packages/lib`, `packages/blocks/*`, `packages/embeds/*`).

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

## Environment Variables

- Always use `env` from `@typebot.io/env` instead of `process.env` directly.
- This package provides type-safe, validated environment variables.
- Example: `env.NODE_ENV` instead of `process.env.NODE_ENV`.

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

<!-- effect-solutions:start -->

## Effect Best Practices

**Before implementing Effect features**, run `bunx effect-solutions list` and read the relevant guide.

Topics include: services and layers, data modeling, error handling, configuration, testing, HTTP clients, CLIs, observability, and project structure.

<!-- effect-solutions:end -->

## Philosophy

This codebase will outlive you. Every shortcut becomes someone else's burden. Patterns you establish will be copied.
Corners you cut will be cut again.

Fight entropy. Leave the codebase better than you found it.
