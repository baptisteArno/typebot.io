#!/bin/bash

./env.sh

./node_modules/.bin/prisma generate;

node server.js;