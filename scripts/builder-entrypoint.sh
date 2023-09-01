#!/bin/bash

cd apps/builder;
node  -e "const { configureRuntimeEnv } = require('next-runtime-env/build/configure'); configureRuntimeEnv();"
cd ../..;

./wait-for-it.sh $DATABASE_URL -- ./node_modules/.bin/prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma;


node apps/builder/server.js;