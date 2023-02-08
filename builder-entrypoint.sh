#!/bin/bash

ENVSH_ENV=./apps/builder/.env.production ENVSH_OUTPUT=./apps/builder/public/__env.js bash env.sh

if [[ $DATABASE_URL == postgresql://* ]]; then
  ./node_modules/.bin/prisma generate --schema=packages/db/postgresql/schema.prisma;
else
  ./node_modules/.bin/prisma generate --schema=packages/db/mysql/schema.prisma;
fi

echo 'Waiting 5s for db to be ready...';
sleep 5;

if [[ $DATABASE_URL == postgresql://* ]]; then
  ./node_modules/.bin/prisma migrate deploy --schema=packages/db/postgresql/schema.prisma;
fi


node apps/builder/server.js;