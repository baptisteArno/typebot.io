---
sidebar_position: 3
---

# Manual

:::note
The easiest way to get started with Typebot is with [the official managed service in the Cloud](https://app.typebot.io). You'll have high availability, backups, security, and maintenance all managed for you by me, Baptiste, Typebot's founder.

The cloud version can save a substantial amount of developer time and resources. For most sites this ends up being the best value option and the revenue goes to funding the maintenance and further development of Typebot. So you’ll be supporting open source software and getting a great service!
:::

## Requirements

- A PostgresDB database hosted somewhere. [Supabase](https://supabase.com/) offer great free options. But you can also setup your own database on your server.
- A server with Node.js 14+, Nginx, and PM2 installed.
- Experience deploying Next.js applications with PM2. Check out [this guide](https://www.coderrocketfuel.com/article/how-to-deploy-a-next-js-website-to-a-digital-ocean-server/) for more information.

## Getting Started

1. Fork/clone the repository

```sh
git clone git@github.com:<username>/typebot.io.git
```

2. Setup environment variables by copying the example files and following the [configuration guide](/self-hosting/configuration) to fill in the missing values.

```sh
cd typebot.io
# check out the latest stable version or the one you want to use
git checkout latest
# copy the example env file
cp packages/prisma/.env.example packages/prisma/.env
cp apps/builder/.env.local.example apps/builder/.env.local
cp apps/viewer/.env.local.example apps/viewer/.env.local
```

:::note
The database user should have the `SUPERUSER` role. You can setup and migrate the database with the `pnpm prisma generate && pnpm db:migrate` command.
:::

3. Install dependencies

```sh
pnpm install
```

4. Build the builder and viewer

```sh
pnpm run build:apps
# or build them separately
pnpm run build:builder
pnpm run build:viewer
```

:::note
If you face the issue `Node ran out of memory`, then you should increase the memory limit for Node.js. For example,`NODE_OPTIONS=--max-old-space-size=4096` will increase the memory limit to 4GB. Check [this stackoverflow answer](https://stackoverflow.com/questions/53230823/fatal-error-ineffective-mark-compacts-near-heap-limit-allocation-failed-javas) for more information.
:::

## Deployments

### Deploy the builder

1. Cd into the builder directory and make sure it can be started with `pnpm start`

```sh
cd apps/builder
pnpm start
# You may have to set the port if it's already in use
pnpm next start -p 3001
```

2. Deploy the builder with PM2

```sh
pm2 start --name=typebot pnpm -- start
# or select a different port
pm2 start --name=typebot pnpm -- next start -p 3001
```

### Deploy the viewer

1. Cd into the viewer directory and make sure it can be started with `pnpm start`

```sh
cd apps/viewer
pnpm start
# You may have to set the port if it's already in use
pnpm next start -p 3002
```

2. Deploy the viewer with PM2

```sh
pm2 start --name=typebot pnpm -- start
# or select a different port
pm2 start --name=typebot pnpm -- next start -p 3002
```

## Nginx configuration

You can use the following configuration to serve the builder and viewer with Nginx. Make sure to replace the `server_name` with the respective domain name for your Typebot instance. Check out [this guide](https://www.coderrocketfuel.com/article/how-to-deploy-a-next-js-website-to-a-digital-ocean-server/) for a step-by-step guide on how to setup Nginx and PM2.

```nginx
server {
     listen 80;
     server_name typebot.example.com www.typebot.example.com;
     return 301 https://typebot.example.com$request_uri;
}

server {
    listen 443 ssl;
    server_name typebot.example.com www.typebot.example.com;

    # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem; # ma>
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem; # >
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    location ^~ / {
         proxy_pass http://localhost:3001;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
    }
}
```
