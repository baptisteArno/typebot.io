FROM oven/bun AS base
WORKDIR /app
ARG SCOPE
ENV SCOPE=${SCOPE}
RUN apt-get -qy update \
    && apt-get -qy --no-install-recommends install \
    openssl \
    && apt-get autoremove -yq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

FROM base AS pruner
RUN bun --global install turbo
WORKDIR /app
COPY . .
RUN turbo prune --scope=${SCOPE} --docker

FROM base AS builder
RUN apt-get -qy update && apt-get -qy --no-install-recommends install openssl git
WORKDIR /app
COPY .gitignore .gitignore
COPY .npmrc ./
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lockb
RUN bun i
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN SKIP_ENV_CHECK=true bun turbo run build --filter=${SCOPE}...

FROM base AS runner
WORKDIR /app

COPY --from=builder --chown=node:node /app/apps/${SCOPE}/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/${SCOPE}/.next/static ./apps/${SCOPE}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/${SCOPE}/public ./apps/${SCOPE}/public

## Copy next-runtime-env and its dependencies for runtime public variable injection
COPY --from=builder /app/node_modules/next-runtime-env/node_modules ./node_modules/next-runtime-env/node_modules
COPY --from=builder /app/node_modules/next-runtime-env/build ./node_modules/next-runtime-env/build

## Copy prisma package and its dependencies and generate schema
COPY ./packages/prisma/postgresql ./packages/prisma/postgresql
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
RUN ./node_modules/.bin/prisma generate --schema=packages/prisma/postgresql/schema.prisma;

COPY scripts/${SCOPE}-entrypoint.sh ./
RUN chmod +x ./${SCOPE}-entrypoint.sh
ENTRYPOINT ./${SCOPE}-entrypoint.sh

EXPOSE 3000
ENV PORT 3000
