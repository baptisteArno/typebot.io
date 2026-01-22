FROM oven/bun:1.3.6-slim AS bun

# ================= ADD BUN IN NODE 22 IMAGE ===================

FROM node:22-bullseye-slim AS base
ARG BUN_RUNTIME_TRANSPILER_CACHE_PATH=0
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=${BUN_RUNTIME_TRANSPILER_CACHE_PATH}
ARG BUN_INSTALL_BIN=/usr/local/bin
ENV BUN_INSTALL_BIN=${BUN_INSTALL_BIN}
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN groupadd bun \
    --gid 2000 \
    && useradd bun \
    --uid 2000 \
    --gid bun \
    --shell /bin/sh \
    --create-home \
    && ln -s /usr/local/bin/bun /usr/local/bin/bunx \
    && which bun \
    && which bunx \
    && bun --version
RUN apt-get -qy update \
    && apt-get -qy --no-install-recommends install openssl ca-certificates git python3 g++ build-essential \
    && update-ca-certificates
WORKDIR /app

# =============== PRUNE =================

FROM base AS pruned
COPY . .
RUN bunx turbo prune "workflows" --docker

# =============== INSTALL =================

FROM base AS install
COPY --from=pruned /app/out/full/ .
COPY bun.lock .
COPY bunfig.toml .
ARG DATABASE_URL=postgresql://
RUN bun install
RUN DATABASE_URL=$DATABASE_URL bunx tsx packages/prisma/scripts/db-generate.ts

# =============== RELEASE =================

FROM base AS release
COPY --from=install /app/node_modules node_modules
COPY --from=install /app/packages packages
COPY --from=install /app/apps/workflows/src ./src
COPY --from=install /app/apps/workflows/package.json .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "start" ]
