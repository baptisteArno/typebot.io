# syntax=docker/dockerfile:1.7

ARG BUN_VERSION=1.3.9

FROM oven/bun:${BUN_VERSION}-slim AS builder

WORKDIR /app

COPY . .

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts --filter workflows

ARG DATABASE_URL=postgresql://
RUN PATH="/app/node_modules/.bin:${PATH}" DATABASE_URL=$DATABASE_URL bun packages/prisma/scripts/db-generate.ts

RUN cd apps/workflows && bun run build

FROM oven/bun:${BUN_VERSION}-slim AS release

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=bun:bun /app/apps/workflows/dist/index.js /app/index.js

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "/app/index.js"]
