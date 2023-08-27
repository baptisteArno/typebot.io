#!/bin/bash

echo $DATABASE_URL;

cd apps/builder;
node  -e "const { configureRuntimeEnv } = require('next-runtime-env/build/configure'); configureRuntimeEnv();"
cd ../..;

echo 'Waiting 5s for db to be ready...';
sleep 5;

pnpm prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma;


node apps/builder/server.js;