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
  - typecheck all afffected packages: `bunx nx affected -t typecheck` (**IMPORTANT**: Rely first on IDE's TS server diagnostics first for faster feedback loop)
- To check format and lint, run: `bunx nx format-and-lint` (with `--fix` to run autofix)
- Never run plain `bunx tsc`, use `bunx nx`
- Avoid running multiple Vitest test targets in a single Nx command such as `bunx nx run-many -t test` or `bunx nx affected -t test`. Each Nx test target starts its own Vitest process and its own global setup.
- When multiple Vitest projects need to share the same global setup and database container, run the root workspace test target instead: `bunx nx test`.
- To run one Vitest project through the shared root runner, use `bunx nx test <project-name>`.

## Coding style

- Write Effect code whenever possible. We use Effect V4 Beta. **IMPORTANT** Always read through `opensrc/repos/github.com/Effect-TS/effect-smol/LLMS.md` and useful linked docs before writing Effect code. Never guess at Effect patterns - check the guide first and follow it religiously.
- Never use `as`. You should always narrow / parse the value to get the right type.
- Rely heavily on type inference, we tend not to declare types.
- Prefer files exporting a single primary function and the file name should match the exported function name. On that file, the main exported function is at the top while local helpers are at the bottom.
- Use very explicit variable names.
- Extract a helper function only if the logic is used at least twice in the main function.
- Declare a variable only if it is used at least twice.

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

**IMPORTANT** Do not use `node_modules/` as your primary source for understanding dependency internals. When investigating third-party package behavior, first look in `opensrc/` for the matching dependency and version listed in `opensrc/sources.json`. Use `node_modules/` only when you specifically need the installed runtime/distribution output rather than the original source implementation.

## Workflow

- Use `trash` instead of `rm` when deleting files or directories.
- To navigate to an authenticated session with Playwright, you need to inject cookies from `apps/viewer/src/test/.auth/user.json`.
- Do not pass those stored cookie objects directly to `browserContext.addCookies()`. Remap them to a minimal Playwright shape such as `{ name, value, url: "http://localhost:3000", expires, httpOnly, secure, sameSite }`.
- Prefer `http://localhost:3000` over `127.0.0.1:3000` when reusing that auth file, since the saved session cookies are scoped for `localhost`.
