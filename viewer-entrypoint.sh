#!/bin/bash

ENVSH_ENV=./apps/viewer/.env.production ENVSH_OUTPUT=./apps/viewer/public/__env.js bash env.sh

if [[ $DATABASE_URL == postgresql://* ]]; then
  ./node_modules/.bin/prisma generate --schema=packages/db/postgresql/schema.prisma;
else
  ./node_modules/.bin/prisma generate --schema=packages/db/mysql/schema.prisma;
fi

node apps/viewer/server.js;