#!/bin/bash

cd apps/viewer;
node  -e "const { configureRuntimeEnv } = require('next-runtime-env/build/configure'); process.env.NEXT_PUBLIC_BUILDER_ORIGIN = new URL(process.env.NEXTAUTH_URL).origin; configureRuntimeEnv();"
cd ../..;

NODE_OPTIONS=--no-node-snapshot HOSTNAME=${HOSTNAME:-0.0.0.0} PORT=${PORT:-3000} node apps/viewer/server.js;