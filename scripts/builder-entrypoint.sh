#!/bin/bash

cd apps/builder;
node  -e "const { configureRuntimeEnv } = require('next-runtime-env/build/configure'); configureRuntimeEnv();"
cd ../..;

echo 'Waiting for 15s for database to be ready...';
sleep 15;

./node_modules/.bin/prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma;

echo "Starting WebSocket server..."
cd apps/builder && npx tsx dist-wss/helpers/server/prodServer.ts &
cd ../..

HOSTNAME=0.0.0.0 PORT=3000 node apps/builder/server.js;
