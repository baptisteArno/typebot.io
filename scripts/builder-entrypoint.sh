#!/bin/bash

cd apps/builder;
node  -e "const { configureRuntimeEnv } = require('next-runtime-env/build/configure'); configureRuntimeEnv();"
cd ../..;

./node_modules/.bin/prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma;

NODE_OPTIONS=--no-node-snapshot HOSTNAME=0.0.0.0 PORT=3000 node apps/builder/server.js;
