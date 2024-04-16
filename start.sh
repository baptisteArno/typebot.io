#!/bin/bash

cd /usr/local/src/typebot.io/apps
cd builder 
pm2 start --name=aio-builder pnpm -- start -p 3000
cd ../viewer
pm2 start --name=aio-bot pnpm -- start -p 3001
