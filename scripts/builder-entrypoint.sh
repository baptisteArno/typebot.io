#!/bin/bash

ENVSH_ENV=./apps/builder/.env.production ENVSH_OUTPUT=./apps/builder/public/__env.js bash env.sh

./node_modules/.bin/prisma generate --schema=packages/prisma/postgresql/schema.prisma;

echo 'Waiting 5s for db to be ready...';
sleep 5;

./node_modules/.bin/prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma;


node apps/builder/server.js;