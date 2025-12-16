#!/bin/bash

cd apps/builder;
node  -e "const { configureRuntimeEnv } = require('next-runtime-env/build/configure'); configureRuntimeEnv();"
cd ../..;

HOSTNAME=0.0.0.0 PORT=3000 node apps/builder/server.js;
