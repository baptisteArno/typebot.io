ARG BUN_VERSION=1.3.9

FROM oven/bun:${BUN_VERSION}-slim AS bun

FROM node:24-bullseye-slim AS base

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

RUN apt-get update -qq \
    && apt-get install -qq --no-install-recommends \
    build-essential \
    ca-certificates \
    git \
    g++ \
    openssl \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

FROM base AS install

COPY . .

RUN SKIP_ENV_CHECK=true \
    DATABASE_URL=postgresql:// \
    ENCRYPTION_SECRET=12345678901234567890123456789012 \
    NEXTAUTH_URL=http://localhost:3000 \
    NEXT_PUBLIC_VIEWER_URL=http://localhost:3001 \
    SENTRYCLI_SKIP_DOWNLOAD=1 \
    bun install --frozen-lockfile

RUN DATABASE_URL=postgresql:// bunx nx db:generate prisma

FROM base AS release

ENV NODE_ENV=production

COPY --from=install /usr/src/app/package.json ./package.json
COPY --from=install /usr/src/app/bun.lock ./bun.lock
COPY --from=install /usr/src/app/bunfig.toml ./bunfig.toml
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY --from=install /usr/src/app/apps/workflows ./apps/workflows
COPY --from=install /usr/src/app/packages ./packages

USER node
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "apps/workflows/src/index.ts"]
