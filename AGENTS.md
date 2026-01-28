# AGENTS.md

Typebot is a chatbot platform that provides a visual builder for composing conversational flows from modular blocks (bubbles, inputs, logic, and integrations), a theming system (fonts/colors/CSS), and an embeddable runtime (container/popup/bubble) with a JS library. It includes a results pipeline with analytics and exports, plus developer‑oriented APIs and webhook/HTTP integrations to connect bots to external services.

## Project Structure

- `apps/builder/` - Visual flow editor
- `apps/viewer/` - Runtime that executes bots
- `apps/landing-page/` - Commercial website landing page
- `apps/workflows/` - Durable workflows server
- `apps/docs/` - Documentation
- `packages/` - All feature-driven modules, shared libs, schemas, UI package.

## opensrc

Never check node_modules. You have access to any package, CLI and Github repo source code and documentation using `opensrc` skill. Always prefer using `opensrc` instead of web search if possible.

To fetch source code for a package or repository you need to understand, run:

```bash
bunx opensrc <package>           # npm package (e.g., bunx opensrc zod)
bunx opensrc pypi:<package>      # Python package (e.g., bunx opensrc pypi:requests)
bunx opensrc crates:<package>    # Rust crate (e.g., bunx opensrc crates:serde)
bunx opensrc <owner>/<repo>      # GitHub repo (e.g., bunx opensrc vercel/ai)
```

Source code for dependencies is then available in `opensrc/`.

## Coding guidelines

- Whenever possible, never use `as`. Instead, use `satisfies` as a last resort to make sure we keep strong type-safety.
- Only add a comment if a piece of logic is hard to grasp.
- Prefer inferring types instead of declaring it.
- Function name should always start with a verb.
- Functions used only locally should stay in the same file at the bottom of it. Only export helpers if used elsewhere then the helper file should have the same name as the function.
- No brackets on `if` blocks if it's just 1 line.
- Outside of Effect code, prefer using `env` from `@typebot.io/env` instead of `process.env` directly. This package provides type-safe, validated environment variables.
