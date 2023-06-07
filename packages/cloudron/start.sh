#!/bin/bash

set -eu
chown -R cloudron:cloudron /app/data

echo "Waiting for postgres to become ready...."

PG_READY="pg_isready -h $CLOUDRON_POSTGRESQL_HOST -p $CLOUDRON_POSTGRESQL_PORT"

until $PG_READY
do
  sleep 2;
done

echo "Database ready to accept connections."

if [[ ! -f "/app/data/env.sh" ]]; then
  echo "Creating env.sh file at /app/data/env.sh"
  cp ./env.default.sh /app/data/env.sh
else
  echo "Skipping env.sh file creation. /app/data/env.sh exists."
fi

echo "Copying inject-runtime-env.sh in data folder..."
cp ./inject-runtime-env.sh /app/data/inject-runtime-env.sh

echo "Sourcing env.sh file..."
source /app/data/env.sh

echo 'Injecting environment variables into frontend...'
ENVSH_ENV=./builder/apps/builder/.env.production ENVSH_OUTPUT=./builder/apps/builder/public/__env.js /app/data/inject-runtime-env.sh
ENVSH_ENV=./viewer/apps/viewer/.env.production ENVSH_OUTPUT=./viewer/apps/viewer/public/__env.js /app/data/inject-runtime-env.sh

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

./builder/node_modules/.bin/prisma generate --schema=builder/packages/prisma/postgresql/schema.prisma;
./viewer/node_modules/.bin/prisma generate --schema=viewer/packages/prisma/postgresql/schema.prisma;
./builder/node_modules/.bin/prisma migrate deploy --schema=builder/packages/prisma/postgresql/schema.prisma;


cd ./builder/apps/builder
pm2 start --name=typebot server.js
cd /app/viewer/apps/viewer
PORT=3001 pm2 start --name=typebot server.js
