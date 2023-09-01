FROM node:18-bullseye-slim AS base
WORKDIR /app
ARG SCOPE
ENV SCOPE=${SCOPE}
RUN apt-get -qy update \
    && apt-get -qy --no-install-recommends install \
    openssl \
    && apt-get autoremove -yq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
RUN npm --global install pnpm

FROM base AS pruner
RUN npm --global install turbo
WORKDIR /app
COPY . .
RUN turbo prune --scope=${SCOPE} --docker

FROM base AS builder
RUN apt-get -qy update && apt-get -qy --no-install-recommends install openssl git
WORKDIR /app
COPY .gitignore .gitignore
COPY .npmrc .pnpmfile.cjs ./
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

ENV ENCRYPTION_SECRET=encryption_secret_placeholder123 DATABASE_URL=postgresql://postgres:typebot@typebot-db:5432/typebot NEXTAUTH_URL=http://localhost:3000 NEXT_PUBLIC_VIEWER_URL=http://localhost:3001
RUN pnpm turbo run build --filter=${SCOPE}...

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
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@5.0.0_prisma@5.0.0/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.pnpm/@prisma+engines@5.0.0/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --from=builder /app/node_modules/.pnpm/prisma@5.0.0/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
RUN ./node_modules/.bin/prisma generate --schema=packages/prisma/postgresql/schema.prisma;

COPY scripts/${SCOPE}-entrypoint.sh ./
COPY scripts/wait-for-it.sh ./
RUN chmod +x ./${SCOPE}-entrypoint.sh
RUN chmod +x ./wait-for-it.sh
ENTRYPOINT ./${SCOPE}-entrypoint.sh

EXPOSE 3000
ENV PORT 3000
