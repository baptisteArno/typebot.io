# Repository Guidelines

## Project Structure & Module Organization

This is a Nx monorepo with Bun package manager.

- `apps/builder/` - Visual flow editor (Running on port 3000)
- `apps/viewer/` - Runtime that executes bots (Running on port 3001)
- `apps/landing-page/` - Commercial website landing page
- `apps/workflows/` - Durable workflows server
- `apps/docs/` - Documentation
- `packages/` - All feature-driven modules, shared libs, schemas, UI package.

## Commands

All scripts must be ran with `bunx nx`:

- Typescript project references can be automatically updated with `bunx nx sync`.
- Most of the scripts are inferred with nx plugins. A few examples:
  - typecheck a particular package: `bunx nx typecheck package_name`.
  - test a package: `bunx nx test package_name`
  - typecheck all afffected packages: `bunx nx affected -t typecheck`
- Next.js app (builder, viewer) don't have a typecheck target. Run `bunx nx build <app>`.
- To check format and lint, run: `bunx nx format-and-lint` (with `--fix` to run autofix)
- Never run plain `bunx tsc`, use `bunx nx`

## Coding style

- Write Effect code whenever possible. We use Effect V4 Beta. **IMPORTANT** Always read through `opensrc/repos/github.com/Effect-TS/effect-smol/LLMS.md` and useful linked docs before writing Effect code. Never guess at Effect patterns - check the guide first and follow it religiously.
- Never use `as`. You should always narrow / parse the value to get the right type.
- Rely heavily on type inference, we tend not to declare types.
- Prefer files exporting a single primary function and the file name should match the exported function name. On that file, the main exported function is at the top while local helpers are at the bottom.
- Use very explicit variable names.
- Extract a helper function only if the logic is used at least twice in the main function.
- Declare a variable only if it is used at least twice.

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
