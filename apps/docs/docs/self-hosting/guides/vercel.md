---
sidebar_position: 4
---

# Vercel

:::note
The easiest way to get started with Typebot is with [the official managed service in the Cloud](https://app.typebot.io). You'll have high availability, backups, security, and maintenance all managed for you by me, Baptiste, Typebot's founder.

The cloud version can save a substantial amount of developer time and resources. For most sites this ends up being the best value option and the revenue goes to funding the maintenance and further development of Typebot. So you’ll be supporting open source software and getting a great service!
:::

## Requirements

You need a PostgresDB database hosted somewhere. [Supabase](https://supabase.com/) and [Heroku](https://www.heroku.com/) offer great free options.

## Getting Started

Fork the repository

## Disable Github workflows

You may want to [disable the Github actions](https://docs.github.com/en/actions/using-workflows/disabling-and-enabling-a-workflow) as they are most likely not relevant to your use of Typebot. This can be done.

### Deploy the builder

1. Create a new Vercel project and import the forked repo
2. Change the project name to: `typebot-builder` (or anything else)
3. Choose Next.js framework
4. Change the root directory to: `apps/builder`
5. Change the build command to:

   ```sh
   cd ../.. && pnpm turbo build --filter=builder... && pnpm db:migrate
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
   cd ../.. && pnpm pnpm turbo build --filter=viewer... && pnpm db:migrate
   ```

6. Add the required environment variables ([Check out the configuration guide](/self-hosting/configuration))
7. Hit "Deploy"
