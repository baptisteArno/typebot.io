FROM cloudron/base:4.1.0 AS base

FROM baptistearno/typebot-builder:latest AS typebot-builder

FROM baptistearno/typebot-viewer:latest AS typebot-viewer

FROM base AS runner
RUN mkdir -p /app/code
WORKDIR /app/code
ENV NODE_ENV production
RUN apt-get -qy update \
    && apt-get -qy --no-install-recommends install \
    openssl \
    && apt-get autoremove -yq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
COPY --from=typebot-builder /app ./builder/
COPY --from=typebot-viewer /app ./viewer/
RUN builder/node_modules/.bin/prisma generate --schema=builder/packages/prisma/postgresql/schema.prisma
RUN viewer/node_modules/.bin/prisma generate --schema=viewer/packages/prisma/postgresql/schema.prisma
COPY ./packages/cloudron/start.sh ./packages/cloudron/env.default.sh  ./
COPY ./packages/cloudron/.env.docker ./scripts/inject-runtime-env.sh /run/
RUN touch /run/builder_runtime_env.js && touch /run/viewer_runtime_env.js
RUN ln -s /run/builder_runtime_env.js builder/apps/builder/public/__env.js && ln -s /run/viewer_runtime_env.js viewer/apps/viewer/public/__env.js
RUN chmod +x ./start.sh && chmod +x ./env.default.sh && chmod +x /run/inject-runtime-env.sh
ADD ./packages/cloudron/supervisor/* /etc/supervisor/conf.d/
ADD ./packages/cloudron/supervisord.conf /etc/supervisor/

CMD [ "/app/code/start.sh" ]

EXPOSE 3000
EXPOSE 3001

