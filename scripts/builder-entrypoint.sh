#!/bin/bash

cd apps/builder;
node  -e "const { configureRuntimeEnv } = require('next-runtime-env/build/configure'); configureRuntimeEnv();"
cd ../..;

echo 'Waiting for 15s for database to be ready...';
sleep 15;

./node_modules/.bin/prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma;

node apps/builder/server.js;