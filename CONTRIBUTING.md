# Contributing to Typebot

You are considering contributing to Typebot. I thank you for this 🙏.

Any contributions you make are **greatly appreciated**. It can be anything from typo fixes to new features.

Let's [discuss](https://github.com/baptisteArno/typebot.io/discussions/new) about what you want to implement before creating a PR if you are unsure about the requirements or the vision of Typebot.

Typebot is a Monorepo powered by [Turborepo](https://turborepo.org/). It is composed of 2 main applications:

- the builder (`./apps/builder`), where you build your typebots
- the viewer (`./apps/builder`), where your user answer the typebot

These apps are built with awesome web technologies including [Typescript](https://www.typescriptlang.org/), [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), [Chakra UI](https://chakra-ui.com/), [Tailwind CSS](https://tailwindcss.com/).

## Get started

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your
   own GitHub account and then
   [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.

2. Create a new branch:

   ```sh
   git checkout -b MY_BRANCH_NAME
   ```

## Running the project locally

1. Install dependencies

   ```sh
   cd typebot.io
   pnpm i
   ```

2. Set up environment variables

   Copy `apps/builder/.env.local.example` to `apps/builder/.env.local`

   Copy `apps/viewer/.env.local.example` to `apps/viewer/.env.local`

   Copy `packages/prisma/.env.example` to `packages/prisma/.env`

   Check out the [Configuration guide](https://docs.typebot.io/self-hosting/configuration) if you want to enable more options

3. Make sure you have [Docker](https://docs.docker.com/compose/install/) running
4. Start the builder and viewer

   ```sh
   pnpm dev
   ```

   Builder is available at `http://localhost:3000`

   Viewer is available at `http://localhost:3001`

   Database inspector is available at `http://localhost:5555`

   By default, you can easily authenticate in the builder using the "Github Sign In" button. For other options, check out the [Configuration guide](https://docs.typebot.io/self-hosting/configuration)

5. (Optionnal) Start the landing page

   Copy `apps/landing-page/.env.local.example` to `apps/landing-page/.env.local`

   ```sh
   cd apps/landing-page
   pnpm dev
   ```

6. (Optionnal) Start the docs

   ```sh
   cd apps/docs
   pnpm start
   ```

I know the project can be a bit hard to understand at first. I'm working on improving the documentation and the codebase to make it easier to contribute. If you have any questions, feel free to [open a discussion](https://github.com/baptisteArno/typebot.io/discussions/new)
