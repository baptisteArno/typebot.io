#!/bin/bash

ENVSH_ENV=./apps/builder/.env.production ENVSH_OUTPUT=./apps/builder/public/__env.js bash env.sh

echo 'Checking if required environment variables are set and valid...'

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Exiting..."
  exit 1
fi

if [ ${#ENCRYPTION_SECRET} -ne 32 ] && [ ${#ENCRYPTION_SECRET} -ne 80 ]; then
  echo "ENCRYPTION_SECRET is not 32 characters long. Exiting... (To generate a valid secret: https://docs.typebot.io/self-hosting/docker#2-add-the-required-configuration)"
  exit 1
fi

if [ -z "$NEXTAUTH_URL" ]; then
  echo "NEXTAUTH_URL is not set. Exiting..."
  exit 1
fi

if [ -z "$NEXT_PUBLIC_VIEWER_URL" ]; then
  echo "NEXT_PUBLIC_VIEWER_URL is not set. Exiting..."
  exit 1
fi

./node_modules/.bin/prisma generate --schema=packages/prisma/postgresql/schema.prisma;

echo 'Waiting 5s for db to be ready...';
sleep 5;

./node_modules/.bin/prisma migrate deploy --schema=packages/prisma/postgresql/schema.prisma;


node apps/builder/server.js;