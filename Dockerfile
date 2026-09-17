FROM node:20-bullseye-slim AS base
WORKDIR /app
ARG SCOPE
ENV SCOPE=${SCOPE}
# bullseye-security's mirror pool intermittently 404s on packages whose index
# still advertises them (edge-routing dependent, not a real network outage —
# during a broader outage a whole swath of security-suite packages can be
# affected at once, sometimes leaving a partial, version-inconsistent state
# behind after failed retries: some dependencies get upgraded before a later
# package in the same transaction 404s and aborts it).
#
# Retry a few times first (cheap fix for the common transient case). If still
# broken, drop the security suite from apt's sources entirely and reconcile
# EVERY already-installed package plus the target(s) to the plain bullseye
# suite in one transaction — `-t bullseye` on just the named packages is not
# enough, since apt only reconsiders packages actually listed in the install
# command, not their already-installed dependencies, and `--allow-downgrades`
# alone won't touch a package apt wasn't explicitly asked to change.
RUN success=; \
    for i in 1 2 3 4 5; do \
    apt-get -qy update \
    && apt-get -qy --no-install-recommends install \
    openssl \
    && { success=1; break; }; \
    echo "apt-get install openssl failed (attempt $i/5), retrying in 10s..."; \
    sleep 10; \
    done; \
    if [ "$success" != 1 ]; then \
    echo "bullseye-security unavailable after retries — falling back to the plain bullseye suite for the whole system"; \
    grep -v 'bullseye-security' /etc/apt/sources.list > /tmp/sources.list.nosecurity \
    && mv /tmp/sources.list.nosecurity /etc/apt/sources.list \
    && apt-get -qy update \
    && INSTALLED=$(dpkg-query -W -f='${Package}/bullseye\n' 2>/dev/null | tr '\n' ' ') \
    && apt-get -qy --no-install-recommends --allow-downgrades install $INSTALLED openssl; \
    fi \
    && apt-get autoremove -yq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
RUN npm --global install pnpm@9.5.0

FROM base AS pruner
RUN npm --global install turbo@2.0.5
WORKDIR /app
COPY . .
RUN turbo prune ${SCOPE} --docker

FROM base AS builder
# Same intermittent bullseye-security 404 as the base stage — see comment
# there for why the fallback reconciles every installed package, not just
# these named ones.
RUN success=; \
    for i in 1 2 3 4 5; do \
    apt-get -qy update \
    && apt-get -qy --no-install-recommends install openssl git python3 g++ build-essential \
    && { success=1; break; }; \
    echo "apt-get install failed (attempt $i/5), retrying in 10s..."; \
    sleep 10; \
    done; \
    if [ "$success" != 1 ]; then \
    echo "bullseye-security unavailable after retries — falling back to the plain bullseye suite for the whole system"; \
    grep -v 'bullseye-security' /etc/apt/sources.list > /tmp/sources.list.nosecurity \
    && mv /tmp/sources.list.nosecurity /etc/apt/sources.list \
    && apt-get -qy update \
    && INSTALLED=$(dpkg-query -W -f='${Package}/bullseye\n' 2>/dev/null | tr '\n' ' ') \
    && apt-get -qy --no-install-recommends --allow-downgrades install $INSTALLED openssl git python3 g++ build-essential; \
    fi
WORKDIR /app
COPY .gitignore .gitignore
COPY .npmrc .pnpmfile.cjs ./
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN SKIP_ENV_CHECK=true pnpm turbo run build --filter=${SCOPE}...

FROM base AS runner
WORKDIR /app

COPY --from=builder --chown=node:node /app/apps/${SCOPE}/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/${SCOPE}/.next/static ./apps/${SCOPE}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/${SCOPE}/public ./apps/${SCOPE}/public

## Copy next-runtime-env and its dependencies for runtime public variable injection
COPY --from=builder /app/node_modules/.pnpm/chalk@4.1.2/node_modules/chalk ./node_modules/chalk
COPY --from=builder /app/node_modules/.pnpm/chalk@4.1.2/node_modules/ansi-styles ./node_modules/ansi-styles
COPY --from=builder /app/node_modules/.pnpm/chalk@4.1.2/node_modules/supports-color ./node_modules/supports-color
COPY --from=builder /app/node_modules/.pnpm/has-flag@4.0.0/node_modules/has-flag ./node_modules/has-flag
COPY --from=builder /app/node_modules/.pnpm/next-runtime-env@1.6.2/node_modules/next-runtime-env/build ./node_modules/next-runtime-env/build

## Copy prisma package and its dependencies and generate schema
COPY ./packages/prisma/postgresql ./packages/prisma/postgresql
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@5.12.1_prisma@5.12.1/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.pnpm/@prisma+engines@5.12.1/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --from=builder /app/node_modules/.pnpm/@prisma+debug@5.12.1/node_modules/@prisma/debug ./node_modules/@prisma/debug
COPY --from=builder /app/node_modules/.pnpm/@prisma+get-platform@5.12.1/node_modules/@prisma/get-platform ./node_modules/@prisma/get-platform
COPY --from=builder /app/node_modules/.pnpm/@prisma+fetch-engine@5.12.1/node_modules/@prisma/fetch-engine ./node_modules/@prisma/fetch-engine
COPY --from=builder /app/node_modules/.pnpm/@prisma+engines-version@5.12.0-21.473ed3124229e22d881cb7addf559799debae1ab/node_modules/@prisma/engines-version ./node_modules/@prisma/engines-version
COPY --from=builder /app/node_modules/.pnpm/prisma@5.12.1/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
RUN ./node_modules/.bin/prisma generate --schema=packages/prisma/postgresql/schema.prisma;

COPY scripts/${SCOPE}-entrypoint.sh ./
RUN chmod +x ./${SCOPE}-entrypoint.sh
ENTRYPOINT ./${SCOPE}-entrypoint.sh

EXPOSE 3000
ENV PORT 3000
