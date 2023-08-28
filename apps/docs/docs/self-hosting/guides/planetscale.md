# Using a Planetscale database

Typebot is also pluggable to a Planetscale database. But it means, you'll need to push schema changes manually.

To do so, follow these instructions:

1. Replace `DATABASE_URL` with a Planetscale development branch URL.
2. From the `packages/prisma` directory, run a the db push command: `pnpm run db:push`
3. Then, in Planetscale dashboard, or using their CLI, you can create a new deploy request from this development branch to your production branch.

:::note
You can't connect to Planetscale database if you are deploying with Docker as docker images are currently built only with postgresql support.
:::
