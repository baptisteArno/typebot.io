# Context Libraries

This directory contains git subtrees of library documentation and examples for reference when working with this codebase.

## Subtree Repositories

The following repositories are included as git subtrees:

- **oRPC** (`.context/orpc/`)
  - Repository: https://github.com/middleapi/orpc
  - Branch: main
  - Purpose: ORPC Typesafe APIs library documentation and examples

## Updating Subtrees

To update all subtrees to their latest versions, run:

```bash
# Update oRPC
git subtree pull --prefix=.context/orpc orpc-subtree main --squash
```

Note: The git remotes should already be configured. If not, add them first:

```bash
git remote add orpc-subtree https://github.com/middleapi/orpc
```

## Usage

These libraries are referenced in the main CLAUDE.md file. Always check the `.context/` directory for library-specific documentation and example code before implementing features with these libraries.
