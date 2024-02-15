FROM oven/bun

WORKDIR /app

COPY . .

RUN rm -rf /app/apps/builder
RUN rm -rf /app/apps/viewer

RUN bun install --ignore-scripts

ENV PORT=3000
EXPOSE 3000

WORKDIR /app/apps/chat-api

CMD ["bun", "src/index.ts"]