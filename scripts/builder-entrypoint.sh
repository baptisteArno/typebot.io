#!/bin/bash

cd apps/builder;
node  -e "const { configureRuntimeEnv } = require('next-runtime-env/build/configure'); configureRuntimeEnv();"
cd ../..;

export DB_HOST=$(echo $DATABASE_URL | awk -F[@//] '{print $4}')
export DB_PORT=$(echo $DATABASE_URL | awk -F[@//:] '{print $5}')

./wait-for-it.sh $DB_HOST:$DB_PORT -t 60 --strict

if [ $? -ne 0 ]; then
    echo "Timed out waiting for database to be ready"
    exit 1
fi

./node_modules/.bin/prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma;


node apps/builder/server.js;