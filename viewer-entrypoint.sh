#!/bin/bash

ENVSH_ENV=./apps/viewer/.env.production ENVSH_OUTPUT=./apps/viewer/public/__env.js bash env.sh

./node_modules/.bin/prisma generate;

node apps/viewer/server.js;