# Repository Guidelines

## Project Structure & Module Organization

This is a Turborepo monorepo with Bun package manager.

- `apps/builder/` - Visual flow editor
- `apps/viewer/` - Runtime that executes bots
- `apps/landing-page/` - Commercial website landing page
- `apps/workflows/` - Durable workflows server
- `apps/docs/` - Documentation
- `packages/` - All feature-driven modules, shared libs, schemas, UI package.

## Commands

We use Turborepo to run tasks across workspaces with caching and dependency-aware ordering. For example:

- Run `bunx turbo run check-types` to run type checking on all packages
- Run `bunx turbo run check-types --filter=builder` to run type checking on builder package only.

There are global scripts defined on root `package.json`:

- `bun format-and-lint` runs code format and lint
- `bun lint-repo` runs repo packages lint
- Both have `*:fix` alternative that runs the commands with autofix.
- `bun check` is a convenient helper to run type checking, format, lint (+ auto fix)

IMPORTANT: Never run `dev` script, assume dev server are already running locally.

## Coding style

- Write Effect code whenever possible. Check effect-best-practices before implementing Effect code.
- Rely heavily on type inference, we tend not to declare types.
- Prefer files exporting a single primary function and the file name should match the exported function name. On that file, the main exported function is at the top while local helpers are at the bottom.
- Use very explicit variable names.
- Extract a helper function only if the logic is used at least twice in the main function.
- Declare a variable only if it is used at least twice.

## Workflow

- Be eager on web searches and `opensrc` use.
- We recommend you always run `bun check` to verify your work.

## opensrc

You have access to any package, CLI and Github repo source code using `opensrc` skill.

To fetch source code for a package or repository you need to understand, run:

```bash
bunx opensrc <package>           # npm package (e.g., bunx opensrc zod)
bunx opensrc pypi:<package>      # Python package (e.g., bunx opensrc pypi:requests)
bunx opensrc crates:<package>    # Rust crate (e.g., bunx opensrc crates:serde)
bunx opensrc <owner>/<repo>      # GitHub repo (e.g., bunx opensrc vercel/ai)
```

Source code for dependencies is then available in `opensrc/`.
