#!/bin/bash

./entrypoint.sh

./node_modules/.bin/prisma generate;

echo 'Waiting 5s for db to be ready...';
sleep 5;

./node_modules/.bin/prisma migrate deploy;

node server.js;