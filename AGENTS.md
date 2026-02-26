# Repository Guidelines

## Project Structure & Module Organization

This is a Nx monorepo with Bun package manager.

- `apps/builder/` - Visual flow editor
- `apps/viewer/` - Runtime that executes bots
- `apps/landing-page/` - Commercial website landing page
- `apps/workflows/` - Durable workflows server
- `apps/docs/` - Documentation
- `packages/` - All feature-driven modules, shared libs, schemas, UI package.

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
