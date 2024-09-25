# ================= INSTALL BUN ===================
ARG BUN_VERSION=1.1.29
ARG YARN_PKG_MANAGER="this.packageManager=\"yarn@1.22.22\""
ARG BUN_PKG_MANAGER="this.packageManager=\"bun@${BUN_VERSION}\""
FROM debian:bullseye-slim AS build-bun
ARG BUN_VERSION
RUN apt-get update -qq \
    && apt-get install -qq --no-install-recommends \
    ca-certificates \
    curl \
    dirmngr \
    gpg \
    gpg-agent \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && arch="$(dpkg --print-architecture)" \
    && case "${arch##*-}" in \
    amd64) build="x64-baseline";; \
    arm64) build="aarch64";; \
    *) echo "error: unsupported architecture: $arch"; exit 1 ;; \
    esac \
    && version="$BUN_VERSION" \
    && case "$version" in \
    latest | canary | bun-v*) tag="$version"; ;; \
    v*)                       tag="bun-$version"; ;; \
    *)                        tag="bun-v$version"; ;; \
    esac \
    && case "$tag" in \
    latest) release="latest/download"; ;; \
    *)      release="download/$tag"; ;; \
    esac \
    && curl "https://github.com/oven-sh/bun/releases/$release/bun-linux-$build.zip" \
    -fsSLO \
    --compressed \
    --retry 5 \
    || (echo "error: failed to download: $tag" && exit 1) \
    && for key in \
    "F3DCC08A8572C0749B3E18888EAB4D40A7B22B59" \
    ; do \
    gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys "$key" \
    || gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" ; \
    done \
    && curl "https://github.com/oven-sh/bun/releases/$release/SHASUMS256.txt.asc" \
    -fsSLO \
    --compressed \
    --retry 5 \
    && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
    || (echo "error: failed to verify: $tag" && exit 1) \
    && grep " bun-linux-$build.zip\$" SHASUMS256.txt | sha256sum -c - \
    || (echo "error: failed to verify: $tag" && exit 1) \
    && unzip "bun-linux-$build.zip" \
    && mv "bun-linux-$build/bun" /usr/local/bin/bun \
    && rm -f "bun-linux-$build.zip" SHASUMS256.txt.asc SHASUMS256.txt \
    && chmod +x /usr/local/bin/bun \
    && which bun \
    && bun --version

# ================= ADD BUN IN NODE 20 IMAGE ===================

FROM node:20-bullseye-slim AS bun
ARG BUN_RUNTIME_TRANSPILER_CACHE_PATH=0
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=${BUN_RUNTIME_TRANSPILER_CACHE_PATH}
ARG BUN_INSTALL_BIN=/usr/local/bin
ENV BUN_INSTALL_BIN=${BUN_INSTALL_BIN}
COPY --from=build-bun /usr/local/bin/bun /usr/local/bin/bun
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
RUN apt-get -qy update && apt-get -qy --no-install-recommends install openssl git python3 g++ build-essential
WORKDIR /app

# ================= TURBO PRUNE ===================

FROM bun as pruned
ARG YARN_PKG_MANAGER
ARG SCOPE
COPY . .
RUN bunx json -I -f package.json -e ${YARN_PKG_MANAGER}
RUN bunx turbo prune --scope="${SCOPE}" --docker

# =============== INSTALL & BUILD =================

FROM bun as builder
ARG BUN_PKG_MANAGER
ARG SCOPE
COPY --from=pruned /app/out/full/ .
RUN bunx json -I -f package.json -e ${BUN_PKG_MANAGER}
RUN SENTRYCLI_SKIP_DOWNLOAD=1 bun install
RUN SKIP_ENV_CHECK=true bunx turbo build --filter="${SCOPE}..."

# ================== RELEASE ======================

FROM bun AS release
ARG SCOPE
ENV SCOPE=${SCOPE}
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/prisma/postgresql ./packages/prisma/postgresql
COPY --from=builder --chown=node:node /app/apps/${SCOPE}/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/${SCOPE}/.next/static ./apps/${SCOPE}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/${SCOPE}/public ./apps/${SCOPE}/public

RUN ./node_modules/.bin/prisma generate --schema=packages/prisma/postgresql/schema.prisma;


COPY scripts/${SCOPE}-entrypoint.sh ./
RUN chmod +x ./${SCOPE}-entrypoint.sh
ENTRYPOINT ./${SCOPE}-entrypoint.sh

EXPOSE 3000
ENV PORT 3000
