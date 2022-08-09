# Create base stage with common attributes
FROM node:16-alpine AS base
LABEL MAINTAINER Octadesk Tech <tech@octadesk.com>

ENV CI=true

RUN apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

FROM base AS builder

RUN apk add --no-cache git curl

# pre-install node-prune (preferring cached layer)
RUN curl -sfL https://gobinaries.com/tj/node-prune | /bin/sh -s -- -b /usr/local/bin

ARG GIT_TOKEN=
RUN echo //npm.pkg.github.com/:_authToken=$GIT_TOKEN >> ~/.npmrc

# Create app directory
RUN mkdir -p /tmp

WORKDIR /tmp

# Install app dependencies
COPY /apps/builder/. /tmp/
#RUN yarn install --frozen-lockfile
RUN yarn install

COPY . /tmp/src
# RUN yarn run build && \
#     rm -rf /tmp/node_modules
RUN yarn run build

# Can be setted only after build
#ENV NODE_ENV=production

#RUN yarn install --production=true --offline && \
#    yarn autoclean --force && \    
#    rm -rf .npmrc

# Removes a lot of unused files using node-prune
#RUN /usr/local/bin/node-prune

# Bundle app source
#FROM base as final
#ENV NODE_ENV=production

#WORKDIR /usr/src/app

#COPY --from=builder /tmp/node_modules /usr/src/app/node_modules
#COPY --from=builder /tmp/dist /usr/src/app/dist
#COPY ./src/locales /usr/src/app/dist/locales
#COPY package.json index.js /usr/src/app/

EXPOSE 80 8080 9988 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["yarn", "start"]