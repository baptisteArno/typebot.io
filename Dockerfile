FROM node:18-bullseye-slim AS base
WORKDIR /app
ARG SCOPE
ENV SCOPE=${SCOPE}
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
ENV NODE_ENV production
RUN apt-get -qy update \
    && apt-get -qy --no-install-recommends install \
    openssl \
    && apt-get autoremove -yq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
COPY ./packages/prisma/postgresql ./packages/prisma/postgresql
COPY --from=builder /app/apps/${SCOPE}/public ./apps/${SCOPE}/public
COPY --from=builder --chown=node:node /app/apps/${SCOPE}/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/${SCOPE}/.next/static ./apps/${SCOPE}/.next/static
RUN pnpm install next-runtime-env prisma
RUN pnpm prisma generate --schema=packages/prisma/postgresql/schema.prisma;

COPY scripts/${SCOPE}-entrypoint.sh ./
RUN chmod +x ./${SCOPE}-entrypoint.sh
ENTRYPOINT ./${SCOPE}-entrypoint.sh

EXPOSE 3000
ENV PORT 3000
