---
sidebar_position: 2
---

# Vercel

:::note
The easiest way to get started with Typebot is with [the official managed service in the Cloud](https://app.typebot.io). It takes 1 minute to try out the tool for free. You'll have high availability, backups, security, and maintenance all managed for you by me, Baptiste, Typebot's founder.

That's also the best way to support my work, open-source software, and you'll get great service!
:::

## Requirements

You need a PostgresDB database hosted somewhere. [Supabase](https://supabase.com/) and [Heroku](https://www.heroku.com/) offer great free options.

## Getting Started

Fork the repository

### Deploy the builder

1. Create a new Vercel project and import the forked repo
2. Change the project name to: `typebot-builder` (or anything else)
3. Choose Next.js framework
4. Change the root directory to: `apps/builder`
5. Change the build command to:

   ```sh
   cd ../.. &&  pnpm prisma generate && pnpm build:builder && pnpm db:migrate
   ```

6. Add the required environment variables ([Check out the configuration guide](/self-hosting/configuration))
7. Hit "Deploy"

### Deploy the viewer

1. Create a new Vercel project and import the forked repo
2. Change the project name to: `typebot-viewer` (or anything else)
3. Choose Next.js framework
4. Change the root directory to: `apps/viewer`
5. Change the build command to:

   ```sh
   cd ../.. && pnpm build:viewer && pnpm db:migrate
   ```

6. Add the required environment variables ([Check out the configuration guide](/self-hosting/configuration))
7. Hit "Deploy"
