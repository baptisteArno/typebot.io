#!/bin/bash

cd /usr/local/src/typebot.io/apps
cd builder 
pm2 start --name=aio-builder pnpm -- start -p 3100
cd ../viewer
pm2 start --name=aio-bot pnpm -- start -p 3101
pm2 start --name=aio-bot2 pnpm -- start -p 3102
pm2 start --name=aio-bot3 pnpm -- start -p 3103
