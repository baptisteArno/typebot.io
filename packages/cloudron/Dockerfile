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
RUN npm install pm2 -g
# With write access
COPY --from=typebot-builder /app ./builder/
COPY --from=typebot-viewer /app ./viewer/
COPY ./packages/cloudron/start.sh ./packages/cloudron/env.default.sh ./scripts/inject-runtime-env.sh ./
RUN chmod 777 -R ./builder/apps/builder/public && chmod 777 -R ./viewer/apps/viewer/public
RUN chmod +x ./start.sh && chmod +x ./env.default.sh && chmod +x ./inject-runtime-env.sh

CMD [ "/app/code/start.sh" ]

EXPOSE 3000
EXPOSE 3001

