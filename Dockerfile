FROM node:18-slim AS base
WORKDIR /app
ARG SCOPE
ENV SCOPE=${SCOPE}
RUN npm --global install pnpm

FROM base AS builder
RUN apt-get -qy update && apt-get -qy --no-install-recommends install openssl git
COPY pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./
RUN pnpm fetch
ADD . ./
RUN pnpm install -r --offline
RUN pnpm turbo run build:docker --filter=${SCOPE}...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN apt-get -qy update \
    && apt-get -qy --no-install-recommends install \
    openssl \
    && apt-get autoremove -yq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
COPY ./packages/db/prisma ./prisma
COPY ./apps/${SCOPE}/.env.docker ./apps/${SCOPE}/.env.production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/${SCOPE}/public ./apps/${SCOPE}/public
COPY --from=builder --chown=node:node /app/apps/${SCOPE}/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/${SCOPE}/.next/static ./apps/${SCOPE}/.next/static

COPY env.sh ${SCOPE}-entrypoint.sh ./
RUN chmod +x ./${SCOPE}-entrypoint.sh \
    && chmod +x ./env.sh
ENTRYPOINT ./${SCOPE}-entrypoint.sh

EXPOSE 3000
ENV PORT 3000
