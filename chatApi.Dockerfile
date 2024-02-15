# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN apt-get -qy update && apt-get -qy --no-install-recommends install openssl git
COPY . .
RUN bun install
ENV NODE_ENV=production
RUN bun build:chat-api

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install . .

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "start:chat-api" ]