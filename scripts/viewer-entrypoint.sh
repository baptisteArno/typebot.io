#!/bin/bash

ENVSH_ENV=./apps/viewer/.env.production ENVSH_OUTPUT=./apps/viewer/public/__env.js bash inject-runtime-env.sh

./node_modules/.bin/prisma generate --schema=packages/prisma/postgresql/schema.prisma;

node apps/viewer/server.js;