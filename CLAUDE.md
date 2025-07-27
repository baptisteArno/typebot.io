# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package Manager**: Always use `bun` as the package manager instead of npm or yarn.

**Development**:
- `bun dev` - Start development servers for builder, viewer, and PartyKit concurrently
- `bun start-docker-compose-dev` - Start full development environment with Docker

**Building**:
- `bun build` - Build all main applications (builder, viewer, landing-page, docs)
- `bun build-docker-compose-prod` - Build production Docker images

**Code Quality**:
- `bun format-and-lint` - Check code formatting and linting with Biome
- `bun format-and-lint:fix` - Auto-fix formatting and linting issues
- `bun run test` - Run unit tests using Vitest
- `bun lint-repo` - Check workspace dependencies and package structure
- `bun pre-commit` - Run full pre-commit checks (format, lint, test, link check)

**Database**:
- `turbo run db:generate` - Generate Prisma client (runs on postinstall)

**Localization**:
- `bun sync-locales` - Sync localization keys with Tolgee
- `bun pull-locales` - Pull translations from Tolgee
- `bun push-locales` - Push new keys to Tolgee

**Utilities**:
- `bun create-new-block` - Create new block using Forge CLI
- `bun check-unused-dependencies` - Analyze unused dependencies

## Architecture

### Monorepo Structure
This is a Turborepo-managed monorepo with the following main applications:

**Applications** (`/apps/`):
- **builder**: Visual chatbot builder interface (Next.js, Chakra UI, tRPC)
- **viewer**: Runtime chatbot execution engine (Next.js, optimized for embedding)
- **docs**: Documentation site (Mintlify)
- **landing-page**: Marketing website (TanStack Router)

**Shared Packages** (`/packages/`):
- **Core Engine**: `bot-engine` (chat execution), `blocks/*` (UI components), `variables`
- **Frontend**: `embeds/*` (embedding solutions), `ui` (design system), `theme`
- **Backend**: `prisma` (database models), `credentials` (encryption), `billing`
- **Integrations**: `forge/*` (plugin system), `whatsapp`, `emails`
- **Utilities**: `lib` (shared helpers), `telemetry`, `logs`

### Key Technologies
- **Runtime**: Node.js 22, Bun package manager
- **Frontend**: Next.js 15, React 18, TypeScript 5.8
- **UI**: Chakra UI, custom design system
- **Backend**: tRPC, Prisma ORM, PostgreSQL/MySQL
- **Real-time**: PartyKit for collaboration
- **Testing**: Vitest (unit), Playwright (E2E)
- **Code Quality**: Biome (formatting/linting), TypeScript strict mode

### Database Architecture
- Uses Prisma ORM with PostgreSQL/MySQL support
- Database models are centralized in `packages/prisma`
- Schema generation happens automatically on install

### Plugin System (Forge)
- Extensible block system in `packages/forge`
- Custom blocks can be created with `bun create-new-block`
- Each block type has its own package in `packages/forge/blocks/`

### Embedding System
- Multiple embed types: popup, bubble, inline container
- Optimized JavaScript library with no external dependencies
- Packages in `packages/embeds/` for different integration methods

### Internationalization
- Supports 9 languages with Tolgee integration
- Translation files managed through Tolgee CLI
- Auto-sync with development workflow

## Development Guidelines

### TypeScript Rules
- Never use `any` type - use proper TypeScript types, interfaces, or union types
- Use `satisfies` instead of `as` when possible for type safety
- Prefer long, well-documented functions with clear abstractions
- Helper functions should be placed at the bottom of files

### Testing Approach
- Use `bun run test` for unit tests (Vitest)
- Test only complex and critical functions
- Never use Vitest mocks - modify function signatures to accept dependencies as arguments
- E2E tests use Playwright

### Code Style
- Code formatting and linting handled by Biome
- Follow existing patterns in the codebase
- Use Turborepo for efficient builds across the monorepo

### Working with Blocks
- New blocks should be created using the Forge CLI
- Each block has its own package structure
- Blocks include both runtime and builder components

## Environment & Deployment

### Docker Support
- Multi-stage Docker builds optimized for Bun
- Separate configurations for development and production
- Environment variables injected at runtime

### Monorepo Management
- Turborepo handles build orchestration and caching
- Workspace dependencies managed through Bun workspaces
- Use `turbo` commands for cross-package operations

### Branch Strategy
- Main branch: `main`
- Feature branches follow `FEAT_*` pattern
- Current feature branch: `FEAT_I18N` (internationalization work)